import { pgTable, uuid, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const planningProfiles = pgTable('planning_profiles', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.unique()
		.references(() => users.id, { onDelete: 'cascade' }),
	urgencyWeight: integer('urgency_weight').notNull().default(25),
	importanceWeight: integer('importance_weight').notNull().default(25),
	balanceWeight: integer('balance_weight').notNull().default(25),
	effortFitWeight: integer('effort_fit_weight').notNull().default(25),
	urgentThresholdDays: integer('urgent_threshold_days').notNull().default(7),
	minChunkMinutes: integer('min_chunk_minutes').notNull().default(15),
	defaultEffortMinutes: integer('default_effort_minutes').notNull().default(30),
	version: integer('version').notNull().default(1),
	updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});
