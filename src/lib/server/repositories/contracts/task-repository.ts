import type { Task } from '$lib/server/domain/models/task.js';
import type { TaskLock } from '$lib/server/domain/models/task-lock.js';
import type { Page, PaginationQuery } from './query-models.js';

export interface TaskQuery extends PaginationQuery {
	aspectId?: string;
	milestoneId?: string;
	status?: string;
	search?: string;
	overdue?: boolean;
}

export interface TaskListItem {
	id: string;
	title: string;
	aspectId: string;
	aspectName: string;
	milestoneId: string | null;
	milestoneTitle: string | null;
	status: string;
	effortMinutes: number;
	remainingMinutes: number;
	dueDate: string | null;
	importanceScore: number;
	overdue: boolean;
	hasActiveLock: boolean;
	createdAt: Date;
	updatedAt: Date;
}

export interface TaskDetailProjection {
	task: Task;
	aspectName: string;
	milestoneTitle: string | null;
	activeLock: TaskLock | null;
	pendingReminders: Array<{ id: string; remindAtUtc: Date; channel: string }>;
	recentAllocations: Array<{
		id: string;
		scheduledStartUtc: Date;
		scheduledEndUtc: Date;
		allocatedMinutes: number;
		status: string;
	}>;
}

export interface ITaskRepository {
	findById(taskId: string): Promise<Task | null>;
	save(task: Task, expectedVersion: number | null): Promise<Task>;
	archive(taskId: string, expectedVersion: number): Promise<void>;
	restoreToBacklog(taskId: string, expectedVersion: number): Promise<Task>;
	bulkLoad(taskIds: string[]): Promise<Task[]>;
	query(userId: string, query: TaskQuery): Promise<Page<TaskListItem>>;
	loadDetailProjection(taskId: string): Promise<TaskDetailProjection | null>;
	findActiveLock(taskId: string): Promise<TaskLock | null>;
	replaceActiveLock(taskId: string, lock: TaskLock): Promise<TaskLock>;
	releaseActiveLock(taskId: string, expectedVersion: number): Promise<void>;
	cancelFutureAllocations(taskId: string): Promise<number>;
	cancelPendingReminders(taskId: string): Promise<number>;
	deleteByUserId(userId: string): Promise<number>;
}
