import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
// TODO: Wire to AspectController.createAspect via locals.factory
const body = await request.json();
return json({ success: true, data: body });
};

export const GET: RequestHandler = async ({ url, locals }) => {
// TODO: Wire to AspectController.queryAspects via locals.factory
return json({ items: [], nextCursor: null });
};
