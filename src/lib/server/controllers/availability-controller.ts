import type {
	IAvailabilityService,
	CreateOneOffBlockInput,
	CreateRecurringBlockInput,
	AddRecurringExceptionInput,
	UpdateArchiveRestoreBlockInput,
	DateRange
} from '$lib/server/services/contracts/availability-service.js';

export class AvailabilityController {
	constructor(private availabilityService: IAvailabilityService) {}

	async createOneOffBlock(userId: string, input: CreateOneOffBlockInput) {
		return this.availabilityService.createOneOffBlock(userId, input);
	}

	async createRecurringBlock(userId: string, input: CreateRecurringBlockInput) {
		return this.availabilityService.createRecurringBlock(userId, input);
	}

	async addRecurringException(userId: string, blockId: string, input: AddRecurringExceptionInput) {
		return this.availabilityService.addRecurringException(userId, blockId, input);
	}

	async updateArchiveRestoreBlock(
		userId: string,
		blockId: string,
		input: UpdateArchiveRestoreBlockInput,
		expectedVersion: number
	) {
		return this.availabilityService.updateArchiveRestoreBlock(
			userId,
			blockId,
			input,
			expectedVersion
		);
	}

	async queryEffectiveAvailability(userId: string, range: DateRange) {
		return this.availabilityService.queryEffectiveAvailability(userId, range);
	}
}
