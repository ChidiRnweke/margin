import type { AuditEvent } from '$lib/server/domain/models/audit-event.js';
import type { Page, PaginationQuery } from './query-models.js';

export interface AuditQuery extends PaginationQuery {
	eventType?: string;
	entityType?: string;
}

export interface IAuditEventRepository {
	append(event: AuditEvent): Promise<AuditEvent>;
	queryForUser(userId: string, query: AuditQuery): Promise<Page<AuditEvent>>;
	deleteByUserId(userId: string): Promise<number>;
}
