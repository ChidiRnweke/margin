import type { IPlanningProfileRepository } from '$lib/server/repositories/contracts/planning-profile-repository.js';
import type { IAspectRepository } from '$lib/server/repositories/contracts/aspect-repository.js';
import type {
	IProfileService,
	OnboardingStatus,
	UpdatePlanningProfileInput
} from '$lib/server/services/contracts/profile-service.js';
import type { AuditEmitter } from '$lib/server/infra/audit/audit-emitter.js';
import type { PlanningProfile } from '$lib/server/domain/models/planning-profile.js';
import { updatePlanningProfile } from '$lib/server/domain/models/planning-profile.js';
import { PrincipalType } from '$lib/server/domain/enums.js';

export class ProfileService implements IProfileService {
	constructor(
		private profileRepo: IPlanningProfileRepository,
		private aspectRepo: IAspectRepository,
		private auditEmitter: AuditEmitter
	) {}

	async completeOnboarding(userId: string): Promise<OnboardingStatus> {
		const activeAspects = await this.aspectRepo.listActiveForUser(userId);
		return {
			complete: activeAspects.length >= 1,
			activeAspectCount: activeAspects.length
		};
	}

	async updatePlanningProfile(
		userId: string,
		input: UpdatePlanningProfileInput,
		expectedVersion: number
	): Promise<PlanningProfile> {
		const profile = await this.profileRepo.getByUserId(userId);
		const updated = updatePlanningProfile(profile, input);
		const saved = await this.profileRepo.save(updated, expectedVersion);

		await this.auditEmitter.emit({
			userId,
			actorPrincipalType: PrincipalType.UserSession,
			eventType: 'planning_profile.updated',
			entityType: 'PlanningProfile',
			entityId: saved.id,
			before: profile as unknown as Record<string, unknown>,
			after: saved as unknown as Record<string, unknown>
		});

		return saved;
	}
}
