import { AllocationOutcomeStatus } from '../enums.js';
import { InputError } from '$lib/server/errors/domain-errors.js';

export interface AllocationOutcome {
	readonly id: string;
	readonly taskAllocationId: string;
	readonly outcome: string;
	readonly markedAt: Date;
}

export function createAllocationOutcome(params: {
	id: string;
	taskAllocationId: string;
	outcome: string;
}): AllocationOutcome {
	if (
		params.outcome !== AllocationOutcomeStatus.Attended &&
		params.outcome !== AllocationOutcomeStatus.Missed
	) {
		throw new InputError('Outcome must be Attended or Missed');
	}
	return { ...params, markedAt: new Date() };
}
