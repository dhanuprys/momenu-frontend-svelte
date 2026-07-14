<script lang="ts">
	import { onMount } from 'svelte';
	import type { Component } from 'svelte';
	import { InvitationService, AnalyticsService, ProjectService } from '$lib/services/index.js';
	import type { InvitationData, PayloadMap, Project } from '$lib/types/index.js';
	import ThemeRenderer from '$lib/components/theme/theme-renderer.svelte';
	import ThemeCustomizerDrawer from '$lib/components/theme/theme-customizer-drawer.svelte';
	import { resolveTheme } from '$lib/themes/theme-registry.js';
	import {
		Loader2,
		ShieldAlert,
		SearchX,
		AlertCircle,
		MailOpen,
		Volume2,
		VolumeX,
		Eye
	} from '@lucide/svelte';

	let {
		slug = '',
		isPreview = false,
		projectId = ''
	} = $props<{ slug?: string; isPreview?: boolean; projectId?: string }>();

	let isOpened = $state(false);
	let isPlaying = $state(false);
	let isCustomizerOpen = $state(false);
	let customizerFocusTab = $state<'text' | 'style'>('text');
	let customizerFocusSlot = $state('');
	let audioElement: HTMLAudioElement | null = null;

	import { config } from '$lib/config/index.js';

	// ─── Audio Helpers (safe, centralized) ───────────────────────────

	function createAudio(filePath: string): HTMLAudioElement {
		const audio = new Audio(`${config.API_ROOT_URL}${filePath}`);
		audio.loop = true;
		audio.preload = 'auto'; // Preload the audio metadata and data
		return audio;
	}

	function destroyAudio() {
		if (audioElement) {
			audioElement.pause();
			audioElement.src = '';
			audioElement.load(); // release network resources
			audioElement = null;
			isPlaying = false;
		}
	}

	async function playAudio() {
		if (!audioElement || isPlaying) return;
		try {
			await audioElement.play();
			isPlaying = true;
		} catch (err) {
			console.warn('Audio play failed (likely autoplay policy):', err);
			isPlaying = false;
		}
	}

	function pauseAudio() {
		if (!audioElement || !isPlaying) return;
		audioElement.pause();
		isPlaying = false;
	}

	function toggleAudio() {
		if (isPlaying) {
			pauseAudio();
		} else {
			playAudio();
		}
	}

	// ─── Cover Gate ──────────────────────────────────────────────────

	function handleOpen() {
		isOpened = true;

		if (invitationData?.featureToggle.show_music) {
			const musicUrl =
				invitationData.project.music?.file_path ||
				'https://undangandigitalbali.com/assets/song/gus-teja-romance.mp3';
			if (!audioElement) {
				audioElement = createAudio(musicUrl);
			}
			playAudio();
		}
	}

	// ─── State ───────────────────────────────────────────────────────

	let loading = $state(true);
	let error = $state<string | null>(null);
	let errorCode = $state<number>(500);
	let ThemeComponent = $state<Component | null>(null);
	let invitationData = $state<InvitationData | null>(null);

	let pollInterval: ReturnType<typeof setInterval> | null = null;
	let countdownInterval: ReturnType<typeof setInterval> | null = null;

	// ─── Countdown Logic ─────────────────────────────────────────────

	function computeCountdown(targetDate: Date) {
		const now = new Date().getTime();
		const target = targetDate.getTime();
		const diff = target - now;

		if (diff <= 0) {
			return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
		}

		return {
			days: Math.floor(diff / (1000 * 60 * 60 * 24)),
			hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
			minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
			seconds: Math.floor((diff % (1000 * 60)) / 1000),
			isExpired: false
		};
	}

	// ─── Data Loader ─────────────────────────────────────────────────

	async function loadData(isInitial = true) {
		try {
			if (isInitial) {
				loading = true;
				error = null;
			}

			// 1. Extract guestName from URL
			const searchParams = new URLSearchParams(window.location.search);
			const guestName = searchParams.get('kepada') || undefined;
			const source = searchParams.get('ref') || undefined;

			// 2. Fetch project and guestbook
			let project: Project;
			let initialGuestbook: { data: import('$lib/types').Guestbook[] } | undefined = undefined;

			if (isPreview && projectId) {
				project = await ProjectService.get(projectId);
			} else {
				const [projRes, guestbookRes] = await Promise.all([
					InvitationService.getPublicInvitation(slug, guestName),
					InvitationService.getPublicGuestbook(slug).catch(() => undefined)
				]);
				project = projRes;
				initialGuestbook = guestbookRes;

				if (isInitial) {
					AnalyticsService.recordVisit(project.id, guestName, source).catch((e) =>
						console.warn('Analytics failed', e)
					);
				}
			}

			// 3. Prepare InvitationData
			const eventType = project.event_type;
			const payload = project.payload as PayloadMap[typeof eventType];

			let guestRecord = undefined;
			if (guestName) {
				try {
					guestRecord = await InvitationService.getGuest(slug, guestName);
				} catch {
					// Guest might not exist yet, that's fine
				}
			}

			// 3.5 Calculate countdown state
			let firstScheduleDate: Date | null = null;
			let countdown = null;

			if (project.schedules && project.schedules.length > 0) {
				const validSchedules = project.schedules.filter((s) => s.start_time);
				if (validSchedules.length > 0) {
					const sorted = validSchedules.sort(
						(a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
					);
					firstScheduleDate = new Date(sorted[0].start_time);
					countdown = computeCountdown(firstScheduleDate);
				}
			}

			// 3.6 Map Overrides to Record for O(1) lookup
			const textOverrides: Record<string, import('$lib/types').TextOverride> = {};
			if (project.text_overrides) {
				project.text_overrides.forEach((o) => {
					textOverrides[o.slot_key] = o;
				});
			}

			const styleOverrides: Record<string, import('$lib/types').StyleOverride> = {};
			if (project.style_overrides) {
				project.style_overrides.forEach((o) => {
					styleOverrides[o.slot_key] = o;
				});
			}

			invitationData = {
				project: project,
				slug: slug,
				guestName: guestName,
				guestRecord: guestRecord,
				themeId: project.theme_id,
				isPreview: isPreview,
				eventType: eventType,
				payload: payload,
				schedules: project.schedules || [],
				giftRegistries: project.gift_registries || [],
				mediaMappings: project.media_mappings || [],
				dressCodes: project.dress_codes || [],
				liveStreams: project.live_streams || [],
				featureToggle: project.feature_toggle,
				textOverrides,
				styleOverrides,
				firstScheduleDate: firstScheduleDate,
				countdown: countdown,
				initialGuestbook,
				coverState: {
					isOpened: () => isOpened,
					open: handleOpen
				},
				musicController: {
					isPlaying: () => isPlaying,
					play: playAudio,
					pause: pauseAudio,
					toggle: toggleAudio
				},
				customizerController: {
					open: (slotKey: string, tab: 'text' | 'style') => {
						customizerFocusTab = tab;
						customizerFocusSlot = slotKey;
						isCustomizerOpen = true;
					}
				},
				invitationApi: {
					getGuest: (name) =>
						isPreview
							? Promise.reject(new Error('Preview mode'))
							: InvitationService.getPublicGuest(slug, name),
					submitRSVP: (data) => {
						if (isPreview) {
							alert('Aksi ini dinonaktifkan dalam mode pratinjau');
							return Promise.reject(new Error('Preview mode'));
						}
						return InvitationService.submitPublicRSVP(slug, data);
					},
					getGuestbook: () =>
						isPreview
							? Promise.resolve({
									data: []
								})
							: InvitationService.getPublicGuestbook(slug),
					submitGuestbook: (data) => {
						if (isPreview) {
							alert('Aksi ini dinonaktifkan dalam mode pratinjau');
							return Promise.reject(new Error('Preview mode'));
						}
						return InvitationService.submitPublicGuestbook(slug, data);
					}
				}
			};

			// Setup countdown timer
			if (countdownInterval) clearInterval(countdownInterval);
			if (firstScheduleDate) {
				countdownInterval = setInterval(() => {
					if (invitationData && firstScheduleDate) {
						invitationData.countdown = computeCountdown(firstScheduleDate);
					}
				}, 1000);
			}

			// Preload music if enabled
			if (project.feature_toggle.show_music && !audioElement) {
				const musicUrl =
					project.music?.file_path ||
					'https://undangandigitalbali.com/assets/song/gus-teja-romance.mp3';
				audioElement = createAudio(musicUrl);
			}

			// 4. Resolve the theme component dynamically
			if (isInitial || ThemeComponent === null) {
				const themeLoader = resolveTheme(project.theme_id);
				if (!themeLoader) {
					error = `Tema tidak ditemukan: ${project.theme_id}`;
					return;
				}

				const loaded = await themeLoader;
				ThemeComponent = loaded.default;
			}
		} catch (err: any) {
			console.error('Failed to load invitation', err);
			if (err?.response?.status === 404) {
				errorCode = 404;
				error = 'Undangan yang Anda cari tidak ditemukan atau telah dihapus.';
			} else if (err?.response?.status === 403) {
				errorCode = 403;
				error = err?.response?.data?.message || 'Undangan belum aktif atau sedang tidak tersedia.';
			} else {
				errorCode = 500;
				error = 'Terjadi kesalahan saat memuat undangan.';
			}
		} finally {
			if (isInitial) {
				loading = false;
			}
		}
	}

	// ─── Lifecycle ───────────────────────────────────────────────────

	onMount(() => {
		loadData(true);

		if (isPreview && projectId) {
			pollInterval = setInterval(async () => {
				try {
					const versionData = await ProjectService.getVersion(projectId);
					if (invitationData && versionData.update_count > invitationData.project.update_count) {
						console.log('Update detected, reloading preview...');
						await loadData(false);
					}
				} catch (e) {
					console.error('Polling error', e);
				}
			}, 3000);
		}

		return () => {
			if (pollInterval) clearInterval(pollInterval);
			if (countdownInterval) clearInterval(countdownInterval);
			destroyAudio();
		};
	});
</script>

{#if loading}
	<div class="min-h-screen flex flex-col items-center justify-center bg-background">
		<Loader2 class="h-10 w-10 animate-spin text-primary" />
		<p class="mt-4 text-sm text-muted-foreground">Memuat undangan...</p>
	</div>
{:else if error}
	<div
		class="min-h-screen flex flex-col items-center justify-center bg-stone-50 px-4 py-12 text-center font-sans selection:bg-stone-900 selection:text-white"
	>
		<div
			class="max-w-md w-full bg-white px-8 py-12 md:px-12 md:py-16 rounded-[2rem] shadow-sm border border-stone-100 flex flex-col items-center"
		>
			<div
				class="h-24 w-24 bg-stone-50 text-stone-400 rounded-full flex items-center justify-center mb-8 border border-stone-100 shadow-inner"
			>
				{#if errorCode === 404}
					<SearchX class="h-10 w-10" />
				{:else if errorCode === 403}
					<ShieldAlert class="h-10 w-10 text-rose-400" />
				{:else}
					<AlertCircle class="h-10 w-10" />
				{/if}
			</div>

			<h1 class="text-2xl md:text-3xl font-serif italic text-stone-800 mb-4">
				{#if errorCode === 404}
					Tidak Ditemukan
				{:else if errorCode === 403}
					Akses Ditolak
				{:else}
					Oops!
				{/if}
			</h1>

			<p class="text-stone-500 leading-relaxed mb-10 text-sm md:text-base">{error}</p>

			<div
				class="w-full h-px bg-linear-to-r from-transparent via-stone-200 to-transparent mb-8"
			></div>

			<div class="flex flex-col items-center gap-2">
				<span class="text-[10px] text-stone-400 uppercase tracking-[0.2em] font-medium"
					>Powered by</span
				>
				<span class="text-lg font-bold tracking-tighter text-stone-900">MOMENU</span>
			</div>
		</div>
	</div>
{:else if ThemeComponent && invitationData}
	<div class="relative min-h-screen w-full overflow-hidden">
		<!-- Main Theme Component -->
		<div class="min-h-screen w-full">
			{#key invitationData.project.update_count}
				<ThemeRenderer {ThemeComponent} {invitationData} />
			{/key}
		</div>

		{#if isPreview}
			<div
				class="fixed top-0 left-0 right-0 z-100 bg-amber-500 text-amber-950 text-center text-xs font-semibold py-1.5 shadow-md flex items-center justify-center gap-2"
			>
				<Eye class="w-4 h-4" /> Mode Pratinjau
			</div>
		{/if}

		<!-- Floating Music Control -->
		{#if isOpened && invitationData?.featureToggle.show_music && invitationData?.project.music}
			<button
				class="fixed bottom-6 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-stone-200 text-stone-700 hover:bg-white hover:text-stone-900 hover:scale-110 transition-all focus:outline-none"
				onclick={toggleAudio}
				aria-label={isPlaying ? 'Pause music' : 'Play music'}
			>
				{#if isPlaying}
					<Volume2 class="h-5 w-5 animate-pulse" />
				{:else}
					<VolumeX class="h-5 w-5" />
				{/if}
			</button>
		{/if}
		<!-- Floating Customizer Button -->
		{#if isPreview && invitationData}
			<button
				class="fixed bottom-24 right-6 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 hover:scale-110 transition-all focus:outline-none"
				onclick={() => {
					customizerFocusTab = 'text';
					customizerFocusSlot = '';
					isCustomizerOpen = true;
				}}
				aria-label="Kustomisasi Tema"
			>
				<span class="text-xl">✏️</span>
			</button>

			<ThemeCustomizerDrawer
				project={invitationData.project}
				bind:open={isCustomizerOpen}
				bind:activeTab={customizerFocusTab}
				focusSlotKey={customizerFocusSlot}
				onSaved={() => loadData(false)}
			/>
		{/if}
	</div>
{/if}
