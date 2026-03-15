import { pgTable, uuid, varchar, text, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const idempotencyKeys = pgTable(
	'idempotency_keys',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		commandName: varchar('command_name', { length: 255 }).notNull(),
		keyHash: varchar('key_hash', { length: 255 }).notNull(),
		requestHash: varchar('request_hash', { length: 255 }).notNull(),
		responseRef: text('response_ref').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
		expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'date' }).notNull()
	},
	(table) => [
		uniqueIndex('uq_idempotency_keys_user_command_key').on(
			table.userId,
			table.commandName,
			table.keyHash
		),
		index('idx_idempotency_keys_user_id').on(table.userId),
		index('idx_idempotency_keys_expires_at').on(table.expiresAt)
	]
);
