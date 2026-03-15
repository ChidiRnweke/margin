import { NonNegativeMinutes } from '../value-objects/bounded-int.js';

export interface AspectCycleHealth {
	readonly id: string;
	readonly planningCycleId: string;
	readonly aspectId: string;
	readonly targetMinutes: number;
	readonly completedMinutes: number;
	readonly healthScore: number;
	readonly computedAt: Date;
}

export function createAspectCycleHealth(params: {
	id: string;
	planningCycleId: string;
	aspectId: string;
	targetMinutes: number;
	completedMinutes: number;
	healthScore: number;
}): AspectCycleHealth {
	new NonNegativeMinutes(params.targetMinutes);
	new NonNegativeMinutes(params.completedMinutes);
	return { ...params, computedAt: new Date() };
}
