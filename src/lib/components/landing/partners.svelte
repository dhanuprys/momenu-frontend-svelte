<script lang="ts">
	const partners = [
		'oncam-bali.webp',
		'locanarta.webp',
		'4k-galerie.webp',
		'jepret-by-liam.webp',
		'kusuma-photographybali.webp',
		'pradnya-visual.webp',
		'shutter-stories-id.webp',
		'thorughdamarlens.webp',
		'tomotovisual.webp'
	];
</script>

<section class="py-16 md:py-24 bg-[#F9FAF8] border-y border-stone-200/60 overflow-hidden select-none">
	<div class="container mx-auto px-4 md:px-8 mb-10 text-center">
		<p class="text-xs uppercase tracking-[0.3em] font-semibold text-emerald-900/70">
			Dipercaya oleh Mitra Dokumentasi & Vendor Visual Terbaik
		</p>
	</div>

	<!-- Full-Width Marquee Container -->
	<div class="relative w-full flex overflow-hidden group">
		<!-- Fade Edges -->
		<div
			class="absolute left-0 top-0 w-28 md:w-64 h-full bg-gradient-to-r from-[#F9FAF8] to-transparent z-10 pointer-events-none"
		></div>
		<div
			class="absolute right-0 top-0 w-28 md:w-64 h-full bg-gradient-to-l from-[#F9FAF8] to-transparent z-10 pointer-events-none"
		></div>

		<!-- Scrolling Content with Larger Logos -->
		<div class="flex shrink-0 items-center gap-16 md:gap-28 px-6 animate-marquee">
			{#each Array(3) as _}
				{#each partners as partner}
					<div
						class="flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity duration-300 hover:scale-105"
					>
						<img
							src={`/assets/partners/${partner}`}
							alt="Mitra Momenu"
							class="h-14 md:h-20 lg:h-24 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300"
							loading="lazy"
						/>
					</div>
				{/each}
			{/each}
		</div>
	</div>
</section>

<style>
	.animate-marquee {
		animation: marquee 35s linear infinite;
	}

	.animate-marquee:hover {
		animation-play-state: paused;
	}

	@keyframes marquee {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(-33.333333%);
		}
	}
</style>
