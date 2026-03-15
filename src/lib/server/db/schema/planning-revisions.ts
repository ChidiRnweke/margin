import { pgTable, uuid, varchar, text, integer, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { planningCycles } from './planning-cycles.js';

export const planningRevisions = pgTable(
	'planning_revisions',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		planningCycleId: uuid('planning_cycle_id')
			.notNull()
			.references(() => planningCycles.id, { onDelete: 'cascade' }),
		revisionNumber: integer('revision_number').notNull(),
		status: varchar('status', { length: 50 }).notNull().default('Active'),
		changeReason: text('change_reason').notNull(),
		diffSummary: jsonb('diff_summary')
			.$type<Record<string, unknown>>()
			.notNull()
			.default({}),
		supersededAt: timestamp('superseded_at', { withTimezone: true, mode: 'date' }),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => [
		index('idx_planning_revisions_cycle_id').on(table.planningCycleId),
		index('idx_planning_revisions_status').on(table.status)
	]
);
