import { extractSlotKeys } from '$lib/theme-engine/helpers/slot-keys.js';
import type { ThemeManifest } from '$lib/theme-engine/types.js';

export const MANIFEST = {
	id: 'metatah_sakral_1',
	eventType: 'metatah',
	name: 'Sakral Bali',
	buckets: {
		cover_photo: { label: 'Foto Sampul', mediaType: 'image', maxFiles: 1 },
		ceremony_gallery: { label: 'Galeri Upacara', mediaType: 'image', maxFiles: 15 }
	},
	demo: {
		guestName: 'Bapak & Ibu Guru',
		payload: {
			peserta: [{ nama: 'I Wayan Sudiarta' }, { nama: 'Ni Made Ayu' }],
			nama_ayah: 'I Nyoman Suardana',
			nama_ibu: 'Ni Ketut Sari'
		},
		schedules: [
			{
				title: 'Upacara Metatah',
				start_time: '2026-08-15T08:00:00',
				timezone: 'Asia/Jakarta',
				location: 'Griya Agung',
				map_url: 'https://maps.google.com'
			}
		],
		featureToggle: {
			show_rsvp: true,
			show_wishes: true,
			show_gallery: true,
			show_gifts: false
		}
	}
} as const satisfies ThemeManifest<'metatah'>;

/** Typed bucket key constants */
export const BUCKET = extractSlotKeys(MANIFEST.buckets);
