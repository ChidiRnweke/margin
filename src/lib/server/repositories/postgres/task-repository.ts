import { eq, and, sql, ilike, count, desc, asc, inArray, isNull } from 'drizzle-orm';
import type { Database } from '$lib/server/db/index.js';
import {
	tasks,
	aspects,
	milestones,
	taskLocks,
	reminders,
	taskAllocations
} from '$lib/server/db/schema/index.js';
import type { Task } from '$lib/server/domain/models/task.js';
import type { TaskLock } from '$lib/server/domain/models/task-lock.js';
import type {
	ITaskRepository,
	TaskQuery,
	TaskListItem,
	TaskDetailProjection
} from '$lib/server/repositories/contracts/task-repository.js';
import type { Page } from '$lib/server/repositories/contracts/query-models.js';
import { OptimisticConcurrencyError } from '$lib/server/errors/domain-errors.js';

const DEFAULT_LIMIT = 25;

export class PostgresTaskRepository implements ITaskRepository {
	constructor(private db: Database) {}

	private toDomain(row: typeof tasks.$inferSelect): Task {
		return {
			id: row.id,
			aspectId: row.aspectId,
			milestoneId: row.milestoneId,
			recurringTaskSeriesId: row.recurringTaskSeriesId,
			title: row.title,
			description: row.description,
			effortMinutes: row.effortMinutes,
			remainingMinutes: row.remainingMinutes,
			dueDate: row.dueDate,
			importanceScore: row.importanceScore,
			splittableOverride: row.splittableOverride,
			status: row.status,
			overdue: row.overdue,
			version: row.version,
			completedAt: row.completedAt,
			archivedAt: row.archivedAt,
			createdAt: row.createdAt,
			updatedAt: row.updatedAt
		};
	}

	private toLockDomain(row: typeof taskLocks.$inferSelect): TaskLock {
		return {
			id: row.id,
			taskId: row.taskId,
			lockedStartUtc: row.lockedStartUtc,
			lockedEndUtc: row.lockedEndUtc,
			lockedUtcOffsetMinutes: row.lockedUtcOffsetMinutes,
			lockedDstOffsetMinutes: row.lockedDstOffsetMinutes,
			active: row.active,
			version: row.version,
			createdAt: row.createdAt,
			releasedAt: row.releasedAt
		};
	}

	async findById(taskId: string): Promise<Task | null> {
		const rows = await this.db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
		return rows.length > 0 ? this.toDomain(rows[0]) : null;
	}

	async save(task: Task, expectedVersion: number | null): Promise<Task> {
		if (expectedVersion === null) {
			const rows = await this.db
				.insert(tasks)
				.values({
					id: task.id,
					aspectId: task.aspectId,
					milestoneId: task.milestoneId,
					recurringTaskSeriesId: task.recurringTaskSeriesId,
					title: task.title,
					description: task.description,
					effortMinutes: task.effortMinutes,
					remainingMinutes: task.remainingMinutes,
					dueDate: task.dueDate,
					importanceScore: task.importanceScore,
					splittableOverride: task.splittableOverride,
					status: task.status,
					overdue: task.overdue,
					version: 1,
					completedAt: task.completedAt,
					archivedAt: task.archivedAt,
					createdAt: task.createdAt,
					updatedAt: task.updatedAt
				})
				.returning();
			return this.toDomain(rows[0]);
		}

		const rows = await this.db
			.update(tasks)
			.set({
				aspectId: task.aspectId,
				milestoneId: task.milestoneId,
				recurringTaskSeriesId: task.recurringTaskSeriesId,
				title: task.title,
				description: task.description,
				effortMinutes: task.effortMinutes,
				remainingMinutes: task.remainingMinutes,
				dueDate: task.dueDate,
				importanceScore: task.importanceScore,
				splittableOverride: task.splittableOverride,
				status: task.status,
				overdue: task.overdue,
				version: sql`${tasks.version} + 1`,
				completedAt: task.completedAt,
				archivedAt: task.archivedAt,
				updatedAt: task.updatedAt
			})
			.where(and(eq(tasks.id, task.id), eq(tasks.version, expectedVersion)))
			.returning();

		if (rows.length === 0) {
			throw new OptimisticConcurrencyError('Task', task.id);
		}
		return this.toDomain(rows[0]);
	}

	async archive(taskId: string, expectedVersion: number): Promise<void> {
		const rows = await this.db
			.update(tasks)
			.set({
				status: 'Archived',
				archivedAt: new Date(),
				updatedAt: new Date(),
				version: sql`${tasks.version} + 1`
			})
			.where(and(eq(tasks.id, taskId), eq(tasks.version, expectedVersion)))
			.returning();

		if (rows.length === 0) {
			throw new OptimisticConcurrencyError('Task', taskId);
		}
	}

