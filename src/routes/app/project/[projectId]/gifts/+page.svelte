<script lang="ts">
	import { page } from '$app/stores';
	import { GiftRegistryService } from '$lib/services/index.js';
	import type { GiftRegistry, GiftRegistryRequest, GiftRegistryType } from '$lib/types/index.js';
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { Plus, Edit2, Trash2, CreditCard, Wallet, Gift as GiftIcon, Copy } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import MediaInput from '$lib/components/forms/media-input.svelte';
	import { getMediaUrl } from '$lib/utils.js';
	import PageComposer from '$lib/components/layout/page-composer.svelte';
	import { UploadService } from '$lib/services/upload.service.js';

	let projectId = $derived($page.params.projectId!);
	let gifts = $state<GiftRegistry[]>([]);
	let loading = $state(true);

	let dialogOpen = $state(false);
	let submitting = $state(false);
	let editingId = $state<number | null>(null);

	let alertDialogOpen = $state(false);
	let itemToDelete = $state<number | null>(null);

	let formData = $state<GiftRegistryRequest>({
		type: 'bank',
		provider_name: '',
		account_number: '',
		account_name: '',
		mailing_address: '',
		qr_code_image: '',
		phone_number: ''
	});

	let uploadMode = $state<'file' | 'url'>('file');
	let selectedFile = $state<File | null>(null);
	let uploadProgress = $state(0);

	async function loadGifts() {
		loading = true;
		try {
			const res = await GiftRegistryService.list(projectId);
			gifts = res || [];
		} catch (e) {
			console.error('Failed to load gifts', e);
			toast.error('Gagal memuat daftar kado');
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadGifts();
	});

	function copyToClipboard(text: string) {
		navigator.clipboard.writeText(text);
		toast.success('Berhasil disalin ke papan klip');
	}

	function openAddDialog() {
		editingId = null;
		formData = {
			type: 'bank',
			provider_name: '',
			account_number: '',
			account_name: '',
			mailing_address: '',
			qr_code_image: '',
			phone_number: ''
		};
		uploadMode = 'file';
		selectedFile = null;
		uploadProgress = 0;
		dialogOpen = true;
	}

	function openEditDialog(gift: GiftRegistry) {
		editingId = gift.id;
		formData = {
			type: gift.type,
			provider_name: gift.provider_name || '',
			account_number: gift.account_number || '',
			account_name: gift.account_name || '',
			mailing_address: gift.mailing_address || '',
			qr_code_image: gift.qr_code_image || '',
			phone_number: gift.phone_number || ''
		};
		uploadMode = gift.qr_code_image ? 'url' : 'file';
		selectedFile = null;
		uploadProgress = 0;
		dialogOpen = true;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		submitting = true;

		try {
			if (formData.type === 'ewallet') {
				if (uploadMode === 'file' && selectedFile) {
					const uploadRes = await UploadService.upload(
						selectedFile,
						'image',
						projectId,
						(percent) => {
							uploadProgress = percent;
						}
					);
					formData.qr_code_image = uploadRes.url;
				}
				if (!formData.qr_code_image && !formData.phone_number) {
					toast.error('Harap upload gambar QRIS atau masukkan nomor telepon');
					submitting = false;
					return;
				}
			}

			const payload: GiftRegistryRequest = {
				type: formData.type,
				provider_name: formData.type !== 'physical' ? formData.provider_name : undefined,
				account_number: formData.type === 'bank' ? formData.account_number : undefined,
				account_name: formData.type === 'bank' ? formData.account_name : undefined,
				qr_code_image: formData.type === 'ewallet' ? formData.qr_code_image : undefined,
				phone_number: formData.type === 'ewallet' ? formData.phone_number : undefined,
				mailing_address: formData.type === 'physical' ? formData.mailing_address : undefined
			};

			if (editingId) {
				await GiftRegistryService.update(projectId, editingId, payload);
				toast.success('Info kado berhasil diperbarui');
			} else {
				await GiftRegistryService.create(projectId, payload);
				toast.success('Info kado berhasil ditambahkan');
			}

			dialogOpen = false;
			loadGifts();
		} catch (e: any) {
			toast.error(
				e?.response?.data?.message ||
					(editingId ? 'Gagal memperbarui info kado' : 'Gagal menambahkan info kado')
			);
		} finally {
			submitting = false;
		}
	}

	function confirmDelete(id: number) {
		itemToDelete = id;
		alertDialogOpen = true;
	}

	async function executeDelete() {
		if (!itemToDelete) return;

		try {
			await GiftRegistryService.delete(projectId, itemToDelete);
			toast.success('Info kado berhasil dihapus');
			gifts = gifts.filter((g) => g.id !== itemToDelete);
		} catch (e) {
			toast.error('Gagal menghapus info kado');
		} finally {
			alertDialogOpen = false;
			itemToDelete = null;
		}
	}

	function getGiftIcon(type: GiftRegistryType) {
		switch (type) {
			case 'bank':
				return CreditCard;
			case 'ewallet':
				return Wallet;
			case 'physical':
				return GiftIcon;
			default:
				return GiftIcon;
		}
	}

	function getGiftLabel(type: GiftRegistryType) {
		switch (type) {
			case 'bank':
				return 'Transfer Bank';
			case 'ewallet':
				return 'E-Wallet';
			case 'physical':
				return 'Kirim Fisik';
			default:
				return 'Lainnya';
		}
	}
