import { api } from '../utils/api';
import type { Guestbook, Pagination } from '../types';
export const GuestbookService = {
	async list(projectId: string, page: number = 1, limit: number = 20) {
		const res = await api.get<Guestbook[]>(
			`/projects/${projectId}/guestbook?page=${page}&limit=${limit}`
		);
		return { data: res.data, pagination: res.meta.pagination as Pagination };
	},

	async delete(projectId: string, entryId: number) {
		await api.delete(`/projects/${projectId}/guestbook/${entryId}`);
	}
};
