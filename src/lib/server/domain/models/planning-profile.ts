import {
	PlannerWeight,
	UrgentThresholdDays,
	MinChunkMinutes,
	PositiveMinutes
} from '../value-objects/bounded-int.js';

export interface PlanningProfile {
	readonly id: string;
	readonly userId: string;
	readonly urgencyWeight: number;
	readonly importanceWeight: number;
	readonly balanceWeight: number;
	readonly effortFitWeight: number;
	readonly urgentThresholdDays: number;
	readonly minChunkMinutes: number;
	readonly defaultEffortMinutes: number;
	readonly version: number;
	readonly updatedAt: Date;
}

export function createDefaultPlanningProfile(userId: string): PlanningProfile {
	return {
		id: crypto.randomUUID(),
		userId,
		urgencyWeight: 25,
		importanceWeight: 25,
		balanceWeight: 25,
		effortFitWeight: 25,
		urgentThresholdDays: 7,
		minChunkMinutes: 15,
		defaultEffortMinutes: 30,
		version: 1,
		updatedAt: new Date()
	};
}

export function updatePlanningProfile(
	profile: PlanningProfile,
	input: {
		urgencyWeight?: number;
		importanceWeight?: number;
		balanceWeight?: number;
		effortFitWeight?: number;
		urgentThresholdDays?: number;
		minChunkMinutes?: number;
		defaultEffortMinutes?: number;
	}
): PlanningProfile {
	if (input.urgencyWeight !== undefined) new PlannerWeight(input.urgencyWeight);
	if (input.importanceWeight !== undefined) new PlannerWeight(input.importanceWeight);
	if (input.balanceWeight !== undefined) new PlannerWeight(input.balanceWeight);
	if (input.effortFitWeight !== undefined) new PlannerWeight(input.effortFitWeight);
	if (input.urgentThresholdDays !== undefined) new UrgentThresholdDays(input.urgentThresholdDays);
	if (input.minChunkMinutes !== undefined) new MinChunkMinutes(input.minChunkMinutes);
	if (input.defaultEffortMinutes !== undefined) new PositiveMinutes(input.defaultEffortMinutes);

	return {
		...profile,
		urgencyWeight: input.urgencyWeight ?? profile.urgencyWeight,
		importanceWeight: input.importanceWeight ?? profile.importanceWeight,
		balanceWeight: input.balanceWeight ?? profile.balanceWeight,
		effortFitWeight: input.effortFitWeight ?? profile.effortFitWeight,
		urgentThresholdDays: input.urgentThresholdDays ?? profile.urgentThresholdDays,
		minChunkMinutes: input.minChunkMinutes ?? profile.minChunkMinutes,
		defaultEffortMinutes: input.defaultEffortMinutes ?? profile.defaultEffortMinutes,
		updatedAt: new Date()
	};
}
