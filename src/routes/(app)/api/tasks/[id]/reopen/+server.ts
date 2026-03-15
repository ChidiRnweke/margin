import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params, request, locals }) => {
// TODO: Wire to TaskController.reopenTask via locals.factory
const body = await request.json();
return json({ success: true, id: params.id });
};
