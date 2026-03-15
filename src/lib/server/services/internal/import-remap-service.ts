import type {
	IImportRemapService,
	RemappedImportGraph
} from '$lib/server/services/contracts/import-remap-service.js';

export class ImportRemapService implements IImportRemapService {
	async remapImportGraph(payload: unknown, userId: string): Promise<RemappedImportGraph> {
		const data = payload as Record<string, unknown[]>;
		const idMap = new Map<string, string>();
		let remappedCount = 0;

		const remapped: Record<string, unknown[]> = {};
		for (const [key, items] of Object.entries(data)) {
			remapped[key] = (items || []).map((item: unknown) => {
				const record = item as Record<string, unknown>;
				const newItem = { ...record };
				if (newItem.id && typeof newItem.id === 'string') {
					const newId = crypto.randomUUID();
					idMap.set(newItem.id as string, newId);
					newItem.id = newId;
					remappedCount++;
				}
				if ('userId' in newItem) newItem.userId = userId;
				return newItem;
			});
		}

		// Second pass: remap FK references
		for (const items of Object.values(remapped)) {
			for (const item of items as Record<string, unknown>[]) {
				for (const [key, val] of Object.entries(item)) {
					if (typeof val === 'string' && idMap.has(val) && key !== 'id') {
						item[key] = idMap.get(val);
					}
				}
			}
		}

		return { remappedPayload: remapped, remappedCount };
	}
}
