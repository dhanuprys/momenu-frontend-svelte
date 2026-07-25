<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Link2, UploadCloud, Video, X } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { getMediaUrl } from '$lib/utils';
	import { SvelteMap } from 'svelte/reactivity';

	let {
		mediaType = 'image',
		mode = $bindable('file'),
		url = $bindable(''),
		files = $bindable<File[]>([]),
		maxFiles = 1,
		remainingSlots = 1,
		progress = $bindable(0),
		isSubmitting = false,

		// Legacy single-file support (backwards compat)
		// eslint-disable-next-line no-useless-assignment
		file = $bindable<File | null>(null)
	} = $props<{
		mediaType?: 'image' | 'video';
		mode?: 'file' | 'url';
		url?: string;
		files?: File[];
		maxFiles?: number;
		remainingSlots?: number;
		progress?: number;
		isSubmitting?: boolean;
		file?: File | null;
	}>();

	let previewUrls = $state<Map<string, string>>(new Map());
	let isDragging = $state(false);

	// Unique ID for the file input to avoid ID collisions
	let inputId = `media-file-upload-${Math.random().toString(36).slice(2, 9)}`;

	let isMultiMode = $derived(maxFiles > 1);
	let canAddMore = $derived(files.length < remainingSlots);

	$effect(() => {
		// Legacy single-file sync: keep `file` in sync with `files[0]`
		if (!isMultiMode && files.length > 0) {
			file = files[0];
		} else if (!isMultiMode && files.length === 0) {
			file = null;
		}
	});

	// Cleanup preview URLs on unmount
	$effect(() => {
		return () => {
			for (const url of previewUrls.values()) {
				URL.revokeObjectURL(url);
			}
		};
	});

	export function reset() {
		for (const url of previewUrls.values()) {
			URL.revokeObjectURL(url);
		}
		previewUrls = new SvelteMap();
		files = [];
		file = null;
		isDragging = false;
		url = '';
	}

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) {
			processFiles(Array.from(target.files));
		}
		// Reset the input value so re-selecting the same file works
		target.value = '';
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
			processFiles(Array.from(e.dataTransfer.files));
		}
	}

	function processFiles(incoming: File[]) {
		const isVideo = mediaType === 'video';
		const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
		const acceptPrefix = isVideo ? 'video/' : 'image/';

		// Calculate how many more files we can accept
		const slotsAvailable = remainingSlots - files.length;
		if (slotsAvailable <= 0) {
			toast.error(`Tidak dapat menambahkan lagi. Slot penuh (maks ${maxFiles}).`);
			return;
		}

		let accepted: File[] = [];
		let rejectedType = 0;
		let rejectedSize = 0;
		let rejectedSlot = 0;

		for (const f of incoming) {
			// Check slot limit
			if (accepted.length >= slotsAvailable) {
				rejectedSlot++;
				continue;
			}

			// Check file type
			if (!f.type.startsWith(acceptPrefix)) {
				rejectedType++;
				continue;
			}

			// Check file size
			if (f.size > maxSize) {
				rejectedSize++;
				continue;
			}

			// Check for duplicate filenames (already queued)
			const isDuplicate = files.some(
				(existing: File) => existing.name === f.name && existing.size === f.size
			);
			if (isDuplicate) {
				continue; // silently skip duplicates
			}

			accepted.push(f);
		}

		// Generate preview URLs for accepted files
		if (mediaType === 'image') {
			for (const f of accepted) {
				const key = `${f.name}_${f.size}`;
				if (!previewUrls.has(key)) {
					previewUrls.set(key, URL.createObjectURL(f));
				}
			}
			previewUrls = new SvelteMap(previewUrls); // trigger reactivity
		}

		// Add to the list
		if (isMultiMode) {
			files = [...files, ...accepted];
		} else {
			// Single-file mode: replace existing
			clearAllPreviews();
			if (accepted.length > 0) {
				const f = accepted[0];
				const key = `${f.name}_${f.size}`;
				if (mediaType === 'image') {
					previewUrls = new SvelteMap([[key, URL.createObjectURL(f)]]);
				}
				files = [f];
			}
		}

		// Show rejection feedback
		const messages: string[] = [];
		if (rejectedType > 0) {
			messages.push(`${rejectedType} file bukan ${isVideo ? 'video' : 'gambar'}`);
		}
		if (rejectedSize > 0) {
			messages.push(`${rejectedSize} file melebihi ${isVideo ? '50MB' : '10MB'}`);
		}
		if (rejectedSlot > 0) {
			messages.push(`${rejectedSlot} file melebihi batas slot`);
		}
		if (messages.length > 0) {
			toast.error(`Ditolak: ${messages.join(', ')}`);
		}
	}

	function removeFile(index: number) {
		const f = files[index];
		const key = `${f.name}_${f.size}`;
		const existingUrl = previewUrls.get(key);
		if (existingUrl) {
			URL.revokeObjectURL(existingUrl);
			previewUrls.delete(key);
			previewUrls = new SvelteMap(previewUrls);
		}
		files = files.filter((_: File, i: number) => i !== index);
	}

	function clearAllPreviews() {
		for (const url of previewUrls.values()) {
			URL.revokeObjectURL(url);
		}
		previewUrls = new SvelteMap();
	}

	function getPreviewUrl(f: File): string | null {
		return previewUrls.get(`${f.name}_${f.size}`) ?? null;
	}
