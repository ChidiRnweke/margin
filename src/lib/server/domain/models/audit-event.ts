export interface AuditEvent {
	readonly id: string;
	readonly userId: string;
	readonly systemJobRunId: string | null;
	readonly actorPrincipalType: string;
	readonly actorPrincipalRef: string | null;
	readonly eventType: string;
	readonly entityType: string;
	readonly entityId: string | null;
	readonly redactedBefore: Record<string, unknown>;
	readonly redactedAfter: Record<string, unknown>;
	readonly occurredAt: Date;
}

export function createAuditEvent(params: {
	id: string;
	userId: string;
	actorPrincipalType: string;
	actorPrincipalRef?: string;
	eventType: string;
	entityType: string;
	entityId?: string;
	redactedBefore?: Record<string, unknown>;
	redactedAfter?: Record<string, unknown>;
	systemJobRunId?: string;
}): AuditEvent {
	return {
		id: params.id,
		userId: params.userId,
		systemJobRunId: params.systemJobRunId ?? null,
		actorPrincipalType: params.actorPrincipalType,
		actorPrincipalRef: params.actorPrincipalRef ?? null,
		eventType: params.eventType,
		entityType: params.entityType,
		entityId: params.entityId ?? null,
		redactedBefore: params.redactedBefore ?? {},
		redactedAfter: params.redactedAfter ?? {},
		occurredAt: new Date()
	};
}
