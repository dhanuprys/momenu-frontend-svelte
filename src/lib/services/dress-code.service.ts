import { api } from '../utils/api';
import type { DressCodeRequest, DressCode } from '../types';

export const DressCodeService = {
	async list(projectId: string) {
		const res = await api.get<DressCode[]>(`/projects/${projectId}/dress-codes`);
		return res.data;
	},

	async create(projectId: string, data: DressCodeRequest) {
		const res = await api.post<DressCode>(`/projects/${projectId}/dress-codes`, data);
		return res.data;
	},

	async update(projectId: string, dressCodeId: number, data: DressCodeRequest) {
		const res = await api.put<DressCode>(`/projects/${projectId}/dress-codes/${dressCodeId}`, data);
		return res.data;
	},

	async delete(projectId: string, dressCodeId: number) {
		await api.delete(`/projects/${projectId}/dress-codes/${dressCodeId}`);
	}
};
