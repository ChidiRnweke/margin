import type { PageServerLoad } from './$types';

interface Revision {
	id: string;
	timestamp: string;
	action: string;
	summary: string;
	author?: string;
}

export const load: PageServerLoad = async () => {
	return {
		revisions: [] as Revision[]
	};
};
