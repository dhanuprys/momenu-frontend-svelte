<script lang="ts">
	import { CalendarCheck, MessageSquareHeart, Gift, Video, Palette } from '@lucide/svelte';
	import * as Card from '$lib/components/ui/card/index.js';
</script>

<section id="fitur" class="py-24 bg-muted/30">
	<div class="container mx-auto max-w-7xl px-4 md:px-8">
		<div class="flex flex-col items-center text-center space-y-4 mb-16">
			<h2 class="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
				Fitur Premium Tanpa Kompromi
			</h2>
			<p class="max-w-2xl text-muted-foreground sm:text-lg">
				Semua yang Anda butuhkan untuk mengelola acara dengan sempurna, dirancang dengan keindahan
				dan kemudahan penggunaan.
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<!-- Large Feature -->
			<Card.Root
				class="md:col-span-2 overflow-hidden border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:shadow-md hover:border-primary/20 group"
			>
				<Card.Header class="pb-0">
					<div
						class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform"
					>
						<CalendarCheck class="h-6 w-6" />
					</div>
					<Card.Title class="text-2xl">Manajemen RSVP Cerdas</Card.Title>
					<Card.Description class="text-base mt-2">
						Pantau kehadiran tamu secara real-time. Dapatkan notifikasi saat tamu mengonfirmasi
						kehadiran, lengkap dengan preferensi makanan dan jumlah pengikut.
					</Card.Description>
				</Card.Header>
				<Card.Content class="mt-6 flex justify-end">
					<div
						class="h-40 w-full sm:w-3/4 rounded-tl-xl bg-muted/80 border-t border-l border-border/50 overflow-hidden relative"
					>
						<div class="absolute inset-4 flex flex-col gap-3">
							<div
								class="h-8 w-full bg-background rounded-md shadow-sm border border-border/50"
							></div>
							<div
								class="h-8 w-3/4 bg-background rounded-md shadow-sm border border-border/50"
							></div>
							<div
								class="h-8 w-5/6 bg-background rounded-md shadow-sm border border-border/50"
							></div>
						</div>
					</div>
				</Card.Content>
			</Card.Root>

			<!-- Small Feature -->
			<Card.Root
				class="overflow-hidden border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:shadow-md hover:border-primary/20 group flex flex-col"
			>
				<Card.Header>
					<div
						class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform"
					>
						<Gift class="h-6 w-6" />
					</div>
					<Card.Title class="text-xl">Amplop Digital</Card.Title>
					<Card.Description class="text-base mt-2">
						Terima hadiah dan angpao digital langsung ke rekening Anda dengan aman dan praktis,
						tanpa ribet.
					</Card.Description>
				</Card.Header>
				<div class="mt-auto flex-grow bg-gradient-to-t from-primary/5 to-transparent h-24"></div>
			</Card.Root>

			<!-- Medium Feature -->
			<Card.Root
				class="overflow-hidden border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:shadow-md hover:border-primary/20 group"
			>
				<Card.Header>
					<div
						class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform"
					>
						<MessageSquareHeart class="h-6 w-6" />
					</div>
					<Card.Title class="text-xl">Buku Tamu Interaktif</Card.Title>
					<Card.Description class="text-base mt-2">
						Kumpulkan doa, harapan, dan ucapan selamat dari orang terdekat. Tampilkan secara live di
						layar acara Anda.
					</Card.Description>
				</Card.Header>
			</Card.Root>

			<!-- Medium Feature -->
			<Card.Root
				class="overflow-hidden border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:shadow-md hover:border-primary/20 group"
			>
				<Card.Header>
					<div
						class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform"
					>
						<Video class="h-6 w-6" />
					</div>
					<Card.Title class="text-xl">Integrasi Live Stream</Card.Title>
					<Card.Description class="text-base mt-2">
						Sematkan tautan YouTube atau Zoom langsung di undangan. Bagikan momen untuk tamu yang
						tidak bisa hadir fisik.
					</Card.Description>
				</Card.Header>
			</Card.Root>

			<!-- Medium Feature -->
			<Card.Root
				class="overflow-hidden border-border/50 bg-background/50 backdrop-blur-sm transition-all hover:shadow-md hover:border-primary/20 group"
			>
				<Card.Header>
					<div
						class="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-110 transition-transform"
					>
						<Palette class="h-6 w-6" />
					</div>
					<Card.Title class="text-xl">Tema Premium & Kustomisasi</Card.Title>
					<Card.Description class="text-base mt-2">
						Pilih dari puluhan desain menawan dan sesuaikan warna, font, serta musik latar agar
						sesuai dengan nuansa acara Anda.
					</Card.Description>
				</Card.Header>
			</Card.Root>
		</div>
	</div>
</section>
