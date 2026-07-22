<script lang="ts">
	import { AdminService, MusicService } from '$lib/services/index';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Users, FolderGit2, Music } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import PageComposer from '$lib/components/layout/page-composer.svelte';

	let loading = $state(true);
	let stats = $state({
		users: 0,
		projects: 0,
		music: 0
	});

	onMount(async () => {
		try {
			// In a real scenario, there might be a dedicated stats endpoint.
			// For now, we fetch lists and count.
			const [users, projects, musics] = await Promise.all([
				AdminService.listUsers(),
				AdminService.listProjects(),
				MusicService.listMusics()
			]);

			stats.users = users?.length || 0;
			stats.projects = projects?.length || 0;
			stats.music = musics?.length || 0;
		} catch (error) {
			console.error('Failed to load admin stats', error);
		} finally {
			loading = false;
		}
	});
</script>

<svelte:head>
	<title>Momenu | Admin Dashboard</title>
</svelte:head>

<PageComposer title="Dashboard Admin" description="Ringkasan aktivitas platform Momenu.">
	{#if loading}
		<div class="grid gap-4 md:grid-cols-3">
			{#each Array(3) as _}
				<Card.Root>
					<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
						<Skeleton class="h-4 w-1/2" />
						<Skeleton class="h-4 w-4 rounded-full" />
					</Card.Header>
					<Card.Content>
						<Skeleton class="h-8 w-1/3" />
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{:else}
		<div class="grid gap-4 md:grid-cols-3">
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Total Pengguna</Card.Title>
					<Users class="h-4 w-4 text-muted-foreground" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{stats.users}</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Total Acara</Card.Title>
					<FolderGit2 class="h-4 w-4 text-muted-foreground" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{stats.projects}</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Latar Musik</Card.Title>
					<Music class="h-4 w-4 text-muted-foreground" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{stats.music}</div>
				</Card.Content>
			</Card.Root>
		</div>
	{/if}
</PageComposer>