	async restoreToBacklog(taskId: string, expectedVersion: number): Promise<Task> {
		const rows = await this.db
			.update(tasks)
			.set({
				status: 'Backlog',
				archivedAt: null,
				updatedAt: new Date(),
				version: sql`${tasks.version} + 1`
			})
			.where(and(eq(tasks.id, taskId), eq(tasks.version, expectedVersion)))
			.returning();

		if (rows.length === 0) {
			throw new OptimisticConcurrencyError('Task', taskId);
		}
		return this.toDomain(rows[0]);
	}

	async bulkLoad(taskIds: string[]): Promise<Task[]> {
		if (taskIds.length === 0) return [];
		const rows = await this.db.select().from(tasks).where(inArray(tasks.id, taskIds));
		return rows.map((row) => this.toDomain(row));
	}

	async query(userId: string, query: TaskQuery): Promise<Page<TaskListItem>> {
		const limit = query.limit ?? DEFAULT_LIMIT;
		const offset = query.cursor ? parseInt(query.cursor, 10) : 0;

		const conditions = [eq(aspects.userId, userId)];
		if (query.aspectId) {
			conditions.push(eq(tasks.aspectId, query.aspectId));
		}
		if (query.milestoneId) {
			conditions.push(eq(tasks.milestoneId, query.milestoneId));
		}
		if (query.status) {
			conditions.push(eq(tasks.status, query.status));
		}
		if (query.search) {
			conditions.push(ilike(tasks.title, `%${query.search}%`));
		}
		if (query.overdue !== undefined) {
			conditions.push(eq(tasks.overdue, query.overdue));
		}

		const whereClause = and(...conditions);

		const [countResult, items] = await Promise.all([
			this.db
				.select({ total: count() })
				.from(tasks)
				.innerJoin(aspects, eq(tasks.aspectId, aspects.id))
				.where(whereClause),
			this.db
				.select({
					id: tasks.id,
					title: tasks.title,
					aspectId: tasks.aspectId,
					aspectName: aspects.name,
					milestoneId: tasks.milestoneId,
					milestoneTitle: milestones.title,
					status: tasks.status,
					effortMinutes: tasks.effortMinutes,
					remainingMinutes: tasks.remainingMinutes,
					dueDate: tasks.dueDate,
					importanceScore: tasks.importanceScore,
					overdue: tasks.overdue,
					hasActiveLock:
						sql<boolean>`EXISTS (SELECT 1 FROM task_locks WHERE task_locks.task_id = ${tasks.id} AND task_locks.active = true)`,
					createdAt: tasks.createdAt,
					updatedAt: tasks.updatedAt
				})
				.from(tasks)
				.innerJoin(aspects, eq(tasks.aspectId, aspects.id))
				.leftJoin(milestones, eq(tasks.milestoneId, milestones.id))
				.where(whereClause)
				.orderBy(
					query.sortDirection === 'asc' ? asc(tasks.createdAt) : desc(tasks.createdAt)
				)
				.limit(limit)
				.offset(offset)
		]);

		const totalCount = countResult[0]?.total ?? 0;
		const nextOffset = offset + items.length;
		const hasMore = nextOffset < totalCount;

		return {
			items: items.map((row) => ({
				id: row.id,
				title: row.title,
				aspectId: row.aspectId,
				aspectName: row.aspectName,
				milestoneId: row.milestoneId,
				milestoneTitle: row.milestoneTitle,
				status: row.status,
				effortMinutes: row.effortMinutes,
				remainingMinutes: row.remainingMinutes,
				dueDate: row.dueDate,
				importanceScore: row.importanceScore,
				overdue: row.overdue,
				hasActiveLock: Boolean(row.hasActiveLock),
				createdAt: row.createdAt,
				updatedAt: row.updatedAt
			})),
			totalCount,
			cursor: hasMore ? String(nextOffset) : null,
			hasMore
		};
	}

