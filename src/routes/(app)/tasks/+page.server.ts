import type { PageServerLoad } from './$types';

interface Task {
	id: string;
	title: string;
	description: string;
	status: 'todo' | 'in_progress' | 'done' | 'archived';
	effort: number;
	aspectName?: string;
	aspectColor?: string;
	dueDate?: string | null;
}

export const load: PageServerLoad = async () => {
	return {
		tasks: [] as Task[],
		totalCount: 0
	};
};
