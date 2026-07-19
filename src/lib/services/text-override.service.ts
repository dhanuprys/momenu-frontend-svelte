import type { TextOverride } from '../types';
import type { TextOverridePayload } from '$lib/theme-engine/helpers/text-edit-state.js';
import { api } from '../utils/api';

export const TextOverrideService = {
	async list(projectId: string) {
		const res = await api.get<TextOverride[]>(`/projects/${projectId}/text-overrides`);
		return res.data;
	},

	async upsert(projectId: string, overrides: TextOverridePayload[]) {
		const res = await api.put<TextOverride[]>(`/projects/${projectId}/text-overrides`, {
			overrides
		});
		return res.data;
	},

	async remove(projectId: string, slotKey: string) {
		await api.delete(`/projects/${projectId}/text-overrides/${slotKey}`);
	}
};
