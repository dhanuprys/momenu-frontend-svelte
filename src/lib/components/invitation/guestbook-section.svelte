<script lang="ts">
	import { onMount } from 'svelte';
	import { InvitationService } from '$lib/services/index.js';
	import type { Guestbook } from '$lib/types/index.js';
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
			// We fetch the first 20 for the theme display
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
			// Prepend new entry
			entries = [newEntry, ...entries];
			submitSuccess = true;
			name = '';
			message = '';

			// Reset success message after 3 seconds
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

<div class="w-full max-w-2xl mx-auto space-y-12">
	<!-- Form Section -->
	<div class="bg-white p-8 rounded-sm shadow-sm border border-zinc-100">
		<div class="text-center mb-8">
			<h3 class="text-2xl font-light tracking-tight text-zinc-900 mb-2">Ucapan & Doa</h3>
			<p class="text-sm text-zinc-500 font-light">Berikan ucapan dan doa restu untuk kami</p>
		</div>

		<form onsubmit={handleSubmit} class="space-y-6">
			{#if submitError}
				<div
					transition:slide
					class="p-4 bg-red-50 text-red-600 rounded-sm flex items-start gap-3 text-sm"
				>
					<AlertCircle class="w-5 h-5 shrink-0 mt-0.5" />
					<p>{submitError}</p>
				</div>
			{/if}

			{#if submitSuccess}
				<div
					transition:slide
					class="p-4 bg-emerald-50 text-emerald-600 rounded-sm flex items-start gap-3 text-sm"
				>
					<MessageSquareHeart class="w-5 h-5 shrink-0 mt-0.5" />
					<p>Terima kasih atas ucapan dan doa Anda!</p>
				</div>
			{/if}

			<div class="space-y-2">
				<label for="gb-name" class="block text-sm font-medium text-zinc-700">Nama Lengkap</label>
				<input
					type="text"
					id="gb-name"
					bind:value={name}
					disabled={submitting}
					class="w-full px-4 py-3 border border-zinc-200 rounded-sm bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all text-sm"
					placeholder="Masukkan nama Anda"
				/>
			</div>

			<div class="space-y-2">
				<label for="gb-message" class="block text-sm font-medium text-zinc-700">Ucapan & Doa</label>
				<textarea
					id="gb-message"
					bind:value={message}
					disabled={submitting}
					rows={4}
					class="w-full px-4 py-3 border border-zinc-200 rounded-sm bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all text-sm resize-none"
					placeholder="Tulis ucapan dan doa Anda di sini..."></textarea>
			</div>

			<button
				type="submit"
				disabled={submitting}
				class="w-full py-4 bg-zinc-900 text-white rounded-sm text-sm font-medium tracking-wide uppercase hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
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

	<!-- List Section -->
	<div class="space-y-6">
		{#if loadingEntries}
			<div class="flex justify-center py-12 text-zinc-400">
				<Loader2 class="w-6 h-6 animate-spin" />
			</div>
		{:else if errorEntries}
			<p class="text-center text-sm text-red-500 py-8">{errorEntries}</p>
		{:else if entries.length === 0}
			<p class="text-center text-sm text-zinc-400 py-12 italic font-light">
				Belum ada ucapan. Jadilah yang pertama memberikan ucapan!
			</p>
		{:else}
			<div class="space-y-4">
				{#each entries as entry (entry.id)}
					<div in:fade class="bg-zinc-50 p-6 rounded-sm border border-zinc-100/50">
						<div class="flex items-center justify-between mb-3">
							<h4 class="font-medium text-zinc-900">{entry.name}</h4>
							<span class="text-xs text-zinc-400 font-light">
								{new Date(entry.created_at).toLocaleDateString('id-ID', {
									day: 'numeric',
									month: 'long',
									year: 'numeric'
								})}
							</span>
						</div>
						<p class="text-zinc-600 text-sm font-light leading-relaxed whitespace-pre-wrap">
							{entry.message}
						</p>
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
