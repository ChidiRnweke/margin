import type { IUserRepository } from '$lib/server/repositories/contracts/user-repository.js';
import type { ISessionRepository } from '$lib/server/repositories/contracts/session-repository.js';
import type { IAspectRepository } from '$lib/server/repositories/contracts/aspect-repository.js';
import type { IMilestoneRepository } from '$lib/server/repositories/contracts/milestone-repository.js';
import type { ITaskRepository } from '$lib/server/repositories/contracts/task-repository.js';
import type { IRecurringSeriesRepository } from '$lib/server/repositories/contracts/recurring-series-repository.js';
import type { IAvailabilityRepository } from '$lib/server/repositories/contracts/availability-repository.js';
import type { IPlanningCycleRepository } from '$lib/server/repositories/contracts/planning-cycle-repository.js';
import type { IReminderRepository } from '$lib/server/repositories/contracts/reminder-repository.js';
import type { IAuditEventRepository } from '$lib/server/repositories/contracts/audit-event-repository.js';
import type { IIdempotencyKeyRepository } from '$lib/server/repositories/contracts/idempotency-key-repository.js';
import type { IImportJobRepository } from '$lib/server/repositories/contracts/import-job-repository.js';
import type { IAccountErasureService } from '$lib/server/services/contracts/account-erasure-service.js';

export class AccountErasureService implements IAccountErasureService {
	constructor(
		private userRepo: IUserRepository,
		private sessionRepo: ISessionRepository,
		private aspectRepo: IAspectRepository,
		private milestoneRepo: IMilestoneRepository,
		private taskRepo: ITaskRepository,
		private recurringSeriesRepo: IRecurringSeriesRepository,
		private availabilityRepo: IAvailabilityRepository,
		private planningCycleRepo: IPlanningCycleRepository,
		private reminderRepo: IReminderRepository,
		private auditEventRepo: IAuditEventRepository,
		private idempotencyKeyRepo: IIdempotencyKeyRepository,
		private importJobRepo: IImportJobRepository
	) {}

	async eraseUserAccount(userId: string): Promise<void> {
		// Delete in dependency order: leaf entities first, then parents
		await this.auditEventRepo.deleteByUserId(userId);
		await this.idempotencyKeyRepo.deleteByUserId(userId);
		await this.reminderRepo.deleteByUserId(userId);
		await this.planningCycleRepo.deleteByUserId(userId);
		await this.availabilityRepo.deleteByUserId(userId);
		await this.recurringSeriesRepo.deleteByUserId(userId);
		await this.taskRepo.deleteByUserId(userId);

		const aspects = await this.aspectRepo.listActiveForUser(userId);
		const aspectIds = aspects.map((a) => a.id);
		if (aspectIds.length > 0) {
			await this.milestoneRepo.deleteByAspectIds(aspectIds);
		}

		await this.aspectRepo.deleteByUserId(userId);
		await this.importJobRepo.deleteByUserId(userId);
		await this.sessionRepo.revokeAllForUser(userId);
		await this.userRepo.delete(userId);
	}
}
