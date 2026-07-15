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
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { Loader2 } from '@lucide/svelte';
	import { onMount } from 'svelte';
	import { config } from '$lib/config';
	import { authState } from '$lib/stores/auth.svelte';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let turnstileToken = $state('');
	let turnstileWidgetId: any = $state(null);

	onMount(() => {
		const initTurnstile = () => {
			if ((window as any).turnstile) {
				turnstileWidgetId = (window as any).turnstile.render('#turnstile-container', {
					sitekey: config.TURNSTILE_SITE_KEY,
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
		if (!name || !email || !password) return;
		if (!turnstileToken) {
			toast.error('Harap selesaikan verifikasi keamanan.');
			return;
		}

		loading = true;
		try {
			await AuthService.register({ name, email, password, turnstile_token: turnstileToken });
			
			// Auto-login after successful registration
			const res = await AuthService.login({ email, password });
			authState.setSession(res.user, res.token, res.refresh_token);

			toast.success('Pendaftaran berhasil!');
			goto('/app/project/new');
		} catch (error: any) {
			toast.error(error.response?.data?.message || 'Gagal mendaftar');
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
	<Card.Root class="overflow-hidden p-0 border-0 shadow-none! rounded-none md:border md:shadow-sm md:rounded-xl bg-transparent md:bg-card">
		<Card.Content class="grid p-0 md:grid-cols-2">
			<form class="p-6 md:p-8" onsubmit={handleSubmit}>
				<FieldGroup>
					<div class="flex flex-col items-center gap-2 text-center">
						<h1 class="text-2xl font-bold">Buat Akun Baru</h1>
						<p class="text-muted-foreground text-balance">
							Daftar untuk mulai merencanakan momen Anda
						</p>
					</div>
					<Field>
						<FieldLabel for="name-{id}">Nama</FieldLabel>
						<Input
							id="name-{id}"
							type="text"
							placeholder="John Doe"
							required
							bind:value={name}
							disabled={loading}
						/>
					</Field>
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
						</div>
						<Input
							id="password-{id}"
							type="password"
							required
							bind:value={password}
							disabled={loading}
							minlength={6}
						/>
					</Field>
					<Field>
						<div id="turnstile-container"></div>
					</Field>
					<Field>
						<Button type="submit" disabled={loading}>
							{#if loading}
								<Loader2 class="mr-2 h-4 w-4 animate-spin" />
								Mendaftar...
							{:else}
								Daftar
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
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="mr-2 h-4 w-4">
								<path
									d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
									fill="currentColor"
								/>
							</svg>
							Daftar dengan Google
						</Button>
					</Field>
					<FieldDescription class="text-center">
						Sudah punya akun? <a href="/masuk" class="underline hover:text-primary">Masuk</a>
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
		Dengan mendaftar, Anda menyetujui <a href="##" class="underline hover:text-primary"
			>Syarat Layanan</a
		>
		dan
		<a href="##" class="underline hover:text-primary">Kebijakan Privasi</a> kami.
	</FieldDescription>
</div>
