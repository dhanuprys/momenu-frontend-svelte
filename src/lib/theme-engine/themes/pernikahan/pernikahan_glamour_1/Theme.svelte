<script lang="ts">
	import { getPernikahanContext } from '$lib/theme-engine/context';
	import { createMediaHelper } from '$lib/theme-engine/helpers/media';
	import { createTextHelper } from '$lib/theme-engine/helpers/text';
	import { createStyleHelper } from '$lib/theme-engine/helpers/style';
	import { createCountdown } from '$lib/theme-engine/helpers/countdown.svelte';
	import { MANIFEST, BUCKET, TEXT, STYLE } from './manifest';
	import { getMediaUrl } from '$lib/utils';

	import SimpleRsvp from './components/SimpleRsvp.svelte';
	import SimpleGuestbook from './components/SimpleGuestbook.svelte';
	import SectionEditButton from '$lib/theme-engine/components/section-edit-button.svelte';
	import ImagePreview from '$lib/theme-engine/components/image-preview.svelte';
	import Cover from './Cover.svelte';
	import { SvelteSet } from 'svelte/reactivity';

	let previewImage = $state<string | null>(null);

	const invitationData = getPernikahanContext();
	const {
		slug,
		project,
		payload,
		featureToggle,
		schedules,
		mediaMappings,
		textOverrides,
		styleOverrides,
		firstScheduleDate,
		isPreview,
		guestName,
		coverState,
		journeys,
		liveStreams,
		dressCodes,
		giftRegistries
	} = invitationData;

	const countdown = createCountdown(firstScheduleDate);

	const media = createMediaHelper(MANIFEST.buckets, mediaMappings, isPreview);
	const text = createTextHelper(MANIFEST.textSlots, textOverrides);
	const style = createStyleHelper(MANIFEST.styleSlots, styleOverrides);

	const heroPhotos = media.getUrls(BUCKET.hero_photo);
	let currentHeroIndex = $state(0);

	$effect(() => {
		if (heroPhotos.length > 1) {
			const interval = setInterval(() => {
				currentHeroIndex = (currentHeroIndex + 1) % heroPhotos.length;
			}, 4000);
			return () => clearInterval(interval);
		}
	});

	const parallaxMedia = media.getUrls(BUCKET.parallax_bg);
	let currentParallaxIndex = $state(0);

	$effect(() => {
		if (parallaxMedia.length > 1) {
			const interval = setInterval(() => {
				currentParallaxIndex = (currentParallaxIndex + 1) % parallaxMedia.length;
			}, 5000);
			return () => clearInterval(interval);
		}
	});

	const quoteBg = media.getFirstUrl(BUCKET.quote_bg);
	const galleryMedia = media.getUrls(BUCKET.gallery_grid);
	const promoVideo = media.getFirstUrl(BUCKET.promo_video);

	let isOpened = $derived(coverState.isOpened());

	function fadeUp(node: HTMLElement, delay: number = 0) {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setTimeout(() => {
							node.classList.add('opacity-100', 'translate-y-0');
							node.classList.remove('opacity-0', 'translate-y-10');
						}, delay);
						observer.unobserve(node);
					}
				});
			},
			{ threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
		);

		node.classList.add(
			'opacity-0',
			'translate-y-10',
			'transition-all',
			'duration-1000',
			'ease-out'
		);
		observer.observe(node);

		return {
			destroy() {
				observer.disconnect();
			}
		};
	}

	let isGalleryVisible = $state(false);

	function observeGallery(node: HTMLElement) {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					isGalleryVisible = entry.isIntersecting;
				});
			},
			{ threshold: 0.1 }
		);
		observer.observe(node);
		return {
			destroy() {
				observer.disconnect();
			}
		};
	}

	let loadedFonts = $derived.by(() => {
		const fonts = new SvelteSet<string>(['Cardo', 'Dancing Script']);
		if (textOverrides) {
			Object.values(textOverrides).forEach((o) => {
				if (o.font_family) fonts.add(o.font_family);
			});
		}
		return Array.from(fonts);
	});

	let fontUrl = $derived.by(() => {
		const params = loadedFonts
			.map((f) => {
				if (f === 'Cardo') return 'family=Cardo:ital,wght@0,400;0,700;1,400';
				return `family=${f.replace(/ /g, '+')}`;
			})
			.join('&');
		return `https://fonts.googleapis.com/css2?${params}&display=swap`;
	});
