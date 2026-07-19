/**
 * Centralized repository of high-quality mock data and placeholder assets.
 * Used by themes to provide stunning fallbacks during preview/editing mode
 * when the user hasn't uploaded their own media or filled out details yet.
 */

export const TEXT_PLACEHOLDERS = {
	// Names
	MALE_NAME_1: 'Rama',
	FEMALE_NAME_1: 'Shinta',
	COUPLE_NAME_SHORT: 'Rama & Shinta',
	COUPLE_NAME_LONG: 'Rama Wijaya & Shinta Dewi',

	// Parents
	MALE_FATHER_NAME: 'Bpk. Dasaratha',
	MALE_MOTHER_NAME: 'Ibu Kosalya',
	FEMALE_FATHER_NAME: 'Bpk. Janaka',
	FEMALE_MOTHER_NAME: 'Ibu Sunayana',

	// Dates & Locations
	EVENT_DATE_FORMATTED: 'Sabtu, 28 Oktober 2026',
	EVENT_TIME: '09:00 WITA - Selesai',
	LOCATION_NAME: 'The Royal Pita Maha',
	LOCATION_ADDRESS: 'Kedewatan, Ubud, Gianyar, Bali'
} as const;

export const MEDIA_PLACEHOLDERS = {
	// Style: Traditional / Warm Tone
	WEDDING_TONE_WARM: {
		cover: '/placeholders/wedding_warm/cover.jpg',
		avatar_male: '/placeholders/wedding_warm/groom.jpg',
		avatar_female: '/placeholders/wedding_warm/bride.jpg',
		gallery: [
			'/placeholders/wedding_warm/gallery_1.jpg',
			'/placeholders/wedding_warm/gallery_2.jpg',
			'/placeholders/wedding_warm/gallery_3.jpg',
			'/placeholders/wedding_warm/gallery_4.jpg'
		]
	},

	// Style: Modern / Cool Tone
	WEDDING_TONE_COOL: {
		cover: '/placeholders/wedding_cool/cover.jpg',
		avatar_male: '/placeholders/wedding_cool/groom.jpg',
		avatar_female: '/placeholders/wedding_cool/bride.jpg',
		gallery: [
			'/placeholders/wedding_cool/gallery_1.jpg',
			'/placeholders/wedding_cool/gallery_2.jpg',
			'/placeholders/wedding_cool/gallery_3.jpg',
			'/placeholders/wedding_cool/gallery_4.jpg'
		]
	},

	// Abstract Textures
	TEXTURES: {
		PAPER_CREAM: '/placeholders/textures/cream-paper.png'
	}
} as const;
