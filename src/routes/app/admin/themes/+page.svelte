<script lang="ts">
	import { AdminService } from '$lib/services/index';
	import { onMount } from 'svelte';
	import PageComposer from '$lib/components/layout/page-composer.svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Edit, Image as ImageIcon } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import { UploadService } from '$lib/services/index';
	import * as Sheet from '$lib/components/ui/sheet/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { getMediaUrl } from '$lib/utils';

	let themes = $state<any[]>([]);
	let loading = $state(true);

	// Edit state
	let isEditDialogOpen = $state(false);
	let editingTheme = $state<any | null>(null);
	let editPrice = $state<number>(0);
	let editThumbnail = $state('');
	let editDescription = $state('');
	let isSaving = $state(false);
	let isUploading = $state(false);

	onMount(async () => {
		loadThemes();
	});

	async function loadThemes() {
		loading = true;
		try {
			themes = await AdminService.listThemes();
		} catch (error) {
			toast.error('Gagal memuat daftar tema');
		} finally {
			loading = false;
		}
	}

	function openEditDialog(theme: any) {
		editingTheme = theme;
		editPrice = theme.price || 0;
		editThumbnail = theme.thumbnail || '';
		editDescription = theme.description || '';
		isEditDialogOpen = true;
	}

	async function handleUpload(e: Event) {
		const target = e.target as HTMLInputElement;
		if (!target.files || target.files.length === 0) return;
		const file = target.files[0];
		isUploading = true;
		try {
			const res = await UploadService.adminUpload(file, 'image');
			editThumbnail = res.url;
			toast.success('Thumbnail berhasil diunggah');
		} catch (error) {
			toast.error('Gagal mengunggah thumbnail');
		} finally {
			isUploading = false;
			target.value = '';
		}
	}

	async function saveTheme() {
		if (!editingTheme) return;
		isSaving = true;
		try {
			const updated = await AdminService.updateTheme(editingTheme.id, {
				price: editPrice,
				thumbnail: editThumbnail,
				description: editDescription
			});

			// Update local state
			themes = themes.map((t) => (t.id === editingTheme.id ? updated : t));

			toast.success('Tema berhasil diperbarui');
			isEditDialogOpen = false;
		} catch (error) {
			toast.error('Gagal memperbarui tema');
		} finally {
			isSaving = false;
		}
	}
</script>

<svelte:head>
	<title>Momenu | Manajemen Tema</title>
</svelte:head>

<PageComposer
	title="Tema"
	description="Kelola detail tema visual seperti harga, deskripsi, dan gambar pratinjau (thumbnail)."
