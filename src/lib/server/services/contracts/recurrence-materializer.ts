export interface GenerationResult {
	generated: boolean;
	taskId?: string;
	reason?: string;
}

export interface IRecurrenceMaterializer {
	generateNextInstance(completedTaskId: string): Promise<GenerationResult>;
}
