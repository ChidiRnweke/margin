import type {
	IProfileService,
	UpdatePlanningProfileInput
} from '$lib/server/services/contracts/profile-service.js';

export class ProfileController {
	constructor(private profileService: IProfileService) {}

	async completeOnboarding(userId: string) {
		return this.profileService.completeOnboarding(userId);
	}

	async updateProfile(userId: string, input: UpdatePlanningProfileInput, expectedVersion: number) {
		return this.profileService.updatePlanningProfile(userId, input, expectedVersion);
	}
}
