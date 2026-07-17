<script lang="ts">
	import { getPernikahanContext } from '$lib/theme-engine/context.js';
	import { createMediaHelper } from '$lib/theme-engine/helpers/media.js';
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

		<div class="relative z-10 w-full h-full flex flex-col items-center justify-between py-16 md:py-24 px-6 text-center text-white">
			<!-- Top / Middle -->
			<div class="flex-1 flex flex-col items-center justify-center mt-12 md:mt-20">
				<p class="uppercase tracking-[0.3em] text-xs md:text-sm mb-6 text-stone-200 font-light drop-shadow-md">
					Undangan Pawiwahan
				</p>
				<h4 class="font-script text-6xl md:text-8xl text-white drop-shadow-xl leading-tight">
					{payload.nama_panggilan_pria || payload.nama_mempelai_pria} <br class="md:hidden" />
					<span class="text-3xl md:text-5xl text-yellow-400 mx-2">&</span> <br class="md:hidden" />
					{payload.nama_panggilan_wanita || payload.nama_mempelai_wanita}
				</h4>
			</div>

			<!-- Bottom -->
			<div class="flex flex-col items-center justify-end w-full max-w-sm mx-auto">
				<p class="text-xs md:text-sm text-stone-200 mb-2 font-light tracking-widest">
					Kepada Yth. Bapak/Ibu/Saudara/i
				</p>
				<h2 class="text-3xl md:text-4xl font-serif italic mb-10 text-white drop-shadow-md border-b border-white/30 pb-3 px-6">
					{guestName || 'Tamu Undangan'}
				</h2>

				<button
					onclick={handleOpen}
					class="w-full px-8 py-4 border border-white/60 bg-black/20 hover:bg-white hover:text-stone-900 text-white font-medium rounded-full transition-all duration-500 uppercase tracking-[0.2em] text-xs shadow-xl backdrop-blur-md"
				>
					Buka Undangan
				</button>
			</div>
		</div>
	</div>
{/if}
