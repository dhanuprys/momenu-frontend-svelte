<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import { invalidateAll } from '$app/navigation';
	import { ShareService } from '$lib/services/share.service';
	import { toast } from 'svelte-sonner';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import AppLogo from '$lib/components/brand/app-logo.svelte';
	import {
		ShieldCheck,
		CalendarDays,
		AppWindow,
		RotateCw,
		Loader2	} from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	import RsvpTab from './components/RsvpTab.svelte';
	import WishesTab from './components/WishesTab.svelte';
	import AnalyticsTab from './components/AnalyticsTab.svelte';
	import type { RSVP } from '$lib/types/index';
	
	let { data }: { data: PageData } = $props();

	let project = $derived(data.sharedData?.project);
	let analytics = $derived(data.sharedData?.analytics);
	let wishes = $derived(analytics?.wishes || []);

	let activeTab = $state('rsvp');

	let isAddingGuest = $state(false);
	let isAddGuestDialogOpen = $state(false);
	let editingGuestId = $state<number | null>(null);
	let newGuestName = $state('');
	let newGuestWhatsapp = $state('');

	let deletingGuestId = $state<number | null>(null);
	let isDeletingGuest = $state(false);

	let whatsappTemplate = $derived(project?.feature_toggle?.whatsapp_template || '');

	// ── Helper functions ────────────────────────────────────────

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

	function openAddGuest() {
		editingGuestId = null;
		newGuestName = '';
		newGuestWhatsapp = '';
		isAddGuestDialogOpen = true;
	}

	function openEditGuest(guest: RSVP) {
		editingGuestId = guest.id;
		newGuestName = guest.name;
		newGuestWhatsapp = guest.whatsapp || '';
		isAddGuestDialogOpen = true;
	}

	async function handleSubmitGuest(e: Event) {
		e.preventDefault();
		if (!newGuestName.trim()) {
			toast.error('Nama tamu wajib diisi');
			return;
		}

		isAddingGuest = true;
		try {
			if (editingGuestId) {
				await ShareService.updateGuest(
					$page.params.sessionId!,
					editingGuestId,
					newGuestName.trim(),
					newGuestWhatsapp.trim() || null
				);
				toast.success('Tamu berhasil diubah');
			} else {
				await ShareService.addGuest(
					$page.params.sessionId!,
					newGuestName.trim(),
					newGuestWhatsapp.trim() || null
				);
				toast.success('Tamu berhasil ditambahkan');
			}

			await invalidateAll();
			isAddGuestDialogOpen = false;
			newGuestName = '';
			newGuestWhatsapp = '';
		} catch (error) {
			toast.error((error as any).response?.data?.message || 'Gagal menyimpan tamu');
		} finally {
			isAddingGuest = false;
		}
	}

	async function handleDeleteGuest() {
		if (!deletingGuestId) return;

		isDeletingGuest = true;
		try {
			await ShareService.deleteGuest($page.params.sessionId!, deletingGuestId);
			await invalidateAll();
			toast.success('Tamu berhasil dihapus');
			deletingGuestId = null;
		} catch (error) {
			toast.error((error as any).response?.data?.message || 'Gagal menghapus tamu');
		} finally {
			isDeletingGuest = false;
		}
	}
</script>

<svelte:head>
	<title>{project?.title || 'Akses Simpel'} - Akses Simpel</title>
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
				<p class="text-sm text-muted-foreground mb-6 leading-relaxed max-w-70">
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
					Akses Simpel
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

			<!-- ── Tabs Layout ──────────────────────────────────────────── -->
			<Tabs.Root bind:value={activeTab} class="w-full">
				<Tabs.List class="grid w-full grid-cols-3 mb-6 bg-muted/50 p-1 rounded-xl">
					<Tabs.Trigger value="rsvp" class="rounded-lg">RSVP</Tabs.Trigger>
					<Tabs.Trigger value="wishes" class="rounded-lg">Ucapan & Doa</Tabs.Trigger>
					<Tabs.Trigger value="analytics" class="rounded-lg">Statistik</Tabs.Trigger>
				</Tabs.List>

				<!-- ── RSVP Tab ───────────────────────────────────────────── -->
				<Tabs.Content value="rsvp" class="outline-none">
					<RsvpTab
						{analytics}
						{project}
						{whatsappTemplate}
						{openAddGuest}
						{openEditGuest}
						setDeletingGuestId={(id) => (deletingGuestId = id)}
					/>
				</Tabs.Content>

				<!-- ── Wishes Tab ─────────────────────────────────────────── -->
				<Tabs.Content value="wishes" class="outline-none">
					<WishesTab {wishes} />
				</Tabs.Content>

				<!-- ── Analytics Tab ──────────────────────────────────────── -->
				<Tabs.Content value="analytics" class="outline-none">
					<AnalyticsTab {analytics} />
				</Tabs.Content>
			</Tabs.Root>

			<!-- ── Footer ─────────────────────────────────────────────── -->
			<div class="text-center py-4">
				<p class="text-xs text-muted-foreground">
					Halaman ini dibagikan via tautan akses. Data diperbarui secara real-time.
				</p>
			</div>
		</main>
	</div>
{/if}

<!-- Add Guest Dialog -->
<Dialog.Root bind:open={isAddGuestDialogOpen}>
	<Dialog.Content class="sm:max-w-106.25">
		<Dialog.Header>
			<Dialog.Title>{editingGuestId ? 'Ubah Tamu' : 'Tambah Tamu'}</Dialog.Title>
			<Dialog.Description>
				{editingGuestId ? 'Ubah informasi tamu undangan ini.' : 'Tambahkan tamu undangan baru secara manual ke dalam daftar.'}
			</Dialog.Description>
		</Dialog.Header>
		<form onsubmit={handleSubmitGuest} class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="guest-name">
					Nama Tamu <span class="text-destructive">*</span>
				</Label>
				<Input
					id="guest-name"
					bind:value={newGuestName}
					placeholder="Masukkan nama tamu..."
					required
					autocomplete="off"
				/>
			</div>
			<div class="grid gap-2">
				<Label for="whatsapp">No. WhatsApp (Opsional)</Label>
				<Input
					id="whatsapp"
					bind:value={newGuestWhatsapp}
					placeholder="Misal: 08123456789"
					type="tel"
					autocomplete="off"
				/>
				<p class="text-xs text-muted-foreground">
					Pastikan nomor yang dimasukkan adalah nomor WhatsApp aktif.
				</p>
			</div>
			<Dialog.Footer class="mt-4">
				<Dialog.Close>
					<Button type="button" variant="outline" disabled={isAddingGuest}>Batal</Button>
				</Dialog.Close>
				<Button type="submit" disabled={isAddingGuest || !newGuestName.trim()}>
					{#if isAddingGuest}
						<Loader2 class="h-4 w-4 mr-2 animate-spin" />
						Menyimpan...
					{:else}
						Simpan Tamu
					{/if}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<AlertDialog.Root
	open={!!deletingGuestId}
	onOpenChange={(open) => !open && (deletingGuestId = null)}
>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Hapus Tamu?</AlertDialog.Title>
			<AlertDialog.Description>
				Tindakan ini tidak dapat dibatalkan. Data tamu akan dihapus dari sistem.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel disabled={isDeletingGuest}>Batal</AlertDialog.Cancel>
			<AlertDialog.Action
				class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
				onclick={handleDeleteGuest}
				disabled={isDeletingGuest}
			>
				{isDeletingGuest ? 'Menghapus...' : 'Hapus'}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
