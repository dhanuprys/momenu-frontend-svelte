import { config } from '$lib/config/index';
import type { EventType } from '$lib/types/index';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

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

export function formatBytes(bytes: number, decimals = 1): string {
	if (!+bytes) return '0 Bytes';
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