>
	<div class="rounded-md border bg-card overflow-hidden">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Thumbnail</Table.Head>
					<Table.Head>ID / Nama</Table.Head>
					<Table.Head>Jenis Acara</Table.Head>
					<Table.Head>Harga (Rp)</Table.Head>
					<Table.Head>Penggunaan</Table.Head>
					<Table.Head class="text-right">Aksi</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#if loading}
					{#each Array(5) as _}
						<Table.Row>
							<Table.Cell><Skeleton class="h-12 w-20 rounded-md" /></Table.Cell>
							<Table.Cell
								><Skeleton class="h-4 w-32 mb-2" /><Skeleton class="h-3 w-24" /></Table.Cell
							>
							<Table.Cell><Skeleton class="h-4 w-20" /></Table.Cell>
							<Table.Cell><Skeleton class="h-4 w-24" /></Table.Cell>
							<Table.Cell><Skeleton class="h-4 w-20" /></Table.Cell>
							<Table.Cell class="text-right"><Skeleton class="h-8 w-8 ml-auto" /></Table.Cell>
						</Table.Row>
					{/each}
				{:else if themes.length === 0}
					<Table.Row>
						<Table.Cell colspan={6} class="text-center py-6 text-muted-foreground">
							Tidak ada tema ditemukan.
						</Table.Cell>
					</Table.Row>
				{:else}
					{#each themes as theme}
						<Table.Row>
							<Table.Cell>
								{#if theme.thumbnail}
									<img
										src={theme.thumbnail.startsWith('http')
											? theme.thumbnail
											: getMediaUrl(theme.thumbnail)}
										alt={theme.name}
										class="h-12 w-20 object-cover rounded-md border"
									/>
								{:else}
									<div
										class="h-12 w-20 bg-muted rounded-md border flex items-center justify-center"
									>
										<ImageIcon class="size-4 text-muted-foreground" />
									</div>
								{/if}
							</Table.Cell>
							<Table.Cell>
								<div class="font-medium">{theme.name}</div>
								<div class="text-xs text-muted-foreground">{theme.id}</div>
							</Table.Cell>
							<Table.Cell>
								<div
									class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground"
								>
									{theme.event_type.replace('_', ' ').toUpperCase()}
								</div>
							</Table.Cell>
							<Table.Cell class="font-medium">
								{theme.price ? `Rp ${theme.price.toLocaleString('id-ID')}` : 'Gratis'}
							</Table.Cell>
							<Table.Cell>
								{theme.usage_count || 0} Acara
							</Table.Cell>
							<Table.Cell class="text-right">
								<Button variant="outline" size="sm" onclick={() => openEditDialog(theme)}>
									<Edit class="h-4 w-4 mr-2" /> Edit
								</Button>
							</Table.Cell>
						</Table.Row>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>
</PageComposer>

<Sheet.Root bind:open={isEditDialogOpen}>
	<Sheet.Content class="sm:max-w-[425px] overflow-y-auto">
		<Sheet.Header>
			<Sheet.Title>Edit Tema</Sheet.Title>
			<Sheet.Description>
				Perbarui harga, deskripsi, dan thumbnail untuk tema <span
					class="font-semibold text-foreground">{editingTheme?.name}</span
				>.
			</Sheet.Description>
		</Sheet.Header>
		<div class="grid gap-6 py-6 px-6">
			<div class="grid gap-2">
				<Label for="price">Harga (Rp)</Label>
				<Input id="price" type="number" bind:value={editPrice} placeholder="Contoh: 79000" />
				<p class="text-[10px] text-muted-foreground">Isi 0 jika tema gratis.</p>
			</div>

			<div class="grid gap-2">
				<Label>Thumbnail (Gambar Pratinjau)</Label>
				<div class="flex flex-col gap-3">
					{#if editThumbnail}
						<div class="relative rounded-md overflow-hidden border w-full aspect-video bg-muted">
							<img
								src={editThumbnail.startsWith('http') ? editThumbnail : getMediaUrl(editThumbnail)}
								alt="Thumbnail preview"
								class="w-full h-full object-cover"
							/>
						</div>
					{/if}

					<div class="flex items-center gap-2">
						<Input
							id="thumbnail-file"
							type="file"
							accept="image/*"
							onchange={handleUpload}
							disabled={isUploading}
							class="flex-1"
						/>
						{#if isUploading}
							<span class="text-xs text-muted-foreground animate-pulse">Mengunggah...</span>
						{/if}
					</div>
					<p class="text-[10px] text-muted-foreground">
						Atau Anda bisa membiarkannya menggunakan thumbnail yang sudah ada.
					</p>
				</div>
			</div>

			<div class="grid gap-2">
				<Label for="description">Deskripsi</Label>
				<Textarea
					id="description"
					bind:value={editDescription}
					rows={5}
					placeholder="Deskripsi singkat tema..."
				/>
			</div>
		</div>
		<Sheet.Footer>
			<Button variant="outline" onclick={() => (isEditDialogOpen = false)}>Batal</Button>
			<Button onclick={saveTheme} disabled={isSaving || isUploading}>
				{isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
			</Button>
		</Sheet.Footer>
	</Sheet.Content>
</Sheet.Root>
