import type { Milestone } from '$lib/server/domain/models/milestone.js';
import type { Page, PaginationQuery } from './query-models.js';

export interface MilestoneQuery extends PaginationQuery {
	aspectId?: string;
	status?: string;
	search?: string;
}

export interface MilestoneSummary {
	id: string;
	aspectId: string;
	aspectName: string;
	title: string;
	status: string;
	targetDate: string | null;
	taskCount: number;
	completedAt: Date | null;
	createdAt: Date;
}

export interface IMilestoneRepository {
	findById(milestoneId: string): Promise<Milestone | null>;
	save(milestone: Milestone, expectedVersion: number | null): Promise<Milestone>;
	archive(milestoneId: string, expectedVersion: number): Promise<void>;
	restoreToOpen(milestoneId: string, expectedVersion: number): Promise<Milestone>;
	query(userId: string, query: MilestoneQuery): Promise<Page<MilestoneSummary>>;
	deleteByAspectIds(aspectIds: string[]): Promise<number>;
}
