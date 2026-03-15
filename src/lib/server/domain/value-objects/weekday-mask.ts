import { InputError } from '$lib/server/errors/domain-errors.js';

export class WeekdayMask {
	readonly value: number;

	constructor(value: number) {
		if (!Number.isInteger(value) || value < 1 || value > 127) {
			throw new InputError('Weekday mask must be an integer between 1 and 127 (7-bit bitmask)', {
				value
			});
		}
		this.value = value;
	}

	hasDay(dayIndex: number): boolean {
		return (this.value & (1 << dayIndex)) !== 0;
	}

	getDays(): number[] {
		const days: number[] = [];
		for (let i = 0; i < 7; i++) {
			if (this.hasDay(i)) days.push(i);
		}
		return days;
	}
}

export class MonthDay {
	readonly value: number;

	constructor(value: number) {
		if (!Number.isInteger(value) || value < 1 || value > 31) {
			throw new InputError('Month day must be between 1 and 31', { value });
		}
		this.value = value;
	}
}
