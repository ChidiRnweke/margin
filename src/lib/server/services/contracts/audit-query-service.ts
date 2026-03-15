export interface AuditQuery {
  cursor?: string;
  limit?: number;
}

export interface IAuditQueryService {
  queryAuditTimeline(userId: string, query: AuditQuery): Promise<{ items: unknown[]; nextCursor?: string }>;
}
