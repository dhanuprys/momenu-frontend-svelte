<script lang="ts">
	import { page } from '$app/stores';
	import InvitationProvider from '$lib/theme-engine/components/invitation-provider.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let slug = $derived($page.params.slug!);
</script>

<svelte:head>
	{#if data.ogMetadata}
		<title>{data.ogMetadata.title}</title>
		<meta property="og:title" content={data.ogMetadata.title} />
		<meta property="og:description" content={data.ogMetadata.description} />
		<meta name="description" content={data.ogMetadata.description} />
		{#if data.ogMetadata.image}
			<meta property="og:image" content={data.ogMetadata.image} />
			<meta property="twitter:image" content={data.ogMetadata.image} />
		{/if}
		<meta property="twitter:card" content="summary_large_image" />
		<meta property="twitter:title" content={data.ogMetadata.title} />
		<meta property="twitter:description" content={data.ogMetadata.description} />
	{/if}
</svelte:head>

<InvitationProvider {slug} />
