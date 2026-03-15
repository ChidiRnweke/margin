import { eq, and, sql, ilike, count, desc, asc } from 'drizzle-orm';
import type { Database } from '$lib/server/db/index.js';
import { aspects, tasks } from '$lib/server/db/schema/index.js';
import type { Aspect } from '$lib/server/domain/models/aspect.js';
import type {
	IAspectRepository,
	AspectQuery,
	AspectSummary
} from '$lib/server/repositories/contracts/aspect-repository.js';
import type { Page } from '$lib/server/repositories/contracts/query-models.js';
import { OptimisticConcurrencyError } from '$lib/server/errors/domain-errors.js';

const DEFAULT_LIMIT = 25;

export class PostgresAspectRepository implements IAspectRepository {
	constructor(private db: Database) {}

	private toDomain(row: typeof aspects.$inferSelect): Aspect {
		return {
			id: row.id,
			userId: row.userId,
			name: row.name,
			purpose: row.purpose,
			status: row.status,
			targetPercentage: row.targetPercentage,
			defaultSplittable: row.defaultSplittable,
			version: row.version,
			createdAt: row.createdAt,
			archivedAt: row.archivedAt
		};
	}

	async findById(aspectId: string): Promise<Aspect | null> {
		const rows = await this.db.select().from(aspects).where(eq(aspects.id, aspectId)).limit(1);
		return rows.length > 0 ? this.toDomain(rows[0]) : null;
	}

	async save(aspect: Aspect, expectedVersion: number | null): Promise<Aspect> {
		if (expectedVersion === null) {
			const rows = await this.db
				.insert(aspects)
				.values({
					id: aspect.id,
					userId: aspect.userId,
					name: aspect.name,
					purpose: aspect.purpose,
					status: aspect.status,
					targetPercentage: aspect.targetPercentage,
					defaultSplittable: aspect.defaultSplittable,
					version: 1,
					createdAt: aspect.createdAt,
					archivedAt: aspect.archivedAt
				})
				.returning();
			return this.toDomain(rows[0]);
		}

		const rows = await this.db
			.update(aspects)
			.set({
				name: aspect.name,
				purpose: aspect.purpose,
				status: aspect.status,
				targetPercentage: aspect.targetPercentage,
				defaultSplittable: aspect.defaultSplittable,
				version: sql`${aspects.version} + 1`,
				archivedAt: aspect.archivedAt
			})
			.where(and(eq(aspects.id, aspect.id), eq(aspects.version, expectedVersion)))
			.returning();

		if (rows.length === 0) {
			throw new OptimisticConcurrencyError('Aspect', aspect.id);
		}
		return this.toDomain(rows[0]);
	}

	async archive(aspectId: string, expectedVersion: number): Promise<void> {
		const rows = await this.db
			.update(aspects)
			.set({
				status: 'Archived',
				archivedAt: new Date(),
				version: sql`${aspects.version} + 1`
			})
			.where(and(eq(aspects.id, aspectId), eq(aspects.version, expectedVersion)))
			.returning();

		if (rows.length === 0) {
			throw new OptimisticConcurrencyError('Aspect', aspectId);
		}
	}

	async restoreToDraft(aspectId: string, expectedVersion: number): Promise<Aspect> {
		const rows = await this.db
			.update(aspects)
			.set({
				status: 'Draft',
				archivedAt: null,
				targetPercentage: null,
				version: sql`${aspects.version} + 1`
			})
			.where(and(eq(aspects.id, aspectId), eq(aspects.version, expectedVersion)))
			.returning();

		if (rows.length === 0) {
			throw new OptimisticConcurrencyError('Aspect', aspectId);
		}
		return this.toDomain(rows[0]);
	}

	async query(userId: string, query: AspectQuery): Promise<Page<AspectSummary>> {
		const limit = query.limit ?? DEFAULT_LIMIT;
		const offset = query.cursor ? parseInt(query.cursor, 10) : 0;

		const conditions = [eq(aspects.userId, userId)];
		if (query.status) {
			conditions.push(eq(aspects.status, query.status));
		}
		if (query.search) {
			conditions.push(ilike(aspects.name, `%${query.search}%`));
		}

		const whereClause = and(...conditions);

		const taskCountSq = this.db
			.select({ cnt: count().as('cnt') })
			.from(tasks)
			.where(eq(tasks.aspectId, aspects.id))
			.as('task_count');

		const [countResult, items] = await Promise.all([
			this.db.select({ total: count() }).from(aspects).where(whereClause),
			this.db
				.select({
					id: aspects.id,
					name: aspects.name,
					status: aspects.status,
					targetPercentage: aspects.targetPercentage,
					taskCount: sql<number>`(SELECT count(*) FROM tasks WHERE tasks.aspect_id = ${aspects.id})`,
					createdAt: aspects.createdAt
				})
				.from(aspects)
				.where(whereClause)
				.orderBy(
					query.sortDirection === 'asc' ? asc(aspects.createdAt) : desc(aspects.createdAt)
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
				name: row.name,
				status: row.status,
				targetPercentage: row.targetPercentage,
				taskCount: Number(row.taskCount),
				createdAt: row.createdAt
			})),
			totalCount,
			cursor: hasMore ? String(nextOffset) : null,
			hasMore
		};
	}

	async listActiveForUser(userId: string): Promise<Aspect[]> {
		const rows = await this.db
			.select()
			.from(aspects)
			.where(and(eq(aspects.userId, userId), eq(aspects.status, 'Active')));
		return rows.map((row) => this.toDomain(row));
	}

	async deleteByUserId(userId: string): Promise<number> {
		const rows = await this.db
			.delete(aspects)
			.where(eq(aspects.userId, userId))
			.returning({ id: aspects.id });
		return rows.length;
	}
}
