<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import SEO from '$lib/components/seo.svelte';
	let { children } = $props();
</script>

<SEO title="Momenu Dashboard" noindex={true} />

<ModeWatcher />
{@render children?.()}
