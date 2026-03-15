export interface PlanningDraftResult {
	cycleId: string;
	revisionId: string;
	allocations: unknown[];
}

export interface AllocationEdit {
	allocationId: string;
	scheduledStartUtc?: string;
	scheduledEndUtc?: string;
	cancel?: boolean;
}

export interface PlanningRevisionSnapshot {
	revisionId: string;
	revisionNumber: number;
	allocations: unknown[];
}

export interface ReplanSummary {
	cyclesProcessed: number;
	revisionsCreated: number;
}

export interface PlanningCycleQuery {
	cursor?: string;
	limit?: number;
}

export interface IPlanningService {
	generateDraftPlan(userId: string, weekStart: string): Promise<PlanningDraftResult>;
	confirmDraftPlan(userId: string, cycleId: string, expectedVersion: number): Promise<unknown>;
	regenerateConfirmedPlan(
		userId: string,
		cycleId: string,
		expectedVersion: number
	): Promise<unknown>;
	editPlan(
		userId: string,
		cycleId: string,
		input: { edits: AllocationEdit[] },
		expectedVersion: number
	): Promise<PlanningRevisionSnapshot>;
	replanActiveCycles(now: Date): Promise<ReplanSummary>;
	queryCycles(
		userId: string,
		query: PlanningCycleQuery
	): Promise<{ items: unknown[]; nextCursor?: string }>;
}
