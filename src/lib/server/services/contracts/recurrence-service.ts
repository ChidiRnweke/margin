export interface UpsertSeriesInput {
	aspectId: string;
	milestoneId?: string;
	titleTemplate: string;
	descriptionTemplate?: string;
	effortMinutesTemplate: number;
	importanceScoreTemplate: number;
	splittableOverride?: boolean;
	frequency: string;
	interval: number;
	weekdayMask?: number;
	monthDay?: number;
	anchorDateLocal: string;
	endsOn?: string;
}

export interface SkipOrMoveInput {
	action: 'Skip' | 'Move';
	occurrenceDateLocal: string;
	overrideDateLocal?: string;
}

export interface IRecurrenceService {
	upsertSeries(
		userId: string,
		input: UpsertSeriesInput,
		expectedVersionOrNone?: number
	): Promise<unknown>;
	pauseOrResumeSeries(
		userId: string,
		seriesId: string,
		paused: boolean,
		expectedVersion: number
	): Promise<unknown>;
	skipOrMoveNextOccurrence(
		userId: string,
		seriesId: string,
		input: SkipOrMoveInput,
		expectedVersion: number
	): Promise<unknown>;
	closeSeries(userId: string, seriesId: string, expectedVersion: number): Promise<unknown>;
}
