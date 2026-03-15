import type { IReminderDeliveryProvider, ReminderDeliveryResult } from './reminder-provider.js';

export class InAppReminderProvider implements IReminderDeliveryProvider {
	async deliver(): Promise<ReminderDeliveryResult> {
		// In-app reminders are stored in DB and shown on next page load
		return { success: true };
	}
}
