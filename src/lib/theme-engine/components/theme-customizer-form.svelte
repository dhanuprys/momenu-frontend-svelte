<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { TextOverrideService, StyleOverrideService } from '$lib/services/index.js';
	import type { TextOverride, StyleOverride, Project } from '$lib/types/models.js';
	import { getThemeManifest } from '$lib/theme-engine/registry.js';
	import { Loader2, Bold, Italic, Type, Palette } from '@lucide/svelte';
	import { toast } from 'svelte-sonner';
	import type { Snippet } from 'svelte';

	let {
		project,
		activeTab = $bindable('text'),
		focusSlotKey = '',
		onSaved,
		cancel
	} = $props<{
		project: Project;
		activeTab?: 'text' | 'style';
		focusSlotKey?: string;
		onSaved?: () => void;
		cancel?: Snippet;
	}>();

	let saving = $state(false);

	let manifest = $derived(project ? getThemeManifest(project.theme_id) : null);
	let textSlots = $derived(manifest?.textSlots || {});
	let styleSlots = $derived(manifest?.styleSlots || {});

	// Local state for editing
	let textEdits = $state<Record<string, { value: string; bold: boolean; italic: boolean }>>({});
	let styleEdits = $state<Record<string, Record<string, string>>>({});

	// Initialize local state
	$effect(() => {
		if (project) {
			// Init text
			const initialText: typeof textEdits = {};
			for (const key of Object.keys(textSlots)) {
				const existing = project.text_overrides?.find((o: TextOverride) => o.slot_key === key);
				if (existing) {
					initialText[key] = {
						value: existing.value,
						bold: existing.bold,
						italic: existing.italic
					};
				} else {
					initialText[key] = {
						value: textSlots[key].defaultValue,
						bold: false,
						italic: false
					};
				}
			}
			textEdits = initialText;

			// Init style
			const initialStyle: typeof styleEdits = {};
			for (const key of Object.keys(styleSlots)) {
				const existing = project.style_overrides?.find((o: StyleOverride) => o.slot_key === key);
				initialStyle[key] = { ...styleSlots[key].properties };
				if (existing) {
					initialStyle[key] = { ...initialStyle[key], ...existing.properties };
				}
			}
			styleEdits = initialStyle;
		}
	});

	// Handle focus scroll
	$effect(() => {
		if (focusSlotKey) {
			setTimeout(() => {
				const el = document.getElementById(`slot-edit-${focusSlotKey}`);
				if (el) {
					el.scrollIntoView({ behavior: 'smooth', block: 'center' });
					el.classList.add('ring-2', 'ring-indigo-500', 'transition-all', 'duration-1000');
					setTimeout(() => el.classList.remove('ring-2', 'ring-indigo-500'), 2000);
				}
			}, 150);
		}
	});

	async function handleSave() {
		saving = true;
		try {
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
				TextOverrideService.upsert(project.id, txtPayload),
				StyleOverrideService.upsert(project.id, stlPayload)
			]);

			toast.success('Kustomisasi berhasil disimpan');

			// Update local project overrides so it reflects immediately
			if (project) {
				project.text_overrides = txtPayload.map((p) => ({ ...p, project_id: project.id }));
				project.style_overrides = stlPayload.map((p) => ({ ...p, project_id: project.id }));
			}

			if (onSaved) onSaved();
		} catch (error) {
			console.error('Failed to save overrides', error);
			toast.error('Gagal menyimpan kustomisasi');
		} finally {
			saving = false;
		}
	}
</script>

