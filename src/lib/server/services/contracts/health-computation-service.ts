export interface HealthComputationResult {
  scores: Array<{ aspectId: string; healthScore: number; targetMinutes: number; completedMinutes: number }>;
}

export interface IHealthComputationService {
  computeCycleHealth(cycleId: string): Promise<HealthComputationResult>;
}
