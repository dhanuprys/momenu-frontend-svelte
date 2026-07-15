<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import {
		FieldGroup,
		Field,
		FieldLabel,
		FieldDescription,
		FieldSeparator
	} from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn } from '$lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';
	import { AuthService } from '$lib/services/index.js';
	import { authState } from '$lib/stores/auth.svelte.js';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { Loader2 } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { config } from '$lib/config';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let turnstileToken = $state('');
	let turnstileWidgetId: any = $state(null);

	onMount(() => {
		const initTurnstile = () => {
			if ((window as any).turnstile) {
				turnstileWidgetId = (window as any).turnstile.render('#turnstile-container-login', {
					sitekey: config.TURNSTILE_SITE_KEY,
					theme: 'light',
					size: 'flexible',
					callback: function (token: string) {
						turnstileToken = token;
					},
					'error-callback': function () {
						toast.error('Gagal memuat sistem keamanan.');
					}
				});
			} else {
				setTimeout(initTurnstile, 100);
			}
		};
		initTurnstile();
	});

	let { class: className, ...restProps }: HTMLAttributes<HTMLDivElement> = $props();

	const id = $props.id();

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!email || !password) return;
		if (!turnstileToken) {
			toast.error('Harap selesaikan verifikasi keamanan.');
			return;
		}

		loading = true;
		try {
			const res = await AuthService.login({ email, password, turnstile_token: turnstileToken });
			authState.setSession(res.user, res.token, res.refresh_token);
			toast.success('Login berhasil!');

			const isNewUser = new Date().getTime() - new Date(res.user.created_at).getTime() < 60000;
			if (isNewUser) {
				goto('/app/project/new');
			} else {
				goto('/app');
			}
		} catch (error: any) {
			toast.error(error.response?.data?.message || 'Gagal masuk');
			if ((window as any).turnstile && turnstileWidgetId !== null) {
				(window as any).turnstile.reset(turnstileWidgetId);
				turnstileToken = '';
			}
		} finally {
			loading = false;
		}
	}
</script>

<div class={cn('flex flex-col gap-6', className)} {...restProps}>
	<Card.Root
		class="overflow-hidden p-0 border-0 shadow-none rounded-none md:border md:shadow-sm md:rounded-xl bg-transparent md:bg-card"
	>
		<Card.Content class="grid p-0 md:grid-cols-2">
			<form class="p-6 md:p-8" onsubmit={handleSubmit}>
				<FieldGroup>
					<div class="flex flex-col items-center gap-2 text-center py-10">
						<h1 class="text-2xl font-bold">MOMENU</h1>
						<p class="text-muted-foreground text-balance">Masuk ke akun Anda untuk melanjutkan</p>
					</div>
					<Field>
						<FieldLabel for="email-{id}">Email</FieldLabel>
						<Input
							id="email-{id}"
							type="email"
							placeholder="m@example.com"
							required
							bind:value={email}
							disabled={loading}
						/>
					</Field>
					<Field>
						<div class="flex items-center">
							<FieldLabel for="password-{id}">Password</FieldLabel>
							<a href="##" class="ms-auto text-sm underline-offset-2 hover:underline">
								Lupa password Anda?
							</a>
						</div>
						<Input
							id="password-{id}"
							type="password"
							required
							bind:value={password}
							disabled={loading}
						/>
					</Field>
					<Field>
						<div id="turnstile-container-login" class="w-full flex justify-center py-2"></div>
						<Button type="submit" class="w-full" disabled={loading}>
							{#if loading}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" /> Memproses...
							{:else}
								Masuk
							{/if}
						</Button>
					</Field>
					<FieldSeparator class="*:data-[slot=field-separator-content]:bg-card">
						Atau lanjutkan dengan
					</FieldSeparator>
					<Field class="grid grid-cols-1 gap-4">
						<Button
							variant="outline"
							type="button"
							class="w-full"
							onclick={AuthService.getGoogleLoginURL}
						>
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" class="mr-2 h-4 w-4">
								<path
									fill="#EA4335"
									d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
								/>
								<path
									fill="#4285F4"
									d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
								/>
								<path
									fill="#FBBC05"
									d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
								/>
								<path
									fill="#34A853"
									d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
								/>
								<path fill="none" d="M0 0h48v48H0z" />
							</svg>
							Masuk dengan Google
						</Button>
					</Field>
					<FieldDescription class="text-center">
						Belum punya akun? <a href="/register" class="underline hover:text-primary">Buat akun</a>
					</FieldDescription>
				</FieldGroup>
			</form>
			<div class="bg-muted relative hidden md:block">
				<img
					src="/placeholder.svg"
					alt="placeholder"
					class="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
				/>
			</div>
		</Card.Content>
	</Card.Root>
	<FieldDescription class="px-6 text-center">
		Dengan masuk, Anda menyetujui <a href="##" class="underline hover:text-primary"
			>Syarat Layanan</a
		>
		dan
		<a href="##" class="underline hover:text-primary">Kebijakan Privasi</a> kami.
	</FieldDescription>
</div>
