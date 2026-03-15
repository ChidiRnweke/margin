import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Session loading will be implemented when auth service is wired
	// For now, set principal to undefined (unauthenticated)
	event.locals.principal = undefined;

	const response = await resolve(event);
	return response;
};
