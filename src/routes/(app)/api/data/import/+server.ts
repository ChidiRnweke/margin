import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
// TODO: Wire to DataPortabilityController.importUserData via locals.factory
const body = await request.json();
return json({ createdEntities: 0, conflictedEntitiesRemapped: 0 });
};
