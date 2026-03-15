export function computeRequestHash(input: Record<string, unknown>): string {
	const normalized = sortDeep(input);
	const json = JSON.stringify(normalized);
	// Simple non-cryptographic hash for request deduplication
	let hash = 0n;
	for (let i = 0; i < json.length; i++) {
		const char = BigInt(json.charCodeAt(i));
		hash = ((hash << 5n) - hash + char) & 0xffffffffffffffffn;
	}
	return hash.toString(36);
}

function sortDeep(obj: unknown): unknown {
	if (obj === null || obj === undefined) return obj;
	if (Array.isArray(obj)) return obj.map(sortDeep);
	if (typeof obj === 'object') {
		const sorted: Record<string, unknown> = {};
		for (const key of Object.keys(obj as Record<string, unknown>).sort()) {
			sorted[key] = sortDeep((obj as Record<string, unknown>)[key]);
		}
		return sorted;
	}
	return obj;
}
