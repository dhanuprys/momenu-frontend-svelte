<script lang="ts">
	import { page } from '$app/stores';
	import { DressCodeService } from '$lib/services/index.js';
	import type { DressCode, DressCodeRequest } from '$lib/types/index.js';
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { Plus, Edit2, Trash2, Shirt, Palette } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import PageComposer from '$lib/components/layout/page-composer.svelte';

	let projectId = $derived($page.params.projectId!);
	let dressCodes = $state<DressCode[]>([]);
	let loading = $state(true);

	let dialogOpen = $state(false);
	let submitting = $state(false);
	let editingId = $state<number | null>(null);

	let alertDialogOpen = $state(false);
	let itemToDelete = $state<number | null>(null);

	let formData = $state<DressCodeRequest>({
		label: '',
		colors: ['#000000']
	});

	async function loadDressCodes() {
		loading = true;
		try {
			const res = await DressCodeService.list(projectId);
			dressCodes = res || [];
		} catch (e) {
			console.error('Failed to load dress codes', e);
			toast.error('Gagal memuat aturan pakaian');
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadDressCodes();
	});

	function openAddDialog() {
		editingId = null;
		formData = {
			label: '',
			colors: ['#000000']
		};
		dialogOpen = true;
	}

	function openEditDialog(dc: DressCode) {
		editingId = dc.id;
		formData = {
			label: dc.label,
			colors: [...dc.colors]
		};
		dialogOpen = true;
	}

	function addColor() {
		if (formData.colors.length < 5) {
			formData.colors = [...formData.colors, '#ffffff'];
		}
	}

	function removeColor(index: number) {
		if (formData.colors.length > 1) {
			formData.colors = formData.colors.filter((_, i) => i !== index);
		}
	}

	function updateColor(index: number, val: string) {
		formData.colors[index] = val;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		submitting = true;

		try {
			if (editingId) {
				await DressCodeService.update(projectId, editingId, formData);
				toast.success('Aturan pakaian berhasil diperbarui');
			} else {
				await DressCodeService.create(projectId, formData);
				toast.success('Aturan pakaian berhasil ditambahkan');
			}

			dialogOpen = false;
			loadDressCodes();
		} catch (e) {
			toast.error(
				editingId ? 'Gagal memperbarui aturan pakaian' : 'Gagal menambahkan aturan pakaian'
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
			await DressCodeService.delete(projectId, itemToDelete);
			toast.success('Aturan pakaian berhasil dihapus');
			dressCodes = dressCodes.filter((dc) => dc.id !== itemToDelete);
		} catch (e) {
			toast.error('Gagal menghapus aturan pakaian');
		} finally {
			alertDialogOpen = false;
			itemToDelete = null;
		}
	}
</script>

<svelte:head>
	<title>Momenu | Dress Code</title>
</svelte:head>

<PageComposer>
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Aturan Pakaian (Dress Code)</h1>
			<p class="text-muted-foreground">Beri tahu tamu Anda tema warna pakaian untuk acara.</p>
		</div>
		<Button onclick={openAddDialog}>
			<Plus class="mr-2 h-4 w-4" />
			Tambah Aturan Pakaian
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
						<Skeleton class="h-10 w-full" />
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{:else if dressCodes.length === 0}
		<Empty.Root>
			<Empty.Header>
				<Empty.Media variant="icon">
					<Shirt class="h-12 w-12" />
				</Empty.Media>
				<Empty.Title>Belum ada dress code</Empty.Title>
				<Empty.Description>
					Tambahkan aturan pakaian untuk menyelaraskan tema warna tamu undangan Anda.
				</Empty.Description>
			</Empty.Header>
			<Empty.Content>
				<Button onclick={openAddDialog}>Tambah Dress Code Pertama</Button>
			</Empty.Content>
		</Empty.Root>
	{:else}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each dressCodes as dc (dc.id)}
				<Card.Root class="relative group border-2 hover:border-primary/50 transition-colors">
					<div
						class="absolute top-4 right-4 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
					>
						<Button
							variant="secondary"
							size="icon"
							class="h-8 w-8"
							onclick={() => openEditDialog(dc)}
						>
							<Edit2 class="h-4 w-4" />
						</Button>
						<Button
							variant="destructive"
							size="icon"
							class="h-8 w-8"
							onclick={() => confirmDelete(dc.id)}
						>
							<Trash2 class="h-4 w-4" />
						</Button>
					</div>
					<Card.Header class="pb-4">
						<Card.Title class="text-xl flex items-center gap-2">
							<Shirt class="h-5 w-5 text-muted-foreground" />
							{dc.label}
						</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
							<Palette class="h-4 w-4" />
							<span>Warna Pakaian:</span>
						</div>
						<div class="h-10 w-full rounded-md border shadow-sm overflow-hidden flex">
							{#each dc.colors as color}
								<div
									class="h-full flex-1 transition-transform hover:scale-105"
									style="background-color: {color};"
									title={color}
								></div>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}
