import { eq, and, sql, ilike, count, desc, asc, inArray } from 'drizzle-orm';
import type { Database } from '$lib/server/db/index.js';
import { milestones, aspects, tasks } from '$lib/server/db/schema/index.js';
import type { Milestone } from '$lib/server/domain/models/milestone.js';
import type {
	IMilestoneRepository,
	MilestoneQuery,
	MilestoneSummary
} from '$lib/server/repositories/contracts/milestone-repository.js';
import type { Page } from '$lib/server/repositories/contracts/query-models.js';
import { OptimisticConcurrencyError } from '$lib/server/errors/domain-errors.js';

const DEFAULT_LIMIT = 25;

export class PostgresMilestoneRepository implements IMilestoneRepository {
	constructor(private db: Database) {}

	private toDomain(row: typeof milestones.$inferSelect): Milestone {
		return {
			id: row.id,
			aspectId: row.aspectId,
			title: row.title,
			description: row.description,
			targetDate: row.targetDate,
			status: row.status,
			version: row.version,
			completedAt: row.completedAt,
			archivedAt: row.archivedAt,
			createdAt: row.createdAt
		};
	}

	async findById(milestoneId: string): Promise<Milestone | null> {
		const rows = await this.db
			.select()
			.from(milestones)
			.where(eq(milestones.id, milestoneId))
			.limit(1);
		return rows.length > 0 ? this.toDomain(rows[0]) : null;
	}

	async save(milestone: Milestone, expectedVersion: number | null): Promise<Milestone> {
		if (expectedVersion === null) {
			const rows = await this.db
				.insert(milestones)
				.values({
					id: milestone.id,
					aspectId: milestone.aspectId,
					title: milestone.title,
					description: milestone.description,
					targetDate: milestone.targetDate,
					status: milestone.status,
					version: 1,
					completedAt: milestone.completedAt,
					archivedAt: milestone.archivedAt,
					createdAt: milestone.createdAt
				})
				.returning();
			return this.toDomain(rows[0]);
		}

		const rows = await this.db
			.update(milestones)
			.set({
				title: milestone.title,
				description: milestone.description,
				targetDate: milestone.targetDate,
				status: milestone.status,
				version: sql`${milestones.version} + 1`,
				completedAt: milestone.completedAt,
				archivedAt: milestone.archivedAt
			})
			.where(and(eq(milestones.id, milestone.id), eq(milestones.version, expectedVersion)))
			.returning();

		if (rows.length === 0) {
			throw new OptimisticConcurrencyError('Milestone', milestone.id);
		}
		return this.toDomain(rows[0]);
	}

	async archive(milestoneId: string, expectedVersion: number): Promise<void> {
		const rows = await this.db
			.update(milestones)
			.set({
				status: 'Archived',
				archivedAt: new Date(),
				version: sql`${milestones.version} + 1`
			})
			.where(and(eq(milestones.id, milestoneId), eq(milestones.version, expectedVersion)))
			.returning();

		if (rows.length === 0) {
			throw new OptimisticConcurrencyError('Milestone', milestoneId);
		}
	}

	async restoreToOpen(milestoneId: string, expectedVersion: number): Promise<Milestone> {
		const rows = await this.db
			.update(milestones)
			.set({
				status: 'Open',
				archivedAt: null,
				completedAt: null,
				version: sql`${milestones.version} + 1`
			})
			.where(and(eq(milestones.id, milestoneId), eq(milestones.version, expectedVersion)))
			.returning();

		if (rows.length === 0) {
			throw new OptimisticConcurrencyError('Milestone', milestoneId);
		}
		return this.toDomain(rows[0]);
	}

	async query(userId: string, query: MilestoneQuery): Promise<Page<MilestoneSummary>> {
		const limit = query.limit ?? DEFAULT_LIMIT;
		const offset = query.cursor ? parseInt(query.cursor, 10) : 0;

		const conditions = [eq(aspects.userId, userId)];
		if (query.aspectId) {
			conditions.push(eq(milestones.aspectId, query.aspectId));
		}
		if (query.status) {
			conditions.push(eq(milestones.status, query.status));
		}
		if (query.search) {
			conditions.push(ilike(milestones.title, `%${query.search}%`));
		}

		const whereClause = and(...conditions);

		const [countResult, items] = await Promise.all([
			this.db
				.select({ total: count() })
				.from(milestones)
				.innerJoin(aspects, eq(milestones.aspectId, aspects.id))
				.where(whereClause),
			this.db
				.select({
					id: milestones.id,
					aspectId: milestones.aspectId,
					aspectName: aspects.name,
					title: milestones.title,
					status: milestones.status,
					targetDate: milestones.targetDate,
					taskCount: sql<number>`(SELECT count(*) FROM tasks WHERE tasks.milestone_id = ${milestones.id})`,
					completedAt: milestones.completedAt,
					createdAt: milestones.createdAt
				})
				.from(milestones)
				.innerJoin(aspects, eq(milestones.aspectId, aspects.id))
				.where(whereClause)
				.orderBy(
					query.sortDirection === 'asc' ? asc(milestones.createdAt) : desc(milestones.createdAt)
				)
				.limit(limit)
				.offset(offset)
		]);

		const totalCount = countResult[0]?.total ?? 0;
		const nextOffset = offset + items.length;
		const hasMore = nextOffset < totalCount;

		return {
			items: items.map((row) => ({
				id: row.id,
				aspectId: row.aspectId,
				aspectName: row.aspectName,
				title: row.title,
				status: row.status,
				targetDate: row.targetDate,
				taskCount: Number(row.taskCount),
				completedAt: row.completedAt,
				createdAt: row.createdAt
			})),
			totalCount,
			cursor: hasMore ? String(nextOffset) : null,
			hasMore
		};
	}

	async deleteByAspectIds(aspectIds: string[]): Promise<number> {
		if (aspectIds.length === 0) return 0;
		const rows = await this.db
			.delete(milestones)
			.where(inArray(milestones.aspectId, aspectIds))
			.returning({ id: milestones.id });
		return rows.length;
	}
}
