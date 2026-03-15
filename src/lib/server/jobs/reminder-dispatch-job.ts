import type { IReminderDispatchService } from '$lib/server/services/contracts/reminder-dispatch-service.js';

export class ReminderDispatchJob {
	constructor(private dispatchService: IReminderDispatchService) {}

	async execute() {
		return this.dispatchService.dispatchDueReminders(new Date());
	}
}
