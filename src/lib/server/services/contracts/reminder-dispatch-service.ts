export interface DispatchSummary {
	dispatched: number;
	failed: number;
}

export interface RetrySummary {
	retried: number;
	terminalFailed: number;
}

export interface IReminderDispatchService {
	dispatchDueReminders(now: Date): Promise<DispatchSummary>;
	processFailedReminders(now: Date): Promise<RetrySummary>;
}
