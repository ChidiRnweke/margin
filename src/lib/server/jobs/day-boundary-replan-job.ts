import type { IPlanningService } from '$lib/server/services/contracts/planning-service.js';

export class DayBoundaryReplanJob {
	constructor(private planningService: IPlanningService) {}

	async execute(): Promise<{ cyclesProcessed: number; revisionsCreated: number }> {
		return this.planningService.replanActiveCycles(new Date());
	}
}
