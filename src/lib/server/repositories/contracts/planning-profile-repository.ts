import type { PlanningProfile } from '$lib/server/domain/models/planning-profile.js';

export interface IPlanningProfileRepository {
	getByUserId(userId: string): Promise<PlanningProfile>;
	save(profile: PlanningProfile, expectedVersion: number): Promise<PlanningProfile>;
}
