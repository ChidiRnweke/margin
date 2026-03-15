import { pgTable, uuid, varchar, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { planningRevisions } from './planning-revisions.js';
import { tasks } from './tasks.js';

export const taskAllocations = pgTable(
	'task_allocations',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		planningRevisionId: uuid('planning_revision_id')
			.notNull()
			.references(() => planningRevisions.id, { onDelete: 'cascade' }),
		taskId: uuid('task_id')
			.notNull()
			.references(() => tasks.id, { onDelete: 'cascade' }),
		scheduledStartUtc: timestamp('scheduled_start_utc', {
			withTimezone: true,
			mode: 'date'
		}).notNull(),
		scheduledEndUtc: timestamp('scheduled_end_utc', {
			withTimezone: true,
			mode: 'date'
		}).notNull(),
		scheduledUtcOffsetMinutes: integer('scheduled_utc_offset_minutes').notNull(),
		scheduledDstOffsetMinutes: integer('scheduled_dst_offset_minutes').notNull(),
		allocatedMinutes: integer('allocated_minutes').notNull(),
		status: varchar('status', { length: 50 }).notNull().default('Proposed'),
		version: integer('version').notNull().default(1),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		cancelledAt: timestamp('cancelled_at', { withTimezone: true, mode: 'date' })
	},
	(table) => [
		index('idx_task_allocations_revision_id').on(table.planningRevisionId),
		index('idx_task_allocations_task_id').on(table.taskId),
		index('idx_task_allocations_status').on(table.status)
	]
);
