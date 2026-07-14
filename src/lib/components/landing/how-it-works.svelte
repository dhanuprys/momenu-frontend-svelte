<script lang="ts">
	import { UserPlus, Wand2, Share2 } from '@lucide/svelte';
</script>

<section id="cara-kerja" class="py-24 bg-background">
	<div class="container mx-auto max-w-7xl px-4 md:px-8">
		<div class="flex flex-col items-center text-center space-y-4 mb-16">
			<h2 class="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
				Cara Kerja yang Sederhana
			</h2>
			<p class="max-w-[42rem] text-muted-foreground sm:text-lg">
				Hanya butuh beberapa menit untuk membuat undangan impian Anda dan membagikannya ke seluruh
				tamu.
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
			<!-- Connecting Line (Desktop) -->
			<div
				class="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-border/50 -z-10"
			></div>

			<!-- Step 1 -->
			<div class="flex flex-col items-center text-center space-y-4 group">
				<div
					class="flex h-24 w-24 items-center justify-center rounded-full bg-background border-4 border-muted group-hover:border-primary/30 transition-colors"
				>
					<div
						class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"
					>
						<UserPlus class="h-8 w-8" />
					</div>
				</div>
				<h3 class="text-xl font-bold">1. Daftar & Buat Acara</h3>
				<p class="text-muted-foreground text-balance">
					Buat akun gratis dan masukkan detail dasar acara Anda seperti nama, tanggal, dan lokasi.
				</p>
			</div>

			<!-- Step 2 -->
			<div class="flex flex-col items-center text-center space-y-4 group">
				<div
					class="flex h-24 w-24 items-center justify-center rounded-full bg-background border-4 border-muted group-hover:border-primary/30 transition-colors"
				>
					<div
						class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"
					>
						<Wand2 class="h-8 w-8" />
					</div>
				</div>
				<h3 class="text-xl font-bold">2. Personalisasi Undangan</h3>
				<p class="text-muted-foreground text-balance">
					Pilih tema premium kami, sesuaikan warna, tambahkan foto, dan aktifkan fitur yang Anda
					perlukan.
				</p>
			</div>

			<!-- Step 3 -->
			<div class="flex flex-col items-center text-center space-y-4 group">
				<div
					class="flex h-24 w-24 items-center justify-center rounded-full bg-background border-4 border-muted group-hover:border-primary/30 transition-colors"
				>
					<div
						class="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary"
					>
						<Share2 class="h-8 w-8" />
					</div>
				</div>
				<h3 class="text-xl font-bold">3. Sebarkan Tautan</h3>
				<p class="text-muted-foreground text-balance">
					Salin tautan undangan dan bagikan melalui WhatsApp, media sosial, atau pesan pribadi ke
					tamu Anda.
				</p>
			</div>
		</div>
	</div>
</section>
