<script lang="ts">
	import { page } from '$app/stores';
	import {
		ProjectService,
		RSVPService,
		GuestbookService,
		ScheduleService,
		GiftRegistryService
	} from '$lib/services/index.js';
	import type { Project, RSVPStats, Guestbook } from '$lib/types/index.js';
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import {
		ExternalLink,
		Users,
		CalendarDays,
		Gift,
		Settings,
		Activity,
		MessageSquare,
		CheckCircle2
	} from '@lucide/svelte';
	import PageComposer from '$lib/components/layout/page-composer.svelte';

	let projectId = $derived($page.params.projectId!);
	let project = $state<Project | null>(null);
	let stats = $state<RSVPStats | null>(null);
	let recentWishes = $state<Guestbook[]>([]);
	let completionScore = $state(0);

	let hasSchedules = $state(false);
	let hasGuests = $state(false);
	let hasGifts = $state(false);

	let loading = $state(true);

	onMount(async () => {
		loading = true;
		try {
			const [projRes, statsRes, wishesRes, schedulesRes, giftsRes] = await Promise.all([
				ProjectService.get(projectId),
				RSVPService.getStats(projectId),
				GuestbookService.list(projectId, 1, 3),
				ScheduleService.list(projectId),
				GiftRegistryService.list(projectId)
			]);
			project = projRes;
			stats = statsRes;
			recentWishes = wishesRes.data || [];

			hasSchedules = schedulesRes && schedulesRes.length > 0;
			hasGuests =
				statsRes &&
				(statsRes.total_pax > 0 || statsRes.attending > 0 || statsRes.not_attending > 0);
			hasGifts = giftsRes && giftsRes.length > 0;

			let score = 25; // Base project created
			if (hasSchedules) score += 25;
			if (hasGuests) score += 25;
			if (hasGifts) score += 25;
			completionScore = score;
		} catch (e) {
			console.error('Failed to load dashboard data', e);
		} finally {
			loading = false;
		}
	});

	function getStatusBadge(status: string) {
		switch (status) {
			case 'draft':
				return { label: 'Draf', class: 'bg-amber-500/10 text-amber-600' };
			case 'published':
				return { label: 'Terbit', class: 'bg-emerald-500/10 text-emerald-600' };
			default:
				return { label: status, class: 'bg-muted text-muted-foreground' };
		}
	}

	function getInitials(name: string) {
		return name.substring(0, 2).toUpperCase();
	}

	function getAvatarColor(name: string) {
		const colors = [
			'bg-red-100 text-red-700',
			'bg-blue-100 text-blue-700',
			'bg-emerald-100 text-emerald-700',
			'bg-amber-100 text-amber-700',
			'bg-purple-100 text-purple-700',
			'bg-pink-100 text-pink-700'
		];
		let hash = 0;
		for (let i = 0; i < name.length; i++) {
			hash = name.charCodeAt(i) + ((hash << 5) - hash);
		}
		return colors[Math.abs(hash) % colors.length];
	}
</script>

<svelte:head>
	<title>Momenu | Dasbor Acara</title>
</svelte:head>

