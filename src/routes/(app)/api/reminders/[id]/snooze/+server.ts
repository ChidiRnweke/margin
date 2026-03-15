import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request, locals }) => {
// TODO: Wire to ReminderController.snoozeReminder via locals.factory
const body = await request.json();
return json({ success: true, id: params.id, data: body });
};
