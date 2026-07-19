<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { TextOverrideService, StyleOverrideService } from '$lib/services/index.js';
	import type { StyleOverride, Project } from '$lib/types/models.js';
	import { getThemeManifest } from '$lib/theme-engine/registry.js';
	import { AVAILABLE_FONTS, type FontFamilyOption } from '$lib/theme-engine/constants/fonts.js';
	import type { TextSlotConfig } from '$lib/theme-engine/types.js';
	import {
		type TextEditState,
		initTextEdits,
		buildTextPayload,
		resetToDefault
	} from '$lib/theme-engine/helpers/text-edit-state.js';
	import {
		Loader2,
		Bold,
		Italic,
		Underline,
		Type,
		Palette,
		AlignLeft,
		AlignCenter,
		AlignRight,
		ChevronDown,
		ChevronUp,
		RotateCcw
	} from '@lucide/svelte';
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

	// ── State (using shared factory) ──

	let textEdits = $state<Record<string, TextEditState>>({});
	let styleEdits = $state<Record<string, Record<string, string>>>({});

	// ── Section grouping ──

	interface SectionGroup {
		name: string | null;
		slots: [string, TextSlotConfig][];
	}

	let collapsedSections = $state<Record<string, boolean>>({});

	let sectionGroups = $derived.by((): SectionGroup[] => {
		const entries = Object.entries(textSlots);
		const sectionMap = new Map<string | null, [string, TextSlotConfig][]>();

		for (const [key, config] of entries) {
			const section = config.section ?? null;
			if (!sectionMap.has(section)) {
				sectionMap.set(section, []);
			}
			sectionMap.get(section)!.push([key, config]);
		}

		const groups: SectionGroup[] = [];
		for (const [name, slots] of sectionMap) {
			groups.push({ name, slots });
		}
		return groups;
	});

	// ── Initialize edit state (single call to shared factory) ──

	$effect(() => {
		if (project) {
			textEdits = initTextEdits(textSlots, project.text_overrides);

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

	// ── Helpers ──

	function getInputType(config: TextSlotConfig): 'short' | 'long' {
		if (config.inputType) return config.inputType;
		return (config.defaultValue || '').length > 50 ? 'long' : 'short';
	}

	function getFontLabel(value: string): string {
		if (!value) return 'Default Tema';
		const found = AVAILABLE_FONTS.find((f: FontFamilyOption) => f.value === value);
		return found ? found.label : value;
	}

	function toggleSection(name: string) {
		collapsedSections[name] = !collapsedSections[name];
	}

	function handleResetSlot(key: string) {
		textEdits[key] = resetToDefault(textSlots[key]);
	}

	function handleResetStyleSlot(key: string) {
		styleEdits[key] = { ...styleSlots[key].properties };
	}

	// ── Save (uses shared buildTextPayload) ──

	async function handleSave() {
		saving = true;
		try {
			const txtPayload = buildTextPayload(textEdits, textSlots);

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

			if (project) {
				project.text_overrides = txtPayload.map((p) => ({
					...p,
					id: 0,
					project_id: project.id
				}));
				project.style_overrides = stlPayload.map((p) => ({
					...p,
					id: 0,
					project_id: project.id
				})) as StyleOverride[];
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
			<Tabs.Content value="text" class="space-y-5 pb-6">
				{#if Object.keys(textSlots).length === 0}
					<div class="text-center py-10 text-muted-foreground text-sm">
						Tema ini tidak memiliki slot teks yang bisa dikustomisasi.
					</div>
				{:else}
					{#each sectionGroups as group}
						{#if group.name}
							<!-- Grouped Section -->
							<div
								class="border border-stone-200/60 rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden"
							>
								<button
									class="w-full flex items-center justify-between px-5 py-4 bg-stone-50/80 hover:bg-stone-100/80 transition-colors cursor-pointer"
									onclick={() => toggleSection(group.name!)}
								>
									<span class="font-bold text-stone-700 tracking-wide text-sm uppercase"
										>{group.name}</span
									>
									{#if collapsedSections[group.name]}
										<ChevronDown class="h-4 w-4 text-stone-400" />
									{:else}
										<ChevronUp class="h-4 w-4 text-stone-400" />
									{/if}
								</button>

								{#if !collapsedSections[group.name!]}
									<div class="p-4 space-y-4">
										{#each group.slots as [key, config]}
											{@render slotEditor(key, config)}
										{/each}
									</div>
								{/if}
							</div>
						{:else}
							<!-- Standalone Slots -->
							{#each group.slots as [key, config]}
								<div
									id="slot-edit-{key}"
									class="p-5 border border-stone-200/60 rounded-2xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300"
								>
									{@render slotEditor(key, config)}
								</div>
							{/each}
						{/if}
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
							<div class="flex items-center justify-between mb-4">
								<Label class="block font-semibold text-stone-800 tracking-wide">{config.label}</Label>
								<Button
									variant="ghost"
									size="sm"
									class="h-7 px-2 text-xs text-stone-400 hover:text-stone-700 gap-1"
									onclick={() => handleResetStyleSlot(key)}
								>
									<RotateCcw class="h-3 w-3" />
									Reset
								</Button>
							</div>
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

<!-- ── Reusable slot editor snippet ── -->
{#snippet slotEditor(key: string, config: TextSlotConfig)}
	<div id="slot-edit-{key}" class="space-y-3">
		<!-- Header: label + reset button -->
		<div class="flex items-center justify-between">
			<Label class="block font-semibold text-stone-800 tracking-wide">{config.label}</Label>
			<Button
				variant="ghost"
				size="sm"
				class="h-7 px-2 text-xs text-stone-400 hover:text-stone-700 gap-1"
				onclick={() => handleResetSlot(key)}
			>
				<RotateCcw class="h-3 w-3" />
				Reset
			</Button>
		</div>

		{#if textEdits[key]}
			<!-- Text input -->
			{#if getInputType(config) === 'long'}
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

			<!-- Formatting toolbar -->
			<div class="flex flex-wrap items-center gap-2">
				<!-- Bold / Italic / Underline toggles -->
				<div class="flex items-center gap-1">
					<Button
						variant={textEdits[key].bold ? 'default' : 'outline'}
						size="icon"
						class="h-8 w-8 shrink-0 {textEdits[key].bold
							? 'bg-indigo-600 text-white hover:bg-indigo-700'
							: 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'} transition-colors"
						onclick={() => (textEdits[key].bold = !textEdits[key].bold)}
					>
						<Bold class="h-3.5 w-3.5" />
					</Button>
					<Button
						variant={textEdits[key].italic ? 'default' : 'outline'}
						size="icon"
						class="h-8 w-8 shrink-0 {textEdits[key].italic
							? 'bg-indigo-600 text-white hover:bg-indigo-700'
							: 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'} transition-colors"
						onclick={() => (textEdits[key].italic = !textEdits[key].italic)}
					>
						<Italic class="h-3.5 w-3.5" />
					</Button>
					<Button
						variant={textEdits[key].underline ? 'default' : 'outline'}
						size="icon"
						class="h-8 w-8 shrink-0 {textEdits[key].underline
							? 'bg-indigo-600 text-white hover:bg-indigo-700'
							: 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'} transition-colors"
						onclick={() => (textEdits[key].underline = !textEdits[key].underline)}
					>
						<Underline class="h-3.5 w-3.5" />
					</Button>
				</div>

				<!-- Separator -->
				<div class="w-px h-6 bg-stone-200 mx-1"></div>

				<!-- Text Alignment -->
				<div class="flex items-center gap-1">
					<Button
						variant={textEdits[key].text_align === 'left' ? 'default' : 'outline'}
						size="icon"
						class="h-8 w-8 shrink-0 {textEdits[key].text_align === 'left'
							? 'bg-indigo-600 text-white hover:bg-indigo-700'
							: 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'} transition-colors"
						onclick={() =>
							(textEdits[key].text_align = textEdits[key].text_align === 'left' ? '' : 'left')}
					>
						<AlignLeft class="h-3.5 w-3.5" />
					</Button>
					<Button
						variant={textEdits[key].text_align === 'center' ? 'default' : 'outline'}
						size="icon"
						class="h-8 w-8 shrink-0 {textEdits[key].text_align === 'center'
							? 'bg-indigo-600 text-white hover:bg-indigo-700'
							: 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'} transition-colors"
						onclick={() =>
							(textEdits[key].text_align = textEdits[key].text_align === 'center' ? '' : 'center')}
					>
						<AlignCenter class="h-3.5 w-3.5" />
					</Button>
					<Button
						variant={textEdits[key].text_align === 'right' ? 'default' : 'outline'}
						size="icon"
						class="h-8 w-8 shrink-0 {textEdits[key].text_align === 'right'
							? 'bg-indigo-600 text-white hover:bg-indigo-700'
							: 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'} transition-colors"
						onclick={() =>
							(textEdits[key].text_align = textEdits[key].text_align === 'right' ? '' : 'right')}
					>
						<AlignRight class="h-3.5 w-3.5" />
					</Button>
				</div>
			</div>

			<!-- Font selectors row -->
			<div class="flex flex-wrap items-center gap-2 pt-1">
				<!-- Font Family selector with preview -->
				<Select.Root
					type="single"
					value={textEdits[key].font_family || undefined}
					onValueChange={(v) => (textEdits[key].font_family = v ?? '')}
				>
					<Select.Trigger class="h-9 w-[180px] text-xs bg-stone-50 border-stone-200">
						<span
							class="truncate"
							style={textEdits[key].font_family
								? `font-family: '${textEdits[key].font_family}', sans-serif`
								: ''}
						>
							{getFontLabel(textEdits[key].font_family)}
						</span>
					</Select.Trigger>
					<Select.Content class="max-h-[240px]">
						<Select.Item value="">Gunakan font default</Select.Item>
						{#each AVAILABLE_FONTS as font (font.value)}
							<Select.Item value={font.value}>
								<span style="font-family: '{font.value}', sans-serif">{font.label}</span>
							</Select.Item>
						{/each}
					</Select.Content>
				</Select.Root>
			</div>
		{/if}
	</div>
{/snippet}
