<script lang="ts">
	import { page } from '$app/stores';
	import { ProjectService } from '$lib/services/index';
	import type { Project } from '$lib/types/models';
	import { onMount } from 'svelte';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { toast } from 'svelte-sonner';
	import PageComposer from '$lib/components/layout/page-composer.svelte';
	import ThemeCustomizerForm from '$lib/theme-engine/components/theme-customizer-form.svelte';

	let projectId = $derived($page.params.projectId!);
	let project = $state<Project | null>(null);
	let loading = $state(true);

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		loading = true;
		try {
			project = await ProjectService.get(projectId);
		} catch (err) {
			console.error(err);
			toast.error('Gagal memuat acara');
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Kustomisasi Tema | Momenu</title>
</svelte:head>

<PageComposer
	title="Kustomisasi Tema"
	description="Sesuaikan teks dan tampilan tema untuk acara Anda"
>
	{#if loading}
		<div class="space-y-4">
			<Skeleton class="h-10 w-48" />
			<Skeleton class="h-64 w-full" />
		</div>
	{:else if !project}
		<div class="text-center py-10 text-muted-foreground">Gagal memuat detail proyek.</div>
	{:else}
		<div class="max-w-4xl">
			<!-- Use the exact same form used by the drawer to guarantee 100% UI and UX consistency -->
			<ThemeCustomizerForm {project} onSaved={loadData} />
		</div>
	{/if}
</PageComposer>