</script>

<svelte:head>
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous" />
	{#if fontUrl}
		<link href={fontUrl} rel="stylesheet" />
	{/if}
</svelte:head>

<main
	class="font-body relative overflow-y-auto"
	style="{style.css(STYLE.body_bg)} --color-1: {style.get(STYLE.color_primary).textColor ||
		'white'}; --color-2: {style.get(STYLE.color_secondary).backgroundColor ||
		'black'}; --font-script: '{text.getFlags(TEXT.hero_title).font_family ||
		'Dancing Script'}', cursive;"
>
	<Cover />

	<div
		class="relative z-5 w-full mx-auto max-w-4xl overflow-hidden {isOpened
			? 'opacity-100'
			: 'opacity-0'} transition-opacity duration-1000 shadow-2xl"
	>
		<section
			id="sampul"
			class="relative flex h-svh w-full flex-col justify-end overflow-hidden"
			style={style.css(STYLE.color_secondary)}
		>
			<SectionEditButton
				slotKey={STYLE.hero_overlay}
				tab="style"
				label="Edit Lapisan Hero"
				class="top-14 right-4"
			/>
			<div
				class="absolute inset-0 z-0 bg-black transition-transform duration-[4000ms] ease-out {isOpened
					? 'scale-110'
					: 'scale-100'}"
			>
				{#each heroPhotos as photo, i (i)}
					<img
						src={getMediaUrl(photo)}
						alt="Opening"
						class="absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 {i ===
						currentHeroIndex
							? 'opacity-100'
							: 'opacity-0'}"
					/>
				{/each}
			</div>
			<div
				class="absolute inset-0 z-1 pointer-events-none"
				style={style.css(STYLE.hero_overlay)}
			></div>
			<div
				class="absolute inset-0 z-1 h-1/2 w-full bg-linear-to-t from-black/90 to-transparent mt-auto lg:h-1/3 pointer-events-none"
			></div>

			<div
				class="relative z-10 flex w-full flex-col justify-between gap-10 p-6 lg:flex-row lg:items-end lg:gap-4 lg:p-12"
			>
				{#if countdown.value && !countdown.value.isExpired}
					<div class="flex flex-col gap-4 max-lg:items-center text-white" use:fadeUp>
						<p class="text-base lg:text-lg">Save The Date</p>
						<div
							class="relative w-fit overflow-hidden border border-white/20 border-t-white/40 border-l-white/40 bg-white/5 shadow-2xl backdrop-blur-md p-2 md:p-4 rounded-full"
						>
							<div class="flex items-center divide-x divide-white/20">
								<div class="flex w-16 flex-col items-center md:w-20">
									<div class="font-serif text-2xl md:text-4xl">{countdown.value.days}</div>
									<div class="mt-1 text-[10px] tracking-widest text-white/80 uppercase">Hari</div>
								</div>
								<div class="flex w-16 flex-col items-center md:w-20">
									<div class="font-serif text-2xl md:text-4xl">{countdown.value.hours}</div>
									<div class="mt-1 text-[10px] tracking-widest text-white/80 uppercase">Jam</div>
								</div>
								<div class="flex w-16 flex-col items-center md:w-20">
									<div class="font-serif text-2xl md:text-4xl">{countdown.value.minutes}</div>
									<div class="mt-1 text-[10px] tracking-widest text-white/80 uppercase">Menit</div>
								</div>
								<div class="flex w-16 flex-col items-center md:w-20">
									<div class="font-serif text-2xl md:text-4xl">{countdown.value.seconds}</div>
									<div class="mt-1 text-[10px] tracking-widest text-white/80 uppercase">Detik</div>
								</div>
							</div>
						</div>
					</div>
				{/if}
				<div
					class="flex flex-col items-end gap-2 max-lg:mb-20 max-lg:items-center lg:text-right text-white"
					use:fadeUp={300}
				>
					<p class="font-bold">Undangan Pernikahan</p>
					<h1 class="font-script text-3xl leading-none md:text-5xl">
						{payload.nama_panggilan_pria || payload.nama_mempelai_pria}
						<span class="mx-2">&amp;</span>
						{payload.nama_panggilan_wanita || payload.nama_mempelai_wanita}
					</h1>
					{#if schedules.length > 0 && schedules[0].start_time}
						<p class="text-xs tracking-widest lg:text-base mt-2">
							{new Date(schedules[0].start_time)
								.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' })
								.replace(/\//g, ' . ')}
						</p>
					{/if}
				</div>
			</div>
		</section>

		<!-- INTRO / AYAT -->
		<section
			class="relative flex min-h-svh w-full flex-col items-center justify-center overflow-hidden px-6 py-24 text-center lg:px-32 lg:py-32"
			style="background-color: var(--color-2)"
		>
			{#if quoteBg}
				<div class="absolute inset-0 z-0">
					<img
						src={getMediaUrl(quoteBg)}
						alt="Quote Background"
						class="absolute inset-0 h-full w-full object-cover opacity-20 grayscale"
					/>
					<div class="absolute inset-0 bg-black/40"></div>
				</div>
			{/if}
			<SectionEditButton
				slotKey={TEXT.quote_main}
				tab="text"
				label="Edit Kutipan"
				class="top-14 right-4"
			/>
			<SectionEditButton
				slotKey={STYLE.color_primary}
				tab="style"
				label="Edit Warna Aksen"
				class="top-28 right-4"
			/>

			<div
				class="relative z-10 mb-16 flex flex-col items-center"
				style="color: var(--color-1)"
				use:fadeUp
			>
				<div class="mb-6 border border-current p-4 px-8">
					<p class="font-script text-4xl tracking-widest uppercase lg:text-5xl">
						{payload.nama_panggilan_wanita?.charAt(0) || payload.nama_mempelai_wanita?.charAt(0)}
						-
						{payload.nama_panggilan_pria?.charAt(0) || payload.nama_mempelai_pria?.charAt(0)}
					</p>
				</div>
				<h1 class="font-script text-3xl lg:text-4xl">
					{payload.nama_panggilan_wanita || payload.nama_mempelai_wanita}
					&amp;
					{payload.nama_panggilan_pria || payload.nama_mempelai_pria}
				</h1>
			</div>

			<p
				dir="auto"
				class="font-serif relative z-10 mb-4 max-w-2xl leading-loose text-xl lg:text-2xl drop-shadow-sm"
				use:fadeUp={200}
				style="color: var(--color-1)"
			>
				{@html text.render(TEXT.quote_main)}
			</p>
			<p
				class="relative z-10 mb-6 max-w-2xl text-sm leading-relaxed opacity-90 drop-shadow-sm"
				use:fadeUp={300}
				style="color: var(--color-1)"
			>
				{@html text.render(TEXT.quote_translation)}
			</p>
			<p class="font-bold relative z-10 mb-12 text-sm lg:text-base" style="color: var(--color-1)">
				{@html text.render(TEXT.quote_source)}
			</p>
		</section>
		<!-- PARALLAX WRAPPER -->
		<div class="relative w-full overflow-hidden">
			{#if parallaxMedia.length > 0}
				<!-- iOS-Safe Parallax Trick -->
				<div class="absolute inset-0 z-0" style="clip-path: inset(0 0 0 0);">
					<div class="fixed inset-0 h-[100dvh] w-full">
						{#each parallaxMedia as img, i (i)}
							<img
								src={getMediaUrl(img)}
								alt="Parallax"
								class="absolute inset-0 h-full w-full object-cover transition-all duration-[5000ms] ease-out {i ===
								currentParallaxIndex
									? 'opacity-100 scale-110'
									: 'opacity-0 scale-100'}"
							/>
						{/each}

						<!-- Base Overlay from Customizer -->
						<div class="absolute inset-0" style={style.css(STYLE.parallax_overlay)}></div>

						<!-- Vignette Gradient for Premium Cinematic Look -->
						<div
							class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-black/80"
						></div>

						<!-- Gallery Focus Darkening Overlay -->
						<div
							class="absolute inset-0 bg-black transition-opacity duration-[2000ms] ease-in-out pointer-events-none {isGalleryVisible
								? 'opacity-60'
								: 'opacity-0'}"
						></div>
					</div>
				</div>
			{/if}

			<div class="relative z-10 w-full">
				<!-- MEMPELAI -->
				<section
					id="mempelai"
					class="relative flex w-full flex-col items-center justify-center overflow-hidden py-24 lg:py-32"
				>
					<div class="relative z-10 flex w-full flex-col items-center px-6 lg:px-32">
						<h1
							class="font-script text-4xl mb-12 text-center lg:text-5xl drop-shadow-md"
							use:fadeUp
						>
							Kedua Mempelai
						</h1>
						<div
							class="flex w-full max-w-sm flex-col justify-center gap-6 md:max-w-none md:flex-row md:gap-10"
						>
							<!-- BRIDE -->
							<div class="flex w-full flex-1 flex-col">
								<div
									class="group relative flex flex-1 flex-col overflow-hidden rounded-t-3xl border border-white/20 border-t-white/40 border-l-white/40 shadow-2xl backdrop-blur-md transition-transform duration-500 hover:-translate-y-2"
									use:fadeUp={100}
								>
									<div class="aspect-square w-full overflow-hidden bg-white/10 relative">
										{#if media.has(BUCKET.bride_photo)}
											<img
												src={getMediaUrl(media.getFirstUrl(BUCKET.bride_photo))}
												alt={payload.nama_mempelai_wanita}
												class="h-full w-full object-cover"
											/>
										{/if}
									</div>
									<div
										class="flex flex-1 flex-col justify-center px-6 py-5 text-center"
										style={style.css(STYLE.glass_card)}
									>
										<p class="font-script text-2xl leading-none lg:text-3xl">
											{payload.nama_mempelai_wanita}
										</p>
										<p class="font-body mt-2 text-xs opacity-90">
											Anak dari Bapak {payload.nama_ayah_wanita} &amp; Ibu {payload.nama_ibu_wanita}
										</p>
									</div>
								</div>
							</div>

							<div class="flex items-center justify-center py-4">
								<h1 class="font-script text-4xl drop-shadow-md lg:text-5xl">&amp;</h1>
							</div>

							<!-- GROOM -->
							<div class="flex w-full flex-1 flex-col">
								<div
									class="group relative flex flex-1 flex-col overflow-hidden rounded-t-3xl border border-white/20 border-t-white/40 border-l-white/40 shadow-2xl backdrop-blur-md transition-transform duration-500 hover:-translate-y-2"
									use:fadeUp={200}
								>
									<div class="aspect-square w-full overflow-hidden bg-white/10 relative">
										{#if media.has(BUCKET.groom_photo)}
											<img
												src={getMediaUrl(media.getFirstUrl(BUCKET.groom_photo))}
												alt={payload.nama_mempelai_pria}
												class="h-full w-full object-cover"
											/>
										{/if}
									</div>
									<div
										class="flex flex-1 flex-col justify-center px-6 py-5 text-center"
										style={style.css(STYLE.glass_card)}
									>
										<p class="font-script text-2xl leading-none lg:text-3xl">
											{payload.nama_mempelai_pria}
										</p>
										<p class="font-body mt-2 text-xs opacity-90">
											Anak dari Bapak {payload.nama_ayah_pria} &amp; Ibu {payload.nama_ibu_pria}
										</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</section>

				<!-- ACARA -->
				{#if schedules.length > 0}
					<section
						id="acara"
						class="relative flex w-full flex-col items-center justify-center overflow-hidden py-24 lg:py-32"
					>
						<SectionEditButton
							slotKey={TEXT.schedule_title}
							tab="text"
							label="Edit Judul"
							class="top-4 right-4"
						/>
						<div class="relative z-10 flex w-full flex-col items-center px-6 lg:px-32">
							<div class="mb-12 w-full text-center" use:fadeUp>
								<h1 class="font-script text-4xl lg:text-5xl drop-shadow-md">
									{@html text.render(TEXT.schedule_title)}
								</h1>
							</div>

							<div class="flex w-full flex-col gap-10">
								{#each schedules as schedule, index (schedule.id || index)}
									<div
										class="relative overflow-hidden border border-white/20 border-t-white/40 border-l-white/40 shadow-2xl p-6 lg:p-10 backdrop-blur-md rounded-2xl"
										use:fadeUp={index * 100}
									>
										<div
											class="pointer-events-none absolute inset-0 bg-linear-to-br from-white/10 via-transparent to-black/30"
										></div>
										<div class="relative z-10 flex flex-col gap-6">
											<div class="flex items-center justify-between">
												<h2 class="font-script text-3xl font-normal lg:text-4xl">
													{schedule.title}
												</h2>
											</div>

											<div class="flex flex-col gap-4">
												<p class={schedule.map_url ? "text-sm opacity-90 leading-relaxed" : "text-lg font-bold"}>
													{schedule.location}
												</p>

												<div
													class="flex flex-col gap-2 sm:flex-row sm:gap-6 mt-2 border-t border-white/20 pt-4"
												>
													<div class="flex items-center gap-2 text-sm opacity-90">
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="18"
															height="18"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															stroke-width="2"
															stroke-linecap="round"
															stroke-linejoin="round"
															><path
																d="M4 7a2 2 0 0 1 2 -2h12a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-12a2 2 0 0 1 -2 -2l0 -12"
															></path><path d="M16 3l0 4"></path><path d="M8 3l0 4"></path><path
																d="M4 11l16 0"
															></path><path d="M8 15h2v2h-2l0 -2"></path></svg
														>
														<p>
															{new Date(schedule.start_time).toLocaleDateString('id-ID', {
																weekday: 'long',
																day: 'numeric',
																month: 'long',
																year: 'numeric'
															})}
														</p>
													</div>
													<div class="flex items-center gap-2 text-sm opacity-90">
														<svg
															xmlns="http://www.w3.org/2000/svg"
															width="18"
															height="18"
															viewBox="0 0 24 24"
															fill="none"
															stroke="currentColor"
															stroke-width="2"
															stroke-linecap="round"
															stroke-linejoin="round"
															><path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path><path
																d="M12 7v5l3 3"
															></path></svg
														>
														<p>
															{new Date(schedule.start_time).toLocaleTimeString('id-ID', {
																hour: '2-digit',
																minute: '2-digit'
															})} -
															{schedule.end_time
																? new Date(schedule.end_time).toLocaleTimeString('id-ID', {
																		hour: '2-digit',
																		minute: '2-digit'
																	})
																: 'Selesai'}
															{schedule.timezone === 'Asia/Jakarta'
																? 'WIB'
																: schedule.timezone === 'Asia/Makassar'
																	? 'WITA'
																	: 'WIT'}
														</p>
													</div>
												</div>
											</div>

											{#if schedule.map_url}
												<a
													target="_blank"
													rel="noopener noreferrer"
													href={schedule.map_url}
													aria-label="Lihat Peta"
													class="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-3 text-sm font-semibold transition-all border border-white/20"
												>
													<svg
														xmlns="http://www.w3.org/2000/svg"
														width="18"
														height="18"
														viewBox="0 0 24 24"
														fill="none"
														stroke="currentColor"
														stroke-width="2"
														stroke-linecap="round"
														stroke-linejoin="round"
														class="size-5"
													><path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0"></path><path
															d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0"
														></path></svg>
													<span>Lihat Peta</span>
												</a>
											{/if}
										</div>
									</div>
								{/each}
							</div>
						</div>
					</section>
				{/if}
				<!-- GALERI -->
				{#if featureToggle.show_gallery && (galleryMedia.length > 0 || promoVideo)}
					<section
						id="galeri"
						class="relative flex w-full flex-col items-center justify-center overflow-hidden py-24 lg:py-32"
						use:observeGallery
					>
						<div class="relative z-10 flex w-full flex-col items-center px-6 lg:px-32">
							<h1
								class="font-script text-5xl mb-12 text-center lg:text-6xl drop-shadow-md"
								use:fadeUp
							>
								Galeri
							</h1>

							{#if promoVideo}
								<div
									class="w-full max-w-4xl aspect-video overflow-hidden rounded-xl border border-white/20 shadow-xl mb-12 relative bg-black/50"
									use:fadeUp
								>
									<video
										src={getMediaUrl(promoVideo)}
										controls
										playsinline
										preload="auto"
										class="w-full h-full object-cover"
									>
										<track kind="captions" />
										Peramban tidak mendukung HTML5 video.
									</video>
								</div>
							{/if}

							{#if galleryMedia.length > 0}
								<div class="columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4 w-full" use:fadeUp>
									{#each galleryMedia as img, i (i)}
										<div class="overflow-hidden rounded-xl border border-white/20 shadow-lg">
											<!-- svelte-ignore a11y_click_events_have_key_events -->
											<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
											<img
												src={getMediaUrl(img)}
												alt="Gallery Item"
												class="w-full h-auto object-cover hover:scale-110 transition-transform duration-500 cursor-pointer"
												loading="lazy"
												onclick={() => previewImage = getMediaUrl(img)}
											/>
										</div>
									{/each}
								</div>
							{/if}
						</div>
					</section>
				{/if}
			</div>
			<!-- END OF PARALLAX CONTENT WRAPPER -->
		</div>
		<!-- END OF PARALLAX PARENT -->

		<!-- KISAH CINTA (JOURNEYS) -->
		{#if featureToggle.show_journeys && journeys.length > 0}
			<section
				id="cerita"
				class="relative flex w-full flex-col items-center justify-center overflow-hidden py-24 lg:py-32"
				style="background-color: var(--color-2)"
			>
				<div class="relative z-10 flex w-full flex-col items-center px-6 lg:px-32">
					<h1
						class="font-script text-4xl mb-12 text-center lg:text-5xl drop-shadow-md"
						style="color: var(--color-1)"
						use:fadeUp
					>
						Kisah Kami
					</h1>

					<div
						class="relative w-full max-w-2xl border-l-2 ml-4 md:ml-0 md:border-l-0"
						style="border-color: var(--color-1)"
					>
						<!-- Center Line for Desktop -->
						<div
							class="hidden md:block absolute left-1/2 top-0 h-full w-0.5 -ml-[1px]"
							style="background-color: var(--color-1)"
						></div>

						<div class="flex flex-col gap-8 w-full">
							{#each journeys as journey, index (journey.id)}
								<div
									class="relative flex flex-col md:flex-row {index % 2 === 0
										? 'md:flex-row-reverse'
										: ''} w-full md:items-center"
								>
									<!-- Timeline Dot -->
									<div
										class="absolute -left-[9px] top-4 md:static md:w-1/2 md:flex {index % 2 === 0
											? 'md:justify-start md:pl-8'
											: 'md:justify-end md:pr-8'}"
									>
										<div
											class="hidden md:block w-4 h-4 rounded-full border-4 shadow-xl z-10 animate-pulse"
											style="background-color: var(--color-2); border-color: var(--color-1); {index %
												2 ===
											0
												? 'margin-left: -8px;'
												: 'margin-right: -8px;'}"
										></div>
										<div
											class="md:hidden w-4 h-4 rounded-full border-4 shadow-xl z-10 animate-pulse"
											style="background-color: var(--color-2); border-color: var(--color-1);"
										></div>
									</div>

									<!-- Content Box -->
									<div
										class="pl-8 md:pl-0 md:w-1/2 {index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'} w-full"
									>
										<div
											class="p-6 border border-white/20 border-t-white/40 border-l-white/40 shadow-2xl relative bg-white/10 backdrop-blur-md rounded-2xl"
											use:fadeUp={index * 150}
										>
											<span
												class="text-xs font-bold tracking-widest uppercase opacity-80"
												style="color: var(--color-1)">{journey.date}</span
											>
											<h3 class="text-xl font-bold mt-2 text-white">{journey.title}</h3>
											<p class="mt-3 text-sm leading-relaxed opacity-90 text-white">
												{journey.content}
											</p>
										</div>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</section>
		{/if}

		<!-- LIVE STREAM -->
		{#if featureToggle.show_live_stream && liveStreams.length > 0}
			<section
				id="live"
				class="relative flex w-full flex-col items-center justify-center overflow-hidden py-24 lg:py-32"
				style={style.css(STYLE.body_bg)}
			>
				<div class="relative z-10 flex w-full flex-col items-center px-6 lg:px-32">
					<h1 class="font-script text-4xl mb-6 text-center lg:text-5xl drop-shadow-md" use:fadeUp>
						Live Streaming
					</h1>
					<p class="text-center mb-10 max-w-md opacity-90" use:fadeUp={100}>
						Bagi kerabat yang tidak dapat hadir secara langsung, Anda dapat menyaksikan momen
						bahagia kami melalui tautan berikut.
					</p>
					<div class="flex flex-col gap-6 w-full max-w-sm" use:fadeUp={200}>
						{#each liveStreams as stream (stream.id)}
							<a
								href={stream.url}
								target="_blank"
								rel="noopener noreferrer"
								class="flex items-center justify-center gap-3 px-8 py-4 border border-white/20 border-t-white/40 border-l-white/40 backdrop-blur-sm rounded-full shadow-lg hover:scale-105 hover:bg-white/10 hover:shadow-2xl transition-all"
							>
								<span class="font-bold tracking-widest uppercase text-xs"
									>Tonton di {stream.platform}</span
								>
							</a>
						{/each}
					</div>
				</div>
			</section>
		{/if}

		<!-- DRESS CODE -->
		{#if dressCodes.length > 0}
			<section
				id="dresscode"
				class="relative flex w-full flex-col items-center justify-center overflow-hidden py-24 lg:py-32"
				style="background-color: var(--color-2)"
			>
				<div class="relative z-10 flex w-full flex-col items-center px-6 lg:px-32 text-center">
					<h1
						class="font-script text-4xl mb-6 lg:text-5xl drop-shadow-md"
						style="color: var(--color-1)"
						use:fadeUp
					>
						Dress Code
					</h1>
					<p class="mb-10 max-w-md opacity-90 text-white" use:fadeUp={100}>
						Untuk melengkapi keindahan suasana, kami menyarankan para tamu untuk mengenakan pakaian
						dengan sentuhan warna berikut.
					</p>
					<div class="flex flex-wrap justify-center gap-10" use:fadeUp={200}>
						{#each dressCodes as dc (dc.id)}
							<div class="flex flex-col items-center gap-4">
								<p class="font-bold tracking-widest uppercase text-xs text-white">{dc.label}</p>
								<div class="flex gap-2">
									{#each dc.colors as color, i (i)}
										<div
											class="w-10 h-10 rounded-full shadow-lg border border-white/20"
											style="background-color: {color};"
										></div>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>
			</section>
		{/if}

		<!-- BINGKISAN TANDA KASIH (GIFTS) -->
		{#if featureToggle.show_gifts && giftRegistries.length > 0}
			<section
				id="bingkisan"
				class="relative flex w-full flex-col items-center justify-center overflow-hidden py-24 lg:py-32"
				style={style.css(STYLE.body_bg)}
			>
				<div class="relative z-10 flex w-full flex-col items-center px-6 lg:px-32">
					<h1 class="font-script text-4xl mb-6 text-center lg:text-5xl drop-shadow-md" use:fadeUp>
						Tanda Kasih
					</h1>
					<p class="text-center mb-12 max-w-md opacity-90" use:fadeUp={100}>
						Kehadiran dan doa restu Anda adalah hadiah terindah bagi kami. Namun apabila Anda hendak
						memberikan tanda kasih, Anda dapat memberikannya melalui:
					</p>

					<div class="flex flex-wrap justify-center gap-8 w-full max-w-4xl">
						{#each giftRegistries as gift, index (gift.id)}
							<div
								class="flex flex-col items-center p-8 border border-white/20 border-t-white/40 border-l-white/40 shadow-2xl rounded-2xl w-full max-w-sm backdrop-blur-lg bg-white/10"
								use:fadeUp={index * 150}
							>
								<h3 class="font-bold text-xl mb-4 text-white uppercase tracking-widest">
									{gift.provider_name}
								</h3>

								{#if gift.type === 'bank' || gift.type === 'ewallet'}
									<p class="text-2xl font-mono mb-2" style="color: var(--color-1)">
										{gift.account_number}
									</p>
									<p class="text-sm text-white opacity-80 mb-6">a.n {gift.account_name}</p>

									{#if gift.qr_code_image}
										<div class="mb-6 p-2 bg-white rounded-xl">
											<img
												src={getMediaUrl(gift.qr_code_image)}
												alt="QR Code"
												class="w-40 h-40 object-cover"
											/>
										</div>
									{/if}
								{:else if gift.type === 'physical'}
									<p class="text-center text-sm text-white opacity-90 mb-6">
										{gift.mailing_address}
									</p>
								{/if}
							</div>
						{/each}
					</div>
				</div>
			</section>
		{/if}

		<!-- RSVP & BUKU TAMU -->
		{#if featureToggle.show_rsvp || featureToggle.show_wishes}
			<section
				id="kehadiran"
				class="relative flex w-full flex-col items-center justify-center overflow-hidden py-24 lg:py-32"
				style="background-color: var(--color-2)"
			>
				<div class="relative z-10 flex w-full flex-col items-center px-6 lg:px-32">
					<h1
						class="font-script text-4xl mb-12 text-center lg:text-5xl drop-shadow-md"
						style="color: var(--color-1)"
						use:fadeUp
					>
						Kehadiran & Doa
					</h1>
					<div class="w-full max-w-2xl text-current" use:fadeUp={200}>
						{#if featureToggle.show_rsvp}
							<div class="mb-12">
								<SimpleRsvp {slug} />
							</div>
						{/if}

						{#if featureToggle.show_rsvp && featureToggle.show_wishes}
							<div class="w-full h-px bg-current opacity-20 my-16"></div>
						{/if}

						{#if featureToggle.show_wishes}
							<div>
								<SimpleGuestbook {slug} />
							</div>
						{/if}
					</div>
				</div>
			</section>
		{/if}

		<!-- FOOTER -->
		<footer
			class="relative flex w-full flex-col items-center justify-center overflow-hidden py-24 lg:py-32"
			style={style.css(STYLE.body_bg)}
		>
			<SectionEditButton
				slotKey={TEXT.closing_text}
				tab="text"
				label="Edit Penutup"
				class="top-4 right-4"
			/>
			<div
				class="relative z-10 flex w-full flex-col items-center px-6 text-center lg:px-32"
				use:fadeUp
			>
				<p class="font-serif mb-12 max-w-2xl leading-relaxed text-sm md:text-base opacity-90">
					{@html text.render(TEXT.closing_text)}
				</p>
				<h1 class="font-script text-4xl mb-4 lg:text-6xl drop-shadow-md">
					{payload.nama_panggilan_wanita || payload.nama_mempelai_wanita}
					&amp;
					{payload.nama_panggilan_pria || payload.nama_mempelai_pria}
				</h1>
				<p class="text-xs tracking-[0.2em] uppercase opacity-60 mt-12">Built with Momenu</p>
			</div>
		</footer>
	</div>
</main>

<style>
	:global(.font-script) {
		font-family: var(--font-script);
	}
	:global(.font-serif) {
		font-family: 'Cardo', serif;
	}
</style>

<ImagePreview bind:src={previewImage} />
