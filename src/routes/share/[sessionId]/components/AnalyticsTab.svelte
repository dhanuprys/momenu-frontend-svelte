<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import {
		Eye,
		Users,
		TrendingUp,
		Share2,
		Smartphone,
		Monitor,
		MonitorSmartphone
	} from '@lucide/svelte';
	import type { SharedDataResponse } from '$lib/services/share.service';

	let { analytics } = $props<{ analytics: SharedDataResponse['analytics'] }>();

	let maxDailyCount = $derived(
		analytics?.daily_visits?.length
			? Math.max(...(analytics?.daily_visits?.map((d: { count: number }) => d.count) ?? []), 1)
			: 1
	);

	let totalSources = $derived(
		analytics?.source_stats?.reduce((acc: number, curr: { count: number }) => acc + curr.count, 0) || 0
	);

	let totalDevices = $derived(
		analytics?.device_stats?.reduce((acc: number, curr: { count: number }) => acc + curr.count, 0) || 0
	);

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
</script>

<div class="space-y-6 outline-none">
	<!-- Analytics KPI Cards -->
	<div class="grid gap-4 grid-cols-2">
		<!-- Total Visits -->
		<Card.Root class="bg-linear-to-br from-primary/10 to-primary/5 border-primary/20">
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Kunjungan</Card.Title>
				<div class="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
					<Eye class="h-4 w-4 text-primary" />
				</div>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl sm:text-3xl font-bold">{analytics.total_visits}</div>
				<p class="text-[10px] sm:text-xs text-muted-foreground mt-1 leading-tight">
					Total kunjungan halaman
				</p>
			</Card.Content>
		</Card.Root>

		<!-- Unique Guests -->
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
				<div class="text-2xl sm:text-3xl font-bold">{analytics.unique_guests}</div>
				<p class="text-[10px] sm:text-xs text-muted-foreground mt-1 leading-tight">
					Berdasarkan perangkat / IP
				</p>
			</Card.Content>
			{#if analytics.total_visits > 0}
				<div
					class="absolute bottom-0 left-0 h-1 bg-blue-500/50 transition-all duration-700"
					style="width: {Math.min(
						(analytics.unique_guests / analytics.total_visits) * 100,
						100
					)}%"
				></div>
			{/if}
		</Card.Root>
	</div>

	<!-- Charts Row: Daily Visits + Source/Device -->
	<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
		<!-- Daily Visits Chart -->
		<Card.Root class="lg:col-span-2 flex flex-col">
			<Card.Header>
				<div class="flex items-center gap-2">
					<TrendingUp class="h-4 w-4 text-muted-foreground" />
					<Card.Title>Kunjungan 7 Hari Terakhir</Card.Title>
				</div>
				<Card.Description>Tren kunjungan harian ke undangan Anda.</Card.Description>
			</Card.Header>
			<Card.Content class="flex-1 flex flex-col justify-end pt-4">
				{#if analytics.daily_visits && analytics.daily_visits.length > 0}
					<div class="flex items-end justify-between h-48 gap-2 w-full">
						{#each analytics.daily_visits as day}
							<div class="flex flex-col items-center gap-2 flex-1 group h-full">
								<span
									class="text-xs font-medium text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
									>{day.count}</span
								>
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

		<!-- Source & Device Breakdown -->
		<div class="flex flex-col sm:grid sm:grid-cols-2 lg:flex lg:flex-col gap-6">
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
											class="h-full bg-primary transition-all duration-500"
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
											class="h-full bg-primary transition-all duration-500"
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
	<Card.Root>
		<Card.Header>
			<Card.Title class="text-xl">Kunjungan Terakhir</Card.Title>
		</Card.Header>
		<Card.Content>
			{#if analytics.recent_visits && analytics.recent_visits.length > 0}
				<div class="rounded-md border overflow-x-auto">
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
							{#each analytics.recent_visits as visit (visit.id)}
								<Table.Row>
									<Table.Cell class="font-medium">
										{visit.guest_name || 'Tamu Anonim'}
									</Table.Cell>
									<Table.Cell class="text-muted-foreground">
										{formatDate(visit.created_at)}
									</Table.Cell>
									<Table.Cell>
										{#if visit.source}
											<Badge variant="secondary" class="text-xs">{visit.source}</Badge>
										{:else}
											<span class="text-muted-foreground text-sm">-</span>
										{/if}
									</Table.Cell>
									<Table.Cell class="text-right text-xs text-muted-foreground">
										<span class="flex items-center justify-end gap-1.5">
											{#if visit.device_type === 'Mobile'}
												<Smartphone class="h-3.5 w-3.5 opacity-50" />
											{:else if visit.device_type === 'Desktop'}
												<Monitor class="h-3.5 w-3.5 opacity-50" />
											{:else}
												<MonitorSmartphone class="h-3.5 w-3.5 opacity-50" />
											{/if}
											{visit.device_type || 'Unknown'}
										</span>
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			{:else}
				<div class="flex flex-col items-center justify-center py-12 text-center">
					<Eye class="h-10 w-10 text-muted-foreground/30 mb-3" />
					<p class="text-muted-foreground">Belum ada data kunjungan.</p>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
