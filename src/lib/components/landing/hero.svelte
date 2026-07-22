<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { ArrowRight, Sparkles, Heart, Calendar, Gift, MessageSquare } from '@lucide/svelte';
</script>

<section class="relative overflow-hidden bg-[#F9FAF8] text-stone-900 pt-20 pb-32 md:pt-28 md:pb-44 select-none">
	<!-- Ambient Sage Green Glow Orbs -->
	<div
		class="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-emerald-200/30 via-teal-100/40 to-transparent rounded-full blur-[140px] pointer-events-none -z-10"
	></div>

	<div class="container mx-auto max-w-6xl px-4 md:px-8 relative z-10">
		<div class="flex flex-col items-center text-center space-y-10">
			<!-- Headline with Soft Emerald Serif Emphasis -->
			<h1
				class="text-4xl font-serif font-normal tracking-tight sm:text-6xl md:text-7xl lg:text-8xl max-w-5xl text-stone-900 text-balance leading-[1.08]"
			>
				Abadikan Momen Berharga Anda dalam <span class="italic font-serif font-normal text-emerald-800">Kesempurnaan</span> Digital.
			</h1>

			<!-- Subtitle -->
			<p
				class="max-w-2xl leading-relaxed text-stone-600 sm:text-xl text-balance font-sans font-normal"
			>
				Platform undangan digital eksklusif yang memadukan estetika minimalis, manajemen RSVP presisi, dan pengalaman tamu yang elegan.
			</p>

			<!-- SINGLE High-Contrast Primary Call-To-Action Button -->
			<div class="pt-4 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-150">
				<Button
					size="lg"
					class="h-14 px-10 text-sm font-semibold uppercase tracking-widest rounded-full bg-[#121815] hover:bg-[#1b2420] text-emerald-200 shadow-2xl shadow-stone-950/20 group transition-all duration-300 hover:scale-105 active:scale-95 border border-emerald-500/20"
					href="/explore"
				>
					<span>Mulai Undangan Eksklusif</span>
					<ArrowRight class="ml-3 h-4 w-4 transition-transform group-hover:translate-x-1 text-emerald-300" />
				</Button>
			</div>
		</div>

		<!-- High-Resolution Photorealistic Mockup Frame -->
		<div
			class="mx-auto mt-20 max-w-4xl lg:mt-28 relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both"
		>
			<!-- Ambient Drop Shadow Aura -->
			<div class="absolute -inset-4 bg-gradient-to-b from-emerald-800/10 to-stone-950/20 rounded-[2.5rem] blur-3xl opacity-60 -z-10 pointer-events-none"></div>

			<!-- Frame Container -->
			<div
				class="relative rounded-[2.5rem] border border-stone-200/80 bg-white/90 backdrop-blur-2xl p-6 md:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] overflow-hidden"
			>
				<!-- Frame Header Dots & Title -->
				<div class="flex items-center justify-between border-b border-stone-200/60 pb-5 mb-8">
					<div class="flex items-center space-x-2">
						<div class="w-2.5 h-2.5 rounded-full bg-stone-300"></div>
						<div class="w-2.5 h-2.5 rounded-full bg-stone-300"></div>
						<div class="w-2.5 h-2.5 rounded-full bg-stone-300"></div>
					</div>
					<div class="text-[11px] uppercase tracking-[0.25em] font-medium text-stone-400 font-mono">
						MOMENU EXCLUSIVE PREVIEW
					</div>
					<div class="w-12"></div>
				</div>

				<!-- Photorealistic Invitation Card Mockup -->
				<div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
					<!-- Card Container -->
					<div class="md:col-span-7 bg-[#121815] text-stone-100 rounded-3xl p-8 md:p-12 shadow-2xl border border-emerald-900/40 text-center relative overflow-hidden group">
						<!-- Soft Sage Glow Background -->
						<div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/15 via-transparent to-transparent pointer-events-none"></div>

						<div class="relative z-10 space-y-6">
							<span class="text-[9px] tracking-[0.35em] uppercase text-emerald-300/90 font-semibold">THE WEDDING OF</span>
							
							<div class="space-y-2">
								<h2 class="font-serif italic text-3xl md:text-4xl font-normal text-emerald-100 tracking-wide">Romeo & Juliet</h2>
								<p class="text-xs uppercase tracking-[0.2em] text-stone-400 font-sans">Sabtu, 28 Oktober 2026</p>
							</div>

							<div class="w-12 h-px bg-emerald-400/30 mx-auto"></div>

							<!-- Micro Countdown Bar -->
							<div class="grid grid-cols-4 gap-2.5 pt-1 max-w-xs mx-auto">
								<div class="bg-[#1a221e] backdrop-blur rounded-xl p-2.5 border border-emerald-900/30">
									<span class="block text-sm font-serif font-bold text-emerald-200">120</span>
									<span class="text-[8px] uppercase tracking-wider text-stone-400">Hari</span>
								</div>
								<div class="bg-[#1a221e] backdrop-blur rounded-xl p-2.5 border border-emerald-900/30">
									<span class="block text-sm font-serif font-bold text-emerald-200">14</span>
									<span class="text-[8px] uppercase tracking-wider text-stone-400">Jam</span>
								</div>
								<div class="bg-[#1a221e] backdrop-blur rounded-xl p-2.5 border border-emerald-900/30">
									<span class="block text-sm font-serif font-bold text-emerald-200">45</span>
									<span class="text-[8px] uppercase tracking-wider text-stone-400">Menit</span>
								</div>
								<div class="bg-[#1a221e] backdrop-blur rounded-xl p-2.5 border border-emerald-900/30">
									<span class="block text-sm font-serif font-bold text-emerald-200">18</span>
									<span class="text-[8px] uppercase tracking-wider text-stone-400">Detik</span>
								</div>
							</div>

							<div class="pt-2">
								<span class="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-300 text-stone-950 px-6 py-2.5 rounded-full text-xs uppercase tracking-wider font-bold shadow-lg">
									<Heart class="w-3.5 h-3.5 fill-current" />
									Buka Undangan
								</span>
							</div>
						</div>
					</div>

					<!-- Feature Badges -->
					<div class="md:col-span-5 flex flex-col gap-4 text-left">
						<div class="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 shadow-xs flex items-start gap-4">
							<div class="p-2.5 rounded-xl bg-emerald-100 text-emerald-900">
								<Calendar class="w-4 h-4" />
							</div>
							<div>
								<p class="font-serif font-bold text-stone-900 text-sm">RSVP Presisi</p>
								<p class="text-xs text-stone-500 mt-0.5 leading-relaxed">Konfirmasi kehadiran tamu secara otomatis dan real-time.</p>
							</div>
						</div>

						<div class="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 shadow-xs flex items-start gap-4">
							<div class="p-2.5 rounded-xl bg-emerald-100 text-emerald-900">
								<Gift class="w-4 h-4" />
							</div>
							<div>
								<p class="font-serif font-bold text-stone-900 text-sm">Amplop Digital QRIS</p>
								<p class="text-xs text-stone-500 mt-0.5 leading-relaxed">Penerimaan angpao tanpa biaya potongan.</p>
							</div>
						</div>

						<div class="p-4 rounded-2xl bg-stone-50 border border-stone-200/70 shadow-xs flex items-start gap-4">
							<div class="p-2.5 rounded-xl bg-emerald-100 text-emerald-900">
								<MessageSquare class="w-4 h-4" />
							</div>
							<div>
								<p class="font-serif font-bold text-stone-900 text-sm">Buku Tamu Interaktif</p>
								<p class="text-xs text-stone-500 mt-0.5 leading-relaxed">Kumpulan doa & kenangan hangat dari orang tercinta.</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</section>
