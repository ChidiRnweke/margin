import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ request, locals }) => {
// TODO: Wire to ProfileController.updateProfile via locals.factory
const body = await request.json();
return json({ success: true, data: body });
};
