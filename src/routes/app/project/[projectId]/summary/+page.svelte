<script lang="ts">
	import { page } from '$app/stores';
	import { ProjectService } from '$lib/services/index';
	import type { Project, ProjectStatus } from '$lib/types/index';
	import { onMount } from 'svelte';
	import PageComposer from '$lib/components/layout/page-composer.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as AlertDialog from '$lib/components/ui/alert-dialog/index.js';
	import { toast } from 'svelte-sonner';
	import { Copy, ExternalLink, Globe, Pencil, Archive, RotateCcw, Download } from '@lucide/svelte';
	import QRCode from 'qrcode';

	let projectId = $derived($page.params.projectId!);
	let project = $state<Project | null>(null);
	let loading = $state(true);
	let changingStatus = $state(false);

	let generalQrCodeDataUrl = $state('');

	async function generateGeneralQrCode(slug: string) {
		const url = `${window.location.origin}/${slug}`;
		try {
			generalQrCodeDataUrl = await QRCode.toDataURL(url, { width: 300, margin: 2 });
		} catch (e) {
			console.error('Failed to generate QR code', e);
		}
	}

	onMount(async () => {
		loading = true;
		try {
			const projRes = await ProjectService.get(projectId);
			project = projRes;
			if (project?.slug) {
				generateGeneralQrCode(project.slug);
			}
		} catch (e) {
			console.error('Failed to load project summary', e);
			toast.error('Gagal memuat rangkuman acara');
		} finally {
			loading = false;
		}
	});

	async function changeStatus(newStatus: ProjectStatus) {
		changingStatus = true;
		try {
			await ProjectService.updateStatus(projectId, { status: newStatus });
			project = { ...project!, status: newStatus };
			toast.success('Status acara berhasil diperbarui');
		} catch (e) {
			toast.error('Gagal memperbarui status');
		} finally {
			changingStatus = false;
		}
	}

	function copyLink() {
		if (!project) return;
		const fullUrl = `${window.location.origin}/${project.slug}`;
		navigator.clipboard.writeText(fullUrl);
		toast.success('Tautan berhasil disalin ke papan klip');
	}
</script>

<svelte:head>
	<title>Momenu | Rangkuman Acara</title>
</svelte:head>

