export interface PaginatedResult<T> {
	items: T[];
	nextCursor?: string;
}

export interface PaginationInput {
	cursor?: string;
	limit?: number;
}

export const DEFAULT_PAGE_SIZE = 25;
export const MAX_PAGE_SIZE = 100;

export function clampPageSize(input?: number): number {
	if (!input || input <= 0) return DEFAULT_PAGE_SIZE;
	return Math.min(input, MAX_PAGE_SIZE);
}
