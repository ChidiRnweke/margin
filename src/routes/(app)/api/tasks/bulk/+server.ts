import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
// TODO: Wire to TaskController.bulkMutateTasks via locals.factory
const body = await request.json();
return json({ results: [] });
};
