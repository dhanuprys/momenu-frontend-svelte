<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { authState } from '$lib/stores/auth.svelte';
	import { User, LogOut, ShieldAlert, LayoutDashboard } from '@lucide/svelte';
	import AppLogo from '$lib/components/brand/app-logo.svelte';
	import ModeToggle from '$lib/components/mode-toggle.svelte';

	let user = $derived(authState.user);

	function handleLogout() {
		authState.clearSession();
		window.location.href = '/login';
	}
</script>

<header
	class="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
>
	<div class="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
		<div class="flex items-center gap-6">
			<a href="/app" class="flex items-center space-x-2">
				<AppLogo />
			</a>
		</div>

		<div class="flex items-center gap-2 md:gap-4">
			{#if user}
				<Button variant="ghost" size="sm" href="/app" class="hidden sm:flex">
					<LayoutDashboard class="mr-2 h-4 w-4" />
					Dashboard
				</Button>

				{#if user.is_admin}
					<Button
						variant="ghost"
						size="sm"
						href="/app/admin"
						class="hidden sm:flex text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:text-amber-500 dark:hover:bg-amber-950"
					>
						<ShieldAlert class="mr-2 h-4 w-4" />
						Admin
					</Button>
				{/if}

				<Button variant="ghost" size="sm" href="/app/profile">
					<User class="mr-2 h-4 w-4" />
					Profil
				</Button>

				<Button variant="outline" size="sm" onclick={handleLogout}>
					<LogOut class="mr-2 h-4 w-4" />
					<span class="hidden sm:inline">Keluar</span>
				</Button>

				<ModeToggle />
			{/if}
		</div>
	</div>
</header>
