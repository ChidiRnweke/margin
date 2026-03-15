import { pgTable, uuid, varchar, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';

export const systemJobRuns = pgTable(
	'system_job_runs',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		jobName: varchar('job_name', { length: 255 }).notNull(),
		jobRunKeyHash: varchar('job_run_key_hash', { length: 255 }).notNull(),
		requestHash: varchar('request_hash', { length: 255 }),
		status: varchar('status', { length: 50 }).notNull().default('Running'),
		startedAt: timestamp('started_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		finishedAt: timestamp('finished_at', { withTimezone: true, mode: 'date' })
	},
	(table) => [
		uniqueIndex('uq_system_job_runs_name_key').on(table.jobName, table.jobRunKeyHash),
		index('idx_system_job_runs_status').on(table.status)
	]
);
