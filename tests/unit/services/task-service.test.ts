import { describe, expect, it } from 'vitest';
import { TaskService } from '$lib/server/services/task-service.js';
import {
	FakeAspectRepository,
	FakeMilestoneRepository,
	FakePlanningProfileRepository,
	FakeTaskRepository
} from '../../fakes/repositories.js';
import { FakeAuditEmitter, FakeRecurrenceMaterializer } from '../../fakes/services.js';
import {
	buildAspect,
	buildMilestone,
	buildPlanningProfile,
	buildTask
} from '../../fakes/builders.js';

function makeService() {
	const taskRepo = new FakeTaskRepository();
	const aspectRepo = new FakeAspectRepository();
	const milestoneRepo = new FakeMilestoneRepository();
	const profileRepo = new FakePlanningProfileRepository();
	const recurrenceMaterializer = new FakeRecurrenceMaterializer();
	const auditEmitter = new FakeAuditEmitter();

	profileRepo.seed(buildPlanningProfile());

	return {
		service: new TaskService(
			taskRepo as never,
			aspectRepo as never,
			milestoneRepo as never,
			profileRepo as never,
			recurrenceMaterializer as never,
			auditEmitter as never
		),
		taskRepo,
		aspectRepo,
		milestoneRepo,
		profileRepo,
		recurrenceMaterializer,
		auditEmitter
	};
}

describe('TaskService.createTask', () => {
	it('creates task in Backlog with valid input', async () => {
		const { service, aspectRepo } = makeService();
		aspectRepo.seed(buildAspect({ status: 'Active' }) as never);
		const created = await service.createTask('user-1', { aspectId: 'aspect-1', title: 'Run' });
		expect(created.status).toBe('Backlog');
	});

	it('rejects task without aspect', async () => {
		const { service } = makeService();
		await expect(
			service.createTask('user-1', { aspectId: 'missing', title: 'Run' })
		).rejects.toThrow();
	});

	it('uses default effort from planning profile', async () => {
		const { service, aspectRepo, profileRepo } = makeService();
		aspectRepo.seed(buildAspect({ status: 'Active' }) as never);
		profileRepo.seed(buildPlanningProfile({ defaultEffortMinutes: 55 }));
		const created = await service.createTask('user-1', { aspectId: 'aspect-1', title: 'Run' });
		expect(created.effortMinutes).toBe(55);
	});
});

describe('TaskService.startTask', () => {
	it('transitions Backlog task to InProgress', async () => {
		const { service, aspectRepo, taskRepo } = makeService();
		aspectRepo.seed(buildAspect({ status: 'Active' }) as never);
		taskRepo.seed(buildTask() as never);
		const started = await service.startTask('user-1', 'task-1', 1);
		expect(started.status).toBe('InProgress');
	});
});

describe('TaskService.completeTask', () => {
	it('transitions InProgress task to Done', async () => {
		const { service, aspectRepo, taskRepo } = makeService();
		aspectRepo.seed(buildAspect({ status: 'Active' }) as never);
		taskRepo.seed(buildTask({ status: 'InProgress' }) as never);
		const completed = await service.completeTask('user-1', 'task-1', 1);
		expect((completed.task as { status: string }).status).toBe('Done');
	});

	it('triggers recurrence materialization for recurring task', async () => {
		const { service, aspectRepo, taskRepo, recurrenceMaterializer } = makeService();
		aspectRepo.seed(buildAspect({ status: 'Active' }) as never);
		taskRepo.seed(buildTask({ status: 'InProgress', recurringTaskSeriesId: 'series-1' }) as never);
		recurrenceMaterializer.setResult({ generated: true, taskId: 'task-2' });
		taskRepo.seed(buildTask({ id: 'task-2' }) as never);
		const completed = await service.completeTask('user-1', 'task-1', 1);
		expect((completed.nextRecurringTask as { id: string }).id).toBe('task-2');
	});

	it('cancels pending reminders on completion', async () => {
		const { service, aspectRepo, taskRepo } = makeService();
		aspectRepo.seed(buildAspect({ status: 'Active' }) as never);
		taskRepo.seed(buildTask({ status: 'InProgress' }) as never);
		await service.completeTask('user-1', 'task-1', 1);
		expect(taskRepo.cancelledPendingReminderTaskIds).toContain('task-1');
	});
});

