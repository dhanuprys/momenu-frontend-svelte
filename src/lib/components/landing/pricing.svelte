<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Check, ArrowRight, ShieldCheck, Sparkles } from '@lucide/svelte';
</script>

<section id="akses" class="py-28 bg-[#F9FAF8] relative overflow-hidden select-none">
	<div class="container mx-auto max-w-6xl px-4 md:px-8">
		<!-- Section Header -->
		<div class="flex flex-col items-center text-center space-y-4 mb-16">
			<h2 class="text-4xl sm:text-5xl md:text-6xl font-serif font-normal tracking-tight text-stone-900">
				Mulai Tanpa Biaya Tambahan
			</h2>
			<p class="max-w-xl text-stone-600 text-base md:text-lg leading-relaxed font-sans">
				Saat ini platform Momenu terbuka untuk akses eksklusif. Nikmati fitur penuh tanpa biaya.
			</p>
		</div>

		<div class="max-w-3xl mx-auto">
			<div
				class="flex flex-col p-8 md:p-14 bg-[#121815] text-stone-100 border border-emerald-900/40 rounded-[2.5rem] shadow-2xl relative overflow-hidden"
			>
				<!-- Ambient Soft Green Glow inside Card -->
				<div class="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>

				<div
					class="absolute top-6 right-6 md:top-8 md:right-8 rounded-full bg-emerald-400/10 border border-emerald-400/20 px-4 py-1.5 text-[10px] font-semibold text-emerald-300 uppercase tracking-[0.25em]"
				>
					Early Access
				</div>

				<div class="mb-10">
					<span class="text-xs uppercase tracking-[0.3em] text-emerald-400 font-medium">MEMBERSHIP</span>
					<h3 class="text-4xl md:text-5xl font-serif font-normal text-emerald-100 mt-2">100% Gratis</h3>
					<p class="text-stone-400 text-sm mt-3 font-sans max-w-md">
						Dapatkan akses tanpa batas ke seluruh koleksi tema dan fitur manajemen undangan digital.
					</p>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
					<div class="flex items-center gap-3 text-sm text-stone-200 bg-[#1a221e] p-4 rounded-2xl border border-emerald-900/30">
						<Check class="h-4 w-4 text-emerald-300 shrink-0" />
						<span class="font-sans text-xs">Akses penuh seluruh tema premium</span>
					</div>
					<div class="flex items-center gap-3 text-sm text-stone-200 bg-[#1a221e] p-4 rounded-2xl border border-emerald-900/30">
						<Check class="h-4 w-4 text-emerald-300 shrink-0" />
						<span class="font-sans text-xs">Tamu & Konfirmasi RSVP tanpa kuota</span>
					</div>
					<div class="flex items-center gap-3 text-sm text-stone-200 bg-[#1a221e] p-4 rounded-2xl border border-emerald-900/30">
						<Check class="h-4 w-4 text-emerald-300 shrink-0" />
						<span class="font-sans text-xs">Buku tamu digital & pesan ucapan</span>
					</div>
					<div class="flex items-center gap-3 text-sm text-stone-200 bg-[#1a221e] p-4 rounded-2xl border border-emerald-900/30">
						<Check class="h-4 w-4 text-emerald-300 shrink-0" />
						<span class="font-sans text-xs">Amplop digital & QRIS langsung</span>
					</div>
				</div>

				<div class="pt-4 text-center">
					<Button
						size="lg"
						class="w-full sm:w-auto h-14 px-10 text-xs uppercase tracking-widest font-bold rounded-full bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-300 text-stone-950 hover:opacity-95 shadow-xl transition-all"
						href="/register"
					>
						<span>Buat Undangan Eksklusif</span>
						<ArrowRight class="ml-3 h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	</div>
</section>
