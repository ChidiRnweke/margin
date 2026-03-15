import type { Handle } from '@sveltejs/kit';
import { getSessionCookie } from '$lib/server/infra/auth/session-cookie.js';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionToken = getSessionCookie(event.cookies);

	if (sessionToken) {
		// In production, validate session token against DB
		// For dev, trust the cookie
		event.locals.principal = {
			type: 'UserSession' as const,
			userId: sessionToken.split(':')[0] || 'dev-user-id',
			sessionId: sessionToken.split(':')[1] || 'dev-session-id'
		};
	}

	event.locals.principal = event.locals.principal ?? undefined;
	const response = await resolve(event);
	return response;
};
