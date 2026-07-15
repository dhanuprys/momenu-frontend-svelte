import { InvitationService } from '$lib/services/invitation.service';
import { getMediaUrl } from '$lib/utils';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const project = await InvitationService.getOGMetadata(params.slug);

		return {
			ogMetadata: {
				title: project.title,
				description: 'Undangan pernikahan digital',
				image: getMediaUrl(project.sharing_thumbnail)
			}
		};
	} catch (e: any) {
		console.error('Failed to fetch OG metadata:', e);
		if (e?.response?.status === 404) {
			error(404, 'Undangan tidak ditemukan');
		}

		return {
			ogMetadata: null
		};
	}
};
