import type {
	IDataPortabilityService,
	ExportPayload,
	ImportReport
} from '$lib/server/services/contracts/data-portability-service.js';
import type { IUserRepository } from '$lib/server/repositories/contracts/user-repository.js';
import type { IAspectRepository } from '$lib/server/repositories/contracts/aspect-repository.js';
import type { ITaskRepository } from '$lib/server/repositories/contracts/task-repository.js';
import type { IImportJobRepository } from '$lib/server/repositories/contracts/import-job-repository.js';
import type { IImportRemapService } from '$lib/server/services/contracts/import-remap-service.js';
import { createImportJob } from '$lib/server/domain/models/import-job.js';
import { NotFoundError } from '$lib/server/errors/domain-errors.js';

export class DataPortabilityService implements IDataPortabilityService {
	constructor(
		private userRepo: IUserRepository,
		private aspectRepo: IAspectRepository,
		private taskRepo: ITaskRepository,
		private importJobRepo: IImportJobRepository,
		private importRemapService: IImportRemapService
	) {}

	async exportUserData(userId: string): Promise<ExportPayload> {
		const user = await this.userRepo.findById(userId);
		if (!user) throw new NotFoundError('User', userId);

		const aspects = await this.aspectRepo.listActiveForUser(userId);

		return {
			version: '1.0',
			exportedAt: new Date().toISOString(),
			data: {
				aspects: aspects as unknown as unknown[]
			}
		};
	}

	async importUserData(userId: string, payload: unknown): Promise<ImportReport> {
		const job = createImportJob({ id: crypto.randomUUID(), userId });
		await this.importJobRepo.createRunning(job);

		try {
			const { remappedCount } = await this.importRemapService.remapImportGraph(
				payload,
				userId
			);

			await this.importJobRepo.markSucceeded(job.id, {
				createdEntities: remappedCount,
				conflictedEntitiesRemapped: 0
			});

			return { createdEntities: remappedCount, conflictedEntitiesRemapped: 0 };
		} catch (e) {
			await this.importJobRepo.markFailed(
				job.id,
				e instanceof Error ? e.message : 'Unknown error'
			);
			throw e;
		}
	}
}
