import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request, locals }) => {
// TODO: Wire to PlanningController.editPlan via locals.factory
const body = await request.json();
return json({ revisionId: '', revisionNumber: 0, allocations: [] });
};
