// Query models
export type {
	PaginationQuery,
	Page,
	DashboardProjection,
	AvailabilitySlot,
	ExportPayload
} from './query-models.js';

// Identity & Profile
export type { IUserRepository } from './user-repository.js';
export type { ISessionRepository } from './session-repository.js';
export type { IPlanningProfileRepository } from './planning-profile-repository.js';

// Aspect, Milestone, Task
export type { AspectQuery, AspectSummary, IAspectRepository } from './aspect-repository.js';
export type {
	MilestoneQuery,
	MilestoneSummary,
	IMilestoneRepository
} from './milestone-repository.js';
export type {
	TaskQuery,
	TaskListItem,
	TaskDetailProjection,
	ITaskRepository
} from './task-repository.js';

// Recurrence, Availability, Planning
export type {
	RecurringTaskSeriesAggregate,
	IRecurringSeriesRepository
} from './recurring-series-repository.js';
export type {
	AvailabilityAggregate,
	DateRange,
	IAvailabilityRepository
} from './availability-repository.js';
export type {
	PlanningCycleAggregate,
	PlanningCycleHistoryItem,
	PlanningCycleQuery,
	DraftRevisionInput,
	RevisionEditInput,
	OutcomeInput,
	IPlanningCycleRepository
} from './planning-cycle-repository.js';

// Reminder & Operational
export type { ReminderAggregate, IReminderRepository } from './reminder-repository.js';
export type { IImportJobRepository } from './import-job-repository.js';
export type { AuditQuery, IAuditEventRepository } from './audit-event-repository.js';
export type { IIdempotencyKeyRepository } from './idempotency-key-repository.js';
export type { ISystemJobRunRepository } from './system-job-run-repository.js';
