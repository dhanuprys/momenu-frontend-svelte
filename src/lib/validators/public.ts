import { z } from 'zod';

export const rsvpSchema = z
	.object({
		name: z.string().min(1, { message: 'Nama wajib diisi' }),
		attending: z.boolean({ message: 'Status kehadiran wajib diisi' }),
		guest_count: z.number().int().min(1, { message: 'Jumlah tamu minimal 1' }).default(1)
	})
	.refine(
		(data) => {
			if (data.attending && data.guest_count < 1) {
				return false;
			}
			return true;
		},
		{
			message: 'Jumlah tamu wajib diisi jika hadir',
			path: ['guest_count']
		}
	);

export const guestbookSchema = z.object({
	name: z.string().min(1, { message: 'Nama wajib diisi' }),
	message: z.string().min(1, { message: 'Pesan wajib diisi' })
});
