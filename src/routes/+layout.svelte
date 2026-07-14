<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { onMount } from 'svelte';
	import { authState } from '$lib/stores/auth.svelte.js';
	import Sonner from '$lib/components/ui/sonner/sonner.svelte';

	let { children } = $props();

	onMount(() => {
		authState.loadFromStorage();
	});
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>
<Sonner />
{@render children()}
