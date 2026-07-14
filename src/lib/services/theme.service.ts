import { api } from '../utils/api';
import type { Theme } from '../types';

export const ThemeService = {
	async list() {
		const res = await api.get<Theme[]>('/themes');
		return res.data;
	},

	async get(themeId: string) {
		const res = await api.get<Theme>(`/themes/${themeId}`);
		return res.data;
	}
};
