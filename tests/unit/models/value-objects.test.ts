import { describe, it, expect } from 'vitest';

describe('EmailAddress value object', () => {
	it.skip('rejects empty string', () => {
		// Will test: new EmailAddress('') throws VALIDATION_FAILED
		expect(true).toBe(false);
	});

	it.skip('rejects string without @ symbol', () => {
		expect(true).toBe(false);
	});

	it.skip('accepts valid email', () => {
		expect(true).toBe(false);
	});
});

describe('PlannerWeight value object', () => {
	it.skip('rejects negative value', () => {
		expect(true).toBe(false);
	});

	it.skip('rejects value above 100', () => {
		expect(true).toBe(false);
	});

	it.skip('accepts zero', () => {
		expect(true).toBe(false);
	});

	it.skip('accepts 100', () => {
		expect(true).toBe(false);
	});
});

describe('PositiveMinutes value object', () => {
	it.skip('rejects zero', () => {
		expect(true).toBe(false);
	});

	it.skip('rejects negative', () => {
		expect(true).toBe(false);
	});

	it.skip('accepts positive integer', () => {
		expect(true).toBe(false);
	});
});

describe('NonNegativeMinutes value object', () => {
	it.skip('rejects negative', () => {
		expect(true).toBe(false);
	});

	it.skip('accepts zero', () => {
		expect(true).toBe(false);
	});
});

describe('ImportanceScore value object', () => {
	it.skip('rejects negative', () => {
		expect(true).toBe(false);
	});

	it.skip('rejects above 100', () => {
		expect(true).toBe(false);
	});

	it.skip('accepts boundary values 0 and 100', () => {
		expect(true).toBe(false);
	});
});

describe('TargetPercentage value object', () => {
	it.skip('rejects zero', () => {
		expect(true).toBe(false);
	});

	it.skip('rejects above 100', () => {
		expect(true).toBe(false);
	});

	it.skip('accepts 1 through 100', () => {
		expect(true).toBe(false);
	});
});

describe('UrgentThresholdDays value object', () => {
	it.skip('rejects negative', () => {
		expect(true).toBe(false);
	});

	it.skip('rejects above 30', () => {
		expect(true).toBe(false);
	});
});

describe('MinChunkMinutes value object', () => {
	it.skip('rejects below 5', () => {
		expect(true).toBe(false);
	});

	it.skip('rejects above 120', () => {
		expect(true).toBe(false);
	});
});

describe('AspectName value object', () => {
	it.skip('rejects empty string', () => {
		expect(true).toBe(false);
	});

	it.skip('rejects whitespace only', () => {
		expect(true).toBe(false);
	});
});

describe('TaskTitle value object', () => {
	it.skip('rejects empty string', () => {
		expect(true).toBe(false);
	});
});

describe('MilestoneTitle value object', () => {
	it.skip('rejects empty string', () => {
		expect(true).toBe(false);
	});
});

describe('IanaTimezone value object', () => {
	it.skip('rejects empty string', () => {
		expect(true).toBe(false);
	});

	it.skip('accepts valid IANA timezone', () => {
		expect(true).toBe(false);
	});
});

describe('DisplayName value object', () => {
	it.skip('rejects empty string', () => {
		expect(true).toBe(false);
	});
});

describe('WeekdayMask value object', () => {
	it.skip('rejects zero (no days selected)', () => {
		expect(true).toBe(false);
	});

	it.skip('rejects values above 127', () => {
		expect(true).toBe(false);
	});
});
