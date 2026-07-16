<script lang="ts">
	import { page } from '$app/stores';
	import { ProjectService, MusicService } from '$lib/services/index.js';
	import type { Project, Music, MusicCategory } from '$lib/types/index.js';
	import { onMount, onDestroy } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Play, Pause, Check, Music as MusicIcon, Search } from '@lucide/svelte';
	import { config } from '$lib/config/index.js';
	import { getMediaUrl } from '$lib/utils.js';
	import { toast } from 'svelte-sonner';
	import MusicPlayerBar from '$lib/theme-engine/components/music-player-bar.svelte';
	import PageComposer from '$lib/components/layout/page-composer.svelte';

	let projectId = $derived($page.params.projectId!);
	let project = $state<Project | null>(null);
	let categories = $state<MusicCategory[]>([]);
	let musics = $state<Music[]>([]);

	let loading = $state(true);

	let selectedCategoryId = $state<number | 'all' | null>(null);
	let selectedMusicId = $state<number | null>(null);
	let savedMusicId = $state<number | null>(null);
	let savedMusicObj = $state<Music | null>(null);

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
	let playingMusic = $derived(
		musics.find((m) => m.id === playingMusicId) ||
			(savedMusicObj?.id === playingMusicId ? savedMusicObj : null) ||
			null
	);
	let currentAudioTime = $state(0);
	let currentAudioDuration = $state(0);

	async function loadData() {
		loading = true;
		try {
			const proj = await ProjectService.get(projectId);
			project = proj;
			selectedMusicId = proj.music_id || null;
			savedMusicId = proj.music_id || null;
			savedMusicObj = proj.music || null;

			const cats = await MusicService.listCategories();
			categories = cats;

			const matchingCat = cats.find((c) => c.slug === proj.event_type);
			if (matchingCat) {
				selectedCategoryId = matchingCat.id;
			} else {
				selectedCategoryId = 'all';
			}

			if (selectedCategoryId) {
				await loadMusics(selectedCategoryId);
			}
		} catch (e) {
			console.error('Failed to load music settings', e);
			toast.error('Gagal memuat pengaturan musik');
		} finally {
			loading = false;
		}
	}

	async function loadMusics(categoryId: number | 'all') {
		try {
			if (categoryId === 'all') {
				musics = await MusicService.listMusics();
			} else {
				musics = await MusicService.listMusics(categoryId);
			}
		} catch (e) {
			toast.error('Gagal memuat daftar musik');
		}
	}

	onMount(() => {
		loadData();

		return () => {
			stopAudio();
		};
	});

	async function handleCategoryChange(categoryId: number | 'all') {
		if (selectedCategoryId === categoryId) return;
		stopAudio();
		selectedCategoryId = categoryId;
		searchQuery = '';
		await loadMusics(categoryId);
	}

	function playAudio(music: Music) {
		if (playingMusicId === music.id) {
			stopAudio();
			return;
		}

		stopAudio();

		currentAudio = new Audio(getMediaUrl(music.file_path));

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
		// trigger reactivity
		currentAudio = currentAudio;
	}

	let saveTimeout: ReturnType<typeof setTimeout>;

	async function selectMusic(id: number | null) {
		if (selectedMusicId === id) return;
		const prevId = selectedMusicId;
		const prevObj = savedMusicObj;
		selectedMusicId = id;

		// clear previous debounce
		if (saveTimeout) clearTimeout(saveTimeout);

		saveTimeout = setTimeout(async () => {
			if (!project) return;
			try {
				await ProjectService.update(projectId, {
					title: project.title,
					slug: project.slug,
					payload: project.payload,
					sharing_thumbnail: project.sharing_thumbnail,
					music_id: selectedMusicId
				});
				savedMusicId = selectedMusicId;
				project.music_id = selectedMusicId;

				if (selectedMusicId === null) {
					savedMusicObj = null;
				} else {
					const found = musics.find((m) => m.id === selectedMusicId);
					if (found) savedMusicObj = found;
				}

				const musicName =
					id === null ? 'Tanpa Musik' : musics.find((m) => m.id === id)?.title || 'Lagu';
				toast.success(`Musik latar diubah ke ${musicName}`, {
					action: {
						label: 'Batal',
						onClick: () => undoSelection(prevId, prevObj)
					}
				});
			} catch (e) {
				toast.error('Gagal menyimpan musik');
				selectedMusicId = prevId; // revert on error
			}
		}, 500);
	}

	async function undoSelection(previousId: number | null, previousObj: Music | null) {
		if (!project) return;
		selectedMusicId = previousId;
		try {
			await ProjectService.update(projectId, {
				title: project.title,
				slug: project.slug,
				payload: project.payload,
				sharing_thumbnail: project.sharing_thumbnail,
				music_id: previousId
			});
			savedMusicId = previousId;
			project.music_id = previousId;
			savedMusicObj = previousObj;
			toast.success('Pilihan musik dikembalikan');
		} catch (e) {
			toast.error('Gagal mengembalikan musik');
		}
	}
</script>

