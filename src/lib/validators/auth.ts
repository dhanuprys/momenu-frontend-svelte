import { z } from 'zod';

export const loginSchema = z.object({
	email: z
		.string()
		.min(1, { message: 'Email wajib diisi' })
		.email({ message: 'Alamat email tidak valid' }),
	password: z.string().min(1, { message: 'Kata sandi wajib diisi' })
});

export const registerSchema = z.object({
	email: z
		.string()
		.min(1, { message: 'Email wajib diisi' })
		.email({ message: 'Alamat email tidak valid' }),
	password: z.string().min(6, { message: 'Kata sandi harus terdiri dari minimal 6 karakter' })
});
