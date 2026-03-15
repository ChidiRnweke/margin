import type { AvailabilityExceptionAction } from '../enums.js';
import { InputError } from '$lib/server/errors/domain-errors.js';

export interface AvailabilityException {
	readonly id: string;
	readonly availabilityBlockId: string;
	readonly exceptionDate: string;
	readonly action: string;
	readonly overrideStartsAtUtc: Date | null;
	readonly overrideEndsAtUtc: Date | null;
	readonly overrideLocalStartMinute: number | null;
	readonly overrideLocalEndMinute: number | null;
	readonly createdAt: Date;
}

export function createAvailabilityException(params: {
	id: string;
	availabilityBlockId: string;
	exceptionDate: string;
	action: AvailabilityExceptionAction;
	overrideStartsAtUtc?: Date;
	overrideEndsAtUtc?: Date;
	overrideLocalStartMinute?: number;
	overrideLocalEndMinute?: number;
}): AvailabilityException {
	if (!params.exceptionDate) throw new InputError('Exception date is required');
	if (params.action === 'Override') {
		if (!params.overrideStartsAtUtc && params.overrideLocalStartMinute === undefined) {
			throw new InputError('Override exception requires override times');
		}
	}
	return {
		id: params.id,
		availabilityBlockId: params.availabilityBlockId,
		exceptionDate: params.exceptionDate,
		action: params.action,
		overrideStartsAtUtc: params.overrideStartsAtUtc ?? null,
		overrideEndsAtUtc: params.overrideEndsAtUtc ?? null,
		overrideLocalStartMinute: params.overrideLocalStartMinute ?? null,
		overrideLocalEndMinute: params.overrideLocalEndMinute ?? null,
		createdAt: new Date()
	};
}
