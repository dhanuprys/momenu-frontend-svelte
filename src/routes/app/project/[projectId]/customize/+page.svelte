<script lang="ts">
	import { page } from '$app/stores';
	import {
		ProjectService,
		TextOverrideService,
		StyleOverrideService
	} from '$lib/services/index.js';
	import type { Project } from '$lib/types/models.js';
	import { getThemeManifest } from '$lib/themes/theme-registry.js';
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Skeleton } from '$lib/components/ui/skeleton/index.js';
	import { toast } from 'svelte-sonner';
	import { Paintbrush, Loader2, Bold, Italic, Save } from '@lucide/svelte';
	import PageComposer from '$lib/components/layout/page-composer.svelte';

	let projectId = $derived($page.params.projectId!);
	let project = $state<Project | null>(null);
	let loading = $state(true);
	let saving = $state(false);

	let manifest = $derived(project ? getThemeManifest(project.theme_id) : null);
	let textSlots = $derived(manifest?.textSlots || {});
	let styleSlots = $derived(manifest?.styleSlots || {});

	let textEdits = $state<Record<string, { value: string; bold: boolean; italic: boolean }>>({});
	let styleEdits = $state<Record<string, Record<string, string>>>({});

	let isDirty = $state(false);

	onMount(async () => {
		await loadData();
	});

	async function loadData() {
		loading = true;
		try {
			project = await ProjectService.get(projectId);

			// Init text edits
			const initialText: typeof textEdits = {};
			for (const key of Object.keys(textSlots)) {
				const existing = project.text_overrides?.find((o) => o.slot_key === key);
				if (existing) {
					initialText[key] = {
						value: existing.value,
						bold: existing.bold,
						italic: existing.italic
					};
				} else {
					initialText[key] = { value: textSlots[key].defaultValue, bold: false, italic: false };
				}
			}
			textEdits = initialText;

			// Init style edits
			const initialStyle: typeof styleEdits = {};
			for (const key of Object.keys(styleSlots)) {
				const existing = project.style_overrides?.find((o) => o.slot_key === key);
				initialStyle[key] = { ...styleSlots[key].properties };
				if (existing) {
					initialStyle[key] = { ...initialStyle[key], ...existing.properties };
				}
			}
			styleEdits = initialStyle;

			isDirty = false;
		} catch (err) {
			console.error(err);
			toast.error('Gagal memuat acara');
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		// Deep watch is tricky, so we just use a generic bind on inputs to mark dirty,
		// but since we want it automatic, let's just enable the save button.
		// Svelte 5 reactive bindings will make sure edits are updated.
	});

	async function handleSave() {
		saving = true;
		try {
			// Prepare Text Overrides
			const txtPayload = Object.entries(textEdits)
				.filter(([key, edit]) => {
					const def = textSlots[key].defaultValue;
					return edit.value !== def || edit.bold || edit.italic;
				})
				.map(([key, edit]) => ({
					slot_key: key,
					value: edit.value,
					bold: edit.bold,
					italic: edit.italic
				}));

			// Prepare Style Overrides
			const stlPayload = Object.entries(styleEdits)
				.filter(([key, edit]) => {
					const def = styleSlots[key].properties;
					for (const prop of Object.keys(edit)) {
						if (edit[prop] !== (def as any)[prop]) return true;
					}
					return false;
				})
				.map(([key, edit]) => ({
					slot_key: key,
					properties: edit
				}));

			await Promise.all([
				TextOverrideService.upsert(projectId, txtPayload),
				StyleOverrideService.upsert(projectId, stlPayload)
			]);

			toast.success('Kustomisasi berhasil disimpan');
			isDirty = false;
			await loadData(); // reload
		} catch (error) {
			console.error('Failed to save', error);
			toast.error('Gagal menyimpan perubahan');
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>Kustomisasi Tema | Momenu</title>
</svelte:head>

<PageComposer
	title="Kustomisasi Tema"
	description="Sesuaikan teks dan tampilan tema untuk acara Anda"
>
	{#snippet actions()}
		<Button onclick={handleSave} disabled={saving} size="sm" class="gap-2">
			{#if saving}
				<Loader2 class="h-4 w-4 animate-spin" />
				Menyimpan...
			{:else}
				<Save class="h-4 w-4" />
				Simpan Perubahan
			{/if}
		</Button>
	{/snippet}

	{#if loading}
		<div class="space-y-4">
			<Skeleton class="h-64 w-full rounded-xl" />
		</div>
	{:else}
		<Tabs.Root value="text" class="w-full">
			<Tabs.List class="w-full max-w-md mb-8 grid grid-cols-2">
				<Tabs.Trigger value="text">Teks Undangan</Tabs.Trigger>
				<Tabs.Trigger value="style">Tampilan & Warna</Tabs.Trigger>
			</Tabs.List>

			<Tabs.Content value="text" class="space-y-6">
				{#if Object.keys(textSlots).length === 0}
					<Card.Root>
						<Card.Content class="py-12 text-center text-muted-foreground">
							Tema ini tidak memiliki opsi kustomisasi teks.
						</Card.Content>
					</Card.Root>
				{:else}
					<Card.Root>
						<Card.Header>
							<Card.Title>Kustomisasi Teks</Card.Title>
							<Card.Description
								>Ubah teks bawaan tema sesuai dengan keinginan Anda.</Card.Description
							>
						</Card.Header>
						<Card.Content class="space-y-6">
							{#each Object.entries(textSlots) as [key, config]}
								<div class="space-y-2 pb-4 border-b last:border-0 last:pb-0">
									<Label class="font-medium text-base">{config.label}</Label>
									<div class="flex items-start gap-4">
										<div class="flex-1">
											{#if textEdits[key]}
												<Input
													bind:value={textEdits[key].value}
													oninput={() => (isDirty = true)}
													class="w-full"
												/>
											{/if}
										</div>
										<div class="flex items-center gap-2">
											<Button
												variant={textEdits[key]?.bold ? 'default' : 'outline'}
												size="icon"
												onclick={() => {
													textEdits[key].bold = !textEdits[key].bold;
													isDirty = true;
												}}
											>
												<Bold class="h-4 w-4" />
											</Button>
											<Button
												variant={textEdits[key]?.italic ? 'default' : 'outline'}
												size="icon"
												onclick={() => {
													textEdits[key].italic = !textEdits[key].italic;
													isDirty = true;
												}}
											>
												<Italic class="h-4 w-4" />
											</Button>
										</div>
									</div>
								</div>
							{/each}
						</Card.Content>
					</Card.Root>
				{/if}
			</Tabs.Content>

			<Tabs.Content value="style" class="space-y-6">
				{#if Object.keys(styleSlots).length === 0}
					<Card.Root>
						<Card.Content class="py-12 text-center text-muted-foreground">
							Tema ini tidak memiliki opsi kustomisasi tampilan.
						</Card.Content>
					</Card.Root>
				{:else}
					<Card.Root>
						<Card.Header>
							<Card.Title>Kustomisasi Tampilan</Card.Title>
							<Card.Description>Sesuaikan warna dan properti tampilan lainnya.</Card.Description>
						</Card.Header>
						<Card.Content class="space-y-6">
							<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
								{#each Object.entries(styleSlots) as [key, config]}
									<div class="p-4 bg-muted/50 rounded-xl border border-border">
										<Label class="text-base font-semibold mb-4 block">{config.label}</Label>
										<div class="space-y-4">
											{#if styleEdits[key]}
												{#each Object.keys(styleEdits[key]) as propKey}
													<div class="grid grid-cols-3 items-center gap-4">
														<Label class="text-xs uppercase text-muted-foreground text-right">
															{propKey.replace(/([A-Z])/g, ' $1').trim()}
														</Label>
														<div class="col-span-2 flex items-center gap-2">
															{#if propKey.toLowerCase().includes('color')}
																<Input
																	type="color"
																	bind:value={styleEdits[key][propKey]}
																	oninput={() => (isDirty = true)}
																	class="h-9 w-12 p-1 cursor-pointer"
																/>
															{/if}
															<Input
																type="text"
																bind:value={styleEdits[key][propKey]}
																oninput={() => (isDirty = true)}
																class="h-9 flex-1"
															/>
														</div>
													</div>
												{/each}
											{/if}
										</div>
									</div>
								{/each}
							</div>
						</Card.Content>
					</Card.Root>
				{/if}
			</Tabs.Content>
		</Tabs.Root>
	{/if}
</PageComposer>
