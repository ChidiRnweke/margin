import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url, locals }) => {
// TODO: Wire to AuditController.queryAuditTimeline via locals.factory
return json({ items: [], nextCursor: null });
};
