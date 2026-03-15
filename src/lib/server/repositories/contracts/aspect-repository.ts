import type { Aspect } from '$lib/server/domain/models/aspect.js';
import type { Page, PaginationQuery } from './query-models.js';

export interface AspectQuery extends PaginationQuery {
	status?: string;
	search?: string;
}

export interface AspectSummary {
	id: string;
	name: string;
	status: string;
	targetPercentage: number | null;
	taskCount: number;
	createdAt: Date;
}

export interface IAspectRepository {
	findById(aspectId: string): Promise<Aspect | null>;
	save(aspect: Aspect, expectedVersion: number | null): Promise<Aspect>;
	archive(aspectId: string, expectedVersion: number): Promise<void>;
	restoreToDraft(aspectId: string, expectedVersion: number): Promise<Aspect>;
	query(userId: string, query: AspectQuery): Promise<Page<AspectSummary>>;
	listActiveForUser(userId: string): Promise<Aspect[]>;
	deleteByUserId(userId: string): Promise<number>;
}
