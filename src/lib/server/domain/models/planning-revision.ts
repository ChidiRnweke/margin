import { PlanningRevisionStatus } from '../enums.js';

export interface PlanningRevision {
	readonly id: string;
	readonly planningCycleId: string;
	readonly revisionNumber: number;
	readonly status: string;
	readonly changeReason: string;
	readonly diffSummary: Record<string, unknown>;
	readonly supersededAt: Date | null;
	readonly createdAt: Date;
}

export function createPlanningRevision(params: {
	id: string;
	planningCycleId: string;
	revisionNumber: number;
	changeReason: string;
	diffSummary?: Record<string, unknown>;
}): PlanningRevision {
	return {
		...params,
		status: PlanningRevisionStatus.Active,
		diffSummary: params.diffSummary ?? {},
		supersededAt: null,
		createdAt: new Date()
	};
}

export function supersedePlanningRevision(revision: PlanningRevision): PlanningRevision {
	return { ...revision, status: PlanningRevisionStatus.Superseded, supersededAt: new Date() };
}
