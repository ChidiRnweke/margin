import { CursorShapeError } from '$lib/server/errors/domain-errors.js';

export interface CursorPayload {
	id: string;
	sortValue?: string | number;
	queryHash: string;
}

const CURSOR_VERSION = 1;

export function encodeCursor(payload: CursorPayload): string {
	const data = JSON.stringify({ v: CURSOR_VERSION, ...payload });
	return Buffer.from(data).toString('base64url');
}

export function decodeCursor(cursor: string, expectedQueryHash: string): CursorPayload {
	try {
		const data = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf-8'));

		if (data.v !== CURSOR_VERSION) {
			throw new CursorShapeError('Cursor version mismatch');
		}

		if (!data.id || typeof data.id !== 'string') {
			throw new CursorShapeError('Cursor missing required id field');
		}

		if (data.queryHash !== expectedQueryHash) {
			throw new CursorShapeError('Cursor does not match current query shape');
		}

		return {
			id: data.id,
			sortValue: data.sortValue,
			queryHash: data.queryHash
		};
	} catch (e) {
		if (e instanceof CursorShapeError) throw e;
		throw new CursorShapeError('Invalid cursor format');
	}
}

export function computeQueryHash(queryParams: Record<string, unknown>): string {
	const sorted = Object.keys(queryParams)
		.sort()
		.map((k) => `${k}=${JSON.stringify(queryParams[k])}`)
		.join('&');
	// Simple hash — not cryptographic, just for query shape matching
	let hash = 0;
	for (let i = 0; i < sorted.length; i++) {
		const char = sorted.charCodeAt(i);
		hash = ((hash << 5) - hash + char) | 0;
	}
	return Math.abs(hash).toString(36);
}
