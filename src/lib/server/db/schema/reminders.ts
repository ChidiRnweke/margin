import { pgTable, uuid, varchar, integer, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { tasks } from './tasks.js';

export const reminders = pgTable(
	'reminders',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		taskId: uuid('task_id')
			.notNull()
			.references(() => tasks.id, { onDelete: 'cascade' }),
		remindAtUtc: timestamp('remind_at_utc', { withTimezone: true, mode: 'date' }).notNull(),
		remindUtcOffsetMinutes: integer('remind_utc_offset_minutes').notNull(),
		remindDstOffsetMinutes: integer('remind_dst_offset_minutes').notNull(),
		channel: varchar('channel', { length: 50 }).notNull(),
		status: varchar('status', { length: 50 }).notNull().default('Pending'),
		snoozeCount: integer('snooze_count').notNull().default(0),
		version: integer('version').notNull().default(1),
		lastAttemptAt: timestamp('last_attempt_at', { withTimezone: true, mode: 'date' }),
		nextRetryAt: timestamp('next_retry_at', { withTimezone: true, mode: 'date' }),
		terminalFailedAt: timestamp('terminal_failed_at', { withTimezone: true, mode: 'date' }),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => [
		uniqueIndex('uq_reminders_task_channel_pending')
			.on(table.taskId, table.channel)
			.where(sql`${table.status} = 'Pending'`),
		index('idx_reminders_task_id').on(table.taskId),
		index('idx_reminders_status').on(table.status)
	]
);
