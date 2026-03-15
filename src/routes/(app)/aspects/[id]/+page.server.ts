import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db/index.js';
import { AppFactory } from '$lib/server/factory/index.js';

export const load: PageServerLoad = async ({ params, locals }) => {
	const userId = locals.principal?.userId;
	if (!userId) {
		throw error(401, 'Authentication required');
	}

	const factory = AppFactory.create(db);
	const aspects = await factory.aspectController.queryAspects(userId, { limit: 100 });
	const aspect = ((aspects.items ?? []) as Array<Record<string, unknown>>).find(
		(item) => String(item.id) === params.id
	);
	if (!aspect) {
		throw error(404, 'Aspect not found');
	}

	const milestones = await factory.milestoneController.queryMilestones(userId, {
		aspectId: params.id,
		limit: 100
	});
	const tasks = await factory.taskController.queryTasks(userId, {
		aspectId: params.id,
		limit: 100
	});

	return {
		aspect: {
			id: String(aspect.id),
			name: String(aspect.name ?? ''),
			purpose: String(aspect.purpose ?? ''),
			targetPercentage: Number(aspect.targetPercentage ?? 0),
			color: 'var(--color-aspect-1)',
			status: String(aspect.status ?? 'Draft').toLowerCase(),
			taskCount: (tasks.items ?? []).length,
			milestoneCount: (milestones.items ?? []).length
		},
		milestones: ((milestones.items ?? []) as Array<Record<string, unknown>>).map((milestone) => ({
			id: String(milestone.id),
			title: String(milestone.title ?? ''),
			status: (String(milestone.status ?? 'Open') === 'Done'
				? 'completed'
				: String(milestone.status ?? 'Open') === 'Archived'
					? 'archived'
					: 'open') as 'open' | 'completed' | 'archived',
			targetDate: milestone.targetDate ? String(milestone.targetDate) : undefined
		})),
		tasks: ((tasks.items ?? []) as Array<Record<string, unknown>>).map((task) => ({
			id: String(task.id),
			title: String(task.title ?? ''),
			status: (String(task.status ?? 'Backlog') === 'InProgress'
				? 'in_progress'
				: String(task.status ?? 'Backlog') === 'Done'
					? 'done'
					: String(task.status ?? 'Backlog') === 'Archived'
						? 'archived'
						: 'todo') as 'todo' | 'in_progress' | 'done' | 'archived',
			effort: Number(task.effortMinutes ?? 0) / 60,
			dueDate: task.dueDate ? String(task.dueDate) : undefined
		}))
	};
};
