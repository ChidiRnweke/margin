import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
// TODO: Wire to TaskController.getTaskDetail via locals.factory
return json({ id: params.id, title: '', status: 'Pending' });
};

export const PATCH: RequestHandler = async ({ params, request, locals }) => {
// TODO: Wire to TaskController.updateTask via locals.factory
const body = await request.json();
return json({ success: true, id: params.id, data: body });
};
