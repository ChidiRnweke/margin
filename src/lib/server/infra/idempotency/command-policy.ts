import type { IIdempotencyKeyRepository } from '$lib/server/repositories/contracts/idempotency-key-repository.js';
import { computeRequestHash } from './request-hash.js';
import { IdempotencyHashMismatchError } from '$lib/server/errors/domain-errors.js';

export interface CommandPolicyOptions {
	userId: string;
	commandName: string;
	idempotencyKey: string;
	requestPayload: Record<string, unknown>;
	expiresInMs?: number;
}

export class CommandIdempotencyPolicy {
	constructor(private repo: IIdempotencyKeyRepository) {}

	async execute<T>(
		options: CommandPolicyOptions,
		handler: () => Promise<T>
	): Promise<{ result: T; replayed: boolean }> {
		const keyHash = options.idempotencyKey;
		const requestHash = computeRequestHash(options.requestPayload);

		const existing = await this.repo.findByUserCommandKey(
			options.userId,
			options.commandName,
			keyHash
		);

		if (existing) {
			if (existing.requestHash !== requestHash) {
				throw new IdempotencyHashMismatchError();
			}
			return { result: JSON.parse(existing.responseRef) as T, replayed: true };
		}

		const result = await handler();

		const expiresAt = new Date(Date.now() + (options.expiresInMs ?? 24 * 60 * 60 * 1000));
		await this.repo.saveFirstResponse({
			id: crypto.randomUUID(),
			userId: options.userId,
			commandName: options.commandName,
			keyHash,
			requestHash,
			responseRef: JSON.stringify(result),
			createdAt: new Date(),
			expiresAt
		});

		return { result, replayed: false };
	}
}
