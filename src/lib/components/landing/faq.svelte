<script lang="ts">
	import { Plus, Minus } from '@lucide/svelte';

	let activeIndex = $state<number | null>(null);

	const faqs = [
		{
			q: 'Apakah ada batasan jumlah undangan yang bisa dibuat?',
			a: 'Saat ini Momenu sepenuhnya gratis digunakan selama masa Early Access. Setelah Anda mendapatkan akses undangan dari admin, Anda dapat membuat undangan tanpa batasan kuota.'
		},
		{
			q: 'Bagaimana tamu mengonfirmasi kehadiran (RSVP)?',
			a: 'Tamu Anda cukup membuka tautan undangan digital, lalu mengisi form konfirmasi kehadiran yang tersedia. Status kehadiran tamu (Hadir/Tidak Hadir, jumlah orang, ucapan selamat) akan langsung muncul di dashboard Anda secara real-time.'
		},
		{
			q: 'Apakah saya bisa menggunakan musik latar sendiri?',
			a: 'Tentu saja! Anda dapat mengunggah file audio (.mp3) pilihan Anda sendiri, atau memilih dari puluhan musik latar premium yang telah kami sediakan secara gratis.'
		},
		{
			q: 'Berapa lama undangan digital saya akan aktif?',
			a: 'Undangan digital Anda akan tetap aktif dan dapat diakses selama minimal 1 tahun setelah hari H acara Anda berlalu. Anda juga dapat menonaktifkan atau mengarsipkannya kapan saja melalui dashboard.'
		},
		{
			q: 'Bagaimana cara menerima kado atau angpao digital?',
			a: 'Anda dapat mengaktifkan fitur Amplop Digital di dashboard, lalu memasukkan nomor rekening bank atau mengunggah gambar QRIS (misalnya QRIS Dana, GoPay, atau LinkAja). Tamu dapat mentransfer langsung ke rekening Anda tanpa potongan biaya sepeser pun dari Momenu.'
		},
		{
			q: 'Apakah bisa menggunakan nama domain sendiri?',
			a: 'Bisa. Tim kami akan membantu Anda menghubungkan nama domain kustom (seperti joni-siti.com) ke undangan digital Anda untuk memberikan kesan yang lebih eksklusif. Fitur ini juga tersedia secara gratis selama masa pendaftaran eksklusif ini.'
		}
	];

	function toggle(index: number) {
		if (activeIndex === index) {
			activeIndex = null;
		} else {
			activeIndex = index;
		}
	}
</script>

<section id="faq" class="py-24 bg-background relative overflow-hidden">
	<div class="container mx-auto max-w-4xl px-4 md:px-8">
		<div class="flex flex-col items-center text-center space-y-4 mb-16">
			<div
				class="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
			>
				<span>FAQ</span>
			</div>
			<h2 class="text-3xl font-bold tracking-tight sm:text-4xl">Pertanyaan yang Sering Diajukan</h2>
			<p class="max-w-2xl text-muted-foreground sm:text-lg">
				Temukan jawaban cepat untuk pertanyaan umum seputar fitur dan layanan Momenu.
			</p>
		</div>

		<div class="space-y-4">
			{#each faqs as faq, i}
				<div
					class="border border-border/60 rounded-2xl bg-muted/20 overflow-hidden transition-all duration-200 {activeIndex ===
					i
						? 'border-primary/30 bg-muted/40 shadow-sm'
						: ''}"
				>
					<button
						type="button"
						class="flex w-full items-center justify-between px-6 py-5 text-left font-semibold text-foreground hover:text-primary transition-colors focus:outline-none"
						onclick={() => toggle(i)}
					>
						<span class="pr-4">{faq.q}</span>
						<span class="text-muted-foreground shrink-0">
							{#if activeIndex === i}
								<Minus class="h-5 w-5 text-primary" />
							{:else}
								<Plus class="h-5 w-5" />
							{/if}
						</span>
					</button>

					{#if activeIndex === i}
						<div
							class="px-6 pb-6 text-sm md:text-base leading-relaxed text-muted-foreground animate-in fade-in slide-in-from-top-2 duration-200"
						>
							{faq.a}
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>