</script>

<div class="w-full min-w-0 overflow-hidden">
	<Tabs.Root bind:value={mode} class="w-full">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="file" disabled={isSubmitting}>Upload File</Tabs.Trigger>
			<Tabs.Trigger value="url" disabled={isSubmitting}>Paste URL</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="file" class="pt-4 space-y-4 w-full min-w-0">
			<!-- Drop zone: show when no files selected, or in multi-mode when slots remain -->
			{#if files.length === 0 || (isMultiMode && canAddMore && !isSubmitting)}
				<div
					class="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center transition-colors
						{isDragging ? 'border-primary bg-primary/5' : 'border-border'}
						{files.length > 0 ? 'py-4' : 'py-8'}"
					ondragover={(e) => {
						e.preventDefault();
						isDragging = true;
					}}
					ondragleave={() => {
						isDragging = false;
					}}
					ondrop={handleDrop}
					role="button"
					tabindex="0"
				>
					<UploadCloud class="h-8 w-8 text-muted-foreground mb-3" />
					{#if files.length === 0}
						<p class="text-sm font-medium mb-1">Drag & drop file di sini</p>
					{:else}
						<p class="text-sm font-medium mb-1">Tambahkan file lagi</p>
					{/if}
					<p class="text-xs text-muted-foreground mb-3">
						{#if isMultiMode}
							Pilih hingga {remainingSlots - files.length} file lagi ({mediaType === 'video'
								? 'MP4, WebM - Max 50MB'
								: 'JPG, PNG, GIF - Max 10MB'})
						{:else}
							{mediaType === 'video' ? 'MP4, WebM - Max 50MB' : 'JPG, PNG, GIF - Max 10MB'}
						{/if}
					</p>
					<Input
						type="file"
						accept={mediaType === 'video'
							? 'video/mp4,video/webm'
							: 'image/jpeg,image/png,image/webp,image/gif'}
						class="hidden"
						id={inputId}
						multiple={isMultiMode}
						onchange={handleFileSelect}
					/>
					<Button
						type="button"
						variant="outline"
						size="sm"
						onclick={() => document.getElementById(inputId)?.click()}
					>
						Pilih File
					</Button>
				</div>
			{/if}

			<!-- Selected files list -->
			{#if files.length > 0 && !isSubmitting}
				<div class="space-y-2">
					{#if isMultiMode}
						<p class="text-xs text-muted-foreground font-medium">
							{files.length} file dipilih (sisa slot: {remainingSlots - files.length})
						</p>
					{/if}
					<div class="max-h-48 overflow-y-auto space-y-2 pr-1">
						{#each files as f, i (f.name + '_' + f.size + '_' + i)}
							<div class="rounded-lg border p-2.5 bg-muted/30 flex items-center gap-3">
								<!-- Thumbnail -->
								{#if mediaType === 'image'}
									{@const preview = getPreviewUrl(f)}
									{#if preview}
										<div class="w-10 h-10 rounded-md overflow-hidden bg-muted shrink-0 border">
											<img src={preview} alt="" class="w-full h-full object-cover" />
										</div>
									{:else}
										<div class="w-10 h-10 rounded-md bg-muted shrink-0 border"></div>
									{/if}
								{:else}
									<div
										class="w-10 h-10 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 border"
									>
										<Video class="h-5 w-5" />
									</div>
								{/if}

								<!-- File info -->
								<div class="flex-1 min-w-0 overflow-hidden">
									<p class="text-xs font-medium truncate" title={f.name}>{f.name}</p>
									<p class="text-xs text-muted-foreground">
										{(f.size / (1024 * 1024)).toFixed(2)} MB
									</p>
								</div>

								<!-- Remove button -->
								<Button
									type="button"
									variant="ghost"
									size="icon"
									class="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
									onclick={() => removeFile(i)}
								>
									<X class="h-3.5 w-3.5" />
								</Button>
							</div>
						{/each}
					</div>
				</div>
			{/if}

			<!-- Single file upload progress (legacy compat) -->
			{#if !isMultiMode && files.length > 0 && isSubmitting}
				<div class="rounded-xl border p-4 bg-muted/30 w-full overflow-hidden min-w-0">
					<div class="flex items-center gap-4 mb-4 w-full min-w-0">
						{#if mediaType === 'image'}
							{@const preview = getPreviewUrl(files[0])}
							{#if preview}
								<div class="w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0 border">
									<img src={preview} alt="Preview" class="w-full h-full object-cover" />
								</div>
							{/if}
						{:else}
							<div
								class="w-16 h-16 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 border"
							>
								<Video class="h-8 w-8" />
							</div>
						{/if}
						<div class="flex-1 min-w-0 overflow-hidden">
							<p class="text-sm font-medium truncate w-full" title={files[0].name}>
								{files[0].name}
							</p>
							<p class="text-xs text-muted-foreground">
								{(files[0].size / (1024 * 1024)).toFixed(2)} MB
							</p>
						</div>
					</div>
					<div class="space-y-2">
						<div class="flex justify-between text-xs">
							<span>Mengupload...</span>
							<span>{progress}%</span>
						</div>
						<Progress value={progress} class="h-2 w-full" />
					</div>
				</div>
			{/if}
		</Tabs.Content>

		<Tabs.Content value="url" class="pt-4 space-y-4 w-full min-w-0">
			<div class="space-y-2">
				<Label for="url" class="flex items-center gap-2">
					<Link2 class="h-4 w-4" />
					URL Publik Media
				</Label>
				<Input
					id="url"
					type="url"
					bind:value={url}
					placeholder={mediaType === 'video'
						? 'https://example.com/video.mp4'
						: 'https://example.com/image.jpg'}
					required={mode === 'url'}
					disabled={isSubmitting}
				/>
			</div>

			{#if url && mediaType === 'image'}
				<div
					class="mt-4 rounded-lg overflow-hidden border aspect-video bg-muted flex items-center justify-center"
				>
					<img
						src={getMediaUrl(url)}
						alt="Preview"
						class="w-full h-full object-cover"
						onerror={(e) => {
							(e.currentTarget as HTMLImageElement).style.display = 'none';
						}}
					/>
				</div>
			{/if}
		</Tabs.Content>
	</Tabs.Root>
</div>
