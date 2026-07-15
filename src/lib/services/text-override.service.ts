import type { TextOverride } from '../types';
import { api } from '../utils/api';

export const TextOverrideService = {
	async list(projectId: string) {
		const res = await api.get<TextOverride[]>(`/projects/${projectId}/text-overrides`);
		return res.data;
	},

	async upsert(
		projectId: string,
		overrides: { slot_key: string; value: string; bold: boolean; italic: boolean }[]
	) {
		const res = await api.put<TextOverride[]>(`/projects/${projectId}/text-overrides`, {
			overrides
		});
		return res.data;
	},

	async remove(projectId: string, slotKey: string) {
		await api.delete(`/projects/${projectId}/text-overrides/${slotKey}`);
	}
};
