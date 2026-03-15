import { pgTable, uuid, varchar, timestamp } from 'drizzle-orm/pg-core';
import { taskAllocations } from './task-allocations.js';

export const allocationOutcomes = pgTable('allocation_outcomes', {
	id: uuid('id').primaryKey().defaultRandom(),
	taskAllocationId: uuid('task_allocation_id')
		.notNull()
		.unique()
		.references(() => taskAllocations.id, { onDelete: 'cascade' }),
	outcome: varchar('outcome', { length: 50 }).notNull(),
	markedAt: timestamp('marked_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
});
