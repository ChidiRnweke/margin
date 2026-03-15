import type {
	IPlanningService,
	AllocationEdit,
	PlanningCycleQuery
} from '$lib/server/services/contracts/planning-service.js';

export class PlanningController {
	constructor(private planningService: IPlanningService) {}

	async generateDraftPlan(userId: string, weekStart: string) {
		return this.planningService.generateDraftPlan(userId, weekStart);
	}

	async confirmDraftPlan(userId: string, cycleId: string, expectedVersion: number) {
		return this.planningService.confirmDraftPlan(userId, cycleId, expectedVersion);
	}

	async regenerateConfirmedPlan(userId: string, cycleId: string, expectedVersion: number) {
		return this.planningService.regenerateConfirmedPlan(userId, cycleId, expectedVersion);
	}

	async editPlan(
		userId: string,
		cycleId: string,
		edits: AllocationEdit[],
		expectedVersion: number
	) {
		return this.planningService.editPlan(userId, cycleId, { edits }, expectedVersion);
	}

	async replanActiveCycles(now: Date) {
		return this.planningService.replanActiveCycles(now);
	}

	async queryCycles(userId: string, query: PlanningCycleQuery) {
		return this.planningService.queryCycles(userId, query);
	}
}
