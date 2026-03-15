import { describe, it, expect } from 'vitest';

describe('AuthService.resolveIdentityCallback', () => {
	it.skip('creates new user and session for unknown identity', () => {
		expect(true).toBe(false);
	});
	it.skip('creates default planning profile for new user', () => {
		expect(true).toBe(false);
	});
	it.skip('returns existing user session for known identity', () => {
		expect(true).toBe(false);
	});
	it.skip('sets needsOnboarding true when no active aspects', () => {
		expect(true).toBe(false);
	});
});

describe('AuthService.logout', () => {
	it.skip('revokes the specified session', () => {
		expect(true).toBe(false);
	});
	it.skip('throws NOT_FOUND for unknown session', () => {
		expect(true).toBe(false);
	});
});

describe('AuthService.expireSessions', () => {
	it.skip('expires sessions past lifetime', () => {
		expect(true).toBe(false);
	});
	it.skip('returns count of expired sessions', () => {
		expect(true).toBe(false);
	});
});

describe('AuthService.deleteAccount', () => {
	it.skip('delegates to account erasure service', () => {
		expect(true).toBe(false);
	});
	it.skip('revokes all sessions after erasure', () => {
		expect(true).toBe(false);
	});
});
