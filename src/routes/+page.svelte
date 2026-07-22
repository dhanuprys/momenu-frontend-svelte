<script lang="ts">
	import Header from '$lib/components/landing/header.svelte';
	import Hero from '$lib/components/landing/hero.svelte';
	import Partners from '$lib/components/landing/partners.svelte';
	import Features from '$lib/components/landing/features.svelte';
	import ThemesShowcase from '$lib/components/landing/themes-showcase.svelte';
	import HowItWorks from '$lib/components/landing/how-it-works.svelte';
	import Pricing from '$lib/components/landing/pricing.svelte';
	import FAQ from '$lib/components/landing/faq.svelte';
	import Footer from '$lib/components/landing/footer.svelte';
</script>

<svelte:head>
	<title>Momenu | Platform Undangan Digital Premium</title>
	<meta
		name="description"
		content="Bagikan momen bahagia Anda dengan cara yang lebih elegan. Buat undangan digital premium untuk pernikahan, ulang tahun, dan acara spesial Anda."
	/>
</svelte:head>

<div class="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20">
	<Header />
	<main>
		<Hero />
		<Partners />
		<Features />
		<ThemesShowcase />
		<HowItWorks />
		<Pricing />
		<FAQ />
	</main>
	<Footer />
</div>
