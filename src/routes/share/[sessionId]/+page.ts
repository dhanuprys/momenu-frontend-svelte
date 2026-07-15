import type { PageLoad } from './$types';
import { ShareService } from '$lib/services/index.js';
import { error } from '@sveltejs/kit';
import { ApiError } from '$lib/utils/api-error';

export const ssr = false;

export const load: PageLoad = async ({ params }) => {
	try {
		const data = await ShareService.getSharedData(params.sessionId);
		return {
			isDraft: false,
			sharedData: data
		};
	} catch (e: any) {
		if (e instanceof ApiError && e.code === 'PROJECT_IS_DRAFT') {
			return {
				isDraft: true,
				sharedData: null
			};
		}
		// If session not found, expired, or revoked
		error(404, {
			message: 'Sesi berbagi tidak ditemukan, sudah kedaluwarsa, atau telah dicabut.'
		});
	}
};
