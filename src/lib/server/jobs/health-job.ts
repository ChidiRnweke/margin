import type { IHealthComputationService } from '$lib/server/services/contracts/health-computation-service.js';

export class HealthComputationJob {
constructor(private healthService: IHealthComputationService) {}

async execute(cycleId: string) {
return this.healthService.computeCycleHealth(cycleId);
}
}
