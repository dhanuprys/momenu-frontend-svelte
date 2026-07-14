<script lang="ts">
	import ProjectSwitcher from '$lib/components/navigation/project-switcher.svelte';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { page } from '$app/stores';
	import { authState } from '$lib/stores/auth.svelte.js';
	import { ProjectService } from '$lib/services/index.js';
	import type { Project } from '$lib/types/index.js';
	import type { ComponentProps } from 'svelte';
	import {
		LayoutDashboard,
		Users,
		Video,
		Image as ImageIcon,
		CalendarDays,
		Gift,
		BookOpen,
		Settings,
		Shirt,
		Music,
		Activity,
		ExternalLink,
		Link as LinkIcon,
		Shield,
		ChevronDown,
		ChevronRight,
		FileText,
		MonitorSmartphone,
		Paintbrush,
		Database
	} from '@lucide/svelte';
	import BaseSidebar from './base-sidebar.svelte';
	import { slide } from 'svelte/transition';
	import { toast } from 'svelte-sonner';

	let { ref = $bindable(null), ...restProps }: ComponentProps<typeof Sidebar.Root> = $props();

	let projectId = $derived($page.params.projectId);
	let currentPath = $derived($page.url.pathname);
	let project = $state<Project | null>(null);

	$effect(() => {
		if (projectId) {
			ProjectService.get(projectId)
				.then((res) => (project = res))
				.catch((e) => console.error('Sidebar failed to load project', e));
		}
	});

	let navItems = $derived([
		{
			id: 'menu-utama',
			title: 'Menu Utama',
			items: [
				{
					title: 'Rangkuman',
					url: `/app/project/${projectId}/summary`,
					icon: MonitorSmartphone,
					isActive: currentPath === `/app/project/${projectId}/summary`
				},
				{
					title: 'Dashboard',
					url: `/app/project/${projectId}`,
					icon: LayoutDashboard,
					isActive: currentPath === `/app/project/${projectId}`
				},
				{
					title: 'Tamu & RSVP',
					url: `/app/project/${projectId}/guests`,
					icon: Users,
					isActive: currentPath.startsWith(`/app/project/${projectId}/guests`)
				},
				{
					title: 'Buku Tamu',
					url: `/app/project/${projectId}/guestbook`,
					icon: BookOpen,
					isActive: currentPath.startsWith(`/app/project/${projectId}/guestbook`)
				},
				{
					title: 'Statistik & Analitik',
					url: `/app/project/${projectId}/analytics`,
					icon: Activity,
					isActive: currentPath.startsWith(`/app/project/${projectId}/analytics`)
				}
			]
		},
		{
			id: 'konten-undangan',
			title: 'Konten Undangan',
			items: [
				{
					title: 'Detail Acara',
					url: `/app/project/${projectId}/details`,
					icon: FileText,
					isActive: currentPath.startsWith(`/app/project/${projectId}/details`)
				},
				{
					title: 'Acara & Jadwal',
					url: `/app/project/${projectId}/schedules`,
					icon: CalendarDays,
					isActive: currentPath.startsWith(`/app/project/${projectId}/schedules`)
				},
				{
					title: 'Galeri & Media',
					url: `/app/project/${projectId}/media`,
					icon: ImageIcon,
					isActive: currentPath.startsWith(`/app/project/${projectId}/media`)
				},
				{
					title: 'Live Streaming',
					url: `/app/project/${projectId}/live-streams`,
					icon: Video,
					isActive: currentPath.startsWith(`/app/project/${projectId}/live-streams`)
				},
				{
					title: 'Hadiah & Amplop',
					url: `/app/project/${projectId}/gifts`,
					icon: Gift,
					isActive: currentPath.startsWith(`/app/project/${projectId}/gifts`)
				},
				{
					title: 'Musik Latar',
					url: `/app/project/${projectId}/music`,
					icon: Music,
					isActive: currentPath.startsWith(`/app/project/${projectId}/music`)
				},
				{
					title: 'Dress Code',
					url: `/app/project/${projectId}/dress-codes`,
					icon: Shirt,
					isActive: currentPath.startsWith(`/app/project/${projectId}/dress-codes`)
				},
				{
					title: 'Kustomisasi Tema',
					url: `/app/project/${projectId}/customize`,
					icon: Paintbrush,
					isActive: currentPath.startsWith(`/app/project/${projectId}/customize`)
				}
			]
		},
		{
			id: 'pengaturan',
			title: 'Pengaturan',
			items: [
				{
					title: 'Pengaturan Acara',
					url: `/app/project/${projectId}/settings`,
					icon: Settings,
					isActive: currentPath.startsWith(`/app/project/${projectId}/settings`)
				},
				{
					title: 'Penyimpanan (Storage)',
					url: `/app/project/${projectId}/storage`,
					icon: Database,
					isActive: currentPath.startsWith(`/app/project/${projectId}/storage`)
				}
			]
		}
	]);

	// Initialize all groups as expanded
	let expandedGroups = $state<Record<string, boolean>>({
		'menu-utama': true,
		'konten-undangan': true,
		pengaturan: true
	});

	function toggleGroup(id: string) {
		expandedGroups[id] = !expandedGroups[id];
	}

	function handleCopyLink() {
		if (!project) {
			toast.error('Memuat data acara, coba lagi nanti.');
			return;
		}

		const link =
			project.status === 'published'
				? `${window.location.origin}/${project.slug}`
				: `${window.location.origin}/preview/${projectId}`;

		navigator.clipboard
			.writeText(link)
			.then(() => {
				toast.success('Tautan berhasil disalin ke clipboard!');
			})
			.catch(() => {
				toast.error('Gagal menyalin tautan.');
			});
	}
