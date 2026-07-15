<script lang="ts">
	import type { PageData } from './$types';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import AppLogo from '$lib/components/brand/app-logo.svelte';
	import {
		Eye,
		Users,
		CalendarCheck,
		UserCheck,
		UserX,
		Clock,
		UsersRound,
		Share2,
		Smartphone,
		Monitor,
		MonitorSmartphone,
		ShieldCheck,
		CalendarDays,
		TrendingUp,
		AppWindow,
		RotateCw
	} from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	let { data }: { data: PageData } = $props();

	let project = $derived(data.sharedData?.project);
	let analytics = $derived(data.sharedData?.analytics);

	// ── Derived computations ────────────────────────────────────

	let maxDailyCount = $derived(
		analytics?.daily_visits?.length
			? Math.max(...analytics?.daily_visits.map((d) => d.count), 1)
			: 1
	);

	let totalSources = $derived(
		analytics?.source_stats?.reduce((acc, curr) => acc + curr.count, 0) || 0
	);

	let totalDevices = $derived(
		analytics?.device_stats?.reduce((acc, curr) => acc + curr.count, 0) || 0
	);

	let rsvpAttendanceRate = $derived(() => {
		if (!analytics?.rsvp_stats) return 0;
		const total = analytics.rsvp_stats.attending + analytics.rsvp_stats.not_attending;
		if (total === 0) return 0;
		return Math.round((analytics.rsvp_stats.attending / total) * 100);
	});

	let attendingRsvps = $derived(
		analytics?.rsvps?.filter((r) => r.attending && r.is_responded) || []
	);

	let notAttendingRsvps = $derived(
		analytics?.rsvps?.filter((r) => !r.attending && r.is_responded) || []
	);

	let pendingRsvps = $derived(analytics?.rsvps?.filter((r) => !r.is_responded) || []);

	// ── Helper functions ────────────────────────────────────────

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

	function getSessionExpiryText() {
		const session = analytics?.session;
		if (!session?.expires_at) return 'Tidak ada batas waktu';
		const expiresAt = new Date(session.expires_at);
		const now = new Date();
		if (expiresAt < now) return 'Sudah kadaluarsa';
		const diffMs = expiresAt.getTime() - now.getTime();
		const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
		if (diffDays === 1) return 'Berakhir besok';
		return `${diffDays} hari lagi`;
	}
</script>

<svelte:head>
	<title>{project?.title || 'Shared Analytics'} - Shared Analytics</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

