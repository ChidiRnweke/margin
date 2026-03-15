import { pgTable, uuid, varchar, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const importJobs = pgTable(
	'import_jobs',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		status: varchar('status', { length: 50 }).notNull().default('Running'),
		createdEntities: integer('created_entities').notNull().default(0),
		conflictedEntitiesRemapped: integer('conflicted_entities_remapped').notNull().default(0),
		startedAt: timestamp('started_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		finishedAt: timestamp('finished_at', { withTimezone: true, mode: 'date' })
	},
	(table) => [
		index('idx_import_jobs_user_id').on(table.userId),
		index('idx_import_jobs_status').on(table.status)
	]
);
