import { DomainError, type DomainErrorCode } from './index.js';

const STATUS_MAP: Record<DomainErrorCode, number> = {
	AUTH_UNAUTHORIZED: 401,
	AUTH_SESSION_EXPIRED: 401,
	VALIDATION_FAILED: 400,
	STATE_TRANSITION_INVALID: 409,
	OWNERSHIP_VIOLATION: 403,
	NOT_FOUND: 404,
	TARGET_PERCENT_TOTAL_INVALID: 422,
	CONFLICT_STALE_WRITE: 409,
	LOCK_CONFLICT: 409,
	QUERY_CURSOR_INVALID: 400,
	IDEMPOTENCY_HASH_MISMATCH: 409,
	SNOOZE_LIMIT_EXCEEDED: 422,
	IMPORT_CONFLICT_REMAP_FAILED: 422,
	RETRY_EXHAUSTED: 500
};

export interface HttpErrorResponse {
	status: number;
	body: {
		error: {
			code: DomainErrorCode;
			message: string;
			details?: Record<string, unknown>;
		};
	};
}

export function mapDomainErrorToHttp(error: DomainError): HttpErrorResponse {
	return {
		status: STATUS_MAP[error.code] ?? 500,
		body: {
			error: {
				code: error.code,
				message: error.message,
				details: error.details
			}
		}
	};
}

export function isKnownDomainError(error: unknown): error is DomainError {
	return error instanceof DomainError;
}
