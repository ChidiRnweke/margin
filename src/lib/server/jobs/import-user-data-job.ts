import type { IDataPortabilityService } from '$lib/server/services/contracts/data-portability-service.js';

export class ImportUserDataJob {
	constructor(private portabilityService: IDataPortabilityService) {}

	async execute(userId: string, payload: unknown) {
		return this.portabilityService.importUserData(userId, payload);
	}
}
