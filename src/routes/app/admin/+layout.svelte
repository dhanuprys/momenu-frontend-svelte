<script lang="ts">
	import AdminSidebar from '$lib/components/layout/admin-sidebar.svelte';
	import * as Breadcrumb from '$lib/components/ui/breadcrumb/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import ModeToggle from '$lib/components/mode-toggle.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { authState } from '$lib/stores/auth.svelte.js';
	let { children } = $props();

	$effect(() => {
		// Frontend Middleware: Redirect if not admin
		if (authState.isInitialized) {
			if (!authState.user || !authState.user.is_admin) {
				goto('/app');
			}
		}
	});

	let routeName = $derived(() => {
		const path = $page.url.pathname;
		if (path.includes('/users')) return 'Users Management';
		if (path.includes('/projects')) return 'Projects Management';
		if (path.includes('/music')) return 'Music Management';
		if (path.includes('/system')) return 'System Monitoring';
		return 'Dashboard';
	});
</script>

{#if authState.user && authState.user.is_admin}
	<Sidebar.Provider>
		<AdminSidebar />
		<Sidebar.Inset>
			<header class="flex h-16 shrink-0 items-center gap-2 border-b px-4">
				<Sidebar.Trigger class="-ms-1" />
				<Separator orientation="vertical" class="me-2 h-4" />
				<Breadcrumb.Root>
					<Breadcrumb.List>
						<Breadcrumb.Item class="hidden md:block">
							<Breadcrumb.Link href="/app/admin">Admin Panel</Breadcrumb.Link>
						</Breadcrumb.Item>
						<Breadcrumb.Separator class="hidden md:block" />
						<Breadcrumb.Item>
							<Breadcrumb.Page>{routeName()}</Breadcrumb.Page>
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
{/if}
