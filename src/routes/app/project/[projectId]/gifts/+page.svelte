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
		qr_code_image: ''
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
			qr_code_image: ''
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
			qr_code_image: gift.qr_code_image || ''
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
				if (!formData.qr_code_image) {
					toast.error('Harap upload atau masukkan URL gambar QRIS');
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
				{@const Icon = getGiftIcon(gift.type)}
				<Card.Root class="relative group border-2 hover:border-primary/50 transition-colors">
					<div
						class="absolute top-4 right-4 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
					>
						<Button
							variant="secondary"
							size="icon"
							class="h-8 w-8"
							onclick={() => openEditDialog(gift)}
						>
							<Edit2 class="h-4 w-4" />
						</Button>
						<Button
							variant="destructive"
							size="icon"
							class="h-8 w-8"
							onclick={() => confirmDelete(gift.id)}
						>
							<Trash2 class="h-4 w-4" />
						</Button>
					</div>
					<Card.Header class="pb-2">
						<div class="flex items-center gap-2">
							<Icon class="h-5 w-5 text-primary" />
							<Card.Title class="text-lg">{getGiftLabel(gift.type)}</Card.Title>
						</div>
					</Card.Header>
					<Card.Content>
						{#if gift.type === 'physical'}
							<div class="mt-2 space-y-1">
								<div class="text-sm text-muted-foreground font-medium">Alamat Pengiriman</div>
								<div class="text-sm leading-relaxed">{gift.mailing_address}</div>
							</div>
						{:else if gift.type === 'ewallet'}
							<div class="mt-2 space-y-3">
								<div>
									<div class="text-sm text-muted-foreground font-medium">E-Wallet / QRIS</div>
									<div class="font-medium">{gift.provider_name}</div>
								</div>
								<div class="mt-2">
									<div class="aspect-square w-full max-w-[200px] rounded-lg overflow-hidden border">
										<img
											src={getMediaUrl(gift.qr_code_image!)}
											alt="QRIS"
											class="w-full h-full object-cover"
										/>
									</div>
								</div>
							</div>
						{:else}
							<div class="mt-2 space-y-3">
								<div>
									<div class="text-sm text-muted-foreground font-medium">Bank</div>
									<div class="font-medium">{gift.provider_name}</div>
								</div>
								<div>
									<div class="text-sm text-muted-foreground font-medium">No. Rekening</div>
									<div class="font-medium text-lg tracking-wide flex items-center gap-2">
										{gift.account_number}
										<Button
											variant="ghost"
											size="icon"
											class="h-6 w-6 text-muted-foreground"
											onclick={() => copyToClipboard(gift.account_number!)}
										>
											<Copy class="h-3 w-3" />
										</Button>
									</div>
								</div>
								<div>
									<div class="text-sm text-muted-foreground font-medium">Atas Nama</div>
									<div class="font-medium">{gift.account_name}</div>
								</div>
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
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
					<Label>Upload QRIS *</Label>
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
