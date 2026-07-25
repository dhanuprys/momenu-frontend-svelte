import type { ThemeManifest } from '$lib/theme-engine/types';

export const BUCKET = {
	cover_photo: 'cover_photo',
	hero_photo: 'hero_photo',
	parallax_bg: 'parallax_bg',
	groom_photo: 'groom_photo',
	bride_photo: 'bride_photo',
	gallery_grid: 'gallery_grid',
	promo_video: 'promo_video',
	quote_bg: 'quote_bg'
} as const;

export const TEXT = {
	hero_title: 'hero_title',
	hero_subtitle: 'hero_subtitle',
	greeting_title: 'greeting_title',
	greeting_body: 'greeting_body',
	schedule_title: 'schedule_title',
	closing_text: 'closing_text',
	quote_main: 'quote_main',
	quote_translation: 'quote_translation',
	quote_source: 'quote_source'
} as const;

export const STYLE = {
	body_bg: 'body_bg',
	glass_card: 'glass_card',
	parallax_overlay: 'parallax_overlay',
	hero_overlay: 'hero_overlay',
	color_primary: 'color_primary',
	color_secondary: 'color_secondary'
} as const;

export const MANIFEST = {
	id: 'pernikahan_glamour_1',
	eventType: 'pernikahan',
	name: 'Glassmorphism Wedding',
	buckets: {
		[BUCKET.cover_photo]: { label: 'Foto Sampul (Cover)', mediaType: 'image', maxFiles: 1 },
		[BUCKET.hero_photo]: { label: 'Foto Latar Hero', mediaType: 'image', maxFiles: 5 },
		[BUCKET.parallax_bg]: { label: 'Latar Parallax Slideshow', mediaType: 'image', maxFiles: 5 },
		[BUCKET.groom_photo]: { label: 'Foto Mempelai Pria', mediaType: 'image', maxFiles: 1 },
		[BUCKET.bride_photo]: { label: 'Foto Mempelai Wanita', mediaType: 'image', maxFiles: 1 },
		[BUCKET.gallery_grid]: { label: 'Galeri Pre-Wedding', mediaType: 'image', maxFiles: 20 },
		[BUCKET.promo_video]: { label: 'Video Cerita Kami', mediaType: 'video', maxFiles: 1 },
		[BUCKET.quote_bg]: { label: 'Latar Kutipan', mediaType: 'image', maxFiles: 1 }
	},
	textSlots: {
		[TEXT.hero_title]: {
			label: 'Judul Utama',
			defaultValue: 'Romeo & Juliet',
			section: 'hero',
			defaultFontFamily: 'Dancing Script',
			defaultTextAlign: 'center'
		},
		[TEXT.hero_subtitle]: {
			label: 'Teks Subjudul',
			defaultValue: 'We Are Getting Married',
			section: 'hero',
			defaultTextAlign: 'center'
		},
		[TEXT.greeting_title]: {
			label: 'Judul Sapaan',
			defaultValue: 'Om Swastyastu',
			section: 'greeting',
			defaultFontFamily: 'Dancing Script',
			defaultTextAlign: 'center'
		},
		[TEXT.greeting_body]: {
			label: 'Teks Sapaan',
			defaultValue:
				'Atas asung kertha wara nugraha Ida Sang Hyang Widhi Wasa/Tuhan Yang Maha Esa, kami bermaksud mengundang Bapak/Ibu/Saudara/i pada acara Pawiwahan (Pernikahan) putra-putri kami.',
			inputType: 'long',
			section: 'greeting',
			defaultTextAlign: 'center'
		},
		[TEXT.schedule_title]: {
			label: 'Judul Jadwal',
			defaultValue: 'Rangkaian Acara',
			section: 'schedule',
			defaultFontFamily: 'Dancing Script',
			defaultTextAlign: 'center'
		},
		[TEXT.closing_text]: {
			label: 'Teks Penutup',
			defaultValue:
				'Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu.',
			inputType: 'long',
			section: 'closing',
			defaultTextAlign: 'center'
		},
		[TEXT.quote_main]: {
			label: 'Kutipan Utama',
			defaultValue:
				'Cinta tidak berupa tatapan satu sama lain, tetapi memandang ke luar bersama ke arah yang sama.',
			inputType: 'long',
			section: 'intro',
			defaultTextAlign: 'center'
		},
		[TEXT.quote_translation]: {
			label: 'Terjemahan Kutipan',
			defaultValue:
				'"Love does not consist of gazing at each other, but in looking outward together in the same direction."',
			inputType: 'long',
			section: 'intro',
			defaultTextAlign: 'center'
		},
		[TEXT.quote_source]: {
			label: 'Sumber Kutipan',
			defaultValue: 'Antoine de Saint-Exupéry',
			section: 'intro',
			defaultTextAlign: 'center'
		}
	},
	styleSlots: {
		[STYLE.body_bg]: {
			label: 'Warna Latar Dasar',
			properties: { backgroundColor: '#000000', textColor: '#ffffff' } // Dark theme defaults
		},
		[STYLE.hero_overlay]: {
			label: 'Warna Lapisan Hero',
			properties: { backgroundColor: '#000000', opacity: '0.2' }
		},
		[STYLE.glass_card]: {
			label: 'Warna Kartu Kaca',
			properties: { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
		},
		[STYLE.parallax_overlay]: {
			label: 'Overlay Parallax (Mempelai - Galeri)',
			properties: { backgroundColor: 'rgba(0, 0, 0, 0.6)' }
		},
		[STYLE.color_primary]: {
			label: 'Warna Utama (Aksen)',
			properties: { textColor: '#c4a962' }
		},
		[STYLE.color_secondary]: {
			label: 'Warna Sekunder',
			properties: { backgroundColor: '#1a1a1a' }
		}
	},
	demo: {
		payload: {
			nama_mempelai_pria: 'Romeo',
			nama_panggilan_pria: 'Romeo',
			nama_ayah_pria: 'Bpk. Montague',
			nama_ibu_pria: 'Ibu Montague',
			anak_ke_pria: 1,
			bersaudara_pria: 2,
			alamat_pria: 'Jl. Verona No. 1, Denpasar',
			nama_mempelai_wanita: 'Juliet',
			nama_panggilan_wanita: 'Juliet',
			nama_ayah_wanita: 'Bpk. Capulet',
			nama_ibu_wanita: 'Ibu Capulet',
			anak_ke_wanita: 2,
			bersaudara_wanita: 3,
			alamat_wanita: 'Jl. Verona No. 2, Denpasar'
		},
		featureToggle: {
			show_gallery: true,
			show_music: true,
			show_rsvp: true,
			show_wishes: true,
			show_gifts: true,
			show_live_stream: true,
			show_journeys: true
		},
		schedules: [
			{
				title: 'Pawiwahan',
				start_time: new Date(Date.now() + 86400000 * 7).toISOString(),
				end_time: new Date(Date.now() + 86400000 * 7 + 3600000 * 2).toISOString(),
				location: 'Griya Agung Verona',
				map_url: 'https://maps.google.com',
				timezone: 'Asia/Makassar'
			}
		],
		journeys: [
			{
				title: 'Pertama Bertemu',
				date: '14 Februari 2020',
				content: 'Awal kisah kami dimulai pada hari kasih sayang.',
				order: 1
			}
		]
	}
} as const satisfies ThemeManifest;
