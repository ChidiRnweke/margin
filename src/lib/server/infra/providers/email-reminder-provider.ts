import type { IReminderDeliveryProvider, ReminderDeliveryResult } from './reminder-provider.js';

export class EmailReminderProvider implements IReminderDeliveryProvider {
	async deliver(): Promise<ReminderDeliveryResult> {
		// Email delivery will be wired when SMTP provider is configured
		return { success: true };
	}
}