{#if data.isDraft}
	<div class="min-h-screen bg-muted/30 flex items-center justify-center p-4">
		<Card.Root class="max-w-md w-full border-dashed shadow-xs">
			<Card.Content class="pt-8 pb-8 flex flex-col items-center text-center">
				<div class="h-16 w-16 bg-muted/50 rounded-full flex items-center justify-center mb-5">
					<AppWindow class="h-8 w-8 text-muted-foreground" />
				</div>
				<h2 class="text-xl font-bold tracking-tight mb-2">Acara Masih Dalam Draf</h2>
				<p class="text-sm text-muted-foreground mb-6 leading-relaxed max-w-[280px]">
					Halaman ini belum dipublikasikan oleh pemilik acara. Data analitik tidak dapat ditampilkan
					saat ini.
				</p>
				<Button class="gap-2 w-full sm:w-auto" onclick={() => window.location.reload()}>
					<RotateCw class="h-4 w-4" />
					Muat Ulang Halaman
				</Button>
			</Card.Content>
		</Card.Root>
	</div>
{:else if project && analytics}
	<div class="min-h-screen bg-muted/30">
		<!-- Header -->
		<header
			class="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10"
		>
			<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
				<AppLogo />
				<Badge variant="outline" class="gap-1.5 text-xs text-muted-foreground font-normal">
					<ShieldCheck class="h-3.5 w-3.5" />
					Shared Analytics
				</Badge>
			</div>
		</header>

		<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
			<!-- ── Project Details ────────────────────────────────────── -->
			<div
				class="flex flex-col sm:flex-row justify-between gap-3 sm:gap-6 bg-card rounded-xl border p-4 shadow-xs"
			>
				<div class="min-w-0 flex-1 space-y-1.5">
					<div class="flex items-start justify-between gap-2">
						<h1 class="text-lg sm:text-2xl font-bold tracking-tight leading-tight truncate">
							{project.title}
						</h1>
						<Badge variant="secondary" class="capitalize text-[10px] py-0 h-5 shrink-0 sm:hidden">
							{project.event_type.replace('_', ' ')}
						</Badge>
					</div>
					<div class="flex items-center flex-wrap gap-2 text-sm text-muted-foreground">
						<Badge
							variant="secondary"
							class="capitalize text-[10px] py-0 h-5 hidden sm:inline-flex"
						>
							{project.event_type.replace('_', ' ')}
						</Badge>
						<span class="hidden sm:inline text-muted-foreground/50">•</span>
						<span class="truncate text-xs sm:text-sm bg-muted/50 px-2 py-0.5 rounded-md font-medium"
							>momenu.id/{project.slug}</span
						>
					</div>
				</div>

				<div
					class="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center gap-1.5 pt-3 sm:pt-0 border-t sm:border-t-0 border-border/50 shrink-0"
				>
					<span
						class="text-[11px] sm:text-xs text-muted-foreground uppercase tracking-wider font-medium"
						>Akses Tautan</span
					>
					<Badge variant="outline" class="gap-1.5 text-xs font-normal bg-background">
						<CalendarDays class="h-3 w-3 text-muted-foreground" />
						{getSessionExpiryText()}
					</Badge>
				</div>
			</div>

			<!-- ── KPI Cards ──────────────────────────────────────────── -->
			<div class="grid gap-4 grid-cols-2 lg:grid-cols-4">
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

				<!-- Total RSVP -->
				<Card.Root
					class="bg-linear-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 relative overflow-hidden"
				>
					<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
						<Card.Title class="text-sm font-medium">Konfirmasi RSVP</Card.Title>
						<div class="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
							<CalendarCheck class="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
						</div>
					</Card.Header>
					<Card.Content>
						<div class="text-2xl sm:text-3xl font-bold">
							{analytics.rsvp_stats.attending + analytics.rsvp_stats.not_attending}
						</div>
						<p class="text-[10px] sm:text-xs text-muted-foreground mt-1 leading-tight">
							Tamu sudah merespon
						</p>
					</Card.Content>
					{#if analytics.unique_guests > 0}
						<div
							class="absolute bottom-0 left-0 h-1 bg-emerald-500/50 transition-all duration-700"
							style="width: {((analytics.rsvp_stats.attending +
								analytics.rsvp_stats.not_attending) /
								analytics.unique_guests) *
								100}%"
						></div>
					{/if}
				</Card.Root>

				<!-- Total Pax -->
				<Card.Root class="bg-linear-to-br from-amber-500/10 to-amber-500/5 border-amber-500/20">
					<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
						<Card.Title class="text-sm font-medium">Estimasi Tamu</Card.Title>
						<div class="h-8 w-8 rounded-full bg-amber-500/20 flex items-center justify-center">
							<UsersRound class="h-4 w-4 text-amber-600 dark:text-amber-400" />
						</div>
					</Card.Header>
					<Card.Content>
						<div class="text-2xl sm:text-3xl font-bold">{analytics.rsvp_stats.total_pax}</div>
						<p class="text-[10px] sm:text-xs text-muted-foreground mt-1 leading-tight">
							Total pax yang hadir
						</p>
					</Card.Content>
				</Card.Root>
			</div>

			<!-- ── RSVP Summary Row ───────────────────────────────────── -->
			<Card.Root class="overflow-hidden shadow-xs">
				<Card.Content class="p-0">
					<div class="flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x">
						<div class="flex-1 p-5 flex items-center gap-4">
							<div
								class="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0"
							>
								<UserCheck class="h-6 w-6 text-green-600 dark:text-green-400" />
							</div>
							<div>
								<p class="text-sm font-medium text-muted-foreground">Hadir</p>
								<p class="text-2xl sm:text-3xl font-bold">{analytics.rsvp_stats.attending}</p>
							</div>
						</div>
						<div class="flex-1 p-5 flex items-center gap-4">
							<div
								class="h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0"
							>
								<UserX class="h-6 w-6 text-red-600 dark:text-red-400" />
							</div>
							<div>
								<p class="text-sm font-medium text-muted-foreground">Tidak Hadir</p>
								<p class="text-2xl sm:text-3xl font-bold">{analytics.rsvp_stats.not_attending}</p>
							</div>
						</div>
						<div class="flex-1 p-5 flex items-center gap-4">
							<div
								class="h-12 w-12 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center shrink-0"
							>
								<Clock class="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
							</div>
							<div>
								<p class="text-sm font-medium text-muted-foreground">Belum Respon</p>
								<p class="text-2xl sm:text-3xl font-bold">{analytics.rsvp_stats.pending}</p>
							</div>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- ── Charts Row: Daily Visits + Source/Device ────────────── -->
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

			<!-- ── Tabbed Data: RSVP List + Recent Visits ──────────────── -->
			<Card.Root>
				<Tabs.Root value="rsvp">
					<Card.Header>
						<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
							<Card.Title class="text-xl">Data Detail</Card.Title>
							<div class="w-full sm:w-auto overflow-x-auto pb-1 -mb-1">
								<Tabs.List class="flex w-fit min-w-full sm:min-w-0">
									<Tabs.Trigger class="flex-1 sm:flex-none" value="rsvp"
										>Daftar RSVP ({analytics.total_rsvps})</Tabs.Trigger
									>
									<Tabs.Trigger class="flex-1 sm:flex-none" value="visits"
										>Kunjungan Terakhir</Tabs.Trigger
									>
								</Tabs.List>
							</div>
						</div>
					</Card.Header>

					<Card.Content>
						<!-- RSVP Tab -->
						<Tabs.Content value="rsvp">
							{#if analytics.rsvps && analytics.rsvps.length > 0}
								<div class="rounded-md border overflow-x-auto">
									<Table.Root>
										<Table.Header>
											<Table.Row>
												<Table.Head>Nama Tamu</Table.Head>
												<Table.Head>Status</Table.Head>
												<Table.Head class="text-center">Jumlah Tamu</Table.Head>
												<Table.Head>Pesan</Table.Head>
												<Table.Head class="text-right">Tanggal</Table.Head>
											</Table.Row>
										</Table.Header>
										<Table.Body>
											{#each analytics.rsvps as rsvp (rsvp.id)}
												<Table.Row>
													<Table.Cell class="font-medium">
														<div class="flex items-center gap-2">
															{rsvp.name}
															{#if !rsvp.is_responded}
																<Badge variant="outline" class="text-xs">Belum Buka</Badge>
															{/if}
														</div>
													</Table.Cell>
													<Table.Cell>
														{#if !rsvp.is_responded}
															<Badge variant="secondary" class="gap-1">
																<Clock class="h-3 w-3" />
																Pending
															</Badge>
														{:else if rsvp.attending}
															<Badge
																class="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 gap-1"
															>
																<UserCheck class="h-3 w-3" />
																Hadir
															</Badge>
														{:else}
															<Badge variant="destructive" class="gap-1">
																<UserX class="h-3 w-3" />
																Tidak Hadir
															</Badge>
														{/if}
													</Table.Cell>
													<Table.Cell class="text-center">
														{rsvp.attending ? rsvp.guest_count : '-'}
													</Table.Cell>
													<Table.Cell class="max-w-[200px]">
														{#if rsvp.special_message}
															<p
																class="text-sm text-muted-foreground truncate"
																title={rsvp.special_message}
															>
																{rsvp.special_message}
															</p>
														{:else}
															<span class="text-muted-foreground text-sm">-</span>
														{/if}
													</Table.Cell>
													<Table.Cell class="text-right text-sm text-muted-foreground">
														{formatDate(rsvp.created_at)}
													</Table.Cell>
												</Table.Row>
											{/each}
										</Table.Body>
									</Table.Root>
								</div>
							{:else}
								<div class="flex flex-col items-center justify-center py-12 text-center">
									<CalendarCheck class="h-10 w-10 text-muted-foreground/30 mb-3" />
									<p class="text-muted-foreground">Belum ada data RSVP.</p>
								</div>
							{/if}
						</Tabs.Content>

						<!-- Recent Visits Tab -->
						<Tabs.Content value="visits">
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
						</Tabs.Content>
					</Card.Content>
				</Tabs.Root>
			</Card.Root>

			<!-- ── Footer ─────────────────────────────────────────────── -->
			<div class="text-center py-4">
				<p class="text-xs text-muted-foreground">
					Halaman ini dibagikan via tautan akses. Data diperbarui secara real-time.
				</p>
			</div>
		</main>
	</div>
{/if}
