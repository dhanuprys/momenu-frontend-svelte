<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { page } from '$app/stores';
	import type { ComponentProps } from 'svelte';
	import { LayoutDashboard, Users, FolderGit2, Music, Palette } from '@lucide/svelte';
	import BaseSidebar from './base-sidebar.svelte';

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();

	let currentPath = $derived($page.url.pathname);

	let navItems = $derived([
		{
			title: 'Admin Panel',
			items: [
				{
					title: 'Dashboard',
					url: '/app/admin',
					icon: LayoutDashboard,
					isActive: currentPath === '/app/admin'
				},
				{
					title: 'Pengguna',
					url: '/app/admin/users',
					icon: Users,
					isActive: currentPath.startsWith('/app/admin/users')
				},
				{
					title: 'Acara',
					url: '/app/admin/projects',
					icon: FolderGit2,
					isActive: currentPath.startsWith('/app/admin/projects')
				},
				{
					title: 'Musik Latar',
					url: '/app/admin/music',
					icon: Music,
					isActive: currentPath.startsWith('/app/admin/music')
				},
				{
					title: 'Tema',
					url: '/app/admin/themes',
					icon: Palette,
					isActive: currentPath.startsWith('/app/admin/themes')
				}
			]
		}
	]);
</script>

<BaseSidebar
	bind:ref
	{...restProps}
	backLink="/app"
	backLabel="Kembali ke App"
	badgeText="Admin Mode"
	class="border-r-amber-500/20 shadow-[1px_0_0_0_rgba(245,158,11,0.1)]"
>
	{#each navItems as group}
		<Sidebar.Group>
			<Sidebar.GroupLabel class="font-semibold text-amber-700/80 dark:text-amber-500/80"
				>{group.title}</Sidebar.GroupLabel
			>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each group.items as item}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={item.isActive}>
								{#snippet child({ props })}
									<a href={item.url} {...props}>
										<item.icon
											class="size-4 {item.isActive ? 'text-amber-600 dark:text-amber-500' : ''}"
										/>
										<span
											class={item.isActive
												? 'font-semibold text-amber-800 dark:text-amber-400'
												: ''}>{item.title}</span
										>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	{/each}
</BaseSidebar>
