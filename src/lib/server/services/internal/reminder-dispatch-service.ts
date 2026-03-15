import type {
	IReminderDispatchService,
	DispatchSummary,
	RetrySummary
} from '$lib/server/services/contracts/reminder-dispatch-service.js';
import type { IReminderRepository } from '$lib/server/repositories/contracts/reminder-repository.js';
import type { ITaskRepository } from '$lib/server/repositories/contracts/task-repository.js';
import type { IReminderDeliveryProvider } from '$lib/server/infra/providers/reminder-provider.js';
import { createReminderAttempt } from '$lib/server/domain/models/reminder-attempt.js';
import { ReminderAttemptResult, ReminderStatus } from '$lib/server/domain/enums.js';

const MAX_RETRY_ATTEMPTS = 3;

export class ReminderDispatchService implements IReminderDispatchService {
	constructor(
		private reminderRepo: IReminderRepository,
		private taskRepo: ITaskRepository,
		private inAppProvider: IReminderDeliveryProvider,
		private emailProvider: IReminderDeliveryProvider
	) {}

	async dispatchDueReminders(now: Date): Promise<DispatchSummary> {
		const dueReminders = await this.reminderRepo.queryDue(now);
		let dispatched = 0;
		let failed = 0;

		for (const agg of dueReminders) {
			const provider =
				agg.reminder.channel === 'email' ? this.emailProvider : this.inAppProvider;
			const task = await this.taskRepo.findById(agg.reminder.taskId);

			try {
				const result = await provider.deliver({
					taskId: agg.reminder.taskId,
					taskTitle: task?.title ?? 'Unknown task',
					remindAtUtc: agg.reminder.remindAtUtc,
					channel: agg.reminder.channel,
					userId: ''
				});

				const attempt = createReminderAttempt({
					id: crypto.randomUUID(),
					reminderId: agg.reminder.id,
					attemptNumber: agg.attempts.length + 1,
					result: result.success ? ReminderAttemptResult.Sent : ReminderAttemptResult.Failed,
					errorCode: result.errorCode
				});
				await this.reminderRepo.recordAttempt(agg.reminder.id, attempt);

				if (result.success) {
					const updated = {
						...agg.reminder,
						status: ReminderStatus.Sent,
						lastAttemptAt: now
					};
					await this.reminderRepo.save(
						{ reminder: updated, attempts: [...agg.attempts, attempt] },
						agg.reminder.version
					);
					dispatched++;
				} else {
					const nextRetry = new Date(
						now.getTime() + Math.pow(2, agg.attempts.length) * 60000
					);
					const updated = {
						...agg.reminder,
						status: ReminderStatus.Failed,
						lastAttemptAt: now,
						nextRetryAt: nextRetry
					};
					await this.reminderRepo.save(
						{ reminder: updated, attempts: [...agg.attempts, attempt] },
						agg.reminder.version
					);
					failed++;
				}
			} catch {
				failed++;
			}
		}

		return { dispatched, failed };
	}

	async processFailedReminders(now: Date): Promise<RetrySummary> {
		const failedReminders = await this.reminderRepo.queryFailedForRetry(now);
		let retried = 0;
		let terminalFailed = 0;

		for (const agg of failedReminders) {
			if (agg.attempts.length >= MAX_RETRY_ATTEMPTS) {
				const updated = { ...agg.reminder, terminalFailedAt: now };
				await this.reminderRepo.save(
					{ reminder: updated, attempts: agg.attempts },
					agg.reminder.version
				);
				terminalFailed++;
				continue;
			}

			const provider =
				agg.reminder.channel === 'email' ? this.emailProvider : this.inAppProvider;
			const task = await this.taskRepo.findById(agg.reminder.taskId);

			try {
				const result = await provider.deliver({
					taskId: agg.reminder.taskId,
					taskTitle: task?.title ?? 'Unknown task',
					remindAtUtc: agg.reminder.remindAtUtc,
					channel: agg.reminder.channel,
					userId: ''
				});

				const attempt = createReminderAttempt({
					id: crypto.randomUUID(),
					reminderId: agg.reminder.id,
					attemptNumber: agg.attempts.length + 1,
					result: result.success
						? ReminderAttemptResult.Sent
						: ReminderAttemptResult.Failed,
					errorCode: result.errorCode
				});
				await this.reminderRepo.recordAttempt(agg.reminder.id, attempt);

				if (result.success) {
					const updated = {
						...agg.reminder,
						status: ReminderStatus.Sent,
						lastAttemptAt: now
					};
					await this.reminderRepo.save(
						{ reminder: updated, attempts: [...agg.attempts, attempt] },
						agg.reminder.version
					);
				} else {
					const nextRetry = new Date(
						now.getTime() + Math.pow(2, agg.attempts.length + 1) * 60000
					);
					const updated = {
						...agg.reminder,
						lastAttemptAt: now,
						nextRetryAt: nextRetry
					};
					await this.reminderRepo.save(
						{ reminder: updated, attempts: [...agg.attempts, attempt] },
						agg.reminder.version
					);
				}
				retried++;
			} catch {
				terminalFailed++;
			}
		}

		return { retried, terminalFailed };
	}
}
