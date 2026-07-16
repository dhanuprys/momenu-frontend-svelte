export interface CountdownState {
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
	isExpired: boolean;
}

const EXPIRED: CountdownState = { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };

/**
 * Creates a reactive countdown timer that ticks every second.
 *
 * Must be called during component initialization (top-level script).
 * The interval is automatically cleaned up when the component is destroyed.
 *
 * @param targetDate - The date to count down to, or null/undefined for no countdown.
 * @returns An object with a reactive `value` getter.
 *
 * @example
 * ```svelte
 * const countdown = createCountdown(firstScheduleDate);
 * // In template: {countdown.value.days}d {countdown.value.hours}h
 * ```
 */
export function createCountdown(targetDate: Date | null | undefined) {
	let state = $state<CountdownState>(EXPIRED);

	function compute(target: Date): CountdownState {
		const diff = target.getTime() - Date.now();
		if (diff <= 0) return EXPIRED;

		return {
			days: Math.floor(diff / (1000 * 60 * 60 * 24)),
			hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
			minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
			seconds: Math.floor((diff % (1000 * 60)) / 1000),
			isExpired: false
		};
	}

	$effect(() => {
		if (!targetDate) {
			state = EXPIRED;
			return;
		}

		// Compute immediately, then tick every second
		state = compute(targetDate);
		const interval = setInterval(() => {
			state = compute(targetDate);
		}, 1000);

		return () => clearInterval(interval);
	});

	return {
		get value() {
			return state;
		}
	};
}
