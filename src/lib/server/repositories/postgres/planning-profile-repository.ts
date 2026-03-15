import { eq, and, sql } from 'drizzle-orm';
import type { Database } from '$lib/server/db/index.js';
import { planningProfiles } from '$lib/server/db/schema/index.js';
import type { PlanningProfile } from '$lib/server/domain/models/planning-profile.js';
import type { IPlanningProfileRepository } from '$lib/server/repositories/contracts/planning-profile-repository.js';
import { NotFoundError, OptimisticConcurrencyError } from '$lib/server/errors/domain-errors.js';

export class PostgresPlanningProfileRepository implements IPlanningProfileRepository {
	constructor(private db: Database) {}

	private toDomain(row: typeof planningProfiles.$inferSelect): PlanningProfile {
		return {
			id: row.id,
			userId: row.userId,
			urgencyWeight: row.urgencyWeight,
			importanceWeight: row.importanceWeight,
			balanceWeight: row.balanceWeight,
			effortFitWeight: row.effortFitWeight,
			urgentThresholdDays: row.urgentThresholdDays,
			minChunkMinutes: row.minChunkMinutes,
			defaultEffortMinutes: row.defaultEffortMinutes,
			version: row.version,
			updatedAt: row.updatedAt
		};
	}

	async getByUserId(userId: string): Promise<PlanningProfile> {
		const rows = await this.db
			.select()
			.from(planningProfiles)
			.where(eq(planningProfiles.userId, userId))
			.limit(1);
		if (rows.length === 0) {
			throw new NotFoundError('PlanningProfile', userId);
		}
		return this.toDomain(rows[0]);
	}

	async save(profile: PlanningProfile, expectedVersion: number): Promise<PlanningProfile> {
		if (expectedVersion === 0) {
			const rows = await this.db
				.insert(planningProfiles)
				.values({
					id: profile.id,
					userId: profile.userId,
					urgencyWeight: profile.urgencyWeight,
					importanceWeight: profile.importanceWeight,
					balanceWeight: profile.balanceWeight,
					effortFitWeight: profile.effortFitWeight,
					urgentThresholdDays: profile.urgentThresholdDays,
					minChunkMinutes: profile.minChunkMinutes,
					defaultEffortMinutes: profile.defaultEffortMinutes,
					version: 1,
					updatedAt: profile.updatedAt
				})
				.returning();
			return this.toDomain(rows[0]);
		}

		const rows = await this.db
			.update(planningProfiles)
			.set({
				urgencyWeight: profile.urgencyWeight,
				importanceWeight: profile.importanceWeight,
				balanceWeight: profile.balanceWeight,
				effortFitWeight: profile.effortFitWeight,
				urgentThresholdDays: profile.urgentThresholdDays,
				minChunkMinutes: profile.minChunkMinutes,
				defaultEffortMinutes: profile.defaultEffortMinutes,
				version: sql`${planningProfiles.version} + 1`,
				updatedAt: profile.updatedAt
			})
			.where(
				and(
					eq(planningProfiles.id, profile.id),
					eq(planningProfiles.version, expectedVersion)
				)
			)
			.returning();

		if (rows.length === 0) {
			throw new OptimisticConcurrencyError('PlanningProfile', profile.id);
		}
		return this.toDomain(rows[0]);
	}
}
