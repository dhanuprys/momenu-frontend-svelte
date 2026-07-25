<script lang="ts">
	import { InvitationService } from '$lib/services/index';
	import { Loader2, CheckCircle2, AlertCircle } from '@lucide/svelte';
	import { fade, slide } from 'svelte/transition';

	let { slug } = $props<{ slug: string }>();

	let name = $state('');
	let attending = $state(true);
	let guestCount = $state(1);

	let loading = $state(false);
	let success = $state(false);
	let error = $state('');

	async function handleSubmit(e: Event) {
		e.preventDefault();
		if (!name.trim()) {
			error = 'Nama harus diisi.';
			return;
		}

		loading = true;
		error = '';

		try {
			await InvitationService.submitRSVP(slug, {
				name,
				attending,
				guest_count: attending ? guestCount : 0
			});
			success = true;
		} catch (err: any) {
			error = err?.response?.data?.message || 'Gagal mengirim RSVP. Silakan coba lagi.';
		} finally {
			loading = false;
		}
	}
</script>

<div class="w-full max-w-md mx-auto text-current">
	<div class="text-center mb-8">
		<h3 class="text-3xl font-script tracking-tight mb-2">RSVP</h3>
		<p class="text-sm opacity-80 font-light">Konfirmasi kehadiran Anda</p>
	</div>

	{#if success}
		<div in:fade class="text-center py-8">
			<CheckCircle2 class="w-16 h-16 mx-auto mb-4 opacity-90" />
			<h4 class="text-xl font-medium mb-2">Terima Kasih!</h4>
			<p class="opacity-80 font-light">Konfirmasi kehadiran Anda telah tersimpan.</p>
		</div>
	{:else}
		<form onsubmit={handleSubmit} class="space-y-6">
			{#if error}
				<div
					transition:slide
					class="p-4 bg-red-500/20 text-red-200 border border-red-500/50 rounded flex items-start gap-3 text-sm"
				>
					<AlertCircle class="w-5 h-5 shrink-0 mt-0.5" />
					<p>{error}</p>
				</div>
			{/if}

			<div class="space-y-2">
				<label for="name" class="block text-sm font-medium opacity-90">Nama Lengkap</label>
				<input
					type="text"
					id="name"
					bind:value={name}
					disabled={loading}
					class="w-full px-4 py-3 border border-current rounded-sm bg-transparent focus:bg-white/10 focus:outline-none transition-all text-sm placeholder-current placeholder-opacity-50"
					placeholder="Masukkan nama Anda"
				/>
			</div>

			<fieldset class="space-y-3">
				<legend class="block text-sm font-medium opacity-90">Apakah Anda akan hadir?</legend>
				<div class="grid grid-cols-2 gap-4">
					<label
						class="flex items-center p-4 border border-current rounded-sm cursor-pointer hover:bg-white/10 transition-colors {attending
							? 'bg-white/20 shadow-inner'
							: ''}"
					>
						<input
							type="radio"
							name="attending"
							bind:group={attending}
							value={true}
							class="sr-only"
						/>
						<span class="text-sm font-medium mx-auto">Ya, Hadir</span>
					</label>
					<label
						class="flex items-center p-4 border border-current rounded-sm cursor-pointer hover:bg-white/10 transition-colors {!attending
							? 'bg-white/20 shadow-inner'
							: ''}"
					>
						<input
							type="radio"
							name="attending"
							bind:group={attending}
							value={false}
							class="sr-only"
						/>
						<span class="text-sm font-medium mx-auto">Maaf, Tidak</span>
					</label>
				</div>
			</fieldset>

			{#if attending}
				<div class="space-y-2" transition:slide>
					<label for="guestCount" class="block text-sm font-medium opacity-90"
						>Jumlah Tamu (termasuk Anda)</label
					>
					<select
						id="guestCount"
						bind:value={guestCount}
						disabled={loading}
						class="w-full px-4 py-3 border border-current rounded-sm bg-transparent focus:bg-black/50 focus:outline-none transition-all text-sm"
					>
						<option value={1} class="text-black">1 Orang</option>
						<option value={2} class="text-black">2 Orang</option>
						<option value={3} class="text-black">3 Orang</option>
						<option value={4} class="text-black">4 Orang</option>
						<option value={5} class="text-black">5 Orang</option>
					</select>
				</div>
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="w-full flex items-center justify-center gap-2 py-4 px-4 border border-current bg-transparent hover:bg-white/10 transition-colors rounded-sm font-medium uppercase tracking-widest text-xs disabled:opacity-50"
			>
				{#if loading}
					<Loader2 class="w-4 h-4 animate-spin" />
					<span>Mengirim...</span>
				{:else}
					Kirim Konfirmasi
				{/if}
			</button>
		</form>
	{/if}
</div>

<style>
	/* Make select options black so they are readable on all OS */
	select option {
		background-color: white;
		color: black;
	}
</style>