	async loadDetailProjection(taskId: string): Promise<TaskDetailProjection | null> {
		const taskRows = await this.db
			.select({
				task: tasks,
				aspectName: aspects.name,
				milestoneTitle: milestones.title
			})
			.from(tasks)
			.innerJoin(aspects, eq(tasks.aspectId, aspects.id))
			.leftJoin(milestones, eq(tasks.milestoneId, milestones.id))
			.where(eq(tasks.id, taskId))
			.limit(1);

		if (taskRows.length === 0) return null;

		const row = taskRows[0];
		const task = this.toDomain(row.task);

		const [activeLockRows, pendingReminderRows, recentAllocationRows] = await Promise.all([
			this.db
				.select()
				.from(taskLocks)
				.where(and(eq(taskLocks.taskId, taskId), eq(taskLocks.active, true)))
				.limit(1),
			this.db
				.select({
					id: reminders.id,
					remindAtUtc: reminders.remindAtUtc,
					channel: reminders.channel
				})
				.from(reminders)
				.where(and(eq(reminders.taskId, taskId), eq(reminders.status, 'Pending'))),
			this.db
				.select({
					id: taskAllocations.id,
					scheduledStartUtc: taskAllocations.scheduledStartUtc,
					scheduledEndUtc: taskAllocations.scheduledEndUtc,
					allocatedMinutes: taskAllocations.allocatedMinutes,
					status: taskAllocations.status
				})
				.from(taskAllocations)
				.where(eq(taskAllocations.taskId, taskId))
				.orderBy(desc(taskAllocations.scheduledStartUtc))
				.limit(10)
		]);

		return {
			task,
			aspectName: row.aspectName,
			milestoneTitle: row.milestoneTitle,
			activeLock: activeLockRows.length > 0 ? this.toLockDomain(activeLockRows[0]) : null,
			pendingReminders: pendingReminderRows,
			recentAllocations: recentAllocationRows
		};
	}

	async findActiveLock(taskId: string): Promise<TaskLock | null> {
		const rows = await this.db
			.select()
			.from(taskLocks)
			.where(and(eq(taskLocks.taskId, taskId), eq(taskLocks.active, true)))
			.limit(1);
		return rows.length > 0 ? this.toLockDomain(rows[0]) : null;
	}

	async replaceActiveLock(taskId: string, lock: TaskLock): Promise<TaskLock> {
		// Deactivate any existing active lock
		await this.db
			.update(taskLocks)
			.set({ active: false, releasedAt: new Date() })
			.where(and(eq(taskLocks.taskId, taskId), eq(taskLocks.active, true)));

		// Insert new lock
		const rows = await this.db
			.insert(taskLocks)
			.values({
				id: lock.id,
				taskId: lock.taskId,
				lockedStartUtc: lock.lockedStartUtc,
				lockedEndUtc: lock.lockedEndUtc,
				lockedUtcOffsetMinutes: lock.lockedUtcOffsetMinutes,
				lockedDstOffsetMinutes: lock.lockedDstOffsetMinutes,
				active: true,
				version: 1,
				createdAt: lock.createdAt,
				releasedAt: null
			})
			.returning();
		return this.toLockDomain(rows[0]);
	}

	async releaseActiveLock(taskId: string, expectedVersion: number): Promise<void> {
		const rows = await this.db
			.update(taskLocks)
			.set({
				active: false,
				releasedAt: new Date(),
				version: sql`${taskLocks.version} + 1`
			})
			.where(
				and(
					eq(taskLocks.taskId, taskId),
					eq(taskLocks.active, true),
					eq(taskLocks.version, expectedVersion)
				)
			)
			.returning();

		if (rows.length === 0) {
			throw new OptimisticConcurrencyError('TaskLock', taskId);
		}
	}

	async cancelFutureAllocations(taskId: string): Promise<number> {
		const rows = await this.db
			.update(taskAllocations)
			.set({
				status: 'Cancelled',
				cancelledAt: new Date()
			})
			.where(
				and(
					eq(taskAllocations.taskId, taskId),
					eq(taskAllocations.status, 'Proposed'),
					sql`${taskAllocations.scheduledStartUtc} > now()`
				)
			)
			.returning({ id: taskAllocations.id });
		return rows.length;
	}

	async cancelPendingReminders(taskId: string): Promise<number> {
		const rows = await this.db
			.update(reminders)
			.set({ status: 'Cancelled' })
			.where(and(eq(reminders.taskId, taskId), eq(reminders.status, 'Pending')))
			.returning({ id: reminders.id });
		return rows.length;
	}

	async deleteByUserId(userId: string): Promise<number> {
		// Tasks are cascade-deleted via aspects, so delete tasks belonging to user's aspects
		const userAspects = await this.db
			.select({ id: aspects.id })
			.from(aspects)
			.where(eq(aspects.userId, userId));

		if (userAspects.length === 0) return 0;

		const aspectIds = userAspects.map((a) => a.id);
		const rows = await this.db
			.delete(tasks)
			.where(inArray(tasks.aspectId, aspectIds))
			.returning({ id: tasks.id });
		return rows.length;
	}
}
