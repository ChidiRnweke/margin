import { MilestoneStatus } from '../enums.js';
import { MilestoneTitle } from '../value-objects/string-values.js';
import { StateTransitionError } from '$lib/server/errors/domain-errors.js';

export interface Milestone {
	readonly id: string;
	readonly aspectId: string;
	readonly title: string;
	readonly description: string | null;
	readonly targetDate: string | null;
	readonly status: string;
	readonly version: number;
	readonly completedAt: Date | null;
	readonly archivedAt: Date | null;
	readonly createdAt: Date;
}

export function createMilestone(params: {
	id: string;
	aspectId: string;
	title: string;
	description?: string;
	targetDate?: string;
}): Milestone {
	new MilestoneTitle(params.title);
	return {
		id: params.id,
		aspectId: params.aspectId,
		title: params.title.trim(),
		description: params.description?.trim() || null,
		targetDate: params.targetDate || null,
		status: MilestoneStatus.Open,
		version: 1,
		completedAt: null,
		archivedAt: null,
		createdAt: new Date()
	};
}

export function completeMilestone(milestone: Milestone): Milestone {
	if (milestone.status !== MilestoneStatus.Open) {
		throw new StateTransitionError(`Cannot complete milestone in ${milestone.status} status`);
	}
	return { ...milestone, status: MilestoneStatus.Done, completedAt: new Date() };
}

export function reopenMilestone(milestone: Milestone): Milestone {
	if (milestone.status !== MilestoneStatus.Done) {
		throw new StateTransitionError(`Cannot reopen milestone in ${milestone.status} status`);
	}
	return { ...milestone, status: MilestoneStatus.Open, completedAt: null };
}

export function archiveMilestone(milestone: Milestone): Milestone {
	if (milestone.status === MilestoneStatus.Archived) {
		throw new StateTransitionError('Milestone is already archived');
	}
	return { ...milestone, status: MilestoneStatus.Archived, archivedAt: new Date() };
}

export function restoreMilestoneToOpen(milestone: Milestone): Milestone {
	if (milestone.status !== MilestoneStatus.Archived) {
		throw new StateTransitionError('Can only restore archived milestones');
	}
	return { ...milestone, status: MilestoneStatus.Open, archivedAt: null, completedAt: null };
}
