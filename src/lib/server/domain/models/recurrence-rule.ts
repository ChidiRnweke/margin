import type { RecurrenceFrequency } from '../enums.js';
import { PositiveInterval } from '../value-objects/bounded-int.js';
import { InputError } from '$lib/server/errors/domain-errors.js';

export interface RecurrenceRule {
	readonly id: string;
	readonly recurringTaskSeriesId: string;
	readonly frequency: string;
	readonly interval: number;
	readonly weekdayMask: number | null;
	readonly monthDay: number | null;
	readonly anchorDateLocal: string;
	readonly paused: boolean;
	readonly version: number;
	readonly endsOn: string | null;
	readonly createdAt: Date;
	readonly updatedAt: Date;
}

export function createRecurrenceRule(params: {
	id: string;
	recurringTaskSeriesId: string;
	frequency: RecurrenceFrequency;
	interval: number;
	weekdayMask?: number;
	monthDay?: number;
	anchorDateLocal: string;
	endsOn?: string;
}): RecurrenceRule {
	new PositiveInterval(params.interval);
	if (!params.anchorDateLocal) throw new InputError('Anchor date is required');
	if (params.frequency === 'Weekly' && !params.weekdayMask)
		throw new InputError('Weekly frequency requires weekday mask');
	if (params.frequency === 'Monthly' && !params.monthDay)
		throw new InputError('Monthly frequency requires month day');

	const now = new Date();
	return {
		id: params.id,
		recurringTaskSeriesId: params.recurringTaskSeriesId,
		frequency: params.frequency,
		interval: params.interval,
		weekdayMask: params.weekdayMask ?? null,
		monthDay: params.monthDay ?? null,
		anchorDateLocal: params.anchorDateLocal,
		paused: false,
		version: 1,
		endsOn: params.endsOn || null,
		createdAt: now,
		updatedAt: now
	};
}
