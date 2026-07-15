import type { FileRecord, QuotaInfo } from '$lib/types/models';
import { api } from '$lib/utils/api';

export interface ProjectDiskUsageResponse {
	quota: QuotaInfo;
	files: FileRecord[];
}

export interface GlobalDiskStats {
	total_size_bytes: number;
	total_size_human: string;
	total_files: number;
	optimized_files: number;
	unoptimized_files: number;
	space_saved_bytes: number;
	space_saved_human: string;
}

export const diskService = {
	getProjectDiskUsage: async (projectId: string) => {
		const response = await api.get<ProjectDiskUsageResponse>(`/projects/${projectId}/disk-usage`);
		return response.data;
	},

	getGlobalDiskStats: async () => {
		const response = await api.get<GlobalDiskStats>('/admin/disk-stats');
		return response.data;
	},

	updateProjectDiskQuota: async (projectId: string, diskQuotaMB: number) => {
		const response = await api.patch<any>(`/admin/projects/${projectId}/disk-quota`, {
			disk_quota_mb: diskQuotaMB
		});
		return response.data;
	}
};
