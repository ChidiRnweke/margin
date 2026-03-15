import type { PageServerLoad } from './$types';

interface Allocation {
	title: string;
	aspect: string;
	aspectColor: string;
	startHour: number;
	duration: number;
	dayIndex: number;
	day: string;
	time: string;
	outcome: 'done' | 'skipped' | 'partial' | null;
}

interface AvailabilityWindow {
	dayIndex: number;
	startHour: number;
	endHour: number;
}

export const load: PageServerLoad = async () => {
	return {
		weekStart: new Date().toISOString(),
		allocations: [] as Allocation[],
		availability: [] as AvailabilityWindow[],
		status: 'draft' as const
	};
};
