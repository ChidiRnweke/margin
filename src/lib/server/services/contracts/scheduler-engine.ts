export interface SchedulerResult {
	allocations: unknown[];
	deferredOutcomes: unknown[];
	unplaced: unknown[];
}

export interface ISchedulerEngine {
	buildWeeklySchedule(
		tasks: unknown[],
		availability: unknown[],
		profile: unknown,
		locks: unknown[],
		horizon: { weekStart: string; weekEnd: string }
	): SchedulerResult;
}
