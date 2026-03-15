// Service contract barrel — populated as service interfaces are defined

// Public service contracts
export type { IAuthService } from './auth-service.js';
export type { IProfileService } from './profile-service.js';
export type { IAspectService } from './aspect-service.js';
export type { IMilestoneService } from './milestone-service.js';
export type { ITaskService } from './task-service.js';
export type { IRecurrenceService } from './recurrence-service.js';
export type { IAvailabilityService } from './availability-service.js';
export type { IPlanningService } from './planning-service.js';
export type { IExecutionService } from './execution-service.js';
export type { IReminderService } from './reminder-service.js';
export type { IDataPortabilityService } from './data-portability-service.js';
export type { IAuditQueryService } from './audit-query-service.js';

// Private service contracts
export type { IIdentityProviderGateway } from './identity-provider-gateway.js';
export type { IRecurrenceMaterializer } from './recurrence-materializer.js';
export type { ISchedulerEngine } from './scheduler-engine.js';
export type { IAvailabilityWindowResolver } from './availability-window-resolver.js';
export type { IAspectTargetValidator } from './aspect-target-validator.js';
export type { IHealthComputationService } from './health-computation-service.js';
export type { IReminderDispatchService } from './reminder-dispatch-service.js';
export type { IAccountErasureService } from './account-erasure-service.js';
export type { IImportRemapService } from './import-remap-service.js';
