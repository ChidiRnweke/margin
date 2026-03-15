import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { AppFactory } from '$lib/server/factory/index.js';

interface Revision {
	id: string;
	timestamp: string;
	action: string;
	summary: string;
	author?: string;
}

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.principal?.userId;
	if (!userId) {
		return { revisions: [] as Revision[] };
	}
	const factory = AppFactory.create(db);
	const cycles = await factory.planningController.queryCycles(userId, { limit: 20 });
	const revisions = ((cycles.items ?? []) as Array<Record<string, unknown>>).map((cycle) => ({
		id: String(cycle.id),
		timestamp: String(cycle.createdAt ?? new Date().toISOString()),
		action: String(cycle.status ?? 'Draft'),
		summary: `Week of ${String(cycle.weekStartIsoMonday ?? '')}`,
		author: 'You'
	}));

	return {
		revisions
	};
};
