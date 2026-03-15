import type { RequestPrincipal } from './principals.js';

export interface SessionContext {
	principal: RequestPrincipal;
	userId: string;
	sessionId: string;
}

export function requireSessionContext(locals: App.Locals): SessionContext {
	const principal = locals.principal;
	if (!principal || !principal.userId || !principal.sessionId) {
		throw new Error('AUTH_UNAUTHORIZED');
	}
	return {
		principal,
		userId: principal.userId,
		sessionId: principal.sessionId
	};
}
