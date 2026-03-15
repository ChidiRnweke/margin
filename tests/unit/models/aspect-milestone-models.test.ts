import { describe, it, expect } from 'vitest';

describe('Aspect model', () => {
	it.skip('requires valid aspect name', () => {
		expect(true).toBe(false);
	});

	it.skip('starts in Draft status', () => {
		expect(true).toBe(false);
	});

	it.skip('target percentage is optional in Draft', () => {
		expect(true).toBe(false);
	});

	it.skip('activation requires purpose and target', () => {
		expect(true).toBe(false);
	});

	it.skip('archive sets archived_at timestamp', () => {
		expect(true).toBe(false);
	});

	it.skip('restore resets to Draft status', () => {
		expect(true).toBe(false);
	});
});

describe('Milestone model', () => {
	it.skip('requires valid title', () => {
		expect(true).toBe(false);
	});

	it.skip('requires aspect_id', () => {
		expect(true).toBe(false);
	});

	it.skip('starts in Open status', () => {
		expect(true).toBe(false);
	});

	it.skip('target_date is optional', () => {
		expect(true).toBe(false);
	});

	it.skip('complete sets completed_at', () => {
		expect(true).toBe(false);
	});

	it.skip('archive sets archived_at', () => {
		expect(true).toBe(false);
	});
});
