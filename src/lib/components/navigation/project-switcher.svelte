<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import CheckIcon from '@lucide/svelte/icons/check';
	import ChevronsUpDownIcon from '@lucide/svelte/icons/chevrons-up-down';
	import Briefcase from '@lucide/svelte/icons/briefcase';
	import { ProjectService } from '$lib/services/index.js';
	import type { Project } from '$lib/types/index.js';
	import type { ProjectStatus } from '$lib/types/enums.js';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	let projects = $state<Project[]>([]);
	let loading = $state(true);
	let switching = $state(false);

	let currentProjectId = $derived($page.params.projectId);
	let currentProject = $derived(projects.find((p) => p.id === currentProjectId));

	onMount(async () => {
		try {
			const res = await ProjectService.list(1, 50);
			projects = res.data;
		} catch (e) {
			console.error('Failed to load projects', e);
		} finally {
			loading = false;
		}
	});

	async function switchProject(id: string) {
		switching = true;
		const minWait = new Promise((resolve) => setTimeout(resolve, 2000));
		await Promise.all([goto(`/app/project/${id}`), minWait]);
		switching = false;
	}

	function statusLabel(status: ProjectStatus): string {
		switch (status) {
			case 'draft':
				return 'Draf';
			case 'published':
				return 'Terbit';
			case 'archived':
				return 'Arsip';
			default:
				return status;
		}
	}

	function statusClasses(status: ProjectStatus): string {
		switch (status) {
			case 'draft':
				return 'bg-amber-500/10 text-amber-600 dark:text-amber-400';
			case 'published':
				return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
			case 'archived':
				return 'bg-muted text-muted-foreground';
			default:
				return 'bg-muted text-muted-foreground';
		}
	}
</script>

<Sidebar.Menu>
	<Sidebar.MenuItem>
		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				{#snippet child({ props })}
					<Sidebar.MenuButton
						size="lg"
						class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border border-border/50 shadow-sm transition-all hover:border-primary/30"
						{...props}
					>
						<div
							class="bg-primary/10 text-primary flex aspect-square size-8 items-center justify-center rounded-lg"
						>
							<Briefcase class="size-4" />
						</div>
						<div class="flex flex-col gap-0.5 leading-none">
							<div class="flex items-center gap-1.5">
								<span class="font-semibold truncate max-w-40 text-left">
									{loading ? 'Memuat...' : currentProject ? currentProject.title : 'Pilih Acara'}
								</span>
								{#if currentProject}
									<span
										class="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none {statusClasses(
											currentProject.status
										)}"
									>
										{statusLabel(currentProject.status)}
									</span>
								{/if}
							</div>
							<span class="text-xs text-muted-foreground">Ganti Acara</span>
						</div>
						<ChevronsUpDownIcon class="ms-auto" />
					</Sidebar.MenuButton>
				{/snippet}
			</DropdownMenu.Trigger>
			<DropdownMenu.Content class="w-(--bits-dropdown-menu-anchor-width) min-w-56" align="start">
				<DropdownMenu.Label>Acara Saya</DropdownMenu.Label>
				<DropdownMenu.Separator />
				{#if loading}
					<div class="px-2 py-4 text-center text-sm text-muted-foreground">Memuat...</div>
				{:else if projects.length === 0}
					<div class="px-2 py-4 text-center text-sm text-muted-foreground">Belum ada acara.</div>
				{:else}
					{#each projects as project (project.id)}
						<DropdownMenu.Item
							onSelect={() => switchProject(project.id)}
							class="cursor-pointer flex items-center justify-between gap-2"
						>
							<span class="truncate">{project.title}</span>
							<div class="flex items-center gap-1.5 shrink-0">
								<span
									class="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium leading-none {statusClasses(
										project.status
									)}"
								>
									{statusLabel(project.status)}
								</span>
								{#if project.id === currentProjectId}
									<CheckIcon class="h-4 w-4 text-primary" />
								{/if}
							</div>
						</DropdownMenu.Item>
					{/each}
				{/if}
				<DropdownMenu.Separator />
				<DropdownMenu.Item
					onSelect={() => goto('/app/project/new')}
					class="cursor-pointer text-primary"
				>
					+ Buat Acara Baru
				</DropdownMenu.Item>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</Sidebar.MenuItem>
</Sidebar.Menu>

{#if switching}
	<div
		class="fixed inset-0 z-9999 bg-emerald-800 flex flex-col items-center justify-center text-white"
		transition:fade={{ duration: 300 }}
	>
		<div class="flex flex-col items-center gap-6 animate-pulse">
			<!-- Momenu Logo / Branding -->
			<div class="flex flex-col items-center">
				<span class="text-sm uppercase tracking-[0.3em] font-medium opacity-80 mb-2">Memuat</span>
				<h1 class="text-5xl font-bold tracking-tighter">MOMENU</h1>
			</div>

			<!-- Progress Bar -->
			<div class="w-64 h-1.5 bg-emerald-950 rounded-full overflow-hidden mt-4 relative">
				<div
					class="absolute top-0 left-0 h-full bg-white rounded-full w-1/3 animate-[ping_1.5s_ease-in-out_infinite_alternate]"
				></div>
			</div>
		</div>
	</div>
{/if}
