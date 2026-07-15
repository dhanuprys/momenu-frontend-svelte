<script lang="ts">
	import RegisterForm from '$lib/components/auth/register-form.svelte';
	import { authState } from '$lib/stores/auth.svelte.js';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';

	$effect(() => {
		if (authState.isInitialized && authState.isAuthenticated) {
			goto('/app');
		}
	});
</script>

<div
	class="bg-background md:bg-muted flex min-h-svh flex-col items-center justify-center p-0 md:p-10"
>
	<div class="w-full max-w-sm md:max-w-3xl">
		<RegisterForm />
	</div>
</div>
