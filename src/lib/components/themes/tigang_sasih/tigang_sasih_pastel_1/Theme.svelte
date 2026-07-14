<script lang="ts">
	import { getTigangSasihContext } from '$lib/contexts/invitation-context.js';
	import { createMediaHelper } from '$lib/utils/theme-media.js';
	import { getMediaUrl } from '$lib/utils.js';
	import { MANIFEST } from './manifest.js';
	import { onMount } from 'svelte';
	import { slide, fade } from 'svelte/transition';
	import type { Guestbook } from '$lib/types/index.js';
	import { Loader2 } from '@lucide/svelte';

	import GenericCover from '$lib/components/invitation/generic-cover.svelte';

	const invitationData = getTigangSasihContext();
	const {
		guestName,
		guestRecord,
		payload,
		featureToggle,
		schedules,
		giftRegistries,
		mediaMappings,
		countdown,
		invitationApi,
		initialGuestbook
	} = invitationData;

	const media = createMediaHelper(MANIFEST.buckets, mediaMappings);
	const coverImage = media.getFirstUrl('cover_photo');
	const babyImages = media.getAll('baby_gallery');

	let rsvpName = $state(guestName || '');
	let rsvpAttending = $state(true);
	let rsvpGuestCount = $state(1);
	let rsvpLoading = $state(false);
	let rsvpError = $state('');
	let rsvpSubmitted = $state(!!guestRecord?.is_responded);

	async function handleRSVP(e: Event) {
		e.preventDefault();
		rsvpLoading = true;
		rsvpError = '';
		try {
			await invitationApi.submitRSVP({
				name: rsvpName,
				attending: rsvpAttending,
				guest_count: rsvpAttending ? rsvpGuestCount : 0
			});
			rsvpSubmitted = true;
		} catch {
			rsvpError = 'Gagal mengirim RSVP.';
		} finally {
			rsvpLoading = false;
		}
	}

	let gbEntries = $state<Guestbook[]>([]);
	let gbName = $state('');
	let gbMessage = $state('');
	let gbSubmitting = $state(false);
	let gbSubmitError = $state('');
	let gbLoading = $state(true);

	onMount(async () => {
		if (featureToggle.show_wishes) {
			if (initialGuestbook) {
				gbEntries = initialGuestbook.data;
				gbLoading = false;
			} else {
				try {
					const res = await invitationApi.getGuestbook();
					gbEntries = res.data;
				} catch {
					/* ignore */
				} finally {
					gbLoading = false;
				}
			}
		} else {
			gbLoading = false;
		}
	});

	async function handleGuestbook(e: Event) {
		e.preventDefault();
		gbSubmitting = true;
		gbSubmitError = '';
		try {
			const entry = await invitationApi.submitGuestbook({ name: gbName, message: gbMessage });
			gbEntries = [entry, ...gbEntries];
			gbName = '';
			gbMessage = '';
		} catch {
			gbSubmitError = 'Gagal mengirim ucapan.';
		} finally {
			gbSubmitting = false;
		}
	}
</script>

<GenericCover {invitationData} />

