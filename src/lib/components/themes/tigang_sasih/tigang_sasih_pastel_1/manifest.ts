import type { ThemeManifest } from '$lib/types/theme-manifest';

export const MANIFEST = {
	id: 'tigang_sasih_pastel_1',
	eventType: 'tigang_sasih',
	name: 'Pastel Joy',
	buckets: {
		cover_photo: { label: 'Foto Sampul', mediaType: 'image', maxFiles: 1 },
		baby_gallery: { label: 'Galeri Bayi', mediaType: 'image', maxFiles: 10 }
	}
} as const satisfies ThemeManifest;
