<script lang="ts">
	import AppLogo from '$lib/components/brand/app-logo.svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ArrowRight } from '@lucide/svelte';
	import { fade, fly } from 'svelte/transition';
	import { onMount } from 'svelte';

	let mounted = $state(false);

	const particles = Array.from({ length: 40 }).map((_, i) => {
		const angle = Math.random() * Math.PI * 2;
		const distance = 50 + Math.random() * 50;
		return {
			id: i,
			x: Math.cos(angle) * distance,
			y: Math.sin(angle) * distance,
			delay: Math.random() * 4,
			duration: 2 + Math.random() * 4,
			scale: 0.3 + Math.random() * 1.2
		};
	});

	onMount(() => {
		mounted = true;
	});
</script>

<svelte:head>
	<title>Momenu | Segera Hadir</title>
</svelte:head>

<div class="relative min-h-screen overflow-hidden bg-background text-foreground flex flex-col justify-between selection:bg-primary/20">
	<!-- Animated Particles Background -->
	<div class="absolute inset-0 pointer-events-none flex items-center justify-center">
		{#if mounted}
			{#each particles as p}
				<div 
					class="particle absolute w-1.5 h-1.5 bg-foreground/20 rounded-full"
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
						Momenu membantu Anda membuat dan membagikan momen spesial dengan mudah. 
						Sistem kami kini terbuka untuk pengguna akses awal (early tester).
					</p>
				</div>

				<div 
					in:fly={{ y: 15, duration: 800, delay: 500 }}
					class="pt-4 flex justify-center"
				>
					<Button 
						size="lg"
						class="text-lg h-14 rounded-full"
						href="/register"
					>
						Mulai Sekarang <ArrowRight class="ml-2 w-4 h-4" />
					</Button>
				</div>
			</div>
		{/if}
	</main>

	<!-- Footer -->
	<footer class="p-8 md:px-16 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
		{#if mounted}
			<p in:fade={{ duration: 600, delay: 600 }}>
				&copy; {new Date().getFullYear()} Momenu.
			</p>
			<div in:fade={{ duration: 600, delay: 700 }} class="flex gap-6">
				<a href="https://instagram.com/momenu.id" target="_blank" class="hover:text-foreground transition-colors">Instagram</a>
			</div>
		{/if}
	</footer>
</div>

<style>
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
