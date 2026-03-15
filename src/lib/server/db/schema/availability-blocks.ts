import { pgTable, uuid, varchar, integer, boolean, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const availabilityBlocks = pgTable(
	'availability_blocks',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		kind: varchar('kind', { length: 50 }).notNull(),
		oneOffStartsAtUtc: timestamp('one_off_starts_at_utc', { withTimezone: true, mode: 'date' }),
		oneOffEndsAtUtc: timestamp('one_off_ends_at_utc', { withTimezone: true, mode: 'date' }),
		localStartMinute: integer('local_start_minute'),
		localEndMinute: integer('local_end_minute'),
		weekdayMask: integer('weekday_mask'),
		startsOnLocal: varchar('starts_on_local', { length: 10 }),
		endsOnLocal: varchar('ends_on_local', { length: 10 }),
		active: boolean('active').notNull().default(true),
		version: integer('version').notNull().default(1),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'date' })
	},
	(table) => [
		index('idx_availability_blocks_user_id').on(table.userId),
		index('idx_availability_blocks_user_id_active').on(table.userId, table.active)
	]
);
