<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Check } from '@lucide/svelte';
</script>

<section id="akses" class="py-24 bg-muted/30 relative overflow-hidden">
	<!-- Background blobs -->
	<div
		class="absolute top-1/2 left-0 -translate-y-1/2 w-72 h-72 rounded-full bg-primary/5 blur-3xl -z-10"
	></div>
	<div class="absolute bottom-0 right-0 w-72 h-72 rounded-full bg-accent/5 blur-3xl -z-10"></div>

	<div class="container mx-auto max-w-7xl px-4 md:px-8">
		<div class="flex flex-col items-center text-center space-y-4 mb-16">
			<div
				class="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
			>
				<span>Akses Eksklusif</span>
			</div>
			<h2 class="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
				Gunakan Momenu Secara Gratis
			</h2>
			<p class="max-w-2xl text-muted-foreground sm:text-lg">
				Saat ini sistem kami sepenuhnya gratis. Namun, untuk menjaga kualitas layanan, pendaftaran
				dibatasi.
			</p>
		</div>

		<div class="max-w-3xl mx-auto">
			<div
				class="flex flex-col p-8 md:p-12 bg-background border-2 border-primary rounded-3xl shadow-xl shadow-primary/5 transition-all relative"
			>
				<div
					class="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground tracking-wide uppercase shadow-sm"
				>
					Early Access
				</div>

				<div class="text-center mb-8">
					<h3 class="text-2xl font-bold text-foreground">100% Gratis</h3>
					<p class="text-muted-foreground mt-3">
						Nikmati seluruh fitur premium undangan digital tanpa biaya tambahan.
					</p>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
					<div class="flex items-start gap-3 text-sm text-foreground">
						<Check class="h-5 w-5 text-primary shrink-0 mt-0.5" />
						<span>Akses ke semua tema premium</span>
					</div>
					<div class="flex items-start gap-3 text-sm text-foreground">
						<Check class="h-5 w-5 text-primary shrink-0 mt-0.5" />
						<span>Tamu dan RSVP tanpa batas</span>
					</div>
					<div class="flex items-start gap-3 text-sm text-foreground">
						<Check class="h-5 w-5 text-primary shrink-0 mt-0.5" />
						<span>Buku tamu dan ucapan</span>
					</div>
					<div class="flex items-start gap-3 text-sm text-foreground">
						<Check class="h-5 w-5 text-primary shrink-0 mt-0.5" />
						<span>Amplop digital & hadiah</span>
					</div>
				</div>

				<div class="bg-muted/40 rounded-2xl p-6 text-center border border-border/50">
					<h4 class="font-semibold text-foreground mb-2">Tertarik mencoba Momenu?</h4>
					<p class="text-sm text-muted-foreground mb-6">
						Hubungi admin kami untuk mendapatkan undangan akses dan mulai membuat undangan digital
						Anda.
					</p>
					<Button
						size="lg"
						class="w-full sm:w-auto h-12 px-8 text-base font-semibold rounded-xl"
						href="https://wa.me/6281234567890"
						target="_blank"
						rel="noreferrer"
					>
						Hubungi Admin via WhatsApp
					</Button>
				</div>
			</div>
		</div>
	</div>
</section>
