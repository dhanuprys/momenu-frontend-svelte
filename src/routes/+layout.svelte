<script lang="ts">
	import './layout.css';
	import { onMount } from 'svelte';
	import { authState } from '$lib/stores/auth.svelte.js';
	import Sonner from '$lib/components/ui/sonner/sonner.svelte';

	let { children } = $props();

	onMount(() => {
		authState.loadFromStorage();
	});
</script>

<svelte:head>
	<link rel="icon" type="image/png" href="/logo.png" />
	<meta name="theme-color" content="#09090b" />
</svelte:head>
<Sonner />
{@render children()}
