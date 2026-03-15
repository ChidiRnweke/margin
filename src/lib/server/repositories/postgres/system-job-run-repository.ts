import { eq, and } from 'drizzle-orm';
import type { Database } from '$lib/server/db/index.js';
import { systemJobRuns } from '$lib/server/db/schema/index.js';
import type { SystemJobRun } from '$lib/server/domain/models/system-job-run.js';
import type { ISystemJobRunRepository } from '$lib/server/repositories/contracts/system-job-run-repository.js';

export class PostgresSystemJobRunRepository implements ISystemJobRunRepository {
	constructor(private db: Database) {}

	async findByJobRunKey(jobName: string, keyHash: string): Promise<SystemJobRun | null> {
		const rows = await this.db
			.select()
			.from(systemJobRuns)
			.where(
				and(
					eq(systemJobRuns.jobName, jobName),
					eq(systemJobRuns.jobRunKeyHash, keyHash)
				)
			)
			.limit(1);

		if (rows.length === 0) return null;
		return rows[0] as SystemJobRun;
	}

	async saveFirstResult(run: SystemJobRun): Promise<SystemJobRun> {
		const rows = await this.db
			.insert(systemJobRuns)
			.values({
				id: run.id,
				jobName: run.jobName,
				jobRunKeyHash: run.jobRunKeyHash,
				requestHash: run.requestHash,
				status: run.status,
				startedAt: run.startedAt,
				finishedAt: run.finishedAt
			})
			.returning();

		return rows[0] as SystemJobRun;
	}
}
