<script lang="ts">
	import { AdminService, MusicService } from '$lib/services/index.js';
	import { UploadService } from '$lib/services/upload.service.js';
	import type { Music, MusicCategory } from '$lib/types/index.js';
	import { onMount } from 'svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Trash2, Play, Pause, Edit } from '@lucide/svelte';
	import { config } from '$lib/config/index.js';
	import PageComposer from '$lib/components/layout/page-composer.svelte';
	import { toast } from 'svelte-sonner';

	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';

	let musics = $state<Music[]>([]);
	let categories = $state<MusicCategory[]>([]);
	let loading = $state(true);

	// Category State
	let createCategoryOpen = $state(false);
	let isSubmittingCategory = $state(false);
	let isEditingCategory = $state(false);
	let editCategoryId = $state<number | null>(null);
	let newCategory = $state({ name: '', slug: '', description: '', order: 0 });

	function openEditCategory(cat: MusicCategory) {
		isEditingCategory = true;
		editCategoryId = cat.id;
		newCategory = {
			name: cat.name,
			slug: cat.slug,
			description: cat.description,
			order: cat.order
		};
		createCategoryOpen = true;
	}

	function resetCategoryForm() {
		isEditingCategory = false;
		editCategoryId = null;
		newCategory = { name: '', slug: '', description: '', order: categories.length };
	}

	async function deleteCategory(id: number) {
		if (!confirm('Apakah Anda yakin ingin menghapus kategori ini?')) return;
		try {
			await AdminService.deleteMusicCategory(id);
			categories = categories.filter((c) => c.id !== id);
			toast.success('Kategori berhasil dihapus');
		} catch (error) {
			toast.error('Gagal menghapus kategori');
		}
	}

	// Music State
	let createMusicOpen = $state(false);
	let isSubmittingMusic = $state(false);
	let musicFiles = $state<FileList | undefined>(undefined);
	let coverFiles = $state<FileList | undefined>(undefined);
	let newMusic = $state({
		category_id: 0,
		title: '',
		artist: '',
		file_path: '',
		duration_seconds: 0,
		cover_image: '',
		order: 0
	});

	let currentAudio = $state<HTMLAudioElement | null>(null);
	let playingMusicId = $state<number | null>(null);

	onMount(async () => {
		try {
			const [cats, mus] = await Promise.all([
				MusicService.listCategories(),
				MusicService.listMusics() // assuming this lists all if no categoryId
			]);
			categories = cats;
			musics = mus;
		} catch (error) {
			toast.error('Gagal memuat data musik');
		} finally {
			loading = false;
		}
	});

	function playAudio(music: Music) {
		if (playingMusicId === music.id) {
			stopAudio();
			return;
		}

		stopAudio();

		currentAudio = new Audio(`${config.API_ROOT_URL}${music.file_path}`);
		currentAudio.play().catch((e) => console.error(e));
		currentAudio.onended = () => stopAudio();
		playingMusicId = music.id;
	}

	function stopAudio() {
		if (currentAudio) {
			currentAudio.pause();
			currentAudio = null;
		}
		playingMusicId = null;
	}

	async function deleteMusic(id: number) {
		if (!confirm('Apakah Anda yakin ingin menghapus musik ini?')) return;
		try {
			await AdminService.deleteMusic(id);
			musics = musics.filter((m) => m.id !== id);
			if (playingMusicId === id) stopAudio();
			toast.success('Musik berhasil dihapus');
		} catch (error) {
			toast.error('Gagal menghapus musik');
		}
	}

	async function handleCreateCategory(e: Event) {
		e.preventDefault();
		isSubmittingCategory = true;
		try {
			newCategory.order = Number(newCategory.order);
			if (isEditingCategory && editCategoryId) {
				const updated = await AdminService.updateMusicCategory(editCategoryId, newCategory);
				categories = categories.map((c) => (c.id === editCategoryId ? updated : c));
				toast.success('Kategori berhasil diperbarui');
			} else {
				const created = await AdminService.createMusicCategory(newCategory);
				categories = [...categories, created];
				toast.success('Kategori berhasil ditambahkan');
			}
			createCategoryOpen = false;
			resetCategoryForm();
		} catch (error) {
			toast.error('Gagal menyimpan kategori');
		} finally {
			isSubmittingCategory = false;
		}
	}

	async function handleCreateMusic(e: Event) {
		e.preventDefault();
		if (!musicFiles || musicFiles.length === 0) {
			toast.error('Silakan pilih file musik');
			return;
		}

		isSubmittingMusic = true;
		try {
			// Upload audio file
			const audioUpload = await UploadService.adminUpload(musicFiles[0], 'audio');
			newMusic.file_path = audioUpload.url;

			// Optional cover image upload
			if (coverFiles && coverFiles.length > 0) {
				const coverUpload = await UploadService.adminUpload(coverFiles[0], 'image');
				newMusic.cover_image = coverUpload.url;
			}

			newMusic.category_id = Number(newMusic.category_id);
			newMusic.duration_seconds = Number(newMusic.duration_seconds);
			newMusic.order = Number(newMusic.order);
			const created = await AdminService.createMusic(newMusic);
			musics = [created, ...musics];
			toast.success('Musik berhasil ditambahkan');
			createMusicOpen = false;
			newMusic = {
				category_id: 0,
				title: '',
				artist: '',
				file_path: '',
				duration_seconds: 0,
				cover_image: '',
				order: 0
			};
			// @ts-expect-error - DOM requires null to reset input.files, but Svelte types expect undefined
			musicFiles = null;
			// @ts-expect-error
			coverFiles = null;
		} catch (error) {
			toast.error('Gagal menambahkan musik atau upload file');
		} finally {
			isSubmittingMusic = false;
		}
	}
