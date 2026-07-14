<script lang="ts">
	let { class: className = '', textClass = 'text-2xl' } = $props();
</script>

<div class="flex items-center gap-2 {className}">
	<img src="/logo.png" alt="Momenu Logo" class="w-8 h-8 object-contain rounded-lg" />
	<span
		class="font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent {textClass}"
	>
		MOMENU
	</span>
</div>
