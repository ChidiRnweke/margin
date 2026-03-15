import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { AppFactory } from '$lib/server/factory/index.js';

interface AspectWeight {
	id: string;
	name: string;
	weight: number;
}

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.principal?.userId;
	if (!userId) {
		return {
			aspectWeights: [] as AspectWeight[],
			thresholds: { overcommit: 80, undercommit: 20 }
		};
	}

	const factory = AppFactory.create(db);
	const aspects = await factory.aspectController.queryAspects(userId, { limit: 24 });
	const aspectWeights = ((aspects.items ?? []) as Array<Record<string, unknown>>).map((aspect) => ({
		id: String(aspect.id),
		name: String(aspect.name),
		weight: Number(aspect.targetPercentage ?? 0)
	}));

	return {
		aspectWeights,
		thresholds: {
			overcommit: 80,
			undercommit: 20
		}
	};
};
