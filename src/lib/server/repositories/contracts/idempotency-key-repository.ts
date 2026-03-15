import type { IdempotencyKey } from '$lib/server/domain/models/idempotency-key.js';

export interface IIdempotencyKeyRepository {
	findByUserCommandKey(
		userId: string,
		commandName: string,
		keyHash: string
	): Promise<IdempotencyKey | null>;
	saveFirstResponse(record: IdempotencyKey): Promise<IdempotencyKey>;
	deleteByUserId(userId: string): Promise<number>;
}
