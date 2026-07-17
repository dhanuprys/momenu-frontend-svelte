<script lang="ts">
	import { page } from '$app/stores';
	import { ScheduleService } from '$lib/services/index.js';
	import type { Schedule, ScheduleRequest } from '$lib/types/index.js';
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
	import { Plus, MapPin, Clock, CalendarDays, Edit2, Trash2 } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import PageComposer from '$lib/components/layout/page-composer.svelte';

	let projectId = $derived($page.params.projectId!);
	let schedules = $state<Schedule[]>([]);
	let loading = $state(true);

	let dialogOpen = $state(false);
	let submitting = $state(false);
	let editingId = $state<number | null>(null);

	let alertDialogOpen = $state(false);
	let itemToDelete = $state<number | null>(null);

	let formData = $state<ScheduleRequest>({
		title: '',
		start_time: '',
		end_time: '',
		timezone: 'Asia/Jakarta',
		location: '',
		map_url: ''
	});

	async function loadSchedules() {
		loading = true;
		try {
			const res = await ScheduleService.list(projectId);
			schedules = (res || []).sort(
				(a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
			);
		} catch (e) {
			console.error('Failed to load schedules', e);
			toast.error('Gagal memuat jadwal');
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadSchedules();
	});

	function openAddDialog() {
		editingId = null;
		formData = {
			title: '',
			start_time: '',
			end_time: '',
			timezone: 'Asia/Jakarta',
			location: '',
			map_url: ''
		};
		dialogOpen = true;
	}

	function toDatetimeLocal(isoString: string, timeZone: string) {
		if (!isoString) return '';
		const d = new Date(isoString);
		
		const formatter = new Intl.DateTimeFormat('en-CA', {
			timeZone,
			year: 'numeric',
			month: '2-digit',
			day: '2-digit',
			hour: '2-digit',
			minute: '2-digit',
			hour12: false
		});
		
		const parts = formatter.formatToParts(d);
		let year, month, day, hour, minute;
		for (const part of parts) {
			if (part.type === 'year') year = part.value;
			if (part.type === 'month') month = part.value;
			if (part.type === 'day') day = part.value;
			if (part.type === 'hour') hour = part.value;
			if (part.type === 'minute') minute = part.value;
		}
		
		if (hour === '24') hour = '00';
		
		return `${year}-${month}-${day}T${hour}:${minute}`;
	}

	function openEditDialog(schedule: Schedule) {
		editingId = schedule.id;
		formData = {
			title: schedule.title,
			start_time: toDatetimeLocal(schedule.start_time, schedule.timezone || 'Asia/Jakarta'),
			end_time: schedule.end_time && !schedule.end_time.startsWith('000') ? toDatetimeLocal(schedule.end_time, schedule.timezone || 'Asia/Jakarta') : '',
			timezone: schedule.timezone,
			location: schedule.location || '',
			map_url: schedule.map_url || ''
		};
		dialogOpen = true;
	}

	async function handleSubmit(e: Event) {
		e.preventDefault();
		submitting = true;

		try {
			const tzOffsets: Record<string, string> = {
				'Asia/Jakarta': '+07:00',
				'Asia/Makassar': '+08:00',
				'Asia/Jayapura': '+09:00'
			};
			const offset = tzOffsets[formData.timezone] || '+07:00';

			const payload: ScheduleRequest = {
				title: formData.title,
				start_time: formData.start_time + ':00' + offset,
				end_time: formData.end_time ? formData.end_time + ':00' + offset : undefined,
				timezone: formData.timezone,
				location: formData.location || undefined,
				map_url: formData.map_url || undefined
			};

			if (editingId) {
				await ScheduleService.update(projectId, editingId, payload);
				toast.success('Jadwal berhasil diperbarui');
			} else {
				await ScheduleService.create(projectId, payload);
				toast.success('Jadwal berhasil ditambahkan');
			}

			dialogOpen = false;
			loadSchedules();
		} catch (e) {
			toast.error(editingId ? 'Gagal memperbarui jadwal' : 'Gagal menambahkan jadwal');
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
			await ScheduleService.delete(projectId, itemToDelete);
			toast.success('Jadwal berhasil dihapus');
			schedules = schedules.filter((s) => s.id !== itemToDelete);
		} catch (e) {
			toast.error('Gagal menghapus jadwal');
		} finally {
			alertDialogOpen = false;
			itemToDelete = null;
		}
	}

	function formatDate(dateStr: string) {
		const schedule = schedules.find((s) => s.start_time === dateStr || s.end_time === dateStr);
		const tz = schedule?.timezone || 'Asia/Jakarta';

		return new Date(dateStr).toLocaleString('id-ID', {
			weekday: 'long',
			day: 'numeric',
			month: 'long',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
			timeZone: tz
		});
	}
</script>

<svelte:head>
	<title>Momenu | Jadwal</title>
</svelte:head>

<PageComposer class="max-w-4xl">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Jadwal</h1>
			<p class="text-muted-foreground">Kelola rangkaian jadwal pernikahan Anda.</p>
		</div>
		<Button onclick={openAddDialog} class="gap-2 shrink-0">
			<Plus class="h-4 w-4" />
			Tambah Jadwal
		</Button>
	</div>

	{#if loading}
		<div class="flex flex-col gap-4 max-w-3xl">
			{#each Array(2) as _}
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
	{:else if schedules.length === 0}
		<Empty.Root>
			<Empty.Header>
				<Empty.Media variant="icon">
					<CalendarDays class="h-12 w-12" />
				</Empty.Media>
				<Empty.Title>Belum ada jadwal</Empty.Title>
				<Empty.Description>
					Tambahkan rangkaian jadwal seperti Akad Nikah, Pemberkatan, atau Resepsi.
				</Empty.Description>
			</Empty.Header>
			<Empty.Content>
				<Button onclick={openAddDialog}>Tambah Jadwal Pertama</Button>
			</Empty.Content>
		</Empty.Root>
	{:else}
		<div class="flex flex-col gap-4 max-w-3xl">
			{#each schedules as schedule (schedule.id)}
				<Card.Root class="relative group border-2 hover:border-primary/50 transition-colors">
					<div
						class="absolute top-4 right-4 flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
					>
						<Button
							variant="secondary"
							size="icon"
							class="h-8 w-8"
							onclick={() => openEditDialog(schedule)}
						>
							<Edit2 class="h-4 w-4" />
						</Button>
						<Button
							variant="destructive"
							size="icon"
							class="h-8 w-8"
							onclick={() => confirmDelete(schedule.id)}
						>
							<Trash2 class="h-4 w-4" />
						</Button>
					</div>
					<Card.Header>
						<Card.Title>{schedule.title}</Card.Title>
					</Card.Header>
					<Card.Content class="space-y-4">
						<div class="flex gap-3 text-sm">
							<Clock class="h-5 w-5 text-muted-foreground shrink-0" />
							<div>
								<div class="font-medium text-foreground">{formatDate(schedule.start_time)}</div>
								{#if schedule.end_time && !schedule.end_time.startsWith('000')}
									<div class="text-muted-foreground">s/d {formatDate(schedule.end_time)}</div>
								{/if}
								<div class="text-muted-foreground text-xs mt-0.5">{schedule.timezone}</div>
							</div>
						</div>

						{#if schedule.location}
							<div class="flex gap-3 text-sm">
								<MapPin class="h-5 w-5 text-muted-foreground shrink-0" />
								<div>
									<div class="text-foreground">{schedule.location}</div>
									{#if schedule.map_url}
										<a
											href={schedule.map_url}
											target="_blank"
											class="text-primary hover:underline text-xs mt-1 inline-block">Lihat Peta</a
										>
									{/if}
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
	<Dialog.Content class="sm:max-w-[500px]">
		<Dialog.Header>
			<Dialog.Title>{editingId ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}</Dialog.Title>
			<Dialog.Description>Isi detail informasi jadwal. Klik simpan saat selesai.</Dialog.Description
			>
		</Dialog.Header>

		<form onsubmit={handleSubmit} class="space-y-4 py-4">
			<div class="space-y-2">
				<Label for="title">Nama Jadwal *</Label>
				<Input
					id="title"
					bind:value={formData.title}
					placeholder="Contoh: Akad Nikah / Resepsi"
					required
				/>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<div class="space-y-2">
					<Label for="start_time">Waktu Mulai *</Label>
					<Input id="start_time" type="datetime-local" bind:value={formData.start_time} required />
				</div>
				<div class="space-y-2">
					<Label for="end_time">Waktu Selesai (Opsional)</Label>
					<Input id="end_time" type="datetime-local" bind:value={formData.end_time} />
				</div>
			</div>

			<div class="space-y-2">
				<Label for="timezone">Zona Waktu</Label>
				<Select.Root type="single" name="timezone" bind:value={formData.timezone}>
					<Select.Trigger class="w-full">
						{formData.timezone === 'Asia/Jakarta'
							? 'WIB (Asia/Jakarta)'
							: formData.timezone === 'Asia/Makassar'
								? 'WITA (Asia/Makassar)'
								: formData.timezone === 'Asia/Jayapura'
									? 'WIT (Asia/Jayapura)'
									: formData.timezone || 'Pilih Zona Waktu'}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value="Asia/Jakarta" label="WIB (Asia/Jakarta)"
							>WIB (Asia/Jakarta)</Select.Item
						>
						<Select.Item value="Asia/Makassar" label="WITA (Asia/Makassar)"
							>WITA (Asia/Makassar)</Select.Item
						>
						<Select.Item value="Asia/Jayapura" label="WIT (Asia/Jayapura)"
							>WIT (Asia/Jayapura)</Select.Item
						>
					</Select.Content>
				</Select.Root>
			</div>

			<div class="space-y-2">
				<Label for="location">Lokasi / Alamat</Label>
				<Input
					id="location"
					bind:value={formData.location}
					placeholder="Nama Gedung, Alamat lengkap..."
				/>
			</div>

			<div class="space-y-2">
				<Label for="map_url">Tautan Peta (Google Maps)</Label>
				<Input
					id="map_url"
					type="url"
					bind:value={formData.map_url}
					placeholder="https://maps.google.com/..."
				/>
			</div>

			<Dialog.Footer class="pt-4">
				<Button type="button" variant="outline" onclick={() => (dialogOpen = false)}>Batal</Button>
				<Button type="submit" disabled={submitting}>
					{submitting ? 'Menyimpan...' : 'Simpan Jadwal'}
				</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<AlertDialog.Root bind:open={alertDialogOpen}>
	<AlertDialog.Content>
		<AlertDialog.Header>
			<AlertDialog.Title>Hapus Jadwal?</AlertDialog.Title>
			<AlertDialog.Description>
				Tindakan ini tidak dapat dibatalkan. Data jadwal ini akan dihapus dari undangan Anda.
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
