import type {
	IReminderService,
	UpsertReminderInput,
	SnoozeReminderInput
} from '$lib/server/services/contracts/reminder-service.js';

export class ReminderController {
	constructor(private reminderService: IReminderService) {}

	async upsertReminder(
		userId: string,
		taskId: string,
		input: UpsertReminderInput,
		expectedVersionOrNone?: number
	) {
		return this.reminderService.upsertReminder(userId, taskId, input, expectedVersionOrNone);
	}

	async snoozeReminder(
		userId: string,
		reminderId: string,
		input: SnoozeReminderInput,
		expectedVersion: number
	) {
		return this.reminderService.snoozeReminder(userId, reminderId, input, expectedVersion);
	}
}
