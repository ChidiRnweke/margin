import { describe, it, expect } from 'vitest';

describe('PlanningService.generateDraftPlan', () => {
	it.skip('requires active aspect targets total 100%', () => {
		expect(true).toBe(false);
	});
	it.skip('creates cycle with first revision', () => {
		expect(true).toBe(false);
	});
	it.skip('uses scheduler engine for allocation placement', () => {
		expect(true).toBe(false);
	});
});

describe('PlanningService.confirmDraftPlan', () => {
	it.skip('transitions draft cycle to confirmed', () => {
		expect(true).toBe(false);
	});
	it.skip('rejects confirmation of non-draft cycle', () => {
		expect(true).toBe(false);
	});
});

describe('PlanningService.regenerateConfirmedPlan', () => {
	it.skip('supersedes current revision and creates new one', () => {
		expect(true).toBe(false);
	});
});

describe('PlanningService.editPlan', () => {
	it.skip('creates new revision from edits', () => {
		expect(true).toBe(false);
	});
	it.skip('rejects edit with lock conflict', () => {
		expect(true).toBe(false);
	});
});

describe('PlanningService.replanActiveCycles', () => {
	it.skip('no-ops when no changes detected', () => {
		expect(true).toBe(false);
	});
	it.skip('creates new revision when changes exist', () => {
		expect(true).toBe(false);
	});
});
