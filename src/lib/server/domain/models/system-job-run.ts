import { JobStatus } from '../enums.js';

export interface SystemJobRun {
	readonly id: string;
	readonly jobName: string;
	readonly jobRunKeyHash: string;
	readonly requestHash: string | null;
	readonly status: string;
	readonly startedAt: Date;
	readonly finishedAt: Date | null;
}

export function createSystemJobRun(params: {
	id: string;
	jobName: string;
	jobRunKeyHash: string;
	requestHash?: string;
}): SystemJobRun {
	return {
		...params,
		requestHash: params.requestHash ?? null,
		status: JobStatus.Running,
		startedAt: new Date(),
		finishedAt: null
	};
}
