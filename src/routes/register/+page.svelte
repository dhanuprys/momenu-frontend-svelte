<script lang="ts">
	import RegisterForm from '$lib/components/auth/register-form.svelte';
	import { authState } from '$lib/stores/auth.svelte';
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import SEO from '$lib/components/seo.svelte';

	$effect(() => {
		if (authState.isInitialized && authState.isAuthenticated) {
			goto('/app');
		}
	});
</script>

<SEO title="Daftar di Momenu" noindex={true} />

<div
	class="bg-background md:bg-muted flex min-h-svh flex-col items-center justify-center p-0 md:p-10"
>
	<div class="w-full max-w-sm md:max-w-3xl">
		<RegisterForm />
	</div>
</div>
