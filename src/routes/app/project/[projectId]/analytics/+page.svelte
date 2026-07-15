<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { AnalyticsService, RSVPService } from '$lib/services';
	import type { ProjectAnalytics, RSVPStats } from '$lib/types';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import {
		Eye,
		Users,
		MonitorSmartphone,
		Share2,
		MousePointerClick,
		CalendarCheck,
		Smartphone,
		Monitor
	} from '@lucide/svelte';
	import PageComposer from '$lib/components/layout/page-composer.svelte';

	let projectId = $derived($page.params.projectId!);
	let analytics = $state<ProjectAnalytics | null>(null);
	let rsvpStats = $state<RSVPStats | null>(null);
	let loading = $state(true);

	onMount(async () => {
		try {
			const [analyticsData, rsvpData] = await Promise.all([
				AnalyticsService.getProjectAnalytics(projectId),
				RSVPService.getStats(projectId)
			]);
			analytics = analyticsData;
			rsvpStats = rsvpData;
		} catch (error) {
			console.error('Failed to load analytics', error);
		} finally {
			loading = false;
		}
	});

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatShortDate(dateString: string) {
		return new Date(dateString).toLocaleString('id-ID', {
			day: 'numeric',
			month: 'short'
		});
	}

	function getDeviceIcon(device: string) {
		if (device === 'Mobile') return Smartphone;
		if (device === 'Desktop') return Monitor;
		return MonitorSmartphone;
	}

	let maxDailyCount = $derived(
		analytics?.daily_visits ? Math.max(...analytics.daily_visits.map((d) => d.count), 1) : 1
	);

	let totalSources = $derived(
		analytics?.source_stats ? analytics.source_stats.reduce((acc, curr) => acc + curr.count, 0) : 0
	);

	let totalDevices = $derived(
		analytics?.device_stats ? analytics.device_stats.reduce((acc, curr) => acc + curr.count, 0) : 0
	);
</script>

<svelte:head>
	<title>Momenu | Statistik & Analitik</title>
</svelte:head>

<PageComposer
	title="Statistik & Analitik"
	description="Pantau performa undangan digital Anda, mulai dari jumlah kunjungan hingga interaksi tamu."
