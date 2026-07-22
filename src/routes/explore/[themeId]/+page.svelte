<script lang="ts">
	import { page } from '$app/stores';
	import Header from '$lib/components/landing/header.svelte';
	import Footer from '$lib/components/landing/footer.svelte';
	import { onMount } from 'svelte';
	import { ThemeService } from '$lib/services/theme.service';
	import type { Theme } from '$lib/types/index';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { getMediaUrl } from '$lib/utils';
	import { ArrowLeft, CheckCircle2, Image as ImageIcon, LayoutTemplate } from '@lucide/svelte';
	import SEO from '$lib/components/seo.svelte';
	import { fly, scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';

	let themeId = $derived($page.params.themeId);
	let theme = $state<Theme | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	onMount(async () => {
		try {
			if (!themeId) throw new Error('Theme ID is missing');
			const res = await ThemeService.get(themeId);
			theme = res;
		} catch (e) {
			console.error('Failed to fetch theme:', e);
			error = 'Gagal memuat detail tema. Tema mungkin tidak ditemukan.';
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

	const formatPrice = (price: number | null) => {
		if (!price || price === 0) return 'Gratis';
		return `Rp ${price.toLocaleString('id-ID')}`;
	};
</script>

<SEO
	title={theme ? `Momenu | Tema ${theme.name}` : 'Momenu | Detail Tema'}
	description={theme ? theme.description : 'Lihat detail tema undangan digital premium kami.'}
	keywords={`tema undangan, ${theme?.event_type}, desain ${theme?.name}`}
	url={`https://momenu.id/explore/${themeId}`}
/>

<div
	class="min-h-screen flex flex-col bg-stone-50 font-sans text-stone-900 selection:bg-primary/20 relative overflow-hidden"
>
	<!-- Subtle Background Dot Pattern & Soft Primary Wash -->
	<div class="absolute inset-0 z-0 pointer-events-none overflow-hidden">
		<!-- Subtle dot grid -->
		<div
			class="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] opacity-60"
		></div>
		<!-- Very subtle, elegant primary background wash -->
		<div
			class="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[100px]"
		></div>
		<div
			class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]"
		></div>
	</div>

	<div class="relative z-10 flex flex-col min-h-screen">
		<Header />

		<main class="flex-1 py-12 md:py-20">
			<div class="container mx-auto px-4 md:px-6 max-w-6xl">
				<!-- Back Button -->
				<div class="mb-8" in:fly={{ y: -10, duration: 600, delay: 100, easing: quintOut }}>
					<Button
						variant="ghost"
						href="/explore"
						class="text-stone-500 hover:text-stone-900 hover:bg-stone-200/50 rounded-full pl-2"
					>
						<ArrowLeft class="mr-2 h-4 w-4" /> Kembali ke Katalog
					</Button>
				</div>

				{#if loading}
					<!-- Loading Skeleton Layout -->
					<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
						<Skeleton class="h-150 w-full rounded-[2rem] bg-stone-200/50 shadow-sm" />
						<div class="space-y-6 pt-4">
							<Skeleton class="h-8 w-32 rounded-full bg-stone-200/50" />
							<Skeleton class="h-12 w-3/4 bg-stone-200/50" />
							<Skeleton class="h-8 w-1/4 bg-stone-200/50" />
							<div class="space-y-3 pt-6">
								<Skeleton class="h-4 w-full bg-stone-200/50" />
								<Skeleton class="h-4 w-full bg-stone-200/50" />
								<Skeleton class="h-4 w-5/6 bg-stone-200/50" />
							</div>
							<div class="pt-8 space-y-4">
								<Skeleton class="h-6 w-1/2 bg-stone-200/50" />
								<Skeleton class="h-20 w-full rounded-2xl bg-stone-200/50" />
								<Skeleton class="h-20 w-full rounded-2xl bg-stone-200/50" />
							</div>
						</div>
					</div>
				{:else if error || !theme}
					<!-- Error State -->
					<div
						in:scale={{ duration: 400, opacity: 0, start: 0.95 }}
						class="flex flex-col items-center justify-center p-16 text-center bg-white/60 backdrop-blur-md rounded-3xl border border-red-100 shadow-sm max-w-xl mx-auto mt-12"
					>
						<p class="text-red-600 font-medium mb-6 text-lg">{error || 'Tema tidak ditemukan.'}</p>
						<Button
							href="/explore"
							class="rounded-full shadow-md bg-stone-900 hover:bg-stone-800 text-white px-8"
						>
							Cari Tema Lain
						</Button>
					</div>
				{:else}
					<!-- Theme Detail Split Layout -->
					<div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
						<!-- Left Side: Image Presentation -->
						<div
							in:fly={{ x: -30, duration: 800, delay: 200, easing: quintOut }}
							class="relative rounded-[2rem] border border-white/80 bg-white/70 backdrop-blur-xl p-3 shadow-xl overflow-hidden group"
						>
							<div
								class="relative w-full rounded-[1.5rem] overflow-hidden bg-stone-100"
								style="aspect-ratio: 4/5;"
							>
								{#if theme.thumbnail}
									<img
										src={getMediaUrl(theme.thumbnail)}
										alt={theme.name}
										class="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
									/>
								{:else}
									<div
										class="absolute inset-0 flex items-center justify-center text-stone-300 bg-gradient-to-br from-stone-100 to-stone-200"
									>
										<ImageIcon class="h-24 w-24 opacity-50" />
									</div>
								{/if}
							</div>
						</div>

						<!-- Right Side: Details & CTA -->
						<div
							in:fly={{ x: 30, duration: 800, delay: 300, easing: quintOut }}
							class="flex flex-col h-full lg:pt-6 pb-24 lg:pb-0"
						>
							<div class="mb-6">
								<span
									class="inline-flex items-center rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-primary ring-1 ring-primary/20 mb-4 shadow-sm"
								>
									{eventTypeLabels[theme.event_type] || theme.event_type}
								</span>
								<h1 class="text-4xl md:text-5xl font-extrabold text-stone-900 tracking-tight mb-4">
									{theme.name}
								</h1>
								<div class="text-3xl font-bold text-stone-800 flex items-center gap-3">
									{formatPrice(theme.price)}
								</div>
							</div>

							<p class="text-stone-600 text-lg leading-relaxed mb-10">
								{theme.description}
							</p>

							<!-- Features / Included Assets -->
							<div class="mb-10">
								<h3 class="text-lg font-bold text-stone-900 mb-5 flex items-center gap-2">
									<LayoutTemplate class="w-5 h-5 text-primary" /> Termasuk dalam tema ini
								</h3>
								<ul class="space-y-4">
									<li class="flex items-start gap-3">
										<CheckCircle2 class="w-5 h-5 text-primary shrink-0 mt-0.5" />
										<span class="text-stone-700">Kostumisasi Teks & Warna Tanpa Batas</span>
									</li>
									<li class="flex items-start gap-3">
										<CheckCircle2 class="w-5 h-5 text-primary shrink-0 mt-0.5" />
										<span class="text-stone-700">Dukungan Musik Latar</span>
									</li>
									{#if theme.media_buckets && theme.media_buckets.length > 0}
										{#each theme.media_buckets as bucket}
											<li class="flex items-start gap-3">
												<CheckCircle2 class="w-5 h-5 text-primary shrink-0 mt-0.5" />
												<span class="text-stone-700">
													<span class="font-semibold text-stone-900">{bucket.label}</span>
													(Maksimal {bucket.max_files}
													{bucket.media_type === 'image'
														? 'Foto'
														: bucket.media_type === 'video'
															? 'Video'
															: 'File'})
												</span>
											</li>
										{/each}
									{/if}
								</ul>
							</div>

							<!-- Desktop CTA (Hidden on mobile sticky bottom) -->
							<div
								class="hidden md:flex items-center gap-4 mt-auto pt-8 border-t border-stone-200/60"
							>
								<Button
									href={`/explore/${theme.id}/demo`}
									variant="outline"
									class="text-lg font-bold px-8 py-7 rounded-full border-stone-300 hover:bg-stone-100 text-stone-700 transition-all duration-300 hover:-translate-y-1"
								>
									Lihat Demo
								</Button>
								<Button
									href={`/login?redirect=/app/project/new?themeId=${theme.id}`}
									class="flex-1 sm:flex-none sm:w-auto text-lg font-bold px-10 py-7 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgba(var(--color-primary),0.2)] bg-stone-900 hover:bg-stone-800 text-white transition-all duration-300 hover:-translate-y-1"
								>
									Gunakan Tema Ini
								</Button>
							</div>
						</div>
					</div>

					<!-- Mobile Sticky Bottom CTA -->
					<div
						class="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-stone-200/50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-50 transition-transform"
					>
						<div class="flex items-center justify-between gap-3">
							<div class="flex flex-col min-w-17.5">
								<span class="text-xs font-medium text-stone-500 uppercase tracking-wider"
									>Harga</span
								>
								<span class="font-bold text-stone-900 text-lg">{formatPrice(theme.price)}</span>
							</div>
							<div class="flex flex-1 gap-2">
								<Button
									href={`/explore/${theme.id}/demo`}
									variant="outline"
									class="flex-1 font-bold rounded-full py-6 border-stone-300 text-stone-700 hover:bg-stone-100 shadow-sm"
								>
									Demo
								</Button>
								<Button
									href={`/login?redirect=/app/project/new?themeId=${theme.id}`}
									class="flex-1 font-bold rounded-full py-6 bg-stone-900 text-white hover:bg-stone-800 shadow-md"
								>
									Gunakan
								</Button>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</main>

		<Footer />
	</div>
</div>
