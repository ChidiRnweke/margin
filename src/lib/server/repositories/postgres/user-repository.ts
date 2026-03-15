import { eq, sql } from 'drizzle-orm';
import type { Database } from '$lib/server/db/index.js';
import { users } from '$lib/server/db/schema/index.js';
import type { User } from '$lib/server/domain/models/user.js';
import type { IUserRepository } from '$lib/server/repositories/contracts/user-repository.js';

export class PostgresUserRepository implements IUserRepository {
	constructor(private db: Database) {}

	private toDomain(row: typeof users.$inferSelect): User {
		return {
			id: row.id,
			email: row.email,
			displayName: row.displayName,
			timezoneNameIana: row.timezoneNameIana,
			utcOffsetMinutesSnapshot: row.utcOffsetMinutesSnapshot ?? 0,
			dstOffsetMinutesSnapshot: row.dstOffsetMinutesSnapshot ?? 0,
			identityVerified: row.identityVerified,
			createdAt: row.createdAt
		};
	}

	async findById(userId: string): Promise<User | null> {
		const rows = await this.db.select().from(users).where(eq(users.id, userId)).limit(1);
		return rows.length > 0 ? this.toDomain(rows[0]) : null;
	}

	async findByIdentityClaim(claims: { email: string }): Promise<User | null> {
		const rows = await this.db
			.select()
			.from(users)
			.where(eq(users.email, claims.email.toLowerCase()))
			.limit(1);
		return rows.length > 0 ? this.toDomain(rows[0]) : null;
	}

	async create(user: User): Promise<User> {
		const rows = await this.db
			.insert(users)
			.values({
				id: user.id,
				email: user.email,
				displayName: user.displayName,
				timezoneNameIana: user.timezoneNameIana,
				utcOffsetMinutesSnapshot: user.utcOffsetMinutesSnapshot,
				dstOffsetMinutesSnapshot: user.dstOffsetMinutesSnapshot,
				identityVerified: user.identityVerified,
				createdAt: user.createdAt
			})
			.returning();
		return this.toDomain(rows[0]);
	}

	async delete(userId: string): Promise<void> {
		await this.db.delete(users).where(eq(users.id, userId));
	}
}
