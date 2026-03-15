import type {
	ITaskService,
	CreateTaskInput,
	UpdateTaskInput,
	BulkTaskMutationInput,
	TaskQuery
} from '$lib/server/services/contracts/task-service.js';

export class TaskController {
	constructor(private taskService: ITaskService) {}

	async createTask(userId: string, input: CreateTaskInput) {
		return this.taskService.createTask(userId, input);
	}

	async updateTask(
		userId: string,
		taskId: string,
		input: UpdateTaskInput,
		expectedVersion: number
	) {
		return this.taskService.updateTask(userId, taskId, input, expectedVersion);
	}

	async moveTaskMilestone(
		userId: string,
		taskId: string,
		milestoneIdOrNone: string | null,
		expectedVersion: number
	) {
		return this.taskService.moveTaskMilestone(userId, taskId, milestoneIdOrNone, expectedVersion);
	}

	async startTask(userId: string, taskId: string, expectedVersion: number) {
		return this.taskService.startTask(userId, taskId, expectedVersion);
	}

	async completeTask(userId: string, taskId: string, expectedVersion: number) {
		return this.taskService.completeTask(userId, taskId, expectedVersion);
	}

	async reopenTask(userId: string, taskId: string, expectedVersion: number) {
		return this.taskService.reopenTask(userId, taskId, expectedVersion);
	}

	async archiveTask(userId: string, taskId: string, expectedVersion: number) {
		return this.taskService.archiveTask(userId, taskId, expectedVersion);
	}

	async restoreTask(userId: string, taskId: string, expectedVersion: number) {
		return this.taskService.restoreTask(userId, taskId, expectedVersion);
	}

	async bulkMutateTasks(userId: string, input: BulkTaskMutationInput) {
		return this.taskService.bulkMutateTasks(userId, input);
	}

	async queryTasks(userId: string, query: TaskQuery) {
		return this.taskService.queryTasks(userId, query);
	}

	async getTaskDetail(userId: string, taskId: string) {
		return this.taskService.getTaskDetail(userId, taskId);
	}
}
