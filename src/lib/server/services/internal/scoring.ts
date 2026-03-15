import type { Task } from '$lib/server/domain/models/task.js';
import type { PlanningProfile } from '$lib/server/domain/models/planning-profile.js';
import type { AspectCycleHealth } from '$lib/server/domain/models/aspect-cycle-health.js';

export interface TaskScore {
	taskId: string;
	score: number;
	urgencyComponent: number;
	importanceComponent: number;
	balanceComponent: number;
	effortFitComponent: number;
}

export function scoreTask(
	task: Task,
	profile: PlanningProfile,
	aspectHealthMap?: Map<string, AspectCycleHealth>
): TaskScore {
	const urgency = computeUrgencyScore(task, profile.urgentThresholdDays);
	const importance = task.importanceScore / 100;
	const balance = computeBalanceScore(task, aspectHealthMap);
	const effortFit = computeEffortFitScore(task, profile.minChunkMinutes);

	const totalWeight =
		profile.urgencyWeight +
		profile.importanceWeight +
		profile.balanceWeight +
		profile.effortFitWeight;

	const score =
		totalWeight > 0
			? (profile.urgencyWeight * urgency +
					profile.importanceWeight * importance +
					profile.balanceWeight * balance +
					profile.effortFitWeight * effortFit) /
				totalWeight
			: 0;

	return {
		taskId: task.id,
		score,
		urgencyComponent: urgency,
		importanceComponent: importance,
		balanceComponent: balance,
		effortFitComponent: effortFit
	};
}

function computeUrgencyScore(task: Task, urgentThresholdDays: number): number {
	if (!task.dueDate) return 0;

	const now = Date.now();
	const due = new Date(task.dueDate).getTime();
	const daysUntilDue = (due - now) / (1000 * 60 * 60 * 24);

	if (daysUntilDue <= 0) return 1.0; // Overdue
	if (daysUntilDue >= urgentThresholdDays) return 0;

	return 1.0 - daysUntilDue / urgentThresholdDays;
}

function computeBalanceScore(task: Task, aspectHealthMap?: Map<string, AspectCycleHealth>): number {
	if (!aspectHealthMap) return 0.5;

	const health = aspectHealthMap.get(task.aspectId);
	if (!health) return 0.5;

	// Lower health score means the aspect needs more attention, so boost priority
	return Math.max(0, 1.0 - health.healthScore);
}

function computeEffortFitScore(task: Task, minChunkMinutes: number): number {
	const remaining = task.remainingMinutes;
	if (remaining <= 0) return 0;

	// Tasks that fit neatly into a single chunk score higher
	if (remaining <= minChunkMinutes) return 1.0;
	if (remaining <= minChunkMinutes * 2) return 0.8;
	if (remaining <= minChunkMinutes * 4) return 0.6;
	return 0.4;
}

export function rankTasks(
	tasks: Task[],
	profile: PlanningProfile,
	aspectHealthMap?: Map<string, AspectCycleHealth>
): TaskScore[] {
	return tasks.map((t) => scoreTask(t, profile, aspectHealthMap)).sort((a, b) => b.score - a.score);
}
