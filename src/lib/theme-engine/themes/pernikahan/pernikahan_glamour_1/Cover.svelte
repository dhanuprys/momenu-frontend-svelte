<script lang="ts">
	import { getPernikahanContext } from '$lib/theme-engine/context';
	import { createMediaHelper } from '$lib/theme-engine/helpers/media';
	import { MANIFEST, BUCKET } from './manifest';
	import { fly } from 'svelte/transition';
	import { getMediaUrl } from '$lib/utils';

	const { payload, guestName, coverState, mediaMappings, isPreview } = getPernikahanContext();
	const media = createMediaHelper(MANIFEST.buckets, mediaMappings, isPreview);

	let isOpened = $derived(coverState.isOpened());

	function handleOpen() {
		coverState.open();
	}

	const coverPhoto = media.getFirstUrl(BUCKET.cover_photo) || media.getFirstUrl(BUCKET.hero_photo);
</script>

{#if !isOpened}
	<div
		out:fly={{ y: '-100%', duration: 1000 }}
		class="fixed inset-0 z-50 flex h-dvh w-full flex-col bg-black text-white"
	>
		<div class="absolute inset-0 z-0 overflow-hidden">
			{#if coverPhoto}
				<img
					src={getMediaUrl(coverPhoto)}
					alt="Cover"
					class="absolute inset-0 h-full w-full object-cover animate-fade-in"
				/>
			{/if}
			<div class="absolute inset-0 bg-linear-to-b from-black/90 via-transparent to-black/90"></div>
		</div>

		<div class="relative z-10 flex h-full w-full flex-col justify-between px-6 py-8 text-center">
			<div class="mt-10 flex flex-col items-center">
				<p class="mb-2 text-xs font-bold tracking-widest uppercase lg:text-base">
					Undangan Pernikahan
				</p>
				<h1 class="font-title text-5xl leading-none font-normal lg:text-7xl">
					{payload.nama_panggilan_pria || payload.nama_mempelai_pria}
					<span class="mx-2">&amp;</span>
					{payload.nama_panggilan_wanita || payload.nama_mempelai_wanita}
				</h1>
			</div>

			<div class="flex w-full flex-col items-center gap-8">
				<div class="flex flex-col items-center gap-3">
					<p class="text-xs lg:text-base">Kepada Yth. Bapak/Ibu/Saudara/i</p>
					<h3 class="font-title text-2xl font-thin lg:text-3xl border-b border-white/30 pb-2 px-4">
						{guestName || 'Tamu Undangan'}
					</h3>
				</div>

				<button
					onclick={handleOpen}
					class="w-full max-w-xs px-8 py-4 bg-white/10 hover:bg-white text-white hover:text-black border border-white/50 rounded-full transition-all tracking-[0.2em] uppercase text-xs backdrop-blur-md"
				>
					Buka Undangan
				</button>
			</div>
		</div>
	</div>
{/if}

<style>
	:global(.font-title) {
		font-family: 'Great Vibes', cursive;
	}
</style>
