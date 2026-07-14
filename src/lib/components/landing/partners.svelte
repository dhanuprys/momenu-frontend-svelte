<script lang="ts">
	import { Hexagon, Triangle, Circle, Square } from '@lucide/svelte';
</script>

<section class="py-12 md:py-16 bg-muted/30 border-y border-border/40">
	<div class="container mx-auto px-4 md:px-8">
		<p class="text-center text-sm font-medium text-muted-foreground mb-8 tracking-wider uppercase">
			Bekerja sama dengan mitra terbaik
		</p>

		<div
			class="flex flex-wrap justify-center items-center gap-x-12 gap-y-8 md:gap-x-24 opacity-60 grayscale hover:grayscale-0 transition-all duration-500"
		>
			<!-- Partner A -->
			<div class="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors">
				<Hexagon class="h-8 w-8" />
				<span class="text-xl font-bold tracking-tight font-serif">Partner A</span>
			</div>

			<!-- Partner B -->
			<div class="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors">
				<Triangle class="h-8 w-8" />
				<span class="text-xl font-bold tracking-tight font-serif">Partner B</span>
			</div>

			<!-- Partner C -->
			<div class="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors">
				<Circle class="h-8 w-8" />
				<span class="text-xl font-bold tracking-tight font-serif">Partner C</span>
			</div>

			<!-- Partner D -->
			<div class="flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors">
				<Square class="h-8 w-8" />
				<span class="text-xl font-bold tracking-tight font-serif">Partner D</span>
			</div>
		</div>
	</div>
</section>
