<script lang="ts">
	import { page } from '$app/stores';

	let {
		title = 'Momenu | Platform Undangan Digital Premium',
		description = 'Buat dan bagikan undangan digital elegan untuk pernikahan, upacara adat, ulang tahun, dan acara spesial lainnya. Desain modern, cepat, dan mudah digunakan.',
		keywords = 'undangan digital, buat undangan online, undangan pernikahan digital, undangan digital bali, platform undangan, momenu',
		image = 'https://momenu.id/og-image.jpg',
		url = '',
		type = 'website',
		siteName = 'Momenu',
		noindex = false,
		jsonLd = null
	} = $props<{
		title?: string;
		description?: string;
		keywords?: string;
		image?: string;
		url?: string;
		type?: string;
		siteName?: string;
		noindex?: boolean;
		jsonLd?: Record<string, any> | null;
	}>();

	// Construct canonical URL
	let canonicalUrl = $derived(url || `https://momenu.id${$page.url.pathname}`);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta name="keywords" content={keywords} />

	<!-- Canonical URL to prevent duplicate content issues -->
	<link rel="canonical" href={canonicalUrl} />

	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{:else}
		<meta name="robots" content="index, follow" />
	{/if}

	<!-- Open Graph / Facebook / WhatsApp -->
	<meta property="og:type" content={type} />
	<meta property="og:url" content={canonicalUrl} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={image} />
	<meta property="og:site_name" content={siteName} />

	<!-- Twitter -->
	<meta property="twitter:card" content="summary_large_image" />
	<meta property="twitter:url" content={canonicalUrl} />
	<meta property="twitter:title" content={title} />
	<meta property="twitter:description" content={description} />
	<meta property="twitter:image" content={image} />

	<!-- Structured Data (JSON-LD) -->
	{#if jsonLd && !noindex}
		{@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
	{/if}
</svelte:head>
