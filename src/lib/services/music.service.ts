import type { Music, MusicCategory } from '../types';
import { api } from '../utils/api';

export const MusicService = {
	async listCategories() {
		const res = await api.get<MusicCategory[]>('/music/categories');
		return res.data;
	},

	async listMusics(categoryId?: number) {
		const url = categoryId ? `/music?category_id=${categoryId}` : '/music';
		const res = await api.get<Music[]>(url);
		return res.data;
	}
};
