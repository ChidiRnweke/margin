import type {
	IAuditQueryService,
	AuditQuery
} from '$lib/server/services/contracts/audit-query-service.js';
import type { IAuditEventRepository } from '$lib/server/repositories/contracts/audit-event-repository.js';

export class AuditQueryService implements IAuditQueryService {
	constructor(private auditEventRepo: IAuditEventRepository) {}

	async queryAuditTimeline(userId: string, query: AuditQuery) {
		const page = await this.auditEventRepo.queryForUser(userId, {
			cursor: query.cursor,
			limit: query.limit ?? 25
		});
		return {
			items: page.items,
			nextCursor: page.cursor ?? undefined
		};
	}
}
