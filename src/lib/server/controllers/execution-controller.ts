import type {
	IExecutionService,
	MarkOutcomeInput
} from '$lib/server/services/contracts/execution-service.js';

export class ExecutionController {
	constructor(private executionService: IExecutionService) {}

	async markAllocationOutcome(
		userId: string,
		allocationId: string,
		input: MarkOutcomeInput,
		expectedVersion: number
	) {
		return this.executionService.markAllocationOutcome(
			userId,
			allocationId,
			input,
			expectedVersion
		);
	}
}
