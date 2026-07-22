<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Eye, ArrowRight, Sparkles } from '@lucide/svelte';
	import { ThemeService } from '$lib/services/theme.service.js';
	import type { Theme } from '$lib/types/index.js';
	import { EVENT_TYPES } from '$lib/types/enums.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';

	let activeFilter = $state('Semua');

	const filters = ['Semua', ...EVENT_TYPES];

	const categoryLabels: Record<string, string> = {
		Semua: 'Semua Acara',
		pernikahan: 'Pernikahan',
		ulang_tahun: 'Ulang Tahun',
		metatah: 'Metatah / Potong Gigi',
		tigang_sasih: 'Tigang Sasih',
		seminar: 'Seminar & Event',
		wedding: 'Pernikahan',
		birthday: 'Ulang Tahun'
	};

	let themes = $state<Theme[]>([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			const res = await ThemeService.list();
			themes = res;
		} catch (e) {
			console.error('Failed to fetch themes:', e);
		} finally {
			loading = false;
		}
	});

	const filteredThemes = $derived(
		activeFilter === 'Semua'
			? themes.slice(0, 6)
			: themes.filter((t) => t.event_type === activeFilter).slice(0, 6)
	);

	const themeCardStyles: Record<string, { bg: string; text: string; badge: string }> = {
		pernikahan_bali_simple_1: {
			bg: 'bg-[#121815] border-emerald-500/30 text-emerald-100',
			text: 'Romeo & Juliet',
			badge: 'Unggulan'
		},
		ulang_tahun_festive_1: {
			bg: 'bg-stone-900 border-stone-800 text-stone-100',
			text: 'Pesta Ulang Tahun',
			badge: 'Favorit'
		},
		metatah_sakral_1: {
			bg: 'bg-[#161f1b] border-emerald-800/30 text-emerald-100',
			text: 'Upacara Sakral',
			badge: 'Tradisional'
		},
		tigang_sasih_pastel_1: {
			bg: 'bg-[#0f1715] border-teal-800/30 text-teal-100',
			text: 'Upacara Bayi',
			badge: 'Pastel'
		},
		seminar_professional_1: {
			bg: 'bg-[#0f141d] border-blue-800/30 text-blue-100',
			text: 'Professional Event',
			badge: 'Formal'
		}
	};
</script>

