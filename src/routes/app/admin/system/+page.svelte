<script lang="ts">
	import { AdminService } from '$lib/services/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Activity, Cpu, Server, Clock, HardDrive, Info } from '@lucide/svelte';
	import { onMount, onDestroy } from 'svelte';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import PageComposer from '$lib/components/layout/page-composer.svelte';

	let systemResources = $state<any>(null);
	let pollingInterval: any;
	let loading = $state(true);

	onMount(async () => {
		// Initial fetch for system resources
		await fetchSystemResources();
		loading = false;
		
		// Start polling every 5 seconds
		pollingInterval = setInterval(fetchSystemResources, 5000);
	});

	onDestroy(() => {
		if (pollingInterval) clearInterval(pollingInterval);
	});

	async function fetchSystemResources() {
		try {
			systemResources = await AdminService.getSystemResources();
		} catch (error) {
			console.error('Failed to fetch system resources', error);
		}
	}

	function formatUptime(seconds: number) {
		const h = Math.floor(seconds / 3600);
		const m = Math.floor((seconds % 3600) / 60);
		const s = Math.floor(seconds % 60);
		return `${h}h ${m}m ${s}s`;
	}
</script>

<svelte:head>
	<title>Momenu | Sistem & Sumber Daya</title>
</svelte:head>

<PageComposer title="Statistik Server" description="Pantau penggunaan sumber daya server secara real-time.">
	{#if loading && !systemResources}
		<div class="grid gap-4 md:grid-cols-4">
			{#each Array(4) as _}
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
						<Skeleton class="h-4 w-1/2" />
						<Skeleton class="h-4 w-4 rounded-full" />
					</Card.Header>
					<Card.Content>
						<Skeleton class="h-8 w-1/3" />
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{:else if systemResources}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Memori Terpakai</Card.Title>
					<Server class="h-4 w-4 text-muted-foreground" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{systemResources.memory_alloc_mb.toFixed(2)} MB</div>
					<p class="text-xs text-muted-foreground mt-1">Sistem: {systemResources.memory_sys_mb.toFixed(2)} MB</p>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Goroutines Aktif</Card.Title>
					<Activity class="h-4 w-4 text-muted-foreground" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{systemResources.goroutines}</div>
					<p class="text-xs text-muted-foreground mt-1">Total thread Go</p>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Logical CPU</Card.Title>
					<Cpu class="h-4 w-4 text-muted-foreground" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{systemResources.num_cpu} Core</div>
					<p class="text-xs text-muted-foreground mt-1">Versi: {systemResources.go_version}</p>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Uptime Server</Card.Title>
					<Clock class="h-4 w-4 text-muted-foreground" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{formatUptime(systemResources.uptime_seconds)}</div>
					<p class="text-xs text-muted-foreground mt-1">Waktu berjalan</p>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Penyimpanan (Root)</Card.Title>
					<HardDrive class="h-4 w-4 text-muted-foreground" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{systemResources.disk_usage_percent.toFixed(1)}%</div>
					<p class="text-xs text-muted-foreground mt-1">
						Sisa: {systemResources.disk_free_gb.toFixed(1)} GB dari {systemResources.disk_total_gb.toFixed(1)} GB
					</p>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Sistem Operasi</Card.Title>
					<Info class="h-4 w-4 text-muted-foreground" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold capitalize">{systemResources.os}</div>
					<p class="text-xs text-muted-foreground mt-1">Arsitektur: {systemResources.arch}</p>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}
</PageComposer>
