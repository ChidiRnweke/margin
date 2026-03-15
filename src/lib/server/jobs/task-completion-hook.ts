import type { IRecurrenceMaterializer } from '$lib/server/services/contracts/recurrence-materializer.js';

export class TaskCompletionHook {
	constructor(private materializer: IRecurrenceMaterializer) {}

	async execute(taskId: string) {
		return this.materializer.generateNextInstance(taskId);
	}
}
