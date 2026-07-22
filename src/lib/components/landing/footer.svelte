<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { ArrowRight, Heart } from '@lucide/svelte';
	import AppLogo from '$lib/components/brand/app-logo.svelte';
</script>

<footer class="border-t border-emerald-900/40 bg-[#121815] text-stone-300 pt-20 pb-10 select-none">
	<!-- Pre-footer CTA -->
	<div class="container mx-auto max-w-6xl px-4 md:px-8 mb-20">
		<div
			class="relative overflow-hidden rounded-[2.5rem] bg-[#1a221e] border border-emerald-900/40 px-8 py-16 text-center sm:px-16 sm:py-20 shadow-2xl"
		>
			<!-- Ambient Glow -->
			<div
				class="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"
			></div>

			<div class="relative z-10 flex flex-col items-center space-y-6">
				<span class="text-xs uppercase tracking-[0.3em] font-semibold text-emerald-300"
					>START NOW</span
				>
				<h2
					class="text-3xl sm:text-4xl md:text-5xl font-serif font-normal text-emerald-100 max-w-2xl text-balance"
				>
					Siap Mewujudkan Hari Spesial Anda?
				</h2>
				<p
					class="mx-auto max-w-xl text-sm md:text-base text-stone-400 font-sans leading-relaxed text-balance"
				>
					Bergabung dengan pasangan yang telah mengabadikan momen berharga mereka secara elegan
					bersama Momenu.
				</p>
				<Button
					size="lg"
					class="h-14 px-10 text-xs uppercase tracking-widest font-bold rounded-full bg-linear-to-r from-emerald-400 via-emerald-300 to-teal-300 text-stone-950 hover:opacity-95 shadow-xl transition-all"
					href="/register"
				>
					<span>Mulai Sekarang</span>
					<ArrowRight class="ml-3 h-4 w-4" />
				</Button>
			</div>
		</div>
	</div>

	<!-- Main Footer Links -->
	<div class="container mx-auto max-w-6xl px-4 md:px-8">
		<div class="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">
			<div class="col-span-2 space-y-4">
				<AppLogo textClass="text-xl font-serif italic text-emerald-300" />
				<p class="max-w-xs text-xs text-stone-400 leading-relaxed font-sans">
					Platform undangan digital eksklusif untuk membagikan momen bahagia Anda dalam kesempurnaan
					berestetika tinggi.
				</p>
			</div>
			<div>
				<h3 class="font-serif font-normal text-emerald-100 text-base mb-4">Navigasi</h3>
				<ul class="space-y-3 text-xs uppercase tracking-wider text-stone-400 font-sans">
					<li>
						<a href="/explore" class="hover:text-emerald-300 transition-colors">Koleksi Tema</a>
					</li>
					<li>
						<a href="/#fitur" class="hover:text-emerald-300 transition-colors">Fitur Presisi</a>
					</li>
					<li>
						<a href="/#cara-kerja" class="hover:text-emerald-300 transition-colors">Cara Kerja</a>
					</li>
					<li>
						<a href="/#akses" class="hover:text-emerald-300 transition-colors">Akses Eksklusif</a>
					</li>
				</ul>
			</div>
			<div>
				<h3 class="font-serif font-normal text-emerald-100 text-base mb-4">Informasi</h3>
				<ul class="space-y-3 text-xs uppercase tracking-wider text-stone-400 font-sans">
					<li>
						<a href="/explore" class="hover:text-emerald-300 transition-colors">Jelajahi Katalog</a>
					</li>
					<li><a href="/login" class="hover:text-emerald-300 transition-colors">Masuk Akun</a></li>
					<li>
						<a href="/register" class="hover:text-emerald-300 transition-colors">Daftar Akun Baru</a
						>
					</li>
				</ul>
			</div>
		</div>

		<div
			class="flex flex-col md:flex-row items-center justify-between border-t border-stone-800/80 pt-8 text-xs text-stone-500 font-sans"
		>
			<p>© {new Date().getFullYear()} Momenu Exclusive Invitation Platform. All rights reserved.</p>
			<p class="flex items-center mt-4 md:mt-0 text-stone-400">
				Crafted with <Heart class="mx-1.5 h-3.5 w-3.5 text-emerald-400 fill-emerald-400" /> for Your Special
				Moments
			</p>
		</div>
	</div>
</footer>
