<script lang="ts">
	import { onMount } from 'svelte';
	import { InvitationService } from '$lib/services/index';
	import type { Guestbook } from '$lib/types/index';
	import { Loader2, MessageSquareHeart, AlertCircle } from '@lucide/svelte';
	import { fade, slide } from 'svelte/transition';

	let { slug } = $props<{ slug: string }>();

	let entries = $state<Guestbook[]>([]);
	let loadingEntries = $state(true);
	let errorEntries = $state('');

	let name = $state('');
	let message = $state('');
	let submitting = $state(false);
	let submitError = $state('');
	let submitSuccess = $state(false);

	async function loadGuestbook() {
		try {
			loadingEntries = true;
			const res = await InvitationService.getGuestbook(slug);
			entries = res.data;
		} catch (err: any) {
			errorEntries = 'Gagal memuat ucapan & doa.';
		} finally {
			loadingEntries = false;
		}
	}

	onMount(() => {
		loadGuestbook();
	});

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!name.trim() || !message.trim()) {
			submitError = 'Nama dan ucapan harus diisi.';
			return;
		}

		submitting = true;
		submitError = '';

		try {
			const newEntry = await InvitationService.submitGuestbook(slug, {
				name,
				message
			});
			entries = [newEntry, ...entries];
			submitSuccess = true;
			name = '';
			message = '';

			setTimeout(() => {
				submitSuccess = false;
			}, 3000);
		} catch (err: any) {
			submitError = err?.response?.data?.message || 'Gagal mengirim ucapan. Silakan coba lagi.';
		} finally {
			submitting = false;
		}
	}
</script>

<div class="w-full max-w-2xl mx-auto space-y-12 text-current">
	<!-- Form Section -->
	<div class="mb-12">
		<div class="text-center mb-8">
			<h3 class="text-3xl font-script tracking-tight mb-2">Ucapan & Doa</h3>
			<p class="text-sm opacity-80 font-light">Berikan ucapan dan doa restu untuk kami</p>
		</div>

		<form onsubmit={handleSubmit} class="space-y-6 max-w-md mx-auto">
			{#if submitError}
				<div
					transition:slide
					class="p-4 bg-red-500/20 text-red-200 border border-red-500/50 rounded flex items-start gap-3 text-sm"
				>
					<AlertCircle class="w-5 h-5 shrink-0 mt-0.5" />
					<p>{submitError}</p>
				</div>
			{/if}

			{#if submitSuccess}
				<div
					transition:slide
					class="p-4 bg-emerald-500/20 text-emerald-200 border border-emerald-500/50 rounded flex items-start gap-3 text-sm"
				>
					<MessageSquareHeart class="w-5 h-5 shrink-0 mt-0.5" />
					<p>Terima kasih atas ucapan dan doa Anda!</p>
				</div>
			{/if}

			<div class="space-y-2">
				<label for="gb-name" class="block text-sm font-medium opacity-90">Nama Lengkap</label>
				<input
					type="text"
					id="gb-name"
					bind:value={name}
					disabled={submitting}
					class="w-full px-4 py-3 border border-current rounded-sm bg-transparent focus:bg-white/10 focus:outline-none transition-all text-sm placeholder-current placeholder-opacity-50"
					placeholder="Masukkan nama Anda"
				/>
			</div>

			<div class="space-y-2">
				<label for="gb-message" class="block text-sm font-medium opacity-90">Ucapan & Doa</label>
				<textarea
					id="gb-message"
					rows="4"
					bind:value={message}
					disabled={submitting}
					class="w-full px-4 py-3 border border-current rounded-sm bg-transparent focus:bg-white/10 focus:outline-none transition-all text-sm placeholder-current placeholder-opacity-50 resize-none"
					placeholder="Tuliskan ucapan dan doa untuk kedua mempelai..."></textarea>
			</div>

			<button
				type="submit"
				disabled={submitting}
				class="w-full flex items-center justify-center gap-2 py-4 px-4 border border-current bg-transparent hover:bg-white/10 transition-colors rounded-sm font-medium uppercase tracking-widest text-xs disabled:opacity-50"
			>
				{#if submitting}
					<Loader2 class="w-4 h-4 animate-spin" />
					<span>Mengirim...</span>
				{:else}
					Kirim Ucapan
				{/if}
			</button>
		</form>
	</div>

	<!-- Feed Section -->
	<div class="space-y-6">
		<h4 class="text-xl font-light text-center mb-8 uppercase tracking-[0.2em] opacity-80">
			Pesan Diterima
		</h4>

		{#if loadingEntries}
			<div class="flex justify-center py-8">
				<Loader2 class="w-8 h-8 animate-spin opacity-50" />
			</div>
		{:else if errorEntries}
			<div class="text-center py-8 text-red-500 opacity-80">
				<p>{errorEntries}</p>
			</div>
		{:else if entries.length === 0}
			<div
				class="text-center py-12 border border-dashed border-current border-opacity-30 rounded-sm"
			>
				<MessageSquareHeart class="w-12 h-12 mx-auto mb-3 opacity-30" />
				<p class="opacity-70 font-light">Belum ada ucapan. Jadilah yang pertama!</p>
			</div>
		{:else}
			<div class="space-y-6 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
				{#each entries as entry (entry.id)}
					<div
						class="p-6 border border-current border-opacity-20 rounded-sm bg-black/5 hover:bg-black/10 transition-colors"
					>
						<div class="flex justify-between items-start mb-3">
							<h5 class="font-medium text-lg">{entry.name}</h5>
							<span class="text-xs opacity-60">
								{new Date(entry.created_at).toLocaleDateString('id-ID', {
									day: 'numeric',
									month: 'short',
									year: 'numeric'
								})}
							</span>
						</div>
						<p class="text-sm opacity-90 leading-relaxed whitespace-pre-wrap">{entry.message}</p>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>

<style>
	/* Custom Scrollbar for the feed */
	.custom-scrollbar::-webkit-scrollbar {
		width: 4px;
	}
	.custom-scrollbar::-webkit-scrollbar-track {
		background: transparent;
	}
	.custom-scrollbar::-webkit-scrollbar-thumb {
		background: currentColor;
		opacity: 0.3;
		border-radius: 4px;
	}
</style>
