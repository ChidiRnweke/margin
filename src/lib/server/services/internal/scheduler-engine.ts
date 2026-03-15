import type {
	ISchedulerEngine,
	SchedulerResult
} from '$lib/server/services/contracts/scheduler-engine.js';
import type { Task } from '$lib/server/domain/models/task.js';
import type { PlanningProfile } from '$lib/server/domain/models/planning-profile.js';
import type { TaskLock } from '$lib/server/domain/models/task-lock.js';
import type { AspectCycleHealth } from '$lib/server/domain/models/aspect-cycle-health.js';
import type { EffectiveWindow } from '$lib/server/services/contracts/availability-window-resolver.js';
import { createTaskAllocation } from '$lib/server/domain/models/task-allocation.js';
import { rankTasks } from './scoring.js';

interface WindowSlot {
	startUtc: Date;
	endUtc: Date;
	remainingMinutes: number;
	sourceBlockId: string;
}

export class SchedulerEngine implements ISchedulerEngine {
	buildWeeklySchedule(
		tasks: unknown[],
		availability: unknown[],
		profile: unknown,
		locks: unknown[],
		horizon: { weekStart: string; weekEnd: string }
	): SchedulerResult {
		const typedTasks = tasks as Task[];
		const typedWindows = availability as EffectiveWindow[];
		const typedProfile = profile as PlanningProfile;
		const typedLocks = locks as TaskLock[];

		const revisionId = crypto.randomUUID();

		// Build mutable window slots
		const slots = typedWindows.map((w) => this.toSlot(w));

		// Build health map from any existing health data
		const aspectHealthMap = new Map<string, AspectCycleHealth>();

		// 1. Place locked tasks first
		const allocations: ReturnType<typeof createTaskAllocation>[] = [];
		const lockedTaskIds = new Set<string>();

		for (const lock of typedLocks.filter((l) => l.active)) {
			const task = typedTasks.find((t) => t.id === lock.taskId);
			if (!task) continue;

			lockedTaskIds.add(lock.taskId);
			allocations.push(
				createTaskAllocation({
					id: crypto.randomUUID(),
					planningRevisionId: revisionId,
					taskId: lock.taskId,
					scheduledStartUtc: lock.lockedStartUtc,
					scheduledEndUtc: lock.lockedEndUtc,
					scheduledUtcOffsetMinutes: lock.lockedUtcOffsetMinutes,
					scheduledDstOffsetMinutes: lock.lockedDstOffsetMinutes,
					allocatedMinutes: Math.round(
						(lock.lockedEndUtc.getTime() - lock.lockedStartUtc.getTime()) / 60_000
					)
				})
			);

			// Subtract locked time from overlapping slots
			this.subtractFromSlots(slots, lock.lockedStartUtc, lock.lockedEndUtc);
		}

		// 2. Score and rank remaining tasks
		const unlockedTasks = typedTasks.filter((t) => !lockedTaskIds.has(t.id));
		const ranked = rankTasks(unlockedTasks, typedProfile, aspectHealthMap);

		// 3. Fill remaining windows with ranked tasks
		const unplaced: Array<{ taskId: string; reason: string }> = [];
		const taskRemainingMap = new Map(unlockedTasks.map((t) => [t.id, t.remainingMinutes]));

		for (const scored of ranked) {
			const task = unlockedTasks.find((t) => t.id === scored.taskId);
			if (!task) continue;

			let remaining = taskRemainingMap.get(task.id) ?? task.remainingMinutes;
			if (remaining <= 0) continue;

			const isSplittable = task.splittableOverride ?? true;
			let placed = false;

			for (const slot of slots) {
				if (slot.remainingMinutes < typedProfile.minChunkMinutes) continue;
				if (remaining <= 0) break;

				const chunkMinutes = Math.min(remaining, slot.remainingMinutes);

				if (chunkMinutes < typedProfile.minChunkMinutes && !isSplittable) {
					continue;
				}

				const allocMinutes = Math.max(chunkMinutes, typedProfile.minChunkMinutes);
				const actualMinutes = Math.min(allocMinutes, slot.remainingMinutes);

				const startUtc = new Date(slot.endUtc.getTime() - slot.remainingMinutes * 60_000);
				const endUtc = new Date(startUtc.getTime() + actualMinutes * 60_000);

				allocations.push(
					createTaskAllocation({
						id: crypto.randomUUID(),
						planningRevisionId: revisionId,
						taskId: task.id,
						scheduledStartUtc: startUtc,
						scheduledEndUtc: endUtc,
						scheduledUtcOffsetMinutes: 0,
						scheduledDstOffsetMinutes: 0,
						allocatedMinutes: actualMinutes
					})
				);

				slot.remainingMinutes -= actualMinutes;
				remaining -= actualMinutes;
				placed = true;

				if (!isSplittable) break;
			}

			taskRemainingMap.set(task.id, remaining);

			if (!placed) {
				unplaced.push({ taskId: task.id, reason: 'No available window' });
			} else if (remaining > 0) {
				unplaced.push({ taskId: task.id, reason: 'Partially placed' });
			}
		}

		return {
			allocations,
			deferredOutcomes: [],
			unplaced
		};
	}

	private toSlot(window: EffectiveWindow): WindowSlot {
		const start = new Date(window.startUtc);
		const end = new Date(window.endUtc);
		return {
			startUtc: start,
			endUtc: end,
			remainingMinutes: Math.round((end.getTime() - start.getTime()) / 60_000),
			sourceBlockId: window.sourceBlockId
		};
	}

	private subtractFromSlots(slots: WindowSlot[], lockStart: Date, lockEnd: Date): void {
		for (const slot of slots) {
			if (lockStart >= slot.endUtc || lockEnd <= slot.startUtc) continue;

			// Overlap: reduce remaining minutes
			const overlapStart = lockStart > slot.startUtc ? lockStart : slot.startUtc;
			const overlapEnd = lockEnd < slot.endUtc ? lockEnd : slot.endUtc;
			const overlapMinutes = Math.round((overlapEnd.getTime() - overlapStart.getTime()) / 60_000);
			slot.remainingMinutes = Math.max(0, slot.remainingMinutes - overlapMinutes);
		}
	}
}
