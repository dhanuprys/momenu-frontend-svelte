<script lang="ts">
	import * as Drawer from '$lib/components/ui/drawer/index.js';
	import type { Project } from '$lib/types/models.js';
	import ThemeCustomizerForm from './theme-customizer-form.svelte';
	import { Button } from '$lib/components/ui/button/index.js';

	let {
		project,
		open = $bindable(false),
		activeTab = $bindable('text'),
		focusSlotKey = '',
		onSaved
	} = $props<{
		project: Project;
		open?: boolean;
		activeTab?: 'text' | 'style';
		focusSlotKey?: string;
		onSaved: () => void;
	}>();
</script>

<Drawer.Root bind:open>
	<Drawer.Content class="h-[85vh] flex flex-col">
		<Drawer.Header class="pb-6">
			<Drawer.Title class="text-2xl font-bold text-stone-800">Kustomisasi Tema</Drawer.Title>
			<Drawer.Description class="text-stone-500 text-sm"
				>Sesuaikan teks dan tampilan tema untuk undangan ini secara real-time.</Drawer.Description
			>
		</Drawer.Header>

		<div class="flex-1 overflow-y-auto px-4 pb-4">
			<ThemeCustomizerForm
				{project}
				bind:activeTab
				{focusSlotKey}
				onSaved={() => {
					open = false;
					onSaved();
				}}
			>
				{#snippet cancel()}
					<Drawer.Close>
						<Button
							variant="outline"
							class="w-full sm:w-auto h-12 text-base font-medium border-stone-200 text-stone-700 hover:bg-stone-50 transition-colors px-8"
							>Batal</Button
						>
					</Drawer.Close>
				{/snippet}
			</ThemeCustomizerForm>
		</div>
	</Drawer.Content>
</Drawer.Root>
