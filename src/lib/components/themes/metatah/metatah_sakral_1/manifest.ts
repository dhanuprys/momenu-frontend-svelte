import type { ThemeManifest } from '$lib/types/theme-manifest';

export const MANIFEST = {
	id: 'metatah_sakral_1',
	eventType: 'metatah',
	name: 'Sakral Bali',
	buckets: {
		cover_photo: { label: 'Foto Sampul', mediaType: 'image', maxFiles: 1 },
		ceremony_gallery: { label: 'Galeri Upacara', mediaType: 'image', maxFiles: 15 }
	}
} as const satisfies ThemeManifest;
