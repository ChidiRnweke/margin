import type { PageServerLoad } from './$types';
import { loadTaskDetail } from '../task-server.js';

export const load: PageServerLoad = async (event) => {
	const task = await loadTaskDetail(event, event.params.id);

	return {
		task,
		returnTo: `/tasks?task=${task.id}`
	};
};
