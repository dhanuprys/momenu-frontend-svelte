<script lang="ts">
	import { Progress } from '$lib/components/ui/progress/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { CheckCircle2, AlertCircle, Loader2, X, RotateCcw } from '@lucide/svelte';

	export type QueueItemStatus = 'pending' | 'uploading' | 'done' | 'error';

	export interface QueueItem {
		id: string;
		file: File;
		previewUrl: string | null;
		status: QueueItemStatus;
		progress: number;
		errorMessage?: string;
	}

	let {
		items = $bindable<QueueItem[]>([]),
		isUploading = false,
		onRemove,
		onRetry
	} = $props<{
		items: QueueItem[];
		isUploading: boolean;
		onRemove?: (id: string) => void;
		onRetry?: () => void;
	}>();

	let completedCount = $derived(items.filter((i: QueueItem) => i.status === 'done').length);
	let errorCount = $derived(items.filter((i: QueueItem) => i.status === 'error').length);
	let totalCount = $derived(items.length);
	let hasErrors = $derived(errorCount > 0);
	let allDone = $derived(items.length > 0 && items.every((i: QueueItem) => i.status === 'done' || i.status === 'error'));

	function formatSize(bytes: number): string {
		if (bytes < 1024) return `${bytes} B`;
		if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
		return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
	}
</script>

{#if items.length > 0}
	<div class="space-y-3">
		<!-- Summary header -->
		<div class="flex items-center justify-between text-sm">
			<span class="text-muted-foreground">
				{#if isUploading}
					Mengupload {completedCount + 1} dari {totalCount}...
				{:else if allDone && !hasErrors}
					Semua {totalCount} file berhasil diupload
				{:else if allDone && hasErrors}
					{completedCount} berhasil, {errorCount} gagal
				{:else}
					{totalCount} file dipilih
				{/if}
			</span>
			{#if allDone && hasErrors && onRetry}
				<Button type="button" variant="outline" size="sm" onclick={onRetry}>
					<RotateCcw class="h-3.5 w-3.5 mr-1.5" />
					Coba Lagi ({errorCount})
				</Button>
			{/if}
		</div>

		<!-- File list -->
		<div class="max-h-64 overflow-y-auto space-y-2 pr-1">
			{#each items as item (item.id)}
				<div
					class="flex items-center gap-3 rounded-lg border p-2.5 transition-colors
						{item.status === 'done' ? 'bg-green-500/5 border-green-500/20' : ''}
						{item.status === 'error' ? 'bg-destructive/5 border-destructive/20' : ''}
						{item.status === 'uploading' ? 'bg-primary/5 border-primary/20' : ''}
						{item.status === 'pending' ? 'bg-muted/30' : ''}"
				>
					<!-- Thumbnail -->
					<div class="w-10 h-10 rounded-md overflow-hidden bg-muted shrink-0 border flex items-center justify-center">
						{#if item.previewUrl}
							<img src={item.previewUrl} alt="" class="w-full h-full object-cover" />
						{:else}
							<div class="w-full h-full bg-muted"></div>
						{/if}
					</div>

					<!-- File info -->
					<div class="flex-1 min-w-0 overflow-hidden">
						<p class="text-xs font-medium truncate" title={item.file.name}>
							{item.file.name}
						</p>
						<p class="text-xs text-muted-foreground">
							{formatSize(item.file.size)}
							{#if item.status === 'error' && item.errorMessage}
								<span class="text-destructive"> — {item.errorMessage}</span>
							{/if}
						</p>
						{#if item.status === 'uploading'}
							<Progress value={item.progress} class="h-1.5 w-full mt-1.5" />
						{/if}
					</div>

					<!-- Status icon / remove button -->
					<div class="shrink-0">
						{#if item.status === 'done'}
							<CheckCircle2 class="h-5 w-5 text-green-500" />
						{:else if item.status === 'error'}
							<AlertCircle class="h-5 w-5 text-destructive" />
						{:else if item.status === 'uploading'}
							<Loader2 class="h-5 w-5 text-primary animate-spin" />
						{:else if !isUploading && onRemove}
							<Button
								type="button"
								variant="ghost"
								size="icon"
								class="h-7 w-7 text-muted-foreground hover:text-destructive"
								onclick={() => onRemove(item.id)}
							>
								<X class="h-3.5 w-3.5" />
							</Button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}
