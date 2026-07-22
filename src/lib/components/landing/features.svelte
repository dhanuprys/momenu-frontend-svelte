<script lang="ts">
	import { CalendarCheck, MessageSquareHeart, Gift, Video, Palette, Sparkles, ShieldCheck, Zap } from '@lucide/svelte';
	import * as Card from '$lib/components/ui/card/index.js';
</script>

<section id="fitur" class="py-28 bg-[#F9FAF8] relative text-stone-900">
	<div class="container mx-auto max-w-6xl px-4 md:px-8">
		<!-- Section Header -->
		<div class="flex flex-col items-center text-center space-y-4 mb-20">
			<h2 class="text-4xl sm:text-5xl md:text-6xl font-serif font-normal tracking-tight text-stone-900">
				Fitur Presisi Tanpa Kompromi
			</h2>
			<p class="max-w-xl text-stone-600 text-base md:text-lg leading-relaxed font-sans">
				Dirancang khusus untuk menghadirkan kemewahan, efisiensi, dan kenyamanan tanpa cela bagi Anda dan setiap tamu yang diundang.
			</p>
		</div>

		<!-- Bento Grid Layout -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8">
			<!-- Feature 1: RSVP (Large 2 Cols) -->
			<Card.Root
				class="md:col-span-2 overflow-hidden border border-stone-200/80 bg-white/80 backdrop-blur-xl p-4 shadow-sm hover:shadow-xl hover:border-emerald-900/20 transition-all duration-500 rounded-3xl group"
			>
				<Card.Header class="pb-0 p-6">
					<div
						class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100/70 text-emerald-900 group-hover:scale-105 transition-transform"
					>
						<CalendarCheck class="h-6 w-6 stroke-[1.5]" />
					</div>
					<Card.Title class="text-2xl font-serif font-normal text-stone-900">Manajemen RSVP Real-Time</Card.Title>
					<Card.Description class="text-stone-500 text-sm mt-2 leading-relaxed">
						Pantau konfirmasi kehadiran tamu secara langsung dari dashboard Anda. Lengkap dengan catatan ucapan, pendamping, dan preferensi acara.
					</Card.Description>
				</Card.Header>
				<Card.Content class="mt-6 flex justify-end p-6 pt-0">
					<div
						class="h-44 w-full sm:w-5/6 rounded-2xl bg-[#121815] border border-emerald-900/40 p-5 shadow-2xl relative overflow-hidden"
					>
						<div class="flex items-center justify-between pb-3 border-b border-emerald-900/40 text-xs text-stone-400">
							<span class="font-serif font-bold text-emerald-200">Konfirmasi RSVP Terbaru</span>
							<span class="text-[10px] uppercase tracking-wider text-emerald-400">34 Hadir</span>
						</div>
						<div class="mt-3 space-y-2.5">
							<div class="flex items-center justify-between p-2.5 rounded-xl bg-[#1a221e] text-xs border border-emerald-900/30">
								<span class="font-medium text-stone-200">Bpk. Made & Keluarga</span>
								<span class="px-2.5 py-0.5 rounded-full bg-emerald-400/10 text-emerald-300 text-[10px] uppercase font-semibold tracking-wider">Hadir (2 Orang)</span>
							</div>
							<div class="flex items-center justify-between p-2.5 rounded-xl bg-[#1a221e] text-xs border border-emerald-900/30">
								<span class="font-medium text-stone-200">Ibu Wayan Sudiarta</span>
								<span class="px-2.5 py-0.5 rounded-full bg-emerald-400/10 text-emerald-300 text-[10px] uppercase font-semibold tracking-wider">Hadir (1 Orang)</span>
							</div>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Feature 2: Amplop Digital -->
			<Card.Root
				class="overflow-hidden border border-stone-200/80 bg-white/80 backdrop-blur-xl p-4 shadow-sm hover:shadow-xl hover:border-emerald-900/20 transition-all duration-500 rounded-3xl group flex flex-col justify-between"
			>
				<Card.Header class="p-6">
					<div
						class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100/70 text-emerald-900 group-hover:scale-105 transition-transform"
					>
						<Gift class="h-6 w-6 stroke-[1.5]" />
					</div>
					<Card.Title class="text-xl font-serif font-normal text-stone-900">Amplop Digital & QRIS</Card.Title>
					<Card.Description class="text-stone-500 text-sm mt-2 leading-relaxed">
						Terima hadiah dan angpao digital secara aman via transfer bank atau QRIS tanpa biaya komisi.
					</Card.Description>
				</Card.Header>
				<div class="px-6 pb-6 mt-auto">
					<div class="p-4 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between">
						<span class="text-xs font-semibold text-stone-800">Direct QRIS Transfer</span>
						<span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#121815] text-emerald-300 uppercase tracking-widest">Instant</span>
					</div>
				</div>
			</Card.Root>

			<!-- Feature 3: Buku Tamu -->
			<Card.Root
				class="overflow-hidden border border-stone-200/80 bg-white/80 backdrop-blur-xl p-6 shadow-sm hover:shadow-xl hover:border-emerald-900/20 transition-all duration-500 rounded-3xl group"
			>
				<Card.Header class="p-0">
					<div
						class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100/70 text-emerald-900 group-hover:scale-105 transition-transform"
					>
						<MessageSquareHeart class="h-6 w-6 stroke-[1.5]" />
					</div>
					<Card.Title class="text-xl font-serif font-normal text-stone-900">Buku Tamu Interaktif</Card.Title>
					<Card.Description class="text-stone-500 text-sm mt-2 leading-relaxed">
						Kumpulkan pesan, ucapan, dan doa hangat dari sahabat & keluarga dalam tampilan estetik.
					</Card.Description>
				</Card.Header>
			</Card.Root>

			<!-- Feature 4: Live Stream -->
			<Card.Root
				class="overflow-hidden border border-stone-200/80 bg-white/80 backdrop-blur-xl p-6 shadow-sm hover:shadow-xl hover:border-emerald-900/20 transition-all duration-500 rounded-3xl group"
			>
				<Card.Header class="p-0">
					<div
						class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100/70 text-emerald-900 group-hover:scale-105 transition-transform"
					>
						<Video class="h-6 w-6 stroke-[1.5]" />
					</div>
					<Card.Title class="text-xl font-serif font-normal text-stone-900">Integrasi Live Stream</Card.Title>
					<Card.Description class="text-stone-500 text-sm mt-2 leading-relaxed">
						Sematkan tautan YouTube atau Zoom Live agar kerabat yang jauh tetap hadir menyaksikan momen bersejarah Anda.
					</Card.Description>
				</Card.Header>
			</Card.Root>

			<!-- Feature 5: Customization -->
			<Card.Root
				class="overflow-hidden border border-stone-200/80 bg-white/80 backdrop-blur-xl p-6 shadow-sm hover:shadow-xl hover:border-emerald-900/20 transition-all duration-500 rounded-3xl group"
			>
				<Card.Header class="p-0">
					<div
						class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100/70 text-emerald-900 group-hover:scale-105 transition-transform"
					>
						<Palette class="h-6 w-6 stroke-[1.5]" />
					</div>
					<Card.Title class="text-xl font-serif font-normal text-stone-900">Personal Kustomisasi</Card.Title>
					<Card.Description class="text-stone-500 text-sm mt-2 leading-relaxed">
						Sesuaikan musik latar, tipografi, foto galeri, serta warna tema secara visual dan intuitif.
					</Card.Description>
				</Card.Header>
			</Card.Root>
		</div>
	</div>
</section>
