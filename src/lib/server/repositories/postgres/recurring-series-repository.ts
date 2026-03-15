import { eq, and, sql, inArray } from 'drizzle-orm';
import type { Database } from '$lib/server/db/index.js';
import {
	recurringTaskSeries,
	recurrenceRules,
	recurrenceExceptions,
	tasks
} from '$lib/server/db/schema/index.js';
import type { RecurringTaskSeries } from '$lib/server/domain/models/recurring-task-series.js';
import type { RecurrenceRule } from '$lib/server/domain/models/recurrence-rule.js';
import type { RecurrenceException } from '$lib/server/domain/models/recurrence-exception.js';
import type {
	IRecurringSeriesRepository,
	RecurringTaskSeriesAggregate
} from '$lib/server/repositories/contracts/recurring-series-repository.js';
import { OptimisticConcurrencyError } from '$lib/server/errors/domain-errors.js';

export class PostgresRecurringSeriesRepository implements IRecurringSeriesRepository {
	constructor(private db: Database) {}

	async findById(seriesId: string): Promise<RecurringTaskSeriesAggregate | null> {
		const rows = await this.db
			.select()
			.from(recurringTaskSeries)
			.where(eq(recurringTaskSeries.id, seriesId))
			.limit(1);

		if (rows.length === 0) return null;
		return this.loadAggregate(rows[0] as RecurringTaskSeries);
	}

	async save(
		aggregate: RecurringTaskSeriesAggregate,
		expectedVersion: number | null
	): Promise<RecurringTaskSeriesAggregate> {
		const { series, rules, exceptions } = aggregate;

		if (expectedVersion === null) {
			await this.db.insert(recurringTaskSeries).values({
				id: series.id,
				userId: series.userId,
				aspectId: series.aspectId,
				milestoneId: series.milestoneId,
				titleTemplate: series.titleTemplate,
				descriptionTemplate: series.descriptionTemplate,
				effortMinutesTemplate: series.effortMinutesTemplate,
				importanceScoreTemplate: series.importanceScoreTemplate,
				splittableOverride: series.splittableOverride,
				status: series.status,
				nextOccurrenceDateLocal: series.nextOccurrenceDateLocal,
				version: 1,
				createdAt: series.createdAt,
				closedAt: series.closedAt
			});
		} else {
			const updated = await this.db
				.update(recurringTaskSeries)
				.set({
					aspectId: series.aspectId,
					milestoneId: series.milestoneId,
					titleTemplate: series.titleTemplate,
					descriptionTemplate: series.descriptionTemplate,
					effortMinutesTemplate: series.effortMinutesTemplate,
					importanceScoreTemplate: series.importanceScoreTemplate,
					splittableOverride: series.splittableOverride,
					status: series.status,
					nextOccurrenceDateLocal: series.nextOccurrenceDateLocal,
					version: sql`${recurringTaskSeries.version} + 1`,
					closedAt: series.closedAt
				})
				.where(
					and(
						eq(recurringTaskSeries.id, series.id),
						eq(recurringTaskSeries.version, expectedVersion)
					)
				)
				.returning();

			if (updated.length === 0) {
				throw new OptimisticConcurrencyError('RecurringTaskSeries', series.id);
			}
		}

		// Sync rules: delete old, insert new
		await this.db
			.delete(recurrenceRules)
			.where(eq(recurrenceRules.recurringTaskSeriesId, series.id));

		if (rules.length > 0) {
			await this.db.insert(recurrenceRules).values(
				rules.map((r) => ({
					id: r.id,
					recurringTaskSeriesId: r.recurringTaskSeriesId,
					frequency: r.frequency,
					interval: r.interval,
					weekdayMask: r.weekdayMask,
					monthDay: r.monthDay,
					anchorDateLocal: r.anchorDateLocal,
					paused: r.paused,
					version: r.version,
					endsOn: r.endsOn,
					createdAt: r.createdAt,
					updatedAt: r.updatedAt
				}))
			);
		}

		// Sync exceptions: delete old for all rules in this series, insert new
		const ruleIds = rules.map((r) => r.id);
		if (ruleIds.length > 0) {
			await this.db
				.delete(recurrenceExceptions)
				.where(inArray(recurrenceExceptions.recurrenceRuleId, ruleIds));
		}

		if (exceptions.length > 0) {
			await this.db.insert(recurrenceExceptions).values(
				exceptions.map((e) => ({
					id: e.id,
					recurrenceRuleId: e.recurrenceRuleId,
					occurrenceDateLocal: e.occurrenceDateLocal,
					action: e.action,
					overrideOccurrenceDateLocal: e.overrideOccurrenceDateLocal,
					createdAt: e.createdAt
				}))
			);
		}

		return (await this.findById(series.id))!;
	}

	async close(seriesId: string, expectedVersion: number): Promise<RecurringTaskSeriesAggregate> {
		const now = new Date();
		const updated = await this.db
			.update(recurringTaskSeries)
			.set({
				status: 'Closed',
				closedAt: now,
				version: sql`${recurringTaskSeries.version} + 1`
			})
			.where(
				and(
					eq(recurringTaskSeries.id, seriesId),
					eq(recurringTaskSeries.version, expectedVersion)
				)
			)
			.returning();

		if (updated.length === 0) {
			throw new OptimisticConcurrencyError('RecurringTaskSeries', seriesId);
		}

		return (await this.findById(seriesId))!;
	}

	async findByTaskInstance(taskId: string): Promise<RecurringTaskSeriesAggregate | null> {
		const taskRows = await this.db
			.select({ recurringTaskSeriesId: tasks.recurringTaskSeriesId })
			.from(tasks)
			.where(eq(tasks.id, taskId))
			.limit(1);

		if (taskRows.length === 0 || !taskRows[0].recurringTaskSeriesId) return null;
		return this.findById(taskRows[0].recurringTaskSeriesId);
	}

	async deleteByUserId(userId: string): Promise<number> {
		const deleted = await this.db
			.delete(recurringTaskSeries)
			.where(eq(recurringTaskSeries.userId, userId))
			.returning();

		return deleted.length;
	}

	private async loadAggregate(
		series: RecurringTaskSeries
	): Promise<RecurringTaskSeriesAggregate> {
		const ruleRows = await this.db
			.select()
			.from(recurrenceRules)
			.where(eq(recurrenceRules.recurringTaskSeriesId, series.id));

		const ruleIds = ruleRows.map((r) => r.id);
		let exceptionRows: RecurrenceException[] = [];
		if (ruleIds.length > 0) {
			exceptionRows = (await this.db
				.select()
				.from(recurrenceExceptions)
				.where(inArray(recurrenceExceptions.recurrenceRuleId, ruleIds))) as RecurrenceException[];
		}

		return {
			series,
			rules: ruleRows as RecurrenceRule[],
			exceptions: exceptionRows
		};
	}
}
