import type { Actions, PageServerLoad } from './$types';
import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { AppFactory } from '$lib/server/factory/index.js';

interface Allocation {
	title: string;
	aspect: string;
	aspectColor: string;
	startHour: number;
	duration: number;
	dayIndex: number;
	day: string;
	time: string;
	outcome: 'done' | 'skipped' | 'partial' | null;
}

interface AvailabilityWindow {
	dayIndex: number;
	startHour: number;
	endHour: number;
}

type PlanStatus = 'draft' | 'confirmed' | 'archived';

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.principal?.userId;
	if (!userId) {
		return {
			weekStart: new Date().toISOString(),
			allocations: [] as Allocation[],
			availability: [] as AvailabilityWindow[],
			status: 'draft' as const
		};
	}

	const factory = AppFactory.create(db);
	const cycles = await factory.planningController.queryCycles(userId, { limit: 1 });
	const current = (cycles.items?.[0] as Record<string, unknown> | undefined) ?? null;

	return {
		weekStart: String(current?.weekStartIsoMonday ?? new Date().toISOString()),
		allocations: [] as Allocation[],
		availability: [] as AvailabilityWindow[],
		status: (current?.status?.toString().toLowerCase() as PlanStatus) ?? 'draft'
	};
};

export const actions: Actions = {
	generate: async ({ locals, request }) => {
		const userId = locals.principal?.userId;
		if (!userId) return fail(401, { action: 'generate', error: 'Authentication required.' });
		const formData = await request.formData();
		const weekStart = String(formData.get('weekStart') ?? new Date().toISOString().slice(0, 10));
		const factory = AppFactory.create(db);
		await factory.planningController.generateDraftPlan(userId, weekStart);
		throw redirect(303, '/plan');
	},
	confirm: async ({ locals, request }) => {
		const userId = locals.principal?.userId;
		if (!userId) return fail(401, { action: 'confirm', error: 'Authentication required.' });
		const formData = await request.formData();
		const cycleId = String(formData.get('cycleId') ?? '');
		const version = Number(formData.get('version') ?? NaN);
		if (!cycleId || !Number.isFinite(version)) {
			return fail(400, { action: 'confirm', error: 'Missing planning metadata.' });
		}
		const factory = AppFactory.create(db);
		await factory.planningController.confirmDraftPlan(userId, cycleId, version);
		throw redirect(303, '/plan');
	}
};
