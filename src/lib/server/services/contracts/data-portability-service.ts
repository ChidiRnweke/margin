export interface ExportPayload {
  version: string;
  exportedAt: string;
  data: Record<string, unknown[]>;
}

export interface ImportReport {
  createdEntities: number;
  conflictedEntitiesRemapped: number;
}

export interface IDataPortabilityService {
  exportUserData(userId: string): Promise<ExportPayload>;
  importUserData(userId: string, payload: unknown): Promise<ImportReport>;
}
