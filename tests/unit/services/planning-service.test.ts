import { describe, expect, it } from 'vitest';
import { PlanningService } from '$lib/server/services/planning-service.js';
import {
	FakeAspectRepository,
	FakeAvailabilityRepository,
	FakePlanningCycleRepository,
	FakePlanningProfileRepository,
	FakeTaskRepository,
	FakeUserRepository
} from '../../fakes/repositories.js';
import {
	FakeAspectTargetValidator,
	FakeAuditEmitter,
	FakeAvailabilityWindowResolver,
	FakeSchedulerEngine
} from '../../fakes/services.js';
import { buildAspect, buildPlanningProfile, buildTask } from '../../fakes/builders.js';

function makeService() {
	const planningCycleRepo = new FakePlanningCycleRepository();
	const taskRepo = new FakeTaskRepository();
	const availabilityRepo = new FakeAvailabilityRepository();
	const profileRepo = new FakePlanningProfileRepository();
	const aspectRepo = new FakeAspectRepository();
	const userRepo = new FakeUserRepository();
	const schedulerEngine = new FakeSchedulerEngine();
	const windowResolver = new FakeAvailabilityWindowResolver();
	const aspectTargetValidator = new FakeAspectTargetValidator();
	const auditEmitter = new FakeAuditEmitter();

	profileRepo.seed(buildPlanningProfile());
	userRepo.seed({
		id: 'user-1',
		email: 'user@example.com',
		displayName: 'User',
		timezone: 'UTC',
		identityVerified: true,
		createdAt: new Date('2026-01-01T00:00:00Z')
	});

	return {
		service: new PlanningService(
			planningCycleRepo as never,
			taskRepo as never,
			availabilityRepo as never,
			profileRepo as never,
			aspectRepo as never,
			userRepo as never,
			schedulerEngine as never,
			windowResolver as never,
			aspectTargetValidator as never,
			auditEmitter as never
		),
		planningCycleRepo,
		taskRepo,
		profileRepo,
		aspectRepo,
		schedulerEngine,
		windowResolver,
		aspectTargetValidator
	};
}

describe('PlanningService.generateDraftPlan', () => {
	it('requires active aspect targets total 100%', async () => {
		const { service, aspectRepo, aspectTargetValidator } = makeService();
		aspectRepo.seed(buildAspect({ status: 'Active', targetPercentage: 60 }) as never);
		aspectTargetValidator.shouldThrow = true;
		await expect(service.generateDraftPlan('user-1', '2026-01-05')).rejects.toThrow();
	});

	it('creates cycle with first revision', async () => {
		const { service, aspectRepo, taskRepo, planningCycleRepo } = makeService();
		aspectRepo.seed(buildAspect({ status: 'Active', targetPercentage: 100 }) as never);
		taskRepo.seed(buildTask({ status: 'Backlog' }) as never);
		const draft = await service.generateDraftPlan('user-1', '2026-01-05');
		const aggregate = (await planningCycleRepo.findById(draft.cycleId)) as { revisions: unknown[] };
		expect(aggregate.revisions).toHaveLength(1);
	});

	it('uses scheduler engine for allocation placement', async () => {
		const { service, aspectRepo, taskRepo, schedulerEngine } = makeService();
		aspectRepo.seed(buildAspect({ status: 'Active', targetPercentage: 100 }) as never);
		taskRepo.seed(buildTask({ status: 'Backlog' }) as never);
		schedulerEngine.setResult({ allocations: [{ id: 'alloc-1' }] });
		const draft = await service.generateDraftPlan('user-1', '2026-01-05');
		expect(draft.allocations).toHaveLength(1);
	});
});

describe('PlanningService.confirmDraftPlan', () => {
	it('transitions draft cycle to confirmed', async () => {
		const { service, planningCycleRepo } = makeService();
		planningCycleRepo.seed({
			cycle: {
				id: 'cycle-1',
				userId: 'user-1',
				weekStartIsoMonday: '2026-01-05',
				weekEndIsoSunday: '2026-01-11',
				status: 'Draft',
				currentRevisionId: 'revision-1'
			},
			revisions: [{ id: 'revision-1', revisionNumber: 1, status: 'Active' }],
			allocations: [],
			outcomes: [],
			healthScores: []
		});
		const confirmed = await service.confirmDraftPlan('user-1', 'cycle-1', 1);
		expect((confirmed as { status: string }).status).toBe('Confirmed');
	});

	it('rejects confirmation of non-draft cycle', async () => {
		const { service, planningCycleRepo } = makeService();
		planningCycleRepo.seed({
			cycle: {
				id: 'cycle-1',
				userId: 'user-1',
				weekStartIsoMonday: '2026-01-05',
				weekEndIsoSunday: '2026-01-11',
				status: 'Confirmed',
				currentRevisionId: 'revision-1'
			},
			revisions: [{ id: 'revision-1', revisionNumber: 1, status: 'Active' }],
			allocations: [],
			outcomes: [],
			healthScores: []
		});
		await expect(service.confirmDraftPlan('user-1', 'cycle-1', 1)).rejects.toThrow();
	});
});
