<script lang="ts">
	import { page } from '$app/stores';
	import { ShareService } from '$lib/services/index.js';
	import type { ShareSession } from '$lib/services/share.service.js';
	import { onMount } from 'svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import PageComposer from '$lib/components/layout/page-composer.svelte';
	import { Share2, Plus, Copy, Trash2, RefreshCw } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	let projectId = $derived($page.params.projectId!);
	let sessions = $state<ShareSession[]>([]);
	let isLoading = $state(true);
	let isCreating = $state(false);

	let revokeSessionId = $state<string | null>(null);
	let isRevoking = $state(false);

	let activeSessionsCount = $derived(sessions.filter((s) => !s.is_revoked).length);
	let isMaxLimitReached = $derived(activeSessionsCount >= 5);

	let isCreateDialogOpen = $state(false);
	let newSessionName = $state('');
	let selectedExpiry = $state('never'); // never, 1d, 7d, 30d

	onMount(async () => {
		await loadSessions();
	});

	async function loadSessions() {
		isLoading = true;
		try {
			sessions = await ShareService.listSessions(projectId);
		} catch (error: any) {
			toast.error('Gagal memuat sesi berbagi: ' + (error.response?.data?.message || error.message));
		} finally {
			isLoading = false;
		}
	}

	function openCreateDialog() {
		if (isMaxLimitReached) {
			toast.error('Batas maksimal 5 tautan aktif telah tercapai');
			return;
		}
		selectedExpiry = 'never';
		newSessionName = '';
		isCreateDialogOpen = true;
	}

	async function submitCreateSession() {
		if (!newSessionName.trim()) {
			toast.error('Nama atau Catatan wajib diisi');
			return;
		}

		isCreating = true;

		let expiresAt: string | null = null;
		if (selectedExpiry !== 'never') {
			const days = parseInt(selectedExpiry.replace('d', ''));
			const date = new Date();
			date.setDate(date.getDate() + days);
			expiresAt = date.toISOString();
		}

		try {
			const newSession = await ShareService.createSession(
				projectId,
				newSessionName.trim(),
				expiresAt
			);
			sessions = [newSession, ...sessions];
			toast.success('Tautan akses berhasil dibuat');
			isCreateDialogOpen = false;
		} catch (error: any) {
			toast.error(
				'Gagal membuat sesi berbagi: ' + (error.response?.data?.message || error.message)
			);
		} finally {
			isCreating = false;
		}
	}

	async function handleRevokeSession() {
		if (!revokeSessionId) return;
		isRevoking = true;
		try {
			await ShareService.revokeSession(projectId, revokeSessionId);
			toast.success('Sesi akses berhasil dicabut');
			sessions = sessions.map((s) =>
				s.session_id === revokeSessionId ? { ...s, is_revoked: true } : s
			);
			revokeSessionId = null;
		} catch (error: any) {
			toast.error(
				'Gagal mencabut sesi berbagi: ' + (error.response?.data?.message || error.message)
			);
		} finally {
			isRevoking = false;
		}
	}

	function copyLink(sessionId: string) {
		const url = `${window.location.origin}/share/${sessionId}`;
		navigator.clipboard
			.writeText(url)
			.then(() => {
				toast.success('Tautan berhasil disalin');
			})
			.catch(() => {
				toast.error('Gagal menyalin tautan');
			});
	}

	function formatDate(dateStr: string | null) {
		if (!dateStr) return '-';
		return new Date(dateStr).toLocaleDateString('id-ID', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>Bagikan Akses - Momenu</title>
</svelte:head>

<PageComposer>
	<div class="flex items-center justify-between gap-4 mb-6">
		<div>
			<h2 class="text-3xl font-bold tracking-tight">Bagikan Akses Analytics</h2>
			<p class="text-muted-foreground mt-1">
				Kelola tautan untuk membagikan data analitik dan RSVP acara Anda.
			</p>
		</div>
		<Button onclick={openCreateDialog} disabled={isMaxLimitReached}>
			<Plus class="mr-2 h-4 w-4" />
			Buat Tautan Baru
		</Button>
	</div>

	{#if isMaxLimitReached}
		<div
			class="bg-amber-50 border border-amber-200 text-amber-800 rounded-md p-4 mb-6 text-sm flex items-start"
		>
			<p>
				Anda telah mencapai batas maksimal 5 tautan aktif. Cabut akses tautan yang tidak digunakan
				untuk membuat tautan baru.
			</p>
		</div>
	{/if}

	<Card.Root>
		<Card.Header>
			<Card.Title>Tautan Akses Aktif</Card.Title>
			<Card.Description
				>Orang dengan tautan ini dapat melihat halaman analitik secara publik tanpa perlu login.</Card.Description
			>
		</Card.Header>
		<Card.Content>
			{#if isLoading}
				<div class="space-y-3">
					<Skeleton class="h-10 w-full" />
					<Skeleton class="h-10 w-full" />
					<Skeleton class="h-10 w-full" />
				</div>
			{:else if sessions.length === 0}
				<div
					class="flex flex-col items-center justify-center p-8 text-center bg-muted/20 rounded-lg border border-dashed"
				>
					<Share2 class="h-12 w-12 text-muted-foreground mb-4" />
					<h3 class="font-semibold text-lg">Belum ada tautan akses</h3>
					<p class="text-muted-foreground mb-4 max-w-sm">
						Buat tautan baru untuk mulai membagikan analytics acara Anda dengan pihak lain.
					</p>
					<Button onclick={openCreateDialog} variant="outline">
						<Plus class="mr-2 h-4 w-4" />
						Buat Tautan
					</Button>
				</div>
			{:else}
				<div class="rounded-md border">
					<Table.Root>
						<Table.Header>
							<Table.Row>
								<Table.Head>Nama/Catatan</Table.Head>
								<Table.Head>Tautan Akses</Table.Head>
								<Table.Head>Status</Table.Head>
								<Table.Head>Dibuat Pada</Table.Head>
								<Table.Head>Kadaluarsa</Table.Head>
								<Table.Head>Akses Terakhir</Table.Head>
								<Table.Head class="text-right">Aksi</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each sessions as session (session.id)}
								<Table.Row class={session.is_revoked ? 'opacity-60 bg-muted/30' : ''}>
									<Table.Cell class="font-medium truncate max-w-[150px]" title={session.name}>
										{session.name}
									</Table.Cell>
									<Table.Cell>
										<div class="flex items-center space-x-2">
											<code
												class="px-2 py-1 bg-muted rounded text-xs {session.is_revoked
													? 'line-through text-muted-foreground'
													: ''}">{session.session_id}</code
											>
											{#if !session.is_revoked}
												<Button
													variant="ghost"
													size="icon"
													class="h-6 w-6"
													onclick={() => copyLink(session.session_id)}
												>
													<Copy class="h-3 w-3" />
												</Button>
											{/if}
										</div>
									</Table.Cell>
									<Table.Cell>
										{#if session.is_revoked}
											<Badge variant="secondary">Dicabut</Badge>
										{:else}
											<Badge variant="default" class="bg-green-500 hover:bg-green-600">Aktif</Badge>
										{/if}
									</Table.Cell>
									<Table.Cell>{formatDate(session.created_at)}</Table.Cell>
									<Table.Cell>
										{#if session.expires_at}
											{formatDate(session.expires_at)}
										{:else}
											<span class="text-muted-foreground italic">Selamanya</span>
										{/if}
									</Table.Cell>
									<Table.Cell>{formatDate(session.last_accessed_at)}</Table.Cell>
									<Table.Cell class="text-right">
										{#if !session.is_revoked}
											<Button
												variant="destructive"
												size="sm"
												onclick={() => (revokeSessionId = session.session_id)}
											>
												<Trash2 class="h-4 w-4 mr-2" />
												Cabut Akses
											</Button>
										{/if}
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</PageComposer>

<Dialog.Root bind:open={isCreateDialogOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Buat Tautan Baru</Dialog.Title>
			<Dialog.Description>
				Tentukan durasi validitas untuk tautan akses analytics baru.
			</Dialog.Description>
		</Dialog.Header>
		<div class="grid gap-4 py-4">
			<div class="grid gap-2">
				<Label for="name">Nama / Catatan <span class="text-destructive">*</span></Label>
				<Input
					id="name"
					bind:value={newSessionName}
					placeholder="Misal: Wedding Organizer"
					autocomplete="off"
				/>
			</div>
			<div class="grid gap-2">
				<Label for="expiry">Batas Waktu</Label>
				<Select.Root type="single" name="expiry" bind:value={selectedExpiry}>
					<Select.Trigger class="w-full">
						{#if selectedExpiry === 'never'}Tidak Ada Kadaluarsa
						{:else if selectedExpiry === '1d'}1 Hari
						{:else if selectedExpiry === '7d'}7 Hari
						{:else if selectedExpiry === '30d'}30 Hari
						{/if}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="never" label="Tidak Ada Kadaluarsa"
							>Tidak Ada Kadaluarsa</Select.Item
						>
						<Select.Item value="1d" label="1 Hari">1 Hari</Select.Item>
						<Select.Item value="7d" label="7 Hari">7 Hari</Select.Item>
						<Select.Item value="30d" label="30 Hari">30 Hari</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>
		</div>
		<Dialog.Footer>
			<Dialog.Close>
				<Button variant="outline" disabled={isCreating}>Batal</Button>
			</Dialog.Close>
			<Button onclick={submitCreateSession} disabled={isCreating}>
				{#if isCreating}
					<RefreshCw class="mr-2 h-4 w-4 animate-spin" />
					Membuat...
				{:else}
					Buat Tautan
				{/if}
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<AlertDialog.Root
	open={!!revokeSessionId}
	onOpenChange={(open) => !open && (revokeSessionId = null)}
>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Cabut Akses Tautan?</AlertDialog.Title>
			<AlertDialog.Description>
				Tindakan ini tidak dapat dibatalkan. Orang yang memiliki tautan ini tidak akan bisa lagi
				mengakses halaman analytics.
			</AlertDialog.Description>
		</AlertDialog.Header>
		<AlertDialog.Footer>
			<AlertDialog.Cancel disabled={isRevoking}>Batal</AlertDialog.Cancel>
			<AlertDialog.Action
				class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
				onclick={handleRevokeSession}
				disabled={isRevoking}
			>
				{isRevoking ? 'Mencabut...' : 'Cabut Akses'}
			</AlertDialog.Action>
		</AlertDialog.Footer>
	</AlertDialog.Content>
</AlertDialog.Root>
