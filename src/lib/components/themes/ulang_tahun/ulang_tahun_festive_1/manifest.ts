import type { ThemeManifest } from '$lib/types/theme-manifest';

export const MANIFEST = {
	id: 'ulang_tahun_festive_1',
	eventType: 'ulang_tahun',
	name: 'Festive Party',
	buckets: {
		cover_photo: { label: 'Foto Sampul', mediaType: 'image', maxFiles: 1 },
		gallery_grid: { label: 'Galeri Foto', mediaType: 'image', maxFiles: 10 }
	}
} as const satisfies ThemeManifest;
