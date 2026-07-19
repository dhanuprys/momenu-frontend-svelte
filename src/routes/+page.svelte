<script lang="ts">
	import AppLogo from '$lib/components/brand/app-logo.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ArrowRight } from '@lucide/svelte';
	import { fade, fly } from 'svelte/transition';
	import { onMount } from 'svelte';
	import SEO from '$lib/components/seo.svelte';

	let mounted = $state(false);

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

	onMount(() => {
		mounted = true;
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
	<div class="absolute inset-0 pointer-events-none overflow-hidden">
		<!-- Aurora Glow Orbs -->
		<div class="absolute top-[20%] left-[20%] w-[350px] h-[350px] md:w-[450px] md:h-[450px] bg-primary/10 rounded-full blur-[100px] md:blur-[130px] aurora-glow-1"></div>
		<div class="absolute bottom-[20%] right-[20%] w-[300px] h-[300px] md:w-[400px] md:h-[400px] bg-primary/5 rounded-full blur-[90px] md:blur-[120px] aurora-glow-2"></div>
		
		<div class="absolute inset-0 flex items-center justify-center">
			{#if mounted}
				{#each particles as p}
					<div
						class="particle absolute w-2 h-2 bg-primary/40 rounded-full"
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
	<nav class="p-8 md:px-16 flex justify-between items-center">
		{#if mounted}
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
	<main class="flex-1 flex flex-col items-center justify-center p-8 text-center">
		{#if mounted}
			<div class="max-w-2xl w-full mx-auto space-y-12">
				<div class="space-y-6">
					<h1
						in:fly={{ y: 15, duration: 800, delay: 300 }}
						class="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-balance leading-tight"
					>
						Sesuatu yang luar biasa segera hadir.
					</h1>

					<p
						in:fly={{ y: 15, duration: 800, delay: 400 }}
						class="text-lg text-muted-foreground text-balance"
					>
						Momenu membantu Anda membuat dan membagikan momen spesial dengan mudah. Sistem kami kini
						terbuka untuk pengguna akses awal (early tester).
					</p>
				</div>

				<div in:fly={{ y: 15, duration: 800, delay: 500 }} class="pt-4 flex justify-center">
					<Button size="lg" class="text-lg h-14 rounded-full" href="/register">
						Mulai Sekarang <ArrowRight class="ml-2 w-4 h-4" />
					</Button>
				</div>
			</div>
		{/if}

		{#if mounted}
			<div in:fly={{ y: 15, duration: 800, delay: 600 }} class="w-full mt-24 mb-8 overflow-hidden relative">
				<!-- Gradient fading edges for smoother look -->
				<div class="pointer-events-none absolute inset-y-0 left-0 w-1/6 bg-gradient-to-r from-background to-transparent z-10"></div>
				<div class="pointer-events-none absolute inset-y-0 right-0 w-1/6 bg-gradient-to-l from-background to-transparent z-10"></div>

				<p class="text-sm font-medium text-muted-foreground uppercase tracking-widest mb-8 text-center relative z-20">
					Dipercaya oleh Partner Fotografi
				</p>
				
				<div class="flex overflow-hidden">
					<div class="flex shrink-0 animate-marquee items-center gap-10 md:gap-16 px-5 md:px-8">
						{#each Array(2) as _}
							{#each [
								'4k-galerie.jpg',
								'jepret-by-liam.jpg',
								'kusuma-photographybali.jpg',
								'oncam-bali.jpg',
								'pradnya-visual.png',
								'shutter-stories-id.jpg',
								'thorughdamarlens.jpg',
								'tomotovisual.jpg'
							] as partner}
								<div class="group flex items-center justify-center grayscale hover:grayscale-0 opacity-60 hover:opacity-100 transition-all duration-500">
									<img 
										src={`/assets/partners/${partner}`} 
										alt="Momenu Partner" 
										class="h-14 md:h-20 w-auto object-contain rounded-md"
										loading="lazy"
									/>
								</div>
							{/each}
						{/each}
					</div>
				</div>
			</div>
		{/if}
	</main>

	<!-- Footer -->
	<footer
		class="p-8 md:px-16 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground"
	>
		{#if mounted}
			<p in:fade={{ duration: 600, delay: 600 }}>
				&copy; {new Date().getFullYear()} Momenu.
			</p>
			<div in:fade={{ duration: 600, delay: 700 }} class="flex gap-6">
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
		animation: marquee 30s linear infinite;
	}
	
	.animate-marquee:hover {
		animation-play-state: paused;
	}

	@keyframes marquee {
		0% {
			transform: translateX(0);
		}
		100% {
			/* Transform by -50% because we duplicated the array of logos exactly 2 times */
			transform: translateX(-50%);
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
