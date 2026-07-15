<script lang="ts">
	import { page } from '$app/stores';
	import { ProjectService } from '$lib/services/index.js';
	import type { Project, FeatureToggle, ProjectStatus } from '$lib/types/index.js';
	import { onMount } from 'svelte';
	import PageComposer from '$lib/components/layout/page-composer.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Switch } from '$lib/components/ui/switch/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { toast } from 'svelte-sonner';
	import {
		Copy,
		Trash2,
		ExternalLink,
		Globe,
		Pencil,
		Archive,
		RotateCcw,
		QrCode,
		Download
	} from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import MediaInput from '$lib/components/forms/media-input.svelte';
	import { UploadService } from '$lib/services/upload.service.js';
	import QRCode from 'qrcode';

	let projectId = $derived($page.params.projectId!);
	let project = $state<Project | null>(null);
	let featureToggle = $state<FeatureToggle | null>(null);
	let loading = $state(true);
	let savingProject = $state(false);
	let deletingProject = $state(false);

	let title = $state('');
	let slug = $state('');

	let thumbnailMode = $state<'file' | 'url'>('file');
	let thumbnailUrl = $state('');
	let thumbnailFile = $state<File | null>(null);
	let uploadProgress = $state(0);

	onMount(async () => {
		loading = true;
		try {
			const [projRes, toggleRes] = await Promise.all([
				ProjectService.get(projectId),
				ProjectService.getFeatureToggle(projectId)
			]);
			project = projRes;
			featureToggle = toggleRes;

			title = project.title;
			slug = project.slug;
		} catch (e) {
			console.error('Failed to load project settings', e);
			toast.error('Gagal memuat pengaturan acara');
		} finally {
			if (project?.sharing_thumbnail) {
				thumbnailMode = 'url';
				thumbnailUrl = project.sharing_thumbnail;
			}
			loading = false;
		}
	});

	async function saveProjectInfo() {
		if (!project) return;
		savingProject = true;
		try {
			// Basic frontend validation for slug
			if (!/^[a-z0-9-]+$/.test(slug)) {
				toast.error('Tautan hanya boleh berisi huruf kecil, angka, dan tanda hubung (-)');
				savingProject = false;
				return;
			}

			let finalThumbnail = project.sharing_thumbnail;

			if (thumbnailMode === 'file' && thumbnailFile) {
				const uploadRes = await UploadService.upload(
					thumbnailFile,
					'thumbnail',
					projectId,
					(percent) => {
						uploadProgress = percent;
					}
				);
				finalThumbnail = uploadRes.url;
				thumbnailUrl = uploadRes.url;
			} else if (thumbnailMode === 'url' && thumbnailUrl) {
				finalThumbnail = thumbnailUrl;
			}

			await ProjectService.update(projectId, {
				title: title,
				slug: slug,
				payload: project.payload,
				sharing_thumbnail: finalThumbnail
			});
			project.title = title;
			project.slug = slug;
			project.sharing_thumbnail = finalThumbnail;
			toast.success('Informasi acara berhasil disimpan');
		} catch (e: any) {
			const errorMsg =
				e.response?.data?.errors?.[0]?.message ||
				e.response?.data?.message ||
				e.message ||
				'Gagal menyimpan informasi acara';
			toast.error(errorMsg);
		} finally {
			savingProject = false;
			uploadProgress = 0;
		}
	}

	async function saveToggles() {
		if (!featureToggle) return;
		try {
			await ProjectService.updateFeatureToggle(projectId, {
				show_rsvp: featureToggle.show_rsvp,
				show_wishes: featureToggle.show_wishes,
				show_gallery: featureToggle.show_gallery,
				show_gifts: featureToggle.show_gifts,
				show_live_stream: featureToggle.show_live_stream,
				require_registered_guest: featureToggle.require_registered_guest
			});
			toast.success('Pengaturan fitur berhasil disimpan');
		} catch (e) {
			toast.error('Gagal menyimpan pengaturan fitur');
		}
	}

	async function deleteProject() {
		deletingProject = true;
		try {
			await ProjectService.delete(projectId);
			toast.success('Acara berhasil dihapus');
			goto('/app');
		} catch (e) {
			toast.error('Gagal menghapus acara');
			deletingProject = false;
		}
	}
</script>

<svelte:head>
	<title>Momenu | Pengaturan Acara</title>
</svelte:head>

