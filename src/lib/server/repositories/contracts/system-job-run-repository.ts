import type { SystemJobRun } from '$lib/server/domain/models/system-job-run.js';

export interface ISystemJobRunRepository {
	findByJobRunKey(jobName: string, keyHash: string): Promise<SystemJobRun | null>;
	saveFirstResult(run: SystemJobRun): Promise<SystemJobRun>;
}
