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

<div class="w-full max-w-md mx-auto bg-white p-8 rounded-sm shadow-sm border border-zinc-100">
	<div class="text-center mb-8">
		<h3 class="text-2xl font-light tracking-tight text-zinc-900 mb-2">RSVP</h3>
		<p class="text-sm text-zinc-500 font-light">Konfirmasi kehadiran Anda</p>
	</div>

	{#if success}
		<div in:fade class="text-center py-8">
			<CheckCircle2 class="w-16 h-16 text-emerald-500 mx-auto mb-4" />
			<h4 class="text-xl font-medium text-zinc-900 mb-2">Terima Kasih!</h4>
			<p class="text-zinc-500 font-light">Konfirmasi kehadiran Anda telah tersimpan.</p>
		</div>
	{:else}
		<form onsubmit={handleSubmit} class="space-y-6">
			{#if error}
				<div
					transition:slide
					class="p-4 bg-red-50 text-red-600 rounded-sm flex items-start gap-3 text-sm"
				>
					<AlertCircle class="w-5 h-5 shrink-0 mt-0.5" />
					<p>{error}</p>
				</div>
			{/if}

			<div class="space-y-2">
				<label for="name" class="block text-sm font-medium text-zinc-700">Nama Lengkap</label>
				<input
					type="text"
					id="name"
					bind:value={name}
					disabled={loading}
					class="w-full px-4 py-3 border border-zinc-200 rounded-sm bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all text-sm"
					placeholder="Masukkan nama Anda"
				/>
			</div>

			<fieldset class="space-y-3">
				<legend class="block text-sm font-medium text-zinc-700">Apakah Anda akan hadir?</legend>
				<div class="grid grid-cols-2 gap-4">
					<label
						class="flex items-center p-4 border border-zinc-200 rounded-sm cursor-pointer hover:bg-zinc-50 transition-colors {attending
							? 'ring-1 ring-zinc-900 border-zinc-900 bg-zinc-50'
							: ''}"
					>
						<input
							type="radio"
							name="attending"
							bind:group={attending}
							value={true}
							class="sr-only"
						/>
						<span class="text-sm font-medium text-zinc-900 mx-auto">Ya, Hadir</span>
					</label>
					<label
						class="flex items-center p-4 border border-zinc-200 rounded-sm cursor-pointer hover:bg-zinc-50 transition-colors {!attending
							? 'ring-1 ring-zinc-900 border-zinc-900 bg-zinc-50'
							: ''}"
					>
						<input
							type="radio"
							name="attending"
							bind:group={attending}
							value={false}
							class="sr-only"
						/>
						<span class="text-sm font-medium text-zinc-900 mx-auto">Maaf, Tidak Bisa</span>
					</label>
				</div>
			</fieldset>

			{#if attending}
				<div class="space-y-2" transition:slide>
					<label for="guestCount" class="block text-sm font-medium text-zinc-700"
						>Jumlah Tamu (termasuk Anda)</label
					>
					<select
						id="guestCount"
						bind:value={guestCount}
						disabled={loading}
						class="w-full px-4 py-3 border border-zinc-200 rounded-sm bg-zinc-50/50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-zinc-900 focus:border-zinc-900 transition-all text-sm appearance-none"
					>
						<option value={1}>1 Orang</option>
						<option value={2}>2 Orang</option>
						<option value={3}>3 Orang</option>
						<option value={4}>4 Orang</option>
						<option value={5}>5 Orang</option>
					</select>
				</div>
			{/if}

			<button
				type="submit"
				disabled={loading}
				class="w-full py-4 bg-zinc-900 text-white rounded-sm text-sm font-medium tracking-wide uppercase hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
			>
				{#if loading}
					<Loader2 class="w-4 h-4 animate-spin" />
					<span>Mengirim...</span>
				{:else}
					Kirim RSVP
				{/if}
			</button>
		</form>
	{/if}
</div>
