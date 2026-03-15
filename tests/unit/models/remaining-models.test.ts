import { describe, it, expect } from 'vitest';

describe('AvailabilityBlock model', () => {
	it.skip('one-off requires UTC start and end', () => {
		expect(true).toBe(false);
	});
	it.skip('recurring requires local time and weekday mask', () => {
		expect(true).toBe(false);
	});
	it.skip('active defaults to true', () => {
		expect(true).toBe(false);
	});
});

describe('AvailabilityException model', () => {
	it.skip('requires exception_date', () => {
		expect(true).toBe(false);
	});
	it.skip('Override requires override times', () => {
		expect(true).toBe(false);
	});
});

describe('PlanningCycle model', () => {
	it.skip('requires week_start_iso_monday', () => {
		expect(true).toBe(false);
	});
	it.skip('starts in Draft status', () => {
		expect(true).toBe(false);
	});
});

describe('PlanningRevision model', () => {
	it.skip('requires contiguous revision_number', () => {
		expect(true).toBe(false);
	});
	it.skip('starts as Active', () => {
		expect(true).toBe(false);
	});
});

describe('TaskAllocation model', () => {
	it.skip('requires positive allocated_minutes', () => {
		expect(true).toBe(false);
	});
	it.skip('starts as Proposed', () => {
		expect(true).toBe(false);
	});
	it.skip('captures timezone snapshot', () => {
		expect(true).toBe(false);
	});
});

describe('AllocationOutcome model', () => {
	it.skip('outcome is Attended or Missed', () => {
		expect(true).toBe(false);
	});
	it.skip('marked_at is immutable', () => {
		expect(true).toBe(false);
	});
});

describe('AspectCycleHealth model', () => {
	it.skip('requires non-negative target and completed minutes', () => {
		expect(true).toBe(false);
	});
	it.skip('computed_at is immutable', () => {
		expect(true).toBe(false);
	});
});

describe('Reminder model', () => {
	it.skip('requires task reference', () => {
		expect(true).toBe(false);
	});
	it.skip('channel is in_app or email', () => {
		expect(true).toBe(false);
	});
	it.skip('starts as Pending', () => {
		expect(true).toBe(false);
	});
	it.skip('snooze_count starts at 0', () => {
		expect(true).toBe(false);
	});
});

describe('ReminderAttempt model', () => {
	it.skip('requires reminder_id', () => {
		expect(true).toBe(false);
	});
	it.skip('result is Sent or Failed', () => {
		expect(true).toBe(false);
	});
	it.skip('attempted_at is immutable', () => {
		expect(true).toBe(false);
	});
});

describe('ImportJob model', () => {
	it.skip('starts as Running', () => {
		expect(true).toBe(false);
	});
	it.skip('terminal states are Succeeded and Failed', () => {
		expect(true).toBe(false);
	});
});

describe('AuditEvent model', () => {
	it.skip('requires user_id', () => {
		expect(true).toBe(false);
	});
	it.skip('occurred_at is immutable', () => {
		expect(true).toBe(false);
	});
	it.skip('payloads are redacted', () => {
		expect(true).toBe(false);
	});
});

describe('IdempotencyKey model', () => {
	it.skip('requires command_name', () => {
		expect(true).toBe(false);
	});
	it.skip('requires key_hash', () => {
		expect(true).toBe(false);
	});
	it.skip('expires_at must be future', () => {
		expect(true).toBe(false);
	});
});

describe('SystemJobRun model', () => {
	it.skip('requires job_name', () => {
		expect(true).toBe(false);
	});
	it.skip('requires job_run_key_hash', () => {
		expect(true).toBe(false);
	});
	it.skip('starts as Running', () => {
		expect(true).toBe(false);
	});
});
