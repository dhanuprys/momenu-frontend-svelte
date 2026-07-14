import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { config } from '$lib/config/index.js';
import type { EventType } from '$lib/types/index.js';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export function getMediaUrl(url: string | undefined | null): string {
	if (!url) return '';
	if (url.startsWith('http://') || url.startsWith('https://')) return url;

	const baseUrl = config.API_BASE_URL.replace(/\/api\/v1\/?$/, '');
	const path = url.startsWith('/') ? url : `/${url}`;
	return `${baseUrl}${path}`;
}

export function eventTypeLabel(type: EventType | string): string {
	switch (type) {
		case 'pernikahan':
			return 'Pernikahan';
		case 'ulang_tahun':
			return 'Ulang Tahun';
		case 'metatah':
			return 'Metatah';
		case 'tigang_sasih':
			return 'Tigang Sasih';
		case 'seminar':
			return 'Seminar';
		default:
			return String(type);
	}
}
