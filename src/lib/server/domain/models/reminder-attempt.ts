import type { ReminderAttemptResult } from '../enums.js';

export interface ReminderAttempt {
	readonly id: string;
	readonly reminderId: string;
	readonly attemptNumber: number;
	readonly result: string;
	readonly errorCode: string | null;
	readonly attemptedAt: Date;
}

export function createReminderAttempt(params: {
	id: string;
	reminderId: string;
	attemptNumber: number;
	result: ReminderAttemptResult;
	errorCode?: string;
}): ReminderAttempt {
	return {
		...params,
		errorCode: params.errorCode || null,
		attemptedAt: new Date()
	};
}
