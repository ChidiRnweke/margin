import type {
	IExecutionService,
	MarkOutcomeInput
} from '$lib/server/services/contracts/execution-service.js';
import type { IPlanningCycleRepository } from '$lib/server/repositories/contracts/planning-cycle-repository.js';
import type { AuditEmitter } from '$lib/server/infra/audit/audit-emitter.js';

export class ExecutionService implements IExecutionService {
	constructor(
		private planningCycleRepo: IPlanningCycleRepository,
		private auditEmitter: AuditEmitter
	) {}

	async markAllocationOutcome(
		userId: string,
		allocationId: string,
		input: MarkOutcomeInput,
		expectedVersion: number
	) {
		const outcome = await this.planningCycleRepo.persistOutcome(
			allocationId,
			{ id: crypto.randomUUID(), outcome: input.outcome },
			expectedVersion
		);
		await this.auditEmitter.emit({
			userId,
			actorPrincipalType: 'UserSession',
			eventType: 'allocation.outcome_marked',
			entityType: 'AllocationOutcome',
			entityId: outcome.id,
			after: { allocationId, outcome: input.outcome }
		});
		return outcome;
	}
}
