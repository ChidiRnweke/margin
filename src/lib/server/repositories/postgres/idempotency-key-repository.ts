import { eq, and } from 'drizzle-orm';
import type { Database } from '$lib/server/db/index.js';
import { idempotencyKeys } from '$lib/server/db/schema/index.js';
import type { IdempotencyKey } from '$lib/server/domain/models/idempotency-key.js';
import type { IIdempotencyKeyRepository } from '$lib/server/repositories/contracts/idempotency-key-repository.js';

export class PostgresIdempotencyKeyRepository implements IIdempotencyKeyRepository {
	constructor(private db: Database) {}

	async findByUserCommandKey(
		userId: string,
		commandName: string,
		keyHash: string
	): Promise<IdempotencyKey | null> {
		const rows = await this.db
			.select()
			.from(idempotencyKeys)
			.where(
				and(
					eq(idempotencyKeys.userId, userId),
					eq(idempotencyKeys.commandName, commandName),
					eq(idempotencyKeys.keyHash, keyHash)
				)
			)
			.limit(1);

		if (rows.length === 0) return null;
		return rows[0] as IdempotencyKey;
	}

	async saveFirstResponse(record: IdempotencyKey): Promise<IdempotencyKey> {
		const rows = await this.db
			.insert(idempotencyKeys)
			.values({
				id: record.id,
				userId: record.userId,
				commandName: record.commandName,
				keyHash: record.keyHash,
				requestHash: record.requestHash,
				responseRef: record.responseRef,
				createdAt: record.createdAt,
				expiresAt: record.expiresAt
			})
			.returning();

		return rows[0] as IdempotencyKey;
	}

	async deleteByUserId(userId: string): Promise<number> {
		const deleted = await this.db
			.delete(idempotencyKeys)
			.where(eq(idempotencyKeys.userId, userId))
			.returning();

		return deleted.length;
	}
}
