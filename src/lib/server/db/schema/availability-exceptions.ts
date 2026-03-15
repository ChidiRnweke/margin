import { pgTable, uuid, varchar, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { availabilityBlocks } from './availability-blocks.js';

export const availabilityExceptions = pgTable(
	'availability_exceptions',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		availabilityBlockId: uuid('availability_block_id')
			.notNull()
			.references(() => availabilityBlocks.id, { onDelete: 'cascade' }),
		exceptionDate: varchar('exception_date', { length: 10 }).notNull(),
		action: varchar('action', { length: 50 }).notNull(),
		overrideStartsAtUtc: timestamp('override_starts_at_utc', {
			withTimezone: true,
			mode: 'date'
		}),
		overrideEndsAtUtc: timestamp('override_ends_at_utc', { withTimezone: true, mode: 'date' }),
		overrideLocalStartMinute: integer('override_local_start_minute'),
		overrideLocalEndMinute: integer('override_local_end_minute'),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow()
	},
	(table) => [index('idx_availability_exceptions_block_id').on(table.availabilityBlockId)]
);
