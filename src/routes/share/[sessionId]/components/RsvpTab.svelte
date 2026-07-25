<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import {
		CalendarCheck,
		UsersRound,
		UserCheck,
		UserX,
		Clock,
		Plus,
		MessageSquareHeart,
		Edit,
		Trash2
	} from '@lucide/svelte';
	import type { Project, RSVP } from '$lib/types/index';
	import type { SharedDataResponse } from '$lib/services/share.service';
	import { generateWaLink } from '$lib/utils/whatsapp';

	let {
		analytics,
		project,
		whatsappTemplate,
		openAddGuest,
		openEditGuest,
		setDeletingGuestId
	} = $props<{
		analytics: SharedDataResponse['analytics'];
		project: Project;
		whatsappTemplate: string;
		openAddGuest: () => void;
		openEditGuest: (guest: RSVP) => void;
		setDeletingGuestId: (id: number) => void;
	}>();

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleString('id-ID', {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getWaLink(guestName: string, guestPhone: string) {
		return generateWaLink(
			guestName,
			guestPhone,
			project?.slug,
			whatsappTemplate,
			window.location.origin
		);
	}
</script>

<div class="space-y-6 outline-none">
	<!-- RSVP KPI Cards -->
	<div class="grid gap-4 grid-cols-2">
		<!-- Total RSVP -->
		<Card.Root
			class="bg-linear-to-br from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 relative overflow-hidden"
		>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Konfirmasi RSVP</Card.Title>
				<div
					class="h-8 w-8 rounded-full bg-emerald-500/20 flex items-center justify-center"
				>
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

	<!-- RSVP Summary Row -->
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
						<p class="text-2xl sm:text-3xl font-bold">
							{analytics.rsvp_stats.not_attending}
						</p>
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

	<!-- RSVP Table -->
	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between">
			<div>
				<Card.Title class="text-xl">Daftar RSVP ({analytics.total_rsvps})</Card.Title>
			</div>
			<Button size="sm" onclick={openAddGuest}>
				<Plus class="h-4 w-4 mr-2" />
				Tambah Tamu
			</Button>
		</Card.Header>
		<Card.Content>
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
											{#if rsvp.whatsapp}
												<a
													href={getWaLink(rsvp.name, rsvp.whatsapp)}
													target="_blank"
													rel="noopener noreferrer"
													class="inline-flex h-6 w-6 items-center justify-center rounded-md bg-green-500/10 text-green-600 hover:bg-green-500/20"
													title="Kirim WA"
												>
													<MessageSquareHeart class="h-3 w-3" />
												</a>
											{/if}
											<Button
												variant="ghost"
												size="icon"
												class="h-6 w-6 text-muted-foreground hover:text-foreground"
												onclick={() => openEditGuest(rsvp)}
												title="Ubah Tamu"
											>
												<Edit class="h-3 w-3" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												class="h-6 w-6 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
												onclick={() => setDeletingGuestId(rsvp.id)}
												title="Hapus"
											>
												<Trash2 class="h-3 w-3" />
											</Button>
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
		</Card.Content>
	</Card.Root>
</div>