</PageComposer>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content class="sm:max-w-[425px]">
		<Dialog.Header>
			<Dialog.Title>{editingId ? 'Edit Dress Code' : 'Tambah Dress Code'}</Dialog.Title>
			<Dialog.Description>
				Tentukan nama aturan dan pilih palet warna yang diinginkan.
			</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="space-y-4 py-4">
			<div class="space-y-2">
				<Label for="label">Aturan Pakaian (Contoh: Keluarga Pria)</Label>
				<Input
					id="label"
					bind:value={formData.label}
					placeholder="Masukkan kategori pakaian..."
					required
				/>
			</div>

			<div class="space-y-4">
				<Label class="flex items-center gap-2">
					<Palette class="h-4 w-4" />
					Palet Warna
				</Label>
				<div class="grid grid-cols-5 gap-4 px-2 py-2">
					{#each formData.colors as color, i}
						<div class="relative group/color aspect-square">
							<!-- Color circle -->
							<div
								class="absolute inset-0 rounded-full border border-border shadow-sm overflow-hidden flex items-center justify-center bg-white transition-transform group-hover/color:scale-105"
							>
								<div
									class="absolute inset-0 pointer-events-none transition-colors"
									style="background-color: {color};"
								></div>
								<div
									class="absolute inset-0 flex items-center justify-center opacity-0 group-hover/color:opacity-100 bg-black/20 pointer-events-none transition-opacity"
								>
									<Palette class="h-5 w-5 text-white drop-shadow-md" />
								</div>
								<input
									type="color"
									value={color}
									oninput={(e) => updateColor(i, e.currentTarget.value)}
									class="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer opacity-0"
									title="Pilih Warna"
								/>
							</div>

							<!-- Delete button (outside overflow hidden) -->
							{#if formData.colors.length > 1}
								<button
									type="button"
									class="absolute -top-2 -right-2 z-10 bg-destructive text-destructive-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm opacity-0 group-hover/color:opacity-100 transition-all shadow-md hover:scale-110 hover:bg-destructive/90"
									onclick={(e) => {
										e.stopPropagation();
										removeColor(i);
									}}
									title="Hapus Warna"
								>
									&times;
								</button>
							{/if}
						</div>
					{/each}

					{#if formData.colors.length < 5}
						<button
							type="button"
							class="relative aspect-square rounded-full border-2 border-dashed border-muted hover:border-primary hover:text-primary text-muted-foreground transition-all bg-muted/20 hover:bg-primary/5 flex items-center justify-center group/add hover:scale-105"
							onclick={addColor}
							title="Tambah Warna"
						>
							<Plus class="h-6 w-6 transition-transform group-hover/add:scale-110" />
						</button>
					{/if}
				</div>
				<p class="text-xs text-muted-foreground">
					Anda dapat menambahkan hingga 5 warna. Klik kotak warna untuk mengubah warna.
				</p>
			</div>

			<Dialog.Footer class="pt-4">
				<Button type="button" variant="outline" onclick={() => (dialogOpen = false)}>Batal</Button>
				<Button type="submit" disabled={submitting}>
					{submitting ? 'Menyimpan...' : 'Simpan Dress Code'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<AlertDialog.Root bind:open={alertDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Hapus Dress Code?</AlertDialog.Title>
			<AlertDialog.Description>
				Tindakan ini tidak dapat dibatalkan. Aturan pakaian ini akan dihapus dari undangan Anda.
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
