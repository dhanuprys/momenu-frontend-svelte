<script lang="ts">
	import { X } from '@lucide/svelte';

	let { src = $bindable(null) as string | null } = $props();

	function close() {
		src = null;
	}
</script>

{#if src}
	<div
		class="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 lg:p-12 animate-in fade-in duration-200"
		role="button"
		tabindex="0"
		onclick={close}
		onkeydown={(e) => e.key === 'Escape' && close()}
	>
		<div
			class="relative w-full h-full flex items-center justify-center animate-in zoom-in-95 duration-300"
		>
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
			<img
				{src}
				alt="Fullscreen Preview"
				class="max-w-full max-h-full object-contain cursor-default drop-shadow-2xl rounded-sm"
				onclick={(e) => e.stopPropagation()}
			/>
			<button
				type="button"
				class="absolute top-4 right-4 md:top-8 md:right-8 bg-white/10 hover:bg-white/20 transition-colors border-none text-white rounded-full p-2 cursor-pointer"
				onclick={close}
			>
				<X class="h-6 w-6" />
			</button>
		</div>
	</div>
{/if}
