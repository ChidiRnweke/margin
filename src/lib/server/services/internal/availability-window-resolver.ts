import type {
	IAvailabilityWindowResolver,
	EffectiveWindow
} from '$lib/server/services/contracts/availability-window-resolver.js';
import type { AvailabilityAggregate } from '$lib/server/repositories/contracts/availability-repository.js';

export class AvailabilityWindowResolver implements IAvailabilityWindowResolver {
	resolveEffectiveWindows(
		blocks: unknown[],
		range: { rangeStart: string; rangeEnd: string },
		timezone: string
	): EffectiveWindow[] {
		const aggregates = blocks as AvailabilityAggregate[];
		const windows: EffectiveWindow[] = [];
		const rangeStart = new Date(range.rangeStart);
		const rangeEnd = new Date(range.rangeEnd);

		for (const agg of aggregates) {
			const block = agg.block;

			if (block.kind === 'OneOff') {
				this.expandOneOff(block, rangeStart, rangeEnd, windows);
			} else {
				this.expandRecurring(agg, rangeStart, rangeEnd, windows);
			}
		}

		windows.sort((a, b) => a.startUtc.localeCompare(b.startUtc));
		return this.mergeOverlapping(windows);
	}

	private expandOneOff(
		block: AvailabilityAggregate['block'],
		rangeStart: Date,
		rangeEnd: Date,
		windows: EffectiveWindow[]
	): void {
		if (!block.oneOffStartsAtUtc || !block.oneOffEndsAtUtc) return;

		const start = block.oneOffStartsAtUtc;
		const end = block.oneOffEndsAtUtc;

		if (start < rangeEnd && end > rangeStart) {
			windows.push({
				startUtc: start.toISOString(),
				endUtc: end.toISOString(),
				sourceBlockId: block.id
			});
		}
	}

	private expandRecurring(
		agg: AvailabilityAggregate,
		rangeStart: Date,
		rangeEnd: Date,
		windows: EffectiveWindow[]
	): void {
		const block = agg.block;
		const mask = block.weekdayMask ?? 0;
		const current = new Date(rangeStart);
		current.setUTCHours(0, 0, 0, 0);

		while (current < rangeEnd) {
			const dateStr = current.toISOString().slice(0, 10);

			// Skip dates outside the block's effective range
			if (block.startsOnLocal && dateStr < block.startsOnLocal) {
				current.setUTCDate(current.getUTCDate() + 1);
				continue;
			}
			if (block.endsOnLocal && dateStr > block.endsOnLocal) {
				break;
			}

			const exception = agg.exceptions.find((e) => e.exceptionDate === dateStr);

			if (exception) {
				if (exception.action === 'Skip') {
					current.setUTCDate(current.getUTCDate() + 1);
					continue;
				}
				// Override: use exception times
				if (exception.overrideStartsAtUtc && exception.overrideEndsAtUtc) {
					windows.push({
						startUtc: exception.overrideStartsAtUtc.toISOString(),
						endUtc: exception.overrideEndsAtUtc.toISOString(),
						sourceBlockId: block.id
					});
				} else if (
					exception.overrideLocalStartMinute !== null &&
					exception.overrideLocalEndMinute !== null
				) {
					const dayStart = new Date(current);
					dayStart.setUTCHours(0, 0, 0, 0);
					windows.push({
						startUtc: new Date(
							dayStart.getTime() + exception.overrideLocalStartMinute * 60_000
						).toISOString(),
						endUtc: new Date(
							dayStart.getTime() + exception.overrideLocalEndMinute * 60_000
						).toISOString(),
						sourceBlockId: block.id
					});
				}
			} else {
				const dayOfWeek = current.getUTCDay();
				const dayBit = 1 << dayOfWeek;

				if (
					mask & dayBit &&
					block.localStartMinute !== null &&
					block.localEndMinute !== null
				) {
					const dayStart = new Date(current);
					dayStart.setUTCHours(0, 0, 0, 0);
					windows.push({
						startUtc: new Date(
							dayStart.getTime() + block.localStartMinute * 60_000
						).toISOString(),
						endUtc: new Date(
							dayStart.getTime() + block.localEndMinute * 60_000
						).toISOString(),
						sourceBlockId: block.id
					});
				}
			}

			current.setUTCDate(current.getUTCDate() + 1);
		}
	}

	private mergeOverlapping(windows: EffectiveWindow[]): EffectiveWindow[] {
		if (windows.length <= 1) return windows;

		const merged: EffectiveWindow[] = [windows[0]];

		for (let i = 1; i < windows.length; i++) {
			const last = merged[merged.length - 1];
			const curr = windows[i];

			if (curr.startUtc <= last.endUtc) {
				// Overlapping: extend end if needed
				if (curr.endUtc > last.endUtc) {
					merged[merged.length - 1] = {
						startUtc: last.startUtc,
						endUtc: curr.endUtc,
						sourceBlockId: last.sourceBlockId
					};
				}
			} else {
				merged.push(curr);
			}
		}

		return merged;
	}
}
