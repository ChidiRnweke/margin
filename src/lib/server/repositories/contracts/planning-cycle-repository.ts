import type { PlanningCycle } from '$lib/server/domain/models/planning-cycle.js';
import type { PlanningRevision } from '$lib/server/domain/models/planning-revision.js';
import type { TaskAllocation } from '$lib/server/domain/models/task-allocation.js';
import type { AllocationOutcome } from '$lib/server/domain/models/allocation-outcome.js';
import type { AspectCycleHealth } from '$lib/server/domain/models/aspect-cycle-health.js';
import type { Page, PaginationQuery } from './query-models.js';

export interface PlanningCycleAggregate {
	cycle: PlanningCycle;
	revisions: PlanningRevision[];
	allocations: TaskAllocation[];
	outcomes: AllocationOutcome[];
	healthScores: AspectCycleHealth[];
}

export interface PlanningCycleHistoryItem {
	id: string;
	weekStartIsoMonday: string;
	weekEndIsoSunday: string;
	status: string;
	revisionCount: number;
	allocationCount: number;
	confirmedAt: Date | null;
	createdAt: Date;
}

export interface PlanningCycleQuery extends PaginationQuery {
	status?: string;
}

export interface DraftRevisionInput {
	revisionId: string;
	changeReason: string;
	allocations: TaskAllocation[];
}

export interface RevisionEditInput {
	newRevisionId: string;
	changeReason: string;
	addAllocations: TaskAllocation[];
	removeAllocationIds: string[];
}

export interface OutcomeInput {
	id: string;
	outcome: string;
}

export interface IPlanningCycleRepository {
	findCycleForWeek(userId: string, weekStart: string): Promise<PlanningCycleAggregate | null>;
	findById(cycleId: string): Promise<PlanningCycleAggregate | null>;
	createCycleWithRevision(aggregate: PlanningCycleAggregate): Promise<PlanningCycleAggregate>;
	createDraftRevision(
		cycleId: string,
		input: DraftRevisionInput,
		expectedVersion: number
	): Promise<PlanningCycleAggregate>;
	confirmCycle(cycleId: string, expectedVersion: number): Promise<PlanningCycleAggregate>;
	supersedeAndCreateRevision(
		cycleId: string,
		input: DraftRevisionInput,
		expectedVersion: number
	): Promise<PlanningCycleAggregate>;
	applyPlanEditRevision(
		cycleId: string,
		input: RevisionEditInput,
		expectedVersion: number
	): Promise<PlanningCycleAggregate>;
	persistOutcome(
		allocationId: string,
		input: OutcomeInput,
		expectedVersion: number
	): Promise<AllocationOutcome>;
	persistHealthScores(cycleId: string, scores: AspectCycleHealth[]): Promise<AspectCycleHealth[]>;
	queryCycles(userId: string, query: PlanningCycleQuery): Promise<Page<PlanningCycleHistoryItem>>;
	deleteByUserId(userId: string): Promise<number>;
}
