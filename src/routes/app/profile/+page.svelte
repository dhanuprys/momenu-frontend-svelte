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

<div class="container mx-auto max-w-4xl px-4 py-8 md:px-8">
	<div class="flex items-center justify-between mb-8">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Profil Pengguna</h1>
			<p class="text-muted-foreground mt-1">Kelola informasi akun dan preferensi Anda.</p>
		</div>
		<Button
			variant="destructive"
			class="text-destructive hover:bg-destructive/10 border-destructive/20"
			onclick={handleLogout}
		>
			<LogOut class="mr-2 h-4 w-4" /> Keluar
		</Button>
	</div>

	{#if user}
		<div class="grid gap-6 md:grid-cols-3">
			<Card.Root class="md:col-span-1 h-fit">
				<Card.Content class="pt-6 flex flex-col items-center text-center">
					<Avatar.Root class="h-24 w-24 mb-4 border-4 border-background shadow-lg">
						<Avatar.Fallback class="text-3xl font-bold bg-primary/10 text-primary">
							{user.email.substring(0, 2).toUpperCase()}
						</Avatar.Fallback>
					</Avatar.Root>
					<h3 class="text-xl font-bold mb-1 truncate w-full px-4" title={user.email}>
						{user.email.split('@')[0]}
					</h3>
					<p class="text-sm text-muted-foreground mb-4 truncate w-full">{user.email}</p>

					<div class="flex gap-2 justify-center flex-wrap">
						{#if user.is_admin}
							<Badge variant="default" class="bg-primary text-primary-foreground">Admin</Badge>
						{:else}
							<Badge variant="secondary">Pengguna</Badge>
						{/if}

						{#if user.google_id}
							<Badge variant="outline" class="border-blue-200 text-blue-700 bg-blue-50"
								>Google Akun</Badge
							>
						{/if}
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root class="md:col-span-2">
				<Card.Header>
					<Card.Title>Informasi Akun</Card.Title>
					<Card.Description>Detail informasi mengenai akun Momenu Anda.</Card.Description>
				</Card.Header>
				<Card.Content class="space-y-6">
					<div class="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-muted/50">
						<div class="p-2 bg-background rounded-md shadow-sm shrink-0">
							<Mail class="h-5 w-5 text-muted-foreground" />
						</div>
						<div class="space-y-1 overflow-hidden">
							<p class="text-sm font-medium leading-none">Alamat Email</p>
							<p class="text-sm text-muted-foreground truncate">{user.email}</p>
						</div>
					</div>

					<div class="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-muted/50">
						<div class="p-2 bg-background rounded-md shadow-sm shrink-0">
							<Calendar class="h-5 w-5 text-muted-foreground" />
						</div>
						<div class="space-y-1">
							<p class="text-sm font-medium leading-none">Bergabung Sejak</p>
							<p class="text-sm text-muted-foreground">{formatDate(user.created_at)}</p>
						</div>
					</div>

					<div class="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-muted/50">
						<div class="p-2 bg-background rounded-md shadow-sm shrink-0">
							<Key class="h-5 w-5 text-muted-foreground" />
						</div>
						<div class="space-y-1 w-full">
							<div class="flex justify-between items-center w-full">
								<p class="text-sm font-medium leading-none">Kata Sandi</p>
								{#if !user.google_id}
									<Button variant="link" class="h-auto p-0 text-sm">Ubah</Button>
								{/if}
							</div>
							<p class="text-sm text-muted-foreground">
								{#if user.google_id}
									Anda masuk menggunakan Google. Kata sandi diatur oleh penyedia layanan Anda.
								{:else}
									••••••••••••
								{/if}
							</p>
						</div>
					</div>
				</Card.Content>
			</Card.Root>
		</div>
	{:else}
		<div
			class="flex flex-col items-center justify-center p-12 text-center bg-muted/20 rounded-2xl border border-dashed"
		>
			<User class="h-12 w-12 text-muted-foreground mb-4" />
			<h2 class="text-xl font-medium mb-2">Memuat Profil</h2>
			<p class="text-muted-foreground mb-4">Sedang mengambil informasi pengguna...</p>
		</div>
	{/if}
</div>
