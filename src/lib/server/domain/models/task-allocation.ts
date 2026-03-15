import { AllocationStatus } from '../enums.js';
import { PositiveMinutes } from '../value-objects/bounded-int.js';

export interface TaskAllocation {
	readonly id: string;
	readonly planningRevisionId: string;
	readonly taskId: string;
	readonly scheduledStartUtc: Date;
	readonly scheduledEndUtc: Date;
	readonly scheduledUtcOffsetMinutes: number;
	readonly scheduledDstOffsetMinutes: number;
	readonly allocatedMinutes: number;
	readonly status: string;
	readonly version: number;
	readonly createdAt: Date;
	readonly cancelledAt: Date | null;
}

export function createTaskAllocation(params: {
	id: string;
	planningRevisionId: string;
	taskId: string;
	scheduledStartUtc: Date;
	scheduledEndUtc: Date;
	scheduledUtcOffsetMinutes: number;
	scheduledDstOffsetMinutes: number;
	allocatedMinutes: number;
}): TaskAllocation {
	new PositiveMinutes(params.allocatedMinutes);
	return {
		...params,
		status: AllocationStatus.Proposed,
		version: 1,
		createdAt: new Date(),
		cancelledAt: null
	};
}
