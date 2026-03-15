import { ReminderStatus, ReminderChannel } from '../enums.js';
import { InputError } from '$lib/server/errors/domain-errors.js';

export interface Reminder {
	readonly id: string;
	readonly taskId: string;
	readonly remindAtUtc: Date;
	readonly remindUtcOffsetMinutes: number;
	readonly remindDstOffsetMinutes: number;
	readonly channel: string;
	readonly status: string;
	readonly snoozeCount: number;
	readonly version: number;
	readonly lastAttemptAt: Date | null;
	readonly nextRetryAt: Date | null;
	readonly terminalFailedAt: Date | null;
	readonly createdAt: Date;
}

export function createReminder(params: {
	id: string;
	taskId: string;
	remindAtUtc: Date;
	remindUtcOffsetMinutes: number;
	remindDstOffsetMinutes: number;
	channel: string;
}): Reminder {
	if (!params.taskId) throw new InputError('Reminder requires a task reference');
	if (params.channel !== ReminderChannel.InApp && params.channel !== ReminderChannel.Email) {
		throw new InputError('Channel must be in_app or email');
	}
	return {
		...params,
		status: ReminderStatus.Pending,
		snoozeCount: 0,
		version: 1,
		lastAttemptAt: null,
		nextRetryAt: null,
		terminalFailedAt: null,
		createdAt: new Date()
	};
}
