import { pgTable, uuid, varchar, jsonb, timestamp, index } from 'drizzle-orm/pg-core';
import { users } from './users.js';

export const auditEvents = pgTable(
	'audit_events',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		systemJobRunId: uuid('system_job_run_id'),
		actorPrincipalType: varchar('actor_principal_type', { length: 50 }).notNull(),
		actorPrincipalRef: varchar('actor_principal_ref', { length: 255 }),
		eventType: varchar('event_type', { length: 100 }).notNull(),
		entityType: varchar('entity_type', { length: 100 }).notNull(),
		entityId: varchar('entity_id', { length: 255 }),
		redactedBefore: jsonb('redacted_before')
			.$type<Record<string, unknown>>()
			.notNull()
			.default({}),
		redactedAfter: jsonb('redacted_after')
			.$type<Record<string, unknown>>()
			.notNull()
			.default({}),
		occurredAt: timestamp('occurred_at', { withTimezone: true, mode: 'date' })
			.notNull()
			.defaultNow()
	},
	(table) => [
		index('idx_audit_events_user_id').on(table.userId),
		index('idx_audit_events_event_type').on(table.eventType),
		index('idx_audit_events_entity_type_entity_id').on(table.entityType, table.entityId),
		index('idx_audit_events_occurred_at').on(table.occurredAt)
	]
);