</script>

<svelte:head>
	<title>Momenu | Manajemen Musik</title>
</svelte:head>

<PageComposer title="Musik Latar" description="Kelola daftar musik latar dan kategorinya.">
	<Tabs.Root value="music" class="w-full">
		<Tabs.List>
			<Tabs.Trigger value="music">Daftar Musik</Tabs.Trigger>
			<Tabs.Trigger value="category">Kategori</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="music" class="space-y-4">
			<div class="flex justify-end mt-4">
				<Dialog.Root bind:open={createMusicOpen}>
					<Dialog.Trigger>
						<Button>Upload Musik</Button>
					</Dialog.Trigger>
					<Dialog.Content class="max-h-[90vh] overflow-y-auto">
						<Dialog.Header>
							<Dialog.Title>Upload Musik</Dialog.Title>
							<Dialog.Description>Tambahkan musik latar baru.</Dialog.Description>
						</Dialog.Header>
						<form onsubmit={handleCreateMusic} class="space-y-4 py-4">
							<div class="space-y-2">
								<Label for="music-title">Judul</Label>
								<Input id="music-title" bind:value={newMusic.title} required />
							</div>
							<div class="space-y-2">
								<Label for="music-artist">Artis</Label>
								<Input id="music-artist" bind:value={newMusic.artist} required />
							</div>
							<div class="space-y-2">
								<Label for="music-cat">Kategori</Label>
								<select
									id="music-cat"
									bind:value={newMusic.category_id}
									required
									class="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								>
									<option value={0} disabled>Pilih Kategori</option>
									{#each categories as cat}
										<option value={cat.id}>{cat.name}</option>
									{/each}
								</select>
							</div>
							<div class="space-y-2">
								<Label for="music-file">File Musik (Audio)</Label>
								<Input
									id="music-file"
									type="file"
									accept="audio/*"
									bind:files={musicFiles}
									required
								/>
							</div>
							<div class="space-y-2">
								<Label for="music-cover">Cover Image (Opsional)</Label>
								<Input id="music-cover" type="file" accept="image/*" bind:files={coverFiles} />
							</div>
							<div class="space-y-2">
								<Label for="music-dur">Durasi (Detik)</Label>
								<Input
									id="music-dur"
									type="number"
									bind:value={newMusic.duration_seconds}
									required
								/>
							</div>
							<div class="space-y-2">
								<Label for="music-order">Urutan</Label>
								<Input id="music-order" type="number" bind:value={newMusic.order} required />
							</div>
							<Dialog.Footer class="pt-4">
								<Button type="button" variant="outline" onclick={() => (createMusicOpen = false)}
									>Batal</Button
								>
								<Button type="submit" disabled={isSubmittingMusic}
									>{isSubmittingMusic ? 'Menyimpan...' : 'Simpan'}</Button
								>
							</Dialog.Footer>
						</form>
					</Dialog.Content>
				</Dialog.Root>
			</div>

			<div class="rounded-md border bg-card">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head class="w-[60px]"></Table.Head>
							<Table.Head>Judul</Table.Head>
							<Table.Head>Artis</Table.Head>
							<Table.Head>Kategori</Table.Head>
							<Table.Head>Durasi</Table.Head>
							<Table.Head class="text-right">Aksi</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#if loading}
							{#each Array(5) as _}
								<Table.Row>
									<Table.Cell><Skeleton class="h-8 w-8 rounded-full" /></Table.Cell>
									<Table.Cell><Skeleton class="h-4 w-32" /></Table.Cell>
									<Table.Cell><Skeleton class="h-4 w-24" /></Table.Cell>
									<Table.Cell><Skeleton class="h-6 w-16" /></Table.Cell>
									<Table.Cell><Skeleton class="h-4 w-12" /></Table.Cell>
									<Table.Cell class="text-right"><Skeleton class="h-8 w-8 ml-auto" /></Table.Cell>
								</Table.Row>
							{/each}
						{:else if musics.length === 0}
							<Table.Row>
								<Table.Cell colspan={6} class="text-center py-6 text-muted-foreground"
									>Tidak ada musik ditemukan.</Table.Cell
								>
							</Table.Row>
						{:else}
							{#each musics as music}
								<Table.Row>
									<Table.Cell>
										<Button variant="ghost" size="icon" onclick={() => playAudio(music)}>
											{#if playingMusicId === music.id}
												<Pause class="h-4 w-4" />
											{:else}
												<Play class="h-4 w-4" />
											{/if}
										</Button>
									</Table.Cell>
									<Table.Cell class="font-medium">{music.title}</Table.Cell>
									<Table.Cell>{music.artist}</Table.Cell>
									<Table.Cell>
										<div
											class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-secondary text-secondary-foreground"
										>
											{categories.find((c) => c.id === music.category_id)?.name ||
												music.category_id}
										</div>
									</Table.Cell>
									<Table.Cell class="text-muted-foreground">
										{Math.floor(music.duration_seconds / 60)}:{String(
											music.duration_seconds % 60
										).padStart(2, '0')}
									</Table.Cell>
									<Table.Cell class="text-right">
										<Button variant="destructive" size="icon" onclick={() => deleteMusic(music.id)}>
											<Trash2 class="h-4 w-4" />
										</Button>
									</Table.Cell>
								</Table.Row>
							{/each}
						{/if}
					</Table.Body>
				</Table.Root>
			</div>
		</Tabs.Content>

		<Tabs.Content value="category" class="space-y-4">
			<div class="flex justify-end mt-4">
				<Dialog.Root
					bind:open={createCategoryOpen}
					onOpenChange={(open) => {
						if (!open) resetCategoryForm();
					}}
				>
					<Dialog.Trigger>
						<Button variant="outline">Tambah Kategori</Button>
					</Dialog.Trigger>
					<Dialog.Content>
						<Dialog.Header>
							<Dialog.Title>{isEditingCategory ? 'Edit Kategori' : 'Tambah Kategori'}</Dialog.Title>
							<Dialog.Description
								>{isEditingCategory
									? 'Perbarui informasi kategori musik.'
									: 'Buat kategori musik baru.'}</Dialog.Description
							>
						</Dialog.Header>
						<form onsubmit={handleCreateCategory} class="space-y-4 py-4">
							<div class="space-y-2">
								<Label for="cat-name">Nama</Label>
								<Input
									id="cat-name"
									bind:value={newCategory.name}
									oninput={() => {
										if (!isEditingCategory) {
											newCategory.slug = newCategory.name
												.toLowerCase()
												.replace(/[^a-z0-9]+/g, '-')
												.replace(/(^-|-$)/g, '');
										}
									}}
									required
								/>
							</div>
							<div class="space-y-2">
								<Label for="cat-slug">Slug</Label>
								<Input id="cat-slug" bind:value={newCategory.slug} required />
							</div>
							<div class="space-y-2">
								<Label for="cat-desc">Deskripsi</Label>
								<Input id="cat-desc" bind:value={newCategory.description} />
							</div>
							<div class="space-y-2">
								<Label for="cat-order">Urutan</Label>
								<Input id="cat-order" type="number" bind:value={newCategory.order} required />
							</div>
							<Dialog.Footer class="pt-4">
								<Button type="button" variant="outline" onclick={() => (createCategoryOpen = false)}
									>Batal</Button
								>
								<Button type="submit" disabled={isSubmittingCategory}
									>{isSubmittingCategory ? 'Menyimpan...' : 'Simpan'}</Button
								>
							</Dialog.Footer>
						</form>
					</Dialog.Content>
				</Dialog.Root>
			</div>

			<div class="rounded-md border bg-card">
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Nama</Table.Head>
							<Table.Head>Slug</Table.Head>
							<Table.Head>Deskripsi</Table.Head>
							<Table.Head>Urutan</Table.Head>
							<Table.Head class="text-right">Aksi</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#if loading}
							{#each Array(3) as _}
								<Table.Row>
									<Table.Cell><Skeleton class="h-4 w-32" /></Table.Cell>
									<Table.Cell><Skeleton class="h-4 w-24" /></Table.Cell>
									<Table.Cell><Skeleton class="h-4 w-40" /></Table.Cell>
									<Table.Cell><Skeleton class="h-4 w-12" /></Table.Cell>
									<Table.Cell class="text-right"><Skeleton class="h-8 w-16 ml-auto" /></Table.Cell>
								</Table.Row>
							{/each}
						{:else if categories.length === 0}
							<Table.Row>
								<Table.Cell colspan={5} class="text-center py-6 text-muted-foreground"
									>Tidak ada kategori ditemukan.</Table.Cell
								>
							</Table.Row>
						{:else}
							{#each [...categories].sort((a, b) => a.order - b.order) as cat}
								<Table.Row>
									<Table.Cell class="font-medium">{cat.name}</Table.Cell>
									<Table.Cell>{cat.slug}</Table.Cell>
									<Table.Cell class="text-muted-foreground">{cat.description || '-'}</Table.Cell>
									<Table.Cell>{cat.order}</Table.Cell>
									<Table.Cell class="text-right">
										<Button variant="ghost" size="icon" onclick={() => openEditCategory(cat)}>
											<Edit class="h-4 w-4" />
										</Button>
										<Button
											variant="destructive"
											size="icon"
											onclick={() => deleteCategory(cat.id)}
										>
											<Trash2 class="h-4 w-4" />
										</Button>
									</Table.Cell>
								</Table.Row>
							{/each}
						{/if}
					</Table.Body>
				</Table.Root>
			</div>
		</Tabs.Content>
	</Tabs.Root>
</PageComposer>
