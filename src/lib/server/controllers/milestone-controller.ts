import type {
	IMilestoneService,
	CreateMilestoneInput,
	UpdateMilestoneInput,
	MilestoneQuery
} from '$lib/server/services/contracts/milestone-service.js';

export class MilestoneController {
	constructor(private milestoneService: IMilestoneService) {}

	async createMilestone(userId: string, input: CreateMilestoneInput) {
		return this.milestoneService.createMilestone(userId, input);
	}

	async updateMilestone(
		userId: string,
		milestoneId: string,
		input: UpdateMilestoneInput,
		expectedVersion: number
	) {
		return this.milestoneService.updateMilestone(userId, milestoneId, input, expectedVersion);
	}

	async completeMilestone(userId: string, milestoneId: string, expectedVersion: number) {
		return this.milestoneService.completeMilestone(userId, milestoneId, expectedVersion);
	}

	async reopenMilestone(userId: string, milestoneId: string, expectedVersion: number) {
		return this.milestoneService.reopenMilestone(userId, milestoneId, expectedVersion);
	}

	async archiveMilestone(userId: string, milestoneId: string, expectedVersion: number) {
		return this.milestoneService.archiveMilestone(userId, milestoneId, expectedVersion);
	}

	async restoreMilestone(userId: string, milestoneId: string, expectedVersion: number) {
		return this.milestoneService.restoreMilestone(userId, milestoneId, expectedVersion);
	}

	async queryMilestones(userId: string, query: MilestoneQuery) {
		return this.milestoneService.queryMilestones(userId, query);
	}
}
