import type { ITaskRepository } from '$lib/server/repositories/contracts/task-repository.js';
import type { IAspectRepository } from '$lib/server/repositories/contracts/aspect-repository.js';
import type { IMilestoneRepository } from '$lib/server/repositories/contracts/milestone-repository.js';
import type {
	ITaskService,
	CreateTaskInput,
	UpdateTaskInput,
	TaskCompletionResult,
	BulkTaskMutationInput,
	BulkTaskMutationResult,
	TaskQuery
} from '$lib/server/services/contracts/task-service.js';
import type { IRecurrenceMaterializer } from '$lib/server/services/contracts/recurrence-materializer.js';
import type { AuditEmitter } from '$lib/server/infra/audit/audit-emitter.js';
import type { Task } from '$lib/server/domain/models/task.js';
import { createTask, updateTask, startTask, completeTask, reopenTask } from '$lib/server/domain/models/task.js';
import { NotFoundError } from '$lib/server/errors/domain-errors.js';

export class TaskService implements ITaskService {
	constructor(
		private taskRepo: ITaskRepository,
		private aspectRepo: IAspectRepository,
		private milestoneRepo: IMilestoneRepository,
		private recurrenceMaterializer: IRecurrenceMaterializer,
		private auditEmitter: AuditEmitter
	) {}

	async createTask(userId: string, input: CreateTaskInput): Promise<Task> {
		const aspect = await this.aspectRepo.findById(input.aspectId);
		if (!aspect || aspect.userId !== userId) {
			throw new NotFoundError('Aspect', input.aspectId);
		}

		if (input.milestoneId) {
			const milestone = await this.milestoneRepo.findById(input.milestoneId);
			if (!milestone || milestone.aspectId !== input.aspectId) {
				throw new NotFoundError('Milestone', input.milestoneId);
			}
		}

		const task = createTask({
			id: crypto.randomUUID(),
			aspectId: input.aspectId,
			title: input.title,
			description: input.description,
			effortMinutes: input.effortMinutes ?? 30,
			dueDate: input.dueDate,
			importanceScore: input.importanceScore,
			milestoneId: input.milestoneId,
			splittableOverride: input.splittableOverride
		});

		return this.taskRepo.save(task, null);
	}

	async updateTask(
		userId: string,
		taskId: string,
		input: UpdateTaskInput,
		expectedVersion: number
	): Promise<Task> {
		const task = await this.loadOwnedTask(userId, taskId);
		const updated = updateTask(task, input);
		return this.taskRepo.save(updated, expectedVersion);
	}

	async moveTaskMilestone(
		userId: string,
		taskId: string,
		milestoneIdOrNone: string | null,
		expectedVersion: number
	): Promise<Task> {
		const task = await this.loadOwnedTask(userId, taskId);

		if (milestoneIdOrNone) {
			const milestone = await this.milestoneRepo.findById(milestoneIdOrNone);
			if (!milestone || milestone.aspectId !== task.aspectId) {
				throw new NotFoundError('Milestone', milestoneIdOrNone);
			}
		}

		const updated: Task = { ...task, milestoneId: milestoneIdOrNone, updatedAt: new Date() };
		return this.taskRepo.save(updated, expectedVersion);
	}

	async startTask(userId: string, taskId: string, expectedVersion: number): Promise<Task> {
		const task = await this.loadOwnedTask(userId, taskId);
		const started = startTask(task);
		return this.taskRepo.save(started, expectedVersion);
	}

	async completeTask(
		userId: string,
		taskId: string,
		expectedVersion: number
	): Promise<TaskCompletionResult> {
		const task = await this.loadOwnedTask(userId, taskId);
		const completed = completeTask(task);
		const saved = await this.taskRepo.save(completed, expectedVersion);

		await this.taskRepo.cancelPendingReminders(taskId);
		await this.taskRepo.cancelFutureAllocations(taskId);

		let nextRecurringTask: Task | undefined;
		if (task.recurringTaskSeriesId) {
			const result = await this.recurrenceMaterializer.generateNextInstance(taskId);
			if (result.generated && result.taskId) {
				nextRecurringTask = (await this.taskRepo.findById(result.taskId)) ?? undefined;
			}
		}

		return { task: saved, nextRecurringTask };
	}

	async reopenTask(userId: string, taskId: string, expectedVersion: number): Promise<Task> {
		const task = await this.loadOwnedTask(userId, taskId);
		const reopened = reopenTask(task);
		return this.taskRepo.save(reopened, expectedVersion);
	}

	async archiveTask(userId: string, taskId: string, expectedVersion: number): Promise<void> {
		await this.loadOwnedTask(userId, taskId);
		await this.taskRepo.archive(taskId, expectedVersion);
		await this.taskRepo.cancelPendingReminders(taskId);
		await this.taskRepo.cancelFutureAllocations(taskId);
	}

	async restoreTask(userId: string, taskId: string, expectedVersion: number): Promise<Task> {
		await this.loadOwnedTask(userId, taskId);
		return this.taskRepo.restoreToBacklog(taskId, expectedVersion);
	}

	async bulkMutateTasks(
		userId: string,
		input: BulkTaskMutationInput
	): Promise<BulkTaskMutationResult> {
		const results: BulkTaskMutationResult['results'] = [];

		for (const taskId of input.taskIds) {
			try {
				const task = await this.loadOwnedTask(userId, taskId);

				if (input.action === 'archive') {
					await this.taskRepo.archive(taskId, task.version);
					await this.taskRepo.cancelPendingReminders(taskId);
					await this.taskRepo.cancelFutureAllocations(taskId);
				} else if (input.action === 'restore') {
					await this.taskRepo.restoreToBacklog(taskId, task.version);
				}

				results.push({ taskId, success: true });
			} catch (e) {
				results.push({
					taskId,
					success: false,
					error: e instanceof Error ? e.message : 'Unknown error'
				});
			}
		}

		return { results };
	}

	async queryTasks(
		userId: string,
		query: TaskQuery
	): Promise<{ items: unknown[]; nextCursor?: string }> {
		const repoQuery = {
			...query,
			status: query.status?.join(',')
		};
		const page = await this.taskRepo.query(userId, repoQuery);
		return { items: page.items, nextCursor: page.cursor ?? undefined };
	}

	async getTaskDetail(userId: string, taskId: string): Promise<unknown> {
		const detail = await this.taskRepo.loadDetailProjection(taskId);
		if (!detail) throw new NotFoundError('Task', taskId);

		const aspect = await this.aspectRepo.findById(detail.task.aspectId);
		if (!aspect || aspect.userId !== userId) {
			throw new NotFoundError('Task', taskId);
		}

		return detail;
	}

	private async loadOwnedTask(userId: string, taskId: string): Promise<Task> {
		const task = await this.taskRepo.findById(taskId);
		if (!task) throw new NotFoundError('Task', taskId);

		const aspect = await this.aspectRepo.findById(task.aspectId);
		if (!aspect || aspect.userId !== userId) {
			throw new NotFoundError('Task', taskId);
		}

		return task;
	}
}
