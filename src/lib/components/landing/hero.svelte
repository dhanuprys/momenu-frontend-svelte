<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { ArrowRight, Sparkles } from '@lucide/svelte';
</script>

<section class="relative overflow-hidden bg-background pt-24 pb-32 md:pt-32 md:pb-40">
	<!-- Background Gradients -->
	<div
		class="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
		aria-hidden="true"
	>
		<div
			class="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-accent opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
			style="clip-path: polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)"
		></div>
	</div>

	<div class="container mx-auto max-w-7xl px-4 md:px-8 relative z-10">
		<div
			class="flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000"
		>
			<h1
				class="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl text-balance"
			>
				Bagikan Momen Bahagia Anda dengan Cara yang Lebih <span
					class="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Elegan</span
				>
			</h1>

			<p
				class="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8 text-balance"
			>
				Buat undangan digital premium untuk pernikahan, ulang tahun, dan acara spesial Anda. Kelola
				RSVP, buku tamu, dan hadiah dalam satu tempat yang indah.
			</p>

			<div class="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
				<Button size="lg" class="h-12 px-8 text-base group" href="/register">
					Buat Undangan Gratis
					<ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
				</Button>
				<Button size="lg" variant="outline" class="h-12 px-8 text-base">Lihat Demo</Button>
			</div>
		</div>

		<!-- Dashboard Mockup -->
		<div
			class="mx-auto mt-16 max-w-5xl sm:mt-24 lg:mt-32 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300 fill-mode-both"
		>
			<div
				class="relative rounded-xl bg-muted/40 p-2 ring-1 ring-inset ring-border/50 lg:rounded-2xl lg:p-4 backdrop-blur-sm"
			>
				<img
					src="/dashboard_mockup.png"
					alt="Momenu Dashboard Preview"
					width="2400"
					height="1600"
					class="rounded-md shadow-2xl ring-1 ring-border/10 w-full object-cover aspect-video bg-muted"
				/>
			</div>
		</div>
	</div>
</section>
