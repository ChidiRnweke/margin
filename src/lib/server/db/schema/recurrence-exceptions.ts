import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { recurrenceRules } from './recurrence-rules.js';

export const recurrenceExceptions = pgTable(
	'recurrence_exceptions',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		recurrenceRuleId: uuid('recurrence_rule_id')
			.notNull()
			.references(() => recurrenceRules.id, { onDelete: 'cascade' }),
		occurrenceDateLocal: varchar('occurrence_date_local', { length: 10 }).notNull(),
		action: varchar('action', { length: 50 }).notNull(),
		overrideOccurrenceDateLocal: varchar('override_occurrence_date_local', { length: 10 }),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => [index('idx_recurrence_exceptions_rule_id').on(table.recurrenceRuleId)]
);
