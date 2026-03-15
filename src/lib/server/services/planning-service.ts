import type {
	IPlanningCycleRepository,
	DraftRevisionInput
} from '$lib/server/repositories/contracts/planning-cycle-repository.js';
import type { ITaskRepository } from '$lib/server/repositories/contracts/task-repository.js';
import type { IAvailabilityRepository } from '$lib/server/repositories/contracts/availability-repository.js';
import type { IPlanningProfileRepository } from '$lib/server/repositories/contracts/planning-profile-repository.js';
import type { IAspectRepository } from '$lib/server/repositories/contracts/aspect-repository.js';
import type { IUserRepository } from '$lib/server/repositories/contracts/user-repository.js';
import type { ISchedulerEngine } from '$lib/server/services/contracts/scheduler-engine.js';
import type { IAvailabilityWindowResolver } from '$lib/server/services/contracts/availability-window-resolver.js';
import type { AuditEmitter } from '$lib/server/infra/audit/audit-emitter.js';
import type {
	IPlanningService,
	PlanningDraftResult,
	AllocationEdit,
	PlanningRevisionSnapshot,
	ReplanSummary,
	PlanningCycleQuery
} from '$lib/server/services/contracts/planning-service.js';
import type { TaskAllocation } from '$lib/server/domain/models/task-allocation.js';
import { createPlanningCycle } from '$lib/server/domain/models/planning-cycle.js';
import { createPlanningRevision } from '$lib/server/domain/models/planning-revision.js';
import { TaskStatus, PlanningCycleStatus } from '$lib/server/domain/enums.js';
import { NotFoundError, StateTransitionError } from '$lib/server/errors/domain-errors.js';

export class PlanningService implements IPlanningService {
	constructor(
		private planningCycleRepo: IPlanningCycleRepository,
		private taskRepo: ITaskRepository,
		private availabilityRepo: IAvailabilityRepository,
		private profileRepo: IPlanningProfileRepository,
		private aspectRepo: IAspectRepository,
		private userRepo: IUserRepository,
		private schedulerEngine: ISchedulerEngine,
		private windowResolver: IAvailabilityWindowResolver,
		private auditEmitter: AuditEmitter
	) {}

	async generateDraftPlan(userId: string, weekStart: string): Promise<PlanningDraftResult> {
		const weekEnd = this.computeWeekEnd(weekStart);

		const [profile, aspects, user] = await Promise.all([
			this.profileRepo.getByUserId(userId),
			this.aspectRepo.listActiveForUser(userId),
			this.userRepo.findById(userId)
		]);

		const timezone = user?.timezoneNameIana ?? 'UTC';

		// Load tasks: backlog + in-progress across all active aspects
		const aspectIds = aspects.map((a) => a.id);
		const taskPages = await Promise.all(
			aspectIds.map((aspectId) =>
				this.taskRepo.query(userId, {
					aspectId,
					status: [TaskStatus.Backlog, TaskStatus.InProgress].join(',')
				})
			)
		);
		const tasks = taskPages.flatMap((p) => p.items);

		// Load full task objects for scheduling
		const taskIds = tasks.map((t) => t.id);
		const fullTasks = taskIds.length > 0 ? await this.taskRepo.bulkLoad(taskIds) : [];

		// Load availability for the week
		const aggregates = await this.availabilityRepo.queryLiveBlocksForRange(userId, {
			start: weekStart,
			end: weekEnd
		});

		const windows = this.windowResolver.resolveEffectiveWindows(
			aggregates,
			{ rangeStart: weekStart, rangeEnd: weekEnd },
			timezone
		);

		// Gather existing locks
		const locks = await Promise.all(fullTasks.map((t) => this.taskRepo.findActiveLock(t.id)));
		const activeLocks = locks.filter((l) => l !== null);

		// Run the scheduler
		const result = this.schedulerEngine.buildWeeklySchedule(
			fullTasks,
			windows,
			profile,
			activeLocks,
			{ weekStart, weekEnd }
		);

		// Create cycle + revision + allocations
		const cycleId = crypto.randomUUID();
		const revisionId = crypto.randomUUID();

		const cycle = createPlanningCycle({
			id: cycleId,
			userId,
			weekStartIsoMonday: weekStart,
			weekEndIsoSunday: weekEnd
		});

		const revision = createPlanningRevision({
			id: revisionId,
			planningCycleId: cycleId,
			revisionNumber: 1,
			changeReason: 'Initial draft'
		});

		const aggregate = await this.planningCycleRepo.createCycleWithRevision({
			cycle: { ...cycle, currentRevisionId: revisionId },
			revisions: [revision],
			allocations: result.allocations as TaskAllocation[],
			outcomes: [],
			healthScores: []
		});

		return {
			cycleId: aggregate.cycle.id,
			revisionId,
			allocations: aggregate.allocations
		};
	}

	async confirmDraftPlan(
		userId: string,
		cycleId: string,
		expectedVersion: number
	): Promise<unknown> {
		const aggregate = await this.loadOwnedCycle(userId, cycleId);

		if (aggregate.cycle.status !== PlanningCycleStatus.Draft) {
			throw new StateTransitionError('Can only confirm draft cycles');
		}

		return (await this.planningCycleRepo.confirmCycle(cycleId, expectedVersion)).cycle;
	}

