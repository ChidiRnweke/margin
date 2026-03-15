import { eq, and, sql, desc, inArray } from 'drizzle-orm';
import type { Database } from '$lib/server/db/index.js';
import {
	planningCycles,
	planningRevisions,
	taskAllocations,
	allocationOutcomes,
	aspectCycleHealth
} from '$lib/server/db/schema/index.js';
import type { AllocationOutcome } from '$lib/server/domain/models/allocation-outcome.js';
import type { AspectCycleHealth } from '$lib/server/domain/models/aspect-cycle-health.js';
import type { PlanningCycle } from '$lib/server/domain/models/planning-cycle.js';
import type { PlanningRevision } from '$lib/server/domain/models/planning-revision.js';
import type { TaskAllocation } from '$lib/server/domain/models/task-allocation.js';
import type { Page } from '$lib/server/repositories/contracts/query-models.js';
import type {
	IPlanningCycleRepository,
	PlanningCycleAggregate,
	PlanningCycleHistoryItem,
	PlanningCycleQuery,
	DraftRevisionInput,
	RevisionEditInput,
	OutcomeInput
} from '$lib/server/repositories/contracts/planning-cycle-repository.js';
import { OptimisticConcurrencyError } from '$lib/server/errors/domain-errors.js';

export class PostgresPlanningCycleRepository implements IPlanningCycleRepository {
	constructor(private db: Database) {}

	async findCycleForWeek(
		userId: string,
		weekStart: string
	): Promise<PlanningCycleAggregate | null> {
		const rows = await this.db
			.select()
			.from(planningCycles)
			.where(
				and(eq(planningCycles.userId, userId), eq(planningCycles.weekStartIsoMonday, weekStart))
			)
			.limit(1);

		if (rows.length === 0) return null;
		return this.loadAggregate(rows[0] as PlanningCycle);
	}

	async findById(cycleId: string): Promise<PlanningCycleAggregate | null> {
		const rows = await this.db
			.select()
			.from(planningCycles)
			.where(eq(planningCycles.id, cycleId))
			.limit(1);

		if (rows.length === 0) return null;
		return this.loadAggregate(rows[0] as PlanningCycle);
	}

	async createCycleWithRevision(
		aggregate: PlanningCycleAggregate
	): Promise<PlanningCycleAggregate> {
		const { cycle, revisions, allocations } = aggregate;

		// Insert cycle
		await this.db.insert(planningCycles).values({
			id: cycle.id,
			userId: cycle.userId,
			weekStartIsoMonday: cycle.weekStartIsoMonday,
			weekEndIsoSunday: cycle.weekEndIsoSunday,
			status: cycle.status,
			version: 1,
			currentRevisionId: null,
			createdAt: cycle.createdAt,
			confirmedAt: cycle.confirmedAt
		});

		// Insert revision
		if (revisions.length > 0) {
			const revision = revisions[0];
			await this.db.insert(planningRevisions).values({
				id: revision.id,
				planningCycleId: revision.planningCycleId,
				revisionNumber: revision.revisionNumber,
				status: revision.status,
				changeReason: revision.changeReason,
				diffSummary: revision.diffSummary,
				supersededAt: revision.supersededAt,
				createdAt: revision.createdAt
			});

			// Insert allocations
			if (allocations.length > 0) {
				await this.db.insert(taskAllocations).values(
					allocations.map((a) => ({
						id: a.id,
						planningRevisionId: a.planningRevisionId,
						taskId: a.taskId,
						scheduledStartUtc: a.scheduledStartUtc,
						scheduledEndUtc: a.scheduledEndUtc,
						scheduledUtcOffsetMinutes: a.scheduledUtcOffsetMinutes,
						scheduledDstOffsetMinutes: a.scheduledDstOffsetMinutes,
						allocatedMinutes: a.allocatedMinutes,
						status: a.status,
						version: a.version,
						createdAt: a.createdAt,
						cancelledAt: a.cancelledAt
					}))
				);
			}

			// Set current_revision_id
			await this.db
				.update(planningCycles)
				.set({ currentRevisionId: revision.id })
				.where(eq(planningCycles.id, cycle.id));
		}

		return (await this.findById(cycle.id))!;
	}

