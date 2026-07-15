<script lang="ts">
	import { page } from '$app/stores';
	import { diskService } from '$lib/api/services/disk.service';
	import type { ProjectDiskUsageResponse } from '$lib/api/services/disk.service';
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { formatBytes, getMediaUrl } from '$lib/utils';
	import * as Card from '$lib/components/ui/card';
	import { Progress } from '$lib/components/ui/progress';
	import { Info } from '@lucide/svelte';
	import PageComposer from '$lib/components/layout/page-composer.svelte';
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

<PageComposer
	title="Penyimpanan (Storage)"
	description="Kelola dan pantau penggunaan ruang disk untuk proyek acara ini."
>
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
					<div
						class="mb-6 rounded-md bg-blue-500/10 p-4 border border-blue-500/20 text-sm flex gap-3 items-start"
					>
						<Info class="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
						<div>
							<p class="font-medium text-blue-700 dark:text-blue-400 mb-1">
								Batas Ukuran Upload File
							</p>
							<p class="text-blue-600/80 dark:text-blue-300/80">
								Untuk menjaga performa, ukuran maksimal setiap file yang diunggah dibatasi hingga <strong
									>10 MB</strong
								>
								untuk gambar dan <strong>50 MB</strong> untuk video. Semua gambar juga akan dikompresi
								otomatis tanpa mengurangi kualitas secara signifikan agar lebih menghemat kuota Anda.
							</p>
						</div>
					</div>

					<div class="mb-2 flex items-center justify-between text-sm">
						<span class="text-muted-foreground">Digunakan: {data.quota.used_human}</span>
						<span class="font-medium text-foreground">Batas: {data.quota.limit_human}</span>
					</div>
					<Progress
						value={data.quota.usage_percent}
						class="h-2"
						indicatorClass={data.quota.usage_percent > 90 ? 'bg-destructive' : 'bg-primary'}
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
														src={getMediaUrl(file.url)}
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
										<TableCell>
											{#if file.is_optimized && file.optimized_size}
												<div class="flex flex-col">
													<span class="font-medium text-green-600 dark:text-green-400"
														>{formatBytes(file.optimized_size)}</span
													>
													<span
														class="text-xs text-muted-foreground line-through"
														title="Ukuran Asli">{formatBytes(file.size)}</span
													>
												</div>
											{:else}
												<span>{formatBytes(file.size)}</span>
											{/if}
										</TableCell>
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
</PageComposer>