<svelte:head>
	<title>Momenu | Musik Latar</title>
</svelte:head>

<PageComposer class="pb-32">
	<div class="flex flex-col gap-2">
		<h1 class="text-3xl font-bold tracking-tight">Musik Latar</h1>
		<p class="text-muted-foreground">
			Pilih musik latar yang akan diputar saat undangan dibuka. Perubahan akan disimpan secara
			otomatis.
		</p>
	</div>

	{#if loading}
		<div class="flex flex-col gap-6">
			<div class="flex gap-2">
				<Skeleton class="h-10 w-24 rounded-full" />
				<Skeleton class="h-10 w-24 rounded-full" />
			</div>
			<Skeleton class="h-10 w-full max-w-sm" />
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{#each Array(6) as _}
					<Card.Root>
						<div class="flex p-4 gap-4 items-center">
							<Skeleton class="h-16 w-16 rounded-md" />
							<div class="space-y-2 flex-1">
								<Skeleton class="h-5 w-3/4" />
								<Skeleton class="h-4 w-1/2" />
							</div>
						</div>
					</Card.Root>
				{/each}
			</div>
		</div>
	{:else}
		<div class="flex flex-col gap-6">
			<!-- Saved Music Section -->
			<div class="flex flex-col gap-3 mb-2">
				<div class="flex items-center justify-between max-w-md">
					<h2 class="text-lg font-semibold tracking-tight">Musik Terpilih</h2>
					{#if savedMusicId !== null}
						<Button
							variant="ghost"
							size="sm"
							class="text-destructive hover:bg-destructive/10 hover:text-destructive text-xs h-8"
							onclick={() => selectMusic(null)}
						>
							Hapus Musik
						</Button>
					{/if}
				</div>
				{#if savedMusicId === null}
					<Card.Root
						class="relative overflow-hidden transition-all border-primary ring-2 ring-primary bg-primary/5 max-w-md"
					>
						<div class="flex p-4 items-center gap-4">
							<div
								class="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground border border-border/50"
							>
								<MusicIcon class="h-6 w-6 opacity-50" />
							</div>
							<div class="flex-1 min-w-0">
								<h3 class="font-semibold text-sm truncate">Tanpa Musik</h3>
								<p class="text-xs text-muted-foreground truncate">Tidak ada latar musik</p>
							</div>
							<div
								class="flex flex-col items-center justify-center bg-primary text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full"
							>
								Tersimpan
							</div>
						</div>
					</Card.Root>
				{:else if savedMusicObj}
					<Card.Root
						class="relative overflow-hidden transition-all border-primary ring-2 ring-primary bg-primary/5 {playingMusicId ===
						savedMusicObj.id
							? 'border-l-4 border-l-primary'
							: ''} max-w-md"
					>
						<div class="flex p-3 sm:p-4 items-center gap-3 sm:gap-4">
							<button
								class="h-10 w-10 sm:h-12 sm:w-12 rounded-full shrink-0 flex items-center justify-center transition-all bg-secondary hover:bg-secondary/80 text-secondary-foreground shadow-sm {playingMusicId ===
								savedMusicObj.id
									? 'bg-primary text-primary-foreground hover:bg-primary/90'
									: ''}"
								onclick={(e) => {
									e.stopPropagation();
									playAudio(savedMusicObj!);
								}}
								title={playingMusicId === savedMusicObj.id ? 'Pause' : 'Play'}
							>
								{#if playingMusicId === savedMusicObj.id}
									<div class="flex items-center gap-0.5 h-4 justify-center">
										<span class="w-1 h-3 bg-current animate-[bounce_1s_infinite_0.1s] rounded-full"
										></span>
										<span class="w-1 h-4 bg-current animate-[bounce_1s_infinite_0.3s] rounded-full"
										></span>
										<span class="w-1 h-2 bg-current animate-[bounce_1s_infinite_0.5s] rounded-full"
										></span>
									</div>
								{:else}
									<Play class="h-4 w-4 ml-0.5" />
								{/if}
							</button>

							<div
								class="relative h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-md shrink-0 border border-border/50 bg-muted"
							>
								{#if savedMusicObj.cover_image}
									<img
										src={savedMusicObj.cover_image}
										alt={savedMusicObj.title}
										class="h-full w-full object-cover"
									/>
								{:else}
									<div class="flex h-full w-full items-center justify-center text-muted-foreground">
										<MusicIcon class="h-5 w-5 opacity-50" />
									</div>
								{/if}
							</div>

							<div class="flex-1 min-w-0">
								<h3 class="font-semibold text-sm truncate">{savedMusicObj.title}</h3>
								<p class="text-xs text-muted-foreground truncate">{savedMusicObj.artist}</p>
							</div>

							<div
								class="flex flex-col items-center justify-center bg-primary text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
							>
								Tersimpan
							</div>
						</div>
					</Card.Root>
				{/if}
			</div>

			<hr class="border-border my-2" />

			<!-- Category Tabs & Search -->
			<div class="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
				<div class="flex flex-wrap gap-2">
					<button
						class="px-4 py-2 rounded-full text-sm font-medium transition-colors border {selectedCategoryId ===
						'all'
							? 'bg-primary text-primary-foreground border-primary'
							: 'bg-background hover:bg-muted border-input'}"
						onclick={() => handleCategoryChange('all')}
					>
						Semua
					</button>
					{#each categories as category}
						<button
							class="px-4 py-2 rounded-full text-sm font-medium transition-colors border {selectedCategoryId ===
							category.id
								? 'bg-primary text-primary-foreground border-primary'
								: 'bg-background hover:bg-muted border-input'}"
							onclick={() => handleCategoryChange(category.id)}
						>
							{category.name}
						</button>
					{/each}
				</div>

				<div class="relative w-full sm:w-72">
					<Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Cari lagu atau artis..."
						class="pl-9 bg-background w-full"
						bind:value={searchQuery}
					/>
				</div>
			</div>

			<!-- Music Grid -->
			<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				<!-- Empty State for Search/Category -->
				{#if filteredMusics.length === 0 && searchQuery.trim() !== ''}
					<div
						class="col-span-full py-12 text-center flex flex-col items-center justify-center border rounded-xl bg-card border-dashed"
					>
						<MusicIcon class="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
						<h3 class="font-semibold text-lg">Lagu Tidak Ditemukan</h3>
						<p class="text-sm text-muted-foreground max-w-sm mt-1">
							Kami tidak dapat menemukan "{searchQuery}" di kategori ini. Coba kata kunci lain atau
							cari di kategori berbeda.
						</p>
					</div>
				{/if}

				{#each filteredMusics as music}
					<Card.Root
						class="relative overflow-hidden cursor-pointer transition-all hover:border-primary/50 {selectedMusicId ===
						music.id
							? 'border-primary ring-2 ring-primary bg-primary/5'
							: ''} {playingMusicId === music.id ? 'border-l-4 border-l-primary' : ''}"
						onclick={() => selectMusic(music.id)}
					>
						<div class="flex p-3 sm:p-4 items-center gap-3 sm:gap-4">
							<!-- Cover Image / Play Button -->
							<div class="relative h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-lg overflow-hidden bg-muted transition-shadow group-hover:shadow-sm">
								{#if music.cover_image}
									<img src={getMediaUrl(music.cover_image)} alt={music.title} class="h-full w-full object-cover" />
								{:else}
									<div class="h-full w-full flex items-center justify-center bg-primary/10">
										<MusicIcon class="h-5 w-5 sm:h-6 sm:w-6 text-primary/50" />
									</div>
								{/if}
								
								<button
									class="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity {playingMusicId === music.id ? 'opacity-100! bg-black/60' : ''} text-white"
									onclick={(e) => {
										e.stopPropagation();
										playAudio(music);
									}}
									title={playingMusicId === music.id ? 'Pause' : 'Play'}
								>
									{#if playingMusicId === music.id}
										<div class="flex items-center gap-0.5 h-4 justify-center">
											<span class="w-1 h-3 bg-white animate-[bounce_1s_infinite_0.1s] rounded-full"></span>
											<span class="w-1 h-4 bg-white animate-[bounce_1s_infinite_0.3s] rounded-full"></span>
											<span class="w-1 h-2 bg-white animate-[bounce_1s_infinite_0.5s] rounded-full"></span>
										</div>
									{:else}
										<Play class="h-5 w-5 sm:h-6 sm:w-6 ml-1" fill="currentColor" />
									{/if}
								</button>
							</div>

							<div class="flex-1 min-w-0">
								<h3 class="font-semibold text-sm truncate">{music.title}</h3>
								<p class="text-xs text-muted-foreground truncate">{music.artist}</p>
								<p class="text-xs text-muted-foreground/60 mt-0.5 font-medium">
									{Math.floor(music.duration_seconds / 60)}:{String(
										music.duration_seconds % 60
									).padStart(2, '0')}
								</p>
							</div>

							{#if savedMusicId === music.id}
								<div
									class="flex flex-col items-center justify-center bg-primary text-primary-foreground text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
								>
									Tersimpan
								</div>
							{:else if selectedMusicId === music.id}
								<!-- Pending save state visually -->
								<div
									class="flex h-5 w-5 items-center justify-center rounded-full bg-primary/50 text-primary-foreground shrink-0"
								>
									<span class="h-2 w-2 animate-ping rounded-full bg-white opacity-75"></span>
								</div>
							{/if}
						</div>
					</Card.Root>
				{/each}
			</div>
		</div>
	{/if}
</PageComposer>

{#if playingMusic}
	<MusicPlayerBar
		music={playingMusic}
		isPlaying={!!currentAudio && !currentAudio.paused}
		isSelected={selectedMusicId === playingMusicId}
		currentTime={currentAudioTime}
		duration={currentAudioDuration}
		onTogglePlay={togglePlay}
		onSelect={() => {
			if (playingMusicId !== null) selectMusic(playingMusicId);
		}}
	/>
{/if}
