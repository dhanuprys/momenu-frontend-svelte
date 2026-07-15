import type { GiftRegistry, GiftRegistryRequest } from '../types';
import { api } from '../utils/api';

export const GiftRegistryService = {
	async list(projectId: string) {
		const res = await api.get<GiftRegistry[]>(`/projects/${projectId}/gift-registries`);
		return res.data;
	},

	async create(projectId: string, data: GiftRegistryRequest) {
		const res = await api.post<GiftRegistry>(`/projects/${projectId}/gift-registries`, data);
		return res.data;
	},

	async update(projectId: string, registryId: number, data: GiftRegistryRequest) {
		const res = await api.put<GiftRegistry>(
			`/projects/${projectId}/gift-registries/${registryId}`,
			data
		);
		return res.data;
	},

	async delete(projectId: string, registryId: number) {
		await api.delete(`/projects/${projectId}/gift-registries/${registryId}`);
	}
};
