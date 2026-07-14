<script lang="ts">
	import { onMount } from 'svelte';
	import { ProjectService } from '$lib/services/project.service.js';
	import type { Project } from '$lib/types/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Plus, Calendar, LayoutDashboard, Users } from '@lucide/svelte';
	import { goto } from '$app/navigation';
	import { getMediaUrl } from '$lib/utils.js';
	import AppHeader from '$lib/components/layout/app-header.svelte';

	let projects: Project[] = $state([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			const response = await ProjectService.list(1, 50);
			projects = response.data || [];
		} catch (error) {
			console.error('Failed to load projects', error);
		} finally {
			loading = false;
		}
	});

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
		{#if projects.length > 0}
			<Button onclick={() => goto('/app/project/new')}>
				<Plus class="mr-2 h-4 w-4" /> Buat Acara Baru
			</Button>
		{/if}
	</div>

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
				Anda belum membuat acara apa pun. Mulai buat undangan digital pertama Anda sekarang!
			</p>
			<Button size="lg" onclick={() => goto('/app/project/new')}>
				<Plus class="mr-2 h-4 w-4" /> Buat Acara Baru
			</Button>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{#each projects as project}
				<Card.Root
					class="overflow-hidden flex flex-col hover:border-primary/50 transition-colors cursor-pointer group"
					onclick={() => goto(`/app/project/${project.id}`)}
				>
					<div class="h-40 w-full bg-muted/50 border-b border-border relative overflow-hidden">
						{#if project.sharing_thumbnail}
							<img
								src={getMediaUrl(project.sharing_thumbnail)}
								alt={project.title}
								class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
							/>
						{:else}
							<div
								class="absolute inset-0 flex items-center justify-center text-muted-foreground/30 bg-linear-to-br from-muted to-muted/20"
							>
								<LayoutDashboard class="h-12 w-12" />
							</div>
						{/if}
						<div class="absolute top-3 right-3">
							<span
								class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-background/80 backdrop-blur-md text-foreground shadow-sm"
							>
								{project.status === 'published'
									? 'Aktif'
									: project.status === 'draft'
										? 'Draft'
										: 'Arsip'}
							</span>
						</div>
					</div>

					<Card.Header class="pb-4">
						<Card.Title class="text-xl line-clamp-1 group-hover:text-primary transition-colors"
							>{project.title}</Card.Title
						>
						<Card.Description class="flex items-center gap-1.5 mt-2">
							<Calendar class="h-3.5 w-3.5" /> Dibuat pada {formatDate(project.created_at)}
						</Card.Description>
					</Card.Header>

					<div class="mt-auto p-6 pt-0 flex items-center justify-between">
						<div class="flex items-center gap-1.5 text-muted-foreground text-sm font-medium">
							<Users class="h-4 w-4" />
							<span>{project.project_visits?.length || project.total_viewers || 0} Viewers</span>
						</div>
						<Button
							variant="default"
							size="sm"
							class="h-8"
							onclick={(e) => {
								e.stopPropagation();
								goto(`/app/project/${project.id}`);
							}}
						>
							Detail
						</Button>
					</div>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>
