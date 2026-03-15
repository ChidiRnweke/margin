import { PlanningCycleStatus } from '../enums.js';
import { InputError, StateTransitionError } from '$lib/server/errors/domain-errors.js';

export interface PlanningCycle {
	readonly id: string;
	readonly userId: string;
	readonly weekStartIsoMonday: string;
	readonly weekEndIsoSunday: string;
	readonly status: string;
	readonly version: number;
	readonly currentRevisionId: string | null;
	readonly createdAt: Date;
	readonly confirmedAt: Date | null;
}

export function createPlanningCycle(params: {
	id: string;
	userId: string;
	weekStartIsoMonday: string;
	weekEndIsoSunday: string;
}): PlanningCycle {
	if (!params.weekStartIsoMonday) throw new InputError('Week start is required');
	return {
		...params,
		status: PlanningCycleStatus.Draft,
		version: 1,
		currentRevisionId: null,
		createdAt: new Date(),
		confirmedAt: null
	};
}

export function confirmCycle(cycle: PlanningCycle): PlanningCycle {
	if (cycle.status !== PlanningCycleStatus.Draft)
		throw new StateTransitionError('Can only confirm draft cycles');
	return { ...cycle, status: PlanningCycleStatus.Confirmed, confirmedAt: new Date() };
}
