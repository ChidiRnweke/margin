import { pgTable, uuid, varchar, text, integer, boolean, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { users } from './users.js';

export const aspects = pgTable(
	'aspects',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		name: varchar('name', { length: 255 }).notNull(),
		purpose: text('purpose'),
		status: varchar('status', { length: 50 }).notNull().default('Draft'),
		targetPercentage: integer('target_percentage'),
		defaultSplittable: boolean('default_splittable').notNull().default(false),
		version: integer('version').notNull().default(1),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		archivedAt: timestamp('archived_at', { withTimezone: true, mode: 'date' })
	},
	(table) => [
		uniqueIndex('uq_aspects_user_name_active')
			.on(table.userId, table.name)
			.where(sql`${table.archivedAt} IS NULL`),
		index('idx_aspects_user_id').on(table.userId),
		index('idx_aspects_status').on(table.status),
		index('idx_aspects_user_id_status').on(table.userId, table.status)
	]
);
