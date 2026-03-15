import { SessionStatus } from '../enums.js';

export interface Session {
	readonly id: string;
	readonly userId: string;
	readonly sessionTokenHash: string;
	readonly status: string;
	readonly createdAt: Date;
	readonly expiresAt: Date;
	readonly revokedAt: Date | null;
}

export function createSession(params: {
	id: string;
	userId: string;
	sessionTokenHash: string;
	expiresAt: Date;
}): Session {
	return {
		id: params.id,
		userId: params.userId,
		sessionTokenHash: params.sessionTokenHash,
		status: SessionStatus.Active,
		createdAt: new Date(),
		expiresAt: params.expiresAt,
		revokedAt: null
	};
}

export function revokeSession(session: Session): Session {
	return { ...session, status: SessionStatus.Revoked, revokedAt: new Date() };
}

export function isSessionExpired(session: Session, now: Date): boolean {
	return session.expiresAt <= now;
}
