<script lang="ts">
	import { UserPlus, Wand2, Share2, Sparkles } from '@lucide/svelte';
</script>

<section
	id="cara-kerja"
	class="py-28 bg-[#F9FAF8] relative overflow-hidden text-stone-900 select-none"
>
	<div class="container mx-auto max-w-6xl px-4 md:px-8">
		<!-- Section Header -->
		<div class="flex flex-col items-center text-center space-y-4 mb-20">
			<h2
				class="text-4xl sm:text-5xl md:text-6xl font-serif font-normal tracking-tight text-stone-900"
			>
				3 Langkah Mudah & Elegan
			</h2>
			<p class="max-w-xl text-stone-600 text-base md:text-lg leading-relaxed font-sans">
				Hanya butuh beberapa menit untuk mewujudkan undangan digital sempurna Anda.
			</p>
		</div>

		<!-- Step Grid Timeline -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 relative">
			<!-- Step 1 -->
			<div
				class="flex flex-col items-center text-center space-y-6 group relative p-8 rounded-[2rem] bg-white/80 border border-stone-200/80 shadow-xs hover:shadow-2xl hover:border-emerald-900/30 transition-all duration-500 hover:-translate-y-1"
			>
				<span class="font-serif italic text-4xl text-emerald-800 font-normal">01</span>
				<div
					class="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#121815] text-emerald-200 shadow-md group-hover:scale-105 transition-transform"
				>
					<UserPlus class="h-7 w-7 stroke-[1.5]" />
				</div>
				<h3 class="text-xl font-serif font-normal text-stone-900">Daftar & Isi Detail</h3>
				<p class="text-xs text-stone-500 leading-relaxed font-sans">
					Buat akun eksklusif dan masukkan detail penting seperti nama penyelenggara, tanggal,
					waktu, dan lokasi acara.
				</p>
			</div>

			<!-- Step 2 -->
			<div
				class="flex flex-col items-center text-center space-y-6 group relative p-8 rounded-[2rem] bg-white/80 border border-stone-200/80 shadow-xs hover:shadow-2xl hover:border-emerald-900/30 transition-all duration-500 hover:-translate-y-1"
			>
				<span class="font-serif italic text-4xl text-emerald-800 font-normal">02</span>
				<div
					class="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#121815] text-emerald-200 shadow-md group-hover:scale-105 transition-transform"
				>
					<Wand2 class="h-7 w-7 stroke-[1.5]" />
				</div>
				<h3 class="text-xl font-serif font-normal text-stone-900">Personalisasi Desain</h3>
				<p class="text-xs text-stone-500 leading-relaxed font-sans">
					Pilih tema favorit Anda, atur galeri foto, aktifkan musik latar, dan sesuaikan nomor
					rekening angpao digital.
				</p>
			</div>

			<!-- Step 3 -->
			<div
				class="flex flex-col items-center text-center space-y-6 group relative p-8 rounded-[2rem] bg-white/80 border border-stone-200/80 shadow-xs hover:shadow-2xl hover:border-emerald-900/30 transition-all duration-500 hover:-translate-y-1"
			>
				<span class="font-serif italic text-4xl text-emerald-800 font-normal">03</span>
				<div
					class="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#121815] text-emerald-200 shadow-md group-hover:scale-105 transition-transform"
				>
					<Share2 class="h-7 w-7 stroke-[1.5]" />
				</div>
				<h3 class="text-xl font-serif font-normal text-stone-900">Sebarkan Undangan</h3>
				<p class="text-xs text-stone-500 leading-relaxed font-sans">
					Salin tautan unik undangan Anda dan bagikan ke kerabat terdekat melalui WhatsApp atau
					media sosial.
				</p>
			</div>
		</div>
	</div>
</section>
