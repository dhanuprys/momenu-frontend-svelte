<script lang="ts">
	import { getMetatahContext } from '$lib/contexts/invitation-context.js';
	import { createMediaHelper } from '$lib/utils/theme-media.js';
	import { getMediaUrl } from '$lib/utils.js';
	import { MANIFEST } from './manifest.js';
	import { onMount } from 'svelte';
	import { slide, fade } from 'svelte/transition';
	import type { Guestbook } from '$lib/types/index.js';
	import { Loader2 } from '@lucide/svelte';

	import GenericCover from '$lib/components/invitation/generic-cover.svelte';

	const invitationData = getMetatahContext();
	const {
		guestName,
		guestRecord,
		payload,
		featureToggle,
		schedules,
		giftRegistries,
		mediaMappings,
		dressCodes,
		liveStreams,
		countdown,
		invitationApi,
		initialGuestbook
	} = invitationData;

	const media = createMediaHelper(MANIFEST.buckets, mediaMappings);
	const coverImage = media.getFirstUrl('cover_photo');
	const ceremonyImages = media.getAll('ceremony_gallery');

	// Peserta from group field
	const peserta = payload.peserta || [];

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

<div
	class="min-h-screen bg-[#FDFBF7] font-sans text-stone-800 selection:bg-amber-100 selection:text-amber-900"
