import { z } from 'zod';

export const scheduleSchema = z.object({
	title: z.string().min(1, { message: 'Judul jadwal wajib diisi' }),
	start_time: z.string().min(1, { message: 'Waktu mulai wajib diisi' }),
	end_time: z.string().optional(),
	timezone: z.string().min(1, { message: 'Zona waktu wajib diisi' }),
	location: z.string().optional(),
	map_url: z.string().url({ message: 'Tautan peta tidak valid' }).optional().or(z.literal(''))
});

export const giftRegistrySchema = z.object({
	type: z.enum(['bank', 'ewallet', 'physical'], { message: 'Tipe hadiah tidak valid' }),
	provider_name: z.string().optional(),
	account_number: z.string().optional(),
	account_name: z.string().optional(),
	qr_code_image: z.string().optional(),
	mailing_address: z.string().optional()
});

export const mediaMappingSchema = z.object({
	bucket: z.string().min(1, { message: 'Bucket wajib diisi' }),
	media_type: z.enum(['image', 'video'], { message: 'Tipe media tidak valid' }),
	url: z.string().url({ message: 'Tautan media tidak valid' }),
	order: z.number().int().min(0).default(0)
});

export const dressCodeSchema = z.object({
	label: z.string().min(1, { message: 'Label pakaian wajib diisi' }),
	colors: z.array(z.string()).min(1, { message: 'Pilih minimal satu warna' })
});

export const liveStreamSchema = z.object({
	platform: z.enum(['youtube', 'zoom', 'instagram', 'tiktok', 'gmeet', 'other'], {
		message: 'Platform tidak valid'
	}),
	url: z.string().url({ message: 'Tautan tidak valid' }).min(1, { message: 'Tautan wajib diisi' })
});
