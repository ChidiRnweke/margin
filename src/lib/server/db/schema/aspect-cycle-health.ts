import { pgTable, uuid, integer, real, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { planningCycles } from './planning-cycles.js';
import { aspects } from './aspects.js';

export const aspectCycleHealth = pgTable(
	'aspect_cycle_health',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		planningCycleId: uuid('planning_cycle_id')
			.notNull()
			.references(() => planningCycles.id, { onDelete: 'cascade' }),
		aspectId: uuid('aspect_id')
			.notNull()
			.references(() => aspects.id, { onDelete: 'cascade' }),
		targetMinutes: integer('target_minutes').notNull(),
		completedMinutes: integer('completed_minutes').notNull(),
		healthScore: real('health_score').notNull(),
		computedAt: timestamp('computed_at', { withTimezone: true, mode: 'date' })
			.notNull()
			.defaultNow()
	},
	(table) => [
		uniqueIndex('uq_aspect_cycle_health_cycle_aspect').on(table.planningCycleId, table.aspectId),
		index('idx_aspect_cycle_health_cycle_id').on(table.planningCycleId),
		index('idx_aspect_cycle_health_aspect_id').on(table.aspectId)
	]
);
