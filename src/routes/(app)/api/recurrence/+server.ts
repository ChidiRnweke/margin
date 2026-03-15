import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const PUT: RequestHandler = async ({ request, locals }) => {
// TODO: Wire to RecurrenceController.upsertSeries via locals.factory
const body = await request.json();
return json({ success: true, data: body });
};
