import type {
	IReminderService,
	UpsertReminderInput,
	SnoozeReminderInput
} from '$lib/server/services/contracts/reminder-service.js';
import type { IReminderRepository } from '$lib/server/repositories/contracts/reminder-repository.js';
import type { AuditEmitter } from '$lib/server/infra/audit/audit-emitter.js';
import { createReminder } from '$lib/server/domain/models/reminder.js';
import { NotFoundError, SnoozeLimitExceededError } from '$lib/server/errors/domain-errors.js';

const MAX_SNOOZE_COUNT = 5;

export class ReminderService implements IReminderService {
	constructor(
		private reminderRepo: IReminderRepository,
		private auditEmitter: AuditEmitter
	) {}

	async upsertReminder(
		userId: string,
		taskId: string,
		input: UpsertReminderInput,
		expectedVersionOrNone?: number
	) {
		const existing = await this.reminderRepo.findActiveByTaskChannel(taskId, input.channel);

		if (existing) {
			const updated = {
				...existing.reminder,
				remindAtUtc: new Date(input.remindAtUtc)
			};
			const saved = await this.reminderRepo.save(
				{ reminder: updated, attempts: existing.attempts },
				expectedVersionOrNone ?? existing.reminder.version
			);
			await this.auditEmitter.emit({
				userId,
				actorPrincipalType: 'UserSession',
				eventType: 'reminder.updated',
				entityType: 'Reminder',
				entityId: saved.reminder.id,
				after: { taskId, channel: input.channel, remindAtUtc: input.remindAtUtc }
			});
			return saved.reminder;
		}

		const reminder = createReminder({
			id: crypto.randomUUID(),
			taskId,
			remindAtUtc: new Date(input.remindAtUtc),
			remindUtcOffsetMinutes: 0,
			remindDstOffsetMinutes: 0,
			channel: input.channel
		});
		const saved = await this.reminderRepo.save({ reminder, attempts: [] }, null);
		await this.auditEmitter.emit({
			userId,
			actorPrincipalType: 'UserSession',
			eventType: 'reminder.created',
			entityType: 'Reminder',
			entityId: saved.reminder.id,
			after: { taskId, channel: input.channel, remindAtUtc: input.remindAtUtc }
		});
		return saved.reminder;
	}

	async snoozeReminder(
		userId: string,
		reminderId: string,
		input: SnoozeReminderInput,
		expectedVersion: number
	) {
		const agg = await this.reminderRepo.findById(reminderId);
		if (!agg) throw new NotFoundError('Reminder', reminderId);

		if (agg.reminder.snoozeCount >= MAX_SNOOZE_COUNT) {
			throw new SnoozeLimitExceededError(MAX_SNOOZE_COUNT);
		}

		const snoozedReminder = {
			...agg.reminder,
			remindAtUtc: new Date(agg.reminder.remindAtUtc.getTime() + input.snoozeMinutes * 60000),
			snoozeCount: agg.reminder.snoozeCount + 1
		};

		const saved = await this.reminderRepo.save(
			{ reminder: snoozedReminder, attempts: agg.attempts },
			expectedVersion
		);
		await this.auditEmitter.emit({
			userId,
			actorPrincipalType: 'UserSession',
			eventType: 'reminder.snoozed',
			entityType: 'Reminder',
			entityId: reminderId,
			after: { snoozeMinutes: input.snoozeMinutes, snoozeCount: snoozedReminder.snoozeCount }
		});
		return saved.reminder;
	}
}
