import type { Session } from '$lib/server/domain/models/session.js';

export interface ISessionRepository {
	create(session: Session): Promise<Session>;
	findActiveByTokenHash(tokenHash: string): Promise<Session | null>;
	revoke(sessionId: string): Promise<void>;
	revokeAllForUser(userId: string): Promise<number>;
	expirePastLifetime(now: Date): Promise<number>;
}