</script>

<svelte:head>
	<title>Momenu | Hadiah & Amplop</title>
</svelte:head>

<PageComposer>
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Hadiah & Amplop</h1>
			<p class="text-muted-foreground">Atur rekening atau alamat pengiriman kado untuk tamu.</p>
		</div>
		<Button onclick={openAddDialog}>
			<Plus class="mr-2 h-4 w-4" />
			Tambah Kado
		</Button>
	</div>

	{#if loading}
		<div class="grid gap-4 md:grid-cols-3">
			{#each Array(3) as _}
				<Card.Root>
					<Card.Header>
						<Skeleton class="h-6 w-1/2" />
					</Card.Header>
					<Card.Content class="space-y-4">
						<Skeleton class="h-4 w-3/4" />
						<Skeleton class="h-4 w-full" />
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{:else if gifts.length === 0}
		<Empty.Root>
			<Empty.Header>
				<Empty.Media variant="icon">
					<GiftIcon class="h-12 w-12" />
				</Empty.Media>
				<Empty.Title>Belum ada pengaturan kado</Empty.Title>
				<Empty.Description>
					Tambahkan nomor rekening, e-wallet, atau alamat rumah untuk mempermudah tamu memberikan
					hadiah.
				</Empty.Description>
			</Empty.Header>
			<Empty.Content>
				<Button onclick={openAddDialog}>Tambah Info Kado</Button>
			</Empty.Content>
		</Empty.Root>
	{:else}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each gifts as gift (gift.id)}
				{#if gift.type === 'bank'}
					<div
						class="relative group h-48 rounded-xl overflow-hidden shadow-lg dark:shadow-xl hover:shadow-xl dark:hover:shadow-2xl transition-all duration-300 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-slate-100 via-slate-200 to-slate-300 dark:from-slate-700 dark:via-slate-800 dark:to-slate-950 text-slate-800 dark:text-slate-100 border border-slate-300 dark:border-white/10 hover:-translate-y-1"
					>
						<!-- Hover Shine Effect -->
						<div
							class="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/40 dark:via-white/10 to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-0"
						></div>

						<!-- Action buttons -->
						<div
							class="absolute top-4 right-4 z-20 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
						>
							<Button
								variant="secondary"
								size="icon"
								class="h-8 w-8 bg-black/5 hover:bg-black/10 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white border-0 backdrop-blur-md"
								onclick={() => openEditDialog(gift)}
							>
								<Edit2 class="h-4 w-4" />
							</Button>
							<Button
								variant="destructive"
								size="icon"
								class="h-8 w-8 bg-red-500/80 hover:bg-red-500 text-white border-0 backdrop-blur-md"
								onclick={() => confirmDelete(gift.id)}
							>
								<Trash2 class="h-4 w-4" />
							</Button>
						</div>

						<!-- Card Chip -->
						<div
							class="absolute top-6 left-6 opacity-80 text-yellow-600 dark:text-yellow-500/90 z-10"
						>
							<svg
								class="h-9 w-9"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="1.2"
							>
								<rect x="2" y="6" width="20" height="12" rx="3" fill="currentColor" opacity="0.2" />
								<path d="M7 6v12M12 6v12M17 6v12M2 10h20M2 14h20" stroke-linecap="round" />
							</svg>
						</div>

						<!-- Bank Name -->
						<div class="absolute top-6 right-6 z-10 flex flex-col items-end">
							<div
								class="font-bold text-xl italic opacity-90 tracking-widest drop-shadow-sm dark:drop-shadow-md"
							>
								{gift.provider_name}
							</div>
						</div>

						<!-- Account Number -->
						<div class="absolute top-20 left-6 right-6 z-10">
							<div
								class="text-xl sm:text-2xl font-mono tracking-widest drop-shadow-sm dark:drop-shadow-md flex items-center gap-3"
							>
								{gift.account_number}
								<button
									class="hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 bg-white/40 dark:bg-black/20 p-1.5 rounded-md"
									onclick={() => copyToClipboard(gift.account_number!)}
								>
									<Copy class="h-4 w-4" />
								</button>
							</div>
						</div>

						<!-- Account Name & Label -->
						<div class="absolute bottom-6 left-6 right-6 flex justify-between items-end z-10">
							<div>
								<div class="text-[0.65rem] uppercase tracking-widest opacity-60 mb-1">
									Cardholder Name
								</div>
								<div
									class="font-medium tracking-widest uppercase truncate max-w-[180px] sm:max-w-[200px] text-sm drop-shadow-sm dark:drop-shadow-md text-slate-800 dark:text-slate-200"
								>
									{gift.account_name}
								</div>
							</div>
							<div class="flex items-center gap-1.5 opacity-80">
								<CreditCard class="h-5 w-5" />
								<span class="text-xs font-bold uppercase tracking-widest">Debit</span>
							</div>
						</div>
					</div>
				{:else if gift.type === 'ewallet'}
					<div
						class="relative group h-48 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 hover:-translate-y-1 flex flex-col justify-between p-5"
					>
						<!-- Elegant Top Accent Line -->
						<div
							class="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-indigo-500 to-cyan-400 opacity-80"
						></div>

						<!-- Action buttons -->
						<div
							class="absolute top-4 right-4 z-20 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
						>
							<Button
								variant="secondary"
								size="icon"
								class="h-8 w-8 bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border-0 shadow-sm"
								onclick={() => openEditDialog(gift)}
							>
								<Edit2 class="h-4 w-4" />
							</Button>
							<Button
								variant="destructive"
								size="icon"
								class="h-8 w-8 border-0 shadow-sm"
								onclick={() => confirmDelete(gift.id)}
							>
								<Trash2 class="h-4 w-4" />
							</Button>
						</div>

						<!-- Top Header -->
						<div class="flex items-center justify-between z-10 w-full mt-1">
							<div
								class="flex items-center gap-3 font-semibold text-lg tracking-wide text-stone-800 dark:text-stone-200"
							>
								<div
									class="p-2 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-xl shadow-sm border border-indigo-100 dark:border-indigo-500/20"
								>
									<Wallet class="h-5 w-5" />
								</div>
								{gift.provider_name}
							</div>
						</div>

						<!-- Bottom section with QR or Phone -->
						<div class="flex items-end justify-between z-10 w-full mt-auto">
							<div class="flex flex-col gap-1.5 mb-1 max-w-[65%]">
								<div
									class="text-[0.65rem] uppercase tracking-widest font-bold text-stone-400 dark:text-stone-500"
								>
									Digital Payment
								</div>
								{#if gift.phone_number}
									<div
										class="text-sm font-bold text-stone-700 dark:text-stone-300 flex items-center gap-2 drop-shadow-sm"
									>
										{gift.phone_number}
										<button
											class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 bg-stone-100 dark:bg-stone-800 p-1 rounded-md"
											onclick={() => copyToClipboard(gift.phone_number!)}
										>
											<Copy class="h-3 w-3" />
										</button>
									</div>
								{:else}
									<div class="text-xs text-stone-500 dark:text-stone-400 font-medium">
										Scan QR Code via app
									</div>
								{/if}
							</div>

							{#if gift.qr_code_image}
								<!-- QR Code floating -->
								<div
									class="h-20 w-20 bg-white p-1.5 rounded-xl shadow-sm border border-stone-200 dark:border-stone-700 overflow-hidden transform group-hover:scale-[1.8] group-hover:-translate-y-4 group-hover:-translate-x-4 transition-all duration-500 origin-bottom-right cursor-pointer group/qr ring-1 ring-black/5 dark:ring-white/10 z-20 shrink-0"
								>
									<img
										src={getMediaUrl(gift.qr_code_image)}
										alt="QRIS"
										class="w-full h-full object-cover rounded-lg"
									/>
									<div
										class="absolute inset-0 bg-black/60 text-white opacity-0 group-hover/qr:opacity-100 flex items-center justify-center text-[0.4rem] font-bold text-center transition-opacity backdrop-blur-[2px]"
									>
										SCAN ME
									</div>
								</div>
							{/if}
						</div>
					</div>
				{:else}
					<div
						class="relative group h-48 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 bg-[#FAF7F2] dark:bg-stone-900 border-2 border-dashed border-[#e6d5c3] dark:border-stone-700 hover:-translate-y-1"
					>
						<!-- Hover Shine Effect -->
						<div
							class="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-stone-500/5 dark:via-stone-400/5 to-transparent group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none z-0"
						></div>

						<!-- Action buttons -->
						<div
							class="absolute top-4 right-4 z-20 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
						>
							<Button
								variant="secondary"
								size="icon"
								class="h-8 w-8 bg-stone-200/60 hover:bg-stone-200 dark:bg-stone-800/60 dark:hover:bg-stone-800 border-0 backdrop-blur-md shadow-sm"
								onclick={() => openEditDialog(gift)}
							>
								<Edit2 class="h-4 w-4" />
							</Button>
							<Button
								variant="destructive"
								size="icon"
								class="h-8 w-8 border-0 shadow-sm"
								onclick={() => confirmDelete(gift.id)}
							>
								<Trash2 class="h-4 w-4" />
							</Button>
						</div>

						<!-- Postage Stamp / Icon -->
						<div
							class="absolute top-5 left-5 p-2.5 bg-white dark:bg-stone-950 rounded-md border border-stone-200 dark:border-stone-800 shadow-md transform -rotate-6 group-hover:rotate-0 transition-transform duration-500 z-10"
						>
							<GiftIcon class="h-6 w-6 text-stone-600 dark:text-stone-400" />
						</div>

						<!-- Delivery Info -->
						<div class="absolute top-6 left-22 right-18 text-stone-800 dark:text-stone-200 z-10">
							<div
								class="text-[0.65rem] font-bold uppercase tracking-widest text-stone-400 dark:text-stone-500 mb-0.5"
							>
								To:
							</div>
							<div
								class="font-bold text-sm drop-shadow-sm truncate text-stone-700 dark:text-stone-300"
							>
								Tuan Rumah / Mempelai
							</div>
						</div>

						<!-- Address Label Glassmorphism -->
						<div
							class="absolute bottom-5 left-5 right-5 bg-white/70 dark:bg-black/40 backdrop-blur-md border border-white/50 dark:border-stone-700/50 rounded-xl p-3.5 shadow-sm z-10 group-hover:bg-white/90 dark:group-hover:bg-black/60 transition-colors"
						>
							<div class="flex items-center gap-1.5 mb-1.5 text-stone-500 dark:text-stone-400">
								<div
									class="text-[0.65rem] font-bold uppercase tracking-widest bg-stone-200/50 dark:bg-stone-800/50 px-2 py-0.5 rounded-sm"
								>
									Delivery Address
								</div>
							</div>
							<div
								class="text-sm font-medium leading-relaxed line-clamp-2 text-stone-800 dark:text-stone-200"
							>
								{gift.mailing_address}
							</div>
						</div>
					</div>
				{/if}
			{/each}
		</div>
	{/if}
</PageComposer>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>{editingId ? 'Edit Info Kado' : 'Tambah Info Kado'}</Dialog.Title>
			<Dialog.Description>
				Isi detail informasi untuk penerimaan kado atau amplop digital.
			</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="space-y-4 py-4">
			<div class="space-y-2">
				<Label for="type">Jenis Info</Label>
				<Select.Root type="single" name="type" bind:value={formData.type}>
					<Select.Trigger class="w-full">
						{formData.type === 'bank'
							? 'Rekening Bank'
							: formData.type === 'ewallet'
								? 'E-Wallet'
								: 'Alamat / Kado Fisik'}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="bank" label="Rekening Bank">Rekening Bank</Select.Item>
						<Select.Item value="ewallet" label="E-Wallet">E-Wallet</Select.Item>
						<Select.Item value="physical" label="Alamat / Kado Fisik"
							>Alamat / Kado Fisik</Select.Item
						>
					</Select.Content>
				</Select.Root>
			</div>

			{#if formData.type === 'physical'}
				<div class="space-y-2">
					<Label for="mailing_address">Alamat Lengkap Pengiriman *</Label>
					<textarea
						id="mailing_address"
						bind:value={formData.mailing_address}
						required
						rows="4"
						class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
						placeholder="Tulis alamat rumah selengkap-lengkapnya beserta patokan..."></textarea>
				</div>
			{:else if formData.type === 'ewallet'}
				<div class="space-y-2">
					<Label for="provider_name">Nama E-Wallet / QRIS *</Label>
					<Input
						id="provider_name"
						bind:value={formData.provider_name}
						placeholder="Contoh: GoPay / QRIS"
						required
					/>
				</div>
				<div class="space-y-2">
					<Label for="phone_number">Nomor Telepon (Opsional)</Label>
					<Input
						id="phone_number"
						bind:value={formData.phone_number}
						placeholder="Jika mendukung transfer nomor telepon"
					/>
				</div>
				<div class="space-y-2">
					<Label>Upload QRIS (Opsional jika no. HP diisi)</Label>
					<MediaInput
						mediaType="image"
						bind:mode={uploadMode}
						bind:url={formData.qr_code_image}
						bind:file={selectedFile}
						progress={uploadProgress}
						isSubmitting={submitting}
					/>
				</div>
			{:else}
				<div class="space-y-2">
					<Label for="provider_name">Nama Bank *</Label>
					<Input
						id="provider_name"
						bind:value={formData.provider_name}
						placeholder="Contoh: BCA / Mandiri"
						required
					/>
				</div>
				<div class="space-y-2">
					<Label for="account_number">Nomor Rekening *</Label>
					<Input
						id="account_number"
						bind:value={formData.account_number}
						placeholder="Contoh: 1234567890"
						required
					/>
				</div>
				<div class="space-y-2">
					<Label for="account_name">Atas Nama *</Label>
					<Input
						id="account_name"
						bind:value={formData.account_name}
						placeholder="Nama sesuai rekening"
						required
					/>
				</div>
			{/if}

			<Dialog.Footer class="pt-4">
				<Button type="button" variant="outline" onclick={() => (dialogOpen = false)}>Batal</Button>
				<Button type="submit" disabled={submitting}>
					{submitting ? 'Menyimpan...' : 'Simpan Info'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<AlertDialog.Root bind:open={alertDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Hapus Info Kado?</AlertDialog.Title>
			<AlertDialog.Description>
				Tindakan ini tidak dapat dibatalkan. Info kado ini akan dihapus dari undangan Anda.
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
