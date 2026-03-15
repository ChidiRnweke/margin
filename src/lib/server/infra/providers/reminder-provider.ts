export interface ReminderDeliveryResult {
	success: boolean;
	errorCode?: string;
}

export interface IReminderDeliveryProvider {
	deliver(params: {
		taskId: string;
		taskTitle: string;
		remindAtUtc: Date;
		channel: string;
		userId: string;
	}): Promise<ReminderDeliveryResult>;
}
