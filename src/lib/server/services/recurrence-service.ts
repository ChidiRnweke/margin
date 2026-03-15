import type { IRecurringSeriesRepository } from '$lib/server/repositories/contracts/recurring-series-repository.js';
import type { ITaskRepository } from '$lib/server/repositories/contracts/task-repository.js';
import type { IAspectRepository } from '$lib/server/repositories/contracts/aspect-repository.js';
import type {
	IRecurrenceService,
	UpsertSeriesInput,
	SkipOrMoveInput
} from '$lib/server/services/contracts/recurrence-service.js';
import type { AuditEmitter } from '$lib/server/infra/audit/audit-emitter.js';
import type { RecurringTaskSeriesAggregate } from '$lib/server/repositories/contracts/recurring-series-repository.js';
import {
	createRecurringTaskSeries,
	pauseSeries,
	resumeSeries,
	closeSeries
} from '$lib/server/domain/models/recurring-task-series.js';
import { createRecurrenceRule } from '$lib/server/domain/models/recurrence-rule.js';
import { createRecurrenceException } from '$lib/server/domain/models/recurrence-exception.js';
import { createTask } from '$lib/server/domain/models/task.js';
import { NotFoundError, OwnershipError } from '$lib/server/errors/domain-errors.js';
import { PrincipalType } from '$lib/server/domain/enums.js';
import type { RecurrenceFrequency, RecurrenceExceptionAction } from '$lib/server/domain/enums.js';

export class RecurrenceService implements IRecurrenceService {
	constructor(
		private recurringSeriesRepo: IRecurringSeriesRepository,
		private taskRepo: ITaskRepository,
		private aspectRepo: IAspectRepository,
		private auditEmitter: AuditEmitter
	) {}

	async upsertSeries(
		userId: string,
		input: UpsertSeriesInput,
		expectedVersionOrNone?: number
	): Promise<RecurringTaskSeriesAggregate> {
		const aspect = await this.aspectRepo.findById(input.aspectId);
		if (!aspect || aspect.userId !== userId) {
			throw new NotFoundError('Aspect', input.aspectId);
		}

		const series = createRecurringTaskSeries({
			id: crypto.randomUUID(),
			userId,
			aspectId: input.aspectId,
			milestoneId: input.milestoneId,
			titleTemplate: input.titleTemplate,
			descriptionTemplate: input.descriptionTemplate,
			effortMinutesTemplate: input.effortMinutesTemplate,
			importanceScoreTemplate: input.importanceScoreTemplate,
			splittableOverride: input.splittableOverride
		});

		const rule = createRecurrenceRule({
			id: crypto.randomUUID(),
			recurringTaskSeriesId: series.id,
			frequency: input.frequency as RecurrenceFrequency,
			interval: input.interval,
			weekdayMask: input.weekdayMask,
			monthDay: input.monthDay,
			anchorDateLocal: input.anchorDateLocal,
			endsOn: input.endsOn
		});

		const aggregate: RecurringTaskSeriesAggregate = {
			series: { ...series, nextOccurrenceDateLocal: input.anchorDateLocal },
			rules: [rule],
			exceptions: []
		};

		const saved = await this.recurringSeriesRepo.save(aggregate, expectedVersionOrNone ?? null);

		// Generate first task instance
		const firstTask = createTask({
			id: crypto.randomUUID(),
			aspectId: input.aspectId,
			title: input.titleTemplate,
			description: input.descriptionTemplate,
			effortMinutes: input.effortMinutesTemplate,
			importanceScore: input.importanceScoreTemplate,
			milestoneId: input.milestoneId,
			splittableOverride: input.splittableOverride,
			recurringTaskSeriesId: saved.series.id,
			dueDate: input.anchorDateLocal
		});
		await this.taskRepo.save(firstTask, null);

		await this.auditEmitter.emit({
			userId,
			actorPrincipalType: PrincipalType.UserSession,
			eventType: 'recurring_series.created',
			entityType: 'RecurringTaskSeries',
			entityId: saved.series.id,
			after: saved.series as unknown as Record<string, unknown>
		});

		return saved;
	}

	async pauseOrResumeSeries(
		userId: string,
		seriesId: string,
		paused: boolean,
		expectedVersion: number
	): Promise<RecurringTaskSeriesAggregate> {
		const aggregate = await this.loadOwnedAggregate(userId, seriesId);
		const updated = paused
			? pauseSeries(aggregate.series)
			: resumeSeries(aggregate.series);

		const saved = await this.recurringSeriesRepo.save(
			{ ...aggregate, series: updated },
			expectedVersion
		);

		await this.auditEmitter.emit({
			userId,
			actorPrincipalType: PrincipalType.UserSession,
			eventType: paused ? 'recurring_series.paused' : 'recurring_series.resumed',
			entityType: 'RecurringTaskSeries',
			entityId: seriesId
		});

		return saved;
	}

	async skipOrMoveNextOccurrence(
		userId: string,
		seriesId: string,
		input: SkipOrMoveInput,
		expectedVersion: number
	): Promise<RecurringTaskSeriesAggregate> {
		const aggregate = await this.loadOwnedAggregate(userId, seriesId);

		const activeRule = aggregate.rules.find((r) => !r.paused);
		if (!activeRule) throw new NotFoundError('RecurrenceRule', seriesId);

		const exception = createRecurrenceException({
			id: crypto.randomUUID(),
			recurrenceRuleId: activeRule.id,
			occurrenceDateLocal: input.occurrenceDateLocal,
			action: input.action as RecurrenceExceptionAction,
			overrideOccurrenceDateLocal: input.overrideDateLocal
		});

		const updatedAggregate: RecurringTaskSeriesAggregate = {
			...aggregate,
			exceptions: [...aggregate.exceptions, exception]
		};

		const saved = await this.recurringSeriesRepo.save(updatedAggregate, expectedVersion);

		await this.auditEmitter.emit({
			userId,
			actorPrincipalType: PrincipalType.UserSession,
			eventType: `recurring_series.occurrence_${input.action.toLowerCase()}`,
			entityType: 'RecurringTaskSeries',
			entityId: seriesId
		});

		return saved;
	}

	async closeSeries(
		userId: string,
		seriesId: string,
		expectedVersion: number
	): Promise<RecurringTaskSeriesAggregate> {
		await this.loadOwnedAggregate(userId, seriesId);
		const closed = await this.recurringSeriesRepo.close(seriesId, expectedVersion);

		await this.auditEmitter.emit({
			userId,
			actorPrincipalType: PrincipalType.UserSession,
			eventType: 'recurring_series.closed',
			entityType: 'RecurringTaskSeries',
			entityId: seriesId
		});

		return closed;
	}

	private async loadOwnedAggregate(
		userId: string,
		seriesId: string
	): Promise<RecurringTaskSeriesAggregate> {
		const aggregate = await this.recurringSeriesRepo.findById(seriesId);
		if (!aggregate) throw new NotFoundError('RecurringTaskSeries', seriesId);
		if (aggregate.series.userId !== userId) throw new OwnershipError();
		return aggregate;
	}
}
