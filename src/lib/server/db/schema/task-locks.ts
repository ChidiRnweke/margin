import { pgTable, uuid, timestamp, integer, boolean, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { tasks } from './tasks.js';

export const taskLocks = pgTable(
	'task_locks',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		taskId: uuid('task_id')
			.notNull()
			.references(() => tasks.id, { onDelete: 'cascade' }),
		lockedStartUtc: timestamp('locked_start_utc', { withTimezone: true, mode: 'date' }).notNull(),
		lockedEndUtc: timestamp('locked_end_utc', { withTimezone: true, mode: 'date' }).notNull(),
		lockedUtcOffsetMinutes: integer('locked_utc_offset_minutes').notNull(),
		lockedDstOffsetMinutes: integer('locked_dst_offset_minutes').notNull(),
		active: boolean('active').notNull().default(true),
		version: integer('version').notNull().default(1),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		releasedAt: timestamp('released_at', { withTimezone: true, mode: 'date' })
	},
	(table) => [
		uniqueIndex('uq_task_locks_active_task')
			.on(table.taskId)
			.where(sql`${table.active} = true`),
		index('idx_task_locks_task_id').on(table.taskId)
	]
);
