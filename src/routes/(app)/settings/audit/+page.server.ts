import type { PageServerLoad } from './$types';

interface AuditEvent {
	id: string;
	timestamp: string;
	action: string;
	entity: string;
	entityId: string;
	diff?: { field: string; before: string; after: string }[];
	actor?: string;
}

export const load: PageServerLoad = async () => {
	return {
		events: [] as AuditEvent[]
	};
};
