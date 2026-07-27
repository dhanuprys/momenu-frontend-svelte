<script lang="ts">
	import type { Snippet } from 'svelte';
	
	let {
		mapUrl = '',
		buttonClass = 'inline-flex items-center justify-center px-6 py-2 bg-primary text-primary-foreground rounded-full text-sm hover:opacity-90 transition-opacity',
		iframeContainerClass = 'w-full aspect-video rounded-xl overflow-hidden shadow-sm border mt-4',
		buttonText = 'Lihat Peta',
		children
	} = $props<{
		mapUrl?: string;
		buttonClass?: string;
		iframeContainerClass?: string;
		buttonText?: string;
		children?: Snippet;
	}>();

	let embedSrc = $derived.by(() => {
		if (mapUrl && mapUrl.includes('<iframe')) {
			const match = mapUrl.match(/src="([^"]+)"/i);
			if (match && match.length > 1) {
				return match[1];
			}
		}
		return null;
	});
</script>

{#if embedSrc}
	<div class={iframeContainerClass}>
		<iframe
			src={embedSrc}
			class="w-full h-full min-h-[250px]"
			style="border:0;"
			allowfullscreen={true}
			loading="lazy"
			referrerpolicy="no-referrer-when-downgrade"
			title="Peta Lokasi"
		></iframe>
	</div>
{:else if mapUrl}
	<a href={mapUrl} target="_blank" rel="noopener noreferrer external" class={buttonClass}>
		{#if children}
			{@render children()}
		{:else}
			{buttonText}
		{/if}
	</a>
{/if}