<PageComposer>
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Rangkuman Acara</h1>
		<p class="text-muted-foreground">Gambaran umum dan akses ke undangan digital Anda.</p>
	</div>

	{#if loading}
		<div class="space-y-4">
			<div class="h-50 bg-muted/30 rounded-xl animate-pulse"></div>
			<div class="h-[400px] bg-muted/30 rounded-xl animate-pulse"></div>
		</div>
	{:else if project}
		<div class="grid gap-6">
			<!-- Status Banner Card -->
			{#if project.status === 'draft'}
				<Card.Root class="border-amber-500/50 bg-amber-500/5 border-dashed">
					<Card.Content
						class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-6"
					>
						<div class="flex items-center gap-4">
							<div class="p-3 bg-amber-500/10 rounded-full text-amber-600">
								<Pencil class="h-6 w-6" />
							</div>
							<div>
								<h3 class="text-lg font-semibold text-amber-700 dark:text-amber-500">Mode Draf</h3>
								<p class="text-sm text-amber-700/80 dark:text-amber-500/80">
									Undangan ini masih dalam mode draf dan belum dapat diakses oleh tamu.
								</p>
							</div>
						</div>
						<div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
							<Button
								variant="outline"
								class="w-full sm:w-auto border-amber-200 text-amber-700 hover:bg-amber-50"
								href={`/preview/${projectId}`}
								target="_blank"
							>
								Lihat Pratinjau
							</Button>
							<AlertDialog.Root>
								<AlertDialog.Trigger>
									<Button
										class="bg-amber-600 hover:bg-amber-700 text-white w-full sm:w-auto"
										disabled={changingStatus}
									>
										{changingStatus ? 'Memproses...' : '🚀 Terbitkan Undangan'}
									</Button>
								</AlertDialog.Trigger>
								<AlertDialog.Content>
									<AlertDialog.Header>
										<AlertDialog.Title>Terbitkan undangan ini?</AlertDialog.Title>
										<AlertDialog.Description>
											Undangan Anda akan dapat diakses oleh semua orang melalui tautan yang telah
											dibuat. Pastikan semua informasi sudah benar.
										</AlertDialog.Description>
									</AlertDialog.Header>
									<AlertDialog.Footer>
										<AlertDialog.Cancel>Batal</AlertDialog.Cancel>
										<AlertDialog.Action onclick={() => changeStatus('published')}
											>Ya, Terbitkan</AlertDialog.Action
										>
									</AlertDialog.Footer>
								</AlertDialog.Content>
							</AlertDialog.Root>
						</div>
					</Card.Content>
				</Card.Root>
			{:else if project.status === 'published'}
				<Card.Root class="border-emerald-500/50 bg-emerald-500/5">
					<Card.Content
						class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-6"
					>
						<div class="flex items-center gap-4">
							<div class="relative p-3 bg-emerald-500/10 rounded-full text-emerald-600">
								<Globe class="h-6 w-6 relative z-10" />
								<span class="absolute top-2 right-2 flex h-3 w-3 z-20">
									<span
										class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"
									></span>
									<span class="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
								</span>
							</div>
							<div>
								<h3 class="text-lg font-semibold text-emerald-700 dark:text-emerald-500">
									Undangan Aktif
								</h3>
								<p class="text-sm text-emerald-700/80 dark:text-emerald-500/80">
									Undangan Anda sedang aktif dan dapat diakses oleh tamu melalui tautan di bawah.
								</p>
							</div>
						</div>
						<div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto shrink-0">
							<AlertDialog.Root>
								<AlertDialog.Trigger>
									<Button
										variant="outline"
										class="w-full sm:w-auto border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
										disabled={changingStatus}
									>
										Kembalikan ke Draf
									</Button>
								</AlertDialog.Trigger>
								<AlertDialog.Content>
									<AlertDialog.Header>
										<AlertDialog.Title>Kembalikan ke mode draf?</AlertDialog.Title>
										<AlertDialog.Description>
											Undangan Anda tidak akan dapat diakses oleh tamu sampai diterbitkan kembali.
										</AlertDialog.Description>
									</AlertDialog.Header>
									<AlertDialog.Footer>
										<AlertDialog.Cancel>Batal</AlertDialog.Cancel>
										<AlertDialog.Action onclick={() => changeStatus('draft')}
											>Ya, Kembalikan</AlertDialog.Action
										>
									</AlertDialog.Footer>
								</AlertDialog.Content>
							</AlertDialog.Root>
							<AlertDialog.Root>
								<AlertDialog.Trigger>
									<Button
										variant="ghost"
										class="w-full sm:w-auto text-muted-foreground hover:text-foreground"
										disabled={changingStatus}
									>
										Arsipkan
									</Button>
								</AlertDialog.Trigger>
								<AlertDialog.Content>
									<AlertDialog.Header>
										<AlertDialog.Title>Arsipkan acara ini?</AlertDialog.Title>
										<AlertDialog.Description>
											Undangan akan dihentikan secara permanen dan tidak dapat diakses oleh tamu.
										</AlertDialog.Description>
									</AlertDialog.Header>
									<AlertDialog.Footer>
										<AlertDialog.Cancel>Batal</AlertDialog.Cancel>
										<AlertDialog.Action onclick={() => changeStatus('archived')}
											>Ya, Arsipkan</AlertDialog.Action
										>
									</AlertDialog.Footer>
								</AlertDialog.Content>
							</AlertDialog.Root>
						</div>
					</Card.Content>
				</Card.Root>
			{:else if project.status === 'archived'}
				<Card.Root class="border-muted bg-muted/30">
					<Card.Content
						class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-6"
					>
						<div class="flex items-center gap-4">
							<div class="p-3 bg-muted rounded-full text-muted-foreground">
								<Archive class="h-6 w-6" />
							</div>
							<div>
								<h3 class="text-lg font-semibold text-foreground">Diarsipkan</h3>
								<p class="text-sm text-muted-foreground">
									Acara ini telah diarsipkan dan tidak dapat diakses oleh tamu.
								</p>
							</div>
						</div>
						<Button
							variant="outline"
							onclick={() => changeStatus('draft')}
							disabled={changingStatus}
							class="w-full sm:w-auto shrink-0 gap-2"
						>
							<RotateCcw class="h-4 w-4" />
							Kembalikan ke Draf
						</Button>
					</Card.Content>
				</Card.Root>
			{/if}

			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div class="space-y-6">
					<!-- Link and QR Code -->
					<Card.Root>
						<Card.Header>
							<Card.Title>Tautan & Kode QR</Card.Title>
							<Card.Description>Akses langsung ke undangan Anda untuk dibagikan.</Card.Description>
						</Card.Header>
						<Card.Content class="space-y-6">
							<div class="flex gap-2 items-center flex-wrap sm:flex-nowrap">
								<div
									class="flex flex-1 items-center gap-0 rounded-md border bg-muted/30 text-sm overflow-hidden"
								>
									<div class="px-3 py-2 bg-muted/50 text-muted-foreground border-r shrink-0">
										{window.location.origin}/
									</div>
									<div class="px-3 py-2 text-foreground truncate w-full">
										{project.slug}
									</div>
								</div>

								<div class="flex gap-2 shrink-0">
									<Button variant="secondary" size="icon" onclick={copyLink} title="Salin Tautan">
										<Copy class="h-4 w-4" />
									</Button>
									<Button
										variant="outline"
										size="icon"
										href={`/${project.slug}`}
										target="_blank"
										title="Buka Undangan"
									>
										<ExternalLink class="h-4 w-4" />
									</Button>
								</div>
							</div>

							{#if generalQrCodeDataUrl}
								<div
									class="flex flex-col sm:flex-row gap-6 items-center sm:items-start pt-4 border-t"
								>
									<div class="bg-white p-3 rounded-xl border shadow-sm shrink-0">
										<img src={generalQrCodeDataUrl} alt="QR Code" class="w-32 h-32" />
									</div>
									<div class="space-y-3 text-center sm:text-left">
										<p class="text-sm text-muted-foreground">
											Anda dapat mencetak QR Code ini pada undangan fisik Anda atau membagikannya
											secara digital.
										</p>
										<a href={generalQrCodeDataUrl} download={`QR-${project.slug}.png`}>
											<Button variant="default" size="sm">
												<Download class="w-4 h-4 mr-2" />
												Unduh QR Code
											</Button>
										</a>
									</div>
								</div>
							{/if}
						</Card.Content>
					</Card.Root>
				</div>

				<!-- Iframe Preview -->
				<Card.Root class="overflow-hidden flex flex-col">
					<Card.Header class="pb-4 shrink-0">
						<Card.Title>Pratinjau Langsung</Card.Title>
						<Card.Description>Tampilan undangan Anda saat ini.</Card.Description>
					</Card.Header>
					<Card.Content class="flex-1 p-0 bg-muted/10 relative min-h-[500px]">
						<iframe
							src={project.status === 'published' ? `/${project.slug}` : `/preview/${projectId}`}
							title="Preview Undangan"
							class="absolute inset-0 w-full h-full border-t"
							allow="autoplay; fullscreen"
						></iframe>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	{/if}
</PageComposer>