</script>

<BaseSidebar bind:ref {...restProps} backLink="/app" backLabel="Kembali ke Acara Saya">
	{#snippet headerSlot()}
		<ProjectSwitcher />

		<!-- Quick Actions -->
		<div class="flex items-center gap-2 mt-4">
			<Sidebar.MenuButton
				class="flex-1 justify-center bg-primary/10 hover:bg-primary/20 text-primary transition-all duration-200 {!project
					? 'opacity-50 pointer-events-none'
					: ''}"
			>
				{#snippet child({ props })}
					{#if project}
						<a
							href={project.status === 'published' ? `/${project.slug}` : `/preview/${projectId}`}
							target="_blank"
							{...props}
						>
							<ExternalLink class="size-4 mr-2" />
							<span class="text-xs font-semibold"
								>{project.status === 'published' ? 'Buka Undangan' : 'Lihat Pratinjau'}</span
							>
						</a>
					{:else}
						<div {...props}>
							<span class="text-xs font-semibold">Memuat...</span>
						</div>
					{/if}
				{/snippet}
			</Sidebar.MenuButton>

			<Sidebar.MenuButton
				class="w-10 justify-center bg-secondary hover:bg-secondary/80 border"
				onclick={handleCopyLink}
			>
				<LinkIcon class="size-4" />
			</Sidebar.MenuButton>
		</div>
	{/snippet}

	{#each navItems as group}
		<Sidebar.Group>
			<button
				type="button"
				class="w-full flex items-center justify-between cursor-pointer px-2 py-1.5 text-sm font-semibold text-sidebar-foreground/70 hover:text-sidebar-foreground"
				onclick={() => toggleGroup(group.id)}
			>
				<span>{group.title}</span>
				{#if expandedGroups[group.id]}
					<ChevronDown class="size-4" />
				{:else}
					<ChevronRight class="size-4" />
				{/if}
			</button>

			{#if expandedGroups[group.id]}
				<div transition:slide={{ duration: 200 }}>
					<Sidebar.GroupContent>
						<Sidebar.Menu>
							{#each group.items as item}
								<Sidebar.MenuItem>
									<Sidebar.MenuButton isActive={item.isActive}>
										{#snippet child({ props })}
											<a href={item.url} {...props}>
												<item.icon class="size-4" />
												<span>{item.title}</span>
											</a>
										{/snippet}
									</Sidebar.MenuButton>
								</Sidebar.MenuItem>
							{/each}
						</Sidebar.Menu>
					</Sidebar.GroupContent>
				</div>
			{/if}
		</Sidebar.Group>
	{/each}

	{#if authState.user?.is_admin}
		<div class="mt-auto pt-4 mb-2">
			<Sidebar.Group>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						<Sidebar.MenuItem>
							<Sidebar.MenuButton
								class="bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-500 font-medium"
							>
								{#snippet child({ props })}
									<a href="/app/admin" {...props}>
										<Shield class="size-4" />
										<span>Admin Panel</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		</div>
	{/if}
</BaseSidebar>
