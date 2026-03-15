import type { IDataPortabilityService } from '$lib/server/services/contracts/data-portability-service.js';

export class DataPortabilityController {
	constructor(private dataPortabilityService: IDataPortabilityService) {}

	async exportUserData(userId: string) {
		return this.dataPortabilityService.exportUserData(userId);
	}

	async importUserData(userId: string, payload: unknown) {
		return this.dataPortabilityService.importUserData(userId, payload);
	}
}
