import { TaskStatus } from '../enums.js';
import { TaskTitle } from '../value-objects/string-values.js';
import {
	PositiveMinutes,
	NonNegativeMinutes,
	ImportanceScore
} from '../value-objects/bounded-int.js';
import { StateTransitionError, InputError } from '$lib/server/errors/domain-errors.js';

export interface Task {
	readonly id: string;
	readonly aspectId: string;
	readonly milestoneId: string | null;
	readonly recurringTaskSeriesId: string | null;
	readonly title: string;
	readonly description: string | null;
	readonly effortMinutes: number;
	readonly remainingMinutes: number;
	readonly dueDate: string | null;
	readonly importanceScore: number;
	readonly splittableOverride: boolean | null;
	readonly status: string;
	readonly overdue: boolean;
	readonly version: number;
	readonly completedAt: Date | null;
	readonly archivedAt: Date | null;
	readonly createdAt: Date;
	readonly updatedAt: Date;
}

export function createTask(params: {
	id: string;
	aspectId: string;
	title: string;
	description?: string;
	effortMinutes: number;
	dueDate?: string;
	importanceScore?: number;
	milestoneId?: string;
	splittableOverride?: boolean;
	recurringTaskSeriesId?: string;
}): Task {
	new TaskTitle(params.title);
	new PositiveMinutes(params.effortMinutes);
	if (params.importanceScore !== undefined) new ImportanceScore(params.importanceScore);
	if (!params.aspectId) throw new InputError('Task requires an aspect');

	const now = new Date();
	return {
		id: params.id,
		aspectId: params.aspectId,
		milestoneId: params.milestoneId || null,
		recurringTaskSeriesId: params.recurringTaskSeriesId || null,
		title: params.title.trim(),
		description: params.description?.trim() || null,
		effortMinutes: params.effortMinutes,
		remainingMinutes: params.effortMinutes,
		dueDate: params.dueDate || null,
		importanceScore: params.importanceScore ?? 50,
		splittableOverride: params.splittableOverride ?? null,
		status: TaskStatus.Backlog,
		overdue: false,
		version: 1,
		completedAt: null,
		archivedAt: null,
		createdAt: now,
		updatedAt: now
	};
}

export function startTask(task: Task): Task {
	if (task.status !== TaskStatus.Backlog) {
		throw new StateTransitionError(`Cannot start task in ${task.status} status`);
	}
	return { ...task, status: TaskStatus.InProgress, updatedAt: new Date() };
}

export function completeTask(task: Task): Task {
	if (task.status !== TaskStatus.InProgress) {
		throw new StateTransitionError(`Cannot complete task in ${task.status} status`);
	}
	return {
		...task,
		status: TaskStatus.Done,
		completedAt: new Date(),
		remainingMinutes: 0,
		updatedAt: new Date()
	};
}

export function reopenTask(task: Task): Task {
	if (task.status !== TaskStatus.Done) {
		throw new StateTransitionError(`Cannot reopen task in ${task.status} status`);
	}
	return { ...task, status: TaskStatus.Backlog, completedAt: null, updatedAt: new Date() };
}

export function archiveTask(task: Task): Task {
	if (task.status === TaskStatus.Archived) {
		throw new StateTransitionError('Task is already archived');
	}
	return { ...task, status: TaskStatus.Archived, archivedAt: new Date(), updatedAt: new Date() };
}

export function restoreTask(task: Task): Task {
	if (task.status !== TaskStatus.Archived) {
		throw new StateTransitionError('Can only restore archived tasks');
	}
	return { ...task, status: TaskStatus.Backlog, archivedAt: null, updatedAt: new Date() };
}

export function updateTask(
	task: Task,
	input: {
		title?: string;
		description?: string;
		effortMinutes?: number;
		remainingMinutes?: number;
		dueDate?: string | null;
		importanceScore?: number;
		splittableOverride?: boolean | null;
	}
): Task {
	if (input.title !== undefined) new TaskTitle(input.title);
	if (input.effortMinutes !== undefined) new PositiveMinutes(input.effortMinutes);
	if (input.remainingMinutes !== undefined) new NonNegativeMinutes(input.remainingMinutes);
	if (input.importanceScore !== undefined) new ImportanceScore(input.importanceScore);

	return {
		...task,
		title: input.title !== undefined ? input.title.trim() : task.title,
		description:
			input.description !== undefined ? input.description?.trim() || null : task.description,
		effortMinutes: input.effortMinutes ?? task.effortMinutes,
		remainingMinutes: input.remainingMinutes ?? task.remainingMinutes,
		dueDate: input.dueDate !== undefined ? input.dueDate || null : task.dueDate,
		importanceScore: input.importanceScore ?? task.importanceScore,
		splittableOverride:
			input.splittableOverride !== undefined ? input.splittableOverride : task.splittableOverride,
		updatedAt: new Date()
	};
}
