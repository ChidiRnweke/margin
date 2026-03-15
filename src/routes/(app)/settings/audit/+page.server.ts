import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db/index.js';
import { AppFactory } from '$lib/server/factory/index.js';

interface AuditEvent {
	id: string;
	timestamp: string;
	action: string;
	entity: string;
	entityId: string;
	diff?: { field: string; before: string; after: string }[];
	actor?: string;
}

export const load: PageServerLoad = async ({ locals }) => {
	const userId = locals.principal?.userId;
	if (!userId) {
		return {
			events: [] as AuditEvent[]
		};
	}

	const factory = AppFactory.create(db);
	const page = await factory.auditController.queryAuditTimeline(userId, { limit: 25 });
	const events = ((page.items ?? []) as Array<Record<string, unknown>>).map((item) => ({
		id: String(item.id ?? crypto.randomUUID()),
		timestamp: String(item.createdAt ?? item.timestamp ?? new Date().toISOString()),
		action: String(item.eventType ?? 'updated'),
		entity: String(item.entityType ?? 'Entity'),
		entityId: String(item.entityId ?? ''),
		diff: undefined,
		actor: String(item.actorPrincipalType ?? 'UserSession')
	}));

	return {
		events
	};
};
