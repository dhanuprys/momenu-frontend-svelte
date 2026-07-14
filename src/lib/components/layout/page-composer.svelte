<script lang="ts">
	import type { Snippet } from 'svelte';
	let {
		children,
		actions,
		title,
		description,
		class: className = ''
	} = $props<{
		children: Snippet;
		actions?: Snippet;
		title?: string;
		description?: string;
		class?: string;
	}>();
</script>

<div class="flex flex-1 flex-col gap-6 p-4 lg:p-8 w-full max-w-7xl mx-auto {className}">
	{#if title || description || actions}
		<div class="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
			<div>
				{#if title}
					<h1 class="text-3xl font-bold tracking-tight">{title}</h1>
				{/if}
				{#if description}
					<p class="text-muted-foreground mt-2">{description}</p>
				{/if}
			</div>
			{#if actions}
				<div class="flex items-center gap-2 shrink-0">
					{@render actions()}
				</div>
			{/if}
		</div>
	{/if}
	{@render children()}
</div>
