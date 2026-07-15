<script lang="ts">
	import { onMount } from 'svelte';
	import { ProjectService } from '$lib/services/project.service.js';
	import type { Project } from '$lib/types/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Plus, Calendar, LayoutDashboard, Users, ExternalLink } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { getMediaUrl } from '$lib/utils.js';
	import AppHeader from '$lib/components/layout/app-header.svelte';

	let projects: Project[] = $state([]);
	let loading = $state(true);
	let statusFilter: string = $state('all');

	async function loadProjects(status: string) {
		loading = true;
		try {
			const response = await ProjectService.list(1, 50, status);
			projects = response.data || [];
		} catch (error) {
			console.error('Failed to load projects', error);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		loadProjects(statusFilter);
	});

	function handleTabChange(value: string) {
		statusFilter = value;
		loadProjects(value);
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}
</script>

<svelte:head>
	<title>Momenu | Acara Saya</title>
</svelte:head>

<AppHeader />

<div class="container mx-auto max-w-7xl px-4 py-8 md:px-8">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Acara Saya</h1>
			<p class="text-muted-foreground mt-1">Kelola semua undangan dan acara Anda.</p>
		</div>
		{#if projects.length > 0 || statusFilter !== 'all'}
			<Button onclick={() => goto('/app/project/new')}>
				<Plus class="mr-2 h-4 w-4" /> Buat Acara Baru
			</Button>
		{/if}
	</div>

	<Tabs.Root value={statusFilter} onValueChange={handleTabChange} class="w-full mb-8">
		<Tabs.List>
			<Tabs.Trigger value="all">Semua</Tabs.Trigger>
			<Tabs.Trigger value="published">Aktif</Tabs.Trigger>
			<Tabs.Trigger value="draft">Draft</Tabs.Trigger>
		</Tabs.List>
	</Tabs.Root>

	{#if loading}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each Array(3) as _}
				<div class="h-64 rounded-xl border border-border bg-muted/20 animate-pulse"></div>
			{/each}
		</div>
	{:else if projects.length === 0}
		<div
			class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-24 text-center bg-muted/10"
		>
			<div
				class="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary mb-6"
			>
				<LayoutDashboard class="h-10 w-10" />
			</div>
			<h2 class="text-2xl font-bold tracking-tight mb-2">Belum Ada Acara</h2>
			<p class="text-muted-foreground mb-8 max-w-md">
				{#if statusFilter === 'all'}
					Anda belum membuat acara apa pun. Mulai buat undangan digital pertama Anda sekarang!
				{:else}
					Tidak ada acara dengan status tersebut.
				{/if}
			</p>
			<Button size="lg" onclick={() => goto('/app/project/new')}>
				<Plus class="mr-2 h-4 w-4" /> Buat Acara Baru
			</Button>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each projects as project}
				<a
					class="bg-white dark:bg-stone-900 rounded-[1.25rem] p-5 border border-stone-200 dark:border-stone-800 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col"
					href="/app/project/{project.id}"
				>
					<div class="flex justify-between items-start mb-1.5">
						<h3 class="font-bold text-lg text-stone-900 dark:text-stone-100 line-clamp-1">
							{project.title}
						</h3>
						<span
							class="px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-3
							{project.status === 'published'
								? 'bg-emerald-100/80 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400'
								: project.status === 'draft'
									? 'bg-amber-100/80 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
									: 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-400'}"
						>
							{project.status === 'published'
								? 'Aktif'
								: project.status === 'draft'
									? 'Draft'
									: 'Arsip'}
						</span>
					</div>
					<div class="text-sm text-stone-500 dark:text-stone-400 font-medium capitalize">
						Undangan {project.event_type || 'Digital'}
					</div>

					<div class="flex justify-between items-center mt-6 mb-4">
						<div class="flex items-center text-sm text-stone-600 dark:text-stone-400 font-medium">
							<Calendar class="w-4 h-4 mr-2" /> Dibuat: {formatDate(project.created_at)}
						</div>
						<div
							class="p-1 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-md transition-colors text-stone-400"
						>
							<svg
								width="16"
								height="16"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								stroke-width="2"
								stroke-linecap="round"
								stroke-linejoin="round"
								><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle
									cx="5"
									cy="12"
									r="1"
								/></svg
							>
						</div>
					</div>

					<div class="border-t border-stone-100 dark:border-stone-800 my-4"></div>

					<div class="grid grid-cols-2 gap-y-5 gap-x-4 mt-1">
						<!-- Grid Item 1 -->
						<div>
							<div class="text-[0.8rem] text-stone-500 dark:text-stone-400 mb-1 font-medium">
								Tema
							</div>
							<div class="text-sm font-bold text-stone-800 dark:text-stone-200 truncate">
								{project.theme?.name || 'Bawaan'}
							</div>
						</div>
						<!-- Grid Item 2 -->
						<div class="text-right flex flex-col items-end">
							<div class="text-[0.8rem] text-stone-500 dark:text-stone-400 mb-1 font-medium">
								Viewers
							</div>
							<div class="text-sm font-bold text-stone-800 dark:text-stone-200">
								{project.project_visits?.length || project.total_viewers || 0}
							</div>
						</div>
						<!-- Grid Item 3 -->
						<div>
							<div class="text-[0.8rem] text-stone-500 dark:text-stone-400 mb-1 font-medium">
								Link URL
							</div>
							<div
								class="inline-flex items-center gap-1.5 px-2 py-1 -ml-2 rounded-md hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
								role="button"
								tabindex="0"
								onclick={(e) => {
									e.preventDefault();
									e.stopPropagation();
									window.open(`/${project.slug}`, '_blank');
								}}
								onkeydown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										e.stopPropagation();
										window.open(`/${project.slug}`, '_blank');
									}
								}}
							>
								<span
									class="text-sm font-bold text-stone-800 dark:text-stone-200 truncate max-w-[90px]"
									>/{project.slug}</span
								>
								<ExternalLink class="w-3.5 h-3.5 text-stone-500" />
							</div>
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>