>
	{#if loading}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
			{#each Array(2) as _}
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
						<Skeleton class="h-4 w-1/2" />
					</Card.Header>
					<Card.Content>
						<Skeleton class="h-8 w-1/3 mb-2" />
						<Skeleton class="h-3 w-1/4" />
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
		<Skeleton class="h-[400px] w-full rounded-xl" />
	{:else if analytics}
		<!-- Conversion Funnel & High Level Metrics -->
		<div class="grid gap-4 md:grid-cols-3 mb-6">
			<Card.Root class="bg-linear-to-br from-primary/10 to-primary/5 border-primary/20">
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Total Kunjungan Halaman</Card.Title>
					<div class="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
						<Eye class="h-4 w-4 text-primary" />
					</div>
				</Card.Header>
				<Card.Content>
					<div class="text-3xl font-bold">{analytics.total_visits}</div>
					<p class="text-xs text-muted-foreground mt-1">Kali undangan dilihat</p>
				</Card.Content>
			</Card.Root>

			<Card.Root
				class="bg-linear-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20 relative overflow-hidden"
			>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Pengunjung Unik</Card.Title>
					<div class="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center">
						<Users class="h-4 w-4 text-blue-600 dark:text-blue-400" />
					</div>
				</Card.Header>
				<Card.Content>
					<div class="text-3xl font-bold">{analytics.unique_guests}</div>
					<p class="text-xs text-muted-foreground mt-1">Berdasarkan perangkat / IP</p>
				</Card.Content>
				{#if analytics.total_visits > 0}
					<div
						class="absolute bottom-0 left-0 h-1 bg-blue-500/50"
						style="width: {(analytics.unique_guests / analytics.total_visits) * 100}%"
					></div>
				{/if}
			</Card.Root>

			<Card.Root
				class="bg-linear-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 relative overflow-hidden"
			>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Konversi RSVP</Card.Title>
					<div class="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
						<CalendarCheck class="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
					</div>
				</Card.Header>
				<Card.Content>
					<div class="text-3xl font-bold">
						{rsvpStats ? rsvpStats.attending + rsvpStats.not_attending : 0}
					</div>
					<p class="text-xs text-muted-foreground mt-1">Tamu yang telah merespon</p>
				</Card.Content>
				{#if analytics.unique_guests > 0 && rsvpStats}
					<div
						class="absolute bottom-0 left-0 h-1 bg-emerald-500/50"
						style="width: {((rsvpStats.attending + rsvpStats.not_attending) /
							analytics.unique_guests) *
							100}%"
					></div>
				{/if}
			</Card.Root>
		</div>

		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
			<!-- Chart: Visits Over Time -->
			<Card.Root class="lg:col-span-2 flex flex-col">
				<Card.Header>
					<Card.Title>Kunjungan 7 Hari Terakhir</Card.Title>
					<Card.Description>Tren kunjungan harian ke undangan Anda.</Card.Description>
				</Card.Header>
				<Card.Content class="flex-1 flex flex-col justify-end pt-4">
					{#if analytics.daily_visits && analytics.daily_visits.length > 0}
						<div class="flex items-end justify-between h-48 gap-2 w-full">
							{#each analytics.daily_visits as day}
								<div class="flex flex-col items-center gap-2 flex-1 group h-full">
									<!-- Tooltip could be added here -->
									<div
										class="w-full relative bg-primary/10 rounded-t-sm transition-all overflow-hidden flex items-end flex-1"
									>
										<div
											class="w-full bg-primary rounded-t-sm transition-all duration-700 ease-out group-hover:bg-primary/80"
											style="height: {(day.count / maxDailyCount) * 100}%"
										></div>
									</div>
									<span class="text-xs text-muted-foreground truncate w-full text-center"
										>{formatShortDate(day.date)}</span
									>
								</div>
							{/each}
						</div>
					{:else}
						<div class="h-48 flex items-center justify-center text-muted-foreground text-sm">
							Belum ada data kunjungan harian.
						</div>
					{/if}
				</Card.Content>
			</Card.Root>

			<div class="flex flex-col gap-6">
				<!-- Source Breakdown -->
				<Card.Root>
					<Card.Header class="pb-3">
						<Card.Title class="text-base">Sumber Kunjungan</Card.Title>
					</Card.Header>
					<Card.Content>
						{#if analytics.source_stats && analytics.source_stats.length > 0}
							<div class="space-y-4">
								{#each analytics.source_stats as source}
									<div class="space-y-1">
										<div class="flex items-center justify-between text-sm">
											<div class="flex items-center gap-2">
												<Share2 class="h-3.5 w-3.5 text-muted-foreground" />
												<span class="capitalize">{source.source || 'Direct / Unknown'}</span>
											</div>
											<span class="font-medium">{source.count}</span>
										</div>
										<div class="h-2 w-full bg-secondary rounded-full overflow-hidden">
											<div
												class="h-full bg-primary"
												style="width: {(source.count / totalSources) * 100}%"
											></div>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div class="py-4 text-center text-sm text-muted-foreground">
								Data sumber belum tersedia.
							</div>
						{/if}
					</Card.Content>
				</Card.Root>

				<!-- Device Breakdown -->
				<Card.Root>
					<Card.Header class="pb-3">
						<Card.Title class="text-base">Perangkat</Card.Title>
					</Card.Header>
					<Card.Content>
						{#if analytics.device_stats && analytics.device_stats.length > 0}
							<div class="space-y-4">
								{#each analytics.device_stats as device}
									{@const Icon = getDeviceIcon(device.device_type)}
									<div class="space-y-1">
										<div class="flex items-center justify-between text-sm">
											<div class="flex items-center gap-2">
												<Icon class="h-3.5 w-3.5 text-muted-foreground" />
												<span class="capitalize">{device.device_type || 'Unknown'}</span>
											</div>
											<span class="font-medium">{device.count}</span>
										</div>
										<div class="h-2 w-full bg-secondary rounded-full overflow-hidden">
											<div
												class="h-full bg-primary"
												style="width: {(device.count / totalDevices) * 100}%"
											></div>
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div class="py-4 text-center text-sm text-muted-foreground">
								Data perangkat belum tersedia.
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			</div>
		</div>

		<!-- Recent Visits Table -->
		<Card.Root class="border-border">
			<Card.Header>
				<Card.Title class="text-xl">Kunjungan Terakhir</Card.Title>
				<Card.Description>10 interaksi kunjungan terbaru di undangan Anda.</Card.Description>
			</Card.Header>
			<Card.Content>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Tamu / Penerima</Table.Head>
							<Table.Head>Waktu</Table.Head>
							<Table.Head>Sumber</Table.Head>
							<Table.Head class="text-right">Perangkat</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#if analytics.recent_visits && analytics.recent_visits.length > 0}
							{#each analytics.recent_visits as visit}
								<Table.Row>
									<Table.Cell class="font-medium">
										{visit.guest_name ? visit.guest_name : 'Tamu Anonim'}
									</Table.Cell>
									<Table.Cell class="text-muted-foreground"
										>{formatDate(visit.created_at)}</Table.Cell
									>
									<Table.Cell>
										{#if visit.source}
											<span
												class="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold text-secondary-foreground"
											>
												{visit.source}
											</span>
										{:else}
											<span class="text-muted-foreground text-sm">-</span>
										{/if}
									</Table.Cell>
									<Table.Cell
										class="text-right text-xs text-muted-foreground flex items-center justify-end gap-1.5"
										title={visit.user_agent}
									>
										{#if visit.device_type === 'Mobile'}
											<Smartphone class="h-3.5 w-3.5 opacity-50" />
										{:else if visit.device_type === 'Desktop'}
											<Monitor class="h-3.5 w-3.5 opacity-50" />
										{:else}
											<MonitorSmartphone class="h-3.5 w-3.5 opacity-50" />
										{/if}
										{visit.device_type || 'Unknown'}
									</Table.Cell>
								</Table.Row>
							{/each}
						{:else}
							<Table.Row>
								<Table.Cell colspan={4} class="h-32 text-center">
									<div class="flex flex-col items-center justify-center text-muted-foreground">
										<Eye class="h-8 w-8 opacity-20 mb-2" />
										<p>Belum ada data kunjungan.</p>
										<p class="text-sm">Bagikan undangan Anda untuk mulai melacak analitik.</p>
									</div>
								</Table.Cell>
							</Table.Row>
						{/if}
					</Table.Body>
				</Table.Root>
			</Card.Content>
		</Card.Root>
	{/if}
</PageComposer>
