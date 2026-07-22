<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { authState } from '$lib/stores/auth.svelte';
	import { AuthService } from '$lib/services/index';
	import { config } from '$lib/config/index';

	onMount(async () => {
		const token = $page.url.searchParams.get('token');
		const refreshToken = $page.url.searchParams.get('refresh_token');

		if (token && refreshToken) {
			// Temporarily set token in localStorage so axios interceptor can use it for getMe()
			localStorage.setItem(config.TOKEN_KEY, token);
			localStorage.setItem(config.REFRESH_TOKEN_KEY, refreshToken);

			try {
				const user = await AuthService.getMe();
				authState.setSession(user, token, refreshToken);

				const isNewUser = new Date().getTime() - new Date(user.created_at).getTime() < 60000;
				if (isNewUser) {
					goto('/app/project/new');
				} else {
					goto('/app');
				}
			} catch (error) {
				console.error('Failed to fetch user profile', error);
				// Cleanup on failure
				localStorage.removeItem(config.TOKEN_KEY);
				localStorage.removeItem(config.REFRESH_TOKEN_KEY);
				goto('/login?error=fetch_profile_failed');
			}
		} else {
			goto('/login?error=missing_tokens');
		}
	});
</script>

<div class="flex h-screen w-full items-center justify-center">
	<div class="flex flex-col items-center gap-4">
		<div
			class="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"
		></div>
		<p class="text-muted-foreground">Memproses login Anda...</p>
	</div>
</div>
