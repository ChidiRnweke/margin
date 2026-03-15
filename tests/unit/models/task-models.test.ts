import { describe, it, expect } from 'vitest';

describe('Task model', () => {
	it.skip('requires valid title', () => {
		expect(true).toBe(false);
	});
	it.skip('requires aspect_id', () => {
		expect(true).toBe(false);
	});
	it.skip('effort_minutes must be positive', () => {
		expect(true).toBe(false);
	});
	it.skip('remaining_minutes must be non-negative', () => {
		expect(true).toBe(false);
	});
	it.skip('importance_score must be 0..100', () => {
		expect(true).toBe(false);
	});
	it.skip('starts in Backlog status', () => {
		expect(true).toBe(false);
	});
	it.skip('milestone must belong to same aspect', () => {
		expect(true).toBe(false);
	});
	it.skip('complete sets completed_at', () => {
		expect(true).toBe(false);
	});
	it.skip('archive sets archived_at', () => {
		expect(true).toBe(false);
	});
});

describe('TaskLock model', () => {
	it.skip('requires task_id', () => {
		expect(true).toBe(false);
	});
	it.skip('requires locked_start_utc before locked_end_utc', () => {
		expect(true).toBe(false);
	});
	it.skip('captures timezone offset snapshot', () => {
		expect(true).toBe(false);
	});
	it.skip('active defaults to true on creation', () => {
		expect(true).toBe(false);
	});
	it.skip('release sets active to false and released_at', () => {
		expect(true).toBe(false);
	});
});
