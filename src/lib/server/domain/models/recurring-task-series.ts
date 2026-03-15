import { RecurringSeriesStatus } from '../enums.js';
import { TaskTitleTemplate } from '../value-objects/string-values.js';
import { PositiveMinutes, ImportanceScore } from '../value-objects/bounded-int.js';
import { StateTransitionError, InputError } from '$lib/server/errors/domain-errors.js';

export interface RecurringTaskSeries {
	readonly id: string;
	readonly userId: string;
	readonly aspectId: string;
	readonly milestoneId: string | null;
	readonly titleTemplate: string;
	readonly descriptionTemplate: string | null;
	readonly effortMinutesTemplate: number;
	readonly importanceScoreTemplate: number;
	readonly splittableOverride: boolean | null;
	readonly status: string;
	readonly nextOccurrenceDateLocal: string | null;
	readonly version: number;
	readonly createdAt: Date;
	readonly closedAt: Date | null;
}

export function createRecurringTaskSeries(params: {
	id: string;
	userId: string;
	aspectId: string;
	milestoneId?: string;
	titleTemplate: string;
	descriptionTemplate?: string;
	effortMinutesTemplate: number;
	importanceScoreTemplate: number;
	splittableOverride?: boolean;
}): RecurringTaskSeries {
	new TaskTitleTemplate(params.titleTemplate);
	new PositiveMinutes(params.effortMinutesTemplate);
	new ImportanceScore(params.importanceScoreTemplate);
	if (!params.aspectId) throw new InputError('Recurring series requires an aspect');

	return {
		id: params.id,
		userId: params.userId,
		aspectId: params.aspectId,
		milestoneId: params.milestoneId || null,
		titleTemplate: params.titleTemplate.trim(),
		descriptionTemplate: params.descriptionTemplate?.trim() || null,
		effortMinutesTemplate: params.effortMinutesTemplate,
		importanceScoreTemplate: params.importanceScoreTemplate,
		splittableOverride: params.splittableOverride ?? null,
		status: RecurringSeriesStatus.Active,
		nextOccurrenceDateLocal: null,
		version: 1,
		createdAt: new Date(),
		closedAt: null
	};
}

export function pauseSeries(series: RecurringTaskSeries): RecurringTaskSeries {
	if (series.status !== RecurringSeriesStatus.Active)
		throw new StateTransitionError('Can only pause active series');
	return { ...series, status: RecurringSeriesStatus.Paused };
}

export function resumeSeries(series: RecurringTaskSeries): RecurringTaskSeries {
	if (series.status !== RecurringSeriesStatus.Paused)
		throw new StateTransitionError('Can only resume paused series');
	return { ...series, status: RecurringSeriesStatus.Active };
}

export function closeSeries(series: RecurringTaskSeries): RecurringTaskSeries {
	if (series.status === RecurringSeriesStatus.Closed)
		throw new StateTransitionError('Series is already closed');
	return { ...series, status: RecurringSeriesStatus.Closed, closedAt: new Date() };
}
