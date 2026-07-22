<script lang="ts">
	import { getSeminarContext } from '$lib/theme-engine/context';
	import { createMediaHelper } from '$lib/theme-engine/helpers/media';
	import { getMediaUrl } from '$lib/utils';
	import { MANIFEST, BUCKET } from './manifest';
	import { onMount } from 'svelte';
	import { slide, fade } from 'svelte/transition';
	import type { Guestbook } from '$lib/types/index';
	import { Loader2 } from '@lucide/svelte';

	import GenericCover from '$lib/theme-engine/components/generic-cover.svelte';

	const invitationData = getSeminarContext();
	const {
		guestName,
		guestRecord,
		payload,
		featureToggle,
		schedules,
		mediaMappings,
		liveStreams,
		invitationApi,
		initialGuestbook
	} = invitationData;

	const media = createMediaHelper(MANIFEST.buckets, mediaMappings);
	const bannerImage = media.getFirstUrl(BUCKET.hero_banner);
	const speakerPhotos = media.getAll(BUCKET.speaker_photos);

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
			gbSubmitError = 'Gagal mengirim.';
		} finally {
			gbSubmitting = false;
		}
	}
</script>

<GenericCover {invitationData} />

<div class="min-h-screen bg-slate-50 font-sans text-slate-800">
	<!-- Cover -->
	<section
		class="relative min-h-screen flex flex-col items-center justify-center text-center p-6 overflow-hidden"
	>
		{#if bannerImage}
			<div class="absolute inset-0 z-0">
				<img
					src={getMediaUrl(bannerImage)}
					alt="Banner"
					class="w-full h-full object-cover opacity-20"
				/>
			</div>
		{/if}
		<div class="absolute inset-0 bg-linear-to-b from-slate-900/60 to-slate-900/40 z-1"></div>
		<div class="relative z-10 space-y-6 text-white">
			{#if guestName}
				<p class="text-sm tracking-[0.2em] uppercase text-slate-300">Undangan untuk</p>
				<p class="text-2xl font-light">{guestName}</p>
			{/if}
			<p class="text-sm tracking-[0.3em] uppercase text-slate-300">Seminar</p>
			<h1 class="text-4xl md:text-6xl font-bold max-w-3xl mx-auto leading-tight">
				{payload.nama_seminar || 'Nama Seminar'}
			</h1>
			<div
				class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full"
			>
				<span class="text-sm text-slate-200">Pembicara:</span>
				<span class="font-bold">{payload.nama_pembicara || '-'}</span>
			</div>
		</div>
	</section>

	<!-- Speaker Photos -->
	{#if speakerPhotos.length > 0}
		<section class="py-20 px-6 max-w-4xl mx-auto text-center space-y-12">
			<h2 class="text-3xl font-bold text-slate-700">Pembicara</h2>
			<div class="flex flex-wrap justify-center gap-8">
				{#each speakerPhotos as photo}
					<div class="w-36 h-36 rounded-full overflow-hidden border-4 border-slate-200 shadow-lg">
						<img src={getMediaUrl(photo.url)} alt="Speaker" class="w-full h-full object-cover" />
					</div>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Schedule -->
	{#if schedules.length > 0}
		<section class="py-20 bg-white">
			<div class="max-w-4xl mx-auto px-6 text-center space-y-12">
				<h2 class="text-3xl font-bold text-slate-700">Agenda</h2>
				<div class="space-y-6">
					{#each schedules as schedule, i}
						<div
							class="bg-slate-50 p-8 rounded-2xl border border-slate-100 flex flex-col md:flex-row md:items-center gap-6 text-left"
						>
							<div
								class="shrink-0 w-16 h-16 bg-slate-800 text-white rounded-2xl flex items-center justify-center text-xl font-bold"
							>
								{i + 1}
							</div>
							<div class="flex-1">
								<h3 class="text-xl font-bold mb-1">{schedule.title}</h3>
								<p class="text-slate-600 text-sm">
									{new Date(schedule.start_time).toLocaleString('id-ID', {
										dateStyle: 'full',
										timeStyle: 'short'
									})}
								</p>
								<p class="text-slate-600 text-sm">{schedule.location}</p>
							</div>
							{#if schedule.map_url}
								<a
									href={schedule.map_url}
									target="_blank"
									rel="noopener noreferrer"
									class="inline-block px-6 py-2 bg-slate-800 text-white rounded-full text-sm hover:bg-slate-700 transition-colors shrink-0"
									>Peta</a
								>
							{/if}
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Live Stream -->
	{#if featureToggle.show_live_stream && liveStreams.length > 0}
		<section class="py-20 bg-slate-800 text-white text-center space-y-8 px-6">
			<h2 class="text-3xl font-bold">Live Streaming</h2>
			<p class="text-slate-300 max-w-xl mx-auto">
				Tidak bisa hadir langsung? Saksikan secara online:
			</p>
			<div class="flex flex-wrap justify-center gap-4">
				{#each liveStreams as stream}
					<a
						href={stream.url}
						target="_blank"
						rel="noopener noreferrer"
						class="inline-block px-8 py-4 bg-white text-slate-800 rounded-full text-sm font-bold hover:bg-slate-100 transition-colors"
					>
						Tonton di {stream.platform}
					</a>
				{/each}
			</div>
		</section>
	{/if}

	<!-- RSVP -->
	{#if featureToggle.show_rsvp}
		<section class="py-20 px-6 max-w-xl mx-auto text-center space-y-8">
			<h2 class="text-3xl font-bold text-slate-700">Registrasi</h2>
			{#if rsvpSubmitted}
				<div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 text-center">
					<p class="text-xl font-bold text-slate-700 mb-2">Terima Kasih!</p>
					<p class="text-slate-600">Registrasi Anda telah kami terima.</p>
				</div>
			{:else}
				<form
					onsubmit={handleRSVP}
					class="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-6 text-left"
				>
					{#if rsvpError}<p transition:slide class="text-red-500 text-sm">{rsvpError}</p>{/if}
					<div class="space-y-2">
						<label for="rsvpName" class="block text-sm font-medium">Nama Lengkap</label>
						<input
							id="rsvpName"
							type="text"
							bind:value={rsvpName}
							disabled={rsvpLoading}
							class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-slate-400 focus:outline-none"
						/>
					</div>
					<fieldset class="space-y-3">
						<legend class="block text-sm font-medium">Akan hadir?</legend>
						<div class="grid grid-cols-2 gap-3">
							<label
								class="flex items-center justify-center p-4 border border-slate-200 rounded-xl cursor-pointer transition-colors {rsvpAttending
									? 'bg-slate-800 text-white'
									: 'hover:bg-slate-50'}"
							>
								<input type="radio" bind:group={rsvpAttending} value={true} class="sr-only" /><span
									class="text-sm font-medium">Ya</span
								>
							</label>
							<label
								class="flex items-center justify-center p-4 border border-slate-200 rounded-xl cursor-pointer transition-colors {!rsvpAttending
									? 'bg-slate-800 text-white'
									: 'hover:bg-slate-50'}"
							>
								<input type="radio" bind:group={rsvpAttending} value={false} class="sr-only" /><span
									class="text-sm font-medium">Tidak</span
								>
							</label>
						</div>
					</fieldset>
					{#if rsvpAttending}
						<div transition:slide class="space-y-2">
							<label for="rsvpGC" class="block text-sm font-medium">Jumlah Peserta</label>
							<select
								id="rsvpGC"
								bind:value={rsvpGuestCount}
								class="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none appearance-none"
							>
								{#each [1, 2, 3, 4, 5] as n}<option value={n}>{n}</option>{/each}
							</select>
						</div>
					{/if}
					<button
						type="submit"
						disabled={rsvpLoading}
						class="w-full py-4 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-700 transition-colors flex justify-center items-center gap-2"
					>
						{#if rsvpLoading}<Loader2 class="w-4 h-4 animate-spin" />{/if}Daftar Sekarang
					</button>
				</form>
			{/if}
		</section>
	{/if}

	<!-- Guestbook -->
	{#if featureToggle.show_wishes}
		<section class="py-20 px-6 max-w-4xl mx-auto space-y-12">
			<h2 class="text-3xl font-bold text-center text-slate-700">Komentar</h2>
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
						class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-slate-400 focus:outline-none"
					/>
					<textarea
						bind:value={gbMessage}
						rows="4"
						disabled={gbSubmitting}
						placeholder="Komentar..."
						class="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none resize-none"
					></textarea>
					<button
						type="submit"
						disabled={gbSubmitting}
						class="px-8 py-3 bg-slate-800 text-white rounded-full text-sm font-medium hover:bg-slate-700 transition-colors flex items-center gap-2"
					>
						{#if gbSubmitting}<Loader2 class="w-4 h-4 animate-spin" />{/if}Kirim
					</button>
				</form>
				<div class="space-y-6 max-h-[500px] overflow-y-auto">
					{#if gbLoading}
						<div class="flex justify-center">
							<Loader2 class="w-6 h-6 animate-spin text-slate-400" />
						</div>
					{:else if gbEntries.length > 0}
						{#each gbEntries as entry (entry.id)}
							<div in:fade class="bg-white p-6 rounded-3xl border border-slate-100">
								<p class="font-bold text-slate-700">{entry.name}</p>
								<p class="text-slate-600 mt-2 text-sm">{entry.message}</p>
							</div>
						{/each}
					{:else}
						<p class="text-slate-500 text-center">Belum ada komentar.</p>
					{/if}
				</div>
			</div>
		</section>
	{/if}

	<footer class="py-12 text-center text-slate-500 text-sm border-t border-slate-200">
		<p>Powered by <span class="font-bold text-slate-800">MOMENU</span></p>
	</footer>
</div>