	async regenerateConfirmedPlan(
		userId: string,
		cycleId: string,
		expectedVersion: number
	): Promise<unknown> {
		const aggregate = await this.loadOwnedCycle(userId, cycleId);
		const cycle = aggregate.cycle;

		const [profile, user] = await Promise.all([
			this.profileRepo.getByUserId(userId),
			this.userRepo.findById(userId)
		]);

		const timezone = user?.timezoneNameIana ?? 'UTC';

		// Reload tasks and availability
		const aspects = await this.aspectRepo.listActiveForUser(userId);
		const aspectIds = aspects.map((a) => a.id);

		const taskPages = await Promise.all(
			aspectIds.map((aspectId) =>
				this.taskRepo.query(userId, {
					aspectId,
					status: [TaskStatus.Backlog, TaskStatus.InProgress].join(',')
				})
			)
		);
		const taskIds = taskPages.flatMap((p) => p.items).map((t) => t.id);
		const fullTasks = taskIds.length > 0 ? await this.taskRepo.bulkLoad(taskIds) : [];

		const avail = await this.availabilityRepo.queryLiveBlocksForRange(userId, {
			start: cycle.weekStartIsoMonday,
			end: cycle.weekEndIsoSunday
		});

		const windows = this.windowResolver.resolveEffectiveWindows(
			avail,
			{ rangeStart: cycle.weekStartIsoMonday, rangeEnd: cycle.weekEndIsoSunday },
			timezone
		);

		const locks = await Promise.all(fullTasks.map((t) => this.taskRepo.findActiveLock(t.id)));
		const activeLocks = locks.filter((l) => l !== null);

		const result = this.schedulerEngine.buildWeeklySchedule(
			fullTasks,
			windows,
			profile,
			activeLocks,
			{ weekStart: cycle.weekStartIsoMonday, weekEnd: cycle.weekEndIsoSunday }
		);

		const newRevisionId = crypto.randomUUID();
		const revisionInput: DraftRevisionInput = {
			revisionId: newRevisionId,
			changeReason: 'Regenerated plan',
			allocations: result.allocations as TaskAllocation[]
		};

		const updated = await this.planningCycleRepo.supersedeAndCreateRevision(
			cycleId,
			revisionInput,
			expectedVersion
		);

		return updated.cycle;
	}

	async editPlan(
		userId: string,
		cycleId: string,
		input: { edits: AllocationEdit[] },
		expectedVersion: number
	): Promise<PlanningRevisionSnapshot> {
		const aggregate = await this.loadOwnedCycle(userId, cycleId);

		const removeIds: string[] = [];
		const addAllocations: TaskAllocation[] = [];

		for (const edit of input.edits) {
			if (edit.cancel) {
				removeIds.push(edit.allocationId);
			} else if (edit.scheduledStartUtc && edit.scheduledEndUtc) {
				// Find the original allocation and create a modified version
				const original = aggregate.allocations.find((a) => a.id === edit.allocationId);
				if (!original) throw new NotFoundError('TaskAllocation', edit.allocationId);

				removeIds.push(edit.allocationId);

				const startUtc = new Date(edit.scheduledStartUtc);
				const endUtc = new Date(edit.scheduledEndUtc);
				const allocatedMinutes = Math.round((endUtc.getTime() - startUtc.getTime()) / 60_000);

				const { createTaskAllocation } =
					await import('$lib/server/domain/models/task-allocation.js');
				addAllocations.push(
					createTaskAllocation({
						id: crypto.randomUUID(),
						planningRevisionId: aggregate.cycle.currentRevisionId ?? '',
						taskId: original.taskId,
						scheduledStartUtc: startUtc,
						scheduledEndUtc: endUtc,
						scheduledUtcOffsetMinutes: original.scheduledUtcOffsetMinutes,
						scheduledDstOffsetMinutes: original.scheduledDstOffsetMinutes,
						allocatedMinutes
					})
				);
			}
		}

		const newRevisionId = crypto.randomUUID();
		const updated = await this.planningCycleRepo.applyPlanEditRevision(
			cycleId,
			{
				newRevisionId,
				changeReason: 'Manual edit',
				addAllocations,
				removeAllocationIds: removeIds
			},
			expectedVersion
		);

		const activeRevision = updated.revisions.find((r) => r.status === 'Active');
		return {
			revisionId: activeRevision?.id ?? newRevisionId,
			revisionNumber: activeRevision?.revisionNumber ?? updated.revisions.length,
			allocations: updated.allocations
		};
	}

	async replanActiveCycles(now: Date): Promise<ReplanSummary> {
		const weekStart = this.getIsoMondayForDate(now);

		// Query confirmed cycles for the current week
		// This is a system-level operation, so we search across all users
		let cyclesProcessed = 0;
		let revisionsCreated = 0;

		// Since we don't have a method to list all active cycles across users,
		// this is designed to be called per-user or with a repo method that supports it.
		// For now, return summary of processed cycles.
		return { cyclesProcessed, revisionsCreated };
	}

	async queryCycles(
		userId: string,
		query: PlanningCycleQuery
	): Promise<{ items: unknown[]; nextCursor?: string }> {
		const page = await this.planningCycleRepo.queryCycles(userId, query);
		return { items: page.items, nextCursor: page.cursor ?? undefined };
	}

	private async loadOwnedCycle(userId: string, cycleId: string) {
		const aggregate = await this.planningCycleRepo.findById(cycleId);
		if (!aggregate || aggregate.cycle.userId !== userId) {
			throw new NotFoundError('PlanningCycle', cycleId);
		}
		return aggregate;
	}

	private computeWeekEnd(weekStart: string): string {
		const start = new Date(weekStart);
		const end = new Date(start);
		end.setUTCDate(end.getUTCDate() + 7);
		return end.toISOString().slice(0, 10);
	}

	private getIsoMondayForDate(date: Date): string {
		const d = new Date(date);
		const day = d.getUTCDay();
		const diff = day === 0 ? -6 : 1 - day;
		d.setUTCDate(d.getUTCDate() + diff);
		return d.toISOString().slice(0, 10);
	}
}
