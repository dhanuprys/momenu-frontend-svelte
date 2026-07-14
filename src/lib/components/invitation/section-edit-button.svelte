<script lang="ts">
	import { Pencil } from '@lucide/svelte';
	import { getInvitationContext } from '$lib/contexts/invitation-context.js';

	let {
		slotKey,
		tab = 'text',
		label = 'Edit Bagian Ini',
		class: className = ''
	} = $props<{ slotKey: string; tab?: 'text' | 'style'; label?: string; class?: string }>();

	const context = getInvitationContext();
</script>

{#if context.isPreview}
	<button
		onclick={() => context.customizerController?.open(slotKey, tab)}
		class="group absolute z-40 flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold text-stone-800 bg-white/90 hover:bg-white backdrop-blur-md transition-all duration-300 shadow-[0_4px_20px_rgb(0,0,0,0.1)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.15)] border border-white/50 hover:scale-105 hover:-translate-y-0.5 cursor-pointer no-underline {className ||
			'top-4 right-4'}"
	>
		<div class="relative flex items-center justify-center">
			<div
				class="absolute inset-0 bg-indigo-400 rounded-full blur-[4px] opacity-0 group-hover:opacity-60 transition-opacity duration-500"
			></div>
			<Pencil
				class="w-3.5 h-3.5 relative z-10 text-indigo-600 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
			/>
		</div>
		<span class="tracking-wide">{label}</span>
	</button>
{/if}
