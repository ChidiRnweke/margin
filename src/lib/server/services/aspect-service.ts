import type { IAspectRepository } from '$lib/server/repositories/contracts/aspect-repository.js';
import type { IMilestoneRepository } from '$lib/server/repositories/contracts/milestone-repository.js';
import type { ITaskRepository } from '$lib/server/repositories/contracts/task-repository.js';
import type {
	IAspectService,
	CreateAspectInput,
	ActivateAspectInput,
	UpdateAspectInput,
	AspectQuery,
	Page
} from '$lib/server/services/contracts/aspect-service.js';
import type { AuditEmitter } from '$lib/server/infra/audit/audit-emitter.js';
import type { Aspect } from '$lib/server/domain/models/aspect.js';
import {
	createAspect,
	activateAspect,
	archiveAspect,
	restoreAspectToDraft
} from '$lib/server/domain/models/aspect.js';
import { AspectName, AspectPurpose } from '$lib/server/domain/value-objects/string-values.js';
import { TargetPercentage } from '$lib/server/domain/value-objects/bounded-int.js';
import { NotFoundError, OwnershipError } from '$lib/server/errors/domain-errors.js';
import { PrincipalType } from '$lib/server/domain/enums.js';

export class AspectService implements IAspectService {
	constructor(
		private aspectRepo: IAspectRepository,
		private milestoneRepo: IMilestoneRepository,
		private taskRepo: ITaskRepository,
		private auditEmitter: AuditEmitter
	) {}

	async createAspect(userId: string, input: CreateAspectInput): Promise<Aspect> {
		const aspect = createAspect({
			id: crypto.randomUUID(),
			userId,
			name: input.name,
			purpose: input.purpose
		});

		const saved = await this.aspectRepo.save(aspect, null);

		await this.auditEmitter.emit({
			userId,
			actorPrincipalType: PrincipalType.UserSession,
			eventType: 'aspect.created',
			entityType: 'Aspect',
			entityId: saved.id,
			after: saved as unknown as Record<string, unknown>
		});

		return saved;
	}

	async activateAspect(
		userId: string,
		aspectId: string,
		input: ActivateAspectInput,
		expectedVersion: number
	): Promise<Aspect> {
		const aspect = await this.loadOwnedAspect(userId, aspectId);
		const activated = activateAspect(aspect, input);
		const saved = await this.aspectRepo.save(activated, expectedVersion);

		await this.auditEmitter.emit({
			userId,
			actorPrincipalType: PrincipalType.UserSession,
			eventType: 'aspect.activated',
			entityType: 'Aspect',
			entityId: saved.id,
			before: aspect as unknown as Record<string, unknown>,
			after: saved as unknown as Record<string, unknown>
		});

		return saved;
	}

	async updateAspect(
		userId: string,
		aspectId: string,
		input: UpdateAspectInput,
		expectedVersion: number
	): Promise<Aspect> {
		const aspect = await this.loadOwnedAspect(userId, aspectId);

		if (input.name !== undefined) new AspectName(input.name);
		if (input.purpose !== undefined) new AspectPurpose(input.purpose);
		if (input.targetPercentage !== undefined) new TargetPercentage(input.targetPercentage);

		const updated: Aspect = {
			...aspect,
			name: input.name !== undefined ? input.name.trim() : aspect.name,
			purpose: input.purpose !== undefined ? input.purpose.trim() || null : aspect.purpose,
			targetPercentage:
				input.targetPercentage !== undefined ? input.targetPercentage : aspect.targetPercentage,
			defaultSplittable:
				input.defaultSplittable !== undefined ? input.defaultSplittable : aspect.defaultSplittable
		};

		const saved = await this.aspectRepo.save(updated, expectedVersion);

		await this.auditEmitter.emit({
			userId,
			actorPrincipalType: PrincipalType.UserSession,
			eventType: 'aspect.updated',
			entityType: 'Aspect',
			entityId: saved.id,
			before: aspect as unknown as Record<string, unknown>,
			after: saved as unknown as Record<string, unknown>
		});

		return saved;
	}

	async archiveAspect(userId: string, aspectId: string, expectedVersion: number): Promise<void> {
		const aspect = await this.loadOwnedAspect(userId, aspectId);
		const milestones = await this.milestoneRepo.query(userId, { aspectId, limit: 500 });
		const tasks = await this.taskRepo.query(userId, { aspectId, limit: 500 });

		for (const milestone of milestones.items) {
			if (milestone.status !== 'Archived') {
				const fullMilestone = await this.milestoneRepo.findById(milestone.id);
				if (fullMilestone) {
					await this.milestoneRepo.archive(milestone.id, fullMilestone.version);
				}
			}
		}

		for (const task of tasks.items) {
			if (task.status !== 'Archived') {
				const fullTask = await this.taskRepo.findById(task.id);
				if (fullTask) {
					await this.taskRepo.archive(task.id, fullTask.version);
				}
			}
			await this.taskRepo.cancelFutureAllocations(task.id);
			await this.taskRepo.cancelPendingReminders(task.id);
		}

		const archived = archiveAspect(aspect);
		await this.aspectRepo.save(archived, expectedVersion);

		await this.auditEmitter.emit({
			userId,
			actorPrincipalType: PrincipalType.UserSession,
			eventType: 'aspect.archived',
			entityType: 'Aspect',
			entityId: aspectId
		});
	}

	async restoreAspect(userId: string, aspectId: string, expectedVersion: number): Promise<Aspect> {
		const aspect = await this.loadOwnedAspect(userId, aspectId);
		const restoredAspect = restoreAspectToDraft(aspect);
		const restored = await this.aspectRepo.save(restoredAspect, expectedVersion);

		await this.auditEmitter.emit({
			userId,
			actorPrincipalType: PrincipalType.UserSession,
			eventType: 'aspect.restored',
			entityType: 'Aspect',
			entityId: aspectId
		});

		return restored;
	}

	async queryAspects(userId: string, query: AspectQuery): Promise<Page<unknown>> {
		const page = await this.aspectRepo.query(userId, query);
		return { items: page.items, nextCursor: page.cursor ?? undefined };
	}

	private async loadOwnedAspect(userId: string, aspectId: string): Promise<Aspect> {
		const aspect = await this.aspectRepo.findById(aspectId);
		if (!aspect) throw new NotFoundError('Aspect', aspectId);
		if (aspect.userId !== userId) throw new OwnershipError();
		return aspect;
	}
}
