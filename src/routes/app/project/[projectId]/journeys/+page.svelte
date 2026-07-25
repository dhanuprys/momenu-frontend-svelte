<script lang="ts">
	import { page } from '$app/stores';
	import { JourneyService } from '$lib/services/index';
	import type { Journey, JourneyRequest } from '$lib/types/index';
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import * as Empty from '$lib/components/ui/empty/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { Plus, Heart, Edit2, Trash2, ArrowUp, ArrowDown } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import PageComposer from '$lib/components/layout/page-composer.svelte';

	let projectId = $derived($page.params.projectId!);
	let journeys = $state<Journey[]>([]);
	let loading = $state(true);

	let dialogOpen = $state(false);
	let submitting = $state(false);
	let editingId = $state<number | null>(null);

	let alertDialogOpen = $state(false);
	let itemToDelete = $state<number | null>(null);

	let formData = $state<JourneyRequest>({
		title: '',
		date: '',
		content: '',
		order: 0
	});

	async function loadJourneys() {
		loading = true;
		try {
			const res = await JourneyService.list(projectId);
			journeys = res || [];
		} catch (e) {
			console.error('Failed to load journeys', e);
			toast.error('Gagal memuat kisah perjalanan');
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadJourneys();
	});

	function openAddDialog() {
		editingId = null;
		formData = {
			title: '',
			date: '',
			content: '',
			order: journeys.length > 0 ? journeys[journeys.length - 1].order + 1 : 0
		};
		dialogOpen = true;
	}

	function openEditDialog(journey: Journey) {
		editingId = journey.id;
		formData = {
			title: journey.title,
			date: journey.date,
			content: journey.content,
			order: journey.order
		};
		dialogOpen = true;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		submitting = true;

		try {
			const payload: JourneyRequest = {
				title: formData.title,
				date: formData.date,
				content: formData.content,
				order: formData.order
			};

			if (editingId) {
				await JourneyService.update(projectId, editingId, payload);
				toast.success('Kisah perjalanan berhasil diperbarui');
			} else {
				await JourneyService.create(projectId, payload);
				toast.success('Kisah perjalanan berhasil ditambahkan');
			}

			dialogOpen = false;
			loadJourneys();
		} catch {
			toast.error(editingId ? 'Gagal memperbarui' : 'Gagal menambahkan');
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
			await JourneyService.delete(projectId, itemToDelete);
			toast.success('Kisah perjalanan berhasil dihapus');
			journeys = journeys.filter((j) => j.id !== itemToDelete);
		} catch {
			toast.error('Gagal menghapus');
		} finally {
			alertDialogOpen = false;
			itemToDelete = null;
		}
	}

	async function moveJourney(index: number, direction: 'up' | 'down') {
		if (direction === 'up' && index === 0) return;
		if (direction === 'down' && index === journeys.length - 1) return;

		const targetIndex = direction === 'up' ? index - 1 : index + 1;
		const current = journeys[index];
		const target = journeys[targetIndex];

		let newCurrentOrder = target.order;
		let newTargetOrder = current.order;
		if (newCurrentOrder === newTargetOrder) {
			newCurrentOrder = targetIndex;
			newTargetOrder = index;
		}

		current.order = newCurrentOrder;
		target.order = newTargetOrder;

		journeys[index] = target;
		journeys[targetIndex] = current;
		journeys = [...journeys];

		try {
			await Promise.all([
				JourneyService.update(projectId, current.id, {
					title: current.title,
					date: current.date,
					content: current.content,
					order: current.order
				}),
				JourneyService.update(projectId, target.id, {
					title: target.title,
					date: target.date,
					content: target.content,
					order: target.order
				})
			]);
		} catch {
			toast.error('Gagal memperbarui urutan');
			loadJourneys();
		}
	}
</script>

<svelte:head>
	<title>Momenu | Kisah Perjalanan</title>
</svelte:head>

