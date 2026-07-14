import { z } from 'zod';

export const createProjectSchema = z.object({
	title: z.string().min(3, { message: 'Judul acara harus terdiri dari minimal 3 karakter' }),
	theme_id: z.string().min(1, { message: 'Tema wajib dipilih' }),
	payload: z.any()
});

export const updateProjectSchema = z.object({
	title: z
		.string()
		.min(3, { message: 'Judul acara harus terdiri dari minimal 3 karakter' })
		.optional(),
	payload: z.any().optional(),
	sharing_thumbnail: z.string().optional()
});

export const updateProjectStatusSchema = z.object({
	status: z.enum(['draft', 'published', 'archived'], {
		message: 'Status tidak valid'
	})
});

export const updateFeatureToggleSchema = z.object({
	show_rsvp: z.boolean(),
	show_wishes: z.boolean(),
	show_gallery: z.boolean(),
	show_gifts: z.boolean(),
	show_live_stream: z.boolean()
});
