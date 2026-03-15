import { describe, it, expect } from 'vitest';

describe('User model', () => {
	it.skip('requires valid email', () => {
		expect(true).toBe(false);
	});

	it.skip('requires valid display name', () => {
		expect(true).toBe(false);
	});

	it.skip('requires valid IANA timezone', () => {
		expect(true).toBe(false);
	});

	it.skip('captures UTC offset snapshot at creation', () => {
		expect(true).toBe(false);
	});

	it.skip('identity_verified defaults to false', () => {
		expect(true).toBe(false);
	});

	it.skip('created_at is immutable', () => {
		expect(true).toBe(false);
	});
});

describe('Session model', () => {
	it.skip('requires hashed session token', () => {
		expect(true).toBe(false);
	});

	it.skip('starts with Active status', () => {
		expect(true).toBe(false);
	});

	it.skip('requires future expires_at', () => {
		expect(true).toBe(false);
	});

	it.skip('revoke sets status to Revoked and timestamp', () => {
		expect(true).toBe(false);
	});
});

describe('PlanningProfile model', () => {
	it.skip('requires valid planner weights', () => {
		expect(true).toBe(false);
	});

	it.skip('requires valid urgent threshold days', () => {
		expect(true).toBe(false);
	});

	it.skip('requires valid min chunk minutes', () => {
		expect(true).toBe(false);
	});

	it.skip('requires positive default effort minutes', () => {
		expect(true).toBe(false);
	});

	it.skip('version starts at 1', () => {
		expect(true).toBe(false);
	});
});
