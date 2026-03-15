import { pgTable, uuid, varchar, integer, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { recurringTaskSeries } from './recurring-task-series.js';

export const recurrenceRules = pgTable(
	'recurrence_rules',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		recurringTaskSeriesId: uuid('recurring_task_series_id')
			.notNull()
			.references(() => recurringTaskSeries.id, { onDelete: 'cascade' }),
		frequency: varchar('frequency', { length: 50 }).notNull(),
		interval: integer('interval').notNull().default(1),
		weekdayMask: integer('weekday_mask'),
		monthDay: integer('month_day'),
		anchorDateLocal: varchar('anchor_date_local', { length: 10 }).notNull(),
		paused: boolean('paused').notNull().default(false),
		version: integer('version').notNull().default(1),
		endsOn: varchar('ends_on', { length: 10 }),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => [index('idx_recurrence_rules_series_id').on(table.recurringTaskSeriesId)]
);
