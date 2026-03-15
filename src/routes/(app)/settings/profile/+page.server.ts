import type { PageServerLoad } from './$types';

interface AspectWeight {
	id: string;
	name: string;
	weight: number;
}

export const load: PageServerLoad = async () => {
	return {
		aspectWeights: [] as AspectWeight[],
		thresholds: {
			overcommit: 80,
			undercommit: 20
		}
	};
};
