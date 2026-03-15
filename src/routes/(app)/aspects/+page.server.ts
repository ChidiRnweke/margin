import type { PageServerLoad } from './$types';

interface Aspect {
	id: string;
	name: string;
	purpose: string;
	targetPercentage: number;
	color: string;
	status: 'active' | 'paused' | 'archived';
	taskCount: number;
}

export const load: PageServerLoad = async () => {
	return {
		aspects: [] as Aspect[],
		totalCount: 0
	};
};
