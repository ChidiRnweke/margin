export interface CreateTaskInput {
	aspectId: string;
	title: string;
	description?: string;
	effortMinutes?: number;
	dueDate?: string;
	importanceScore?: number;
	milestoneId?: string;
	splittableOverride?: boolean;
}

export interface UpdateTaskInput {
	title?: string;
	description?: string;
	effortMinutes?: number;
	remainingMinutes?: number;
	dueDate?: string | null;
	importanceScore?: number;
	splittableOverride?: boolean | null;
}

export interface TaskCompletionResult {
	task: unknown;
	nextRecurringTask?: unknown;
}

export interface BulkTaskMutationInput {
	action: string;
	taskIds: string[];
	params?: Record<string, unknown>;
}

export interface BulkTaskMutationResult {
	results: Array<{ taskId: string; success: boolean; error?: string }>;
}

export interface TaskQuery {
	status?: string[];
	aspectId?: string;
	search?: string;
	cursor?: string;
	limit?: number;
}

export interface ITaskService {
	createTask(userId: string, input: CreateTaskInput): Promise<unknown>;
	updateTask(
		userId: string,
		taskId: string,
		input: UpdateTaskInput,
		expectedVersion: number
	): Promise<unknown>;
	moveTaskMilestone(
		userId: string,
		taskId: string,
		milestoneIdOrNone: string | null,
		expectedVersion: number
	): Promise<unknown>;
	startTask(userId: string, taskId: string, expectedVersion: number): Promise<unknown>;
	completeTask(
		userId: string,
		taskId: string,
		expectedVersion: number
	): Promise<TaskCompletionResult>;
	reopenTask(userId: string, taskId: string, expectedVersion: number): Promise<unknown>;
	archiveTask(userId: string, taskId: string, expectedVersion: number): Promise<void>;
	restoreTask(userId: string, taskId: string, expectedVersion: number): Promise<unknown>;
	bulkMutateTasks(userId: string, input: BulkTaskMutationInput): Promise<BulkTaskMutationResult>;
	queryTasks(userId: string, query: TaskQuery): Promise<{ items: unknown[]; nextCursor?: string }>;
	getTaskDetail(userId: string, taskId: string): Promise<unknown>;
}
