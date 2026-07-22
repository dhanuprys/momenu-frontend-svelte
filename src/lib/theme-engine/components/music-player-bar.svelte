<script lang="ts">
	import type { Music } from '$lib/types/index';
	import { Play, Pause, Check, Music as MusicIcon } from '@lucide/svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Progress } from '$lib/components/ui/progress/index.js';

	let {
		music,
		isPlaying,
		isSelected,
		onTogglePlay,
		onSelect,
		currentTime = 0,
		duration = 0
	} = $props<{
		music: Music;
		isPlaying: boolean;
		isSelected: boolean;
		onTogglePlay: () => void;
		onSelect: () => void;
		currentTime?: number;
		duration?: number;
	}>();

	function formatTime(seconds: number) {
		if (!seconds || isNaN(seconds)) return '0:00';
		const m = Math.floor(seconds / 60);
		const s = Math.floor(seconds % 60);
		return `${m}:${s.toString().padStart(2, '0')}`;
	}
</script>

<div
	class="fixed bottom-0 left-0 md:left-64 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 z-50 p-4 shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.1)] flex flex-col md:flex-row items-center gap-4 transition-all animate-in slide-in-from-bottom-2 duration-300"
>
	<!-- Mobile Progress bar at top -->
	<div class="w-full absolute top-0 left-0 h-1 md:hidden">
		<Progress value={(currentTime / duration) * 100 || 0} class="h-1 rounded-none" />
	</div>

	<!-- Content -->
	<div class="flex items-center w-full max-w-screen-xl mx-auto gap-4 lg:px-8">
		<div class="flex items-center gap-4 flex-1 min-w-0">
			<!-- Cover Art with animation -->
			<div
				class="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-muted border border-border/50"
			>
				{#if music.cover_image}
					<img
						src={music.cover_image}
						alt={music.title}
						class="h-full w-full object-cover {isPlaying ? 'animate-pulse' : ''}"
					/>
				{:else}
					<div
						class="flex h-full w-full items-center justify-center bg-muted text-muted-foreground"
					>
						<MusicIcon class="h-6 w-6 opacity-50 {isPlaying ? 'animate-pulse' : ''}" />
					</div>
				{/if}
			</div>

			<div class="flex-1 min-w-0">
				<p class="text-sm font-semibold truncate">{music.title}</p>
				<p class="text-xs text-muted-foreground truncate">{music.artist}</p>
			</div>
		</div>

		<!-- Controls & Desktop Progress -->
		<div class="flex items-center gap-4 flex-[2] justify-center max-w-md hidden md:flex">
			<span class="text-xs text-muted-foreground w-10 text-right">{formatTime(currentTime)}</span>
			<div class="flex items-center justify-center gap-2">
				<Button
					variant="outline"
					size="icon"
					class="h-10 w-10 rounded-full transition-transform hover:scale-105 active:scale-95"
					onclick={onTogglePlay}
				>
					{#if isPlaying}
						<Pause class="h-4 w-4" />
					{:else}
						<Play class="h-4 w-4 ml-0.5" />
					{/if}
				</Button>
			</div>
			<div class="flex-1 px-2">
				<Progress value={(currentTime / duration) * 100 || 0} class="h-1.5 w-full" />
			</div>
			<span class="text-xs text-muted-foreground w-10 text-left">{formatTime(duration)}</span>
		</div>

		<!-- Action -->
		<div class="flex items-center justify-end md:flex-shrink-0 flex-1 md:flex-none">
			<!-- Mobile Controls - shown only on small screens -->
			<Button
				variant="outline"
				size="icon"
				class="h-10 w-10 rounded-full md:hidden mr-2 transition-transform active:scale-95 shrink-0"
				onclick={onTogglePlay}
			>
				{#if isPlaying}
					<Pause class="h-4 w-4" />
				{:else}
					<Play class="h-4 w-4 ml-0.5" />
				{/if}
			</Button>
			<Button
				variant={isSelected ? 'secondary' : 'default'}
				disabled={isSelected}
				onclick={onSelect}
				class="min-w-[130px]"
			>
				{#if isSelected}
					<Check class="mr-2 h-4 w-4" />
					Tersimpan
				{:else}
					Pilih Lagu Ini
				{/if}
			</Button>
		</div>
	</div>
</div>
