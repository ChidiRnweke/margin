import { AvailabilityKind } from '../enums.js';
import { InputError } from '$lib/server/errors/domain-errors.js';

export interface AvailabilityBlock {
	readonly id: string;
	readonly userId: string;
	readonly kind: string;
	readonly oneOffStartsAtUtc: Date | null;
	readonly oneOffEndsAtUtc: Date | null;
	readonly localStartMinute: number | null;
	readonly localEndMinute: number | null;
	readonly weekdayMask: number | null;
	readonly startsOnLocal: string | null;
	readonly endsOnLocal: string | null;
	readonly active: boolean;
	readonly version: number;
	readonly createdAt: Date;
	readonly archivedAt: Date | null;
}

export function createOneOffBlock(params: {
	id: string;
	userId: string;
	oneOffStartsAtUtc: Date;
	oneOffEndsAtUtc: Date;
}): AvailabilityBlock {
	if (params.oneOffStartsAtUtc >= params.oneOffEndsAtUtc) {
		throw new InputError('One-off block start must be before end');
	}
	return {
		id: params.id,
		userId: params.userId,
		kind: AvailabilityKind.OneOff,
		oneOffStartsAtUtc: params.oneOffStartsAtUtc,
		oneOffEndsAtUtc: params.oneOffEndsAtUtc,
		localStartMinute: null,
		localEndMinute: null,
		weekdayMask: null,
		startsOnLocal: null,
		endsOnLocal: null,
		active: true,
		version: 1,
		createdAt: new Date(),
		archivedAt: null
	};
}

export function createRecurringBlock(params: {
	id: string;
	userId: string;
	localStartMinute: number;
	localEndMinute: number;
	weekdayMask: number;
	startsOnLocal?: string;
	endsOnLocal?: string;
}): AvailabilityBlock {
	if (params.localStartMinute >= params.localEndMinute) {
		throw new InputError('Recurring block local start must be before end');
	}
	return {
		id: params.id,
		userId: params.userId,
		kind: AvailabilityKind.Recurring,
		oneOffStartsAtUtc: null,
		oneOffEndsAtUtc: null,
		localStartMinute: params.localStartMinute,
		localEndMinute: params.localEndMinute,
		weekdayMask: params.weekdayMask,
		startsOnLocal: params.startsOnLocal || null,
		endsOnLocal: params.endsOnLocal || null,
		active: true,
		version: 1,
		createdAt: new Date(),
		archivedAt: null
	};
}
