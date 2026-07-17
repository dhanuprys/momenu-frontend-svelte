<script lang="ts">
	import { getPernikahanContext } from '$lib/theme-engine/context.js';
	import { createMediaHelper } from '$lib/theme-engine/helpers/media.js';
	import { createTextHelper } from '$lib/theme-engine/helpers/text.js';
	import { createStyleHelper } from '$lib/theme-engine/helpers/style.js';
	import { createCountdown } from '$lib/theme-engine/helpers/countdown.svelte.js';
	import { MANIFEST, BUCKET, TEXT, STYLE } from './manifest.js';
	import { fade, fly } from 'svelte/transition';
	import type { Guestbook } from '$lib/types/index.js';
	import { onMount } from 'svelte';

	import Cover from './Cover.svelte';
	import SectionEditButton from '$lib/theme-engine/components/section-edit-button.svelte';
	import { Volume2, VolumeX } from '@lucide/svelte';

	// Svelte context data
	const invitationData = getPernikahanContext();
	const {
		payload,
		featureToggle,
		schedules,
		giftRegistries,
		mediaMappings,
		invitationApi,
		initialGuestbook,
		guestName,
		coverState,
		musicController,
		textOverrides,
		styleOverrides,
		firstScheduleDate
	} = invitationData;

	const countdown = createCountdown(firstScheduleDate);

	let isOpened = $derived(coverState.isOpened());

	// Media helper
	const media = createMediaHelper(MANIFEST.buckets, mediaMappings);

	// Text and Style helpers
	const text = createTextHelper(MANIFEST.textSlots, textOverrides);
	const style = createStyleHelper(MANIFEST.styleSlots, styleOverrides);

	const heroPhoto = media.getFirstUrl(BUCKET.hero_photo);
	const groomPhoto = media.getFirstUrl(BUCKET.groom_photo);
	const bridePhoto = media.getFirstUrl(BUCKET.bride_photo);
	const galleryImages = media.getAll(BUCKET.gallery_grid);
	const promoVideo = media.getFirstUrl(BUCKET.promo_video);

	// Form State
	let rsvpName = $state('');
	let rsvpAttendance = $state('Hadir');
	let rsvpMessage = $state('');
	let rsvpSubmitting = $state(false);
	let rsvpSuccess = $state(false);
	let rsvpError = $state('');

	let gbEntries = $state<Guestbook[]>([]);
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

	async function submitRSVP(e: Event) {
		e.preventDefault();
		if (!rsvpName || !rsvpAttendance || !rsvpMessage) {
			rsvpError = 'Harap lengkapi semua bidang.';
			setTimeout(() => (rsvpError = ''), 3000);
			return;
		}

		rsvpSubmitting = true;
		try {
			const entry = await invitationApi.submitGuestbook({
				name: rsvpName,
				message: rsvpMessage
			});
			gbEntries = [entry, ...gbEntries];

			await invitationApi.submitRSVP({
				name: rsvpName,
				attending: rsvpAttendance === 'Hadir',
				guest_count: 1
			});

			rsvpSuccess = true;
			rsvpName = '';
			rsvpMessage = '';
			setTimeout(() => (rsvpSuccess = false), 3000);
		} catch (err) {
			rsvpError = 'Gagal mengirim RSVP. Silakan coba lagi.';
			setTimeout(() => (rsvpError = ''), 3000);
		} finally {
			rsvpSubmitting = false;
		}
	}

	function copyToClipboard(text: string, e: Event) {
		navigator.clipboard.writeText(text);
		const btn = e.currentTarget as HTMLButtonElement;
		const originalText = btn.innerText;
		btn.innerText = 'Tersalin!';
		setTimeout(() => {
			btn.innerText = originalText;
		}, 2000);
	}

	import { getMediaUrl } from '$lib/utils.js';
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	<link
		href="https://fonts.googleapis.com/css2?family=Cardo:ital,wght@0,400;0,700;1,400&family=Great+Vibes&display=swap"
		rel="stylesheet"
	/>
</svelte:head>

