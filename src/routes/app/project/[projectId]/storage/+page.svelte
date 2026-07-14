<script lang="ts">
	import { page } from '$app/stores';
	import { diskService } from '$lib/api/services/disk.service';
	import type { ProjectDiskUsageResponse } from '$lib/api/services/disk.service';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { formatBytes } from '$lib/utils';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';

	let projectId = $derived($page.params.projectId!);
	let loading = $state(true);
	let data = $state<ProjectDiskUsageResponse | null>(null);

	async function loadData() {
		try {
			loading = true;
			data = await diskService.getProjectDiskUsage(projectId);
		} catch (error) {
			console.error('Failed to load disk usage', error);
			toast.error('Gagal memuat info penyimpanan');
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadData();
	});
</script>

<div class="flex-1 space-y-4 p-4 md:p-8 pt-6">
	<div class="flex items-center justify-between space-y-2">
		<h2 class="text-3xl font-bold tracking-tight">Penyimpanan (Storage)</h2>
	</div>

	{#if loading}
		<div class="flex h-[400px] items-center justify-center">
			<div class="text-muted-foreground animate-pulse">Memuat data...</div>
		</div>
	{:else if data}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			<Card.Root class="md:col-span-2 lg:col-span-3">
				<Card.Header>
					<Card.Title>Kuota Penyimpanan</Card.Title>
					<Card.Description>Ringkasan penggunaan ruang disk untuk acara ini.</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="mb-2 flex items-center justify-between text-sm">
						<span class="text-muted-foreground">Digunakan: {data.quota.used_human}</span>
						<span class="font-medium text-foreground">Batas: {data.quota.limit_human}</span>
					</div>
					<Progress
						value={data.quota.usage_percent}
						class="h-2 {data.quota.usage_percent > 90 ? 'bg-destructive' : 'bg-primary'}"
					/>
					<div class="mt-2 text-xs text-muted-foreground">
						Sisa: {data.quota.remaining_human} ({data.quota.usage_percent.toFixed(1)}% terpakai)
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<Card.Root>
			<Card.Header>
				<Card.Title>Daftar File Media</Card.Title>
				<Card.Description>File media yang diunggah untuk acara ini.</Card.Description>
			</Card.Header>
			<Card.Content>
				{#if data.files.length === 0}
					<div class="flex h-[200px] items-center justify-center rounded-md border border-dashed">
						<p class="text-sm text-muted-foreground">Belum ada file media yang diunggah.</p>
					</div>
				{:else}
					<div class="rounded-md border">
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Nama File</TableHead>
									<TableHead>Tipe</TableHead>
									<TableHead>Ukuran</TableHead>
									<TableHead>Status Optimasi</TableHead>
									<TableHead>Waktu</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{#each data.files as file}
									<TableRow>
										<TableCell class="font-medium">
											<div class="flex items-center gap-2">
												{#if file.media_type === 'image'}
													<img
														src={file.url}
														alt={file.original_name}
														class="h-8 w-8 object-cover rounded"
													/>
												{:else if file.media_type === 'audio'}
													<div
														class="h-8 w-8 bg-muted flex items-center justify-center rounded text-xs"
													>
														🎵
													</div>
												{:else}
													<div
														class="h-8 w-8 bg-muted flex items-center justify-center rounded text-xs"
													>
														📄
													</div>
												{/if}
												<span class="truncate max-w-[200px]" title={file.original_name}
													>{file.original_name}</span
												>
											</div>
										</TableCell>
										<TableCell>{file.content_type}</TableCell>
										<TableCell>{formatBytes(file.size)}</TableCell>
										<TableCell>
											{#if file.media_type === 'image'}
												{#if file.is_optimized}
													<Badge
														variant="outline"
														class="bg-green-500/10 text-green-500 border-green-500/20"
														>Dioptimalkan</Badge
													>
												{:else}
													<Badge
														variant="outline"
														class="bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
														>Menunggu (Antrean)</Badge
													>
												{/if}
											{:else}
												<span class="text-xs text-muted-foreground">-</span>
											{/if}
										</TableCell>
										<TableCell>
											{new Date(file.created_at).toLocaleDateString('id-ID', {
												year: 'numeric',
												month: 'short',
												day: 'numeric',
												hour: '2-digit',
												minute: '2-digit'
											})}
										</TableCell>
									</TableRow>
								{/each}
							</TableBody>
						</Table>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}
</div>
