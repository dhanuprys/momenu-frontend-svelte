<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import {
		ThemeService,
		EventTypeService,
		ProjectService,
		MusicService
	} from '$lib/services/index.js';
	import type {
		Theme,
		FieldGroup,
		FieldDefinition,
		EventType,
		Music,
		MusicCategory
	} from '$lib/types/index.js';
	import { ApiError } from '$lib/utils/api-error.js';
	import { getMediaUrl, eventTypeLabel } from '$lib/utils.js';
	import { onMount, onDestroy } from 'svelte';
	import {
		ArrowLeft,
		ArrowRight,
		Check,
		Heart,
		Cake,
		LoaderCircle,
		AlertCircle,
		X,
		ImageIcon,
		Briefcase,
		Baby,
		Scissors,
		Presentation,
		Plus,
		Trash2,
		Upload,
		Play,
		Pause,
		Search,
		Music as MusicIcon
	} from '@lucide/svelte';
	import { UploadService } from '$lib/services/index.js';
	import Skeleton from '$lib/components/ui/skeleton/skeleton.svelte';

	// ── Wizard state ──
	let currentStep = $state(1);
	const totalSteps = 4;

	// ── Step 1: Category ──
	let selectedEventType = $state<EventType | null>(null);

	// ── Step 2: Theme ──
	let themes = $state<Theme[]>([]);
	let loadingThemes = $state(false);
	let themesError = $state('');
	let selectedTheme = $state<Theme | null>(null);

	// ── Step 3: Music ──
	let musics = $state<Music[]>([]);
	let loadedMusicFor = $state<EventType | null>(null);
	let loadingMusics = $state(false);
	let musicsError = $state('');
	let selectedMusicId = $state<number | null>(null);
	let searchQuery = $state('');
	let filteredMusics = $derived(
		musics.filter(
			(m) =>
				m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
				m.artist.toLowerCase().includes(searchQuery.toLowerCase())
		)
	);

	let currentAudio = $state<HTMLAudioElement | null>(null);
	let playingMusicId = $state<number | null>(null);
	let currentAudioTime = $state(0);
	let currentAudioDuration = $state(0);

	// ── Step 4: Details ──
	let schema = $state<FieldGroup[]>([]);
	let loadedSchemaFor = $state<EventType | null>(null);
	let loadingSchema = $state(false);
	let schemaError = $state('');
	let projectTitle = $state('');
	let formData = $state<Record<string, any>>({});
	let fieldErrors = $state<Record<string, string>>({});
	let globalError = $state('');

	let saving = $state(false);

	// ── Derived: can user proceed? ──
	let canProceedStep1 = $derived(!!selectedEventType);
	let canProceedStep2 = $derived(!!selectedTheme);
	let canProceedStep3 = $derived(true); // Music is optional

	// ── Step navigation ──
	function goBack() {
		if (currentStep > 1) {
			globalError = '';
			currentStep--;
		} else {
			goto('/app');
		}
	}

	async function goToStep2() {
		if (!selectedEventType) return;
		currentStep = 2;

		// Only re-fetch if themes haven't been loaded yet for this event type
		if (themes.length > 0 && themes[0]?.event_type === selectedEventType) return;

		loadingThemes = true;
		themesError = '';
		selectedTheme = null;
		try {
			const allThemes = await ThemeService.list();
			themes = allThemes.filter((t) => t.event_type === selectedEventType);
		} catch (e) {
			themesError =
				e instanceof ApiError ? e.message : 'Gagal memuat daftar tema. Silakan coba lagi.';
		} finally {
			loadingThemes = false;
		}
	}

	async function goToStep3() {
		if (!selectedTheme || !selectedEventType) return;
		currentStep = 3;

		if (musics.length > 0 && loadedMusicFor === selectedEventType) return;

		loadingMusics = true;
		musicsError = '';
		selectedMusicId = null;
		stopAudio();

		try {
			const cats = await MusicService.listCategories();
			const matchingCat = cats.find((c) => c.slug === selectedEventType);
			if (matchingCat) {
				musics = await MusicService.listMusics(matchingCat.id);
			} else if (cats.length > 0) {
				musics = await MusicService.listMusics(cats[0].id);
			}
			loadedMusicFor = selectedEventType;
		} catch (e) {
			musicsError = 'Gagal memuat daftar musik. Silakan coba lagi.';
		} finally {
			loadingMusics = false;
		}
	}

	async function goToStep4() {
		if (!selectedEventType) return;
		currentStep = 4;

		// Optional: Stop audio when entering final step
		stopAudio();

		// Only re-fetch if schema hasn't been loaded yet for this event type
		if (schema.length > 0 && loadedSchemaFor === selectedEventType) return;

		// Event type changed — reset form state
		schema = [];
		formData = {};
		fieldErrors = {};

		loadingSchema = true;
		schemaError = '';
		try {
			schema = await EventTypeService.getSchema(selectedEventType);
			loadedSchemaFor = selectedEventType;
			// Initialize form data with empty values based on schema
			schema.forEach((group) => {
				group.fields.forEach((field) => {
					if (!(field.key in formData)) {
						if (field.type === 'group') {
							// Initialize with one empty item
							const emptyItem: Record<string, any> = {};
							(field.fields ?? []).forEach((sf) => {
								emptyItem[sf.key] = '';
							});
							formData[field.key] = [emptyItem];
						} else {
							formData[field.key] = '';
						}
					}
				});
			});
		} catch (e) {
			schemaError =
				e instanceof ApiError ? e.message : 'Gagal memuat formulir acara. Silakan coba lagi.';
		} finally {
			loadingSchema = false;
		}
	}

	// ── Client-side validation ──
	function validateField(field: FieldDefinition, value: any): string {
		// Group fields are validated separately
		if (field.type === 'group') {
			const items = value as any[] | undefined;
			if (field.required && (!items || items.length === 0)) {
				return `${field.label} wajib diisi`;
			}
			if (items && field.min_items && items.length < field.min_items) {
				return `${field.label} minimal ${field.min_items} entri`;
			}
			if (items && field.max_items && items.length > field.max_items) {
				return `${field.label} maksimal ${field.max_items} entri`;
			}
			return '';
		}

		// Image fields: just check required
		if (field.type === 'image') {
			if (field.required && (!value || String(value).trim() === '')) {
				return `${field.label} wajib diisi`;
			}
			return '';
		}

		const strVal = String(value ?? '').trim();

		if (field.required && strVal === '') {
			return `${field.label} wajib diisi`;
		}

		if (strVal === '') return ''; // optional + empty = ok

		if (field.type === 'number') {
			const num = Number(strVal);
			if (isNaN(num)) return `${field.label} harus berupa angka`;
		}

		if (field.type === 'url' && strVal !== '') {
			try {
				new URL(strVal);
			} catch {
				return `${field.label} harus berupa URL yang valid (mis. https://...)`;
			}
		}

		// Apply min/max rules from schema
		for (const rule of field.validations ?? []) {
			const [ruleName, ruleParam] = rule.split(':');
			const paramNum = parseInt(ruleParam, 10);
			if (isNaN(paramNum)) continue;

			if (field.type === 'number') {
				const num = Number(strVal);
				if (ruleName === 'min' && num < paramNum) return `${field.label} minimal ${paramNum}`;
				if (ruleName === 'max' && num > paramNum) return `${field.label} maksimal ${paramNum}`;
			} else {
				if (ruleName === 'min' && strVal.length < paramNum)
					return `${field.label} minimal ${paramNum} karakter`;
				if (ruleName === 'max' && strVal.length > paramNum)
					return `${field.label} maksimal ${paramNum} karakter`;
			}
		}

		return '';
	}

	function validateAllFields(): boolean {
		for (const key of Object.keys(fieldErrors)) delete fieldErrors[key];
		let hasError = false;

		if (!projectTitle.trim()) {
			fieldErrors['__title'] = 'Nama Acara wajib diisi';
			hasError = true;
		} else if (projectTitle.trim().length < 3) {
			fieldErrors['__title'] = 'Nama Acara minimal 3 karakter';
			hasError = true;
		}

		for (const group of schema) {
			for (const field of group.fields) {
				const err = validateField(field, formData[field.key]);
				if (err) {
					fieldErrors[field.key] = err;
					hasError = true;
				}
			}
		}

		return !hasError;
	}

	// ── Submit ──
	async function submitProject() {
		if (!selectedTheme) return;

		// Client-side validation first
		if (!validateAllFields()) {
			globalError = 'Harap periksa kembali isian formulir Anda.';
			// Scroll to first error
			const firstErrKey = Object.keys(fieldErrors)[0];
			if (firstErrKey) {
				const el = document.getElementById(
					firstErrKey === '__title' ? 'projectTitle' : firstErrKey
				);
				el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
			return;
		}

		globalError = '';
		saving = true;

		try {
			// Coerce number fields from string → number for JSON
			const payload: Record<string, any> = {};
			for (const group of schema) {
				for (const field of group.fields) {
					const val = formData[field.key];
					if (field.type === 'group') {
						// Group: pass array as-is, coerce sub-field numbers
						const items = ((val as any[]) || []).map((item: Record<string, any>) => {
							const coerced: Record<string, any> = {};
							for (const sf of field.fields ?? []) {
								const sv = item[sf.key];
								if (sf.type === 'number' && sv !== '' && sv != null) {
									coerced[sf.key] = Number(sv);
								} else {
									coerced[sf.key] = sv;
								}
							}
							return coerced;
						});
						payload[field.key] = items;
					} else if (field.type === 'number' && val !== '' && val != null) {
						payload[field.key] = Number(val);
					} else {
						payload[field.key] = val;
					}
				}
			}

			const newProject = await ProjectService.create({
				title: projectTitle.trim(),
				theme_id: selectedTheme.id,
				music_id: selectedMusicId || undefined,
				payload
			});
			goto(`/app/project/${newProject.id}`);
		} catch (e) {
			if (e instanceof ApiError) {
				// Map backend validation errors to individual fields
				if (e.hasFieldErrors()) {
					for (const key of Object.keys(fieldErrors)) delete fieldErrors[key];
					for (const ve of e.validationErrors) {
						fieldErrors[ve.field] = ve.message;
					}
					globalError = 'Harap periksa kembali isian formulir Anda.';
				} else {
					globalError = e.message;
				}
			} else {
				globalError = 'Terjadi kesalahan. Silakan coba lagi.';
			}
			saving = false;
		}
	}

	// ── Audio Player Helpers ──
	onDestroy(() => {
		stopAudio();
	});

	function playAudio(music: Music) {
		const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1';
		const baseUrl = backendUrl.replace('/api/v1', '');

		if (playingMusicId === music.id) {
			stopAudio();
			return;
		}

		stopAudio();

		currentAudio = new Audio(`${baseUrl}${music.file_path}`);

		currentAudio.ontimeupdate = () => {
			if (currentAudio) currentAudioTime = currentAudio.currentTime;
		};
		currentAudio.onloadedmetadata = () => {
			if (currentAudio) currentAudioDuration = currentAudio.duration || music.duration_seconds;
		};

		currentAudio.play().catch((e) => console.error(e));
		currentAudio.onended = () => stopAudio();
		playingMusicId = music.id;
		currentAudioTime = 0;
		currentAudioDuration = music.duration_seconds;
	}

	function stopAudio() {
		if (currentAudio) {
			currentAudio.pause();
			currentAudio.ontimeupdate = null;
			currentAudio.onloadedmetadata = null;
			currentAudio = null;
		}
		playingMusicId = null;
		currentAudioTime = 0;
	}

	function togglePlay() {
		if (!currentAudio) return;
		if (currentAudio.paused) {
			currentAudio.play().catch((e) => console.error(e));
		} else {
			currentAudio.pause();
		}
		currentAudio = currentAudio;
	}

	// ── Group field helpers ──
	function addGroupItem(field: FieldDefinition) {
		const items = (formData[field.key] as any[]) || [];
		if (field.max_items && items.length >= field.max_items) return;
		const emptyItem: Record<string, any> = {};
		(field.fields ?? []).forEach((sf) => {
			emptyItem[sf.key] = '';
		});
		formData[field.key] = [...items, emptyItem];
	}

	function removeGroupItem(field: FieldDefinition, index: number) {
		const items = (formData[field.key] as any[]) || [];
		if (field.min_items && items.length <= field.min_items) return;
		formData[field.key] = items.filter((_, i) => i !== index);
	}

	// ── Image upload helper ──
	let imageUploading = $state<Record<string, boolean>>({});

	// ── Helpers ──
	function clearFieldError(key: string) {
		if (fieldErrors[key]) {
			const next = { ...fieldErrors };
			delete next[key];
			fieldErrors = next;
		}
	}
	// ── Event type categories config ──
	const categories = [
		{
			type: 'pernikahan' as EventType,
			label: 'Pernikahan',
			icon: Heart,
			iconClass: 'fill-current',
			color: 'rose',
			description: 'Undangan elegan untuk hari paling bahagia Anda.'
		},
		{
			type: 'ulang_tahun' as EventType,
			label: 'Ulang Tahun',
			icon: Cake,
			iconClass: '',
			color: 'blue',
			description: 'Undangan seru untuk merayakan hari kelahiran.'
		},
		{
			type: 'metatah' as EventType,
			label: 'Metatah',
			icon: Scissors,
			iconClass: '',
			color: 'amber',
			description: 'Undangan sakral untuk upacara potong gigi.'
		},
		{
			type: 'tigang_sasih' as EventType,
			label: 'Tigang Sasih',
			icon: Baby,
			iconClass: '',
			color: 'purple',
			description: 'Undangan hangat untuk upacara tiga bulanan.'
		},
		{
			type: 'seminar' as EventType,
			label: 'Seminar',
			icon: Presentation,
			iconClass: '',
			color: 'emerald',
			description: 'Tampilan profesional untuk seminar Anda.'
		}
	];
</script>

<svelte:head>
	<title>Momenu | Buat Acara Baru</title>
</svelte:head>

<div class="container mx-auto max-w-4xl px-4 py-8 md:px-8">
	<!-- Back button -->
	<button
		class="mb-8 -ml-1 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
		onclick={goBack}
	>
		<ArrowLeft class="mr-2 h-4 w-4" />
		{currentStep > 1 ? 'Kembali' : 'Kembali ke Dasbor'}
	</button>

	<!-- ═══════════════════════════════════════ -->
	<!--  Premium Step Indicator                -->
	<!-- ═══════════════════════════════════════ -->
	<div class="mb-10">
		<h1 class="text-3xl font-bold tracking-tight mb-6">Buat Undangan Baru</h1>

		<div class="flex items-center">
			{#each [{ num: 1, label: 'Kategori' }, { num: 2, label: 'Tema' }, { num: 3, label: 'Musik' }, { num: 4, label: 'Detail' }] as step, i}
				<!-- Step circle -->
				<div class="flex items-center gap-2.5 shrink-0">
					<div
						class="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300
							{currentStep > step.num
							? 'bg-primary text-primary-foreground'
							: currentStep === step.num
								? 'bg-primary text-primary-foreground ring-4 ring-primary/20'
								: 'bg-muted text-muted-foreground'}"
					>
						{#if currentStep > step.num}
							<Check class="h-4 w-4" />
						{:else}
							{step.num}
						{/if}
					</div>
					<span
						class="text-sm font-medium hidden sm:block transition-colors
							{currentStep >= step.num ? 'text-foreground' : 'text-muted-foreground'}"
					>
						{step.label}
					</span>
				</div>

				<!-- Connector line -->
				{#if i < 3}
					<div class="flex-1 mx-3 sm:mx-4">
						<div class="h-0.5 w-full bg-muted rounded-full overflow-hidden">
							<div
								class="h-full bg-primary rounded-full transition-all duration-500 ease-out"
								style="width: {currentStep > step.num ? '100%' : '0%'}"
							></div>
						</div>
					</div>
				{/if}
			{/each}
		</div>
	</div>

	<!-- ═══════════════════════════════════════ -->
	<!--  Global Error Banner                   -->
	<!-- ═══════════════════════════════════════ -->
	{#if globalError}
		<div
			class="mb-6 flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive animate-in fade-in slide-in-from-top-2 duration-300"
		>
			<AlertCircle class="h-5 w-5 shrink-0 mt-0.5" />
			<div class="flex-1">{globalError}</div>
			<button
				onclick={() => (globalError = '')}
				class="shrink-0 text-destructive/60 hover:text-destructive transition-colors"
			>
				<X class="h-4 w-4" />
			</button>
		</div>
	{/if}

	<!-- ═══════════════════════════════════════ -->
	<!--  Step 1: Choose Category               -->
	<!-- ═══════════════════════════════════════ -->
	{#if currentStep === 1}
		<div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
			<h2 class="text-xl font-semibold mb-2">Pilih Kategori Acara Anda</h2>
			<p class="text-muted-foreground mb-6">
				Tentukan jenis acara untuk menyesuaikan tema dan formulir undangan.
			</p>
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each categories as cat}
					<button
						class="relative flex flex-col items-center justify-center p-8 sm:p-10 rounded-2xl border-2 transition-all duration-200 cursor-pointer
							{selectedEventType === cat.type
							? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
							: 'border-border hover:border-primary/40 hover:shadow-sm bg-card'}"
						onclick={() => (selectedEventType = cat.type)}
					>
						{#if selectedEventType === cat.type}
							<div
								class="absolute top-4 right-4 h-7 w-7 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-sm animate-in zoom-in duration-200"
							>
								<Check class="h-4 w-4" />
							</div>
						{/if}
						<div
							class="h-20 w-20 rounded-full bg-{cat.color}-100 dark:bg-{cat.color}-500/10 flex items-center justify-center text-{cat.color}-500 mb-5 transition-transform duration-200
								{selectedEventType === cat.type ? 'scale-110' : ''}"
						>
							<cat.icon class="h-10 w-10 {cat.iconClass}" />
						</div>
						<h3 class="text-xl font-bold">{cat.label}</h3>
						<p class="text-muted-foreground mt-2 text-center text-sm max-w-[200px]">
							{cat.description}
						</p>
					</button>
				{/each}
			</div>

			<div class="mt-10 flex justify-end">
				<Button size="lg" disabled={!canProceedStep1} onclick={goToStep2} class="h-12 px-8">
					Lanjutkan <ArrowRight class="ml-2 h-4 w-4" />
				</Button>
			</div>
		</div>

		<!-- ═══════════════════════════════════════ -->
		<!--  Step 2: Choose Theme                  -->
		<!-- ═══════════════════════════════════════ -->
	{:else if currentStep === 2}
		<div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
			<h2 class="text-xl font-semibold mb-2">Pilih Tema Undangan</h2>
			<p class="text-muted-foreground mb-6">
				Pilih desain yang sesuai dengan nuansa acara {eventTypeLabel(selectedEventType!)} Anda.
			</p>

			{#if loadingThemes}
				<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
					{#each Array(3) as _}
						<div class="rounded-xl border border-border bg-muted/20 overflow-hidden">
							<div class="h-48 bg-muted/40 animate-pulse"></div>
							<div class="p-4 space-y-3">
								<div class="h-5 w-2/3 bg-muted/40 rounded animate-pulse"></div>
								<div class="h-4 w-full bg-muted/40 rounded animate-pulse"></div>
								<div class="h-6 w-16 bg-muted/40 rounded-full animate-pulse"></div>
							</div>
						</div>
					{/each}
				</div>
			{:else if themesError}
				<div
					class="flex flex-col items-center justify-center py-16 border border-dashed rounded-xl text-center"
				>
					<AlertCircle class="h-10 w-10 text-destructive mb-4" />
					<p class="text-destructive font-medium mb-4">{themesError}</p>
					<Button variant="outline" onclick={goToStep2}>Coba Lagi</Button>
				</div>
			{:else if themes.length === 0}
				<div
					class="flex flex-col items-center justify-center py-16 border border-dashed rounded-xl text-center"
				>
					<ImageIcon class="h-10 w-10 text-muted-foreground/50 mb-4" />
					<p class="text-muted-foreground font-medium">Belum ada tema untuk kategori ini.</p>
				</div>
			{:else}
				<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
					{#each themes as theme}
						<button
							class="text-left relative flex flex-col overflow-hidden rounded-xl border-2 transition-all duration-200 cursor-pointer
								{selectedTheme?.id === theme.id
								? 'border-primary ring-2 ring-primary/20 shadow-md shadow-primary/10'
								: 'border-border hover:border-primary/30 bg-card group hover:shadow-sm'}"
							onclick={() => (selectedTheme = theme)}
						>
							{#if selectedTheme?.id === theme.id}
								<div
									class="absolute top-3 right-3 z-10 h-7 w-7 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-sm animate-in zoom-in duration-200"
								>
									<Check class="h-4 w-4" />
								</div>
							{/if}

							<div class="h-48 w-full bg-muted overflow-hidden relative">
								<img
									src={getMediaUrl(theme.thumbnail) || '/placeholder.svg'}
									alt={theme.name}
									class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
								/>
							</div>

							<div class="p-4 bg-card w-full grow border-t">
								<h3 class="font-bold text-lg group-hover:text-primary transition-colors">
									{theme.name}
								</h3>
								<p class="text-sm text-muted-foreground mt-1 line-clamp-2">
									{theme.description}
								</p>
								<div
									class="mt-3 font-medium text-primary bg-primary/10 inline-block px-2.5 py-0.5 rounded-full text-xs"
								>
									{theme.price ? `Rp ${theme.price.toLocaleString('id-ID')}` : 'Gratis'}
								</div>
							</div>
						</button>
					{/each}
				</div>
			{/if}

			<div class="mt-10 flex justify-end">
				<Button size="lg" disabled={!canProceedStep2} onclick={goToStep3} class="h-12 px-8">
					Lanjutkan <ArrowRight class="ml-2 h-4 w-4" />
				</Button>
			</div>
		</div>

		<!-- ═══════════════════════════════════════ -->
		<!--  Step 3: Music Selection               -->
		<!-- ═══════════════════════════════════════ -->
	{:else if currentStep === 3}
		<div class="animate-in fade-in slide-in-from-right-8 duration-500">
			<div class="flex items-start justify-between mb-6 gap-4 flex-col sm:flex-row">
				<div>
					<h2 class="text-xl font-semibold mb-2">Pilih Musik Latar</h2>
					<p class="text-muted-foreground">
						Musik akan diputar otomatis saat undangan dibuka (opsional).
					</p>
				</div>
				<div class="relative w-full sm:w-64">
					<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Cari judul lagu..."
						bind:value={searchQuery}
						class="pl-9 bg-background/50"
					/>
				</div>
			</div>

			{#if loadingMusics}
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					{#each Array(4) as _}
						<Skeleton class="h-[88px] w-full rounded-xl" />
					{/each}
				</div>
			{:else if musicsError}
				<div
					class="flex flex-col items-center justify-center py-16 border border-dashed rounded-xl text-center"
				>
					<AlertCircle class="h-10 w-10 text-destructive mb-4" />
					<p class="text-destructive font-medium mb-4">{musicsError}</p>
					<Button variant="outline" onclick={goToStep3}>Coba Lagi</Button>
				</div>
			{:else if filteredMusics.length === 0}
				<div
					class="flex flex-col items-center justify-center py-16 border border-dashed rounded-xl text-center"
				>
					<MusicIcon class="h-10 w-10 text-muted-foreground/50 mb-4" />
					<p class="text-muted-foreground font-medium">Tidak ada musik yang ditemukan.</p>
				</div>
			{:else}
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<!-- No Music Option -->
					<div
						role="button"
						tabindex="0"
						class="flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer {selectedMusicId ===
						null
							? 'border-primary bg-primary/5 ring-2 ring-primary/20'
							: 'border-border bg-card hover:border-primary/40'}"
						onclick={() => (selectedMusicId = null)}
						onkeydown={(e) => e.key === 'Enter' && (selectedMusicId = null)}
					>
						<div class="h-14 w-14 rounded-lg bg-muted flex items-center justify-center shrink-0">
							<X class="h-6 w-6 text-muted-foreground" />
						</div>
						<div class="flex-1 min-w-0">
							<h3 class="font-semibold text-foreground truncate">Tanpa Musik</h3>
							<p class="text-sm text-muted-foreground truncate">Undangan tanpa iringan musik</p>
						</div>
						{#if selectedMusicId === null}
							<div
								class="h-6 w-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-sm"
							>
								<Check class="h-4 w-4" />
							</div>
						{/if}
					</div>

					{#each filteredMusics as music}
						<div
							role="button"
							tabindex="0"
							class="flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer group {selectedMusicId ===
							music.id
								? 'border-primary bg-primary/5 ring-2 ring-primary/20'
								: 'border-border bg-card hover:border-primary/40'}"
							onclick={() => (selectedMusicId = music.id)}
							onkeydown={(e) => e.key === 'Enter' && (selectedMusicId = music.id)}
						>
							<div
								class="relative h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-muted group-hover:shadow-md transition-shadow"
							>
								{#if music.cover_image}
									<img
										src={getMediaUrl(music.cover_image)}
										alt={music.title}
										class="h-full w-full object-cover"
									/>
								{:else}
									<div class="h-full w-full flex items-center justify-center bg-primary/10">
										<MusicIcon class="h-6 w-6 text-primary/50" />
									</div>
								{/if}

								<button
									class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity {playingMusicId ===
									music.id
										? 'opacity-100! bg-black/60'
										: ''}"
									onclick={(e) => {
										e.stopPropagation();
										playingMusicId === music.id ? togglePlay() : playAudio(music);
									}}
								>
									{#if playingMusicId === music.id}
										{#if currentAudio && !currentAudio.paused}
											<Pause class="h-6 w-6 text-white" fill="currentColor" />
										{:else}
											<Play class="h-6 w-6 text-white ml-1" fill="currentColor" />
										{/if}
									{:else}
										<Play class="h-6 w-6 text-white ml-1" fill="currentColor" />
									{/if}
								</button>
							</div>

							<div class="flex-1 min-w-0">
								<h3 class="font-semibold text-foreground truncate">{music.title}</h3>
								<p class="text-sm text-muted-foreground truncate">{music.artist}</p>

								{#if playingMusicId === music.id}
									<div class="mt-2 h-1 w-full bg-muted rounded-full overflow-hidden">
										<div
											class="h-full bg-primary"
											style="width: {(currentAudioTime / currentAudioDuration) * 100 || 0}%"
										></div>
									</div>
								{/if}
							</div>

							{#if selectedMusicId === music.id}
								<div
									class="h-6 w-6 bg-primary rounded-full flex items-center justify-center text-primary-foreground shadow-sm"
								>
									<Check class="h-4 w-4" />
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{/if}

			<div class="mt-10 flex justify-between items-center">
				<Button variant="ghost" onclick={() => (currentStep = 2)}>Kembali</Button>
				<Button size="lg" disabled={!canProceedStep3} onclick={goToStep4} class="h-12 px-8">
					Lanjutkan <ArrowRight class="ml-2 h-4 w-4" />
				</Button>
			</div>
		</div>

		<!-- ═══════════════════════════════════════ -->
		<!--  Step 4: Fill Details                  -->
		<!-- ═══════════════════════════════════════ -->
	{:else if currentStep === 4}
		<div class="animate-in fade-in slide-in-from-bottom-4 duration-500">
			<h2 class="text-xl font-semibold mb-2">Detail Acara Anda</h2>
			<p class="text-muted-foreground mb-6">
				Lengkapi informasi untuk undangan Anda. Kolom dengan tanda
				<span class="text-destructive font-bold">*</span> wajib diisi.
			</p>

			{#if loadingSchema}
				<div class="space-y-6">
					<div class="h-32 rounded-xl border border-border bg-muted/20 animate-pulse"></div>
					<div class="h-56 rounded-xl border border-border bg-muted/20 animate-pulse"></div>
				</div>
			{:else if schemaError}
				<div
					class="flex flex-col items-center justify-center py-16 border border-dashed rounded-xl text-center"
				>
					<AlertCircle class="h-10 w-10 text-destructive mb-4" />
					<p class="text-destructive font-medium mb-4">{schemaError}</p>
					<Button variant="outline" onclick={goToStep3}>Coba Lagi</Button>
				</div>
			{:else}
				<!-- Summary of selections -->
				<Card.Root class="mb-8 overflow-hidden bg-muted/20 border-border/50">
					<Card.Content class="py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
						{#if selectedTheme?.thumbnail}
							<img
								src={getMediaUrl(selectedTheme.thumbnail)}
								alt={selectedTheme.name}
								class="h-16 w-24 object-cover rounded-lg border border-border shrink-0"
							/>
						{/if}
						<div class="flex-1 min-w-0">
							<div class="flex flex-wrap items-center gap-2 mb-1">
								<span
									class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-primary/10 text-primary"
								>
									{eventTypeLabel(selectedEventType!)}
								</span>
								<span class="text-muted-foreground text-xs">•</span>
								<span class="text-sm font-medium truncate">{selectedTheme?.name}</span>
							</div>
							<p class="text-xs text-muted-foreground">
								{selectedTheme?.price
									? `Rp ${selectedTheme.price.toLocaleString('id-ID')}`
									: 'Gratis'}
							</p>
						</div>
						<Button
							variant="ghost"
							size="sm"
							class="shrink-0 text-xs text-muted-foreground"
							onclick={() => (currentStep = 2)}
						>
							Ganti Tema
						</Button>
					</Card.Content>
				</Card.Root>

				<!-- Project Title -->
				<Card.Root class="mb-6 overflow-hidden">
					<Card.Header class="bg-muted/30 border-b">
						<Card.Title>Informasi Dasar</Card.Title>
						<Card.Description>Nama acara ini untuk manajemen internal Anda.</Card.Description>
					</Card.Header>
					<Card.Content class="pt-6">
						<div class="grid gap-2">
							<Label for="projectTitle" class="text-sm font-semibold">
								Nama Acara <span class="text-destructive">*</span>
							</Label>
							<Input
								id="projectTitle"
								bind:value={projectTitle}
								placeholder="Misal: Pernikahan Romeo & Juliet"
								class="h-11 {fieldErrors['__title']
									? 'border-destructive focus-visible:ring-destructive'
									: ''}"
								oninput={() => clearFieldError('__title')}
							/>
							{#if fieldErrors['__title']}
								<p
									class="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200"
								>
									<AlertCircle class="h-3.5 w-3.5 shrink-0" />
									{fieldErrors['__title']}
								</p>
							{/if}
						</div>
					</Card.Content>
				</Card.Root>

				<!-- Dynamic Schema Fields -->
				{#each schema as group}
					<Card.Root class="mb-6 overflow-hidden">
						<Card.Header class="bg-muted/30 border-b">
							<Card.Title>{group.group_name}</Card.Title>
						</Card.Header>
						<Card.Content class="space-y-6 pt-6">
							{#each group.fields as field}
								{#if field.type === 'group'}
									<!-- Group field: repeatable items -->
									<div class="space-y-4">
										<div class="flex items-center justify-between">
											<Label class="text-sm font-semibold">
												{field.label}
												{#if field.required}<span class="text-destructive">*</span>{/if}
												<span class="text-muted-foreground font-normal text-xs ml-1"
													>(maks. {field.max_items || '∞'})</span
												>
											</Label>
											<Button
												variant="outline"
												size="sm"
												disabled={field.max_items
													? ((formData[field.key] as any[]) || []).length >= field.max_items
													: false}
												onclick={() => addGroupItem(field)}
												class="text-xs"
											>
												<Plus class="h-3.5 w-3.5 mr-1" /> Tambah
											</Button>
										</div>
										{#each (formData[field.key] as any[]) || [] as item, idx}
											<div
												class="p-4 border border-border rounded-xl bg-muted/10 space-y-4 relative"
											>
												<div class="flex items-center justify-between">
													<span class="text-sm font-medium text-muted-foreground"
														>{field.label} #{idx + 1}</span
													>
													{#if !field.min_items || (formData[field.key] as any[]).length > field.min_items}
														<button
															onclick={() => removeGroupItem(field, idx)}
															class="text-destructive/60 hover:text-destructive transition-colors"
														>
															<Trash2 class="h-4 w-4" />
														</button>
													{/if}
												</div>
												{#each field.fields ?? [] as subField}
													<div class="grid gap-2">
														<Label for="{field.key}_{idx}_{subField.key}" class="text-sm">
															{subField.label}
															{#if subField.required}<span class="text-destructive">*</span>{/if}
														</Label>
														{#if subField.type === 'image'}
															<!-- Image field inside group: show upload or preview -->
															{#if item[subField.key]}
																<div class="flex items-center gap-3">
																	<div
																		class="w-16 h-16 rounded-lg overflow-hidden border border-border bg-muted"
																	>
																		<img
																			src={item[subField.key]}
																			alt="Preview"
																			class="w-full h-full object-cover"
																		/>
																	</div>
																	<button
																		onclick={() => {
																			item[subField.key] = '';
																			formData[field.key] = [...(formData[field.key] as any[])];
																		}}
																		class="text-sm text-destructive/60 hover:text-destructive"
																		>Hapus</button
																	>
																</div>
															{:else}
																<p class="text-xs text-muted-foreground italic">
																	Upload foto tersedia setelah acara dibuat (di halaman detail).
																</p>
															{/if}
														{:else}
															<Input
																type={subField.type === 'number'
																	? 'number'
																	: subField.type === 'url'
																		? 'url'
																		: 'text'}
																id="{field.key}_{idx}_{subField.key}"
																bind:value={item[subField.key]}
																placeholder={subField.placeholder}
																class="h-11"
															/>
														{/if}
													</div>
												{/each}
											</div>
										{/each}
										{#if fieldErrors[field.key]}
											<p class="text-sm text-destructive flex items-center gap-1.5">
												<AlertCircle class="h-3.5 w-3.5 shrink-0" />
												{fieldErrors[field.key]}
											</p>
										{/if}
									</div>
								{:else if field.type === 'image'}
									<!-- Image field (top-level): deferred to edit page -->
									<div class="grid gap-2">
										<Label class="text-sm font-semibold">
											{field.label}
											{#if field.required}<span class="text-destructive">*</span>{/if}
										</Label>
										<p class="text-xs text-muted-foreground italic">
											Upload foto tersedia setelah acara dibuat (di halaman detail).
										</p>
									</div>
								{:else}
									<div class="grid gap-2">
										<Label for={field.key} class="text-sm font-semibold">
											{field.label}
											{#if field.required}
												<span class="text-destructive">*</span>
											{/if}
										</Label>
										{#if field.type === 'text'}
											<textarea
												id={field.key}
												bind:value={formData[field.key]}
												placeholder={field.placeholder}
												oninput={() => clearFieldError(field.key)}
												class="flex min-h-[100px] w-full rounded-md border bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y
													{fieldErrors[field.key] ? 'border-destructive focus-visible:ring-destructive' : 'border-input'}"
											></textarea>
										{:else if field.type === 'number'}
											<Input
												type="number"
												id={field.key}
												bind:value={formData[field.key]}
												placeholder={field.placeholder}
												class="h-11 {fieldErrors[field.key]
													? 'border-destructive focus-visible:ring-destructive'
													: ''}"
												oninput={() => clearFieldError(field.key)}
											/>
										{:else}
											<Input
												type={field.type === 'url' ? 'url' : 'text'}
												id={field.key}
												bind:value={formData[field.key]}
												placeholder={field.placeholder}
												class="h-11 {fieldErrors[field.key]
													? 'border-destructive focus-visible:ring-destructive'
													: ''}"
												oninput={() => clearFieldError(field.key)}
											/>
										{/if}
										{#if fieldErrors[field.key]}
											<p
												class="text-sm text-destructive flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 duration-200"
											>
												<AlertCircle class="h-3.5 w-3.5 shrink-0" />
												{fieldErrors[field.key]}
											</p>
										{/if}
									</div>
								{/if}
							{/each}
						</Card.Content>
					</Card.Root>
				{/each}

				<!-- Submit button -->
				<div class="mt-8 flex justify-end pb-12">
					<Button
						size="lg"
						disabled={saving}
						onclick={submitProject}
						class="h-12 px-8 min-w-[180px]"
					>
						{#if saving}
							<LoaderCircle class="mr-2 h-4 w-4 animate-spin" />
							Menyimpan...
						{:else}
							Buat Undangan <Check class="ml-2 h-4 w-4" />
						{/if}
					</Button>
				</div>
			{/if}
		</div>
	{/if}
</div>
