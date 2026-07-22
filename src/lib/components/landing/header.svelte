<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { authState } from '$lib/stores/auth.svelte';
	import { LogOut, User, Sparkles } from '@lucide/svelte';
	import AppLogo from '$lib/components/brand/app-logo.svelte';
</script>

<header class="sticky top-4 z-50 w-full px-4 md:px-8">
	<div
		class="container mx-auto max-w-6xl flex h-16 items-center justify-between px-6 rounded-full border border-emerald-900/20 bg-[#121815]/90 text-stone-100 backdrop-blur-xl shadow-2xl shadow-stone-950/20 transition-all duration-300"
	>
		<!-- Logo -->
		<div class="flex items-center gap-8">
			<a href="/" class="flex items-center space-x-2 group">
				<AppLogo
					textClass="text-lg font-serif italic tracking-wide text-emerald-300 group-hover:text-emerald-200 transition-colors"
				/>
			</a>

			<!-- Navigation Links -->
			<nav class="hidden md:flex items-center gap-8">
				<a
					href="/explore"
					class="text-xs uppercase tracking-widest font-medium text-stone-300 transition-colors hover:text-emerald-300"
				>
					Koleksi Tema
				</a>
				<a
					href="/#fitur"
					class="text-xs uppercase tracking-widest font-medium text-stone-300 transition-colors hover:text-emerald-300"
				>
					Fitur
				</a>
				<a
					href="/#cara-kerja"
					class="text-xs uppercase tracking-widest font-medium text-stone-300 transition-colors hover:text-emerald-300"
				>
					Cara Kerja
				</a>
				<a
					href="/#akses"
					class="text-xs uppercase tracking-widest font-medium text-stone-300 transition-colors hover:text-emerald-300"
				>
					Akses
				</a>
			</nav>
		</div>

		<!-- Action Buttons -->
		<div class="flex items-center gap-4">
			{#if authState.isAuthenticated}
				<Button
					variant="ghost"
					class="hidden sm:flex text-stone-300 hover:text-white hover:bg-stone-800/60 rounded-full text-xs uppercase tracking-wider font-semibold"
					href="/app"
				>
					<User class="mr-2 h-3.5 w-3.5" />
					Dashboard
				</Button>
				<Button
					variant="outline"
					class="rounded-full border-emerald-800/50 text-stone-300 hover:bg-stone-800 text-xs uppercase tracking-wider"
					onclick={() => authState.clearSession()}
				>
					<LogOut class="mr-2 h-3.5 w-3.5" />
					Keluar
				</Button>
			{:else}
				<a
					href="/login"
					class="text-xs uppercase tracking-widest font-medium text-stone-300 transition-colors hover:text-emerald-300 hidden sm:block"
				>
					Masuk
				</a>
				<Button
					href="/register"
					class="rounded-full bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-300 text-stone-950 font-bold text-xs uppercase tracking-wider px-5 py-2 hover:opacity-95 shadow-md shadow-emerald-500/10 border-0 transition-transform active:scale-95"
				>
					Buat Undangan
				</Button>
			{/if}
		</div>
	</div>
</header>
