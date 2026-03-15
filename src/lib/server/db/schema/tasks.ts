import {
	pgTable,
	uuid,
	varchar,
	text,
	integer,
	boolean,
	timestamp,
	index
} from 'drizzle-orm/pg-core';
import { aspects } from './aspects.js';
import { milestones } from './milestones.js';
import { recurringTaskSeries } from './recurring-task-series.js';

export const tasks = pgTable(
	'tasks',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		aspectId: uuid('aspect_id')
			.notNull()
			.references(() => aspects.id, { onDelete: 'cascade' }),
		milestoneId: uuid('milestone_id').references(() => milestones.id, { onDelete: 'set null' }),
		recurringTaskSeriesId: uuid('recurring_task_series_id').references(
			() => recurringTaskSeries.id,
			{ onDelete: 'set null' }
		),
		title: varchar('title', { length: 255 }).notNull(),
		description: text('description'),
		effortMinutes: integer('effort_minutes').notNull(),
		remainingMinutes: integer('remaining_minutes').notNull(),
		dueDate: varchar('due_date', { length: 10 }),
		importanceScore: integer('importance_score').notNull().default(50),
		splittableOverride: boolean('splittable_override'),
		status: varchar('status', { length: 50 }).notNull().default('Backlog'),
		overdue: boolean('overdue').notNull().default(false),
		version: integer('version').notNull().default(1),
		completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
		archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'date' }),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => [
		index('idx_tasks_aspect_id').on(table.aspectId),
		index('idx_tasks_milestone_id').on(table.milestoneId),
		index('idx_tasks_status').on(table.status),
		index('idx_tasks_aspect_id_status').on(table.aspectId, table.status),
		index('idx_tasks_due_date').on(table.dueDate),
		index('idx_tasks_overdue').on(table.overdue)
	]
);
