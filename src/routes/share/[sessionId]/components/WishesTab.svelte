<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { UserCheck, UserX, MessageSquareHeart } from '@lucide/svelte';
	import type { SharedDataResponse } from '$lib/services/share.service';

	let { wishes } = $props<{ wishes: NonNullable<SharedDataResponse['analytics']['wishes']> }>();

	function formatShortDate(dateString: string) {
		return new Date(dateString).toLocaleString('id-ID', {
			day: 'numeric',
			month: 'short'
		});
	}
</script>

<div class="space-y-6 outline-none">
	<Card.Root>
		<Card.Header>
			<Card.Title class="text-xl">Ucapan & Doa ({wishes.length})</Card.Title>
			<Card.Description>Pesan-pesan manis dari tamu undangan Anda.</Card.Description>
		</Card.Header>
		<Card.Content>
			{#if wishes && wishes.length > 0}
				<div class="grid gap-4 sm:grid-cols-2">
					{#each wishes as wish, i (i)}
						<div
							class="p-4 rounded-xl border bg-card hover:bg-muted/30 transition-colors space-y-3 shadow-xs"
						>
							<div class="flex items-center justify-between gap-2">
								<div class="font-semibold text-sm truncate">{wish.name}</div>
								<div class="text-xs text-muted-foreground shrink-0">
									{formatShortDate(wish.created_at)}
								</div>
							</div>
							<p class="text-sm text-foreground/90 italic">"{wish.message}"</p>
							{#if wish.is_attending}
								<Badge
									variant="outline"
									class="text-[10px] bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
								>
									<UserCheck class="h-3 w-3 mr-1" /> Hadir
								</Badge>
							{:else}
								<Badge variant="outline" class="text-[10px] text-muted-foreground">
									<UserX class="h-3 w-3 mr-1" /> Tidak Hadir
								</Badge>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<div
					class="flex flex-col items-center justify-center py-16 text-center border rounded-xl border-dashed"
				>
					<div
						class="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4"
					>
						<MessageSquareHeart class="h-6 w-6 text-primary" />
					</div>
					<h3 class="text-lg font-semibold mb-1">Belum Ada Ucapan</h3>
					<p class="text-muted-foreground text-sm max-w-sm">
						Tamu undangan belum memberikan ucapan dan doa untuk acara Anda.
					</p>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>
