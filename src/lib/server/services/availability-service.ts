import type {
	IAvailabilityRepository,
	AvailabilityAggregate
} from '$lib/server/repositories/contracts/availability-repository.js';
import type {
	IAvailabilityService,
	CreateOneOffBlockInput,
	CreateRecurringBlockInput,
	AddRecurringExceptionInput,
	UpdateArchiveRestoreBlockInput,
	DateRange,
	EffectiveWindow
} from '$lib/server/services/contracts/availability-service.js';
import type { IAvailabilityWindowResolver } from '$lib/server/services/contracts/availability-window-resolver.js';
import type { AuditEmitter } from '$lib/server/infra/audit/audit-emitter.js';
import type { IUserRepository } from '$lib/server/repositories/contracts/user-repository.js';
import { createOneOffBlock, createRecurringBlock } from '$lib/server/domain/models/availability-block.js';
import { createAvailabilityException } from '$lib/server/domain/models/availability-exception.js';
import { NotFoundError } from '$lib/server/errors/domain-errors.js';
import type { AvailabilityExceptionAction } from '$lib/server/domain/enums.js';

export class AvailabilityService implements IAvailabilityService {
	constructor(
		private availabilityRepo: IAvailabilityRepository,
		private userRepo: IUserRepository,
		private windowResolver: IAvailabilityWindowResolver,
		private auditEmitter: AuditEmitter
	) {}

	async createOneOffBlock(userId: string, input: CreateOneOffBlockInput): Promise<unknown> {
		const block = createOneOffBlock({
			id: crypto.randomUUID(),
			userId,
			oneOffStartsAtUtc: new Date(input.oneOffStartsAtUtc),
			oneOffEndsAtUtc: new Date(input.oneOffEndsAtUtc)
		});

		const aggregate: AvailabilityAggregate = { block, exceptions: [] };
		return (await this.availabilityRepo.save(aggregate, null)).block;
	}

	async createRecurringBlock(userId: string, input: CreateRecurringBlockInput): Promise<unknown> {
		const block = createRecurringBlock({
			id: crypto.randomUUID(),
			userId,
			localStartMinute: input.localStartMinute,
			localEndMinute: input.localEndMinute,
			weekdayMask: input.weekdayMask,
			startsOnLocal: input.startsOnLocal,
			endsOnLocal: input.endsOnLocal
		});

		const aggregate: AvailabilityAggregate = { block, exceptions: [] };
		return (await this.availabilityRepo.save(aggregate, null)).block;
	}

	async addRecurringException(
		userId: string,
		blockId: string,
		input: AddRecurringExceptionInput
	): Promise<unknown> {
		const aggregate = await this.loadOwnedBlock(userId, blockId);

		const exception = createAvailabilityException({
			id: crypto.randomUUID(),
			availabilityBlockId: blockId,
			exceptionDate: input.exceptionDate,
			action: input.action as AvailabilityExceptionAction,
			overrideStartsAtUtc: input.overrideStartsAtUtc
				? new Date(input.overrideStartsAtUtc)
				: undefined,
			overrideEndsAtUtc: input.overrideEndsAtUtc
				? new Date(input.overrideEndsAtUtc)
				: undefined,
			overrideLocalStartMinute: input.overrideLocalStartMinute,
			overrideLocalEndMinute: input.overrideLocalEndMinute
		});

		return this.availabilityRepo.addException(blockId, exception);
	}

	async updateArchiveRestoreBlock(
		userId: string,
		blockId: string,
		input: UpdateArchiveRestoreBlockInput,
		expectedVersion: number
	): Promise<unknown> {
		const aggregate = await this.loadOwnedBlock(userId, blockId);

		if (input.active === false) {
			await this.availabilityRepo.archive(blockId, expectedVersion);
			return { ...aggregate.block, active: false };
		}

		if (input.active === true && !aggregate.block.active) {
			const restored = await this.availabilityRepo.restore(blockId, expectedVersion);
			return restored.block;
		}

		return aggregate.block;
	}

	async queryEffectiveAvailability(
		userId: string,
		range: DateRange
	): Promise<{ windows: EffectiveWindow[] }> {
		const aggregates = await this.availabilityRepo.queryLiveBlocksForRange(userId, {
			start: range.rangeStart,
			end: range.rangeEnd
		});

		const user = await this.userRepo.findById(userId);
		const timezone = user?.timezoneNameIana ?? 'UTC';

		const windows = this.windowResolver.resolveEffectiveWindows(aggregates, range, timezone);
		return { windows };
	}

	private async loadOwnedBlock(
		userId: string,
		blockId: string
	): Promise<AvailabilityAggregate> {
		const aggregate = await this.availabilityRepo.findById(blockId);
		if (!aggregate || aggregate.block.userId !== userId) {
			throw new NotFoundError('AvailabilityBlock', blockId);
		}
		return aggregate;
	}
}
