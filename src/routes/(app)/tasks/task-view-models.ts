export type TaskStatus = 'Backlog' | 'InProgress' | 'Done' | 'Archived';

export interface TaskListItemViewModel {
	id: string;
	title: string;
	aspectId: string;
	aspectName: string;
	milestoneId: string | null;
	milestoneTitle: string | null;
	status: TaskStatus;
	effortMinutes: number;
	remainingMinutes: number;
	dueDate: string | null;
	importanceScore: number;
	overdue: boolean;
	hasActiveLock: boolean;
	createdAt: string;
	updatedAt: string;
}

export interface TaskDetailViewModel {
	id: string;
	title: string;
	description: string | null;
	aspectId: string;
	aspectName: string;
	milestoneId: string | null;
	milestoneTitle: string | null;
	recurringTaskSeriesId: string | null;
	status: TaskStatus;
	effortMinutes: number;
	remainingMinutes: number;
	dueDate: string | null;
	importanceScore: number;
	splittableOverride: boolean | null;
	overdue: boolean;
	version: number;
	hasActiveLock: boolean;
	activeLockReason: string | null;
	pendingReminders: Array<{
		id: string;
		remindAtUtc: string;
		channel: string;
	}>;
	recentAllocations: Array<{
		id: string;
		scheduledStartUtc: string;
		scheduledEndUtc: string;
		allocatedMinutes: number;
		status: string;
	}>;
	createdAt: string;
	updatedAt: string;
}

export interface AspectOptionViewModel {
	id: string;
	name: string;
	status: string;
	targetPercentage: number | null;
}

export function mapTaskListItem(input: Record<string, unknown>): TaskListItemViewModel {
	return {
		id: String(input.id),
		title: String(input.title),
		aspectId: String(input.aspectId),
		aspectName: String(input.aspectName),
		milestoneId: nullableString(input.milestoneId),
		milestoneTitle: nullableString(input.milestoneTitle),
		status: input.status as TaskStatus,
		effortMinutes: Number(input.effortMinutes ?? 0),
		remainingMinutes: Number(input.remainingMinutes ?? 0),
		dueDate: nullableString(input.dueDate),
		importanceScore: Number(input.importanceScore ?? 50),
		overdue: Boolean(input.overdue),
		hasActiveLock: Boolean(input.hasActiveLock),
		createdAt: toIso(input.createdAt),
		updatedAt: toIso(input.updatedAt)
	};
}

export function mapTaskDetail(input: Record<string, unknown>): TaskDetailViewModel {
	const task = input.task as Record<string, unknown>;
	const activeLock = input.activeLock as Record<string, unknown> | null;
	const pendingReminders = Array.isArray(input.pendingReminders) ? input.pendingReminders : [];
	const recentAllocations = Array.isArray(input.recentAllocations) ? input.recentAllocations : [];

	return {
		id: String(task.id),
		title: String(task.title),
		description: nullableString(task.description),
		aspectId: String(task.aspectId),
		aspectName: String(input.aspectName),
		milestoneId: nullableString(task.milestoneId),
		milestoneTitle: nullableString(input.milestoneTitle),
		recurringTaskSeriesId: nullableString(task.recurringTaskSeriesId),
		status: task.status as TaskStatus,
		effortMinutes: Number(task.effortMinutes ?? 0),
		remainingMinutes: Number(task.remainingMinutes ?? 0),
		dueDate: nullableString(task.dueDate),
		importanceScore: Number(task.importanceScore ?? 50),
		splittableOverride:
			task.splittableOverride === null || task.splittableOverride === undefined
				? null
				: Boolean(task.splittableOverride),
		overdue: Boolean(task.overdue),
		version: Number(task.version ?? 1),
		hasActiveLock: Boolean(activeLock),
		activeLockReason: activeLock ? nullableString(activeLock.reason) : null,
		pendingReminders: pendingReminders.map((reminder) => {
			const item = reminder as Record<string, unknown>;
			return {
				id: String(item.id),
				remindAtUtc: toIso(item.remindAtUtc),
				channel: String(item.channel)
			};
		}),
		recentAllocations: recentAllocations.map((allocation) => {
			const item = allocation as Record<string, unknown>;
			return {
				id: String(item.id),
				scheduledStartUtc: toIso(item.scheduledStartUtc),
				scheduledEndUtc: toIso(item.scheduledEndUtc),
				allocatedMinutes: Number(item.allocatedMinutes ?? 0),
				status: String(item.status)
			};
		}),
		createdAt: toIso(task.createdAt),
		updatedAt: toIso(task.updatedAt)
	};
}

export function mapAspectOption(input: Record<string, unknown>): AspectOptionViewModel {
	return {
		id: String(input.id),
		name: String(input.name),
		status: String(input.status),
		targetPercentage:
			input.targetPercentage === null || input.targetPercentage === undefined
				? null
				: Number(input.targetPercentage)
	};
}

export function sortTaskListItems(tasks: TaskListItemViewModel[]): TaskListItemViewModel[] {
	return [...tasks].sort((left, right) => {
		const leftUrgency = left.overdue ? 1 : 0;
		const rightUrgency = right.overdue ? 1 : 0;
		if (rightUrgency !== leftUrgency) return rightUrgency - leftUrgency;

		const leftDue = left.dueDate ? new Date(left.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
		const rightDue = right.dueDate ? new Date(right.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
		if (leftDue !== rightDue) return leftDue - rightDue;

		return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
	});
}

function nullableString(value: unknown): string | null {
	if (value === null || value === undefined || value === '') return null;
	return String(value);
}

function toIso(value: unknown): string {
	if (value instanceof Date) return value.toISOString();
	return new Date(String(value)).toISOString();
}
