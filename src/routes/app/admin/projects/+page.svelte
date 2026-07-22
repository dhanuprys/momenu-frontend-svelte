<script lang="ts">
	import { AdminService } from '$lib/services/index';
	import type { Project } from '$lib/types/index';
	import { onMount } from 'svelte';
	import PageComposer from '$lib/components/layout/page-composer.svelte';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Trash2 } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';

	let projects = $state<Project[]>([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			projects = await AdminService.listProjects();
		} catch (error) {
			toast.error('Gagal memuat daftar acara');
		} finally {
			loading = false;
		}
	});

	async function deleteProject(id: string) {
		if (!confirm('Apakah Anda yakin ingin menghapus acara ini?')) return;
		try {
			await AdminService.deleteProject(id);
			projects = projects.filter((p) => p.id !== id);
			toast.success('Acara berhasil dihapus');
		} catch (error) {
			toast.error('Gagal menghapus acara');
		}
	}
</script>

<svelte:head>
	<title>Momenu | Manajemen Acara</title>
</svelte:head>

<PageComposer title="Acara" description="Daftar semua acara undangan digital yang dibuat pengguna.">
	<div class="rounded-md border bg-card">
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>Judul</Table.Head>
					<Table.Head>Tema</Table.Head>
					<Table.Head>Status</Table.Head>
					<Table.Head>Slug</Table.Head>
					<Table.Head class="text-right">Aksi</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#if loading}
					{#each Array(5) as _}
						<Table.Row>
							<Table.Cell><Skeleton class="h-4 w-32" /></Table.Cell>
							<Table.Cell><Skeleton class="h-4 w-24" /></Table.Cell>
							<Table.Cell><Skeleton class="h-6 w-16" /></Table.Cell>
							<Table.Cell><Skeleton class="h-4 w-24" /></Table.Cell>
							<Table.Cell class="text-right"><Skeleton class="h-8 w-8 ml-auto" /></Table.Cell>
						</Table.Row>
					{/each}
				{:else if projects.length === 0}
					<Table.Row>
						<Table.Cell colspan={5} class="text-center py-6 text-muted-foreground"
							>Tidak ada acara ditemukan.</Table.Cell
						>
					</Table.Row>
				{:else}
					{#each projects as project}
						<Table.Row>
							<Table.Cell class="font-medium">{project.title}</Table.Cell>
							<Table.Cell>{project.theme?.name || project.theme_id}</Table.Cell>
							<Table.Cell>
								<div
									class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
								>
									{project.status.toUpperCase()}
								</div>
							</Table.Cell>
							<Table.Cell class="text-muted-foreground">/{project.slug}</Table.Cell>
							<Table.Cell class="text-right">
								<Button variant="destructive" size="icon" onclick={() => deleteProject(project.id)}>
									<Trash2 class="h-4 w-4" />
								</Button>
							</Table.Cell>
						</Table.Row>
					{/each}
				{/if}
			</Table.Body>
		</Table.Root>
	</div>
</PageComposer>