<div class="flex flex-col h-full w-full">
	<div class="flex-1 overflow-y-auto px-1 py-1">
		<Tabs.Root bind:value={activeTab} class="w-full">
			<Tabs.List class="grid w-full grid-cols-2 mb-4">
				<Tabs.Trigger value="text" class="flex items-center gap-2">
					<Type class="h-4 w-4" /> Teks
				</Tabs.Trigger>
				<Tabs.Trigger value="style" class="flex items-center gap-2">
					<Palette class="h-4 w-4" /> Tampilan
				</Tabs.Trigger>
			</Tabs.List>

			<!-- TEXT TAB -->
			<Tabs.Content value="text" class="space-y-4 pb-6">
				{#if Object.keys(textSlots).length === 0}
					<div class="text-center py-10 text-muted-foreground text-sm">
						Tema ini tidak memiliki slot teks yang bisa dikustomisasi.
					</div>
				{:else}
					{#each Object.entries(textSlots) as [key, config]}
						<div
							id="slot-edit-{key}"
							class="p-5 border border-stone-200/60 rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300"
						>
							<Label class="mb-3 block font-semibold text-stone-800 tracking-wide"
								>{config.label}</Label
							>
							<div class="flex items-start gap-3">
								<div class="flex-1">
									{#if textEdits[key]}
										{#if (config.defaultValue || '').length > 50}
											<Textarea
												bind:value={textEdits[key].value}
												class="min-h-[100px] w-full bg-stone-50 border-stone-200 focus-visible:ring-indigo-500/30 transition-all"
											/>
										{:else}
											<Input
												bind:value={textEdits[key].value}
												class="bg-stone-50 border-stone-200 focus-visible:ring-indigo-500/30 transition-all h-10"
											/>
										{/if}
									{/if}
								</div>
								<div class="flex items-center gap-1.5 shrink-0 pt-0.5">
									<Button
										variant={textEdits[key]?.bold ? 'default' : 'outline'}
										size="icon"
										class="h-9 w-9 shrink-0 {textEdits[key]?.bold
											? 'bg-indigo-600 text-white hover:bg-indigo-700'
											: 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'} transition-colors"
										onclick={() => (textEdits[key].bold = !textEdits[key].bold)}
									>
										<Bold class="h-4 w-4" />
									</Button>
									<Button
										variant={textEdits[key]?.italic ? 'default' : 'outline'}
										size="icon"
										class="h-9 w-9 shrink-0 {textEdits[key]?.italic
											? 'bg-indigo-600 text-white hover:bg-indigo-700'
											: 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'} transition-colors"
										onclick={() => (textEdits[key].italic = !textEdits[key].italic)}
									>
										<Italic class="h-4 w-4" />
									</Button>
								</div>
							</div>
						</div>
					{/each}
				{/if}
			</Tabs.Content>

			<!-- STYLE TAB -->
			<Tabs.Content value="style" class="space-y-4 pb-6">
				{#if Object.keys(styleSlots).length === 0}
					<div class="text-center py-10 text-muted-foreground text-sm">
						Tema ini tidak memiliki slot tampilan yang bisa dikustomisasi.
					</div>
				{:else}
					{#each Object.entries(styleSlots) as [key, config]}
						<div
							id="slot-edit-{key}"
							class="p-5 border border-stone-200/60 rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300"
						>
							<Label class="mb-4 block font-semibold text-stone-800 tracking-wide"
								>{config.label}</Label
							>
							<div class="grid grid-cols-1 md:grid-cols-2 gap-5">
								{#if styleEdits[key]}
									{#each Object.keys(styleEdits[key]) as propKey}
										<div class="space-y-2">
											<Label class="text-[11px] font-bold text-stone-500 uppercase tracking-wider"
												>{propKey.replace(/([A-Z])/g, ' $1').trim()}</Label
											>
											{#if propKey.toLowerCase().includes('color')}
												<div class="flex gap-3 items-center">
													<div
														class="relative flex items-center justify-center w-10 h-10 rounded-full border border-stone-200 shadow-sm overflow-hidden shrink-0 group hover:scale-105 transition-transform"
													>
														<input
															type="color"
															bind:value={styleEdits[key][propKey]}
															class="absolute -top-4 -left-4 w-20 h-20 cursor-pointer"
														/>
													</div>
													<Input
														type="text"
														bind:value={styleEdits[key][propKey]}
														class="h-10 flex-1 font-mono text-sm bg-stone-50 border-stone-200 uppercase tracking-wider focus-visible:ring-indigo-500/30 transition-all"
													/>
												</div>
											{:else}
												<Input
													type="text"
													bind:value={styleEdits[key][propKey]}
													class="h-10 bg-stone-50 border-stone-200 focus-visible:ring-indigo-500/30 transition-all"
												/>
											{/if}
										</div>
									{/each}
								{/if}
							</div>
						</div>
					{/each}
				{/if}
			</Tabs.Content>
		</Tabs.Root>
	</div>

	<div
		class="flex gap-3 flex-col sm:flex-row items-center justify-end border-t border-stone-100 pt-5 mt-auto bg-white/50"
	>
		{@render cancel?.()}
		<Button onclick={handleSave} disabled={saving} class="w-full sm:w-auto">
			{#if saving}
				<Loader2 class="mr-2 h-5 w-5 animate-spin" /> Menyimpan...
			{:else}
				Simpan Perubahan
			{/if}
		</Button>
	</div>
</div>
