import { describe, expect, it } from 'vitest';
import { MilestoneService } from '$lib/server/services/milestone-service.js';
import {
	FakeAspectRepository,
	FakeMilestoneRepository,
	FakeTaskRepository
} from '../../fakes/repositories.js';
import { FakeAuditEmitter } from '../../fakes/services.js';
import { buildAspect, buildMilestone, buildTask } from '../../fakes/builders.js';

function makeService() {
	const milestoneRepo = new FakeMilestoneRepository();
	const aspectRepo = new FakeAspectRepository();
	const taskRepo = new FakeTaskRepository();
	const auditEmitter = new FakeAuditEmitter();

	return {
		service: new MilestoneService(
			milestoneRepo as never,
			aspectRepo as never,
			taskRepo as never,
			auditEmitter as never
		),
		milestoneRepo,
		aspectRepo,
		taskRepo
	};
}

describe('MilestoneService.createMilestone', () => {
	it('creates milestone for owned aspect', async () => {
		const { service, aspectRepo } = makeService();
		aspectRepo.seed(buildAspect({ status: 'Active', targetPercentage: 30 }) as never);
		const milestone = await service.createMilestone('user-1', {
			aspectId: 'aspect-1',
			title: 'Plan race'
		});
		expect(milestone.status).toBe('Open');
	});

	it('rejects archived aspect', async () => {
		const { service, aspectRepo } = makeService();
		aspectRepo.seed(buildAspect({ status: 'Archived', archivedAt: new Date() }) as never);
		await expect(
			service.createMilestone('user-1', { aspectId: 'aspect-1', title: 'Plan race' })
		).rejects.toThrow();
	});
});

describe('MilestoneService.completeMilestone', () => {
	it('requires child tasks to be done', async () => {
		const { service, aspectRepo, milestoneRepo, taskRepo } = makeService();
		aspectRepo.seed(buildAspect({ status: 'Active' }) as never);
		milestoneRepo.seed(buildMilestone() as never);
		taskRepo.seed(buildTask({ milestoneId: 'milestone-1', status: 'Backlog' }) as never);
		await expect(service.completeMilestone('user-1', 'milestone-1', 1)).rejects.toThrow();
	});

	it('completes milestone when child tasks are done', async () => {
		const { service, aspectRepo, milestoneRepo, taskRepo } = makeService();
		aspectRepo.seed(buildAspect({ status: 'Active' }) as never);
		milestoneRepo.seed(buildMilestone() as never);
		taskRepo.seed(
			buildTask({ milestoneId: 'milestone-1', status: 'Done', remainingMinutes: 0 }) as never
		);
		const completed = await service.completeMilestone('user-1', 'milestone-1', 1);
		expect(completed.status).toBe('Done');
	});
});

describe('MilestoneService.archiveMilestone', () => {
	it('archives child tasks', async () => {
		const { service, aspectRepo, milestoneRepo, taskRepo } = makeService();
		aspectRepo.seed(buildAspect({ status: 'Active' }) as never);
		milestoneRepo.seed(buildMilestone() as never);
		taskRepo.seed(buildTask({ milestoneId: 'milestone-1' }) as never);
		await service.archiveMilestone('user-1', 'milestone-1', 1);
		expect(taskRepo.archivedIds).toContain('task-1');
	});
});

describe('MilestoneService.restoreMilestone', () => {
	it('restores milestone to open', async () => {
		const { service, aspectRepo, milestoneRepo } = makeService();
		aspectRepo.seed(buildAspect({ status: 'Active' }) as never);
		milestoneRepo.seed(buildMilestone({ status: 'Archived', archivedAt: new Date() }) as never);
		const restored = await service.restoreMilestone('user-1', 'milestone-1', 1);
		expect(restored.status).toBe('Open');
	});
});
