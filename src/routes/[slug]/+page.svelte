<script lang="ts">
	import { page } from '$app/stores';
	import InvitationProvider from '$lib/theme-engine/components/invitation-provider.svelte';
	import SEO from '$lib/components/seo.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let slug = $derived($page.params.slug!);
</script>

{#if data.ogMetadata}
	<SEO
		title={data.ogMetadata.title}
		description={data.ogMetadata.description}
		image={data.ogMetadata.image || 'https://momenu.id/og-image.jpg'}
		type="article"
		url={`https://momenu.id/${slug}`}
	/>
{/if}

<InvitationProvider {slug} />
