import type { ImportJob } from '$lib/server/domain/models/import-job.js';

export interface IImportJobRepository {
	createRunning(job: ImportJob): Promise<ImportJob>;
	markSucceeded(
		jobId: string,
		report: { createdEntities: number; conflictedEntitiesRemapped: number }
	): Promise<ImportJob>;
	markFailed(jobId: string, reason: string): Promise<ImportJob>;
	deleteByUserId(userId: string): Promise<number>;
}
