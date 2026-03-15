import type { ISystemJobRunRepository } from '$lib/server/repositories/contracts/system-job-run-repository.js';
import { computeRequestHash } from './request-hash.js';
import { JobStatus } from '$lib/server/domain/enums.js';

export interface JobPolicyOptions {
	jobName: string;
	jobRunKey: string;
	requestPayload?: Record<string, unknown>;
}

export class JobIdempotencyPolicy {
	constructor(private repo: ISystemJobRunRepository) {}

	async execute<T>(
		options: JobPolicyOptions,
		handler: () => Promise<T>
	): Promise<{ result: T; replayed: boolean }> {
		const keyHash = options.jobRunKey;
		const requestHash = options.requestPayload ? computeRequestHash(options.requestPayload) : null;

		const existing = await this.repo.findByJobRunKey(options.jobName, keyHash);
		if (existing && existing.status === JobStatus.Succeeded) {
			return { result: undefined as T, replayed: true };
		}

		const run = {
			id: crypto.randomUUID(),
			jobName: options.jobName,
			jobRunKeyHash: keyHash,
			requestHash,
			status: JobStatus.Running,
			startedAt: new Date(),
			finishedAt: null
		};
		await this.repo.saveFirstResult(run);

		const result = await handler();
		return { result, replayed: false };
	}
}
