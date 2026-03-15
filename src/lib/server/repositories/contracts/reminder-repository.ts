import type { Reminder } from '$lib/server/domain/models/reminder.js';
import type { ReminderAttempt } from '$lib/server/domain/models/reminder-attempt.js';

export interface ReminderAggregate {
	reminder: Reminder;
	attempts: ReminderAttempt[];
}

export interface IReminderRepository {
	findById(reminderId: string): Promise<ReminderAggregate | null>;
	findActiveByTaskChannel(taskId: string, channel: string): Promise<ReminderAggregate | null>;
	save(aggregate: ReminderAggregate, expectedVersion: number | null): Promise<ReminderAggregate>;
	recordAttempt(reminderId: string, attempt: ReminderAttempt): Promise<ReminderAttempt>;
	queryDue(now: Date): Promise<ReminderAggregate[]>;
	queryFailedForRetry(now: Date): Promise<ReminderAggregate[]>;
	cancelPendingForTask(taskId: string): Promise<number>;
	deleteByUserId(userId: string): Promise<number>;
}