<PageComposer>
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
		<div>
			<div class="flex items-center gap-3">
				<h1 class="text-3xl font-bold tracking-tight">Dasbor Acara</h1>
				{#if project}
					{@const badge = getStatusBadge(project.status)}
					<span
						class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold {badge.class}"
					>
						{badge.label}
					</span>
				{/if}
			</div>
			<p class="text-muted-foreground mt-1">
				Mengelola acara: <span class="font-medium text-foreground">{project?.title || '...'}</span>
			</p>
		</div>
		<div class="flex items-center gap-3">
			<Button variant="outline" href={`/app/project/${projectId}/settings`}>
				<Settings class="mr-2 h-4 w-4" />
				Pengaturan
			</Button>
			<Button variant="secondary" href={`/preview/${projectId}`} target="_blank">
				Pratinjau
				<ExternalLink class="ml-2 h-4 w-4" />
			</Button>
			{#if project?.status === 'published'}
				<Button href={`/${project.slug}`} target="_blank">
					Buka Undangan
					<ExternalLink class="ml-2 h-4 w-4" />
				</Button>
			{/if}
		</div>
	</div>

	<div class="grid gap-4 md:grid-cols-3 lg:grid-cols-5 mt-2">
		<Card.Root class="bg-primary/5 border-primary/20">
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Progress Acara</Card.Title>
				<Activity class="h-4 w-4 text-primary" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold text-primary">
					{#if loading}
						<Skeleton class="h-8 w-16" />
					{:else}
						{completionScore}%
					{/if}
				</div>
				<div class="mt-2">
					{#if loading}
						<Skeleton class="h-2 w-full rounded-full" />
					{:else}
						<Progress value={completionScore} class="h-2" />
					{/if}
				</div>
				<p class="text-xs text-muted-foreground mt-2">Kelengkapan data undangan</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Total Kehadiran (Pax)</Card.Title>
				<Users class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">
					{#if loading}
						<Skeleton class="h-8 w-16" />
					{:else}
						{stats?.total_pax || 0}
					{/if}
				</div>
				<p class="text-xs text-muted-foreground mt-1">
					Dari {stats?.attending || 0} tamu yang hadir
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Tamu Hadir</Card.Title>
				<CalendarDays class="h-4 w-4 text-emerald-500" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
					{#if loading}
						<Skeleton class="h-8 w-16" />
					{:else}
						{stats?.attending || 0}
					{/if}
				</div>
				<p class="text-xs text-muted-foreground mt-1">Konfirmasi kehadiran</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Menunggu Balasan</Card.Title>
				<Users class="h-4 w-4 text-amber-500" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold text-amber-600 dark:text-amber-500">
					{#if loading}
						<Skeleton class="h-8 w-16" />
					{:else}
						{stats?.pending || 0}
					{/if}
				</div>
				<p class="text-xs text-muted-foreground mt-1">Belum konfirmasi</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Tidak Hadir</Card.Title>
				<Users class="h-4 w-4 text-muted-foreground" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold text-muted-foreground">
					{#if loading}
						<Skeleton class="h-8 w-16" />
					{:else}
						{stats?.not_attending || 0}
					{/if}
				</div>
				<p class="text-xs text-muted-foreground mt-1">Konfirmasi tidak hadir</p>
			</Card.Content>
		</Card.Root>
	</div>

	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-4">
		<div class="col-span-4 space-y-4">
			<Card.Root>
				<Card.Header>
					<Card.Title>Langkah Selanjutnya</Card.Title>
					<Card.Description>Lengkapi data acara Anda untuk menerbitkan undangan.</Card.Description>
				</Card.Header>
				<Card.Content class="grid gap-4">
					<a
						href={`/app/project/${projectId}/schedules`}
						class="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors {hasSchedules
							? 'opacity-60 grayscale'
							: ''}"
					>
						<div class="bg-primary/10 text-primary p-2 rounded-full relative">
							{#if hasSchedules}
								<div class="absolute -top-1 -right-1 bg-background rounded-full">
									<CheckCircle2 class="h-4 w-4 text-emerald-500" />
								</div>
							{/if}
							<CalendarDays class="h-5 w-5" />
						</div>
						<div class="flex-1">
							<h4 class="font-semibold text-sm {hasSchedules ? 'line-through' : ''}">
								Tambahkan Acara
							</h4>
							<p class="text-sm text-muted-foreground">Isi detail waktu dan tempat acara</p>
						</div>
					</a>
					<a
						href={`/app/project/${projectId}/guests`}
						class="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors {hasGuests
							? 'opacity-60 grayscale'
							: ''}"
					>
						<div class="bg-primary/10 text-primary p-2 rounded-full relative">
							{#if hasGuests}
								<div class="absolute -top-1 -right-1 bg-background rounded-full">
									<CheckCircle2 class="h-4 w-4 text-emerald-500" />
								</div>
							{/if}
							<Users class="h-5 w-5" />
						</div>
						<div class="flex-1">
							<h4 class="font-semibold text-sm {hasGuests ? 'line-through' : ''}">Kelola Tamu</h4>
							<p class="text-sm text-muted-foreground">Tambah tamu dan atur undangan</p>
						</div>
					</a>
					<a
						href={`/app/project/${projectId}/gifts`}
						class="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/50 transition-colors {hasGifts
							? 'opacity-60 grayscale'
							: ''}"
					>
						<div class="bg-primary/10 text-primary p-2 rounded-full relative">
							{#if hasGifts}
								<div class="absolute -top-1 -right-1 bg-background rounded-full">
									<CheckCircle2 class="h-4 w-4 text-emerald-500" />
								</div>
							{/if}
							<Gift class="h-5 w-5" />
						</div>
						<div class="flex-1">
							<h4 class="font-semibold text-sm {hasGifts ? 'line-through' : ''}">
								Rekening & Kado
							</h4>
							<p class="text-sm text-muted-foreground">Atur penerimaan kado/amplop digital</p>
						</div>
					</a>
				</Card.Content>
			</Card.Root>
		</div>

		<div class="col-span-3 space-y-4">
			<Card.Root>
				<Card.Header class="pb-2">
					<div class="flex items-center justify-between">
						<Card.Title class="flex items-center gap-2">
							<MessageSquare class="h-5 w-5 text-muted-foreground" />
							Ucapan Terbaru
						</Card.Title>
						<Button variant="ghost" size="sm" href={`/app/project/${projectId}/guestbook`}>
							Lihat Semua
						</Button>
					</div>
				</Card.Header>
				<Card.Content>
					<div class="space-y-4 mt-2">
						{#if loading}
							<Skeleton class="h-16 w-full rounded-lg" />
							<Skeleton class="h-16 w-full rounded-lg" />
						{:else if recentWishes.length === 0}
							<div class="text-center p-6 bg-muted/20 rounded-lg border border-dashed">
								<p class="text-sm text-muted-foreground">Belum ada ucapan dari tamu.</p>
							</div>
						{:else}
							{#each recentWishes as wish}
								<div class="p-3 bg-muted/30 rounded-lg border flex gap-3 items-start">
									<Avatar.Root class="h-8 w-8 mt-0.5 shrink-0">
										<Avatar.Fallback class="text-xs font-semibold {getAvatarColor(wish.name)}">
											{getInitials(wish.name)}
										</Avatar.Fallback>
									</Avatar.Root>
									<div class="flex-1 min-w-0">
										<p class="text-sm font-semibold truncate">{wish.name}</p>
										<p class="text-sm text-muted-foreground line-clamp-2 mt-0.5">
											"{wish.message}"
										</p>
									</div>
								</div>
							{/each}
						{/if}
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Info Acara</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="space-y-4">
						{#if loading}
							<Skeleton class="h-4 w-full" />
							<Skeleton class="h-4 w-3/4" />
							<Skeleton class="h-4 w-5/6" />
						{:else}
							<div class="flex justify-between items-center border-b pb-2">
								<span class="text-sm text-muted-foreground">Tema</span>
								<span class="text-sm font-medium capitalize"
									>{project?.theme_id?.replace(/_/g, ' ') || '-'}</span
								>
							</div>
							<div class="flex justify-between items-center border-b pb-2">
								<span class="text-sm text-muted-foreground">Tipe Acara</span>
								<span class="text-sm font-medium capitalize">{project?.event_type || '-'}</span>
							</div>
							<div class="flex justify-between items-center pb-2">
								<span class="text-sm text-muted-foreground">Dibuat Pada</span>
								<span class="text-sm font-medium"
									>{project?.created_at
										? new Date(project.created_at).toLocaleDateString('id-ID', {
												day: 'numeric',
												month: 'long',
												year: 'numeric'
											})
										: '-'}</span
								>
							</div>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</PageComposer>