<PageComposer>
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Pengaturan Acara</h1>
		<p class="text-muted-foreground">Konfigurasi informasi dan fitur undangan digital Anda.</p>
	</div>

	{#if loading}
		<div class="space-y-4">
			<div class="h-[200px] bg-muted/30 rounded-xl animate-pulse"></div>
			<div class="h-[300px] bg-muted/30 rounded-xl animate-pulse"></div>
		</div>
	{:else if project && featureToggle}
		<div class="grid gap-6">
			<Card.Root>
				<Card.Header>
					<Card.Title>Informasi Umum</Card.Title>
					<Card.Description>Pengaturan dasar untuk acara ini.</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-6">
					<div class="space-y-2">
						<Label for="title">Judul Acara</Label>
						<Input id="title" bind:value={title} class="max-w-md" />
					</div>

					<div class="space-y-2">
						<Label for="slug">Tautan Undangan</Label>
						<p class="text-[13px] text-muted-foreground mb-2">
							Ubah tautan untuk menyesuaikan URL undangan Anda. <br />
							<strong class="text-amber-600 dark:text-amber-500 font-medium">Perhatian:</strong> Mengubah
							tautan akan membuat tautan sebelumnya tidak berlaku!
						</p>
						<div class="flex gap-2 items-center flex-wrap sm:flex-nowrap">
							<div
								class="flex flex-1 items-center gap-0 rounded-md border bg-background text-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 overflow-hidden"
							>
								<div class="px-3 py-2 bg-muted/50 text-muted-foreground border-r shrink-0">
									{window.location.origin}/
								</div>
								<input
									id="slug"
									bind:value={slug}
									class="flex-1 bg-transparent px-3 py-2 outline-none w-full min-w-[100px]"
									placeholder="nama-pasangan"
								/>
							</div>
						</div>
					</div>

					<div class="space-y-3 pt-2">
						<div>
							<Label>Thumbnail Berbagi (Sosial Media)</Label>
							<p class="text-[13px] text-muted-foreground mt-1">
								Gambar ini akan muncul ketika Anda membagikan tautan undangan di WhatsApp,
								Instagram, Facebook, dll.
							</p>
						</div>
						<MediaInput
							mediaType="image"
							bind:mode={thumbnailMode}
							bind:url={thumbnailUrl}
							bind:file={thumbnailFile}
							bind:progress={uploadProgress}
							isSubmitting={savingProject && thumbnailMode === 'file' && thumbnailFile !== null}
						/>
					</div>

					<Button onclick={saveProjectInfo} disabled={savingProject} class="w-full sm:w-auto">
						{savingProject ? 'Menyimpan...' : 'Simpan Informasi'}
					</Button>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>Fitur Undangan</Card.Title>
					<Card.Description
						>Aktifkan atau nonaktifkan fitur yang ditampilkan pada undangan Anda.</Card.Description
					>
				</Card.Header>
				<Card.Content class="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-8">
					<div class="flex items-start justify-between gap-6">
						<div class="space-y-0.5 pr-4">
							<Label class="text-base cursor-pointer" for="toggle-rsvp"
								>Konfirmasi Kehadiran (RSVP)</Label
							>
							<p class="text-sm text-muted-foreground mt-1 leading-relaxed">
								Aktifkan form RSVP agar tamu dapat mengirimkan kepastian dan konfirmasi kehadiran
								mereka secara langsung melalui halaman undangan digital ini.
							</p>
						</div>
						<Switch
							id="toggle-rsvp"
							bind:checked={featureToggle.show_rsvp}
							onCheckedChange={saveToggles}
						/>
					</div>

					<div class="flex items-start justify-between gap-6">
						<div class="space-y-0.5 pr-4">
							<Label class="text-base cursor-pointer" for="toggle-wishes">Buku Tamu (Ucapan)</Label>
							<p class="text-sm text-muted-foreground mt-1 leading-relaxed">
								Sediakan buku tamu virtual di undangan Anda, sehingga tamu dapat menuliskan doa dan
								ucapan selamat secara publik untuk acara Anda.
							</p>
						</div>
						<Switch
							id="toggle-wishes"
							bind:checked={featureToggle.show_wishes}
							onCheckedChange={saveToggles}
						/>
					</div>

					<div class="flex items-start justify-between gap-6">
						<div class="space-y-0.5 pr-4">
							<Label class="text-base cursor-pointer" for="toggle-gallery">Galeri Media</Label>
							<p class="text-sm text-muted-foreground mt-1 leading-relaxed">
								Tampilkan bagian galeri pada undangan untuk memamerkan momen-momen spesial Anda
								melalui foto dan video kepada para tamu.
							</p>
						</div>
						<Switch
							id="toggle-gallery"
							bind:checked={featureToggle.show_gallery}
							onCheckedChange={saveToggles}
						/>
					</div>

					<div class="flex items-start justify-between gap-6">
						<div class="space-y-0.5 pr-4">
							<Label class="text-base cursor-pointer" for="toggle-gifts">Kado & Amplop</Label>
							<p class="text-sm text-muted-foreground mt-1 leading-relaxed">
								Cantumkan informasi rekening bank, dompet digital (e-wallet), atau alamat pengiriman
								fisik untuk memudahkan tamu memberikan hadiah atau amplop digital.
							</p>
						</div>
						<Switch
							id="toggle-gifts"
							bind:checked={featureToggle.show_gifts}
							onCheckedChange={saveToggles}
						/>
					</div>

					<div class="flex items-start justify-between gap-6">
						<div class="space-y-0.5 pr-4">
							<Label class="text-base cursor-pointer" for="toggle-live">Live Streaming</Label>
							<p class="text-sm text-muted-foreground mt-1 leading-relaxed">
								Sediakan akses tautan siaran langsung (live streaming) bagi tamu undangan yang
								berhalangan hadir agar tetap dapat mengikuti acara secara virtual.
							</p>
						</div>
						<Switch
							id="toggle-live"
							bind:checked={featureToggle.show_live_stream}
							onCheckedChange={saveToggles}
						/>
					</div>

					<div class="flex items-start justify-between gap-6">
						<div class="space-y-0.5 pr-4">
							<Label class="text-base cursor-pointer" for="toggle-restricted">Akses Terbatas</Label>
							<p class="text-sm text-muted-foreground mt-1 leading-relaxed">
								Tingkatkan privasi undangan Anda. Jika diaktifkan, undangan digital ini hanya dapat
								dibuka oleh tamu yang namanya telah Anda daftarkan secara khusus di sistem.
							</p>
						</div>
						<Switch
							id="toggle-restricted"
							bind:checked={featureToggle.require_registered_guest}
							onCheckedChange={saveToggles}
						/>
					</div>

					<div class="flex items-start justify-between gap-6">
						<div class="space-y-0.5 pr-4">
							<Label class="text-base cursor-pointer" for="toggle-public-preview"
								>Pratinjau Publik</Label
							>
							<p class="text-sm text-muted-foreground mt-1 leading-relaxed">
								Izinkan tautan pratinjau dilihat oleh siapa saja yang memilikinya, meskipun mereka
								belum masuk (login) ke akun Momenu. Fitur ini sangat berguna jika Anda ingin
								membagikan draf undangan ke pasangan, keluarga, atau teman untuk meminta pendapat
								sebelum undangan resmi diterbitkan.
							</p>
						</div>
						<Switch
							id="toggle-public-preview"
							checked={project.payload?.allow_public_preview === true}
							onCheckedChange={async (checked) => {
								project!.payload = { ...project!.payload, allow_public_preview: checked };
								try {
									await ProjectService.update(projectId, {
										title: project!.title,
										slug: project!.slug,
										sharing_thumbnail: project!.sharing_thumbnail,
										payload: project!.payload
									});
									toast.success('Pengaturan pratinjau berhasil disimpan');
								} catch (e) {
									toast.error('Gagal menyimpan pengaturan pratinjau');
								}
							}}
						/>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="border-destructive/50 mt-4">
				<Card.Header>
					<Card.Title class="text-destructive">Zona Berbahaya</Card.Title>
					<Card.Description>Tindakan di bawah ini tidak dapat dibatalkan.</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="flex items-center justify-between">
						<div>
							<h4 class="font-medium text-sm">Hapus Acara</h4>
							<p class="text-sm text-muted-foreground">
								Menghapus acara beserta seluruh data dan aset yang terkait.
							</p>
						</div>
						<AlertDialog.Root>
							<AlertDialog.Trigger>
								<Button variant="destructive" class="gap-2">
									<Trash2 class="h-4 w-4" />
									Hapus Acara
								</Button>
							</AlertDialog.Trigger>
							<AlertDialog.Content>
								<AlertDialog.Header>
									<AlertDialog.Title>Apakah Anda yakin?</AlertDialog.Title>
									<AlertDialog.Description>
										Tindakan ini tidak dapat dibatalkan. Ini akan secara permanen menghapus acara
										<strong>{project.title}</strong> beserta seluruh data yang ada di dalamnya.
									</AlertDialog.Description>
								</AlertDialog.Header>
								<AlertDialog.Footer>
									<AlertDialog.Cancel>Batal</AlertDialog.Cancel>
									<AlertDialog.Action
										onclick={deleteProject}
										class="bg-destructive text-destructive-foreground hover:bg-destructive/90"
									>
										{deletingProject ? 'Menghapus...' : 'Ya, Hapus Acara'}
									</AlertDialog.Action>
								</AlertDialog.Footer>
							</AlertDialog.Content>
						</AlertDialog.Root>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}
</PageComposer>