	async createDraftRevision(
		cycleId: string,
		input: DraftRevisionInput,
		expectedVersion: number
	): Promise<PlanningCycleAggregate> {
		// Version check and update
		const updated = await this.db
			.update(planningCycles)
			.set({
				currentRevisionId: input.revisionId,
				version: sql`${planningCycles.version} + 1`
			})
			.where(and(eq(planningCycles.id, cycleId), eq(planningCycles.version, expectedVersion)))
			.returning();

		if (updated.length === 0) {
			throw new OptimisticConcurrencyError('PlanningCycle', cycleId);
		}

		// Determine next revision number
		const existingRevisions = await this.db
			.select({ revisionNumber: planningRevisions.revisionNumber })
			.from(planningRevisions)
			.where(eq(planningRevisions.planningCycleId, cycleId))
			.orderBy(desc(planningRevisions.revisionNumber))
			.limit(1);

		const nextRevisionNumber =
			existingRevisions.length > 0 ? existingRevisions[0].revisionNumber + 1 : 1;

		// Insert new revision
		await this.db.insert(planningRevisions).values({
			id: input.revisionId,
			planningCycleId: cycleId,
			revisionNumber: nextRevisionNumber,
			status: 'Active',
			changeReason: input.changeReason,
			diffSummary: {},
			supersededAt: null,
			createdAt: new Date()
		});

		// Insert allocations
		if (input.allocations.length > 0) {
			await this.db.insert(taskAllocations).values(
				input.allocations.map((a) => ({
					id: a.id,
					planningRevisionId: a.planningRevisionId,
					taskId: a.taskId,
					scheduledStartUtc: a.scheduledStartUtc,
					scheduledEndUtc: a.scheduledEndUtc,
					scheduledUtcOffsetMinutes: a.scheduledUtcOffsetMinutes,
					scheduledDstOffsetMinutes: a.scheduledDstOffsetMinutes,
					allocatedMinutes: a.allocatedMinutes,
					status: a.status,
					version: a.version,
					createdAt: a.createdAt,
					cancelledAt: a.cancelledAt
				}))
			);
		}

		return (await this.findById(cycleId))!;
	}

	async confirmCycle(cycleId: string, expectedVersion: number): Promise<PlanningCycleAggregate> {
		const now = new Date();
		const updated = await this.db
			.update(planningCycles)
			.set({
				status: 'Confirmed',
				confirmedAt: now,
				version: sql`${planningCycles.version} + 1`
			})
			.where(and(eq(planningCycles.id, cycleId), eq(planningCycles.version, expectedVersion)))
			.returning();

		if (updated.length === 0) {
			throw new OptimisticConcurrencyError('PlanningCycle', cycleId);
		}

		return (await this.findById(cycleId))!;
	}

	async supersedeAndCreateRevision(
		cycleId: string,
		input: DraftRevisionInput,
		expectedVersion: number
	): Promise<PlanningCycleAggregate> {
		// Version check
		const cycleRows = await this.db
			.select()
			.from(planningCycles)
			.where(and(eq(planningCycles.id, cycleId), eq(planningCycles.version, expectedVersion)))
			.limit(1);

		if (cycleRows.length === 0) {
			throw new OptimisticConcurrencyError('PlanningCycle', cycleId);
		}

		const cycle = cycleRows[0];

		// Supersede the current revision
		if (cycle.currentRevisionId) {
			await this.db
				.update(planningRevisions)
				.set({
					status: 'Superseded',
					supersededAt: new Date()
				})
				.where(eq(planningRevisions.id, cycle.currentRevisionId));
		}

		// Determine next revision number
		const existingRevisions = await this.db
			.select({ revisionNumber: planningRevisions.revisionNumber })
			.from(planningRevisions)
			.where(eq(planningRevisions.planningCycleId, cycleId))
			.orderBy(desc(planningRevisions.revisionNumber))
			.limit(1);

		const nextRevisionNumber =
			existingRevisions.length > 0 ? existingRevisions[0].revisionNumber + 1 : 1;

		// Insert new revision
		await this.db.insert(planningRevisions).values({
			id: input.revisionId,
			planningCycleId: cycleId,
			revisionNumber: nextRevisionNumber,
			status: 'Active',
			changeReason: input.changeReason,
			diffSummary: {},
			supersededAt: null,
			createdAt: new Date()
		});

		// Insert allocations
		if (input.allocations.length > 0) {
			await this.db.insert(taskAllocations).values(
				input.allocations.map((a) => ({
					id: a.id,
					planningRevisionId: a.planningRevisionId,
					taskId: a.taskId,
					scheduledStartUtc: a.scheduledStartUtc,
					scheduledEndUtc: a.scheduledEndUtc,
					scheduledUtcOffsetMinutes: a.scheduledUtcOffsetMinutes,
					scheduledDstOffsetMinutes: a.scheduledDstOffsetMinutes,
					allocatedMinutes: a.allocatedMinutes,
					status: a.status,
					version: a.version,
					createdAt: a.createdAt,
					cancelledAt: a.cancelledAt
				}))
			);
		}

		// Update cycle with new current revision
		await this.db
			.update(planningCycles)
			.set({
				currentRevisionId: input.revisionId,
				version: sql`${planningCycles.version} + 1`
			})
			.where(eq(planningCycles.id, cycleId));

		return (await this.findById(cycleId))!;
	}

