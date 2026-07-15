<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { goto } from '$app/navigation';
	import { authState } from '$lib/stores/auth.svelte.js';
	import type { ComponentProps, Snippet } from 'svelte';
	import { ChevronsUpDown, LogOut, ArrowLeft, User, SunMoon } from '@lucide/svelte';
	import AppLogo from '$lib/components/brand/app-logo.svelte';

	let {
		ref = $bindable(null),
		headerSlot,
		backLink,
		backLabel,
		badgeText,
		children,
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & {
		headerSlot?: Snippet;
		backLink: string;
		backLabel: string;
		badgeText?: string;
		children: Snippet;
	} = $props();

	let userEmail = $derived(authState.user?.email ?? '');
	let userInitial = $derived(userEmail ? userEmail[0].toUpperCase() : '?');

	function handleLogout() {
		authState.clearSession();
		goto('/login');
	}
</script>

<Sidebar.Root {...restProps} bind:ref>
	<Sidebar.Header class="pt-6 pb-2 px-4">
		<div class="mb-4 px-1">
			<AppLogo textClass="text-2xl text-foreground" />
		</div>
		{#if badgeText}
			<div
				class="px-2 py-1 mb-2 bg-primary/10 text-primary text-xs font-semibold rounded-md inline-block uppercase tracking-widest text-center w-full"
			>
				{badgeText}
			</div>
		{/if}
		{#if headerSlot}
			{@render headerSlot()}
		{/if}
	</Sidebar.Header>
	<Sidebar.Content>
		<!-- Back link -->
		<Sidebar.Group>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					<Sidebar.MenuItem>
						<Sidebar.MenuButton>
							{#snippet child({ props })}
								<a href={backLink} {...props}>
									<ArrowLeft class="size-4" />
									<span>{backLabel}</span>
								</a>
							{/snippet}
						</Sidebar.MenuButton>
					</Sidebar.MenuItem>
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>

		<Sidebar.Separator />

		<!-- Main Content -->
		{@render children()}
	</Sidebar.Content>
	<Sidebar.Footer>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<DropdownMenu.Root>
					<DropdownMenu.Trigger>
						{#snippet child({ props })}
							<Sidebar.MenuButton
								size="lg"
								class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
								{...props}
							>
								<Avatar.Root class="h-8 w-8 rounded-lg">
									<Avatar.Fallback
										class="rounded-lg bg-primary/10 text-primary font-semibold text-sm"
									>
										{userInitial}
									</Avatar.Fallback>
								</Avatar.Root>
								<div class="grid flex-1 text-left text-sm leading-tight">
									<span class="truncate font-semibold">{userEmail}</span>
								</div>
								<ChevronsUpDown class="ms-auto size-4" />
							</Sidebar.MenuButton>
						{/snippet}
					</DropdownMenu.Trigger>
					<DropdownMenu.Content
						class="w-(--bits-dropdown-menu-anchor-width) min-w-56 rounded-lg"
						side="bottom"
						align="end"
						sideOffset={4}
					>
						<DropdownMenu.Label class="p-0 font-normal">
							<div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
								<Avatar.Root class="h-8 w-8 rounded-lg">
									<Avatar.Fallback
										class="rounded-lg bg-primary/10 text-primary font-semibold text-sm"
									>
										{userInitial}
									</Avatar.Fallback>
								</Avatar.Root>
								<div class="grid flex-1 text-left text-sm leading-tight">
									<span class="truncate font-semibold">{userEmail}</span>
								</div>
							</div>
						</DropdownMenu.Label>
						<DropdownMenu.Separator />
						<DropdownMenu.Item onSelect={() => goto('/app/profile')} class="cursor-pointer">
							<User class="mr-2 size-4" />
							Profil Saya
						</DropdownMenu.Item>
						<DropdownMenu.Separator />
						<DropdownMenu.Item onSelect={handleLogout} class="cursor-pointer text-destructive">
							<LogOut class="mr-2 size-4" />
							Keluar
						</DropdownMenu.Item>
					</DropdownMenu.Content>
				</DropdownMenu.Root>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>
	<Sidebar.Rail />
</Sidebar.Root>
