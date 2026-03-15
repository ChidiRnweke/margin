import type {
	IRecurrenceService,
	UpsertSeriesInput,
	SkipOrMoveInput
} from '$lib/server/services/contracts/recurrence-service.js';

export class RecurrenceController {
	constructor(private recurrenceService: IRecurrenceService) {}

	async upsertSeries(userId: string, input: UpsertSeriesInput, expectedVersionOrNone?: number) {
		return this.recurrenceService.upsertSeries(userId, input, expectedVersionOrNone);
	}

	async pauseOrResumeSeries(
		userId: string,
		seriesId: string,
		paused: boolean,
		expectedVersion: number
	) {
		return this.recurrenceService.pauseOrResumeSeries(userId, seriesId, paused, expectedVersion);
	}

	async skipOrMoveNextOccurrence(
		userId: string,
		seriesId: string,
		input: SkipOrMoveInput,
		expectedVersion: number
	) {
		return this.recurrenceService.skipOrMoveNextOccurrence(
			userId,
			seriesId,
			input,
			expectedVersion
		);
	}

	async closeSeries(userId: string, seriesId: string, expectedVersion: number) {
		return this.recurrenceService.closeSeries(userId, seriesId, expectedVersion);
	}
}
