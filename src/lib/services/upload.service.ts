import type { ApiSuccessResponse, UploadResult } from '../types';
import { apiClient } from '../utils/api';

export const UploadService = {
	async upload(
		file: File,
		type: 'image' | 'video' | 'audio' | 'thumbnail',
		projectId: string,
		onProgress?: (percent: number) => void
	): Promise<UploadResult> {
		const formData = new FormData();
		formData.append('type', type);
		formData.append('project_id', projectId);
		formData.append('file', file);

		const response = await apiClient.post<ApiSuccessResponse<UploadResult>>('/upload', formData, {
			headers: {
				'Content-Type': 'multipart/form-data'
			},
			onUploadProgress: (progressEvent) => {
				if (onProgress && progressEvent.total) {
					const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
					onProgress(percentCompleted);
				}
			}
		});

		return response.data.data;
	},

	async adminUpload(
		file: File,
		type: 'image' | 'video' | 'audio',
		onProgress?: (percent: number) => void
	): Promise<UploadResult> {
		const formData = new FormData();
		formData.append('type', type);
		formData.append('file', file);

		const response = await apiClient.post<ApiSuccessResponse<UploadResult>>(
			'/admin/upload',
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data'
				},
				onUploadProgress: (progressEvent) => {
					if (onProgress && progressEvent.total) {
						const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
						onProgress(percentCompleted);
					}
				}
			}
		);

		return response.data.data;
	}
};
