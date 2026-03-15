import type { IReminderDispatchService } from '$lib/server/services/contracts/reminder-dispatch-service.js';

export class ReminderRetryJob {
	constructor(private dispatchService: IReminderDispatchService) {}

	async execute() {
		return this.dispatchService.processFailedReminders(new Date());
	}
}