<div class="min-h-screen bg-pink-50 font-sans text-gray-800">
	<!-- Cover -->
	<section
		class="relative min-h-screen flex flex-col items-center justify-center text-center p-6 overflow-hidden"
	>
		{#if coverImage}
			<div class="absolute inset-0 z-0">
				<img
					src={getMediaUrl(coverImage)}
					alt="Cover"
					class="w-full h-full object-cover opacity-25"
				/>
			</div>
		{/if}
		<div class="relative z-10 space-y-6">
			{#if guestName}
				<p class="text-sm tracking-[0.2em] uppercase text-pink-400">Kepada</p>
				<p class="text-2xl italic text-pink-600">{guestName}</p>
			{/if}
			<p class="text-sm tracking-[0.3em] uppercase text-pink-400">Upacara Tigang Sasih</p>
			<h1 class="text-5xl md:text-7xl font-bold text-pink-700">{payload.nama_bayi || 'Bayi'}</h1>
			<div class="bg-white/70 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-sm inline-block">
				<p class="text-pink-600">Putra/Putri dari</p>
				<p class="font-bold text-lg">{payload.nama_ayah || '-'} & {payload.nama_ibu || '-'}</p>
			</div>
		</div>
	</section>

	<!-- Schedule -->
	{#if schedules.length > 0}
		<section class="py-20 px-6 max-w-4xl mx-auto text-center space-y-12">
			<h2 class="text-3xl font-bold text-pink-700">Jadwal Upacara</h2>
			<div
				class="grid {schedules.length === 1
					? 'grid-cols-1 max-w-lg mx-auto'
					: 'md:grid-cols-2'} gap-8"
			>
				{#each schedules as schedule}
					<div class="bg-white p-8 rounded-2xl shadow-sm border border-pink-100">
						<h3 class="text-xl font-bold mb-4">{schedule.title}</h3>
						<p class="text-gray-600 mb-2">
							{new Date(schedule.start_time).toLocaleString('id-ID', {
								dateStyle: 'full',
								timeStyle: 'short'
							})}
						</p>
						<p class="text-gray-600 mb-4">{schedule.location}</p>
						{#if schedule.map_url}
							<a
								href={schedule.map_url}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-block px-6 py-2 bg-pink-600 text-white rounded-full text-sm hover:bg-pink-500 transition-colors"
								>Lihat Peta</a
							>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Gallery -->
	{#if featureToggle.show_gallery && babyImages.length > 0}
		<section class="py-20 bg-white">
			<div class="max-w-6xl mx-auto px-6 space-y-12">
				<h2 class="text-3xl font-bold text-center text-pink-700">Galeri</h2>
				<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
					{#each babyImages as image}
						<div class="aspect-square overflow-hidden rounded-xl">
							<img
								src={getMediaUrl(image.url)}
								alt="Gallery"
								class="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
							/>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Gifts -->
	{#if featureToggle.show_gifts && giftRegistries.length > 0}
		<section class="py-20 px-6 max-w-3xl mx-auto text-center space-y-12">
			<h2 class="text-3xl font-bold text-pink-700">Tanda Kasih</h2>
			<div
				class="grid {giftRegistries.length === 1
					? 'grid-cols-1 max-w-md mx-auto'
					: 'sm:grid-cols-2'} gap-6"
			>
				{#each giftRegistries as gift}
					<div class="bg-white p-6 rounded-2xl shadow-sm border border-pink-100">
						<h3 class="font-bold text-lg mb-2">{gift.provider_name}</h3>
						{#if gift.type === 'physical'}
							<p class="text-gray-600">{gift.mailing_address}</p>
						{:else if gift.qr_code_image}
							<div
								class="max-w-[200px] mx-auto mt-4 aspect-square rounded-xl overflow-hidden border"
							>
								<img
									src={getMediaUrl(gift.qr_code_image)}
									alt="QR"
									class="w-full h-full object-cover"
								/>
							</div>
						{:else}
							<p class="text-2xl tracking-widest font-mono my-2">{gift.account_number}</p>
							<p class="text-gray-600 uppercase text-sm">{gift.account_name}</p>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- RSVP -->
	{#if featureToggle.show_rsvp}
		<section class="py-20 px-6 max-w-xl mx-auto text-center space-y-8">
			<h2 class="text-3xl font-bold text-pink-700">Konfirmasi Kehadiran</h2>
			{#if rsvpSubmitted}
				<div class="bg-white p-8 rounded-3xl shadow-sm border border-pink-100 text-center">
					<p class="text-xl font-bold text-pink-700 mb-2">Terima Kasih!</p>
					<p class="text-gray-600">Respon Anda telah kami terima.</p>
				</div>
			{:else}
				<form
					onsubmit={handleRSVP}
					class="bg-white p-8 rounded-3xl shadow-sm border border-pink-100 space-y-6 text-left"
				>
					{#if rsvpError}<p transition:slide class="text-red-500 text-sm">{rsvpError}</p>{/if}
					<div class="space-y-2">
						<label for="rsvpName" class="block text-sm font-medium">Nama</label>
						<input
							id="rsvpName"
							type="text"
							bind:value={rsvpName}
							disabled={rsvpLoading}
							class="w-full px-4 py-3 bg-pink-50 border border-pink-200 rounded-xl focus:border-pink-400 focus:outline-none"
						/>
					</div>
					<fieldset class="space-y-3">
						<legend class="block text-sm font-medium">Kehadiran</legend>
						<div class="grid grid-cols-2 gap-3">
							<label
								class="flex items-center justify-center p-4 border border-pink-200 rounded-xl cursor-pointer transition-colors {rsvpAttending
									? 'bg-pink-600 text-white'
									: 'hover:bg-pink-50'}"
							>
								<input type="radio" bind:group={rsvpAttending} value={true} class="sr-only" /><span
									class="text-sm font-medium">Hadir</span
								>
							</label>
							<label
								class="flex items-center justify-center p-4 border border-pink-200 rounded-xl cursor-pointer transition-colors {!rsvpAttending
									? 'bg-pink-600 text-white'
									: 'hover:bg-pink-50'}"
							>
								<input type="radio" bind:group={rsvpAttending} value={false} class="sr-only" /><span
									class="text-sm font-medium">Tidak</span
								>
							</label>
						</div>
					</fieldset>
					{#if rsvpAttending}
						<div transition:slide class="space-y-2">
							<label for="rsvpGC" class="block text-sm font-medium">Jumlah Tamu</label>
							<select
								id="rsvpGC"
								bind:value={rsvpGuestCount}
								class="w-full px-4 py-3 bg-pink-50 border border-pink-200 rounded-xl focus:outline-none appearance-none"
							>
								{#each [1, 2, 3, 4, 5] as n}<option value={n}>{n}</option>{/each}
							</select>
						</div>
					{/if}
					<button
						type="submit"
						disabled={rsvpLoading}
						class="w-full py-4 bg-pink-600 text-white rounded-xl text-sm font-medium hover:bg-pink-500 transition-colors flex justify-center items-center gap-2"
					>
						{#if rsvpLoading}<Loader2 class="w-4 h-4 animate-spin" />{/if}Kirim
					</button>
				</form>
			{/if}
		</section>
	{/if}

	<!-- Guestbook -->
	{#if featureToggle.show_wishes}
		<section class="py-20 px-6 max-w-4xl mx-auto space-y-12">
			<h2 class="text-3xl font-bold text-center text-pink-700">Ucapan & Doa</h2>
			<div class="grid md:grid-cols-2 gap-8">
				<form onsubmit={handleGuestbook} class="space-y-4">
					{#if gbSubmitError}<p transition:slide class="text-red-500 text-sm">
							{gbSubmitError}
						</p>{/if}
					<input
						type="text"
						bind:value={gbName}
						disabled={gbSubmitting}
						placeholder="Nama"
						class="w-full px-4 py-3 bg-white border border-pink-200 rounded-xl focus:border-pink-400 focus:outline-none"
					/>
					<textarea
						bind:value={gbMessage}
						rows="4"
						disabled={gbSubmitting}
						placeholder="Ucapan..."
						class="w-full px-4 py-3 bg-white border border-pink-200 rounded-xl focus:outline-none resize-none"
					></textarea>
					<button
						type="submit"
						disabled={gbSubmitting}
						class="px-8 py-3 bg-pink-600 text-white rounded-full text-sm font-medium hover:bg-pink-500 transition-colors flex items-center gap-2"
					>
						{#if gbSubmitting}<Loader2 class="w-4 h-4 animate-spin" />{/if}Kirim
					</button>
				</form>
				<div class="space-y-6 max-h-[500px] overflow-y-auto">
					{#if gbLoading}
						<div class="flex justify-center">
							<Loader2 class="w-6 h-6 animate-spin text-pink-400" />
						</div>
					{:else if gbEntries.length > 0}
						{#each gbEntries as entry (entry.id)}
							<div in:fade class="bg-white p-6 rounded-3xl border border-pink-100">
								<p class="font-bold text-pink-700">{entry.name}</p>
								<p class="text-gray-600 mt-2 text-sm">{entry.message}</p>
							</div>
						{/each}
					{:else}
						<p class="text-gray-500 text-center">Belum ada ucapan.</p>
					{/if}
				</div>
			</div>
		</section>
	{/if}

	<footer class="py-12 text-center text-gray-500 text-sm border-t border-pink-100">
		<p>Powered by <span class="font-bold text-pink-600">MOMENU</span></p>
	</footer>
</div>
