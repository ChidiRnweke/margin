import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	return {
		stats: {
			totalAspects: 0,
			activeAspects: 0,
			totalTasks: 0,
			overdueTasks: 0,
			tasksInProgress: 0,
			tasksDone: 0,
			currentWeekCycleStatus: null,
			upcomingReminders: []
		}
	};
};
