import { eq, and, sql } from 'drizzle-orm';
import type { Database } from '$lib/server/db/index.js';
import { availabilityBlocks, availabilityExceptions } from '$lib/server/db/schema/index.js';
import type { AvailabilityBlock } from '$lib/server/domain/models/availability-block.js';
import type { AvailabilityException } from '$lib/server/domain/models/availability-exception.js';
import type {
	IAvailabilityRepository,
	AvailabilityAggregate,
	DateRange
} from '../contracts/availability-repository.js';
import {
	NotFoundError,
	OptimisticConcurrencyError
} from '$lib/server/errors/domain-errors.js';

export class PgAvailabilityRepository implements IAvailabilityRepository {
	constructor(private readonly db: Database) {}

	async findById(blockId: string): Promise<AvailabilityAggregate | null> {
		const rows = await this.db
			.select()
			.from(availabilityBlocks)
			.where(eq(availabilityBlocks.id, blockId))
			.limit(1);

		if (rows.length === 0) return null;
		return this.loadAggregate(rows[0] as AvailabilityBlock);
	}

	async save(
		aggregate: AvailabilityAggregate,
		expectedVersion: number | null
	): Promise<AvailabilityAggregate> {
		const { block, exceptions } = aggregate;

		if (expectedVersion === null) {
			await this.db.insert(availabilityBlocks).values({
				id: block.id,
				userId: block.userId,
				kind: block.kind,
				oneOffStartsAtUtc: block.oneOffStartsAtUtc,
				oneOffEndsAtUtc: block.oneOffEndsAtUtc,
				localStartMinute: block.localStartMinute,
				localEndMinute: block.localEndMinute,
				weekdayMask: block.weekdayMask,
				startsOnLocal: block.startsOnLocal,
				endsOnLocal: block.endsOnLocal,
				active: block.active,
				version: 1,
				createdAt: block.createdAt,
				archivedAt: block.archivedAt
			});
		} else {
			const updated = await this.db
				.update(availabilityBlocks)
				.set({
					kind: block.kind,
					oneOffStartsAtUtc: block.oneOffStartsAtUtc,
					oneOffEndsAtUtc: block.oneOffEndsAtUtc,
					localStartMinute: block.localStartMinute,
					localEndMinute: block.localEndMinute,
					weekdayMask: block.weekdayMask,
					startsOnLocal: block.startsOnLocal,
					endsOnLocal: block.endsOnLocal,
					active: block.active,
					version: sql`${availabilityBlocks.version} + 1`,
					archivedAt: block.archivedAt
				})
				.where(
					and(
						eq(availabilityBlocks.id, block.id),
						eq(availabilityBlocks.version, expectedVersion)
					)
				)
				.returning();

			if (updated.length === 0) {
				throw new OptimisticConcurrencyError('AvailabilityBlock', block.id);
			}
		}

		// Sync exceptions: delete old, insert new
		await this.db
			.delete(availabilityExceptions)
			.where(eq(availabilityExceptions.availabilityBlockId, block.id));

		if (exceptions.length > 0) {
			await this.db.insert(availabilityExceptions).values(
				exceptions.map((e) => ({
					id: e.id,
					availabilityBlockId: e.availabilityBlockId,
					exceptionDate: e.exceptionDate,
					action: e.action,
					overrideStartsAtUtc: e.overrideStartsAtUtc,
					overrideEndsAtUtc: e.overrideEndsAtUtc,
					overrideLocalStartMinute: e.overrideLocalStartMinute,
					overrideLocalEndMinute: e.overrideLocalEndMinute,
					createdAt: e.createdAt
				}))
			);
		}

		return (await this.findById(block.id))!;
	}

	async archive(blockId: string, expectedVersion: number): Promise<void> {
		const updated = await this.db
			.update(availabilityBlocks)
			.set({
				active: false,
				archivedAt: new Date(),
				version: sql`${availabilityBlocks.version} + 1`
			})
			.where(
				and(
					eq(availabilityBlocks.id, blockId),
					eq(availabilityBlocks.version, expectedVersion)
				)
			)
			.returning();

		if (updated.length === 0) {
			throw new OptimisticConcurrencyError('AvailabilityBlock', blockId);
		}
	}

	async restore(blockId: string, expectedVersion: number): Promise<AvailabilityAggregate> {
		const updated = await this.db
			.update(availabilityBlocks)
			.set({
				active: true,
				archivedAt: null,
				version: sql`${availabilityBlocks.version} + 1`
			})
			.where(
				and(
					eq(availabilityBlocks.id, blockId),
					eq(availabilityBlocks.version, expectedVersion)
				)
			)
			.returning();

		if (updated.length === 0) {
			throw new OptimisticConcurrencyError('AvailabilityBlock', blockId);
		}

		return (await this.findById(blockId))!;
	}

	async addException(
		blockId: string,
		exception: AvailabilityException
	): Promise<AvailabilityException> {
		const rows = await this.db
			.insert(availabilityExceptions)
			.values({
				id: exception.id,
				availabilityBlockId: exception.availabilityBlockId,
				exceptionDate: exception.exceptionDate,
				action: exception.action,
				overrideStartsAtUtc: exception.overrideStartsAtUtc,
				overrideEndsAtUtc: exception.overrideEndsAtUtc,
				overrideLocalStartMinute: exception.overrideLocalStartMinute,
				overrideLocalEndMinute: exception.overrideLocalEndMinute,
				createdAt: exception.createdAt
			})
			.returning();

		return rows[0] as AvailabilityException;
	}

	async queryLiveBlocksForRange(
		userId: string,
		range: DateRange
	): Promise<AvailabilityAggregate[]> {
		// Select active blocks for the user that overlap with the given date range.
		// For OneOff blocks: check if their UTC time range overlaps.
		// For Recurring blocks: check if their local date range overlaps (or is unbounded).
		const rows = await this.db
			.select()
			.from(availabilityBlocks)
			.where(
				and(
					eq(availabilityBlocks.userId, userId),
					eq(availabilityBlocks.active, true),
					sql`(
						(${availabilityBlocks.kind} = 'OneOff'
							AND ${availabilityBlocks.oneOffStartsAtUtc} < ${range.end}::timestamp
							AND ${availabilityBlocks.oneOffEndsAtUtc} > ${range.start}::timestamp
						)
						OR
						(${availabilityBlocks.kind} = 'Recurring'
							AND (${availabilityBlocks.startsOnLocal} IS NULL OR ${availabilityBlocks.startsOnLocal} <= ${range.end})
							AND (${availabilityBlocks.endsOnLocal} IS NULL OR ${availabilityBlocks.endsOnLocal} >= ${range.start})
						)
					)`
				)
			);

		return Promise.all(rows.map((r) => this.loadAggregate(r as AvailabilityBlock)));
	}

	async deleteByUserId(userId: string): Promise<number> {
		const deleted = await this.db
			.delete(availabilityBlocks)
			.where(eq(availabilityBlocks.userId, userId))
			.returning();

		return deleted.length;
	}

	private async loadAggregate(block: AvailabilityBlock): Promise<AvailabilityAggregate> {
		const exceptionRows = await this.db
			.select()
			.from(availabilityExceptions)
			.where(eq(availabilityExceptions.availabilityBlockId, block.id));

		return {
			block,
			exceptions: exceptionRows as AvailabilityException[]
		};
	}
}
