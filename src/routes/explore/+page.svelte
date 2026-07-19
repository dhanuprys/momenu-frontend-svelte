<script lang="ts">
	import Header from '$lib/components/landing/header.svelte';
	import Footer from '$lib/components/landing/footer.svelte';
	import { onMount } from 'svelte';
	import { ThemeService } from '$lib/services/theme.service.js';
	import type { Theme } from '$lib/types/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { getMediaUrl } from '$lib/utils.js';
	import { Image, Palette } from '@lucide/svelte';
	import SEO from '$lib/components/seo.svelte';

	let themes = $state<Theme[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			// In a real app, this might be paginated or have filters
			// The backend currently returns all themes via list()
			const res = await ThemeService.list();
			themes = res;
		} catch (e) {
			console.error('Failed to fetch themes:', e);
			error = 'Gagal memuat daftar tema. Silakan coba lagi.';
		} finally {
			loading = false;
		}
	});

	const eventTypeLabels: Record<string, string> = {
		wedding: 'Pernikahan',
		birthday: 'Ulang Tahun',
		corporate: 'Perusahaan',
		baby_shower: 'Baby Shower'
	};
</script>

<SEO
	title="Momenu | Katalog Tema Undangan"
	description="Pilih dari berbagai koleksi tema undangan digital premium kami untuk pernikahan, ulang tahun, dan acara lainnya. Desain elegan yang siap digunakan."
	keywords="tema undangan digital, template undangan pernikahan, desain undangan online, katalog momenu"
	url="https://momenu.id/explore"
/>

<div
	class="min-h-screen flex flex-col bg-background font-sans text-foreground selection:bg-primary/20"
>
	<Header />

	<main class="flex-1">
		<div class="container mx-auto px-4 md:px-6 py-16 md:py-24 max-w-7xl">
			<div class="flex flex-col items-center text-center space-y-4 mb-16">
				<div
					class="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
				>
					<Palette class="mr-2 h-4 w-4" /> Koleksi Eksklusif
				</div>
				<h1 class="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
					Temukan Tema Impian Anda
				</h1>
				<p
					class="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed"
				>
					Beragam pilihan desain elegan dan modern yang siap disesuaikan dengan momen spesial Anda.
				</p>
			</div>

			{#if loading}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
					{#each Array(8) as _}
						<Card.Root class="overflow-hidden border-none shadow-md">
							<Skeleton class="h-[300px] w-full" />
							<Card.Header class="p-4 space-y-2">
								<Skeleton class="h-4 w-1/4" />
								<Skeleton class="h-6 w-3/4" />
								<Skeleton class="h-4 w-full" />
							</Card.Header>
						</Card.Root>
					{/each}
				</div>
			{:else if error}
				<div
					class="flex flex-col items-center justify-center p-12 text-center bg-muted/20 rounded-2xl border border-dashed"
				>
					<p class="text-destructive font-medium mb-4">{error}</p>
					<Button onclick={() => window.location.reload()} variant="outline">Coba Lagi</Button>
				</div>
			{:else}
				<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
					{#each themes as theme}
						<Card.Root
							class="group overflow-hidden border-muted bg-card hover:shadow-xl hover:border-primary/50 transition-all duration-300"
						>
							<div class="relative h-[300px] w-full overflow-hidden bg-muted">
								{#if theme.thumbnail}
									<img
										src={getMediaUrl(theme.thumbnail)}
										alt={theme.name}
										class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
										loading="lazy"
									/>
								{:else}
									<div
										class="absolute inset-0 flex items-center justify-center text-muted-foreground bg-gradient-to-br from-muted to-muted/50"
									>
										<Image class="h-12 w-12 opacity-50" />
									</div>
								{/if}

								<!-- Hover Overlay -->
								<div
									class="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]"
								>
									<Button class="rounded-full shadow-lg" href="/login?redirect=/app/project/new">
										Gunakan Tema Ini
									</Button>
								</div>

								<!-- Badges -->
								<div class="absolute top-3 left-3 flex gap-2">
									<span
										class="inline-flex items-center rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold backdrop-blur-md shadow-sm border"
									>
										{eventTypeLabels[theme.event_type] || theme.event_type}
									</span>
								</div>

								<div class="absolute bottom-3 right-3">
									<span
										class="inline-flex items-center rounded-full bg-primary px-3 py-1 text-sm font-bold text-primary-foreground shadow-md"
									>
										{theme.price ? `Rp ${theme.price.toLocaleString('id-ID')}` : 'Gratis'}
									</span>
								</div>
							</div>

							<Card.Header class="p-5">
								<Card.Title class="text-xl line-clamp-1 group-hover:text-primary transition-colors"
									>{theme.name}</Card.Title
								>
								<Card.Description class="line-clamp-2 mt-2">{theme.description}</Card.Description>
							</Card.Header>
						</Card.Root>
					{/each}
				</div>
			{/if}
		</div>
	</main>

	<Footer />
</div>
