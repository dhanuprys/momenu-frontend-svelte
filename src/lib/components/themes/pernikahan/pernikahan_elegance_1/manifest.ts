import type { ThemeManifest } from '$lib/types/theme-manifest';

export const MANIFEST = {
	id: 'pernikahan_elegance_1',
	eventType: 'pernikahan',
	name: 'Elegance Bali',
	buckets: {
		cover_photo: { label: 'Foto Sampul', mediaType: 'image', maxFiles: 1 },
		gallery_grid: { label: 'Galeri Foto', mediaType: 'image', maxFiles: 15 },
		teaser_video: { label: 'Video Teaser', mediaType: 'video', maxFiles: 1 }
	}
} as const satisfies ThemeManifest;
