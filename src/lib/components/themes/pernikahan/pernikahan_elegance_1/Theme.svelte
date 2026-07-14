<script lang="ts">
	import { getPernikahanContext } from '$lib/contexts/invitation-context.js';
	import { createMediaHelper } from '$lib/utils/theme-media.js';
	import { getMediaUrl } from '$lib/utils.js';
	import { MANIFEST } from './manifest.js';
	import { onMount } from 'svelte';
	import { slide, fade } from 'svelte/transition';
	import type { Guestbook } from '$lib/types/index.js';
	import { Loader2 } from '@lucide/svelte';

	const {
		guestName,
		guestRecord,
		slug,
		project,
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
	} = getPernikahanContext();

	const media = createMediaHelper(MANIFEST.buckets, mediaMappings);
	const coverImage = media.getFirstUrl('cover_photo');
	const galleryImages = media.getAll('gallery_grid');

	// RSVP state
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
		} catch (err) {
			rsvpError = 'Gagal mengirim RSVP. Silakan coba lagi.';
		} finally {
			rsvpLoading = false;
		}
	}

	// Guestbook state
	let gbEntries = $state<Guestbook[]>([]);
	let gbName = $state('');
	let gbMessage = $state('');
	let gbSubmitting = $state(false);
	let gbSubmitError = $state('');
	let gbLoading = $state(true);
	let gbError = $state('');

	onMount(async () => {
		if (featureToggle.show_wishes) {
			if (initialGuestbook) {
				gbEntries = initialGuestbook.data;
				gbLoading = false;
			} else {
				try {
					const res = await invitationApi.getGuestbook();
					gbEntries = res.data;
				} catch (err) {
					gbError = 'Gagal memuat ucapan.';
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
			const newEntry = await invitationApi.submitGuestbook({ name: gbName, message: gbMessage });
			gbEntries = [newEntry, ...gbEntries];
			gbName = '';
			gbMessage = '';
		} catch (err) {
			gbSubmitError = 'Gagal mengirim ucapan.';
		} finally {
			gbSubmitting = false;
		}
	}
</script>

<div class="min-h-screen bg-amber-50 font-serif text-amber-900">
	<!-- Cover -->
	<section
		class="relative min-h-screen flex flex-col items-center justify-center text-center p-6 overflow-hidden"
	>
		{#if coverImage}
			<div class="absolute inset-0 z-0">
				<img
					src={getMediaUrl(coverImage)}
					alt="Cover"
					class="w-full h-full object-cover opacity-30"
				/>
			</div>
		{/if}
		<div class="relative z-10 space-y-6">
			{#if guestName}
				<div>
					<p class="text-sm tracking-[0.2em] uppercase text-amber-600 mb-2">Kepada Yth.</p>
					<p class="text-2xl italic text-amber-800">{guestName}</p>
					{#if guestRecord?.special_message}
						<div
							class="max-w-md mx-auto mt-6 bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-amber-200/50 shadow-sm"
						>
							<p class="text-sm italic text-amber-700 leading-relaxed">
								"{guestRecord.special_message}"
							</p>
						</div>
					{/if}
				</div>
			{/if}

			<p class="text-sm tracking-[0.3em] uppercase text-amber-600">Upacara Pernikahan</p>
			<h1 class="text-5xl md:text-7xl font-bold italic text-amber-800">
				{payload.nama_mempelai_pria || 'Mempelai Pria'} &
				{payload.nama_mempelai_wanita || 'Mempelai Wanita'}
			</h1>
		</div>
	</section>

	<!-- Couple Info -->
	<section class="py-20 px-6 max-w-4xl mx-auto text-center space-y-16">
		<h2 class="text-3xl font-bold text-amber-800">Mempelai</h2>
		<div class="grid md:grid-cols-2 gap-12">
			<div class="bg-white p-8 rounded-2xl shadow-sm border border-amber-100">
				<h3 class="text-2xl font-bold mb-4">{payload.nama_mempelai_pria || '-'}</h3>
				<p class="text-amber-700">Putra dari</p>
				<p class="font-medium">
					Bpk. {payload.nama_ayah_pria || '-'} & Ibu {payload.nama_ibu_pria || '-'}
				</p>
				{#if payload.alamat_pria}
					<p class="text-sm text-amber-600 mt-2">{payload.alamat_pria}</p>
				{/if}
			</div>
			<div class="bg-white p-8 rounded-2xl shadow-sm border border-amber-100">
				<h3 class="text-2xl font-bold mb-4">{payload.nama_mempelai_wanita || '-'}</h3>
				<p class="text-amber-700">Putri dari</p>
				<p class="font-medium">
					Bpk. {payload.nama_ayah_wanita || '-'} & Ibu {payload.nama_ibu_wanita || '-'}
				</p>
				{#if payload.alamat_wanita}
					<p class="text-sm text-amber-600 mt-2">{payload.alamat_wanita}</p>
				{/if}
			</div>
		</div>
	</section>

	<!-- Schedule -->
	{#if schedules.length > 0}
		<section class="py-20 px-6 max-w-4xl mx-auto text-center space-y-12">
			<h2 class="text-3xl font-bold text-amber-800">Jadwal Acara</h2>
			<div
				class="grid {schedules.length === 1
					? 'grid-cols-1 max-w-lg mx-auto'
					: 'md:grid-cols-2'} gap-8"
			>
				{#each schedules as schedule}
					<div class="bg-white p-8 rounded-2xl shadow-sm border border-amber-100">
						<h3 class="text-xl font-bold mb-4">{schedule.title}</h3>
						<p class="text-amber-700 mb-2">
							{new Date(schedule.start_time).toLocaleString('id-ID', {
								dateStyle: 'full',
								timeStyle: 'short'
							})}
						</p>
						<p class="text-amber-700 mb-4">{schedule.location}</p>
						{#if schedule.map_url}
							<a
								href={schedule.map_url}
								target="_blank"
								rel="noopener noreferrer"
								class="inline-block px-6 py-2 bg-amber-800 text-white rounded-full text-sm hover:bg-amber-700 transition-colors"
							>
								Lihat Peta
							</a>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Gallery -->
	{#if featureToggle.show_gallery && galleryImages.length > 0}
		<section class="py-20 bg-white">
			<div class="max-w-6xl mx-auto px-6 space-y-12">
				<h2 class="text-3xl font-bold text-center text-amber-800">Galeri</h2>
				<div
					class="grid {galleryImages.length === 1
						? 'grid-cols-1 max-w-xl mx-auto'
						: galleryImages.length === 2
							? 'grid-cols-2 max-w-4xl mx-auto'
							: 'grid-cols-2 md:grid-cols-3'} gap-4"
				>
					{#each galleryImages as image}
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

	<!-- Dress Code -->
	{#if dressCodes.length > 0}
		<section class="py-20 bg-amber-50">
			<div class="max-w-4xl mx-auto px-6 text-center space-y-12">
				<h2 class="text-3xl font-bold text-amber-800">Kode Berpakaian</h2>
				<div
					class="grid {dressCodes.length === 1
						? 'grid-cols-1 max-w-md mx-auto'
						: 'md:grid-cols-2'} gap-8"
				>
					{#each dressCodes as dress}
						<div class="bg-white p-8 rounded-2xl shadow-sm border border-amber-100">
							<h3 class="text-xl font-bold mb-4">{dress.label}</h3>
							<div class="flex gap-3 justify-center">
								{#each dress.colors as color}
									<div
										class="w-10 h-10 rounded-full border border-amber-200 shadow-inner"
										style="background-color: {color};"
										title={color}
									></div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Live Stream -->
	{#if featureToggle.show_live_stream && liveStreams.length > 0}
		<section class="py-20 bg-white text-center space-y-8 px-6">
			<h2 class="text-3xl font-bold text-amber-800">Live Streaming</h2>
			<div class="flex flex-wrap justify-center gap-4">
				{#each liveStreams as stream}
					<a
						href={stream.url}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-block px-8 py-4 bg-amber-800 text-white rounded-full text-sm font-medium hover:bg-amber-700 transition-colors"
					>
						Tonton di {stream.platform}
					</a>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Gift -->
	{#if featureToggle.show_gifts && giftRegistries.length > 0}
		<section class="py-20 px-6 max-w-3xl mx-auto text-center space-y-12">
			<h2 class="text-3xl font-bold text-amber-800">Amplop Digital</h2>
			<p class="text-amber-700">
				Doa dan restu Anda merupakan hadiah terindah. Namun jika Anda ingin memberi tanda kasih,
				dapat melalui:
			</p>
			<div
				class="grid {giftRegistries.length === 1
					? 'grid-cols-1 max-w-md mx-auto'
					: 'sm:grid-cols-2'} gap-6"
			>
				{#each giftRegistries as gift}
					<div class="bg-white p-6 rounded-2xl shadow-sm border border-amber-100">
						{#if gift.type === 'physical'}
							<h3 class="font-bold text-lg mb-2">Kirim ke Alamat</h3>
							<p class="text-amber-700">{gift.mailing_address}</p>
						{:else if gift.type === 'ewallet'}
							<h3 class="font-bold text-lg mb-2">{gift.provider_name}</h3>
							{#if gift.qr_code_image}
								<div
									class="max-w-[200px] mx-auto mt-4 aspect-square rounded-xl overflow-hidden border"
								>
									<img
										src={getMediaUrl(gift.qr_code_image)}
										alt="QR Code"
										class="w-full h-full object-cover"
									/>
								</div>
							{/if}
						{:else}
							<h3 class="font-bold text-lg mb-2">{gift.provider_name}</h3>
							<p class="text-2xl tracking-widest font-mono text-amber-800 my-2">
								{gift.account_number}
							</p>
							<p class="text-amber-600 uppercase text-sm">{gift.account_name}</p>
						{/if}
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- RSVP -->
	{#if featureToggle.show_rsvp}
		<section class="py-20 px-6 max-w-xl mx-auto text-center space-y-8">
			<h2 class="text-3xl font-bold text-amber-800">Konfirmasi Kehadiran</h2>
			{#if rsvpSubmitted}
				<div class="bg-white p-8 rounded-3xl shadow-sm border border-amber-100 text-center">
					<p class="text-xl font-bold text-amber-800 mb-2">Terima Kasih!</p>
					<p class="text-amber-600">Respon Anda telah kami terima.</p>
				</div>
			{:else}
				<form
					onsubmit={handleRSVP}
					class="bg-white p-8 rounded-3xl shadow-sm border border-amber-100 space-y-6 text-left"
				>
					{#if rsvpError}
						<p transition:slide class="text-red-500 text-sm">{rsvpError}</p>
					{/if}
					<div class="space-y-2">
						<label for="rsvpName" class="block text-sm font-medium text-amber-800">Nama Anda</label>
						<input
							id="rsvpName"
							type="text"
							bind:value={rsvpName}
							disabled={rsvpLoading}
							class="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none transition-colors"
						/>
					</div>
					<fieldset class="space-y-3">
						<legend class="block text-sm font-medium text-amber-800">Apakah Anda hadir?</legend>
						<div class="grid grid-cols-2 gap-3">
							<label
								class="flex items-center justify-center p-4 border border-amber-200 rounded-xl cursor-pointer transition-colors {rsvpAttending
									? 'bg-amber-800 text-white border-amber-800'
									: 'hover:bg-amber-50'}"
							>
								<input type="radio" bind:group={rsvpAttending} value={true} class="sr-only" />
								<span class="text-sm font-medium">Ya, Hadir</span>
							</label>
							<label
								class="flex items-center justify-center p-4 border border-amber-200 rounded-xl cursor-pointer transition-colors {!rsvpAttending
									? 'bg-amber-800 text-white border-amber-800'
									: 'hover:bg-amber-50'}"
							>
								<input type="radio" bind:group={rsvpAttending} value={false} class="sr-only" />
								<span class="text-sm font-medium">Tidak</span>
							</label>
						</div>
					</fieldset>
					{#if rsvpAttending}
						<div transition:slide class="space-y-2">
							<label for="rsvpGuestCount" class="block text-sm font-medium text-amber-800"
								>Jumlah Tamu</label
							>
							<select
								id="rsvpGuestCount"
								bind:value={rsvpGuestCount}
								disabled={rsvpLoading}
								class="w-full px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl focus:border-amber-400 focus:ring-1 focus:ring-amber-400 focus:outline-none transition-colors appearance-none"
							>
								{#each [1, 2, 3, 4, 5] as n}
									<option value={n}>{n} Tamu</option>
								{/each}
							</select>
						</div>
					{/if}
					<button
						type="submit"
						disabled={rsvpLoading}
						class="w-full py-4 mt-8 bg-amber-800 text-white rounded-xl text-sm font-medium hover:bg-amber-700 transition-colors flex justify-center items-center gap-2"
					>
						{#if rsvpLoading}
							<Loader2 class="w-4 h-4 animate-spin" />
						{/if}
						Kirim RSVP
					</button>
				</form>
			{/if}
		</section>
	{/if}

	<!-- Guestbook -->
	{#if featureToggle.show_wishes}
		<section class="py-20 px-6 max-w-4xl mx-auto space-y-12">
			<h2 class="text-3xl font-bold text-center text-amber-800">Ucapan & Doa</h2>
			<div class="grid md:grid-cols-2 gap-8">
				<div>
					<form onsubmit={handleGuestbook} class="space-y-4">
						{#if gbSubmitError}
							<p transition:slide class="text-red-500 text-sm">{gbSubmitError}</p>
						{/if}
						<div class="space-y-2">
							<label for="gbName" class="block text-sm font-medium text-amber-800">Nama</label>
							<input
								id="gbName"
								type="text"
								bind:value={gbName}
								disabled={gbSubmitting}
								class="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl focus:border-amber-400 focus:outline-none transition-colors"
							/>
						</div>
						<div class="space-y-2">
							<label for="gbMessage" class="block text-sm font-medium text-amber-800">Ucapan</label>
							<textarea
								id="gbMessage"
								bind:value={gbMessage}
								rows="4"
								disabled={gbSubmitting}
								class="w-full px-4 py-3 bg-white border border-amber-200 rounded-xl focus:border-amber-400 focus:outline-none transition-colors resize-none"
							></textarea>
						</div>
						<button
							type="submit"
							disabled={gbSubmitting}
							class="px-8 py-3 bg-amber-800 text-white rounded-full text-sm font-medium hover:bg-amber-700 transition-colors flex items-center gap-2"
						>
							{#if gbSubmitting}
								<Loader2 class="w-4 h-4 animate-spin" />
							{/if}
							Kirim Ucapan
						</button>
					</form>
				</div>
				<div class="space-y-6 max-h-[500px] overflow-y-auto pr-4 scrollbar-thin">
					{#if gbLoading}
						<div class="flex justify-center">
							<Loader2 class="w-6 h-6 animate-spin text-amber-400" />
						</div>
					{:else if gbEntries.length > 0}
						{#each gbEntries as entry (entry.id)}
							<div in:fade class="bg-white p-6 rounded-3xl border border-amber-100">
								<p class="font-bold text-amber-800">{entry.name}</p>
								<p class="text-amber-700 mt-2 text-sm leading-relaxed">{entry.message}</p>
							</div>
						{/each}
					{:else}
						<p class="text-amber-600 text-center">Belum ada ucapan. Jadilah yang pertama!</p>
					{/if}
				</div>
			</div>
		</section>
	{/if}

	<!-- Footer -->
	<footer class="py-12 text-center text-amber-600 text-sm border-t border-amber-200">
		<p>Powered by <span class="font-bold text-amber-800">MOMENU</span></p>
	</footer>
</div>
