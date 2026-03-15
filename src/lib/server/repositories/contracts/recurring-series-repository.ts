import type { RecurringTaskSeries } from '$lib/server/domain/models/recurring-task-series.js';
import type { RecurrenceRule } from '$lib/server/domain/models/recurrence-rule.js';
import type { RecurrenceException } from '$lib/server/domain/models/recurrence-exception.js';

export interface RecurringTaskSeriesAggregate {
	series: RecurringTaskSeries;
	rules: RecurrenceRule[];
	exceptions: RecurrenceException[];
}

export interface IRecurringSeriesRepository {
	findById(seriesId: string): Promise<RecurringTaskSeriesAggregate | null>;
	save(
		aggregate: RecurringTaskSeriesAggregate,
		expectedVersion: number | null
	): Promise<RecurringTaskSeriesAggregate>;
	close(seriesId: string, expectedVersion: number): Promise<RecurringTaskSeriesAggregate>;
	findByTaskInstance(taskId: string): Promise<RecurringTaskSeriesAggregate | null>;
	deleteByUserId(userId: string): Promise<number>;
}
