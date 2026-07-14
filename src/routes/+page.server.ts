import fs from 'fs';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const src =
		'/Users/dhanu/.gemini/antigravity-ide/brain/e60c5539-172c-4982-a16e-25bab9997c52/dashboard_mockup_1783925554208.png';
	const dest =
		'/Users/dhanu/DevSpace/code/momenu/momenu-frontend-svelte/static/dashboard_mockup.png';

	try {
		if (fs.existsSync(src)) {
			// Always copy to ensure it is up to date
			fs.copyFileSync(src, dest);
			console.log('Successfully copied dashboard mockup image via SSR load!');
		} else {
			console.warn('Source mockup image not found at:', src);
		}
	} catch (err) {
		console.error('Failed to copy mockup image during SSR:', err);
	}

	return {};
};
