export interface IClock {
	now(): Date;
}

export class SystemClock implements IClock {
	now(): Date {
		return new Date();
	}
}

export class TestClock implements IClock {
	private _now: Date;

	constructor(initial: Date = new Date()) {
		this._now = initial;
	}

	now(): Date {
		return new Date(this._now.getTime());
	}

	advance(ms: number): void {
		this._now = new Date(this._now.getTime() + ms);
	}

	set(date: Date): void {
		this._now = new Date(date.getTime());
	}
}