<div
	class="theme-container text-stone-800 antialiased overflow-x-hidden {isOpened
		? ''
		: 'h-screen overflow-hidden'}"
>
	<Cover />

	{#if featureToggle.show_music && musicController && isOpened}
		<button
			class="fixed bottom-6 right-6 z-40 bg-white/80 backdrop-blur text-stone-700 p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all border border-stone-200"
			onclick={musicController.toggle}
			aria-label="Toggle music"
		>
			{#if musicController.isPlaying()}
				<Volume2 class="w-6 h-6 animate-pulse" />
			{:else}
				<VolumeX class="w-6 h-6 text-stone-400" />
			{/if}
		</button>
	{/if}

	<!-- HERO SECTION -->
	{#if heroPhoto}
		<section
			id="hero"
			class="relative min-h-screen flex items-center justify-center overflow-hidden bg-stone-900"
		>
			<SectionEditButton slotKey={STYLE.hero_overlay} tab="style" label="Edit Tampilan Hero" />
			<img
				src={getMediaUrl(heroPhoto)}
				alt="Hero"
				class="absolute inset-0 w-full h-full object-cover opacity-80"
			/>
			<div class="absolute inset-0" style={style.css(STYLE.hero_overlay)}></div>

			<div class="z-10 text-center text-white p-6" in:fly={{ y: 50, duration: 1500, delay: 500 }}>
				<h1 class="font-script text-5xl md:text-7xl lg:text-8xl mb-4 drop-shadow-lg">
					{payload.nama_mempelai_pria} & {payload.nama_mempelai_wanita}
				</h1>
				<p class="text-lg md:text-xl font-light tracking-widest uppercase mt-6 drop-shadow-md">
					We are getting married
				</p>
				{#if schedules.length > 0 && schedules[0].start_time}
					<p class="text-lg md:text-xl font-light tracking-widest uppercase mt-2 drop-shadow-md">
						{new Date(schedules[0].start_time)
							.toLocaleDateString('id-ID', {
								day: '2-digit',
								month: '2-digit',
								year: 'numeric'
							})
							.replace(/\//g, ' / ')}
					</p>
				{/if}
			</div>
		</section>
	{/if}

	<!-- INTRO SECTION -->
	<section class="relative py-20 px-6 text-center" style={style.css(STYLE.intro_section)}>
		<SectionEditButton slotKey={STYLE.intro_section} tab="style" label="Edit Tampilan" />
		<SectionEditButton
			slotKey={TEXT.greeting_title}
			tab="text"
			label="Edit Teks"
			class="top-14 right-4"
		/>
		<div class="max-w-4xl mx-auto">
			<h2 class="font-script text-4xl md:text-5xl mb-6">{@html text.render(TEXT.greeting_title)}</h2>
			<p class="leading-relaxed max-w-2xl mx-auto mb-16">
				{@html text.render(TEXT.greeting_body)}
			</p>

			<div class="grid md:grid-cols-2 gap-12 md:gap-8">
				<!-- Groom -->
				<div class="flex flex-col items-center">
					<div
						class="w-48 h-64 overflow-hidden rounded-t-full rounded-b-md shadow-xl mb-6 ring-4 ring-stone-100"
					>
						{#if groomPhoto}
							<img src={getMediaUrl(groomPhoto)} alt="Groom" class="w-full h-full object-cover" />
						{:else}
							<div class="w-full h-full bg-stone-200"></div>
						{/if}
					</div>
					<h3 class="font-script text-4xl text-stone-800 mb-2">{payload.nama_mempelai_pria}</h3>
					<p class="font-bold text-lg mb-1">{payload.nama_mempelai_pria}</p>
					<p class="italic text-stone-500 mb-2 text-sm">Putra dari pasangan</p>
					<p class="text-stone-700 font-medium">
						Bpk. {payload.nama_ayah_pria}<br />&<br />Ibu {payload.nama_ibu_pria}
					</p>
					<p class="text-stone-500 text-sm mt-3">{payload.alamat_pria}</p>
				</div>

				<!-- Bride -->
				<div class="flex flex-col items-center">
					<div
						class="w-48 h-64 overflow-hidden rounded-t-full rounded-b-md shadow-xl mb-6 ring-4 ring-stone-100"
					>
						{#if bridePhoto}
							<img src={getMediaUrl(bridePhoto)} alt="Bride" class="w-full h-full object-cover" />
						{:else}
							<div class="w-full h-full bg-stone-200"></div>
						{/if}
					</div>
					<h3 class="font-script text-4xl text-stone-800 mb-2">{payload.nama_mempelai_wanita}</h3>
					<p class="font-bold text-lg mb-1">{payload.nama_mempelai_wanita}</p>
					<p class="italic text-stone-500 mb-2 text-sm">Putri dari pasangan</p>
					<p class="text-stone-700 font-medium">
						Bpk. {payload.nama_ayah_wanita}<br />&<br />Ibu {payload.nama_ibu_wanita}
					</p>
					<p class="text-stone-500 text-sm mt-3">{payload.alamat_wanita}</p>
				</div>
			</div>
		</div>
	</section>

	<!-- SCHEDULES SECTION -->
	{#if schedules && schedules.length > 0}
		<section
			class="relative py-24 px-6 text-center overflow-hidden"
			style={style.css(STYLE.schedule_section)}
		>
			<SectionEditButton slotKey={STYLE.schedule_section} tab="style" label="Edit Tampilan Jadwal" />
			<SectionEditButton
				slotKey={TEXT.schedule_title}
				tab="text"
				label="Edit Teks Jadwal"
				class="top-14 right-4"
			/>
			<div class="max-w-4xl mx-auto relative z-10">
				<h3 class="font-script text-5xl md:text-6xl mb-12">{text.render(TEXT.schedule_title)}</h3>
				<div
					class="bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-2xl max-w-lg mx-auto"
				>
					<!-- Ornate Icon -->
					<div class="flex justify-center mb-6">
						<svg
							width="48"
							height="48"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							class="text-yellow-400"
							><path
								d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
							></path></svg
						>
					</div>

					<h3 class="font-script text-4xl mb-6 text-yellow-400">Pawiwahan</h3>

					{#each schedules as schedule}
						<div class="mb-8 last:mb-0">
							<h4 class="font-bold text-xl mb-2">{schedule.title}</h4>
							{#if schedule.start_time}
								<p class="text-lg">
									{new Date(schedule.start_time).toLocaleDateString('id-ID', {
										weekday: 'long',
										day: 'numeric',
										month: 'long',
										year: 'numeric'
									})}
								</p>
								<p class="text-stone-300">
									{new Date(schedule.start_time).toLocaleTimeString('id-ID', {
										hour: '2-digit',
										minute: '2-digit'
									})} WITA - Selesai
								</p>
							{/if}
							<div class="mt-4 text-stone-300">
								<span class="block italic text-sm mb-1">Bertempat di</span>
								<p class="font-medium">{schedule.location}</p>
							</div>
						</div>
					{/each}

					<div class="mt-8 pt-6 border-t border-white/20">
						<p class="italic text-sm mb-2">
							{@html text.render(TEXT.closing_text)}
						</p>
						<p class="text-xs font-bold text-yellow-400 uppercase tracking-widest mt-4">
							Kami yang berbahagia
						</p>
						<p class="text-sm mt-1">
							Kel. {payload.nama_ayah_pria} & Kel. {payload.nama_ayah_wanita}
						</p>
					</div>
				</div>

				{#if countdown.value && !countdown.value.isExpired}
					<div class="mt-16">
						<h3 class="font-script text-4xl mb-8">Hari Bahagia</h3>
						<div class="flex flex-wrap justify-center gap-4 md:gap-8">
							<div class="flex flex-col items-center">
								<div
									class="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-white text-stone-900 rounded-lg text-2xl md:text-3xl font-bold shadow-lg"
								>
									{countdown.value.days}
								</div>
								<span class="mt-2 text-sm uppercase tracking-widest">Hari</span>
							</div>
							<div class="flex flex-col items-center">
								<div
									class="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-white text-stone-900 rounded-lg text-2xl md:text-3xl font-bold shadow-lg"
								>
									{countdown.value.hours}
								</div>
								<span class="mt-2 text-sm uppercase tracking-widest">Jam</span>
							</div>
							<div class="flex flex-col items-center">
								<div
									class="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-white text-stone-900 rounded-lg text-2xl md:text-3xl font-bold shadow-lg"
								>
									{countdown.value.minutes}
								</div>
								<span class="mt-2 text-sm uppercase tracking-widest">Menit</span>
							</div>
							<div class="flex flex-col items-center">
								<div
									class="w-16 h-16 md:w-20 md:h-20 flex items-center justify-center bg-white text-stone-900 rounded-lg text-2xl md:text-3xl font-bold shadow-lg"
								>
									{countdown.value.seconds}
								</div>
								<span class="mt-2 text-sm uppercase tracking-widest">Detik</span>
							</div>
						</div>
					</div>
				{/if}
			</div>
		</section>
	{/if}

	<!-- QUOTE SECTION -->
	<section class="relative py-20 px-6">
		<SectionEditButton slotKey={STYLE.quote_card} tab="style" label="Edit Kartu Kutipan" />
		<SectionEditButton
			slotKey={TEXT.quote_text}
			tab="text"
			label="Edit Teks Kutipan"
			class="top-14 right-4"
		/>
		<div class="max-w-3xl mx-auto text-center">
			<div
				class="relative p-10 md:p-16 rounded-2xl shadow-xl border border-stone-100"
				style={style.css(STYLE.quote_card)}
			>
				<div
					class="absolute -top-6 left-1/2 -translate-x-1/2 rounded-full p-2 shadow-sm border border-stone-100"
					style="background-color: inherit;"
				>
					<svg
						width="32"
						height="32"
						viewBox="0 0 24 24"
						fill="none"
						class="text-stone-400"
						stroke="currentColor"
						stroke-width="1.5"
						><path
							d="M10 11L8 15H11V18H5V11L7 7H10L10 11ZM19 11L17 15H20V18H14V11L16 7H19L19 11Z"
							fill="currentColor"
						></path></svg
					>
				</div>
				<p class="italic text-lg md:text-xl mb-4 font-serif leading-relaxed">
					{@html text.render(TEXT.quote_text)}
				</p>
				<p class="font-bold tracking-widest uppercase text-sm">
					{@html text.render(TEXT.quote_source)}
				</p>
			</div>
		</div>
	</section>

	<!-- GALLERY SECTION -->
	{#if featureToggle.show_gallery && galleryImages.length > 0}
		<section class="relative py-24 px-6 bg-white">
			<div class="max-w-6xl mx-auto">
				<h2 class="font-script text-4xl md:text-5xl text-center text-stone-800 mb-16">
					Momen Bahagia
				</h2>

				<div class="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[150px] md:auto-rows-[250px] grid-flow-dense">
					{#each galleryImages as image, i}
						{@const pattern = i % 7}
						<div
							class="overflow-hidden rounded-xl shadow-sm group relative 
							{pattern === 0 ? 'col-span-2 row-span-2' : ''}
							{pattern === 3 ? 'md:col-span-2 row-span-1' : ''}
							{pattern === 6 ? 'col-span-2 md:col-span-1 row-span-2' : ''}"
						>
							<div class="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors duration-500 z-10 pointer-events-none"></div>
							<img
								src={getMediaUrl(image.url)}
								alt="Gallery"
								class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
								loading="lazy"
							/>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- VIDEO SECTION -->
	{#if promoVideo}
		<section class="relative py-20 px-6 bg-stone-100">
			<div class="max-w-4xl mx-auto text-center">
				<h2 class="font-script text-4xl md:text-5xl text-stone-800 mb-12">Cerita Kami</h2>
				<div class="rounded-2xl overflow-hidden shadow-2xl bg-black">
					<!-- svelte-ignore a11y_media_has_caption -->
					<video controls class="w-full aspect-video" src={getMediaUrl(promoVideo)}></video>
				</div>
			</div>
		</section>
	{/if}

	<!-- RSVP & GUESTBOOK SECTION -->
	{#if featureToggle.show_rsvp || featureToggle.show_wishes}
		<section class="relative py-20 px-6 bg-white">
			<div class="max-w-2xl mx-auto text-center">
				<h2 class="font-script text-4xl md:text-5xl text-stone-800 mb-8">Mohon Doa Restu</h2>
				<div
					class="bg-stone-50 p-8 md:p-10 rounded-3xl shadow-sm border border-stone-100 text-left"
				>
					<form onsubmit={submitRSVP} class="space-y-6">
						<div>
							<label
								for="nama"
								class="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wider"
								>Nama Anda</label
							>
							<input
								type="text"
								id="nama"
								bind:value={rsvpName}
								class="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-stone-400 focus:border-transparent outline-none transition-all"
								required
								placeholder="Tulis nama Anda di sini"
							/>
						</div>

						{#if featureToggle.show_wishes}
							<div>
								<label
									for="ucapan"
									class="block text-sm font-bold text-stone-700 mb-2 uppercase tracking-wider"
									>Pesan & Doa</label
								>
								<textarea
									id="ucapan"
									bind:value={rsvpMessage}
									rows="4"
									class="w-full px-4 py-3 rounded-lg border border-stone-200 focus:ring-2 focus:ring-stone-400 focus:border-transparent outline-none transition-all"
									required
									placeholder="Berikan doa restu Anda"></textarea>
							</div>
						{/if}

						{#if featureToggle.show_rsvp}
							<div>
								<!-- svelte-ignore a11y_label_has_associated_control -->
								<label class="block text-sm font-bold text-stone-700 mb-3 uppercase tracking-wider"
									>Konfirmasi Kehadiran</label
								>
								<div class="flex flex-col sm:flex-row gap-4">
									<label class="flex-1 relative">
										<input
											type="radio"
											bind:group={rsvpAttendance}
											value="Hadir"
											class="peer sr-only"
										/>
										<div
											class="w-full text-center px-4 py-3 rounded-lg border border-stone-200 peer-checked:border-stone-800 peer-checked:bg-stone-800 peer-checked:text-white cursor-pointer transition-all"
										>
											Hadir
										</div>
									</label>
									<label class="flex-1 relative">
										<input
											type="radio"
											bind:group={rsvpAttendance}
											value="Tidak Hadir"
											class="peer sr-only"
										/>
										<div
											class="w-full text-center px-4 py-3 rounded-lg border border-stone-200 peer-checked:border-stone-800 peer-checked:bg-stone-800 peer-checked:text-white cursor-pointer transition-all"
										>
											Tidak Hadir
										</div>
									</label>
								</div>
							</div>
						{/if}

						<button
							type="submit"
							disabled={rsvpSubmitting}
							class="w-full bg-stone-800 hover:bg-stone-900 text-white font-bold py-4 rounded-lg transition-colors disabled:opacity-70"
						>
							{rsvpSubmitting ? 'Mengirim...' : 'Kirim Pesan'}
						</button>

						{#if rsvpSuccess}
							<div
								class="p-4 bg-green-50 text-green-700 rounded-lg text-center font-medium"
								transition:fade
							>
								Terima kasih! Pesan dan konfirmasi Anda telah terkirim.
							</div>
						{/if}

						{#if rsvpError}
							<div
								class="p-4 bg-red-50 text-red-700 rounded-lg text-center font-medium"
								transition:fade
							>
								{rsvpError}
							</div>
						{/if}
					</form>
				</div>

				{#if featureToggle.show_wishes}
					<div
						class="mt-12 text-left bg-white p-6 rounded-3xl shadow-sm border border-stone-100 h-[400px] overflow-y-auto"
					>
						<h3 class="text-xl font-bold text-stone-800 mb-6 text-center">Ucapan & Doa</h3>
						{#if gbLoading}
							<p class="text-center text-stone-500">Memuat ucapan...</p>
						{:else if gbEntries.length > 0}
							<div class="space-y-4">
								{#each gbEntries as entry (entry.id)}
									<div class="bg-stone-50 p-4 rounded-xl border border-stone-100">
										<p class="font-bold text-stone-800">{entry.name}</p>
										<p class="text-stone-600 mt-2 text-sm leading-relaxed whitespace-pre-wrap">
											{entry.message}
										</p>
									</div>
								{/each}
							</div>
						{:else}
							<p class="text-center text-stone-500">
								Belum ada ucapan. Jadilah yang pertama memberikan doa restu!
							</p>
						{/if}
					</div>
				{/if}
			</div>
		</section>
	{/if}

	<!-- AMPLOP (GIFT REGISTRY) -->
	{#if featureToggle.show_gifts && giftRegistries.length > 0}
		<section class="relative py-20 px-6 bg-stone-50 text-center">
			<div class="max-w-3xl mx-auto">
				<h2 class="font-script text-4xl md:text-5xl text-stone-800 mb-4">Wedding Gift</h2>
				<p class="italic text-stone-600 mb-12 max-w-xl mx-auto leading-relaxed">
					Tanpa mengurangi rasa hormat, bagi tamu yang ingin mengirimkan tanda kasih melalui
					transfer, berikut informasi rekening kami:
				</p>

				<div class="grid md:grid-cols-2 gap-6">
					{#each giftRegistries as gift}
						{#if gift.type !== 'physical'}
							<div
								class="bg-white p-8 rounded-2xl shadow-md border border-stone-100 flex flex-col h-full"
							>
								<h3
									class="text-xl font-bold text-stone-800 uppercase tracking-widest mb-4 border-b pb-4"
								>
									{gift.provider_name}
								</h3>
								<div class="grow flex flex-col justify-center my-4">
									{#if gift.type === 'ewallet'}
										{#if gift.qr_code_image}
											<div class="max-w-[200px] mx-auto mb-4 aspect-square rounded-xl overflow-hidden border border-stone-200">
												<img src={getMediaUrl(gift.qr_code_image)} alt="QR" class="w-full h-full object-cover" />
											</div>
										{/if}
										{#if gift.phone_number}
											<p class="text-xl font-mono text-stone-900 tracking-widest text-center">{gift.phone_number}</p>
										{/if}
									{:else}
										<p class="text-3xl font-mono text-stone-900 tracking-widest mb-2 text-center">
											{gift.account_number}
										</p>
										<p class="text-stone-500 uppercase tracking-wider text-sm text-center">
											a.n. {gift.account_name}
										</p>
									{/if}
								</div>
								{#if gift.type === 'ewallet' && gift.phone_number}
									<button
										onclick={(e) => copyToClipboard(gift.phone_number!, e)}
										class="mt-auto w-full border-2 border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-white font-bold py-3 rounded-lg transition-colors uppercase tracking-wider text-sm"
									>
										Salin Nomor Telepon
									</button>
								{:else if gift.type === 'bank'}
									<button
										onclick={(e) => copyToClipboard(gift.account_number, e)}
										class="mt-auto w-full border-2 border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-white font-bold py-3 rounded-lg transition-colors uppercase tracking-wider text-sm"
									>
										Salin Rekening
									</button>
								{/if}
							</div>
						{/if}
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- FOOTER -->
	<footer class="py-12 bg-stone-900 text-stone-400 text-center px-6">
		<h2 class="font-script text-4xl text-white mb-6">Matur Suksma</h2>
		<p class="text-sm tracking-widest uppercase mb-2">
			Merupakan suatu kehormatan bagi kami atas kehadiran Bapak/Ibu/Saudara/i
		</p>
		<p class="text-xs mt-12 opacity-50">Powered by Momenu</p>
	</footer>
</div>

<style>
	:global(.font-script) {
		font-family: 'Great Vibes', cursive;
	}

	.theme-container {
		font-family: 'Cardo', serif;
	}
</style>
