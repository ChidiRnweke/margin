export function buildAspect(overrides: Partial<any> = {}) {
	return {
		id: 'aspect-1',
		userId: 'user-1',
		name: 'Health',
		purpose: 'Stay healthy',
		status: 'Draft',
		targetPercentage: null,
		defaultSplittable: false,
		version: 1,
		createdAt: new Date('2026-01-01T00:00:00Z'),
		archivedAt: null,
		...overrides
	};
}

export function buildMilestone(overrides: Partial<any> = {}) {
	return {
		id: 'milestone-1',
		aspectId: 'aspect-1',
		title: 'Finish milestone',
		description: null,
		targetDate: null,
		status: 'Open',
		version: 1,
		completedAt: null,
		archivedAt: null,
		createdAt: new Date('2026-01-01T00:00:00Z'),
		...overrides
	};
}

export function buildTask(overrides: Partial<any> = {}) {
	return {
		id: 'task-1',
		aspectId: 'aspect-1',
		milestoneId: null,
		recurringTaskSeriesId: null,
		title: 'Finish task',
		description: null,
		effortMinutes: 45,
		remainingMinutes: 45,
		dueDate: null,
		importanceScore: 50,
		splittableOverride: null,
		status: 'Backlog',
		overdue: false,
		version: 1,
		completedAt: null,
		archivedAt: null,
		createdAt: new Date('2026-01-01T00:00:00Z'),
		updatedAt: new Date('2026-01-01T00:00:00Z'),
		...overrides
	};
}

export function buildPlanningProfile(overrides: Partial<any> = {}) {
	return {
		id: 'profile-1',
		userId: 'user-1',
		urgencyWeight: 25,
		importanceWeight: 25,
		balanceWeight: 25,
		effortFitWeight: 25,
		urgentThresholdDays: 7,
		minChunkMinutes: 15,
		defaultEffortMinutes: 30,
		version: 1,
		updatedAt: new Date('2026-01-01T00:00:00Z'),
		...overrides
	};
}

export function buildRecurringSeriesAggregate(overrides: Partial<any> = {}) {
	const series = {
		id: 'series-1',
		userId: 'user-1',
		aspectId: 'aspect-1',
		milestoneId: null,
		titleTemplate: 'Recurring task',
		descriptionTemplate: null,
		effortMinutesTemplate: 30,
		importanceScoreTemplate: 50,
		splittableOverride: null,
		status: 'Active',
		nextOccurrenceDateLocal: '2026-01-10',
		version: 1,
		createdAt: new Date('2026-01-01T00:00:00Z'),
		closedAt: null,
		...(overrides.series ?? {})
	};

	return {
		series,
		rules: [
			{
				id: 'rule-1',
				recurringTaskSeriesId: series.id,
				frequency: 'Daily',
				interval: 1,
				weekdayMask: null,
				monthDay: null,
				anchorDateLocal: '2026-01-10',
				endsOn: null,
				paused: false,
				...(overrides.rules?.[0] ?? {})
			}
		],
		exceptions: overrides.exceptions ?? []
	};
}

export function buildReminderAggregate(overrides: Partial<any> = {}) {
	const reminder = {
		id: 'reminder-1',
		taskId: 'task-1',
		remindAtUtc: new Date('2026-01-10T09:00:00Z'),
		remindUtcOffsetMinutes: 0,
		remindDstOffsetMinutes: 0,
		channel: 'in_app',
		status: 'Pending',
		snoozeCount: 0,
		lastAttemptAt: null,
		nextRetryAt: null,
		terminalFailedAt: null,
		version: 1,
		createdAt: new Date('2026-01-01T00:00:00Z'),
		...(overrides.reminder ?? {})
	};

	return {
		reminder,
		attempts: overrides.attempts ?? []
	};
}
