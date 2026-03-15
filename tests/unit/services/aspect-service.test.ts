import { describe, it, expect } from 'vitest';

describe('AspectService.createAspect', () => {
	it.skip('creates aspect in Draft status with valid name', () => {
		expect(true).toBe(false);
	});
	it.skip('rejects empty aspect name', () => {
		expect(true).toBe(false);
	});
});

describe('AspectService.activateAspect', () => {
	it.skip('activates draft aspect with purpose and target', () => {
		expect(true).toBe(false);
	});
	it.skip('rejects activation without purpose', () => {
		expect(true).toBe(false);
	});
	it.skip('rejects activation without target percentage', () => {
		expect(true).toBe(false);
	});
	it.skip('rejects activation of non-draft aspect', () => {
		expect(true).toBe(false);
	});
});

describe('AspectService.archiveAspect', () => {
	it.skip('archives aspect and cascades to descendants', () => {
		expect(true).toBe(false);
	});
	it.skip('cancels future allocations for aspect tasks', () => {
		expect(true).toBe(false);
	});
	it.skip('cancels pending reminders for aspect tasks', () => {
		expect(true).toBe(false);
	});
});

describe('AspectService.restoreAspect', () => {
	it.skip('restores archived aspect to Draft status', () => {
		expect(true).toBe(false);
	});
	it.skip('rejects restore of non-archived aspect', () => {
		expect(true).toBe(false);
	});
	it.skip('leaves descendants archived after restore', () => {
		expect(true).toBe(false);
	});
});
