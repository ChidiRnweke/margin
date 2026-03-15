import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ locals }) => {
// TODO: Wire to AuthController.deleteAccount via locals.factory
return json({ success: true });
};
