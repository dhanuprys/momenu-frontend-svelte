export type ToastType = 'sukses' | 'error' | 'info';

export interface ToastMessage {
	id: string;
	message: string;
	type: ToastType;
}

class ToastStore {
	toasts = $state<ToastMessage[]>([]);

	add(message: string, type: ToastType = 'info', duration: number = 5000) {
		const id = Math.random().toString(36).substring(2, 9);
		this.toasts.push({ id, message, type });

		if (duration > 0) {
			setTimeout(() => {
				this.remove(id);
			}, duration);
		}
	}

	remove(id: string) {
		this.toasts = this.toasts.filter((t) => t.id !== id);
	}

	sukses(message: string, duration?: number) {
		this.add(message, 'sukses', duration);
	}

	error(message: string, duration?: number) {
		this.add(message, 'error', duration);
	}
}

export const toastState = new ToastStore();
