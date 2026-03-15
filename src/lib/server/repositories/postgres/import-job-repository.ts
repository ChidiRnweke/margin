import { eq } from 'drizzle-orm';
import type { Database } from '$lib/server/db/index.js';
import { importJobs } from '$lib/server/db/schema/index.js';
import type { ImportJob } from '$lib/server/domain/models/import-job.js';
import type { IImportJobRepository } from '$lib/server/repositories/contracts/import-job-repository.js';
import { NotFoundError } from '$lib/server/errors/domain-errors.js';

export class PostgresImportJobRepository implements IImportJobRepository {
	constructor(private db: Database) {}

	async createRunning(job: ImportJob): Promise<ImportJob> {
		const rows = await this.db
			.insert(importJobs)
			.values({
				id: job.id,
				userId: job.userId,
				status: job.status,
				createdEntities: job.createdEntities,
				conflictedEntitiesRemapped: job.conflictedEntitiesRemapped,
				startedAt: job.startedAt,
				finishedAt: job.finishedAt
			})
			.returning();

		return rows[0] as ImportJob;
	}

	async markSucceeded(
		jobId: string,
		report: { createdEntities: number; conflictedEntitiesRemapped: number }
	): Promise<ImportJob> {
		const rows = await this.db
			.update(importJobs)
			.set({
				status: 'Succeeded',
				createdEntities: report.createdEntities,
				conflictedEntitiesRemapped: report.conflictedEntitiesRemapped,
				finishedAt: new Date()
			})
			.where(eq(importJobs.id, jobId))
			.returning();

		if (rows.length === 0) {
			throw new NotFoundError('ImportJob', jobId);
		}

		return rows[0] as ImportJob;
	}

	async markFailed(jobId: string, _reason: string): Promise<ImportJob> {
		const rows = await this.db
			.update(importJobs)
			.set({
				status: 'Failed',
				finishedAt: new Date()
			})
			.where(eq(importJobs.id, jobId))
			.returning();

		if (rows.length === 0) {
			throw new NotFoundError('ImportJob', jobId);
		}

		return rows[0] as ImportJob;
	}

	async deleteByUserId(userId: string): Promise<number> {
		const deleted = await this.db
			.delete(importJobs)
			.where(eq(importJobs.userId, userId))
			.returning();

		return deleted.length;
	}
}
