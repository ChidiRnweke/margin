import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ locals }) => {
// TODO: Wire to DataPortabilityController.exportUserData via locals.factory
return json({ version: '1.0', exportedAt: new Date().toISOString(), data: {} });
};
