import { eq, and, sql, lte } from 'drizzle-orm';
import type { Database } from '$lib/server/db/index.js';
import { sessions } from '$lib/server/db/schema/index.js';
import type { Session } from '$lib/server/domain/models/session.js';
import type { ISessionRepository } from '$lib/server/repositories/contracts/session-repository.js';
import { SessionStatus } from '$lib/server/domain/enums.js';

export class PostgresSessionRepository implements ISessionRepository {
	constructor(private db: Database) {}

	private toDomain(row: typeof sessions.$inferSelect): Session {
		return {
			id: row.id,
			userId: row.userId,
			sessionTokenHash: row.sessionTokenHash,
			status: row.status,
			createdAt: row.createdAt,
			expiresAt: row.expiresAt,
			revokedAt: row.revokedAt
		};
	}

	async create(session: Session): Promise<Session> {
		const rows = await this.db
			.insert(sessions)
			.values({
				id: session.id,
				userId: session.userId,
				sessionTokenHash: session.sessionTokenHash,
				status: session.status,
				createdAt: session.createdAt,
				expiresAt: session.expiresAt,
				revokedAt: session.revokedAt
			})
			.returning();
		return this.toDomain(rows[0]);
	}

	async findActiveByTokenHash(tokenHash: string): Promise<Session | null> {
		const rows = await this.db
			.select()
			.from(sessions)
			.where(
				and(
					eq(sessions.sessionTokenHash, tokenHash),
					eq(sessions.status, SessionStatus.Active)
				)
			)
			.limit(1);
		return rows.length > 0 ? this.toDomain(rows[0]) : null;
	}

	async revoke(sessionId: string): Promise<void> {
		await this.db
			.update(sessions)
			.set({ status: SessionStatus.Revoked, revokedAt: new Date() })
			.where(eq(sessions.id, sessionId));
	}

	async revokeAllForUser(userId: string): Promise<number> {
		const result = await this.db
			.update(sessions)
			.set({ status: SessionStatus.Revoked, revokedAt: new Date() })
			.where(and(eq(sessions.userId, userId), eq(sessions.status, SessionStatus.Active)))
			.returning({ id: sessions.id });
		return result.length;
	}

	async expirePastLifetime(now: Date): Promise<number> {
		const result = await this.db
			.update(sessions)
			.set({ status: SessionStatus.Expired })
			.where(and(eq(sessions.status, SessionStatus.Active), lte(sessions.expiresAt, now)))
			.returning({ id: sessions.id });
		return result.length;
	}
}
