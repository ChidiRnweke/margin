import { pgTable, uuid, varchar, text, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { aspects } from './aspects.js';

export const milestones = pgTable(
	'milestones',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		aspectId: uuid('aspect_id')
			.notNull()
			.references(() => aspects.id, { onDelete: 'cascade' }),
		title: varchar('title', { length: 255 }).notNull(),
		description: text('description'),
		targetDate: varchar('target_date', { length: 10 }),
		status: varchar('status', { length: 50 }).notNull().default('Open'),
		version: integer('version').notNull().default(1),
		completedAt: timestamp('completed_at', { withTimezone: true, mode: 'date' }),
		archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'date' }),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => [
		index('idx_milestones_aspect_id').on(table.aspectId),
		index('idx_milestones_status').on(table.status)
	]
);
