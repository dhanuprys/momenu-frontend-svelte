<script lang="ts">
	import { getPernikahanContext } from '$lib/contexts/invitation-context.js';
	import { createMediaHelper } from '$lib/utils/theme-media.js';
	import { getMediaUrl } from '$lib/utils.js';
	import { MANIFEST } from './manifest.js';
	import { fly } from 'svelte/transition';

	const { payload, guestName, coverState, mediaMappings } = getPernikahanContext();
	const media = createMediaHelper(MANIFEST.buckets, mediaMappings);
	const heroPhoto = media.getFirstUrl('hero_photo');

	let isOpened = $derived(coverState.isOpened());

	function handleOpen() {
		coverState.open();
	}
</script>

{#if !isOpened}
	<div
		out:fly={{ y: '-100%', duration: 1000 }}
		class="fixed inset-0 z-50 flex items-center justify-center bg-stone-900"
	>
		{#if heroPhoto}
			<div class="absolute inset-0 z-0 opacity-40">
				<img src={getMediaUrl(heroPhoto)} alt="Cover" class="w-full h-full object-cover" />
			</div>
		{/if}
		<div
			class="absolute inset-0 bg-linear-to-t from-stone-900 via-stone-900/40 to-transparent"
		></div>

		<div
			class="relative z-10 text-center text-white p-6 max-w-lg w-full bg-stone-900/60 backdrop-blur-sm rounded-3xl border border-white/10 shadow-2xl py-12"
		>
			<h4 class="font-script text-4xl mb-2 text-yellow-400">
				{payload.nama_mempelai_pria} & {payload.nama_mempelai_wanita}
			</h4>
			<p class="uppercase tracking-widest text-sm mb-6 text-stone-300">Undangan Pawiwahan</p>

			<p class="text-sm text-stone-300 mb-1">Kepada Yth.</p>
			<p class="text-sm text-stone-300 mb-4">Bapak/Ibu/Saudara/i</p>

			<h2
				class="text-2xl font-bold mb-8 font-serif italic text-white bg-white/10 py-3 px-6 rounded-lg inline-block border border-white/10"
			>
				{guestName || 'Tamu Undangan'}
			</h2>

			<button
				onclick={handleOpen}
				class="w-full sm:w-auto px-8 py-4 bg-yellow-400 hover:bg-yellow-500 text-stone-900 font-bold rounded-full transition-colors uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(250,204,21,0.3)]"
			>
				Buka Undangan
			</button>
		</div>
	</div>
{/if}
