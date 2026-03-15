import { error, fail, redirect, type RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { AppFactory } from '$lib/server/factory/index.js';
import type { Actions } from './$types';
import {
	mapAspectOption,
	mapTaskDetail,
	mapTaskListItem,
	sortTaskListItems,
	type AspectOptionViewModel,
	type TaskDetailViewModel,
	type TaskListItemViewModel
} from './task-view-models.js';

interface WorkspaceData {
	tasks: TaskListItemViewModel[];
	aspects: AspectOptionViewModel[];
	selectedTask: TaskDetailViewModel | null;
	selectedTaskId: string | null;
	filters: {
		query: string;
		show: 'active' | 'all';
	};
}

export async function loadTaskWorkspace(event: RequestEvent): Promise<WorkspaceData> {
	const { userId } = requireUserSession(event);
	const factory = AppFactory.create(db);
	const query = event.url.searchParams.get('q')?.trim() ?? '';
	const show = event.url.searchParams.get('show') === 'all' ? 'all' : 'active';

	const [taskPage, aspectPage] = await Promise.all([
		factory.taskController.queryTasks(userId, {
			search: query || undefined,
			status: show === 'active' ? ['Backlog', 'InProgress'] : undefined,
			limit: 64
		}),
		factory.aspectController.queryAspects(userId, { limit: 24 })
	]);

	const tasks = sortTaskListItems(
		(taskPage.items as Record<string, unknown>[]).map((task) => mapTaskListItem(task))
	);
	const aspects = (aspectPage.items as Record<string, unknown>[])
		.map((aspect) => mapAspectOption(aspect))
		.filter((aspect) => aspect.status !== 'Archived');

	const requestedTaskId = event.url.searchParams.get('task');
	const selectedTaskId = tasks.some((task) => task.id === requestedTaskId)
		? requestedTaskId
		: (tasks[0]?.id ?? null);

	let selectedTask: TaskDetailViewModel | null = null;
	if (selectedTaskId) {
		try {
			const detail = await factory.taskController.getTaskDetail(userId, selectedTaskId);
			selectedTask = mapTaskDetail(detail as Record<string, unknown>);
		} catch {
			selectedTask = null;
		}
	}

	return {
		tasks,
		aspects,
		selectedTask,
		selectedTaskId,
		filters: {
			query,
			show
		}
	};
}

export async function loadTaskDetail(
	event: RequestEvent,
	taskId: string
): Promise<TaskDetailViewModel> {
	const { userId } = requireUserSession(event);
	const factory = AppFactory.create(db);

	try {
		const detail = await factory.taskController.getTaskDetail(userId, taskId);
		return mapTaskDetail(detail as Record<string, unknown>);
	} catch {
		throw error(404, 'Task not found');
	}
}

export const taskActions: Actions = {
	create: async (event) => {
		const { userId } = requireUserSession(event);
		const formData = await event.request.formData();
		const title = String(formData.get('title') ?? '').trim();
		const aspectId = String(formData.get('aspectId') ?? '').trim();
		const description = String(formData.get('description') ?? '').trim();
		const dueDate = String(formData.get('dueDate') ?? '').trim();
		const returnTo = String(formData.get('returnTo') ?? '/tasks');
		const effortMinutes = parseOptionalNumber(formData.get('effortMinutes'));
		const importanceScore = parseOptionalNumber(formData.get('importanceScore'));
		const splittableOverride = formData.get('splittableOverride') === 'on' ? true : undefined;

		if (!title) {
			return fail(400, { action: 'create', error: 'Title is required.' });
		}
		if (!aspectId) {
			return fail(400, { action: 'create', error: 'Choose an aspect before creating a task.' });
		}

		const factory = AppFactory.create(db);

		try {
			const created = await factory.taskController.createTask(userId, {
				title,
				aspectId,
				description: description || undefined,
				dueDate: dueDate || undefined,
				effortMinutes: effortMinutes ?? undefined,
				importanceScore: importanceScore ?? undefined,
				splittableOverride
			});

			throw redirect(303, withTaskSelection(returnTo, String((created as { id: string }).id)));
		} catch (thrown) {
			if (isRedirect(thrown)) throw thrown;
			return fail(400, {
				action: 'create',
				error: thrown instanceof Error ? thrown.message : 'Unable to create task.'
			});
		}
	},
	start: (event) => mutateTask(event, 'start'),
	complete: (event) => mutateTask(event, 'complete'),
	reopen: (event) => mutateTask(event, 'reopen'),
	archive: (event) => mutateTask(event, 'archive'),
	restore: (event) => mutateTask(event, 'restore')
};

async function mutateTask(
	event: RequestEvent,
	action: 'start' | 'complete' | 'reopen' | 'archive' | 'restore'
) {
	const { userId } = requireUserSession(event);
	const formData = await event.request.formData();
	const taskId = String(formData.get('taskId') ?? '').trim();
	const returnTo = String(formData.get('returnTo') ?? '/tasks');
	const version = parseRequiredNumber(formData.get('version'));

	if (!taskId || version === null) {
		return fail(400, { action, error: 'Task mutation is missing required metadata.' });
	}

	const factory = AppFactory.create(db);

	try {
		switch (action) {
			case 'start':
				await factory.taskController.startTask(userId, taskId, version);
				break;
			case 'complete':
				await factory.taskController.completeTask(userId, taskId, version);
				break;
			case 'reopen':
				await factory.taskController.reopenTask(userId, taskId, version);
				break;
			case 'archive':
				await factory.taskController.archiveTask(userId, taskId, version);
				break;
			case 'restore':
				await factory.taskController.restoreTask(userId, taskId, version);
				break;
		}

		throw redirect(303, sanitizeReturnTo(returnTo));
	} catch (thrown) {
		if (isRedirect(thrown)) throw thrown;
		return fail(400, {
			action,
			error: thrown instanceof Error ? thrown.message : 'Unable to update task.'
		});
	}
}

function requireUserSession(event: RequestEvent) {
	if (!event.locals.principal?.userId) {
		throw redirect(302, '/login');
	}

	return {
		userId: event.locals.principal.userId,
		sessionId: event.locals.principal.sessionId
	};
}

function parseOptionalNumber(value: FormDataEntryValue | null): number | null {
	if (value === null || value === '') return null;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : null;
}

function parseRequiredNumber(value: FormDataEntryValue | null): number | null {
	const parsed = parseOptionalNumber(value);
	return parsed === null ? null : parsed;
}

function sanitizeReturnTo(value: string): string {
	const url = new URL(value.startsWith('/') ? value : '/tasks', 'http://margin.local');
	return `${url.pathname}${url.search}`;
}

function withTaskSelection(returnTo: string, taskId: string): string {
	const url = new URL(sanitizeReturnTo(returnTo), 'http://margin.local');
	url.searchParams.set('task', taskId);
	return `${url.pathname}${url.search}`;
}

function isRedirect(value: unknown): value is { status: number } {
	return Boolean(
		value &&
		typeof value === 'object' &&
		'status' in value &&
		typeof (value as { status: unknown }).status === 'number'
	);
}
