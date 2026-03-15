import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	return {
		aspect: {
			id: params.id,
			name: '',
			purpose: '',
			targetPercentage: 0,
			color: 'var(--color-aspect-1)',
			status: 'active' as const,
			taskCount: 0,
			milestoneCount: 0
		},
		milestones: [],
		tasks: []
	};
};
