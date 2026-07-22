<script lang="ts">
	import { page } from '$app/stores';
	import { ProjectService, MediaService } from '$lib/services/index';
	import type { Project, MediaMapping, MediaBucket, MediaMappingRequest } from '$lib/types/index';
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import {
		Image as ImageIcon,
		Video,
		Plus,
		Link2,
		Trash2,
		X,
		Maximize2,
		UploadCloud,
		ChevronLeft,
		ChevronRight,
		Loader2,
		Info
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import MediaInput from '$lib/components/forms/media-input.svelte';
	import PageComposer from '$lib/components/layout/page-composer.svelte';
	import { getMediaUrl } from '$lib/utils';

	let projectId = $derived($page.params.projectId!);
	let project = $state<Project | null>(null);
	let mediaMappings = $state<MediaMapping[]>([]);
	let loading = $state(true);

	let dialogOpen = $state(false);
	let submitting = $state(false);
	let isMoving = $state<number | null>(null);
	let previewImage = $state<string | null>(null);

	function openPreview(url: string) {
		previewImage = url;
	}

	function closePreview() {
		previewImage = null;
	}

	let selectedBucket = $state<MediaBucket | null>(null);
	let formData = $state<MediaMappingRequest>({
		bucket: '',
		media_type: 'image',
		url: '',
		order: 0
	});

	// Upload State
	let uploadMode = $state<'file' | 'url'>('file');
	let selectedFile = $state<File | null>(null);
	let uploadProgress = $state(0);

	function resetUploadState() {
		selectedFile = null;
		uploadProgress = 0;
		formData.url = '';
	}

	async function loadData() {
		loading = true;
		try {
			const [projRes, mediaRes] = await Promise.all([
				ProjectService.get(projectId),
				MediaService.list(projectId)
			]);
			project = projRes;
			mediaMappings = mediaRes || [];
		} catch (e) {
			console.error('Failed to load media data', e);
			toast.error('Gagal memuat data galeri & media');
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadData();
	});

	function openAddDialog(bucket: MediaBucket) {
		selectedBucket = bucket;
		resetUploadState();

		const currentCount = mediaMappings.filter((m) => m.bucket === bucket.key).length;

		formData = {
			bucket: bucket.key,
			media_type: bucket.media_type,
			url: '',
			order: currentCount
		};
		dialogOpen = true;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (uploadMode === 'file' && !selectedFile) {
			toast.error('Harap pilih file terlebih dahulu');
			return;
		}

		submitting = true;

		try {
			if (uploadMode === 'file' && selectedFile) {
				const uploadRes = await import('$lib/services/upload.service')
					.then((m) => m.UploadService)
					.then((service) =>
						service.upload(
							selectedFile as File,
							selectedBucket?.media_type as 'image' | 'video',
							projectId,
							(percent) => {
								uploadProgress = percent;
							}
						)
					);
				formData.url = uploadRes.url;
			}

			await MediaService.create(projectId, formData);
			toast.success('Media berhasil ditambahkan');

			dialogOpen = false;
			await loadData();
		} catch (e: any) {
			console.error(e);
			toast.error(e?.response?.data?.message || 'Gagal menambahkan media');
		} finally {
			submitting = false;
		}
	}

	async function deleteMedia(id: number) {
		if (!confirm('Apakah Anda yakin ingin menghapus media ini?')) return;

		try {
			await MediaService.delete(projectId, id);
			toast.success('Media berhasil dihapus');
			mediaMappings = mediaMappings.filter((m) => m.id !== id);
		} catch (e) {
			toast.error('Gagal menghapus media');
		}
	}

	async function swapMediaOrder(bucketKey: string, indexA: number, indexB: number) {
		const items = getBucketItems(bucketKey);
		if (indexA < 0 || indexB < 0 || indexA >= items.length || indexB >= items.length) return;

		const itemA = items[indexA];
		const itemB = items[indexB];
		isMoving = itemA.id;

		// Optimistic update
		const oldOrderA = itemA.order;
		const oldOrderB = itemB.order;

		mediaMappings = mediaMappings.map((m) => {
			if (m.id === itemA.id) return { ...m, order: oldOrderB };
			if (m.id === itemB.id) return { ...m, order: oldOrderA };
			return m;
		});

		try {
			// API Calls
			await Promise.all([
				MediaService.update(projectId, itemA.id, {
					bucket: itemA.bucket,
					media_type: itemA.media_type,
					url: itemA.url,
					order: oldOrderB
				}),
				MediaService.update(projectId, itemB.id, {
					bucket: itemB.bucket,
					media_type: itemB.media_type,
					url: itemB.url,
					order: oldOrderA
				})
			]);
		} catch (e) {
			// Revert on failure
			toast.error('Gagal mengubah urutan media');
			mediaMappings = mediaMappings.map((m) => {
				if (m.id === itemA.id) return { ...m, order: oldOrderA };
				if (m.id === itemB.id) return { ...m, order: oldOrderB };
				return m;
			});
		} finally {
			isMoving = null;
		}
	}

	function getBucketItems(bucketKey: string) {
		return mediaMappings.filter((m) => m.bucket === bucketKey).sort((a, b) => a.order - b.order);
	}
</script>

<svelte:head>
	<title>Momenu | Galeri & Media</title>
</svelte:head>

<PageComposer>
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Galeri & Media</h1>
		<p class="text-muted-foreground mt-2">
			Kelola foto dan video untuk undangan Anda sesuai dengan template tema.
		</p>
	</div>

	<div
		class="bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 rounded-lg p-4 flex gap-3 items-start -mt-2"
	>
		<Info class="h-5 w-5 mt-0.5 shrink-0" />
		<div>
			<h4 class="font-semibold text-sm">Informasi Terkait Tema</h4>
			<p class="text-sm opacity-90 mt-1">
				Jenis dan jumlah kotak media yang dapat diunggah sepenuhnya bergantung pada tema yang Anda
				pilih. Setiap tema mungkin memiliki kebutuhan foto/video yang berbeda.
			</p>
		</div>
	</div>

	{#if loading}
		<div class="space-y-8">
			{#each Array(2) as _}
				<div class="space-y-4">
					<Skeleton class="h-8 w-48" />
					<div class="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
						<Skeleton class="h-40 w-full rounded-xl" />
						<Skeleton class="h-40 w-full rounded-xl" />
					</div>
				</div>
			{/each}
		</div>
	{:else if !project?.theme?.media_buckets || project.theme.media_buckets.length === 0}
		<Empty.Root>
			<Empty.Header>
				<Empty.Media variant="icon">
					<ImageIcon class="h-12 w-12" />
				</Empty.Media>
				<Empty.Title>Tema Tidak Membutuhkan Media</Empty.Title>
				<Empty.Description>
					Tema yang Anda pilih saat ini tidak memiliki pengaturan galeri atau media.
				</Empty.Description>
			</Empty.Header>
		</Empty.Root>
	{:else}
		<div class="space-y-10">
			{#each project.theme.media_buckets as bucket}
				{@const items = getBucketItems(bucket.key)}
				{@const isFull = items.length >= bucket.max_files}

				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between pb-4">
						<div class="space-y-1.5">
							<Card.Title class="text-xl font-semibold flex items-center gap-2">
								{#if bucket.media_type === 'video'}
									<Video class="h-5 w-5 text-primary" />
								{:else}
									<ImageIcon class="h-5 w-5 text-primary" />
								{/if}
								{bucket.label}
							</Card.Title>
							<Card.Description>
								Maksimal {bucket.max_files}
								{bucket.media_type === 'video' ? 'video' : 'foto'}
							</Card.Description>
						</div>

						<Button size="sm" disabled={isFull} onclick={() => openAddDialog(bucket)}>
							<Plus class="h-4 w-4 mr-2" />
							Tambah {bucket.media_type === 'video' ? 'Video' : 'Foto'}
						</Button>
					</Card.Header>

					<Card.Content>
						{#if items.length === 0}
							<div class="border rounded-xl bg-muted/5 border-dashed p-6">
								<Empty.Root>
									<Empty.Header>
										<Empty.Title>Belum ada media</Empty.Title>
										<Empty.Description>Belum ada media di bagian ini.</Empty.Description>
									</Empty.Header>
									<Empty.Content>
										<Button variant="outline" onclick={() => openAddDialog(bucket)}>
											Mulai tambahkan sekarang
										</Button>
									</Empty.Content>
								</Empty.Root>
							</div>
						{:else}
							<div class="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
								{#each items as item, i (item.id)}
									<div
										class="relative group aspect-square rounded-xl overflow-hidden border bg-muted flex items-center justify-center {isMoving ===
										item.id
											? 'opacity-50'
											: ''}"
									>
										{#if item.media_type === 'image'}
											<!-- svelte-ignore a11y_img_redundant_alt -->
											<img
												src={getMediaUrl(item.url)}
												alt="Gallery Image"
												class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
												onerror={(e) => {
													(e.currentTarget as HTMLImageElement).src =
														'https://placehold.co/400x400/e2e8f0/94a3b8?text=Image+Error';
												}}
											/>
										{:else}
											<div
												class="flex flex-col items-center justify-center text-muted-foreground w-full h-full p-4 text-center bg-black/5 dark:bg-white/5 relative"
											>
												<div
													class="w-12 h-12 bg-background rounded-full shadow-sm flex items-center justify-center mb-3"
												>
													<Video class="h-5 w-5 text-primary" />
												</div>
												<div
													class="absolute bottom-0 inset-x-0 p-3 bg-linear-to-t from-background/90 to-transparent"
												>
													<p class="text-xs break-all line-clamp-1 truncate opacity-80">
														{item.url}
													</p>
												</div>
											</div>
										{/if}

										<div
											class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col justify-between p-3"
										>
											<!-- Top Actions (Delete/Preview) -->
											<div
												class="flex items-start justify-end gap-2 translate-y-[-10px] group-hover:translate-y-0 transition-transform duration-200"
											>
												{#if item.media_type === 'image'}
													<Button
														variant="secondary"
														size="icon"
														class="h-8 w-8 rounded-full shadow-md bg-white/10 hover:bg-white/20 text-white border-0"
														onclick={() => openPreview(getMediaUrl(item.url))}
													>
														<Maximize2 class="h-4 w-4" />
													</Button>
												{/if}
												<Button
													variant="destructive"
													size="icon"
													class="h-8 w-8 rounded-full shadow-md"
													onclick={() => deleteMedia(item.id)}
												>
													<Trash2 class="h-4 w-4" />
												</Button>
											</div>

											<!-- Bottom Actions (Reorder) -->
											<div
												class="flex items-center justify-center gap-2 translate-y-[10px] group-hover:translate-y-0 transition-transform duration-200"
											>
												<Button
													variant="secondary"
													size="icon"
													class="h-8 w-8 rounded-full shadow-md bg-white/10 hover:bg-white/20 text-white border-0 {i ===
													0
														? 'invisible'
														: ''}"
													onclick={() => swapMediaOrder(bucket.key, i, i - 1)}
												>
													<ChevronLeft class="h-4 w-4" />
												</Button>

												{#if isMoving === item.id}
													<Loader2 class="h-5 w-5 text-white animate-spin mx-2" />
												{:else}
													<div class="w-9"></div>
												{/if}

												<Button
													variant="secondary"
													size="icon"
													class="h-8 w-8 rounded-full shadow-md bg-white/10 hover:bg-white/20 text-white border-0 {i ===
													items.length - 1
														? 'invisible'
														: ''}"
													onclick={() => swapMediaOrder(bucket.key, i, i + 1)}
												>
													<ChevronRight class="h-4 w-4" />
												</Button>
											</div>
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}
</PageComposer>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>
				Tambah {selectedBucket?.media_type === 'video' ? 'Video' : 'Foto'}
			</Dialog.Title>
			<Dialog.Description>
				Tambahkan file media untuk bagian <strong>{selectedBucket?.label}</strong>.
			</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="space-y-4 py-4 min-w-0 w-full">
			<MediaInput
				mediaType={selectedBucket?.media_type}
				bind:mode={uploadMode}
				bind:url={formData.url}
				bind:file={selectedFile}
				progress={uploadProgress}
				isSubmitting={submitting}
			/>

			<Dialog.Footer>
				<Button type="button" variant="outline" onclick={() => (dialogOpen = false)}>Batal</Button>
				<Button
					type="submit"
					disabled={submitting || (uploadMode === 'file' ? !selectedFile : !formData.url)}
				>
					{submitting ? 'Menyimpan...' : 'Simpan'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

{#if previewImage}
	<div
		class="fixed inset-0 z-100 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 lg:p-12 animate-in fade-in duration-200"
		role="button"
		tabindex="0"
		onclick={closePreview}
		onkeydown={(e) => e.key === 'Escape' && closePreview()}
	>
		<div
			class="relative w-full h-full flex items-center justify-center animate-in zoom-in-95 duration-300"
		>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<img
				src={previewImage}
				alt="Fullscreen Preview"
				class="max-w-full max-h-full object-contain cursor-default drop-shadow-2xl rounded-sm"
				onclick={(e) => e.stopPropagation()}
			/>
			<Button
				variant="outline"
				size="icon"
				class="absolute top-4 right-4 bg-background/20 hover:bg-background/40 border-none text-white rounded-full"
				onclick={closePreview}
			>
				<X class="h-4 w-4" />
			</Button>
		</div>
	</div>
{/if}
