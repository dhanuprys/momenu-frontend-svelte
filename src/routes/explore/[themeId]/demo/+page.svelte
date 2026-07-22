<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import type { Component } from 'svelte';
	import { getThemeManifest, resolveTheme } from '$lib/theme-engine/registry';
	import ThemeRenderer from '$lib/theme-engine/components/theme-renderer.svelte';
	import type { InvitationData } from '$lib/types/invitation';
	import type { Project } from '$lib/types/models';
	import { Button } from '$lib/components/ui/button/index.js';
	import { ArrowLeft, ExternalLink } from '@lucide/svelte';
	import SEO from '$lib/components/seo.svelte';
	import { createMockInvitationData } from '$lib/theme-engine/helpers/demo';

	let themeId = $derived($page.params.themeId as string);
	let manifest = $derived(getThemeManifest(themeId));
	let ThemeComponent = $state<Component | null>(null);
	let invitationData = $state<InvitationData | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let isCoverOpened = $state(false);

	onMount(async () => {
		try {
			if (!manifest) throw new Error('Manifest tidak ditemukan untuk tema ini');

			const module = await resolveTheme(themeId);
			if (!module) throw new Error('Komponen tema tidak ditemukan');
			ThemeComponent = module.default;

			// Construct mock InvitationData for the demo using the factory
			invitationData = createMockInvitationData(themeId, manifest, {
				isOpened: () => isCoverOpened,
				open: () => {
					isCoverOpened = true;
				}
			});
		} catch (e: any) {
			console.error('Failed to load demo:', e);
			error = e.message || 'Gagal memuat demo tema.';
		} finally {
			loading = false;
		}
	});
</script>

<SEO
	title={manifest ? `Demo Tema: ${manifest.name}` : 'Demo Tema'}
	description="Lihat demo interaktif dari tema undangan digital."
/>

{#if loading}
	<div class="min-h-screen flex items-center justify-center bg-stone-50">
		<div class="animate-pulse flex flex-col items-center">
			<div
				class="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"
			></div>
			<p class="text-stone-500 font-medium">Memuat Demo...</p>
		</div>
	</div>
{:else if error || !ThemeComponent || !invitationData}
	<div class="min-h-screen flex flex-col items-center justify-center bg-stone-50 p-6 text-center">
		<div class="bg-white p-8 rounded-3xl shadow-sm border border-red-100 max-w-md">
			<p class="text-red-600 font-medium mb-6">{error || 'Gagal memuat demo.'}</p>
			<Button
				href={`/explore/${themeId}`}
				class="rounded-full bg-stone-900 text-white hover:bg-stone-800"
			>
				Kembali ke Detail
			</Button>
		</div>
	</div>
{:else}
	<!-- DEMO VIEWER -->
	<div class="relative w-full h-screen overflow-hidden bg-stone-900">
		<!-- Floating Action Bar -->
		<div
			class="absolute top-0 left-0 right-0 p-4 z-50 flex items-center justify-between bg-gradient-to-b from-black/60 to-transparent pointer-events-none"
		>
			<div class="pointer-events-auto">
				<Button
					variant="outline"
					href={`/explore/${themeId}`}
					class="rounded-full bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 hover:text-white h-10 px-4"
				>
					<ArrowLeft class="w-4 h-4 mr-2" /> Kembali
				</Button>
			</div>
			<div class="pointer-events-auto flex items-center gap-3">
				<span
					class="hidden md:inline-block px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white/90 text-xs font-semibold border border-white/10"
				>
					Mode Pratinjau
				</span>
				<Button
					href={`/login?redirect=/app/project/new?themeId=${themeId}`}
					class="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground h-10 px-6 shadow-lg shadow-primary/20"
				>
					<ExternalLink class="w-4 h-4 mr-2" /> Gunakan Tema
				</Button>
			</div>
		</div>

		<!-- Actual Theme Rendering -->
		<div class="w-full h-full overflow-y-auto">
			<ThemeRenderer {invitationData} {ThemeComponent} />
		</div>
	</div>
{/if}
