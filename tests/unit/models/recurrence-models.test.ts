import { describe, it, expect } from 'vitest';

describe('RecurringTaskSeries model', () => {
	it.skip('requires valid title template', () => {
		expect(true).toBe(false);
	});
	it.skip('requires aspect_id', () => {
		expect(true).toBe(false);
	});
	it.skip('starts in Active status', () => {
		expect(true).toBe(false);
	});
	it.skip('closed status is terminal', () => {
		expect(true).toBe(false);
	});
});

describe('RecurrenceRule model', () => {
	it.skip('requires valid frequency', () => {
		expect(true).toBe(false);
	});
	it.skip('requires positive interval', () => {
		expect(true).toBe(false);
	});
	it.skip('weekly requires weekday_mask', () => {
		expect(true).toBe(false);
	});
	it.skip('monthly requires month_day', () => {
		expect(true).toBe(false);
	});
	it.skip('requires anchor_date_local', () => {
		expect(true).toBe(false);
	});
});

describe('RecurrenceException model', () => {
	it.skip('requires occurrence_date_local', () => {
		expect(true).toBe(false);
	});
	it.skip('Move action requires override date', () => {
		expect(true).toBe(false);
	});
	it.skip('Skip action does not require override date', () => {
		expect(true).toBe(false);
	});
});
