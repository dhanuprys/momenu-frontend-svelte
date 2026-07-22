import { extractSlotKeys } from '$lib/theme-engine/helpers/slot-keys.js';
import type { ThemeManifest } from '$lib/theme-engine/types.js';

export const MANIFEST = {
	id: 'pernikahan_bali_simple_1',
	eventType: 'pernikahan',
	name: 'Pernikahan Bali Simple',
	buckets: {
		hero_photo: { label: 'Foto Sampul', mediaType: 'image', maxFiles: 1 },
		groom_photo: { label: 'Foto Mempelai Pria', mediaType: 'image', maxFiles: 1 },
		bride_photo: { label: 'Foto Mempelai Wanita', mediaType: 'image', maxFiles: 1 },
		gallery_grid: { label: 'Galeri Pre-Wedding', mediaType: 'image', maxFiles: 20 },
		promo_video: { label: 'Video Cerita Kami', mediaType: 'video', maxFiles: 1 }
	},
	textSlots: {
		greeting_title: {
			label: 'Judul Salam',
			defaultValue: 'Om Swastyastu',
			section: 'Salam Pembuka'
		},
		greeting_body: {
			label: 'Isi Salam',
			defaultValue:
				'Atas Asung Kertha Wara Nugraha Ida Sang Hyang Widhi Wasa/Tuhan Yang Maha Esa, kami bermaksud mengundang Bapak/Ibu/Saudara/i pada Acara Manusa Yadnya (Pawiwahan) putra-putri kami.',
			section: 'Salam Pembuka',
			inputType: 'long'
		},
		quote_text: {
			label: 'Isi Kutipan',
			defaultValue:
				'"Wahai pasangan suami-istri, semoga kalian tetap bersatu dan tidak pernah terpisahkan. Semoga kalian mencapai hidup penuh kebahagiaan, tinggal di rumah yang penuh kegembiraan bersama seluruh keturunanmu."',
			section: 'Kutipan',
			inputType: 'long'
		},
		quote_source: {
			label: 'Sumber Kutipan',
			defaultValue: '— Rg Veda X.85.42',
			section: 'Kutipan'
		},
		closing_text: {
			label: 'Pesan Penutup',
			defaultValue:
				'Merupakan suatu kebahagiaan dan kehormatan bagi kami, apabila Bapak/ Ibu/ Saudara/i, berkenan hadir untuk memberikan doa restu.',
			section: 'Penutup',
			inputType: 'long'
		},
		schedule_title: { label: 'Judul Jadwal', defaultValue: 'Rangkaian Acara' }
	},
	styleSlots: {
		hero_overlay: { label: 'Overlay Hero', properties: { backgroundColor: 'rgba(0,0,0,0.4)' } },
		intro_section: {
			label: 'Seksi Pembuka',
			properties: { backgroundColor: '#ffffff', textColor: '#44403c' }
		},
		schedule_section: {
			label: 'Seksi Jadwal',
			properties: { backgroundColor: '#1c1917', textColor: '#ffffff' }
		},
		quote_card: {
			label: 'Kartu Kutipan',
			properties: { backgroundColor: '#ffffff', textColor: '#57534e', borderRadius: '1rem' }
		}
	},
	demo: {
		payload: {
			nama_mempelai_pria: 'I Gede Aditya',
			nama_panggilan_pria: 'Aditya',
			nama_mempelai_wanita: 'Ni Putu Ayu',
			nama_panggilan_wanita: 'Ayu'
		},
		schedules: [
			{
				title: 'Upacara Pawiwahan',
				start_time: '2027-12-10T09:00:00',
				end_time: '2027-12-10T12:00:00',
				timezone: 'Asia/Jakarta',
				location: 'Griya Agung, Bali',
				map_url: 'https://maps.google.com'
			}
		],
		featureToggle: {
			show_rsvp: true,
			show_wishes: true,
			show_gallery: true,
			show_gifts: true,
			show_live_stream: false,
			show_music: true
		}
	}
} as const satisfies ThemeManifest;

/** Typed bucket key constants */
export const BUCKET = extractSlotKeys(MANIFEST.buckets);
/** Typed text slot key constants */
export const TEXT = extractSlotKeys(MANIFEST.textSlots);
/** Typed style slot key constants */
export const STYLE = extractSlotKeys(MANIFEST.styleSlots);
