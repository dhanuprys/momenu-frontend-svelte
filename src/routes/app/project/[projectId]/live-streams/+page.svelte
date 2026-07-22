<script lang="ts">
	import { page } from '$app/stores';
	import { LiveStreamService } from '$lib/services/index';
	import type { LiveStream, LiveStreamRequest } from '$lib/types/index';
	import type { LiveStreamPlatform } from '$lib/types/enums';
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
	import { Plus, Trash2, Edit2, Video, Link2, Play } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import PageComposer from '$lib/components/layout/page-composer.svelte';

	let projectId = $derived($page.params.projectId!);
	let streams = $state<LiveStream[]>([]);
	let loading = $state(true);

	let dialogOpen = $state(false);
	let submitting = $state(false);
	let editingId = $state<number | null>(null);

	let alertDialogOpen = $state(false);
	let itemToDelete = $state<number | null>(null);

	let formData = $state<LiveStreamRequest>({
		platform: 'youtube',
		url: ''
	});

	const PLATFORMS: { value: LiveStreamPlatform; label: string }[] = [
		{ value: 'youtube', label: 'YouTube' },
		{ value: 'zoom', label: 'Zoom' },
		{ value: 'instagram', label: 'Instagram Live' },
		{ value: 'tiktok', label: 'TikTok Live' },
		{ value: 'gmeet', label: 'Google Meet' },
		{ value: 'other', label: 'Lainnya' }
	];

	const platformColors: Record<string, string> = {
		youtube: 'bg-red-500/15 text-red-600',
		instagram: 'bg-pink-500/15 text-pink-600',
		tiktok: 'bg-zinc-800/15 text-zinc-900 dark:bg-zinc-200/15 dark:text-zinc-100',
		zoom: 'bg-blue-500/15 text-blue-600',
		google_meet: 'bg-emerald-500/15 text-emerald-600',
		other: 'bg-primary/15 text-primary'
	};

	async function loadStreams() {
		loading = true;
		try {
			const res = await LiveStreamService.list(projectId);
			streams = res || [];
		} catch (e) {
			console.error('Failed to load live streams', e);
			toast.error('Gagal memuat link live streaming');
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadStreams();
	});

	function openAddDialog() {
		editingId = null;
		formData = {
			platform: 'youtube',
			url: ''
		};
		dialogOpen = true;
	}

	function openEditDialog(stream: LiveStream) {
		editingId = stream.id;
		formData = {
			platform: stream.platform,
			url: stream.url
		};
		dialogOpen = true;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		submitting = true;

		try {
			if (editingId) {
				await LiveStreamService.update(projectId, editingId, formData);
				toast.success('Live stream berhasil diperbarui');
			} else {
				await LiveStreamService.create(projectId, formData);
				toast.success('Live stream berhasil ditambahkan');
			}

			dialogOpen = false;
			await loadStreams();
		} catch (e) {
			toast.error(editingId ? 'Gagal memperbarui live stream' : 'Gagal menambahkan live stream');
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
			await LiveStreamService.delete(projectId, itemToDelete);
			toast.success('Link berhasil dihapus');
			streams = streams.filter((s) => s.id !== itemToDelete);
		} catch (e) {
			toast.error('Gagal menghapus link');
		} finally {
			alertDialogOpen = false;
			itemToDelete = null;
		}
	}

	function getPlatformLabel(platform: LiveStreamPlatform) {
		return PLATFORMS.find((p) => p.value === platform)?.label || platform;
	}
</script>

<svelte:head>
	<title>Momenu | Live Streaming</title>
</svelte:head>

