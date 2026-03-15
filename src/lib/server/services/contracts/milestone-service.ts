export interface CreateMilestoneInput {
	aspectId: string;
	title: string;
	description?: string;
	targetDate?: string;
}

export interface UpdateMilestoneInput {
	title?: string;
	description?: string;
	targetDate?: string;
}

export interface MilestoneQuery {
	aspectId?: string;
	cursor?: string;
	limit?: number;
}

export interface IMilestoneService {
	createMilestone(userId: string, input: CreateMilestoneInput): Promise<unknown>;
	updateMilestone(
		userId: string,
		milestoneId: string,
		input: UpdateMilestoneInput,
		expectedVersion: number
	): Promise<unknown>;
	completeMilestone(userId: string, milestoneId: string, expectedVersion: number): Promise<unknown>;
	reopenMilestone(userId: string, milestoneId: string, expectedVersion: number): Promise<unknown>;
	archiveMilestone(userId: string, milestoneId: string, expectedVersion: number): Promise<void>;
	restoreMilestone(userId: string, milestoneId: string, expectedVersion: number): Promise<unknown>;
	queryMilestones(
		userId: string,
		query: MilestoneQuery
	): Promise<{ items: unknown[]; nextCursor?: string }>;
}