	async applyPlanEditRevision(
		cycleId: string,
		input: RevisionEditInput,
		expectedVersion: number
	): Promise<PlanningCycleAggregate> {
		// Version check
		const cycleRows = await this.db
			.select()
			.from(planningCycles)
			.where(and(eq(planningCycles.id, cycleId), eq(planningCycles.version, expectedVersion)))
			.limit(1);

		if (cycleRows.length === 0) {
			throw new OptimisticConcurrencyError('PlanningCycle', cycleId);
		}

		const cycle = cycleRows[0];

		// Supersede the current revision
		if (cycle.currentRevisionId) {
			await this.db
				.update(planningRevisions)
				.set({
					status: 'Superseded',
					supersededAt: new Date()
				})
				.where(eq(planningRevisions.id, cycle.currentRevisionId));
		}

		// Determine next revision number
		const existingRevisions = await this.db
			.select({ revisionNumber: planningRevisions.revisionNumber })
			.from(planningRevisions)
			.where(eq(planningRevisions.planningCycleId, cycleId))
			.orderBy(desc(planningRevisions.revisionNumber))
			.limit(1);

		const nextRevisionNumber =
			existingRevisions.length > 0 ? existingRevisions[0].revisionNumber + 1 : 1;

		// Insert new revision
		await this.db.insert(planningRevisions).values({
			id: input.newRevisionId,
			planningCycleId: cycleId,
			revisionNumber: nextRevisionNumber,
			status: 'Active',
			changeReason: input.changeReason,
			diffSummary: {},
			supersededAt: null,
			createdAt: new Date()
		});

		// Copy forward existing allocations from the superseded revision (excluding removed ones)
		if (cycle.currentRevisionId) {
			const existingAllocations = await this.db
				.select()
				.from(taskAllocations)
				.where(eq(taskAllocations.planningRevisionId, cycle.currentRevisionId));

			const keptAllocations = existingAllocations.filter(
				(a) => !input.removeAllocationIds.includes(a.id)
			);

			if (keptAllocations.length > 0) {
				await this.db.insert(taskAllocations).values(
					keptAllocations.map((a) => ({
						id: sql`gen_random_uuid()`,
						planningRevisionId: input.newRevisionId,
						taskId: a.taskId,
						scheduledStartUtc: a.scheduledStartUtc,
						scheduledEndUtc: a.scheduledEndUtc,
						scheduledUtcOffsetMinutes: a.scheduledUtcOffsetMinutes,
						scheduledDstOffsetMinutes: a.scheduledDstOffsetMinutes,
						allocatedMinutes: a.allocatedMinutes,
						status: a.status,
						version: a.version,
						createdAt: new Date(),
						cancelledAt: a.cancelledAt
					}))
				);
			}
		}

		// Insert newly added allocations
		if (input.addAllocations.length > 0) {
			await this.db.insert(taskAllocations).values(
				input.addAllocations.map((a) => ({
					id: a.id,
					planningRevisionId: a.planningRevisionId,
					taskId: a.taskId,
					scheduledStartUtc: a.scheduledStartUtc,
					scheduledEndUtc: a.scheduledEndUtc,
					scheduledUtcOffsetMinutes: a.scheduledUtcOffsetMinutes,
					scheduledDstOffsetMinutes: a.scheduledDstOffsetMinutes,
					allocatedMinutes: a.allocatedMinutes,
					status: a.status,
					version: a.version,
					createdAt: a.createdAt,
					cancelledAt: a.cancelledAt
				}))
			);
		}

		// Update cycle
		await this.db
			.update(planningCycles)
			.set({
				currentRevisionId: input.newRevisionId,
				version: sql`${planningCycles.version} + 1`
			})
			.where(eq(planningCycles.id, cycleId));

		return (await this.findById(cycleId))!;
	}

	async persistOutcome(
		allocationId: string,
		input: OutcomeInput,
		expectedVersion: number
	): Promise<AllocationOutcome> {
		// Verify the allocation exists and version matches
		const allocationRows = await this.db
			.select()
			.from(taskAllocations)
			.where(
				and(eq(taskAllocations.id, allocationId), eq(taskAllocations.version, expectedVersion))
			)
			.limit(1);

		if (allocationRows.length === 0) {
			throw new OptimisticConcurrencyError('TaskAllocation', allocationId);
		}

		const rows = await this.db
			.insert(allocationOutcomes)
			.values({
				id: input.id,
				taskAllocationId: allocationId,
				outcome: input.outcome,
				markedAt: new Date()
			})
			.returning();

		return rows[0] as AllocationOutcome;
	}

