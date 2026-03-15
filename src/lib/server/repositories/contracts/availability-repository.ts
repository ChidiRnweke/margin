import type { AvailabilityBlock } from '$lib/server/domain/models/availability-block.js';
import type { AvailabilityException } from '$lib/server/domain/models/availability-exception.js';

export interface AvailabilityAggregate {
	block: AvailabilityBlock;
	exceptions: AvailabilityException[];
}

export interface DateRange {
	start: string;
	end: string;
}

export interface IAvailabilityRepository {
	findById(blockId: string): Promise<AvailabilityAggregate | null>;
	save(
		aggregate: AvailabilityAggregate,
		expectedVersion: number | null
	): Promise<AvailabilityAggregate>;
	archive(blockId: string, expectedVersion: number): Promise<void>;
	restore(blockId: string, expectedVersion: number): Promise<AvailabilityAggregate>;
	addException(blockId: string, exception: AvailabilityException): Promise<AvailabilityException>;
	queryLiveBlocksForRange(userId: string, range: DateRange): Promise<AvailabilityAggregate[]>;
	deleteByUserId(userId: string): Promise<number>;
}
