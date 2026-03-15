export interface CreateAspectInput {
	name: string;
	purpose?: string;
}

export interface ActivateAspectInput {
	targetPercentage: number;
}

export interface UpdateAspectInput {
	name?: string;
	purpose?: string;
	targetPercentage?: number;
	defaultSplittable?: boolean;
}

export interface AspectQuery {
	cursor?: string;
	limit?: number;
}

export interface Page<T> {
	items: T[];
	nextCursor?: string;
}

export interface IAspectService {
	createAspect(userId: string, input: CreateAspectInput): Promise<unknown>;
	activateAspect(
		userId: string,
		aspectId: string,
		input: ActivateAspectInput,
		expectedVersion: number
	): Promise<unknown>;
	updateAspect(
		userId: string,
		aspectId: string,
		input: UpdateAspectInput,
		expectedVersion: number
	): Promise<unknown>;
	archiveAspect(userId: string, aspectId: string, expectedVersion: number): Promise<void>;
	restoreAspect(userId: string, aspectId: string, expectedVersion: number): Promise<unknown>;
	queryAspects(userId: string, query: AspectQuery): Promise<Page<unknown>>;
}
