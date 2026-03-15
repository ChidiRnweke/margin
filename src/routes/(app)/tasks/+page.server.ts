import type { PageServerLoad } from './$types';
import { loadTaskWorkspace, taskActions } from './task-server.js';

export const load: PageServerLoad = async (event) => loadTaskWorkspace(event);

export const actions = taskActions;
