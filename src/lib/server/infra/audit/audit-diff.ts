export function computeAuditDiff(
	before: Record<string, unknown> | null,
	after: Record<string, unknown> | null,
	redactFields: string[] = []
): { redactedBefore: Record<string, unknown>; redactedAfter: Record<string, unknown> } {
	const redact = (obj: Record<string, unknown> | null): Record<string, unknown> => {
		if (!obj) return {};
		const result: Record<string, unknown> = {};
		for (const [key, value] of Object.entries(obj)) {
			result[key] = redactFields.includes(key) ? '[REDACTED]' : value;
		}
		return result;
	};
	return {
		redactedBefore: redact(before),
		redactedAfter: redact(after)
	};
}
