<script lang="ts">
	import { page } from '$app/stores';
	import { GuestbookService } from '$lib/services/index.js';
	import type { Guestbook, Pagination } from '$lib/types/index.js';
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Trash2, RefreshCw, MessageSquare } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import PageComposer from '$lib/components/layout/page-composer.svelte';

	let projectId = $derived($page.params.projectId!);
	let entries = $state<Guestbook[]>([]);
	let pagination = $state<Pagination | null>(null);
	let loading = $state(true);

	let alertDialogOpen = $state(false);
	let itemToDelete = $state<number | null>(null);

	let currentPage = $state(1);
	let limit = $state(20);

	async function loadEntries() {
		loading = true;
		try {
			const res = await GuestbookService.list(projectId, currentPage, limit);
			entries = res.data || [];
			pagination = res.pagination;
		} catch (e) {
			console.error('Failed to load guestbook', e);
			toast.error('Gagal memuat buku tamu');
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadEntries();
	});

	function confirmDelete(id: number) {
		itemToDelete = id;
		alertDialogOpen = true;
	}

	async function executeDelete() {
		if (!itemToDelete) return;

		try {
			await GuestbookService.delete(projectId, itemToDelete);
			toast.success('Ucapan berhasil dihapus');
			entries = entries.filter((e) => e.id !== itemToDelete);
			if (pagination) pagination.total--;
		} catch (e) {
			toast.error('Gagal menghapus ucapan');
		} finally {
			alertDialogOpen = false;
			itemToDelete = null;
		}
	}

	function handleNextPage() {
		if (pagination && currentPage < pagination.total_pages) {
			currentPage++;
			loadEntries();
		}
	}

	function handlePrevPage() {
		if (currentPage > 1) {
			currentPage--;
			loadEntries();
		}
	}

	function getInitials(name: string) {
		return name.substring(0, 2).toUpperCase();
	}

	function getAvatarColor(name: string) {
		const colors = [
			'bg-red-100 text-red-700',
			'bg-orange-100 text-orange-700',
			'bg-amber-100 text-amber-700',
			'bg-green-100 text-green-700',
			'bg-emerald-100 text-emerald-700',
			'bg-teal-100 text-teal-700',
			'bg-cyan-100 text-cyan-700',
			'bg-blue-100 text-blue-700',
			'bg-indigo-100 text-indigo-700',
			'bg-violet-100 text-violet-700',
			'bg-purple-100 text-purple-700',
			'bg-fuchsia-100 text-fuchsia-700',
			'bg-pink-100 text-pink-700',
			'bg-rose-100 text-rose-700'
		];
		let hash = 0;
		for (let i = 0; i < name.length; i++) {
			hash = name.charCodeAt(i) + ((hash << 5) - hash);
		}
		return colors[Math.abs(hash) % colors.length];
	}
</script>

<svelte:head>
	<title>Momenu | Buku Tamu</title>
</svelte:head>

<PageComposer>
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">
				Buku Tamu <span class="text-muted-foreground text-xl font-normal ml-2"
					>({pagination?.total || 0})</span
				>
			</h1>
			<p class="text-muted-foreground">Lihat dan moderasi ucapan dari tamu Anda.</p>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="outline" onclick={loadEntries} disabled={loading}>
				<RefreshCw class="mr-2 h-4 w-4 {loading ? 'animate-spin' : ''}" />
				Segarkan
			</Button>
		</div>
	</div>

	{#if loading}
		<div class="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
			{#each Array(6) as _}
				<Card.Root class="break-inside-avoid">
					<Card.Header class="flex flex-row items-center gap-4 pb-2">
						<Skeleton class="h-10 w-10 rounded-full" />
						<div class="space-y-2">
							<Skeleton class="h-4 w-[120px]" />
							<Skeleton class="h-3 w-[80px]" />
						</div>
					</Card.Header>
					<Card.Content>
						<Skeleton class="h-4 w-full mb-2" />
						<Skeleton class="h-4 w-5/6 mb-2" />
						<Skeleton class="h-4 w-4/6" />
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{:else if entries.length === 0}
		<div class="border rounded-xl bg-muted/5 border-dashed p-12">
			<Empty.Root>
				<Empty.Header>
					<Empty.Media variant="icon">
						<MessageSquare class="h-12 w-12" />
					</Empty.Media>
					<Empty.Title>Belum ada ucapan</Empty.Title>
					<Empty.Description
						>Belum ada tamu yang meninggalkan pesan di buku tamu Anda.</Empty.Description
					>
				</Empty.Header>
			</Empty.Root>
		</div>
	{:else}
		<div class="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
			{#each entries as entry (entry.id)}
				<Card.Root
					class="break-inside-avoid relative group border-2 hover:border-primary/50 transition-colors"
				>
					<div
						class="absolute top-4 right-4 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
					>
						<Button
							variant="destructive"
							size="icon"
							class="h-8 w-8 rounded-full shadow-sm"
							onclick={() => confirmDelete(entry.id)}
						>
							<Trash2 class="h-4 w-4" />
						</Button>
					</div>
					<Card.Header class="flex flex-row items-center gap-4 pb-3">
						<Avatar.Root class="h-10 w-10">
							<Avatar.Fallback class="font-semibold text-sm {getAvatarColor(entry.name)}">
								{getInitials(entry.name)}
							</Avatar.Fallback>
						</Avatar.Root>
						<div class="flex flex-col">
							<span class="font-semibold text-sm leading-tight">{entry.name}</span>
							<span class="text-xs text-muted-foreground mt-0.5">
								{new Date(entry.created_at).toLocaleString('id-ID', {
									day: 'numeric',
									month: 'short',
									year: 'numeric',
									hour: '2-digit',
									minute: '2-digit'
								})}
							</span>
						</div>
					</Card.Header>
					<Card.Content>
						<div class="bg-muted/30 p-4 rounded-xl border border-muted/50">
							<p class="text-sm leading-relaxed whitespace-pre-wrap italic">"{entry.message}"</p>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>

		<!-- Pagination -->
		{#if pagination && pagination.total_pages > 1}
			<div class="flex items-center justify-between py-4 mt-4">
				<div class="text-sm text-muted-foreground">
					Menampilkan {(currentPage - 1) * limit + 1} hingga {Math.min(
						currentPage * limit,
						pagination.total
					)} dari {pagination.total} data
				</div>
				<div class="flex gap-2">
					<Button
						variant="outline"
						size="sm"
						disabled={currentPage === 1 || loading}
						onclick={handlePrevPage}
					>
						Sebelumnya
					</Button>
					<Button
						variant="outline"
						size="sm"
						disabled={currentPage === pagination.total_pages || loading}
						onclick={handleNextPage}
					>
						Selanjutnya
					</Button>
				</div>
			</div>
		{/if}
	{/if}
</PageComposer>

<AlertDialog.Root bind:open={alertDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Hapus Ucapan Tamu?</AlertDialog.Title>
			<AlertDialog.Description>
				Tindakan ini tidak dapat dibatalkan. Pesan ini akan dihapus dari buku tamu undangan Anda.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel>Batal</AlertDialog.Cancel>
			<AlertDialog.Action
				onclick={executeDelete}
				class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
				>Hapus</AlertDialog.Action
			>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
