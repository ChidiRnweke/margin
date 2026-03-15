import type { IRecurringSeriesRepository } from '$lib/server/repositories/contracts/recurring-series-repository.js';
import type { ITaskRepository } from '$lib/server/repositories/contracts/task-repository.js';
import type {
	IRecurrenceMaterializer,
	GenerationResult
} from '$lib/server/services/contracts/recurrence-materializer.js';
import { createTask } from '$lib/server/domain/models/task.js';
import { RecurringSeriesStatus, RecurrenceFrequency } from '$lib/server/domain/enums.js';
import type { RecurrenceRule } from '$lib/server/domain/models/recurrence-rule.js';

export class RecurrenceMaterializer implements IRecurrenceMaterializer {
	constructor(
		private recurringSeriesRepo: IRecurringSeriesRepository,
		private taskRepo: ITaskRepository
	) {}

	async generateNextInstance(completedTaskId: string): Promise<GenerationResult> {
		const aggregate = await this.recurringSeriesRepo.findByTaskInstance(completedTaskId);
		if (!aggregate) {
			return { generated: false, reason: 'No recurring series found for task' };
		}

		const { series } = aggregate;
		if (series.status === RecurringSeriesStatus.Closed) {
			return { generated: false, reason: 'Series is closed' };
		}
		if (series.status === RecurringSeriesStatus.Paused) {
			return { generated: false, reason: 'Series is paused' };
		}

		const activeRule = aggregate.rules.find((r) => !r.paused);
		if (!activeRule) {
			return { generated: false, reason: 'No active recurrence rule' };
		}

		const nextDate = computeNextOccurrence(activeRule, series.nextOccurrenceDateLocal);
		if (!nextDate) {
			return { generated: false, reason: 'No next occurrence date could be computed' };
		}

		// Check if past end date
		if (activeRule.endsOn && nextDate > activeRule.endsOn) {
			return { generated: false, reason: 'Series has reached its end date' };
		}

		const task = createTask({
			id: crypto.randomUUID(),
			aspectId: series.aspectId,
			title: series.titleTemplate,
			description: series.descriptionTemplate ?? undefined,
			effortMinutes: series.effortMinutesTemplate,
			importanceScore: series.importanceScoreTemplate,
			milestoneId: series.milestoneId ?? undefined,
			splittableOverride: series.splittableOverride ?? undefined,
			recurringTaskSeriesId: series.id,
			dueDate: nextDate
		});

		await this.taskRepo.save(task, null);

		const updatedSeries = { ...series, nextOccurrenceDateLocal: nextDate };
		await this.recurringSeriesRepo.save(
			{ ...aggregate, series: updatedSeries },
			series.version
		);

		return { generated: true, taskId: task.id };
	}
}

function computeNextOccurrence(
	rule: RecurrenceRule,
	currentDate: string | null
): string | null {
	const anchor = currentDate ?? rule.anchorDateLocal;
	if (!anchor) return null;

	const date = new Date(anchor + 'T00:00:00');
	if (isNaN(date.getTime())) return null;

	switch (rule.frequency) {
		case RecurrenceFrequency.Daily:
			date.setDate(date.getDate() + rule.interval);
			break;
		case RecurrenceFrequency.Weekly:
			date.setDate(date.getDate() + 7 * rule.interval);
			break;
		case RecurrenceFrequency.Monthly:
			date.setMonth(date.getMonth() + rule.interval);
			if (rule.monthDay) {
				date.setDate(Math.min(rule.monthDay, daysInMonth(date)));
			}
			break;
		default:
			return null;
	}

	return toLocalDateString(date);
}

function daysInMonth(date: Date): number {
	return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function toLocalDateString(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, '0');
	const d = String(date.getDate()).padStart(2, '0');
	return `${y}-${m}-${d}`;
}
