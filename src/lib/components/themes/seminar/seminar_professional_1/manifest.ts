import type { ThemeManifest } from '$lib/types/theme-manifest';

export const MANIFEST = {
	id: 'seminar_professional_1',
	eventType: 'seminar',
	name: 'Professional',
	buckets: {
		hero_banner: { label: 'Banner Utama', mediaType: 'image', maxFiles: 1 },
		speaker_photos: { label: 'Foto Pembicara', mediaType: 'image', maxFiles: 5 }
	}
} as const satisfies ThemeManifest;
