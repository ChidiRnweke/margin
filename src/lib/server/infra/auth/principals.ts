export type PrincipalType = 'UserSession' | 'ServicePrincipal';

export interface RequestPrincipal {
	type: PrincipalType;
	userId: string;
	sessionId?: string;
	ref?: string;
}

export function createUserSessionPrincipal(userId: string, sessionId: string): RequestPrincipal {
	return { type: 'UserSession', userId, sessionId, ref: sessionId };
}

export function createServicePrincipal(userId: string, jobName: string): RequestPrincipal {
	return { type: 'ServicePrincipal', userId, ref: jobName };
}