describe('TaskService.reopenTask', () => {
	it('transitions Done task back to Backlog', async () => {
		const { service, aspectRepo, taskRepo } = makeService();
		aspectRepo.seed(buildAspect({ status: 'Active' }) as never);
		taskRepo.seed(
			buildTask({ status: 'Done', remainingMinutes: 0, completedAt: new Date() }) as never
		);
		const reopened = await service.reopenTask('user-1', 'task-1', 1);
		expect(reopened.status).toBe('Backlog');
	});

	it('cancels future allocations on reopen', async () => {
		const { service, aspectRepo, taskRepo } = makeService();
		aspectRepo.seed(buildAspect({ status: 'Active' }) as never);
		taskRepo.seed(
			buildTask({ status: 'Done', remainingMinutes: 0, completedAt: new Date() }) as never
		);
		await service.reopenTask('user-1', 'task-1', 1);
		expect(taskRepo.cancelledFutureAllocationTaskIds).toContain('task-1');
	});
});

describe('TaskService.moveTaskMilestone', () => {
	it('moves task to milestone in same aspect', async () => {
		const { service, aspectRepo, milestoneRepo, taskRepo } = makeService();
		aspectRepo.seed(buildAspect({ status: 'Active' }) as never);
		milestoneRepo.seed(buildMilestone() as never);
		taskRepo.seed(buildTask() as never);
		const moved = await service.moveTaskMilestone('user-1', 'task-1', 'milestone-1', 1);
		expect(moved.milestoneId).toBe('milestone-1');
	});

	it('rejects move to milestone in different aspect', async () => {
		const { service, aspectRepo, milestoneRepo, taskRepo } = makeService();
		aspectRepo.seed(buildAspect({ status: 'Active' }) as never);
		milestoneRepo.seed(buildMilestone({ aspectId: 'aspect-2' }) as never);
		taskRepo.seed(buildTask() as never);
		await expect(service.moveTaskMilestone('user-1', 'task-1', 'milestone-1', 1)).rejects.toThrow();
	});

	it('allows move to null milestone', async () => {
		const { service, aspectRepo, taskRepo } = makeService();
		aspectRepo.seed(buildAspect({ status: 'Active' }) as never);
		taskRepo.seed(buildTask({ milestoneId: 'milestone-1' }) as never);
		const moved = await service.moveTaskMilestone('user-1', 'task-1', null, 1);
		expect(moved.milestoneId).toBeNull();
	});
});

describe('TaskService.archiveTask', () => {
	it('archives task and cancels future allocations', async () => {
		const { service, aspectRepo, taskRepo } = makeService();
		aspectRepo.seed(buildAspect({ status: 'Active' }) as never);
		taskRepo.seed(buildTask() as never);
		await service.archiveTask('user-1', 'task-1', 1);
		expect(taskRepo.cancelledFutureAllocationTaskIds).toContain('task-1');
	});

	it('cancels pending reminders on archive', async () => {
		const { service, aspectRepo, taskRepo } = makeService();
		aspectRepo.seed(buildAspect({ status: 'Active' }) as never);
		taskRepo.seed(buildTask() as never);
		await service.archiveTask('user-1', 'task-1', 1);
		expect(taskRepo.cancelledPendingReminderTaskIds).toContain('task-1');
	});
});

describe('TaskService.bulkMutateTasks', () => {
	it('returns per-item results for partial success', async () => {
		const { service, aspectRepo, taskRepo } = makeService();
		aspectRepo.seed(buildAspect({ status: 'Active' }) as never);
		taskRepo.seed(buildTask({ id: 'task-1' }) as never);
		const result = await service.bulkMutateTasks('user-1', {
			action: 'archive',
			taskIds: ['task-1', 'missing']
		});
		expect(result.results.filter((item) => item.success)).toHaveLength(1);
	});
});
