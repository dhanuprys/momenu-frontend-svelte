<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { authState } from '$lib/stores/auth.svelte.js';
	import { LogOut, User } from '@lucide/svelte';
	import AppLogo from '$lib/components/brand/app-logo.svelte';
</script>

<header
	class="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60"
>
	<div class="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">
		<div class="flex items-center gap-6">
			<a href="/" class="flex items-center space-x-2">
				<AppLogo />
			</a>
			<nav class="hidden md:flex gap-6">
				<a
					href="#fitur"
					class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
					>Fitur</a
				>
				<a
					href="#cara-kerja"
					class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
					>Cara Kerja</a
				>
				<a
					href="#akses"
					class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
					>Akses</a
				>
			</nav>
		</div>

		<div class="flex items-center gap-4">
			{#if authState.isAuthenticated}
				<Button variant="ghost" class="hidden sm:flex" href="/app">
					<User class="mr-2 h-4 w-4" />
					Dashboard
				</Button>
				<Button variant="outline" onclick={() => authState.clearSession()}>
					<LogOut class="mr-2 h-4 w-4" />
					Keluar
				</Button>
			{:else}
				<a
					href="/login"
					class="text-sm font-medium text-muted-foreground transition-colors hover:text-primary hidden sm:block"
					>Masuk</a
				>
				<Button href="/register">Buat Akun</Button>
			{/if}
		</div>
	</div>
</header>
