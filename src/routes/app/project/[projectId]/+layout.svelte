<script lang="ts">
	import AppSidebar from '$lib/components/layout/app-sidebar.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import ModeToggle from '$lib/components/mode-toggle.svelte';
	import { page } from '$app/stores';
	import { ProjectService } from '$lib/services/project.service';
	import { onMount } from 'svelte';

	let { children } = $props();

	let projectTitle = $state('Memuat...');
	let projectId = $derived($page.params.projectId);

	$effect(() => {
		if (projectId) {
			ProjectService.get(projectId)
				.then((res) => {
					projectTitle = res.title;
				})
				.catch(() => {
					projectTitle = 'Acara Tidak Ditemukan';
				});
		}
	});
</script>

<Sidebar.Provider>
	<AppSidebar />
	<Sidebar.Inset>
		<header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
			<Sidebar.Trigger class="-ms-1" />
			<Separator orientation="vertical" class="me-2 h-4" />
			<Breadcrumb.Root>
				<Breadcrumb.List>
					<Breadcrumb.Item class="hidden md:block">
						<Breadcrumb.Link href="/app">Acara Saya</Breadcrumb.Link>
					</Breadcrumb.Item>
					<Breadcrumb.Separator class="hidden md:block" />
					<Breadcrumb.Item>
						<Breadcrumb.Page>{projectTitle}</Breadcrumb.Page>
					</Breadcrumb.Item>
				</Breadcrumb.List>
			</Breadcrumb.Root>
			<div class="ml-auto flex items-center">
				<ModeToggle />
			</div>
		</header>
		<!-- Yield nested page content here -->
		{@render children()}
	</Sidebar.Inset>
</Sidebar.Provider>
