import { pgTable, uuid, varchar, integer, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const planningCycles = pgTable(
	'planning_cycles',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		weekStartIsoMonday: varchar('week_start_iso_monday', { length: 10 }).notNull(),
		weekEndIsoSunday: varchar('week_end_iso_sunday', { length: 10 }).notNull(),
		status: varchar('status', { length: 50 }).notNull().default('Draft'),
		version: integer('version').notNull().default(1),
		currentRevisionId: uuid('current_revision_id'),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		confirmedAt: timestamp('confirmed_at', { withTimezone: true, mode: 'date' })
	},
	(table) => [
		uniqueIndex('uq_planning_cycles_user_week').on(table.userId, table.weekStartIsoMonday),
		index('idx_planning_cycles_user_id').on(table.userId),
		index('idx_planning_cycles_status').on(table.status),
		index('idx_planning_cycles_user_id_status').on(table.userId, table.status)
	]
);
