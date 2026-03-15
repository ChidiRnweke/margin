import type { IAuditEventRepository } from '$lib/server/repositories/contracts/audit-event-repository.js';
import type { AuditEvent } from '$lib/server/domain/models/audit-event.js';
import { createAuditEvent } from '$lib/server/domain/models/audit-event.js';
import { computeAuditDiff } from './audit-diff.js';

export interface AuditEmission {
	userId: string;
	actorPrincipalType: string;
	actorPrincipalRef?: string;
	eventType: string;
	entityType: string;
	entityId?: string;
	before?: Record<string, unknown> | null;
	after?: Record<string, unknown> | null;
	redactFields?: string[];
	systemJobRunId?: string;
}

export class AuditEmitter {
	constructor(private repo: IAuditEventRepository) {}

	async emit(emission: AuditEmission): Promise<AuditEvent> {
		const { redactedBefore, redactedAfter } = computeAuditDiff(
			emission.before ?? null,
			emission.after ?? null,
			emission.redactFields ?? []
		);

		const event = createAuditEvent({
			id: crypto.randomUUID(),
			userId: emission.userId,
			actorPrincipalType: emission.actorPrincipalType,
			actorPrincipalRef: emission.actorPrincipalRef,
			eventType: emission.eventType,
			entityType: emission.entityType,
			entityId: emission.entityId,
			redactedBefore,
			redactedAfter,
			systemJobRunId: emission.systemJobRunId
		});

		return this.repo.append(event);
	}
}
