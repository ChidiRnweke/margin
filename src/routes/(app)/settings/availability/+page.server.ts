import type { PageServerLoad } from './$types';

interface AvailabilityBlock {
	id: string;
	dayIndex: number;
	startHour: number;
	endHour: number;
	label?: string;
}

export const load: PageServerLoad = async () => {
	return {
		blocks: [] as AvailabilityBlock[]
	};
};
