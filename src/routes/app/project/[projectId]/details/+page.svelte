<script lang="ts">
	import { page } from '$app/stores';
	import { EventTypeService, ProjectService } from '$lib/services/index.js';
	import type { FieldGroup, Project } from '$lib/types/index.js';
	import { eventTypeLabel } from '$lib/utils.js';
	import { onMount } from 'svelte';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { toast } from 'svelte-sonner';
	import PageComposer from '$lib/components/layout/page-composer.svelte';
	import ProjectDataForm from '$lib/components/forms/project-data-form.svelte';

	let projectId = $derived($page.params.projectId!);
	let project = $state<Project | null>(null);
	let schema = $state<FieldGroup[]>([]);
	let loading = $state(true);

	onMount(async () => {
		loading = true;
		try {
			const projRes = await ProjectService.get(projectId);
			project = projRes;

			// Fetch schema based on project's event type
			schema = await EventTypeService.getSchema(project.event_type);
		} catch (e) {
			console.error('Failed to load project details', e);
			toast.error('Gagal memuat detail acara');
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Momenu | Detail Acara</title>
</svelte:head>

<PageComposer title="Detail Acara" description="Kelola informasi data utama untuk acara Anda.">
	{#if loading}
		<div class="space-y-6">
			<Skeleton class="h-10 w-32" />
			<Skeleton class="h-[300px] w-full rounded-xl" />
			<Skeleton class="h-[200px] w-full rounded-xl" />
		</div>
	{:else if project && schema.length > 0}
		<div class="mb-6">
			<span
				class="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold bg-primary/10 text-primary"
			>
				Kategori: {eventTypeLabel(project.event_type)}
			</span>
		</div>

		<div class="mt-4">
			<ProjectDataForm bind:project {schema} />
		</div>
	{/if}
</PageComposer>
