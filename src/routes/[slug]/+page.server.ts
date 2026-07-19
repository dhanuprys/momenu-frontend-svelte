import { InvitationService } from '$lib/services/invitation.service';
import { getMediaUrl } from '$lib/utils';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const project = await InvitationService.getOGMetadata(params.slug);

		let description = 'Undangan digital Momenu';
		if (project.event_type === 'pernikahan') {
			description = `Anda diundang ke pernikahan ${project.title}`;
		} else if (project.event_type === 'ulang_tahun') {
			description = `Anda diundang ke perayaan ${project.title}`;
		} else {
			description = `Anda diundang ke acara ${project.title}`;
		}

		return {
			ogMetadata: {
				title: project.title,
				description: description,
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
