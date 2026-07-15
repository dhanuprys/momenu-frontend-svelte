<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Mail, Calendar, User, Key, LogOut } from '@lucide/svelte';
	import { authState } from '$lib/stores/auth.svelte';
	import AppHeader from '$lib/components/layout/app-header.svelte';

	let user = $derived(authState.user);

	function formatDate(dateString: string | undefined) {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString('id-ID', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		});
	}

	function handleLogout() {
		authState.clearSession();
		window.location.href = '/masuk';
	}
</script>

<svelte:head>
	<title>Momenu | Profil Pengguna</title>
</svelte:head>

<AppHeader />

<div class="container mx-auto max-w-7xl px-4 py-12 md:px-8 relative">

	<div class="flex items-center justify-between mb-12">
		<div>
			<h1 class="text-4xl font-extrabold tracking-tight">Profil Pengguna</h1>
			<p class="text-muted-foreground mt-2 font-medium">Kelola informasi akun dan preferensi Anda.</p>
		</div>
		<Button
			variant="outline"
			class="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all duration-300 shadow-sm"
			onclick={handleLogout}
		>
			<LogOut class="mr-2 h-4 w-4" /> <span class="hidden sm:inline">Keluar</span>
		</Button>
	</div>

	{#if user}
		<div class="grid gap-8 lg:grid-cols-3 items-start">
			<!-- Left Column: Avatar & Quick Info -->
			<div class="lg:col-span-1">
				<Card.Root class="overflow-hidden border-0 shadow-xl bg-white/60 dark:bg-stone-900/60 backdrop-blur-xl relative group transition-all duration-500 hover:shadow-2xl">
					<Card.Content class="pt-8 pb-8 flex flex-col items-center text-center relative z-10">
						<div class="relative mb-6 group cursor-pointer">
							<Avatar.Root class="h-32 w-32 relative border-4 border-background shadow-lg transition-transform duration-500 group-hover:scale-105">
								<Avatar.Fallback class="text-4xl font-bold bg-primary/10 text-primary">
									{user.email.substring(0, 2).toUpperCase()}
								</Avatar.Fallback>
							</Avatar.Root>
						</div>
						
						<h3 class="text-2xl font-bold mb-1 truncate w-full px-4 text-stone-900 dark:text-stone-100" title={user.email}>
							{user.email.split('@')[0]}
						</h3>
						<p class="text-sm text-muted-foreground mb-6 truncate w-full px-4">{user.email}</p>

						<div class="flex gap-2 justify-center flex-wrap">
							{#if user.is_admin}
								<Badge class="bg-primary/10 text-primary hover:bg-primary/20 border-0 font-semibold px-3 py-1">Admin</Badge>
							{:else}
								<Badge variant="secondary" class="bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 border-0 font-semibold px-3 py-1 hover:bg-stone-200 dark:hover:bg-stone-700">Pengguna</Badge>
							{/if}

							{#if user.google_id}
								<Badge variant="outline" class="border-blue-200/50 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 font-semibold px-3 py-1">
									<svg class="w-3.5 h-3.5 mr-1.5 inline" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
									Akun Google
								</Badge>
							{/if}
						</div>
					</Card.Content>
				</Card.Root>
			</div>

			<!-- Right Column: Account Details -->
			<div class="lg:col-span-2">
				<Card.Root class="border-0 shadow-lg bg-white/80 dark:bg-stone-900/80 backdrop-blur-md">
					<Card.Header class="pb-8 border-b border-stone-100 dark:border-stone-800">
						<Card.Title class="text-2xl font-bold">Informasi Akun</Card.Title>
						<Card.Description class="text-base mt-1">Detail informasi mengenai akun Momenu Anda.</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-2 pt-6">
						<!-- Info Row 1 -->
						<div class="group flex items-start sm:items-center gap-4 p-4 md:p-5 rounded-2xl hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors duration-300">
							<div class="p-3 bg-stone-100 dark:bg-stone-800 rounded-xl shrink-0 group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-300">
								<Mail class="h-6 w-6 text-stone-500 group-hover:text-primary transition-colors" />
							</div>
							<div class="space-y-1 overflow-hidden flex-1">
								<p class="text-sm font-semibold text-stone-500 dark:text-stone-400">Alamat Email</p>
								<p class="text-base font-medium text-stone-900 dark:text-stone-100 truncate">{user.email}</p>
							</div>
						</div>

						<!-- Info Row 2 -->
						<div class="group flex items-start sm:items-center gap-4 p-4 md:p-5 rounded-2xl hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors duration-300">
							<div class="p-3 bg-stone-100 dark:bg-stone-800 rounded-xl shrink-0 group-hover:scale-110 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-all duration-300">
								<Calendar class="h-6 w-6 text-stone-500 group-hover:text-emerald-500 transition-colors" />
							</div>
							<div class="space-y-1 flex-1">
								<p class="text-sm font-semibold text-stone-500 dark:text-stone-400">Bergabung Sejak</p>
								<p class="text-base font-medium text-stone-900 dark:text-stone-100">{formatDate(user.created_at)}</p>
							</div>
						</div>

						<!-- Info Row 3 -->
						<div class="group flex items-start sm:items-center gap-4 p-4 md:p-5 rounded-2xl hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors duration-300">
							<div class="p-3 bg-stone-100 dark:bg-stone-800 rounded-xl shrink-0 group-hover:scale-110 group-hover:bg-purple-500/10 group-hover:text-purple-500 transition-all duration-300">
								<Key class="h-6 w-6 text-stone-500 group-hover:text-purple-500 transition-colors" />
							</div>
							<div class="space-y-1 w-full flex-1">
								<div class="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-2 sm:gap-0">
									<div>
										<p class="text-sm font-semibold text-stone-500 dark:text-stone-400">Kata Sandi</p>
										<p class="text-base font-medium text-stone-900 dark:text-stone-100 mt-0.5">
											{#if user.google_id}
												<span class="text-sm text-stone-500">Dikelola oleh Google</span>
											{:else}
												••••••••••••
											{/if}
										</p>
									</div>
									{#if !user.google_id}
										<Button variant="outline" size="sm" class="w-full sm:w-auto hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 dark:hover:bg-purple-900/20 dark:hover:text-purple-400 transition-colors">Ubah Kata Sandi</Button>
									{/if}
								</div>
							</div>
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	{:else}
		<!-- Empty / Loading State -->
		<div class="flex flex-col items-center justify-center py-20 px-4 text-center relative overflow-hidden rounded-3xl border border-stone-200 dark:border-stone-800 bg-white/50 dark:bg-stone-900/50 backdrop-blur-sm">
			<div class="relative z-10 flex flex-col items-center">
				<div class="relative mb-6">
					<div class="absolute inset-0 border-4 border-t-primary rounded-full animate-spin"></div>
					<div class="p-5 bg-stone-100 dark:bg-stone-800 rounded-full text-stone-400">
						<User class="h-8 w-8" />
					</div>
				</div>
				<h2 class="text-2xl font-bold mb-2">Memuat Profil</h2>
				<p class="text-muted-foreground max-w-sm">Sedang mengambil informasi pengguna yang aman...</p>
			</div>
		</div>
	{/if}
</div>
