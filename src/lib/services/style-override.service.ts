import type { StyleOverride } from '../types';
import { api } from '../utils/api';

export const StyleOverrideService = {
	async list(projectId: string) {
		const res = await api.get<StyleOverride[]>(`/projects/${projectId}/style-overrides`);
		return res.data;
	},

	async upsert(
		projectId: string,
		overrides: { slot_key: string; properties: Record<string, string> }[]
	) {
		const res = await api.put<StyleOverride[]>(`/projects/${projectId}/style-overrides`, {
			overrides
		});
		return res.data;
	},

	async remove(projectId: string, slotKey: string) {
		await api.delete(`/projects/${projectId}/style-overrides/${slotKey}`);
	}
};