>
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
				<p class="text-sm tracking-[0.2em] uppercase text-stone-500">Kepada Yth.</p>
				<p class="text-2xl italic text-stone-700">{guestName}</p>
			{/if}
			<p class="text-sm tracking-[0.3em] uppercase text-stone-500">Upacara Metatah</p>
			<h1 class="text-5xl md:text-7xl font-bold italic text-stone-700">
				{#if peserta.length === 1}
					{peserta[0]?.nama || 'Peserta'}
				{:else if peserta.length > 1}
					{peserta
						.map((p) => p.nama)
						.filter(Boolean)
						.join(' & ')}
				{:else}
					Upacara Metatah
				{/if}
			</h1>
		</div>
	</section>

	<!-- Peserta (from group field) -->
	<section class="py-20 px-6 max-w-4xl mx-auto text-center space-y-12">
		<h2 class="text-3xl font-bold text-stone-700">Peserta Metatah</h2>
		<div
			class="grid {peserta.length === 1
				? 'grid-cols-1 max-w-sm mx-auto'
				: peserta.length === 2
					? 'grid-cols-2 max-w-2xl mx-auto'
					: 'grid-cols-2 md:grid-cols-3'} gap-8"
		>
			{#each peserta as person, i}
				<div
					class="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 flex flex-col items-center"
				>
					{#if person.foto}
						<div class="w-32 h-32 rounded-full overflow-hidden mb-4 border-4 border-stone-200">
							<img
								src={getMediaUrl(person.foto)}
								alt={person.nama || `Peserta ${i + 1}`}
								class="w-full h-full object-cover"
							/>
						</div>
					{:else}
						<div
							class="w-32 h-32 rounded-full bg-stone-100 flex items-center justify-center mb-4 border-4 border-stone-200"
						>
							<span class="text-3xl text-stone-400">{(person.nama || '?')[0]?.toUpperCase()}</span>
						</div>
					{/if}
					<h3 class="text-xl font-bold">{person.nama || `Peserta ${i + 1}`}</h3>
				</div>
			{/each}
		</div>

		<!-- Parent info -->
		<div class="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 max-w-lg mx-auto">
			<p class="text-stone-600 mb-2">Putra/Putri dari</p>
			<p class="font-bold text-lg">
				Bpk. {payload.nama_ayah || '-'} & Ibu {payload.nama_ibu || '-'}
			</p>
		</div>
	</section>

	<!-- Schedule -->
	{#if schedules.length > 0}
		<section class="py-20 px-6 max-w-4xl mx-auto text-center space-y-12">
			<h2 class="text-3xl font-bold text-stone-700">Jadwal Upacara</h2>
			<div
				class="grid {schedules.length === 1
					? 'grid-cols-1 max-w-lg mx-auto'
					: 'md:grid-cols-2'} gap-8"
			>
				{#each schedules as schedule}
					<div class="bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
						<h3 class="text-xl font-bold mb-4">{schedule.title}</h3>
						<p class="text-stone-600 mb-2">
							{new Date(schedule.start_time).toLocaleString('id-ID', {
								dateStyle: 'full',
								timeStyle: 'short'
							})}
						</p>
						<p class="text-stone-600 mb-4">{schedule.location}</p>
						{#if schedule.map_url}
							<a
								href={schedule.map_url}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-block px-6 py-2 bg-stone-800 text-white rounded-full text-sm hover:bg-stone-700 transition-colors"
								>Lihat Peta</a
							>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Gallery -->
	{#if featureToggle.show_gallery && ceremonyImages.length > 0}
		<section class="py-20 bg-white">
			<div class="max-w-6xl mx-auto px-6 space-y-12">
				<h2 class="text-3xl font-bold text-center text-stone-700">Galeri Upacara</h2>
				<div class="grid grid-cols-2 md:grid-cols-3 gap-4">
					{#each ceremonyImages as image}
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

	<!-- RSVP -->
	{#if featureToggle.show_rsvp}
		<section class="py-20 px-6 max-w-xl mx-auto text-center space-y-8">
			<h2 class="text-3xl font-bold text-stone-700">Konfirmasi Kehadiran</h2>
			{#if rsvpSubmitted}
				<div class="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 text-center">
					<p class="text-xl font-bold mb-2">Terima Kasih!</p>
					<p class="text-stone-600">Respon Anda telah kami terima.</p>
				</div>
			{:else}
				<form
					onsubmit={handleRSVP}
					class="bg-white p-8 rounded-3xl shadow-sm border border-stone-100 space-y-6 text-left"
				>
					{#if rsvpError}<p transition:slide class="text-red-500 text-sm">{rsvpError}</p>{/if}
					<div class="space-y-2">
						<label for="rsvpName" class="block text-sm font-medium">Nama</label>
						<input
							id="rsvpName"
							type="text"
							bind:value={rsvpName}
							disabled={rsvpLoading}
							class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none transition-colors"
						/>
					</div>
					<fieldset class="space-y-3">
						<legend class="block text-sm font-medium">Kehadiran</legend>
						<div class="grid grid-cols-2 gap-3">
							<label
								class="flex items-center justify-center p-4 border border-stone-200 rounded-xl cursor-pointer transition-colors {rsvpAttending
									? 'bg-stone-800 text-white'
									: 'hover:bg-stone-50'}"
							>
								<input type="radio" bind:group={rsvpAttending} value={true} class="sr-only" /><span
									class="text-sm font-medium">Hadir</span
								>
							</label>
							<label
								class="flex items-center justify-center p-4 border border-stone-200 rounded-xl cursor-pointer transition-colors {!rsvpAttending
									? 'bg-stone-800 text-white'
									: 'hover:bg-stone-50'}"
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
								class="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none appearance-none"
							>
								{#each [1, 2, 3, 4, 5] as n}<option value={n}>{n}</option>{/each}
							</select>
						</div>
					{/if}
					<button
						type="submit"
						disabled={rsvpLoading}
						class="w-full py-4 bg-stone-800 text-white rounded-xl text-sm font-medium hover:bg-stone-700 transition-colors flex justify-center items-center gap-2"
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
			<h2 class="text-3xl font-bold text-center text-stone-700">Ucapan & Doa</h2>
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
						class="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:border-stone-400 focus:outline-none"
					/>
					<textarea
						bind:value={gbMessage}
						rows="4"
						disabled={gbSubmitting}
						placeholder="Ucapan..."
						class="w-full px-4 py-3 bg-white border border-stone-200 rounded-xl focus:outline-none resize-none"
					></textarea>
					<button
						type="submit"
						disabled={gbSubmitting}
						class="px-8 py-3 bg-stone-800 text-white rounded-full text-sm font-medium hover:bg-stone-700 transition-colors flex items-center gap-2"
					>
						{#if gbSubmitting}<Loader2 class="w-4 h-4 animate-spin" />{/if}Kirim
					</button>
				</form>
				<div class="space-y-6 max-h-[500px] overflow-y-auto">
					{#if gbLoading}
						<div class="flex justify-center">
							<Loader2 class="w-6 h-6 animate-spin text-stone-400" />
						</div>
					{:else if gbEntries.length > 0}
						{#each gbEntries as entry (entry.id)}
							<div in:fade class="bg-white p-6 rounded-3xl border border-stone-100">
								<p class="font-bold">{entry.name}</p>
								<p class="text-stone-600 mt-2 text-sm">{entry.message}</p>
							</div>
						{/each}
					{:else}
						<p class="text-stone-500 text-center">Belum ada ucapan.</p>
					{/if}
				</div>
			</div>
		</section>
	{/if}

	<footer class="py-12 text-center text-stone-500 text-sm border-t border-stone-200">
		<p>Powered by <span class="font-bold text-stone-800">MOMENU</span></p>
	</footer>
</div>
