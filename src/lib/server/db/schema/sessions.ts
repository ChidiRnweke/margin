import { pgTable, uuid, varchar, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const sessions = pgTable(
	'sessions',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		sessionTokenHash: varchar('session_token_hash', { length: 255 }).notNull().unique(),
		status: varchar('status', { length: 50 }).notNull().default('Active'),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull(),
		revokedAt: timestamp('revoked_at', { withTimezone: true, mode: 'date' })
	},
	(table) => [
		index('idx_sessions_user_id').on(table.userId),
		index('idx_sessions_status').on(table.status)
	]
);
