import type { RecurrenceExceptionAction } from '../enums.js';
import { InputError } from '$lib/server/errors/domain-errors.js';

export interface RecurrenceException {
	readonly id: string;
	readonly recurrenceRuleId: string;
	readonly occurrenceDateLocal: string;
	readonly action: string;
	readonly overrideOccurrenceDateLocal: string | null;
	readonly createdAt: Date;
}

export function createRecurrenceException(params: {
	id: string;
	recurrenceRuleId: string;
	occurrenceDateLocal: string;
	action: RecurrenceExceptionAction;
	overrideOccurrenceDateLocal?: string;
}): RecurrenceException {
	if (!params.occurrenceDateLocal) throw new InputError('Occurrence date is required');
	if (params.action === 'Move' && !params.overrideOccurrenceDateLocal) {
		throw new InputError('Move exception requires override date');
	}
	return {
		id: params.id,
		recurrenceRuleId: params.recurrenceRuleId,
		occurrenceDateLocal: params.occurrenceDateLocal,
		action: params.action,
		overrideOccurrenceDateLocal: params.overrideOccurrenceDateLocal || null,
		createdAt: new Date()
	};
}