<PageComposer class="max-w-4xl">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Kisah Perjalanan</h1>
			<p class="text-muted-foreground">Ceritakan momen spesial perjalanan hubungan Anda.</p>
		</div>
		<Button onclick={openAddDialog} class="gap-2 shrink-0">
			<Plus class="h-4 w-4" />
			Tambah Momen
		</Button>
	</div>

	{#if loading}
		<div
			class="flex flex-col gap-8 max-w-3xl relative border-l-2 border-primary/20 ml-3 pl-8 py-4 mt-4"
		>
			<!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
			{#each Array(3) as _, i (i)}
				<div class="relative">
					<div
						class="absolute -left-[49px] top-3 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary/30 bg-background z-10"
					>
						<Skeleton class="h-4 w-4 rounded-full" />
					</div>
					<Card.Root class="relative border bg-card/50">
						<Card.Header class="pb-3">
							<Skeleton class="h-5 w-24 rounded-full mb-3" />
							<Skeleton class="h-6 w-2/3" />
						</Card.Header>
						<Card.Content class="space-y-2">
							<Skeleton class="h-4 w-full" />
							<Skeleton class="h-4 w-5/6" />
							<Skeleton class="h-4 w-4/6" />
						</Card.Content>
					</Card.Root>
				</div>
			{/each}
		</div>
	{:else if journeys.length === 0}
		<Empty.Root>
			<Empty.Header>
				<Empty.Media variant="icon">
					<Heart class="h-12 w-12 text-pink-500" />
				</Empty.Media>
				<Empty.Title>Belum ada cerita</Empty.Title>
				<Empty.Description>
					Tambahkan momen-momen penting dari perjalanan hubungan Anda seperti saat pertama kali
					bertemu atau jadian.
				</Empty.Description>
			</Empty.Header>
			<Empty.Content>
				<Button onclick={openAddDialog}>Tambah Momen Pertama</Button>
			</Empty.Content>
		</Empty.Root>
	{:else}
		<div
			class="flex flex-col gap-8 max-w-3xl relative border-l-2 border-primary/20 ml-3 pl-8 py-4 mt-4"
		>
			{#each journeys as journey, index (journey.id)}
				<div class="relative">
					<div
						class="absolute -left-[49px] top-3 flex h-8 w-8 items-center justify-center rounded-full border-2 border-primary bg-background text-primary shadow-sm z-10"
					>
						<Heart class="h-4 w-4 fill-primary/20" />
					</div>
					<Card.Root
						class="relative group border bg-card/50 backdrop-blur-sm hover:bg-card hover:shadow-md hover:border-primary/40 transition-all duration-300 sm:hover:-translate-y-1"
					>
						<div
							class="absolute top-4 right-4 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
						>
							{#if index > 0}
								<Button
									variant="secondary"
									size="icon"
									class="h-8 w-8"
									title="Pindah Ke Atas"
									onclick={() => moveJourney(index, 'up')}
								>
									<ArrowUp class="h-4 w-4" />
								</Button>
							{/if}
							{#if index < journeys.length - 1}
								<Button
									variant="secondary"
									size="icon"
									class="h-8 w-8"
									title="Pindah Ke Bawah"
									onclick={() => moveJourney(index, 'down')}
								>
									<ArrowDown class="h-4 w-4" />
								</Button>
							{/if}
							<Button
								variant="secondary"
								size="icon"
								class="h-8 w-8"
								title="Edit Cerita"
								onclick={() => openEditDialog(journey)}
							>
								<Edit2 class="h-4 w-4" />
							</Button>
							<Button
								variant="destructive"
								size="icon"
								class="h-8 w-8"
								title="Hapus Cerita"
								onclick={() => confirmDelete(journey.id)}
							>
								<Trash2 class="h-4 w-4" />
							</Button>
						</div>
						<Card.Header class="pb-3">
							<div
								class="inline-flex w-fit items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary mb-3"
							>
								{journey.date}
							</div>
							<Card.Title class="text-xl leading-snug">{journey.title}</Card.Title>
						</Card.Header>
						<Card.Content>
							<p class="whitespace-pre-line text-muted-foreground leading-relaxed">
								{journey.content}
							</p>
						</Card.Content>
					</Card.Root>
				</div>
			{/each}
		</div>
	{/if}
</PageComposer>

<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>{editingId ? 'Edit Cerita' : 'Tambah Cerita Baru'}</Dialog.Title>
			<Dialog.Description>Bagikan momen spesial Anda.</Dialog.Description>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="space-y-4 py-4">
			<div class="space-y-2">
				<Label for="title">Judul Momen *</Label>
				<Input
					id="title"
					bind:value={formData.title}
					placeholder="Contoh: Pertama Kali Bertemu"
					required
				/>
			</div>

			<div class="space-y-2">
				<Label for="date">Tanggal/Waktu *</Label>
				<Input
					id="date"
					bind:value={formData.date}
					placeholder="Contoh: 14 Februari 2020 atau 2018"
					required
				/>
			</div>

			<div class="space-y-2">
				<Label for="content">Isi Cerita *</Label>
				<Textarea
					id="content"
					bind:value={formData.content}
					placeholder="Ceritakan momen tersebut secara singkat..."
					class="min-h-[100px]"
					required
				/>
			</div>

			<Dialog.Footer class="pt-4">
				<Button type="button" variant="outline" onclick={() => (dialogOpen = false)}>Batal</Button>
				<Button type="submit" disabled={submitting}>
					{submitting ? 'Menyimpan...' : 'Simpan Cerita'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<AlertDialog.Root bind:open={alertDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Hapus Momen?</AlertDialog.Title>
			<AlertDialog.Description>
				Tindakan ini tidak dapat dibatalkan. Cerita ini akan dihapus dari undangan Anda.
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