	async persistHealthScores(
		cycleId: string,
		scores: AspectCycleHealth[]
	): Promise<AspectCycleHealth[]> {
		// Delete old scores for this cycle
		await this.db.delete(aspectCycleHealth).where(eq(aspectCycleHealth.planningCycleId, cycleId));

		if (scores.length === 0) return [];

		// Insert new scores
		const rows = await this.db
			.insert(aspectCycleHealth)
			.values(
				scores.map((s) => ({
					id: s.id,
					planningCycleId: s.planningCycleId,
					aspectId: s.aspectId,
					targetMinutes: s.targetMinutes,
					completedMinutes: s.completedMinutes,
					healthScore: s.healthScore,
					computedAt: s.computedAt
				}))
			)
			.returning();

		return rows as AspectCycleHealth[];
	}

	async queryCycles(
		userId: string,
		query: PlanningCycleQuery
	): Promise<Page<PlanningCycleHistoryItem>> {
		const limit = query.limit ?? 20;
		const offset = query.cursor ? parseInt(query.cursor, 10) : 0;

		// Build conditions
		const conditions = [eq(planningCycles.userId, userId)];
		if (query.status) {
			conditions.push(eq(planningCycles.status, query.status));
		}

		const whereClause = and(...conditions);

		// Count total
		const countResult = await this.db
			.select({ count: sql<number>`count(*)::int` })
			.from(planningCycles)
			.where(whereClause);

		const totalCount = countResult[0]?.count ?? 0;

		// Fetch page
		const rows = await this.db
			.select()
			.from(planningCycles)
			.where(whereClause)
			.orderBy(desc(planningCycles.weekStartIsoMonday))
			.limit(limit)
			.offset(offset);

		// For each cycle, get revision and allocation counts
		const items: PlanningCycleHistoryItem[] = await Promise.all(
			rows.map(async (row) => {
				const revCount = await this.db
					.select({ count: sql<number>`count(*)::int` })
					.from(planningRevisions)
					.where(eq(planningRevisions.planningCycleId, row.id));

				const allocCount = row.currentRevisionId
					? await this.db
							.select({ count: sql<number>`count(*)::int` })
							.from(taskAllocations)
							.where(eq(taskAllocations.planningRevisionId, row.currentRevisionId))
					: [{ count: 0 }];

				return {
					id: row.id,
					weekStartIsoMonday: row.weekStartIsoMonday,
					weekEndIsoSunday: row.weekEndIsoSunday,
					status: row.status,
					revisionCount: revCount[0]?.count ?? 0,
					allocationCount: allocCount[0]?.count ?? 0,
					confirmedAt: row.confirmedAt,
					createdAt: row.createdAt
				};
			})
		);

		const nextOffset = offset + rows.length;
		const hasMore = nextOffset < totalCount;

		return {
			items,
			totalCount,
			cursor: hasMore ? String(nextOffset) : null,
			hasMore
		};
	}

	async deleteByUserId(userId: string): Promise<number> {
		const deleted = await this.db
			.delete(planningCycles)
			.where(eq(planningCycles.userId, userId))
			.returning();

		return deleted.length;
	}

	private async loadAggregate(cycle: PlanningCycle): Promise<PlanningCycleAggregate> {
		const revisionRows = await this.db
			.select()
			.from(planningRevisions)
			.where(eq(planningRevisions.planningCycleId, cycle.id))
			.orderBy(planningRevisions.revisionNumber);

		const revisionIds = revisionRows.map((r) => r.id);

		let allocationRows: TaskAllocation[] = [];
		let outcomeRows: AllocationOutcome[] = [];

		if (revisionIds.length > 0) {
			allocationRows = (await this.db
				.select()
				.from(taskAllocations)
				.where(inArray(taskAllocations.planningRevisionId, revisionIds))) as TaskAllocation[];

			const allocationIds = allocationRows.map((a) => a.id);
			if (allocationIds.length > 0) {
				outcomeRows = (await this.db
					.select()
					.from(allocationOutcomes)
					.where(
						inArray(allocationOutcomes.taskAllocationId, allocationIds)
					)) as AllocationOutcome[];
			}
		}

		const healthRows = await this.db
			.select()
			.from(aspectCycleHealth)
			.where(eq(aspectCycleHealth.planningCycleId, cycle.id));

		return {
			cycle,
			revisions: revisionRows as PlanningRevision[],
			allocations: allocationRows,
			outcomes: outcomeRows,
			healthScores: healthRows as AspectCycleHealth[]
		};
	}
}
