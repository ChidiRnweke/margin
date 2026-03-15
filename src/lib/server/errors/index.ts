// Domain error base types

export type DomainErrorCode =
	| 'AUTH_UNAUTHORIZED'
	| 'AUTH_SESSION_EXPIRED'
	| 'VALIDATION_FAILED'
	| 'STATE_TRANSITION_INVALID'
	| 'OWNERSHIP_VIOLATION'
	| 'NOT_FOUND'
	| 'TARGET_PERCENT_TOTAL_INVALID'
	| 'CONFLICT_STALE_WRITE'
	| 'LOCK_CONFLICT'
	| 'QUERY_CURSOR_INVALID'
	| 'IDEMPOTENCY_HASH_MISMATCH'
	| 'SNOOZE_LIMIT_EXCEEDED'
	| 'IMPORT_CONFLICT_REMAP_FAILED'
	| 'RETRY_EXHAUSTED';

export class DomainError extends Error {
	constructor(
		public readonly code: DomainErrorCode,
		message: string,
		public readonly details?: Record<string, unknown>
	) {
		super(message);
		this.name = 'DomainError';
	}
}

export * from './domain-errors.js';
export {
	mapDomainErrorToHttp,
	isKnownDomainError,
	type HttpErrorResponse
} from './http-error-mapper.js';
