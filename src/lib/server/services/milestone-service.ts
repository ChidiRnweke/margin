import type { IMilestoneRepository } from '$lib/server/repositories/contracts/milestone-repository.js';
import type { IAspectRepository } from '$lib/server/repositories/contracts/aspect-repository.js';
import type {
	IMilestoneService,
	CreateMilestoneInput,
	UpdateMilestoneInput,
	MilestoneQuery
} from '$lib/server/services/contracts/milestone-service.js';
import type { AuditEmitter } from '$lib/server/infra/audit/audit-emitter.js';
import type { Milestone } from '$lib/server/domain/models/milestone.js';
import {
	createMilestone,
	completeMilestone,
	reopenMilestone
} from '$lib/server/domain/models/milestone.js';
import { MilestoneTitle } from '$lib/server/domain/value-objects/string-values.js';
import { NotFoundError, OwnershipError } from '$lib/server/errors/domain-errors.js';
import { PrincipalType } from '$lib/server/domain/enums.js';

export class MilestoneService implements IMilestoneService {
	constructor(
		private milestoneRepo: IMilestoneRepository,
		private aspectRepo: IAspectRepository,
		private auditEmitter: AuditEmitter
	) {}

	async createMilestone(userId: string, input: CreateMilestoneInput): Promise<Milestone> {
		const aspect = await this.aspectRepo.findById(input.aspectId);
		if (!aspect || aspect.userId !== userId) {
			throw new NotFoundError('Aspect', input.aspectId);
		}

		const milestone = createMilestone({
			id: crypto.randomUUID(),
			aspectId: input.aspectId,
			title: input.title,
			description: input.description,
			targetDate: input.targetDate
		});

		const saved = await this.milestoneRepo.save(milestone, null);

		await this.auditEmitter.emit({
			userId,
			actorPrincipalType: PrincipalType.UserSession,
			eventType: 'milestone.created',
			entityType: 'Milestone',
			entityId: saved.id,
			after: saved as unknown as Record<string, unknown>
		});

		return saved;
	}

	async updateMilestone(
		userId: string,
		milestoneId: string,
		input: UpdateMilestoneInput,
		expectedVersion: number
	): Promise<Milestone> {
		const milestone = await this.loadOwnedMilestone(userId, milestoneId);

		if (input.title !== undefined) new MilestoneTitle(input.title);

		const updated: Milestone = {
			...milestone,
			title: input.title !== undefined ? input.title.trim() : milestone.title,
			description:
				input.description !== undefined ? input.description?.trim() || null : milestone.description,
			targetDate: input.targetDate !== undefined ? input.targetDate || null : milestone.targetDate
		};

		const saved = await this.milestoneRepo.save(updated, expectedVersion);

		await this.auditEmitter.emit({
			userId,
			actorPrincipalType: PrincipalType.UserSession,
			eventType: 'milestone.updated',
			entityType: 'Milestone',
			entityId: saved.id,
			before: milestone as unknown as Record<string, unknown>,
			after: saved as unknown as Record<string, unknown>
		});

		return saved;
	}

	async completeMilestone(
		userId: string,
		milestoneId: string,
		expectedVersion: number
	): Promise<Milestone> {
		const milestone = await this.loadOwnedMilestone(userId, milestoneId);
		const completed = completeMilestone(milestone);
		const saved = await this.milestoneRepo.save(completed, expectedVersion);

		await this.auditEmitter.emit({
			userId,
			actorPrincipalType: PrincipalType.UserSession,
			eventType: 'milestone.completed',
			entityType: 'Milestone',
			entityId: saved.id
		});

		return saved;
	}

	async reopenMilestone(
		userId: string,
		milestoneId: string,
		expectedVersion: number
	): Promise<Milestone> {
		const milestone = await this.loadOwnedMilestone(userId, milestoneId);
		const reopened = reopenMilestone(milestone);
		const saved = await this.milestoneRepo.save(reopened, expectedVersion);

		await this.auditEmitter.emit({
			userId,
			actorPrincipalType: PrincipalType.UserSession,
			eventType: 'milestone.reopened',
			entityType: 'Milestone',
			entityId: saved.id
		});

		return saved;
	}

	async archiveMilestone(
		userId: string,
		milestoneId: string,
		expectedVersion: number
	): Promise<void> {
		await this.loadOwnedMilestone(userId, milestoneId);
		await this.milestoneRepo.archive(milestoneId, expectedVersion);

		await this.auditEmitter.emit({
			userId,
			actorPrincipalType: PrincipalType.UserSession,
			eventType: 'milestone.archived',
			entityType: 'Milestone',
			entityId: milestoneId
		});
	}

	async restoreMilestone(
		userId: string,
		milestoneId: string,
		expectedVersion: number
	): Promise<Milestone> {
		await this.loadOwnedMilestone(userId, milestoneId);
		const restored = await this.milestoneRepo.restoreToOpen(milestoneId, expectedVersion);

		await this.auditEmitter.emit({
			userId,
			actorPrincipalType: PrincipalType.UserSession,
			eventType: 'milestone.restored',
			entityType: 'Milestone',
			entityId: milestoneId
		});

		return restored;
	}

	async queryMilestones(
		userId: string,
		query: MilestoneQuery
	): Promise<{ items: unknown[]; nextCursor?: string }> {
		const page = await this.milestoneRepo.query(userId, query);
		return { items: page.items, nextCursor: page.cursor ?? undefined };
	}

	private async loadOwnedMilestone(userId: string, milestoneId: string): Promise<Milestone> {
		const milestone = await this.milestoneRepo.findById(milestoneId);
		if (!milestone) throw new NotFoundError('Milestone', milestoneId);

		const aspect = await this.aspectRepo.findById(milestone.aspectId);
		if (!aspect || aspect.userId !== userId) throw new OwnershipError();

		return milestone;
	}
}
