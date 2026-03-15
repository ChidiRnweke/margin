import { eq, and, sql, lte } from 'drizzle-orm';
import type { Database } from '$lib/server/db/index.js';
import { reminders, reminderAttempts } from '$lib/server/db/schema/index.js';
import type { Reminder } from '$lib/server/domain/models/reminder.js';
import type { ReminderAttempt } from '$lib/server/domain/models/reminder-attempt.js';
import type {
	IReminderRepository,
	ReminderAggregate
} from '$lib/server/repositories/contracts/reminder-repository.js';
import { OptimisticConcurrencyError } from '$lib/server/errors/domain-errors.js';

export class PostgresReminderRepository implements IReminderRepository {
	constructor(private db: Database) {}

	async findById(reminderId: string): Promise<ReminderAggregate | null> {
		const rows = await this.db
			.select()
			.from(reminders)
			.where(eq(reminders.id, reminderId))
			.limit(1);

		if (rows.length === 0) return null;
		return this.loadAggregate(rows[0] as Reminder);
	}

	async findActiveByTaskChannel(
		taskId: string,
		channel: string
	): Promise<ReminderAggregate | null> {
		const rows = await this.db
			.select()
			.from(reminders)
			.where(
				and(
					eq(reminders.taskId, taskId),
					eq(reminders.channel, channel),
					eq(reminders.status, 'Pending')
				)
			)
			.limit(1);

		if (rows.length === 0) return null;
		return this.loadAggregate(rows[0] as Reminder);
	}

	async save(
		aggregate: ReminderAggregate,
		expectedVersion: number | null
	): Promise<ReminderAggregate> {
		const { reminder } = aggregate;

		if (expectedVersion === null) {
			await this.db.insert(reminders).values({
				id: reminder.id,
				taskId: reminder.taskId,
				remindAtUtc: reminder.remindAtUtc,
				remindUtcOffsetMinutes: reminder.remindUtcOffsetMinutes,
				remindDstOffsetMinutes: reminder.remindDstOffsetMinutes,
				channel: reminder.channel,
				status: reminder.status,
				snoozeCount: reminder.snoozeCount,
				version: 1,
				lastAttemptAt: reminder.lastAttemptAt,
				nextRetryAt: reminder.nextRetryAt,
				terminalFailedAt: reminder.terminalFailedAt,
				createdAt: reminder.createdAt
			});
		} else {
			const updated = await this.db
				.update(reminders)
				.set({
					remindAtUtc: reminder.remindAtUtc,
					remindUtcOffsetMinutes: reminder.remindUtcOffsetMinutes,
					remindDstOffsetMinutes: reminder.remindDstOffsetMinutes,
					channel: reminder.channel,
					status: reminder.status,
					snoozeCount: reminder.snoozeCount,
					version: sql`${reminders.version} + 1`,
					lastAttemptAt: reminder.lastAttemptAt,
					nextRetryAt: reminder.nextRetryAt,
					terminalFailedAt: reminder.terminalFailedAt
				})
				.where(and(eq(reminders.id, reminder.id), eq(reminders.version, expectedVersion)))
				.returning();

			if (updated.length === 0) {
				throw new OptimisticConcurrencyError('Reminder', reminder.id);
			}
		}

		return (await this.findById(reminder.id))!;
	}

	async recordAttempt(reminderId: string, attempt: ReminderAttempt): Promise<ReminderAttempt> {
		const rows = await this.db
			.insert(reminderAttempts)
			.values({
				id: attempt.id,
				reminderId: attempt.reminderId,
				attemptNumber: attempt.attemptNumber,
				result: attempt.result,
				errorCode: attempt.errorCode,
				attemptedAt: attempt.attemptedAt
			})
			.returning();

		return rows[0] as ReminderAttempt;
	}

	async queryDue(now: Date): Promise<ReminderAggregate[]> {
		const rows = await this.db
			.select()
			.from(reminders)
			.where(and(eq(reminders.status, 'Pending'), lte(reminders.remindAtUtc, now)));

		return Promise.all(rows.map((r) => this.loadAggregate(r as Reminder)));
	}

	async queryFailedForRetry(now: Date): Promise<ReminderAggregate[]> {
		const rows = await this.db
			.select()
			.from(reminders)
			.where(and(eq(reminders.status, 'Failed'), lte(reminders.nextRetryAt, now)));

		return Promise.all(rows.map((r) => this.loadAggregate(r as Reminder)));
	}

	async cancelPendingForTask(taskId: string): Promise<number> {
		const updated = await this.db
			.update(reminders)
			.set({ status: 'Cancelled' })
			.where(and(eq(reminders.taskId, taskId), eq(reminders.status, 'Pending')))
			.returning();

		return updated.length;
	}

	async deleteByUserId(userId: string): Promise<number> {
		// Reminders are linked to tasks, which are linked to aspects, which are linked to users.
		// With cascade deletes on the FK chain, deleting via the task relationship is sufficient.
		// However, we use a subquery to find reminders for the user's tasks.
		const deleted = await this.db
			.delete(reminders)
			.where(
				sql`${reminders.taskId} IN (
					SELECT t.id FROM tasks t
					JOIN aspects a ON t.aspect_id = a.id
					WHERE a.user_id = ${userId}
				)`
			)
			.returning();

		return deleted.length;
	}

	private async loadAggregate(reminder: Reminder): Promise<ReminderAggregate> {
		const attemptRows = await this.db
			.select()
			.from(reminderAttempts)
			.where(eq(reminderAttempts.reminderId, reminder.id));

		return {
			reminder,
			attempts: attemptRows as ReminderAttempt[]
		};
	}
}
