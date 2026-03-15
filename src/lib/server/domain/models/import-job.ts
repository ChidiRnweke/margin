import { JobStatus } from '../enums.js';

export interface ImportJob {
	readonly id: string;
	readonly userId: string;
	readonly status: string;
	readonly createdEntities: number;
	readonly conflictedEntitiesRemapped: number;
	readonly startedAt: Date;
	readonly finishedAt: Date | null;
}

export function createImportJob(params: { id: string; userId: string }): ImportJob {
	return {
		...params,
		status: JobStatus.Running,
		createdEntities: 0,
		conflictedEntitiesRemapped: 0,
		startedAt: new Date(),
		finishedAt: null
	};
}
