<script lang="ts">
	import type { InvitationData } from '$lib/types/index.js';
	import { MailOpen } from '@lucide/svelte';
	import { fly } from 'svelte/transition';

	let { invitationData }: { invitationData: InvitationData } = $props();

	let isOpened = $derived(invitationData.coverState.isOpened());

	function handleOpen() {
		invitationData.coverState.open();
	}
</script>

<!-- Cover Gate Overlay -->
{#if !isOpened}
	<div
		out:fly={{ y: '-100%', duration: 1000 }}
		class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground"
	>
		<!-- Background graphic or color can go here -->
		<div
			class="absolute inset-0 bg-linear-to-b from-primary/5 to-background pointer-events-none"
		></div>

		<div
			class="z-10 flex flex-col items-center text-center p-6 space-y-8 animate-in fade-in zoom-in duration-700"
		>
			<div class="space-y-4">
				<p class="text-sm uppercase tracking-widest text-muted-foreground">
					Undangan {invitationData.eventType.replace('_', ' ')}
				</p>
				<h1 class="text-4xl md:text-5xl lg:text-6xl font-serif">
					{invitationData.project.title}
				</h1>
			</div>

			<div class="space-y-4">
				<p class="text-muted-foreground">Kepada Yth. Bapak/Ibu/Saudara/i</p>
				<div
					class="inline-block px-6 py-3 bg-muted/50 rounded-xl border border-muted-foreground/20"
				>
					<p class="text-xl md:text-2xl font-medium">
						{invitationData.guestName || 'Tamu Undangan'}
					</p>
				</div>
			</div>

			<button
				class="mt-8 inline-flex items-center justify-center px-8 py-3.5 bg-primary text-primary-foreground font-medium rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
				onclick={handleOpen}
			>
				<MailOpen class="w-5 h-5 mr-2" />
				Buka Undangan
			</button>
		</div>
	</div>
{/if}
