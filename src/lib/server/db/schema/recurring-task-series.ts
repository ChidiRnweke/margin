import { pgTable, uuid, varchar, text, integer, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users.js';
import { aspects } from './aspects.js';
import { milestones } from './milestones.js';

export const recurringTaskSeries = pgTable(
	'recurring_task_series',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		aspectId: uuid('aspect_id')
			.notNull()
			.references(() => aspects.id, { onDelete: 'cascade' }),
		milestoneId: uuid('milestone_id').references(() => milestones.id, { onDelete: 'set null' }),
		titleTemplate: varchar('title_template', { length: 255 }).notNull(),
		descriptionTemplate: text('description_template'),
		effortMinutesTemplate: integer('effort_minutes_template').notNull(),
		importanceScoreTemplate: integer('importance_score_template').notNull(),
		splittableOverride: boolean('splittable_override'),
		status: varchar('status', { length: 50 }).notNull().default('Active'),
		nextOccurrenceDateLocal: varchar('next_occurrence_date_local', { length: 10 }),
		version: integer('version').notNull().default(1),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		closedAt: timestamp('closed_at', { withTimezone: true, mode: 'date' })
	},
	(table) => [
		index('idx_recurring_task_series_user_id').on(table.userId),
		index('idx_recurring_task_series_aspect_id').on(table.aspectId),
		index('idx_recurring_task_series_status').on(table.status)
	]
);
