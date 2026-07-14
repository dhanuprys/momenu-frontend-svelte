<script lang="ts">
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Link2, UploadCloud, Video, X } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { getMediaUrl } from '$lib/utils.js';

	let {
		mediaType = 'image',
		mode = $bindable('file'),
		url = $bindable(''),
		file = $bindable<File | null>(null),
		progress = $bindable(0),
		isSubmitting = false
	} = $props<{
		mediaType?: 'image' | 'video';
		mode?: 'file' | 'url';
		url?: string;
		file?: File | null;
		progress?: number;
		isSubmitting?: boolean;
	}>();

	let filePreviewUrl = $state<string | null>(null);
	let isDragging = $state(false);

	$effect(() => {
		if (!file && filePreviewUrl) {
			URL.revokeObjectURL(filePreviewUrl);
			filePreviewUrl = null;
		}
	});

	export function reset() {
		file = null;
		if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
		filePreviewUrl = null;
		isDragging = false;
		url = '';
	}

	function handleFileSelect(e: Event) {
		const target = e.target as HTMLInputElement;
		if (target.files && target.files.length > 0) processFile(target.files[0]);
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		isDragging = false;
		if (e.dataTransfer?.files && e.dataTransfer.files.length > 0)
			processFile(e.dataTransfer.files[0]);
	}

	function processFile(f: File) {
		const isVideo = mediaType === 'video';

		if (isVideo && !f.type.startsWith('video/')) {
			toast.error('Harap upload file video');
			return;
		} else if (!isVideo && !f.type.startsWith('image/')) {
			toast.error('Harap upload file gambar');
			return;
		}

		const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
		if (f.size > maxSize) {
			toast.error(`Ukuran file maksimal ${isVideo ? '50MB' : '10MB'}`);
			return;
		}

		file = f;
		if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
		filePreviewUrl = URL.createObjectURL(f);
	}
</script>

<div class="w-full min-w-0 overflow-hidden">
	<Tabs.Root bind:value={mode} class="w-full">
		<Tabs.List class="grid w-full grid-cols-2">
			<Tabs.Trigger value="file">Upload File</Tabs.Trigger>
			<Tabs.Trigger value="url">Paste URL</Tabs.Trigger>
		</Tabs.List>

		<Tabs.Content value="file" class="pt-4 space-y-4 w-full min-w-0">
			<div
				class="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors {isDragging
					? 'border-primary bg-primary/5'
					: 'border-border'} {file ? 'hidden' : 'block'}"
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
				<UploadCloud class="h-10 w-10 text-muted-foreground mb-4" />
				<p class="text-sm font-medium mb-1">Drag & drop file di sini</p>
				<p class="text-xs text-muted-foreground mb-4">
					atau klik untuk memilih file ({mediaType === 'video'
						? 'MP4, WebM - Max 50MB'
						: 'JPG, PNG, GIF - Max 10MB'})
				</p>
				<Input
					type="file"
					accept={mediaType === 'video'
						? 'video/mp4,video/webm'
						: 'image/jpeg,image/png,image/webp,image/gif'}
					class="hidden"
					id="media-file-upload"
					onchange={handleFileSelect}
				/>
				<Button
					type="button"
					variant="outline"
					onclick={() => document.getElementById('media-file-upload')?.click()}
				>
					Pilih File
				</Button>
			</div>

			{#if file}
				<div class="rounded-xl border p-4 bg-muted/30 w-full overflow-hidden min-w-0">
					<div class="flex items-center gap-4 mb-4 w-full min-w-0">
						{#if mediaType === 'image' && filePreviewUrl}
							<div class="w-16 h-16 rounded-md overflow-hidden bg-muted shrink-0 border">
								<img src={filePreviewUrl} alt="Preview" class="w-full h-full object-cover" />
							</div>
						{:else}
							<div
								class="w-16 h-16 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0 border"
							>
								<Video class="h-8 w-8" />
							</div>
						{/if}
						<div class="flex-1 min-w-0 overflow-hidden">
							<p class="text-sm font-medium truncate w-full" title={file.name}>{file.name}</p>
							<p class="text-xs text-muted-foreground">
								{(file.size / (1024 * 1024)).toFixed(2)} MB
							</p>
						</div>
						<Button
							type="button"
							variant="ghost"
							size="icon"
							class="h-8 w-8 text-muted-foreground shrink-0"
							onclick={() => {
								file = null;
								if (filePreviewUrl) URL.revokeObjectURL(filePreviewUrl);
							}}
						>
							<X class="h-4 w-4" />
						</Button>
					</div>

					{#if isSubmitting}
						<div class="space-y-2 mt-4">
							<div class="flex justify-between text-xs">
								<span>Mengupload...</span>
								<span>{progress}%</span>
							</div>
							<Progress value={progress} class="h-2 w-full" />
						</div>
					{/if}
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
