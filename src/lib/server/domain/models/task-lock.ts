import { InputError } from '$lib/server/errors/domain-errors.js';

export interface TaskLock {
	readonly id: string;
	readonly taskId: string;
	readonly lockedStartUtc: Date;
	readonly lockedEndUtc: Date;
	readonly lockedUtcOffsetMinutes: number;
	readonly lockedDstOffsetMinutes: number;
	readonly active: boolean;
	readonly version: number;
	readonly createdAt: Date;
	readonly releasedAt: Date | null;
}

export function createTaskLock(params: {
	id: string;
	taskId: string;
	lockedStartUtc: Date;
	lockedEndUtc: Date;
	lockedUtcOffsetMinutes: number;
	lockedDstOffsetMinutes: number;
}): TaskLock {
	if (params.lockedStartUtc >= params.lockedEndUtc) {
		throw new InputError('Lock start must be before lock end');
	}
	return {
		...params,
		active: true,
		version: 1,
		createdAt: new Date(),
		releasedAt: null
	};
}

export function releaseTaskLock(lock: TaskLock): TaskLock {
	return { ...lock, active: false, releasedAt: new Date() };
}
