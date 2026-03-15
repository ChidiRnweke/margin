export interface UpsertReminderInput {
	taskId: string;
	remindAtUtc: string;
	channel: 'in_app' | 'email';
}

export interface SnoozeReminderInput {
	snoozeMinutes: number;
}

export interface IReminderService {
	upsertReminder(
		userId: string,
		taskId: string,
		input: UpsertReminderInput,
		expectedVersionOrNone?: number
	): Promise<unknown>;
	snoozeReminder(
		userId: string,
		reminderId: string,
		input: SnoozeReminderInput,
		expectedVersion: number
	): Promise<unknown>;
}
