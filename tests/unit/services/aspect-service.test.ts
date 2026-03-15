import { describe, expect, it } from 'vitest';
import { AspectService } from '$lib/server/services/aspect-service.js';
import {
	FakeAspectRepository,
	FakeMilestoneRepository,
	FakeTaskRepository
} from '../../fakes/repositories.js';
import { FakeAuditEmitter } from '../../fakes/services.js';
import { buildAspect, buildMilestone, buildTask } from '../../fakes/builders.js';

function makeService() {
	const aspectRepo = new FakeAspectRepository();
	const milestoneRepo = new FakeMilestoneRepository();
	const taskRepo = new FakeTaskRepository();
	const auditEmitter = new FakeAuditEmitter();

	return {
		service: new AspectService(
			aspectRepo as never,
			milestoneRepo as never,
			taskRepo as never,
			auditEmitter as never
		),
		aspectRepo,
		milestoneRepo,
		taskRepo,
		auditEmitter
	};
}

describe('AspectService.createAspect', () => {
	it('creates aspect in Draft status with valid name', async () => {
		const { service } = makeService();
		const created = await service.createAspect('user-1', {
			name: 'Health',
			purpose: 'Stay healthy'
		});
		expect(created.status).toBe('Draft');
	});

	it('rejects empty aspect name', async () => {
		const { service } = makeService();
		await expect(service.createAspect('user-1', { name: '', purpose: 'x' })).rejects.toThrow();
	});
});

describe('AspectService.activateAspect', () => {
	it('activates draft aspect with purpose and target', async () => {
		const { service, aspectRepo } = makeService();
		aspectRepo.seed(buildAspect() as never);
		const activated = await service.activateAspect(
			'user-1',
			'aspect-1',
			{ targetPercentage: 40 },
			1
		);
		expect(activated.status).toBe('Active');
	});

	it('rejects activation without purpose', async () => {
		const { service, aspectRepo } = makeService();
		aspectRepo.seed(buildAspect({ purpose: null }) as never);
		await expect(
			service.activateAspect('user-1', 'aspect-1', { targetPercentage: 40 }, 1)
		).rejects.toThrow();
	});
});

describe('AspectService.archiveAspect', () => {
	it('archives aspect and cascades to descendants', async () => {
		const { service, aspectRepo, milestoneRepo, taskRepo } = makeService();
		aspectRepo.seed(buildAspect({ status: 'Active', targetPercentage: 40 }) as never);
		milestoneRepo.seed(buildMilestone({ id: 'milestone-1', aspectId: 'aspect-1' }) as never);
		taskRepo.seed(buildTask({ id: 'task-1', aspectId: 'aspect-1' }) as never);
		await service.archiveAspect('user-1', 'aspect-1', 1);
		expect(taskRepo.archivedIds).toContain('task-1');
	});

	it('cancels future allocations for aspect tasks', async () => {
		const { service, aspectRepo, taskRepo } = makeService();
		aspectRepo.seed(buildAspect({ status: 'Active', targetPercentage: 40 }) as never);
		taskRepo.seed(buildTask({ id: 'task-1', aspectId: 'aspect-1' }) as never);
		await service.archiveAspect('user-1', 'aspect-1', 1);
		expect(taskRepo.cancelledFutureAllocationTaskIds).toContain('task-1');
	});

	it('cancels pending reminders for aspect tasks', async () => {
		const { service, aspectRepo, taskRepo } = makeService();
		aspectRepo.seed(buildAspect({ status: 'Active', targetPercentage: 40 }) as never);
		taskRepo.seed(buildTask({ id: 'task-1', aspectId: 'aspect-1' }) as never);
		await service.archiveAspect('user-1', 'aspect-1', 1);
		expect(taskRepo.cancelledPendingReminderTaskIds).toContain('task-1');
	});
});

describe('AspectService.restoreAspect', () => {
	it('restores archived aspect to Draft status', async () => {
		const { service, aspectRepo } = makeService();
		aspectRepo.seed(
			buildAspect({ status: 'Archived', targetPercentage: 40, archivedAt: new Date() }) as never
		);
		const restored = await service.restoreAspect('user-1', 'aspect-1', 1);
		expect(restored.status).toBe('Draft');
	});

	it('rejects restore of non-archived aspect', async () => {
		const { service, aspectRepo } = makeService();
		aspectRepo.seed(buildAspect({ status: 'Active', targetPercentage: 40 }) as never);
		await expect(service.restoreAspect('user-1', 'aspect-1', 1)).rejects.toThrow();
	});
});
