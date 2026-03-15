import type {
	IAspectService,
	CreateAspectInput,
	ActivateAspectInput,
	UpdateAspectInput,
	AspectQuery
} from '$lib/server/services/contracts/aspect-service.js';

export class AspectController {
	constructor(private aspectService: IAspectService) {}

	async createAspect(userId: string, input: CreateAspectInput) {
		return this.aspectService.createAspect(userId, input);
	}

	async activateAspect(
		userId: string,
		aspectId: string,
		input: ActivateAspectInput,
		expectedVersion: number
	) {
		return this.aspectService.activateAspect(userId, aspectId, input, expectedVersion);
	}

	async updateAspect(
		userId: string,
		aspectId: string,
		input: UpdateAspectInput,
		expectedVersion: number
	) {
		return this.aspectService.updateAspect(userId, aspectId, input, expectedVersion);
	}

	async archiveAspect(userId: string, aspectId: string, expectedVersion: number) {
		return this.aspectService.archiveAspect(userId, aspectId, expectedVersion);
	}

	async restoreAspect(userId: string, aspectId: string, expectedVersion: number) {
		return this.aspectService.restoreAspect(userId, aspectId, expectedVersion);
	}

	async queryAspects(userId: string, query: AspectQuery) {
		return this.aspectService.queryAspects(userId, query);
	}
}
