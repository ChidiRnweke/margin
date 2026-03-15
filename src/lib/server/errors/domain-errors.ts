import { DomainError, type DomainErrorCode } from './index.js';

export class UnauthorisedError extends DomainError {
	constructor(message = 'Authentication required') {
		super('AUTH_UNAUTHORIZED', message);
	}
}

export class SessionExpiredError extends DomainError {
	constructor(message = 'Session has expired') {
		super('AUTH_SESSION_EXPIRED', message);
	}
}

export class InputError extends DomainError {
	constructor(message: string, details?: Record<string, unknown>) {
		super('VALIDATION_FAILED', message, details);
	}
}

export class StateTransitionError extends DomainError {
	constructor(message: string, details?: Record<string, unknown>) {
		super('STATE_TRANSITION_INVALID', message, details);
	}
}

export class OwnershipError extends DomainError {
	constructor(message = 'Access denied: resource belongs to another user') {
		super('OWNERSHIP_VIOLATION', message);
	}
}

export class NotFoundError extends DomainError {
	constructor(entityType: string, entityId: string) {
		super('NOT_FOUND', `${entityType} not found: ${entityId}`, { entityType, entityId });
	}
}

export class TargetPercentTotalError extends DomainError {
	constructor(actual: number) {
		super('TARGET_PERCENT_TOTAL_INVALID', `Active aspect targets must total 100%, got ${actual}%`, {
			actual
		});
	}
}

export class OptimisticConcurrencyError extends DomainError {
	constructor(entityType: string, entityId: string) {
		super('CONFLICT_STALE_WRITE', `Stale write rejected for ${entityType}: ${entityId}`, {
			entityType,
			entityId
		});
	}
}

export class LockConflictError extends DomainError {
	constructor(taskId: string) {
		super('LOCK_CONFLICT', `Task ${taskId} has an active lock conflict`, { taskId });
	}
}

export class CursorShapeError extends DomainError {
	constructor(message = 'Invalid or expired cursor') {
		super('QUERY_CURSOR_INVALID', message);
	}
}

export class IdempotencyHashMismatchError extends DomainError {
	constructor() {
		super('IDEMPOTENCY_HASH_MISMATCH', 'Idempotency key exists but request hash does not match');
	}
}

export class SnoozeLimitExceededError extends DomainError {
	constructor(limit: number) {
		super('SNOOZE_LIMIT_EXCEEDED', `Snooze limit of ${limit} exceeded`, { limit });
	}
}

export class ImportRemapError extends DomainError {
	constructor(message: string) {
		super('IMPORT_CONFLICT_REMAP_FAILED', message);
	}
}

export class RetryExhaustedError extends DomainError {
	constructor(reminderId: string) {
		super('RETRY_EXHAUSTED', `All retries exhausted for reminder ${reminderId}`, { reminderId });
	}
}
