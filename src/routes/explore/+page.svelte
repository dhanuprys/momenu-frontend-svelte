<script lang="ts">
	import Header from '$lib/components/landing/header.svelte';
	import Footer from '$lib/components/landing/footer.svelte';
	import { onMount } from 'svelte';
	import { ThemeService } from '$lib/services/theme.service.js';
	import type { Theme } from '$lib/types/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { getMediaUrl } from '$lib/utils.js';
	import { Image, Sparkles, Eye, ArrowLeft } from '@lucide/svelte';
	import SEO from '$lib/components/seo.svelte';
	import { fly, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	import { EVENT_TYPES } from '$lib/types/enums.js';

	let themes = $state<Theme[]>([]);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let activeFilter = $state('Semua');

	const filters = ['Semua', ...EVENT_TYPES];

	onMount(async () => {
		try {
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
		Semua: 'Semua Acara',
		pernikahan: 'Pernikahan',
		ulang_tahun: 'Ulang Tahun',
		metatah: 'Metatah / Potong Gigi',
		tigang_sasih: 'Tigang Sasih',
		seminar: 'Seminar & Event',
		wedding: 'Pernikahan',
		birthday: 'Ulang Tahun'
	};

	const filteredThemes = $derived(
		activeFilter === 'Semua'
			? themes
			: themes.filter((t) => t.event_type === activeFilter)
	);
</script>

<SEO
	title="Momenu | Katalog Tema Undangan Eksklusif"
	description="Jelajahi koleksi tema undangan digital premium dengan estetika minimalis dan desain serba elegan."
	keywords="tema undangan digital, template undangan pernikahan, desain undangan online, katalog momenu"
	url="https://momenu.id/explore"
/>

<div
	class="min-h-screen flex flex-col bg-[#F9FAF8] font-sans text-stone-900 selection:bg-emerald-500/20 relative overflow-hidden select-none"
>
	<!-- Subtle Soft Sage Background Glow -->
	<div class="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-emerald-100/30 rounded-full blur-[140px] pointer-events-none -z-10"></div>

	<div class="relative z-10 flex flex-col min-h-screen">
		<Header />

		<main class="flex-1">
			<div class="container mx-auto px-4 md:px-8 py-20 md:py-28 max-w-7xl">
				<!-- HERO SECTION -->
				<div class="flex flex-col items-center text-center space-y-6 mb-16 max-w-3xl mx-auto">
					<h1
						in:fly={{ y: 30, duration: 800, delay: 200, easing: quintOut }}
						class="text-4xl font-serif font-normal tracking-tight sm:text-5xl md:text-6xl text-stone-900"
					>
						Katalog Desain Eksklusif
					</h1>

					<p
						in:fly={{ y: 30, duration: 800, delay: 300, easing: quintOut }}
						class="text-stone-600 md:text-lg leading-relaxed max-w-xl font-sans"
					>
						Setiap tema dibuat dengan presisi estetika tinggi, menyajikan keindahan tipografi dan navigasi interaktif penuh.
					</p>

					<!-- Event Type Filter Badges -->
					<div
						in:fly={{ y: 20, duration: 800, delay: 400, easing: quintOut }}
						class="pt-4 flex flex-wrap justify-center gap-2.5 w-full max-w-full"
					>
						{#each filters as filter}
							<button
								type="button"
								class="px-5 py-2.5 text-[11px] sm:text-xs uppercase tracking-wider font-semibold rounded-full border transition-all duration-300 whitespace-nowrap focus:outline-none {activeFilter ===
								filter
									? 'bg-[#121815] text-emerald-200 border-[#121815] shadow-md'
									: 'bg-white/90 text-stone-600 border-stone-200/90 hover:text-stone-900 hover:bg-stone-50 hover:border-stone-300 shadow-xs backdrop-blur-md'}"
								onclick={() => (activeFilter = filter)}
							>
									{eventTypeLabels[filter] || filter}
								</button>
						{/each}
					</div>
				</div>

				<!-- CONTENT -->
				{#if loading}
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
						{#each Array(8) as _, i}
							<div
								class="rounded-[2rem] border border-stone-200/60 bg-white/60 backdrop-blur-md overflow-hidden p-3 shadow-xs"
							>
								<Skeleton class="h-[320px] w-full rounded-2xl bg-stone-200/60" />
								<div class="p-4 space-y-3 mt-2">
									<Skeleton class="h-5 w-3/4 rounded-full bg-stone-200/60" />
									<Skeleton class="h-4 w-full rounded-full bg-stone-200/60" />
								</div>
							</div>
						{/each}
					</div>
				{:else if error}
					<div
						in:scale={{ duration: 400, opacity: 0, start: 0.95 }}
						class="flex flex-col items-center justify-center p-12 text-center bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-red-100 shadow-sm max-w-xl mx-auto"
					>
						<p class="text-red-600 font-medium mb-6 text-lg">{error}</p>
						<Button
							onclick={() => window.location.reload()}
							class="rounded-full shadow-md bg-[#121815] hover:bg-[#1b2420] text-emerald-200 text-xs uppercase tracking-wider font-bold px-8 py-3"
						>
							Coba Lagi
						</Button>
					</div>
				{:else if filteredThemes.length === 0}
					<div class="flex flex-col items-center justify-center py-20 text-center space-y-4">
						<p class="text-stone-500 font-serif italic text-xl">Belum ada tema untuk kategori ini.</p>
						<Button
							onclick={() => (activeFilter = 'Semua')}
							variant="outline"
							class="rounded-full border-stone-300 text-xs uppercase tracking-wider font-semibold"
						>
							Tampilkan Semua Tema
						</Button>
					</div>
				{:else}
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
						{#each filteredThemes as theme, i}
							<div
								in:fly={{ y: 50, duration: 800, delay: 200 + i * 60, easing: quintOut }}
								class="group relative rounded-[2rem] border border-stone-200/80 bg-white/90 backdrop-blur-xl p-3.5 shadow-xs hover:shadow-2xl hover:-translate-y-2 hover:border-emerald-900/30 transition-all duration-500 flex flex-col h-full overflow-hidden"
							>
								<!-- Image Container -->
								<div class="relative h-[320px] w-full overflow-hidden rounded-2xl bg-[#121815]">
									{#if theme.thumbnail}
										<img
											src={getMediaUrl(theme.thumbnail)}
											alt={theme.name}
											class="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
											loading="lazy"
										/>
									{:else}
										<div
											class="absolute inset-0 flex items-center justify-center text-stone-600 bg-[#121815]"
										>
											<div class="text-center space-y-2">
												<Image class="h-12 w-12 opacity-30 mx-auto text-emerald-200" />
												<span class="text-[10px] uppercase tracking-widest text-emerald-300/60 block font-serif">MOMENU PREVIEW</span>
											</div>
										</div>
									{/if}

									<!-- Frosted Hover Overlay -->
									<div
										class="absolute inset-0 bg-stone-950/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col items-center justify-center gap-3 backdrop-blur-xs z-10 p-4"
									>
										<Button
											class="rounded-full bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-300 text-stone-950 hover:opacity-95 font-bold text-xs uppercase tracking-wider px-6 py-3 shadow-lg"
											href={`/explore/${theme.id}/demo`}
										>
											<Eye class="w-3.5 h-3.5 mr-2" /> Coba Demo
										</Button>
										<Button
											variant="outline"
											class="rounded-full bg-white/10 text-stone-200 hover:bg-white/20 border-white/20 text-xs uppercase tracking-wider font-semibold px-6 py-3"
											href={`/explore/${theme.id}`}
										>
											Detail Tema
										</Button>
									</div>

									<!-- Category Badge -->
									<div class="absolute top-4 left-4 z-20">
										<span
											class="inline-flex items-center rounded-full bg-black/60 backdrop-blur-md px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-emerald-200 border border-white/15 shadow-sm"
										>
											{eventTypeLabels[theme.event_type] || theme.event_type}
										</span>
									</div>
								</div>

								<!-- Content Details -->
								<div class="px-3 pt-5 pb-3 flex-1 flex flex-col justify-between space-y-4">
									<div>
										<div class="flex justify-between items-center gap-3 mb-1.5">
											<h3
												class="text-xl font-serif font-normal text-stone-900 group-hover:text-emerald-900 transition-colors line-clamp-1"
											>
												{theme.name}
											</h3>
											<span
												class="shrink-0 text-[10px] font-bold uppercase tracking-wider bg-emerald-100/80 text-emerald-900 px-2.5 py-1 rounded-full border border-emerald-900/10"
											>
												{theme.price ? `Rp ${theme.price.toLocaleString('id-ID')}` : 'Gratis'}
											</span>
										</div>
										<p class="text-xs text-stone-500 line-clamp-2 leading-relaxed font-sans">
											{theme.description || 'Desain undangan digital eksklusif yang siap dipersonalisasi.'}
										</p>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</main>

		<Footer />
	</div>
</div>
