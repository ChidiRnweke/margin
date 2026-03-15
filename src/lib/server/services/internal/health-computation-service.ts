import type {
	IHealthComputationService,
	HealthComputationResult
} from '$lib/server/services/contracts/health-computation-service.js';
import type { IPlanningCycleRepository } from '$lib/server/repositories/contracts/planning-cycle-repository.js';
import type { IAspectRepository } from '$lib/server/repositories/contracts/aspect-repository.js';
import { createAspectCycleHealth } from '$lib/server/domain/models/aspect-cycle-health.js';
import { NotFoundError } from '$lib/server/errors/domain-errors.js';

export class HealthComputationService implements IHealthComputationService {
	constructor(
		private planningCycleRepo: IPlanningCycleRepository,
		private aspectRepo: IAspectRepository
	) {}

	async computeCycleHealth(cycleId: string): Promise<HealthComputationResult> {
		const aggregate = await this.planningCycleRepo.findById(cycleId);
		if (!aggregate) throw new NotFoundError('PlanningCycle', cycleId);

		const aspects = await this.aspectRepo.listActiveForUser(aggregate.cycle.userId);
		const scores: HealthComputationResult['scores'] = [];

		const nonCancelledAllocations = aggregate.allocations.filter(
			(a) => a.status !== 'Cancelled'
		);
		const totalAllocated = nonCancelledAllocations.reduce(
			(sum, a) => sum + a.allocatedMinutes,
			0
		);

		const attendedAllocationIds = new Set(
			aggregate.outcomes.filter((o) => o.outcome === 'Attended').map((o) => o.taskAllocationId)
		);

		for (const aspect of aspects) {
			const target = aspect.targetPercentage ?? 0;
			const targetMinutes =
				totalAllocated > 0 ? Math.round((totalAllocated * target) / 100) : 0;

			const completedMinutes = nonCancelledAllocations
				.filter((a) => attendedAllocationIds.has(a.id))
				.reduce((sum, a) => sum + a.allocatedMinutes, 0);

			const healthScore = targetMinutes > 0 ? Math.min(completedMinutes / targetMinutes, 1) : 1;

			createAspectCycleHealth({
				id: crypto.randomUUID(),
				planningCycleId: cycleId,
				aspectId: aspect.id,
				targetMinutes,
				completedMinutes,
				healthScore
			});

			scores.push({
				aspectId: aspect.id,
				healthScore,
				targetMinutes,
				completedMinutes
			});
		}

		return { scores };
	}
}
