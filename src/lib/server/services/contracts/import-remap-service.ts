export interface RemappedImportGraph {
	remappedPayload: unknown;
	remappedCount: number;
}

export interface IImportRemapService {
	remapImportGraph(payload: unknown, userId: string): Promise<RemappedImportGraph>;
}
