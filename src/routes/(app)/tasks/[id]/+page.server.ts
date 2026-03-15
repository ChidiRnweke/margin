import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	return {
		task: {
			id: params.id,
			title: '',
			description: '',
			status: 'todo' as const,
			effort: 0,
			aspectId: '',
			aspectName: '',
			dueDate: null,
			tags: [],
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		}
	};
};
