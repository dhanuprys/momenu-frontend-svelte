<script lang="ts">
	import AppLogo from '$lib/components/brand/app-logo.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ArrowRight } from '@lucide/svelte';
	import { fade, fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import SEO from '$lib/components/seo.svelte';

	let mounted = $state(false);

	const partners = [
		'4k-galerie.webp',
		'jepret-by-liam.webp',
		'kusuma-photographybali.webp',
		'oncam-bali.webp',
		'pradnya-visual.webp',
		'shutter-stories-id.webp',
		'thorughdamarlens.webp',
		'tomotovisual.webp'
	];

	// Shifts the starting logo for each row so all partners are visible immediately
	function getRowPartners(rowIndex: number) {
		const shift = (rowIndex * 2) % partners.length;
		return [...partners.slice(shift), ...partners.slice(0, shift)];
	}

	const particles = Array.from({ length: 60 }).map((_, i) => {
		const angle = Math.random() * Math.PI * 2;
		const distance = 60 + Math.random() * 80;
		return {
			id: i,
			x: Math.cos(angle) * distance,
			y: Math.sin(angle) * distance,
			delay: Math.random() * 4,
			duration: 2 + Math.random() * 4,
			scale: 0.5 + Math.random() * 1.5
		};
	});

	let introPhase = $state(0);

	onMount(() => {
		mounted = true;

		// Timeline for intro animations (snappier timeline for fluid feeling)
		setTimeout(() => {
			introPhase = 1; // Marquee slows down, fades to background watermark
		}, 800);

		setTimeout(() => {
			introPhase = 2; // Aurora Glow Orbs fade in
		}, 1200);

		setTimeout(() => {
			introPhase = 3; // Navigation (header) fades in
		}, 1500);

		setTimeout(() => {
			introPhase = 4; // Main content fly-ins
		}, 1800);

		setTimeout(() => {
			introPhase = 5; // Particles fade in
		}, 2100);

		setTimeout(() => {
			introPhase = 6; // Footer fades in
		}, 2400);
	});
</script>

<SEO
	title="Momenu | Platform Undangan Digital Premium"
	description="Buat dan bagikan undangan digital elegan untuk pernikahan, upacara adat, ulang tahun, dan acara spesial lainnya. Desain modern, cepat, dan mudah digunakan."
	keywords="undangan digital, buat undangan online, undangan pernikahan digital, undangan digital bali, platform undangan, momenu, undangan pawiwahan"
	jsonLd={{
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'Momenu',
		url: 'https://momenu.id',
		description: 'Platform Undangan Digital Premium'
	}}
/>

<div
	class="relative min-h-screen overflow-hidden bg-background text-foreground flex flex-col justify-between selection:bg-primary/20"
>
	<!-- Animated Particles & Aurora Glow Background -->
	<div class="absolute inset-0 pointer-events-none overflow-hidden z-0">
		<!-- Tilted Logo Wall Background (Slow / Watermark) -->
		<div
			class="absolute inset-0 flex flex-col justify-center gap-12 md:gap-16 rotate-[-8deg] scale-125 origin-center select-none z-0 transition-opacity duration-1000 ease-in-out {introPhase ===
			0
				? 'opacity-0'
				: 'opacity-[0.07] dark:opacity-[0.03]'}"
		>
			{#each Array(4) as _, rowIndex}
				<div class="flex overflow-hidden w-full">
					<div
						class="flex shrink-0 items-center gap-16 md:gap-24 px-8 {rowIndex % 2 === 0
							? 'animate-marquee'
							: 'animate-marquee-reverse'}"
					>
						{#each Array(3) as _}
							{#each getRowPartners(rowIndex) as partner}
								<div
									class="flex items-center justify-center grayscale contrast-200 mix-blend-multiply dark:invert dark:mix-blend-screen"
								>
									<img
										src={`/assets/partners/${partner}`}
										alt=""
										class="h-24 md:h-28 w-auto object-contain"
										loading="lazy"
									/>
								</div>
							{/each}
						{/each}
					</div>
				</div>
			{/each}
		</div>

		<!-- Tilted Logo Wall Background (Fast / Colorful Intro) -->
		<div
			class="absolute inset-0 flex flex-col justify-center gap-12 md:gap-16 rotate-[-8deg] scale-125 origin-center select-none z-0 transition-opacity duration-1000 ease-in-out {introPhase ===
			0
				? 'opacity-85 dark:opacity-75'
				: 'opacity-0'}"
		>
			{#each Array(4) as _, rowIndex}
				<div class="flex overflow-hidden w-full">
					<div
						class="flex shrink-0 items-center gap-16 md:gap-24 px-8 {rowIndex % 2 === 0
							? 'animate-marquee-fast'
							: 'animate-marquee-fast-reverse'}"
					>
						{#each Array(3) as _}
							{#each getRowPartners(rowIndex) as partner}
								<div
									class="flex items-center justify-center grayscale contrast-200 mix-blend-multiply dark:invert dark:mix-blend-screen"
								>
									<img
										src={`/assets/partners/${partner}`}
										alt=""
										class="h-24 md:h-28 w-auto object-contain"
										loading="lazy"
									/>
								</div>
							{/each}
						{/each}
					</div>
				</div>
			{/each}
		</div>

		<!-- Aurora Glow Orbs -->
		<div
			class="absolute top-[20%] left-[20%] w-[350px] h-[350px] md:w-[450px] md:h-[450px] bg-primary/10 rounded-full blur-[100px] md:blur-[130px] aurora-glow-1 z-10 transition-opacity duration-1000 {introPhase >=
			2
				? 'opacity-100'
				: 'opacity-0'}"
		></div>
		<div
			class="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-primary/5 rounded-full blur-[90px] md:blur-[120px] aurora-glow-2 z-10 transition-opacity duration-1000 {introPhase >=
			2
				? 'opacity-100'
				: 'opacity-0'}"
		></div>

		<div
			class="absolute inset-0 flex items-center justify-center z-20 transition-opacity duration-1000 {introPhase >=
			5
				? 'opacity-100'
				: 'opacity-0'}"
		>
			{#if mounted}
				{#each particles as p}
					<div
						class="particle absolute w-2 h-2 bg-primary/40 rounded-full {p.id % 2 === 0
							? 'hidden md:block'
							: ''}"
						style="
							--px: {p.x}vw; 
							--py: {p.y}vh; 
							--ps: {p.scale};
							animation-duration: {p.duration}s;
							animation-delay: {p.delay}s;
						"
					></div>
				{/each}
			{/if}
		</div>
	</div>

	<!-- Navigation -->
	<nav class="p-8 md:px-16 flex justify-between items-center relative z-10">
		{#if mounted && introPhase >= 3}
			<div in:fade={{ duration: 600, delay: 100 }}>
				<AppLogo textClass="text-xl tracking-tight" />
			</div>

			<div in:fade={{ duration: 600, delay: 200 }}>
				<Button variant="ghost" class="font-normal" href="/login">
					Masuk <ArrowRight class="ml-2 w-4 h-4" />
				</Button>
			</div>
		{/if}
	</nav>

	<!-- Main Content -->
	<main class="flex-1 flex flex-col items-center justify-center p-8 text-center relative">
		<!-- Soft borderless white spotlight behind text for readability -->
		{#if mounted && introPhase >= 4}
			<div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] md:w-[700px] h-[50vh] bg-white/[0.12] dark:bg-white/[0.05] rounded-full blur-[100px] pointer-events-none z-0"></div>
		{/if}

		<!-- Content wrapper with relative z-10 to stay above background elements -->
		{#if mounted && introPhase >= 4}
			<div class="max-w-2xl w-full mx-auto space-y-12 relative z-10">
				<div class="space-y-6">
					<h1
						in:fly={{ y: 15, duration: 800, delay: 100 }}
						class="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-balance leading-tight"
					>
						Sesuatu yang luar biasa segera hadir.
					</h1>

					<p
						in:fly={{ y: 15, duration: 800, delay: 200 }}
						class="text-lg text-muted-foreground text-balance"
					>
						Momenu membantu Anda membuat dan membagikan momen spesial dengan mudah. Sistem kami kini
						terbuka untuk pengguna akses awal (early tester).
					</p>
				</div>

				<div in:fly={{ y: 15, duration: 800, delay: 300 }} class="pt-4 flex justify-center">
					<Button size="lg" class="text-lg h-14 rounded-full" href="/register">
						Mulai Sekarang <ArrowRight class="ml-2 w-4 h-4" />
					</Button>
				</div>
			</div>
		{/if}
	</main>

	<!-- Footer -->
	<footer
		class="p-8 md:px-16 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground relative z-10"
	>
		{#if mounted && introPhase >= 6}
			<p in:fade={{ duration: 600, delay: 100 }}>
				&copy; {new Date().getFullYear()} Momenu.
			</p>
			<div in:fade={{ duration: 600, delay: 200 }} class="flex gap-6">
				<a
					href="https://instagram.com/momenu.id"
					target="_blank"
					class="hover:text-foreground transition-colors">Instagram</a
				>
			</div>
		{/if}
	</footer>
</div>

<style>
	.animate-marquee {
		animation: marquee 45s linear infinite;
	}

	.animate-marquee-reverse {
		animation: marquee-reverse 45s linear infinite;
	}

	.animate-marquee-fast {
		animation: marquee 12s linear infinite;
	}

	.animate-marquee-fast-reverse {
		animation: marquee-reverse 12s linear infinite;
	}

	@keyframes marquee {
		0% {
			transform: translateX(0);
		}
		100% {
			transform: translateX(-33.33%);
		}
	}

	@keyframes marquee-reverse {
		0% {
			transform: translateX(-33.33%);
		}
		100% {
			transform: translateX(0);
		}
	}

	.aurora-glow-1 {
		animation: float-glow-1 25s ease-in-out infinite alternate;
	}
	.aurora-glow-2 {
		animation: float-glow-2 20s ease-in-out infinite alternate;
	}

	@keyframes float-glow-1 {
		0% {
			transform: translate(-10%, -10%) scale(1);
		}
		50% {
			transform: translate(10%, 15%) scale(1.1);
		}
		100% {
			transform: translate(-5%, 10%) scale(0.95);
		}
	}
	@keyframes float-glow-2 {
		0% {
			transform: translate(10%, 10%) scale(0.95);
		}
		50% {
			transform: translate(-10%, -15%) scale(1.05);
		}
		100% {
			transform: translate(5%, -10%) scale(1);
		}
	}

	.particle {
		animation-name: particle-shoot;
		animation-iteration-count: infinite;
		animation-timing-function: linear;
		opacity: 0;
	}
	@keyframes particle-shoot {
		0% {
			transform: translate(0, 0) scale(0.1);
			opacity: 0;
		}
		20% {
			opacity: 1;
		}
		100% {
			transform: translate(var(--px), var(--py)) scale(var(--ps));
			opacity: 0;
		}
	}
</style>
