import { eq, and, sql, desc } from 'drizzle-orm';
import type { Database } from '$lib/server/db/index.js';
import { auditEvents } from '$lib/server/db/schema/index.js';
import type { AuditEvent } from '$lib/server/domain/models/audit-event.js';
import type { Page } from '$lib/server/repositories/contracts/query-models.js';
import type {
	IAuditEventRepository,
	AuditQuery
} from '$lib/server/repositories/contracts/audit-event-repository.js';

export class PostgresAuditEventRepository implements IAuditEventRepository {
	constructor(private db: Database) {}

	async append(event: AuditEvent): Promise<AuditEvent> {
		const rows = await this.db
			.insert(auditEvents)
			.values({
				id: event.id,
				userId: event.userId,
				systemJobRunId: event.systemJobRunId,
				actorPrincipalType: event.actorPrincipalType,
				actorPrincipalRef: event.actorPrincipalRef,
				eventType: event.eventType,
				entityType: event.entityType,
				entityId: event.entityId,
				redactedBefore: event.redactedBefore,
				redactedAfter: event.redactedAfter,
				occurredAt: event.occurredAt
			})
			.returning();

		return rows[0] as AuditEvent;
	}

	async queryForUser(userId: string, query: AuditQuery): Promise<Page<AuditEvent>> {
		const limit = query.limit ?? 20;
		const offset = query.cursor ? parseInt(query.cursor, 10) : 0;

		const conditions = [eq(auditEvents.userId, userId)];
		if (query.eventType) {
			conditions.push(eq(auditEvents.eventType, query.eventType));
		}
		if (query.entityType) {
			conditions.push(eq(auditEvents.entityType, query.entityType));
		}

		const whereClause = and(...conditions);

		const countResult = await this.db
			.select({ count: sql<number>`count(*)::int` })
			.from(auditEvents)
			.where(whereClause);

		const totalCount = countResult[0]?.count ?? 0;

		const rows = await this.db
			.select()
			.from(auditEvents)
			.where(whereClause)
			.orderBy(desc(auditEvents.occurredAt))
			.limit(limit)
			.offset(offset);

		const nextOffset = offset + rows.length;
		const hasMore = nextOffset < totalCount;

		return {
			items: rows as AuditEvent[],
			totalCount,
			cursor: hasMore ? String(nextOffset) : null,
			hasMore
		};
	}

	async deleteByUserId(userId: string): Promise<number> {
		const deleted = await this.db
			.delete(auditEvents)
			.where(eq(auditEvents.userId, userId))
			.returning();

		return deleted.length;
	}
}