<PageComposer>
	<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Live Streaming</h1>
			<p class="text-muted-foreground mt-2">
				Bagikan momen spesial Anda secara virtual melalui siaran langsung.
			</p>
		</div>
		<Button onclick={openAddDialog}>
			<Plus class="mr-2 h-4 w-4" />
			Tambah Link Baru
		</Button>
	</div>

	{#if loading}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each Array(2) as _}
				<Card.Root>
					<Card.Header>
						<Skeleton class="h-6 w-1/2" />
					</Card.Header>
					<Card.Content class="space-y-4">
						<Skeleton class="h-4 w-3/4" />
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{:else if streams.length === 0}
		<Empty.Root>
			<Empty.Header>
				<Empty.Media variant="icon">
					<Video class="h-12 w-12" />
				</Empty.Media>
				<Empty.Title>Belum ada Live Streaming</Empty.Title>
				<Empty.Description>
					Tambahkan link YouTube, Zoom, atau platform lainnya bagi tamu yang tidak dapat hadir
					secara langsung.
				</Empty.Description>
			</Empty.Header>
			<Empty.Content>
				<Button onclick={openAddDialog}>Tambah Link Pertama</Button>
			</Empty.Content>
		</Empty.Root>
	{:else}
		<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{#each streams as stream (stream.id)}
				<Card.Root class="relative group border-2 hover:border-primary/50 transition-colors">
					<div
						class="absolute top-4 right-4 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
					>
						<Button
							variant="secondary"
							size="icon"
							class="h-8 w-8"
							onclick={() => openEditDialog(stream)}
						>
							<Edit2 class="h-4 w-4" />
						</Button>
						<Button
							variant="destructive"
							size="icon"
							class="h-8 w-8"
							onclick={() => confirmDelete(stream.id)}
						>
							<Trash2 class="h-4 w-4" />
						</Button>
					</div>
					<Card.Header class="pb-2">
						<div class="flex items-center gap-3">
							<div
								class="p-2.5 rounded-full {platformColors[stream.platform] || platformColors.other}"
							>
								{#if stream.platform === 'youtube'}
									<Play class="h-5 w-5" />
								{:else}
									<Video class="h-5 w-5" />
								{/if}
							</div>
							<Card.Title class="text-lg">{getPlatformLabel(stream.platform)}</Card.Title>
						</div>
					</Card.Header>
					<Card.Content>
						<div class="mt-2 text-sm">
							<a
								href={stream.url}
								target="_blank"
								rel="noopener noreferrer"
								class="text-primary hover:underline break-all flex items-start gap-2"
							>
								<Link2 class="h-4 w-4 shrink-0 mt-0.5" />
								{stream.url}
							</a>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}
</PageComposer>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content class="sm:max-w-106.25">
		<Dialog.Header>
			<Dialog.Title>{editingId ? 'Edit Live Streaming' : 'Tambah Live Streaming'}</Dialog.Title>
			<Dialog.Description>Tentukan platform dan masukkan URL siaran langsung.</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="space-y-4 py-4">
			<div class="space-y-2">
				<Label for="platform">Platform</Label>
				<Select.Root type="single" name="platform" bind:value={formData.platform}>
					<Select.Trigger class="w-full">
						<span class="capitalize"
							>{formData.platform ? formData.platform.replace('_', ' ') : 'Pilih Platform'}</span
						>
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="youtube" label="YouTube">YouTube</Select.Item>
						<Select.Item value="instagram" label="Instagram">Instagram</Select.Item>
						<Select.Item value="tiktok" label="TikTok">TikTok</Select.Item>
						<Select.Item value="zoom" label="Zoom">Zoom</Select.Item>
						<Select.Item value="google_meet" label="Google Meet">Google Meet</Select.Item>
						<Select.Item value="other" label="Lainnya">Lainnya</Select.Item>
					</Select.Content>
				</Select.Root>
			</div>

			<div class="space-y-2">
				<Label for="url">URL Siaran Langsung</Label>
				<Input id="url" type="url" bind:value={formData.url} placeholder="https://..." required />
			</div>

			<Dialog.Footer class="pt-4">
				<Button type="button" variant="outline" onclick={() => (dialogOpen = false)}>Batal</Button>
				<Button type="submit" disabled={submitting}>
					{submitting ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Simpan Link'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<AlertDialog.Root bind:open={alertDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Hapus Link Live Streaming?</AlertDialog.Title>
			<AlertDialog.Description>
				Tindakan ini tidak dapat dibatalkan. Link ini akan dihapus dari undangan Anda.
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
