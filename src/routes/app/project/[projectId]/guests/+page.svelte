<script lang="ts">
	import { page } from '$app/stores';
	import { RSVPService, ProjectService } from '$lib/services/index.js';
	import type { RSVP, Pagination, Project, FeatureToggle } from '$lib/types/index.js';
	import QRCode from 'qrcode';
	import { onMount } from 'svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import {
		Download,
		Upload,
		RefreshCw,
		Users,
		Search,
		Plus,
		MessageSquare,
		Trash2,
		Share2,
		QrCode,
		Edit,
		AlertTriangle
	} from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import PageComposer from '$lib/components/layout/page-composer.svelte';

	let projectId = $derived($page.params.projectId!);
	let rsvps = $state<RSVP[]>([]);
	let pagination = $state<Pagination | null>(null);
	let loading = $state(true);

	let currentPage = $state(1);
	let limit = $state(10);

	let searchQuery = $state('');
	let statusFilter = $state('all');

	let isAddGuestOpen = $state(false);
	let newGuestName = $state('');
	let newGuestMessage = $state('');
	let newGuestWhatsapp = $state('');
	let isAddingGuest = $state(false);
	let editingGuestId = $state<number | null>(null);

	let project = $state<Project | null>(null);
	let featureToggle = $state<FeatureToggle | null>(null);

	// Template WA states
	let isWhatsappTemplateOpen = $state(false);
	let whatsappTemplate = $state(
		'Halo [Nama Tamu],\n\nKami mengundang Anda untuk hadir di acara kami. Silakan buka tautan berikut untuk melihat detail acara dan memberikan konfirmasi kehadiran (RSVP):\n\n[Link]'
	);
	let isSavingTemplate = $state(false);

	// QR Code states
	let isQrCodeOpen = $state(false);
	let qrCodeGuest = $state<RSVP | null>(null);
	let qrCodeDataUrl = $state('');

	// Export/Import states
	let isExporting = $state(false);
	let isImporting = $state(false);

	let alertDialogOpen = $state(false);
	let itemToDelete = $state<number | null>(null);

	let filteredRsvps = $derived(
		rsvps.filter((rsvp) => {
			const matchesSearch = rsvp.name.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesStatus =
				statusFilter === 'all' ||
				(statusFilter === 'attending' && rsvp.attending) ||
				(statusFilter === 'not_attending' && !rsvp.attending);
			return matchesSearch && matchesStatus;
		})
	);

	async function loadRSVPs() {
		loading = true;
		try {
			const res = await RSVPService.list(projectId, currentPage, limit);
			rsvps = res.data || [];
			pagination = res.pagination;
		} catch (e) {
			console.error('Failed to load RSVPs', e);
		} finally {
			loading = false;
		}
	}

	async function loadProjectInfo() {
		try {
			project = await ProjectService.get(projectId);
			featureToggle = await ProjectService.getFeatureToggle(projectId);
			if (featureToggle?.whatsapp_template) {
				whatsappTemplate = featureToggle.whatsapp_template;
			}
		} catch (e) {
			console.error('Failed to load project', e);
		}
	}

	onMount(() => {
		loadProjectInfo();
		loadRSVPs();
	});

	async function handleAddGuest(e: Event) {
		e.preventDefault();
		if (!newGuestName.trim()) return;
		isAddingGuest = true;
		try {
			const sanitizedWa = newGuestWhatsapp ? sanitizePhone(newGuestWhatsapp) : undefined;

			if (editingGuestId) {
				await RSVPService.updateGuest(projectId, editingGuestId, {
					name: newGuestName,
					special_message: newGuestMessage,
					whatsapp: sanitizedWa
				});
				toast.success('Tamu berhasil diubah');
			} else {
				await RSVPService.upsertGuest(projectId, {
					name: newGuestName,
					special_message: newGuestMessage,
					whatsapp: sanitizedWa
				});
				toast.success('Tamu berhasil ditambahkan');
			}

			isAddGuestOpen = false;
			resetGuestForm();
			loadRSVPs();
		} catch (e) {
			console.error('Failed to add/update guest', e);
			toast.error('Gagal menyimpan tamu');
		} finally {
			isAddingGuest = false;
		}
	}

	function resetGuestForm() {
		newGuestName = '';
		newGuestMessage = '';
		newGuestWhatsapp = '';
		editingGuestId = null;
	}

	function openAddGuest() {
		resetGuestForm();
		isAddGuestOpen = true;
	}

	function openEditGuest(guest: RSVP) {
		editingGuestId = guest.id;
		newGuestName = guest.name;
		newGuestMessage = guest.special_message || '';
		newGuestWhatsapp = guest.whatsapp || '';
		isAddGuestOpen = true;
	}

	async function handleExportXLSX() {
		isExporting = true;
		try {
			const blob = await RSVPService.exportToExcel(projectId);
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `guests_${projectId}.xlsx`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (e) {
			toast.error('Gagal mengunduh file Excel');
		} finally {
			isExporting = false;
		}
	}

	async function handleImportXLSX(e: Event) {
		const target = e.target as HTMLInputElement;
		if (!target.files?.length) return;

		isImporting = true;
		try {
			await RSVPService.importFromExcel(projectId, target.files[0]);
			toast.success('Berhasil mengimpor tamu');
			loadRSVPs();
		} catch (e) {
			toast.error('Gagal mengimpor tamu');
		} finally {
			isImporting = false;
			target.value = ''; // Reset input
		}
	}

	function sanitizePhone(phone: string) {
		if (!phone) return '';
		let clean = phone.replace(/\D/g, '');
		if (clean.startsWith('0')) {
			clean = '62' + clean.slice(1);
		} else if (clean.startsWith('8')) {
			clean = '62' + clean;
		}
		return clean;
	}

	function openWhatsApp(guest: RSVP) {
		if (!guest.whatsapp) {
			toast.error('Nomor WhatsApp tidak tersedia');
			return;
		}
		if (!project?.slug) return;

		const link = `${window.location.origin}/${project.slug}?kepada=${encodeURIComponent(guest.name)}`;
		let message = whatsappTemplate
			.replace(/\[Nama Tamu\]/gi, guest.name)
			.replace(/\[Link\]/gi, link);

		const cleanPhone = sanitizePhone(guest.whatsapp);
		const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
		window.open(waUrl, '_blank');
	}

	async function openQrCode(guest: RSVP) {
		if (!project?.slug) return;
		qrCodeGuest = guest;
		const link = `${window.location.origin}/${project.slug}?kepada=${encodeURIComponent(guest.name)}`;
		try {
			qrCodeDataUrl = await QRCode.toDataURL(link, { width: 300, margin: 2 });
			isQrCodeOpen = true;
		} catch (e) {
			toast.error('Gagal membuat QR Code');
		}
	}

	async function saveWhatsappTemplate() {
		if (!featureToggle) return;
		isSavingTemplate = true;
		try {
			await ProjectService.updateFeatureToggle(projectId, {
				...featureToggle,
				whatsapp_template: whatsappTemplate
			});
			toast.success('Template WA berhasil disimpan');
			isWhatsappTemplateOpen = false;
		} catch (e) {
			toast.error('Gagal menyimpan template');
		} finally {
			isSavingTemplate = false;
		}
	}

	function confirmDelete(id: number) {
		itemToDelete = id;
		alertDialogOpen = true;
	}

	async function executeDelete() {
		if (!itemToDelete) return;
		try {
			await RSVPService.delete(projectId, itemToDelete);
			toast.success('Tamu berhasil dihapus');
			loadRSVPs();
		} catch (e) {
			toast.error('Gagal menghapus tamu');
		} finally {
			alertDialogOpen = false;
			itemToDelete = null;
		}
	}

	function handleNextPage() {
		if (pagination && currentPage < pagination.total_pages) {
			currentPage++;
			loadRSVPs();
		}
	}

	function handlePrevPage() {
		if (currentPage > 1) {
			currentPage--;
			loadRSVPs();
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
	<title>Momenu | Buku Tamu & RSVP</title>
</svelte:head>

<PageComposer>
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Tamu & RSVP</h1>
			<p class="text-muted-foreground">Kelola daftar tamu dan pesan spesial.</p>
		</div>
		<div class="flex items-center gap-2 flex-wrap">
			<Button variant="outline" onclick={() => (isWhatsappTemplateOpen = true)}>
				<MessageSquare class="mr-2 h-4 w-4" />
				Template WA
			</Button>
			<Button variant="outline" onclick={handleExportXLSX} disabled={isExporting}>
				<Download class="mr-2 h-4 w-4 {isExporting ? 'animate-spin' : ''}" />
				Export Excel
			</Button>
			<div class="relative">
				<input
					type="file"
					id="import-excel"
					class="hidden"
					accept=".xlsx,.xls"
					onchange={handleImportXLSX}
					disabled={isImporting}
				/>
				<Button
					variant="outline"
					onclick={() => document.getElementById('import-excel')?.click()}
					disabled={isImporting}
				>
					<Upload class="mr-2 h-4 w-4 {isImporting ? 'animate-spin' : ''}" />
					Import Excel
				</Button>
			</div>
			<Button variant="outline" onclick={loadRSVPs} disabled={loading}>
				<RefreshCw class="mr-2 h-4 w-4 {loading ? 'animate-spin' : ''}" />
				Segarkan
			</Button>
			<Button variant="default" onclick={openAddGuest}>
				<Plus class="mr-2 h-4 w-4" />
				Tambah Tamu
			</Button>
			<Dialog.Root bind:open={isAddGuestOpen} onOpenChange={(open) => !open && resetGuestForm()}>
				<Dialog.Content class="sm:max-w-[425px]">
					<Dialog.Header>
						<Dialog.Title>{editingGuestId ? 'Ubah Tamu' : 'Tambah Tamu'}</Dialog.Title>
						<Dialog.Description>
							{editingGuestId
								? 'Ubah detail tamu Anda.'
								: 'Tambahkan tamu ke daftar Anda dan berikan pesan spesial jika diinginkan.'}
						</Dialog.Description>
					</Dialog.Header>
					<form onsubmit={handleAddGuest} class="space-y-4 py-4">
						<div class="space-y-2">
							<Label for="name">Nama Tamu</Label>
							<Input
								id="name"
								bind:value={newGuestName}
								placeholder="Contoh: Budi Santoso"
								disabled={isAddingGuest}
								required
							/>
							{#if editingGuestId}
								<div
									class="flex items-start gap-1.5 mt-1.5 text-amber-600 bg-amber-50 p-2 rounded-md border border-amber-200"
								>
									<AlertTriangle class="h-4 w-4 shrink-0 mt-0.5" />
									<p class="text-xs leading-relaxed">
										<strong>Peringatan:</strong> Mengubah nama tamu akan menyebabkan
										<strong>URL undangan sebelumnya menjadi tidak valid</strong>. Tamu harus
										menggunakan URL baru yang dibagikan.
									</p>
								</div>
							{/if}
						</div>
						<div class="space-y-2">
							<Label for="whatsapp">No. WhatsApp (Opsional)</Label>
							<Input
								id="whatsapp"
								bind:value={newGuestWhatsapp}
								placeholder="Contoh: 08123456789"
								disabled={isAddingGuest}
							/>
						</div>
						<div class="space-y-2">
							<Label for="message">Pesan Spesial (Opsional)</Label>
							<Textarea
								id="message"
								bind:value={newGuestMessage}
								placeholder="Pesan ini akan muncul saat tamu membuka undangan..."
								disabled={isAddingGuest}
							/>
						</div>
						<Dialog.Footer>
							<Button type="submit" disabled={isAddingGuest}>
								{isAddingGuest ? 'Menyimpan...' : 'Simpan'}
							</Button>
						</Dialog.Footer>
					</form>
				</Dialog.Content>
			</Dialog.Root>
		</div>
	</div>

	<Card.Root>
		<Card.Header class="pb-3 border-b">
			<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
				<Tabs.Root bind:value={statusFilter} class="w-full md:w-auto">
					<Tabs.List class="grid w-full grid-cols-3">
						<Tabs.Trigger value="all">Semua</Tabs.Trigger>
						<Tabs.Trigger value="attending">Hadir</Tabs.Trigger>
						<Tabs.Trigger value="not_attending">Tidak Hadir</Tabs.Trigger>
					</Tabs.List>
				</Tabs.Root>
				<div class="relative w-full md:w-64">
					<Search class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
					<Input
						type="search"
						placeholder="Cari nama tamu..."
						class="w-full pl-8"
						bind:value={searchQuery}
					/>
				</div>
			</div>
		</Card.Header>
		<Card.Content class="p-0">
			<!-- Desktop Table View -->
			<div class="hidden md:block">
				<Table.Root>
					<Table.Header>
						<Table.Row class="bg-muted/50 hover:bg-muted/50">
							<Table.Head>Nama Tamu</Table.Head>
							<Table.Head>WhatsApp</Table.Head>
							<Table.Head>Pesan Spesial</Table.Head>
							<Table.Head>Status</Table.Head>
							<Table.Head class="text-center">Jumlah</Table.Head>
							<Table.Head class="text-center">Dibuka</Table.Head>
							<Table.Head class="text-right">Aksi</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#if loading}
							{#each Array(5) as _}
								<Table.Row>
									<Table.Cell><Skeleton class="h-4 w-[150px]" /></Table.Cell>
									<Table.Cell><Skeleton class="h-4 w-[120px]" /></Table.Cell>
									<Table.Cell><Skeleton class="h-4 w-[150px]" /></Table.Cell>
									<Table.Cell><Skeleton class="h-5 w-[80px] rounded-full" /></Table.Cell>
									<Table.Cell class="text-center"
										><Skeleton class="h-4 w-[20px] mx-auto" /></Table.Cell
									>
									<Table.Cell class="text-center"
										><Skeleton class="h-4 w-[40px] mx-auto" /></Table.Cell
									>
									<Table.Cell class="text-right"
										><Skeleton class="h-4 w-[100px] ml-auto" /></Table.Cell
									>
								</Table.Row>
							{/each}
						{:else if filteredRsvps.length === 0}
							<Table.Row>
								<Table.Cell colspan={4} class="h-40 text-center">
									<Empty.Root>
										<Empty.Media variant="icon">
											<Users class="h-10 w-10 text-muted-foreground" />
										</Empty.Media>
										<Empty.Title>Tidak ada data tamu</Empty.Title>
										<Empty.Description
											>Belum ada tamu yang sesuai dengan pencarian Anda.</Empty.Description
										>
									</Empty.Root>
								</Table.Cell>
							</Table.Row>
						{:else}
							{#each filteredRsvps as rsvp (rsvp.id)}
								<Table.Row
									class="group {rsvp.is_responded
										? rsvp.attending
											? 'border-l-4 border-l-emerald-500'
											: 'border-l-4 border-l-rose-500'
										: 'border-l-4 border-l-amber-500'}"
								>
									<Table.Cell class="font-medium">
										<div class="flex items-center gap-3">
											<Avatar.Root class="h-8 w-8">
												<Avatar.Fallback class="font-semibold text-xs {getAvatarColor(rsvp.name)}">
													{getInitials(rsvp.name)}
												</Avatar.Fallback>
											</Avatar.Root>
											{rsvp.name}
										</div>
									</Table.Cell>
									<Table.Cell>
										<span class="text-sm text-muted-foreground">{rsvp.whatsapp || '-'}</span>
									</Table.Cell>
									<Table.Cell>
										{#if rsvp.special_message}
											<div class="flex items-start gap-2 max-w-[250px] group/msg">
												<MessageSquare class="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
												<p
													class="text-sm text-muted-foreground truncate group-hover/msg:whitespace-normal group-hover/msg:wrap-break-word"
												>
													{rsvp.special_message}
												</p>
											</div>
										{:else}
											<span class="text-muted-foreground italic text-sm">-</span>
										{/if}
									</Table.Cell>
									<Table.Cell>
										{#if !rsvp.is_responded}
											<Badge
												variant="outline"
												class="text-amber-600 border-amber-200 bg-amber-50 shadow-none"
											>
												Menunggu Balasan
											</Badge>
										{:else if rsvp.attending}
											<Badge
												variant="default"
												class="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-200 shadow-none"
											>
												Hadir
											</Badge>
										{:else}
											<Badge
												variant="secondary"
												class="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 shadow-none"
											>
												Tidak Hadir
											</Badge>
										{/if}
									</Table.Cell>
									<Table.Cell class="text-center"
										>{rsvp.is_responded && rsvp.attending ? rsvp.guest_count : '-'}</Table.Cell
									>
									<Table.Cell class="text-center">
										{#if rsvp.has_opened}
											<Badge
												variant="outline"
												class="bg-blue-50 text-blue-700 border-blue-200 shadow-none">Ya</Badge
											>
										{:else}
											<Badge variant="outline" class="text-muted-foreground shadow-none"
												>Belum</Badge
											>
										{/if}
									</Table.Cell>
									<Table.Cell class="text-right">
										<div class="flex items-center justify-end gap-1">
											{#if rsvp.whatsapp}
												<Button
													variant="ghost"
													size="icon"
													class="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
													onclick={() => openWhatsApp(rsvp)}
													title="Kirim WA"
												>
													<Share2 class="h-4 w-4" />
												</Button>
											{/if}
											<Button
												variant="ghost"
												size="icon"
												class="h-8 w-8 hover:bg-muted"
												onclick={() => openQrCode(rsvp)}
												title="QR Code"
											>
												<QrCode class="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												class="h-8 w-8 hover:bg-muted"
												onclick={() => openEditGuest(rsvp)}
												title="Ubah Tamu"
											>
												<Edit class="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												class="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
												onclick={() => confirmDelete(rsvp.id)}
												title="Hapus"
											>
												<Trash2 class="h-4 w-4" />
											</Button>
										</div>
									</Table.Cell>
								</Table.Row>
							{/each}
						{/if}
					</Table.Body>
				</Table.Root>
			</div>

			<!-- Mobile Card View -->
			<div class="md:hidden divide-y">
				{#if loading}
					{#each Array(5) as _}
						<div class="p-4 space-y-3">
							<div class="flex justify-between items-center">
								<Skeleton class="h-5 w-[150px]" />
								<Skeleton class="h-5 w-[80px] rounded-full" />
							</div>
							<Skeleton class="h-4 w-[100px]" />
						</div>
					{/each}
				{:else if filteredRsvps.length === 0}
					<div class="p-8">
						<Empty.Root>
							<Empty.Media variant="icon">
								<Users class="h-10 w-10 text-muted-foreground" />
							</Empty.Media>
							<Empty.Title>Tidak ada data tamu</Empty.Title>
							<Empty.Description>Belum ada tamu yang sesuai.</Empty.Description>
						</Empty.Root>
					</div>
				{:else}
					{#each filteredRsvps as rsvp (rsvp.id)}
						<div
							class="p-4 flex gap-3 {rsvp.is_responded
								? rsvp.attending
									? 'border-l-4 border-l-emerald-500'
									: 'border-l-4 border-l-rose-500'
								: 'border-l-4 border-l-amber-500'}"
						>
							<Avatar.Root class="h-10 w-10 mt-1">
								<Avatar.Fallback class="font-semibold text-sm {getAvatarColor(rsvp.name)}">
									{getInitials(rsvp.name)}
								</Avatar.Fallback>
							</Avatar.Root>
							<div class="flex-1 space-y-1">
								<div class="flex justify-between items-start">
									<div class="flex flex-col">
										<span class="font-semibold">{rsvp.name}</span>
										{#if rsvp.whatsapp}
											<span class="text-xs text-muted-foreground">{rsvp.whatsapp}</span>
										{/if}
									</div>
									{#if !rsvp.is_responded}
										<Badge
											variant="outline"
											class="text-amber-600 border-amber-200 bg-amber-50 shadow-none"
										>
											Menunggu
										</Badge>
									{:else if rsvp.attending}
										<Badge
											variant="default"
											class="bg-emerald-500/15 text-emerald-700 hover:bg-emerald-500/25 border-emerald-200 shadow-none"
										>
											Hadir
										</Badge>
									{:else}
										<Badge
											variant="secondary"
											class="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 shadow-none"
										>
											Tidak Hadir
										</Badge>
									{/if}
								</div>
								{#if rsvp.special_message}
									<div class="flex items-start gap-1.5 mt-1 mb-2 text-muted-foreground">
										<MessageSquare class="h-3.5 w-3.5 mt-0.5 shrink-0" />
										<p class="text-sm line-clamp-2">{rsvp.special_message}</p>
									</div>
								{/if}
								<div class="flex justify-between items-center text-sm text-muted-foreground pt-1">
									<div class="flex flex-col">
										<span
											>{rsvp.is_responded
												? rsvp.attending
													? `Bersama ${rsvp.guest_count} orang`
													: 'Batal hadir'
												: 'Belum konfirmasi'}</span
										>
										{#if rsvp.has_opened}
											<span class="text-xs text-blue-600 font-medium">Sudah dibuka</span>
										{/if}
									</div>
									<span class="text-xs">
										{new Date(rsvp.created_at).toLocaleDateString('id-ID', {
											day: 'numeric',
											month: 'short'
										})}
									</span>
								</div>
								<div class="flex justify-end mt-2 border-t border-border pt-2 gap-1">
									{#if rsvp.whatsapp}
										<Button
											variant="ghost"
											size="sm"
											class="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
											onclick={() => openWhatsApp(rsvp)}
										>
											<Share2 class="h-3.5 w-3.5" />
										</Button>
									{/if}
									<Button
										variant="ghost"
										size="sm"
										class="h-8 hover:bg-muted"
										onclick={() => openQrCode(rsvp)}
									>
										<QrCode class="h-3.5 w-3.5" />
									</Button>
									<Button
										variant="ghost"
										size="sm"
										class="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
										onclick={() => confirmDelete(rsvp.id)}
									>
										<Trash2 class="h-3.5 w-3.5 mr-1.5" /> Hapus
									</Button>
								</div>
							</div>
						</div>
					{/each}
				{/if}
			</div>

			<!-- Pagination -->
			{#if pagination && pagination.total_pages > 1}
				<div class="flex items-center justify-between px-4 py-4 border-t border-border">
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
		</Card.Content>
	</Card.Root>
</PageComposer>

<AlertDialog.Root bind:open={alertDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Hapus Tamu?</AlertDialog.Title>
			<AlertDialog.Description>
				Tindakan ini tidak dapat dibatalkan. Tamu akan dihapus dari daftar Anda.
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

<Dialog.Root bind:open={isWhatsappTemplateOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>Template WhatsApp</Dialog.Title>
			<Dialog.Description>
				Sesuaikan pesan yang akan dikirim saat membagikan undangan via WhatsApp. Gunakan <code
					class="bg-muted px-1 rounded">[Nama Tamu]</code
				>
				dan <code class="bg-muted px-1 rounded">[Link]</code>.
			</Dialog.Description>
		</Dialog.Header>
		<div class="space-y-4 py-4">
			<div class="space-y-2">
				<Textarea
					id="wa_template"
					bind:value={whatsappTemplate}
					rows={8}
					disabled={isSavingTemplate}
				/>
			</div>
		</div>
		<Dialog.Footer>
			<Button onclick={saveWhatsappTemplate} disabled={isSavingTemplate}>
				{#if isSavingTemplate}
					<RefreshCw class="mr-2 h-4 w-4 animate-spin" />
				{/if}
				Simpan Template
			</Button>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>

<Dialog.Root bind:open={isQrCodeOpen}>
	<Dialog.Content class="sm:max-w-[400px] flex flex-col items-center py-10">
		<Dialog.Header class="text-center w-full mb-4">
			<Dialog.Title class="text-center">QR Code Undangan</Dialog.Title>
			<Dialog.Description class="text-center">
				{qrCodeGuest?.name}
			</Dialog.Description>
		</Dialog.Header>

		{#if qrCodeDataUrl}
			<div class="bg-white p-4 rounded-xl border shadow-sm">
				<img src={qrCodeDataUrl} alt="QR Code" class="w-48 h-48" />
			</div>

			<div class="mt-8 flex gap-3">
				<Button variant="outline" onclick={() => (isQrCodeOpen = false)}>Tutup</Button>
				<a href={qrCodeDataUrl} download={`QR_${qrCodeGuest?.name || 'Tamu'}.png`}>
					<Button variant="default">
						<Download class="mr-2 h-4 w-4" /> Download
					</Button>
				</a>
			</div>
		{/if}
	</Dialog.Content>
</Dialog.Root>
