import type {
	IAuditQueryService,
	AuditQuery
} from '$lib/server/services/contracts/audit-query-service.js';

export class AuditController {
	constructor(private auditQueryService: IAuditQueryService) {}

	async queryAuditTimeline(userId: string, query: AuditQuery) {
		return this.auditQueryService.queryAuditTimeline(userId, query);
	}
}