<section id="tema" class="py-28 bg-[#F9FAF8] relative overflow-hidden select-none">
	<div class="container mx-auto max-w-6xl px-4 md:px-8">
		<!-- Section Header & Centered Filter Pill Bar -->
		<div class="flex flex-col items-center text-center space-y-4 mb-16">
			<h2 class="text-4xl sm:text-5xl md:text-6xl font-serif font-normal tracking-tight text-stone-900">
				Koleksi Desain Eksklusif
			</h2>
			<p class="max-w-xl text-stone-600 text-base md:text-lg leading-relaxed font-sans">
				Pilihan tema premium dengan estetika minimalis, animasi halus, dan fitur interaktif penuh.
			</p>

			<!-- Refined Centered Showcase Filter Badges -->
			<div class="pt-4 flex flex-wrap justify-center gap-2.5 w-full max-w-full">
				{#each filters as filter}
					<button
						type="button"
						class="px-5 py-2.5 text-[11px] sm:text-xs uppercase tracking-wider font-semibold rounded-full border transition-all duration-300 whitespace-nowrap focus:outline-none {activeFilter ===
						filter
							? 'bg-[#121815] text-emerald-200 border-[#121815] shadow-md'
							: 'bg-white/90 text-stone-600 border-stone-200/90 hover:text-stone-900 hover:bg-stone-50 hover:border-stone-300 shadow-xs backdrop-blur-md'}"
						onclick={() => (activeFilter = filter)}
					>
							{categoryLabels[filter] || filter}
					</button>
				{/each}
			</div>
		</div>

		<!-- Theme Cards Grid -->
		{#if loading}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{#each Array(3) as _}
					<div class="flex flex-col group rounded-[2rem] border border-stone-200/80 bg-white/90 backdrop-blur-xl overflow-hidden shadow-xs p-3">
						<Skeleton class="h-64 w-full rounded-2xl bg-stone-200/60" />
						<div class="p-4 mt-2 space-y-3">
							<Skeleton class="h-5 w-3/4 rounded-full bg-stone-200/60" />
							<Skeleton class="h-4 w-full rounded-full bg-stone-200/60" />
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
				{#each filteredThemes as theme}
					{@const style = themeCardStyles[theme.id] || { bg: 'bg-[#121815] border-stone-800 text-stone-100', text: theme.name, badge: 'Premium' }}
					<div
						class="flex flex-col group rounded-[2rem] border border-stone-200/80 bg-white/90 backdrop-blur-xl overflow-hidden shadow-xs hover:shadow-2xl hover:border-emerald-900/30 transition-all duration-500 hover:-translate-y-1.5"
					>
						<!-- Card Header Preview -->
						<div class="h-64 relative overflow-hidden flex items-center justify-center p-6 border-b border-stone-200/40 {style.bg}">
							<!-- Inner Mock Screen -->
							<div
								class="relative w-full max-w-[210px] aspect-[4/6] rounded-2xl border border-white/10 bg-black/50 backdrop-blur-md p-5 shadow-2xl flex flex-col justify-between group-hover:scale-105 transition-transform duration-500"
							>
								<div class="border border-white/10 rounded-xl p-3 text-center flex-grow flex flex-col justify-center gap-1.5">
									<span class="text-[7px] tracking-[0.3em] text-emerald-300/80 uppercase font-semibold">PREVIEW TEMA</span>
									<span class="font-serif italic text-base font-normal text-emerald-100 truncate">{theme.name}</span>
									<div class="h-0.5 w-6 bg-emerald-400/40 mx-auto my-1"></div>
									<span class="text-[8px] uppercase tracking-wider text-stone-400">{categoryLabels[theme.event_type] || theme.event_type}</span>
								</div>
								<div class="text-[7px] text-center text-emerald-200/70 border-t border-white/10 pt-2 font-semibold uppercase tracking-widest">
									Buka Undangan
								</div>
							</div>

							<!-- Badge -->
							<span
								class="absolute top-5 left-5 text-[9px] font-semibold tracking-[0.2em] uppercase bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-white/15 text-emerald-200 shadow-sm flex items-center gap-1"
							>
								<Sparkles class="w-3 h-3 text-emerald-300" />
								{style.badge}
							</span>
						</div>

						<!-- Card Body Details -->
						<div class="p-7 flex-grow flex flex-col justify-between space-y-6">
							<div class="space-y-2">
								<div class="flex items-center justify-between">
									<h3 class="font-serif font-normal text-xl text-stone-900 group-hover:text-emerald-900 transition-colors">{theme.name}</h3>
									<span class="text-[10px] uppercase tracking-wider font-semibold text-stone-500 bg-stone-100 px-3 py-1 rounded-full border border-stone-200">
										{categoryLabels[theme.event_type] || theme.event_type}
									</span>
								</div>
								<p class="text-xs text-stone-500 leading-relaxed font-sans line-clamp-2">
									{theme.description || 'Desain elegan berestetika tinggi dengan navigasi mulus, konfirmasi RSVP, dan buku tamu online.'}
								</p>
							</div>

							<!-- Action Buttons -->
							<div class="flex items-center gap-3 pt-2">
								<Button
									variant="outline"
									size="sm"
									class="flex-1 h-10 gap-1.5 text-xs uppercase tracking-wider font-semibold rounded-full border-stone-300 hover:bg-[#121815] hover:text-emerald-200 hover:border-[#121815] transition-all"
									href={`/explore/${theme.id}/demo`}
								>
									<Eye class="h-3.5 w-3.5" />
									Coba Demo
								</Button>
								<Button
									size="sm"
									class="flex-1 h-10 text-xs uppercase tracking-wider font-bold rounded-full bg-[#121815] hover:bg-[#1b2420] text-emerald-200"
									href={`/explore/${theme.id}`}
								>
									Detail
								</Button>
							</div>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- View All Link -->
		<div class="mt-20 text-center">
			<Button
				variant="outline"
				size="lg"
				class="rounded-full px-10 h-13 text-xs uppercase tracking-widest font-semibold gap-2 border-stone-300 hover:bg-[#121815] hover:text-emerald-200 hover:border-[#121815] shadow-sm transition-all"
				href="/explore"
			>
				<span>Jelajahi Seluruh Katalog</span>
				<ArrowRight class="w-4 h-4 text-emerald-700" />
			</Button>
		</div>
	</div>
</section>
