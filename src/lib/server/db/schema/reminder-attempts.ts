import { pgTable, uuid, varchar, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { reminders } from './reminders.js';

export const reminderAttempts = pgTable(
	'reminder_attempts',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		reminderId: uuid('reminder_id')
			.notNull()
			.references(() => reminders.id, { onDelete: 'cascade' }),
		attemptNumber: integer('attempt_number').notNull(),
		result: varchar('result', { length: 50 }).notNull(),
		errorCode: varchar('error_code', { length: 100 }),
		attemptedAt: timestamp('attempted_at', { withTimezone: true, mode: 'date' })
			.notNull()
			.defaultNow()
	},
	(table) => [index('idx_reminder_attempts_reminder_id').on(table.reminderId)]
);
