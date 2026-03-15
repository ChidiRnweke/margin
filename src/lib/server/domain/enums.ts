export const AspectStatus = {
  Draft: 'Draft',
  Active: 'Active',
  Archived: 'Archived',
} as const;
export type AspectStatus = (typeof AspectStatus)[keyof typeof AspectStatus];

export const MilestoneStatus = {
  Open: 'Open',
  Done: 'Done',
  Archived: 'Archived',
} as const;
export type MilestoneStatus = (typeof MilestoneStatus)[keyof typeof MilestoneStatus];

export const TaskStatus = {
  Backlog: 'Backlog',
  InProgress: 'InProgress',
  Done: 'Done',
  Archived: 'Archived',
} as const;
export type TaskStatus = (typeof TaskStatus)[keyof typeof TaskStatus];

export const RecurringSeriesStatus = {
  Active: 'Active',
  Paused: 'Paused',
  Closed: 'Closed',
} as const;
export type RecurringSeriesStatus = (typeof RecurringSeriesStatus)[keyof typeof RecurringSeriesStatus];

export const RecurrenceFrequency = {
  Daily: 'Daily',
  Weekly: 'Weekly',
  Monthly: 'Monthly',
} as const;
export type RecurrenceFrequency = (typeof RecurrenceFrequency)[keyof typeof RecurrenceFrequency];

export const RecurrenceExceptionAction = {
  Skip: 'Skip',
  Move: 'Move',
} as const;
export type RecurrenceExceptionAction = (typeof RecurrenceExceptionAction)[keyof typeof RecurrenceExceptionAction];

export const AvailabilityKind = {
  OneOff: 'OneOff',
  Recurring: 'Recurring',
} as const;
export type AvailabilityKind = (typeof AvailabilityKind)[keyof typeof AvailabilityKind];

export const AvailabilityExceptionAction = {
  Skip: 'Skip',
  Override: 'Override',
} as const;
export type AvailabilityExceptionAction = (typeof AvailabilityExceptionAction)[keyof typeof AvailabilityExceptionAction];

export const PlanningCycleStatus = {
  Draft: 'Draft',
  Confirmed: 'Confirmed',
} as const;
export type PlanningCycleStatus = (typeof PlanningCycleStatus)[keyof typeof PlanningCycleStatus];

export const PlanningRevisionStatus = {
  Active: 'Active',
  Superseded: 'Superseded',
} as const;
export type PlanningRevisionStatus = (typeof PlanningRevisionStatus)[keyof typeof PlanningRevisionStatus];

export const AllocationStatus = {
  Proposed: 'Proposed',
  Confirmed: 'Confirmed',
  Cancelled: 'Cancelled',
} as const;
export type AllocationStatus = (typeof AllocationStatus)[keyof typeof AllocationStatus];

export const AllocationOutcomeStatus = {
  Attended: 'Attended',
  Missed: 'Missed',
} as const;
export type AllocationOutcomeStatus = (typeof AllocationOutcomeStatus)[keyof typeof AllocationOutcomeStatus];

export const ReminderChannel = {
  InApp: 'in_app',
  Email: 'email',
} as const;
export type ReminderChannel = (typeof ReminderChannel)[keyof typeof ReminderChannel];

export const ReminderStatus = {
  Pending: 'Pending',
  Sent: 'Sent',
  Failed: 'Failed',
  Cancelled: 'Cancelled',
} as const;
export type ReminderStatus = (typeof ReminderStatus)[keyof typeof ReminderStatus];

export const ReminderAttemptResult = {
  Sent: 'Sent',
  Failed: 'Failed',
} as const;
export type ReminderAttemptResult = (typeof ReminderAttemptResult)[keyof typeof ReminderAttemptResult];

export const SessionStatus = {
  Active: 'Active',
  Revoked: 'Revoked',
  Expired: 'Expired',
} as const;
export type SessionStatus = (typeof SessionStatus)[keyof typeof SessionStatus];

export const PrincipalType = {
  UserSession: 'UserSession',
  ServicePrincipal: 'ServicePrincipal',
} as const;
export type PrincipalType = (typeof PrincipalType)[keyof typeof PrincipalType];

export const JobStatus = {
  Running: 'Running',
  Succeeded: 'Succeeded',
  Failed: 'Failed',
} as const;
export type JobStatus = (typeof JobStatus)[keyof typeof JobStatus];

export const ExportFormat = {
  Json: 'json',
} as const;
export type ExportFormat = (typeof ExportFormat)[keyof typeof ExportFormat];
