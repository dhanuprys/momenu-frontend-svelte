<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { ArrowRight, Heart } from '@lucide/svelte';
	import AppLogo from '$lib/components/brand/app-logo.svelte';
</script>

<footer class="border-t border-border/40 bg-background pt-16 pb-8">
	<!-- Pre-footer CTA -->
	<div class="container mx-auto max-w-7xl px-4 md:px-8 mb-16">
		<div
			class="relative overflow-hidden rounded-3xl bg-primary/5 px-6 py-16 text-center sm:px-12 sm:py-20 ring-1 ring-primary/10"
		>
			<!-- Decorative bloobs -->
			<div class="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-primary/20 blur-3xl"></div>
			<div class="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-accent/20 blur-3xl"></div>

			<div class="relative z-10 flex flex-col items-center space-y-6">
				<h2 class="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl text-foreground">
					Siap Merencanakan Hari Spesial Anda?
				</h2>
				<p class="mx-auto max-w-2xl text-lg text-muted-foreground">
					Bergabung dengan ribuan pasangan yang telah mempercayakan undangan digital mereka kepada
					Momenu. Mulai gratis sekarang, tanpa kartu kredit.
				</p>
				<Button size="lg" class="h-12 px-8 text-base group" href="/register">
					Mulai Sekarang
					<ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
				</Button>
			</div>
		</div>
	</div>

	<!-- Main Footer -->
	<div class="container mx-auto max-w-7xl px-4 md:px-8">
		<div class="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
			<div class="col-span-2">
				<AppLogo />
				<p class="mt-4 max-w-xs text-sm text-muted-foreground">
					Platform undangan digital premium untuk membagikan momen bahagia Anda dengan cara yang
					lebih elegan.
				</p>
			</div>
			<div>
				<h3 class="font-semibold mb-4 text-foreground">Produk</h3>
				<ul class="space-y-3 text-sm text-muted-foreground">
					<li><a href="#fitur" class="hover:text-primary transition-colors">Fitur</a></li>
					<li><a href="#tema" class="hover:text-primary transition-colors">Tema</a></li>
					<li><a href="#akses" class="hover:text-primary transition-colors">Akses</a></li>
				</ul>
			</div>
			<div>
				<h3 class="font-semibold mb-4 text-foreground">Legal</h3>
				<ul class="space-y-3 text-sm text-muted-foreground">
					<li><a href="##" class="hover:text-primary transition-colors">Syarat Ketentuan</a></li>
					<li><a href="##" class="hover:text-primary transition-colors">Kebijakan Privasi</a></li>
					<li><a href="##" class="hover:text-primary transition-colors">Bantuan</a></li>
				</ul>
			</div>
		</div>

		<div
			class="flex flex-col md:flex-row items-center justify-between border-t border-border/40 pt-8 text-sm text-muted-foreground"
		>
			<p>© {new Date().getFullYear()} Momenu. All rights reserved.</p>
			<p class="flex items-center mt-4 md:mt-0">
				Deliver with <Heart class="mx-1 h-4 w-4 text-destructive fill-destructive" /> by Our Team
			</p>
		</div>
	</div>
</footer>
