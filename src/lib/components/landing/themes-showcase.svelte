<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Eye, Palette } from '@lucide/svelte';

	let activeFilter = $state('Semua');

	const filters = ['Semua', 'Modern', 'Klasik', 'Floral', 'Minimalis'];

	const themes = [
		{
			name: 'Ethereal Gold',
			category: 'Modern',
			tag: 'Terpopuler',
			desc: 'Desain modern dengan aksen emas melayang dan latar belakang gelap transparan yang memberikan kesan mewah.',
			colors: ['bg-slate-950 border-amber-500/30', 'from-amber-400 via-amber-200 to-yellow-500'],
			previewUrl: '/demo/ethereal-gold'
		},
		{
			name: 'Rustic Blossom',
			category: 'Floral',
			tag: 'Favorit',
			desc: 'Sentuhan bunga cat air lembut dipadukan dengan tekstur kayu rustic alami. Sangat cocok untuk acara semi-outdoor.',
			colors: ['bg-stone-50 border-emerald-500/20', 'from-emerald-400 via-rose-300 to-amber-100'],
			previewUrl: '/demo/rustic-blossom'
		},
		{
			name: 'Classic Elegance',
			category: 'Klasik',
			tag: 'Elegan',
			desc: 'Tipografi serif klasik berbalut ornamen simetris tradisional. Menghadirkan nuansa sakral dan formal.',
			colors: ['bg-zinc-900 border-zinc-700/30', 'from-zinc-100 via-stone-300 to-zinc-400'],
			previewUrl: '/demo/classic-elegance'
		},
		{
			name: 'Minimalist Slate',
			category: 'Minimalis',
			tag: 'Bersih',
			desc: 'Tata letak asimetris yang bersih dengan fokus penuh pada foto pasangan. Estetika kontemporer yang elegan.',
			colors: [
				'bg-neutral-950 border-neutral-800',
				'from-neutral-700 via-neutral-500 to-neutral-300'
			],
			previewUrl: '/demo/minimalist-slate'
		},
		{
			name: 'Midnight Orchid',
			category: 'Modern',
			tag: 'Eksklusif',
			desc: 'Latar belakang biru malam pekat dipadukan dengan ilustrasi bunga anggrek neon transparan yang misterius dan anggun.',
			colors: ['bg-blue-950 border-indigo-500/20', 'from-indigo-400 via-purple-300 to-pink-500'],
			previewUrl: '/demo/midnight-orchid'
		},
		{
			name: 'Sage Botanical',
			category: 'Floral',
			tag: 'Tren 2026',
			desc: 'Dominasi warna hijau sage yang menenangkan berpadu dengan sketsa dedaunan botani yang estetik dan minimalis.',
			colors: [
				'bg-emerald-950/20 border-emerald-900/30',
				'from-emerald-600 via-teal-400 to-lime-200'
			],
			previewUrl: '/demo/sage-botanical'
		}
	];

	const filteredThemes = $derived(
		activeFilter === 'Semua' ? themes : themes.filter((t) => t.category === activeFilter)
	);
</script>

<section id="tema" class="py-24 bg-background relative overflow-hidden">
	<div class="container mx-auto max-w-7xl px-4 md:px-8">
		<div class="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
			<div class="space-y-4">
				<div
					class="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
				>
					<Palette class="mr-2 h-4 w-4" />
					<span>Koleksi Desain</span>
				</div>
				<h2 class="text-3xl font-bold tracking-tight sm:text-4xl">Pilih Tema Terbaik Anda</h2>
				<p class="max-w-xl text-muted-foreground">
					Tersedia puluhan tema premium yang dirancang oleh desainer profesional, siap disesuaikan
					dengan konsep acara Anda.
				</p>
			</div>

			<!-- Filters -->
			<div class="flex flex-wrap gap-2">
				{#each filters as filter}
					<button
						type="button"
						class="px-4 py-2 text-xs md:text-sm font-medium rounded-full border transition-all duration-200 focus:outline-none {activeFilter ===
						filter
							? 'bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/10'
							: 'bg-muted/40 border-border/50 text-muted-foreground hover:bg-muted/80'}"
						onclick={() => (activeFilter = filter)}
					>
						{filter}
					</button>
				{/each}
			</div>
		</div>

		<!-- Grid -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			{#each filteredThemes as theme}
				<div
					class="flex flex-col group rounded-3xl border border-border/50 bg-muted/10 overflow-hidden hover:border-primary/20 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
				>
					<!-- Visual Card Thumbnail representation -->
					<div
						class="h-56 relative overflow-hidden flex items-center justify-center p-6 border-b border-border/40 {theme
							.colors[0]}"
					>
						<!-- Decorative background gradient inside card -->
						<div
							class="absolute inset-0 bg-gradient-to-tr opacity-10 group-hover:opacity-20 transition-opacity duration-300 {theme
								.colors[1]}"
						></div>

						<!-- Styled invitation card mockup -->
						<div
							class="relative w-full max-w-[190px] aspect-[4/6] rounded-xl border border-border/40 bg-background/80 backdrop-blur-md p-4 shadow-xl flex flex-col justify-between group-hover:scale-105 transition-transform duration-300"
						>
							<div
								class="border border-primary/20 rounded-lg p-2 text-center flex-grow flex flex-col justify-center gap-1"
							>
								<span class="text-[8px] tracking-[0.2em] text-muted-foreground uppercase"
									>THE WEDDING OF</span
								>
								<span
									class="font-serif text-sm bg-gradient-to-r {theme
										.colors[1]} bg-clip-text text-transparent">Joni & Siti</span
								>
								<div class="h-0.5 w-8 bg-primary/20 mx-auto my-1"></div>
								<span class="text-[7px] text-muted-foreground/80">17 . 08 . 2026</span>
							</div>
							<div
								class="text-[6px] text-center text-muted-foreground/60 border-t border-border/30 pt-1.5 mt-2"
							>
								Buka Undangan
							</div>
						</div>

						<!-- Tag -->
						<span
							class="absolute top-4 left-4 text-[10px] font-semibold tracking-wider uppercase bg-background/80 backdrop-blur px-2.5 py-1 rounded-full border border-border/40 shadow-sm text-foreground"
						>
							{theme.tag}
						</span>
					</div>

					<!-- Content -->
					<div class="p-6 flex-grow flex flex-col justify-between">
						<div class="space-y-2">
							<div class="flex items-center justify-between">
								<h3 class="font-bold text-lg text-foreground">{theme.name}</h3>
								<span class="text-xs text-muted-foreground/80 bg-muted px-2 py-0.5 rounded-md"
									>{theme.category}</span
								>
							</div>
							<p class="text-sm text-muted-foreground leading-relaxed">{theme.desc}</p>
						</div>

						<div class="flex items-center gap-3 mt-6">
							<Button
								variant="outline"
								size="sm"
								class="flex-1 h-9 gap-1.5 text-xs rounded-xl"
								href={theme.previewUrl}
							>
								<Eye class="h-3.5 w-3.5" />
								Pratinjau
							</Button>
							<Button
								size="sm"
								class="flex-grow h-9 text-xs rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
								href="/buat-akun"
							>
								Gunakan Tema
							</Button>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>
