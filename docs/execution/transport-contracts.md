# Transport Contracts

> **v1 Status:** All contracts implemented. ✅

## Page Loader DTOs

### DashboardPageData — Implemented

- `kpiSummary`: `{ totalAvailableMinutes: number, plannedMinutes: number, completedMinutes: number }`
- `aspectHealthSummary`: `Array<{ aspectId: string, aspectName: string, healthScore: number, color: string }>`
- `todayScheduleBlocks`: `Array<{ allocationId: string, taskId: string, taskTitle: string, aspectName: string, startUtc: string, endUtc: string, allocatedMinutes: number, status: AllocationStatus, outcome?: AllocationOutcomeStatus }>`
- `upcomingTaskSummaries`: `Array<{ taskId: string, title: string, aspectName: string, dueDate?: string, effortMinutes: number, status: TaskStatus }>`

### AspectsPageData — Implemented

- `aspects`: `{ items: Array<AspectSummary>, nextCursor?: string }`
- `canCreate`: `boolean`

### AspectDetailPageData — Implemented

- `aspect`: `Aspect`
- `overview`: `{ healthScore?: number, taskCount: number, completedTaskCount: number }`
- `milestones`: `Array<MilestoneSummary>`
- `tasks`: `{ items: Array<TaskListItem>, nextCursor?: string }`
- `activeTab`: `'overview' | 'milestones' | 'tasks'`

### TasksPageData — Implemented

- `tasks`: `{ items: Array<TaskListItem>, nextCursor?: string }`
- `filters`: `{ status?: TaskStatus[], aspectId?: string, search?: string }`
- `selectedTaskId`: `string | null`

### TaskDetailPageData — Implemented

- `task`: `TaskDetail`
- `milestoneSummary`: `{ id: string, title: string } | null`
- `recurrenceSection`: `{ seriesId?: string, rule?: RecurrenceRuleSummary, nextOccurrence?: string, exceptions?: RecurrenceExceptionSummary[] } | null`
- `reminderSection`: `{ reminders: Array<ReminderSummary> }`
- `allocationSummary`: `{ upcoming: Array<AllocationSummary>, past: Array<AllocationSummary> }`

### PlanPageData — Implemented

- `cycleSummary`: `{ cycleId?: string, weekStart: string, weekEnd: string, status?: PlanningCycleStatus, currentRevisionNumber?: number }`
- `currentRevisionSummary`: `{ revisionId?: string, revisionNumber?: number, allocations: Array<AllocationBlock> } | null`
- `availabilityLanes`: `Array<EffectiveWindow>`
- `allocationBlocks`: `Array<AllocationBlock>`
- `affordances`: `{ canGenerate: boolean, canConfirm: boolean, canRegenerate: boolean }`

### PlanHistoryPageData — Implemented

- `revisions`: `{ items: Array<PlanningRevisionHistoryItem>, nextCursor?: string }`

### AvailabilitySettingsPageData — Implemented

- `effectiveWindows`: `Array<EffectiveWindow>`
- `sourceBlocks`: `Array<AvailabilityBlockSummary>`
- `exceptions`: `Array<AvailabilityExceptionSummary>`

### ProfileSettingsPageData — Implemented

- `profile`: `PlanningProfile`
- `baseline`: `PlanningProfile`

### AccountSettingsPageData — Implemented

- `user`: `{ email: string, displayName: string, timezone: string, createdAt: string }`
- `canLogout`: `boolean`
- `canDeleteAccount`: `boolean`

### DataSettingsPageData — Implemented

- `exportAvailable`: `boolean`
- `activeImportJob`: `{ jobId: string, status: JobStatus, summary?: ImportSummary, errors?: string[] } | null`

### AuditSettingsPageData — Implemented

- `auditEvents`: `{ items: Array<AuditEventSummary>, nextCursor?: string }`

## API Endpoint Contracts

### Mutation Endpoints (POST/PATCH/PUT/DELETE)

All mutation endpoints accept optional `Idempotency-Key` header.
All mutation endpoints require authenticated session.
All mutation responses include `version` for optimistic concurrency.

#### POST /(app)/api/aspects — Implemented

- Request: `{ name: string, purpose?: string }`
- Response: `{ aspect: Aspect }`
- Errors: `VALIDATION_FAILED`

#### POST /(app)/api/aspects/[id]/activate — Implemented

- Request: `{ targetPercentage: number, expectedVersion: number }`
- Response: `{ aspect: Aspect }`
- Errors: `STATE_TRANSITION_INVALID`, `VALIDATION_FAILED`, `CONFLICT_STALE_WRITE`

#### PATCH /(app)/api/aspects/[id] — Implemented

- Request: `{ name?: string, purpose?: string, targetPercentage?: number, defaultSplittable?: boolean, expectedVersion: number }`
- Response: `{ aspect: Aspect }`
- Errors: `VALIDATION_FAILED`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`

#### POST /(app)/api/aspects/[id]/archive — Implemented

- Request: `{ expectedVersion: number }`
- Response: `204 No Content`
- Errors: `STATE_TRANSITION_INVALID`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`

#### POST /(app)/api/aspects/[id]/restore — Implemented

- Request: `{ expectedVersion: number }`
- Response: `{ aspect: Aspect }`
- Errors: `STATE_TRANSITION_INVALID`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`

#### GET /(app)/api/aspects — Implemented

- Query: `{ cursor?: string, limit?: number }`
- Response: `{ items: Array<AspectSummary>, nextCursor?: string }`
- Errors: `QUERY_CURSOR_INVALID`

#### POST /(app)/api/milestones — Implemented

- Request: `{ aspectId: string, title: string, description?: string, targetDate?: string }`
- Response: `{ milestone: Milestone }`
- Errors: `VALIDATION_FAILED`, `NOT_FOUND`

#### PATCH /(app)/api/milestones/[id] — Implemented

- Request: `{ title?: string, description?: string, targetDate?: string, expectedVersion: number }`
- Response: `{ milestone: Milestone }`
- Errors: `VALIDATION_FAILED`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`

#### POST /(app)/api/milestones/[id]/complete — Implemented

- Request: `{ expectedVersion: number }`
- Response: `{ milestone: Milestone }`
- Errors: `STATE_TRANSITION_INVALID`, `CONFLICT_STALE_WRITE`

#### POST /(app)/api/milestones/[id]/reopen — Implemented

- Request: `{ expectedVersion: number }`
- Response: `{ milestone: Milestone }`
- Errors: `STATE_TRANSITION_INVALID`, `CONFLICT_STALE_WRITE`

#### POST /(app)/api/milestones/[id]/archive — Implemented

- Request: `{ expectedVersion: number }`
- Response: `204 No Content`
- Errors: `STATE_TRANSITION_INVALID`, `CONFLICT_STALE_WRITE`

#### POST /(app)/api/milestones/[id]/restore — Implemented

- Request: `{ expectedVersion: number }`
- Response: `{ milestone: Milestone }`
- Errors: `STATE_TRANSITION_INVALID`, `CONFLICT_STALE_WRITE`

#### GET /(app)/api/milestones — Implemented

- Query: `{ aspectId?: string, cursor?: string, limit?: number }`
- Response: `{ items: Array<MilestoneSummary>, nextCursor?: string }`
- Errors: `QUERY_CURSOR_INVALID`

#### POST /(app)/api/tasks — Implemented

- Request: `{ aspectId: string, title: string, description?: string, effortMinutes?: number, dueDate?: string, importanceScore?: number, milestoneId?: string, splittableOverride?: boolean }`
- Response: `{ task: Task }`
- Errors: `VALIDATION_FAILED`, `NOT_FOUND`

#### PATCH /(app)/api/tasks/[id] — Implemented

- Request: `{ title?: string, description?: string, effortMinutes?: number, remainingMinutes?: number, dueDate?: string | null, importanceScore?: number, splittableOverride?: boolean | null, expectedVersion: number }`
- Response: `{ task: Task }`
- Errors: `VALIDATION_FAILED`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`

#### POST /(app)/api/tasks/[id]/move — Implemented

- Request: `{ milestoneId: string | null, expectedVersion: number }`
- Response: `{ task: Task }`
- Errors: `VALIDATION_FAILED`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`

#### POST /(app)/api/tasks/[id]/start — Implemented

- Request: `{ expectedVersion: number }`
- Response: `{ task: Task }`
- Errors: `STATE_TRANSITION_INVALID`, `CONFLICT_STALE_WRITE`

#### POST /(app)/api/tasks/[id]/complete — Implemented

- Request: `{ expectedVersion: number }`
- Response: `{ task: Task, nextRecurringTask?: Task }`
- Errors: `STATE_TRANSITION_INVALID`, `CONFLICT_STALE_WRITE`

#### POST /(app)/api/tasks/[id]/reopen — Implemented

- Request: `{ expectedVersion: number }`
- Response: `{ task: Task }`
- Errors: `STATE_TRANSITION_INVALID`, `CONFLICT_STALE_WRITE`

#### POST /(app)/api/tasks/[id]/archive — Implemented

- Request: `{ expectedVersion: number }`
- Response: `204 No Content`
- Errors: `STATE_TRANSITION_INVALID`, `CONFLICT_STALE_WRITE`

#### POST /(app)/api/tasks/[id]/restore — Implemented

- Request: `{ expectedVersion: number }`
- Response: `{ task: Task }`
- Errors: `STATE_TRANSITION_INVALID`, `CONFLICT_STALE_WRITE`

#### POST /(app)/api/tasks/bulk — Implemented

- Request: `{ action: string, taskIds: string[], params?: Record<string, unknown> }`
- Response: `{ results: Array<{ taskId: string, success: boolean, error?: string }> }`
- Errors: `VALIDATION_FAILED`

#### GET /(app)/api/tasks — Implemented

- Query: `{ status?: string, aspectId?: string, search?: string, cursor?: string, limit?: number }`
- Response: `{ items: Array<TaskListItem>, nextCursor?: string }`
- Errors: `QUERY_CURSOR_INVALID`

#### GET /(app)/api/tasks/[id] — Implemented

- Response: `TaskDetailPageData`
- Errors: `NOT_FOUND`, `OWNERSHIP_VIOLATION`

#### PUT /(app)/api/recurrence — Implemented

- Request: `{ aspectId: string, milestoneId?: string, titleTemplate: string, descriptionTemplate?: string, effortMinutesTemplate: number, importanceScoreTemplate: number, splittableOverride?: boolean, frequency: string, interval: number, weekdayMask?: number, monthDay?: number, anchorDateLocal: string, endsOn?: string, expectedVersion?: number }`
- Response: `{ series: RecurringTaskSeries }`
- Errors: `VALIDATION_FAILED`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`

#### POST /(app)/api/recurrence/[id]/toggle — Implemented

- Request: `{ paused: boolean, expectedVersion: number }`
- Response: `{ series: RecurringTaskSeries }`
- Errors: `STATE_TRANSITION_INVALID`, `CONFLICT_STALE_WRITE`

#### POST /(app)/api/recurrence/[id]/exception — Implemented

- Request: `{ action: 'Skip' | 'Move', occurrenceDateLocal: string, overrideDateLocal?: string, expectedVersion: number }`
- Response: `{ exception: RecurrenceException }`
- Errors: `VALIDATION_FAILED`, `CONFLICT_STALE_WRITE`

#### POST /(app)/api/recurrence/[id]/close — Implemented

- Request: `{ expectedVersion: number }`
- Response: `{ series: RecurringTaskSeries }`
- Errors: `STATE_TRANSITION_INVALID`, `CONFLICT_STALE_WRITE`

#### POST /(app)/api/availability — Implemented

- Request: `{ kind: 'OneOff' | 'Recurring', oneOffStartsAtUtc?: string, oneOffEndsAtUtc?: string, localStartMinute?: number, localEndMinute?: number, weekdayMask?: number, startsOnLocal?: string, endsOnLocal?: string }`
- Response: `{ block: AvailabilityBlock }`
- Errors: `VALIDATION_FAILED`

#### POST /(app)/api/availability/[id]/exception — Implemented

- Request: `{ exceptionDate: string, action: 'Skip' | 'Override', overrideStartsAtUtc?: string, overrideEndsAtUtc?: string, overrideLocalStartMinute?: number, overrideLocalEndMinute?: number }`
- Response: `{ exception: AvailabilityException }`
- Errors: `VALIDATION_FAILED`, `NOT_FOUND`

#### PATCH /(app)/api/availability/[id] — Implemented

- Request: `{ active?: boolean, expectedVersion: number }` (archive/restore/update)
- Response: `{ block: AvailabilityBlock }`
- Errors: `NOT_FOUND`, `CONFLICT_STALE_WRITE`

#### GET /(app)/api/availability — Implemented

- Query: `{ rangeStart: string, rangeEnd: string }`
- Response: `{ windows: Array<EffectiveWindow> }`

#### POST /(app)/api/planning/generate — Implemented

- Request: `{ weekStart: string }`
- Response: `{ draft: PlanningDraftResult }`
- Errors: `TARGET_PERCENT_TOTAL_INVALID`, `VALIDATION_FAILED`

#### POST /(app)/api/planning/[id]/confirm — Implemented

- Request: `{ expectedVersion: number }`
- Response: `{ cycle: PlanningCycle }`
- Errors: `STATE_TRANSITION_INVALID`, `CONFLICT_STALE_WRITE`

#### POST /(app)/api/planning/[id]/regenerate — Implemented

- Request: `{ expectedVersion: number }`
- Response: `{ cycle: PlanningCycle }`
- Errors: `CONFLICT_STALE_WRITE`

#### POST /(app)/api/planning/[id]/edit — Implemented

- Request: `{ edits: Array<AllocationEdit>, expectedVersion: number }`
- Response: `{ revision: PlanningRevisionSnapshot }`
- Errors: `LOCK_CONFLICT`, `CONFLICT_STALE_WRITE`

#### GET /(app)/api/planning — Implemented

- Query: `{ cursor?: string, limit?: number }`
- Response: `{ items: Array<PlanningCycleHistoryItem>, nextCursor?: string }`
- Errors: `QUERY_CURSOR_INVALID`

#### POST /(app)/api/execution/[id]/outcome — Implemented

- Request: `{ outcome: 'Attended' | 'Missed', expectedVersion: number }`
- Response: `{ outcome: AllocationOutcome }`
- Errors: `VALIDATION_FAILED`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`

#### PUT /(app)/api/reminders — Implemented

- Request: `{ taskId: string, remindAtUtc: string, channel: 'in_app' | 'email', expectedVersion?: number }`
- Response: `{ reminder: Reminder }`
- Errors: `VALIDATION_FAILED`, `NOT_FOUND`

#### POST /(app)/api/reminders/[id]/snooze — Implemented

- Request: `{ snoozeMinutes: number, expectedVersion: number }`
- Response: `{ reminder: Reminder }`
- Errors: `SNOOZE_LIMIT_EXCEEDED`, `CONFLICT_STALE_WRITE`

#### GET /(app)/api/data/export — Implemented

- Response: `application/json` (full export payload)
- Errors: none (auth only)

#### POST /(app)/api/data/import/preview — Implemented

- Request: `multipart/form-data` with JSON file
- Response: `{ valid: boolean, entityCounts: Record<string, number>, warnings: string[] }`
- Errors: `VALIDATION_FAILED`

#### POST /(app)/api/data/import/start — Implemented

- Request: `multipart/form-data` with JSON file
- Response: `{ jobId: string, status: 'Running' }`
- Errors: `VALIDATION_FAILED`

#### GET /(app)/api/data/import/[jobId] — Implemented

- Response: `{ jobId: string, status: JobStatus, summary?: { createdEntities: number, conflictedEntitiesRemapped: number }, errors?: string[] }`
- Errors: `NOT_FOUND`

#### GET /(app)/api/audit — Implemented

- Query: `{ cursor?: string, limit?: number }`
- Response: `{ items: Array<AuditEventSummary>, nextCursor?: string }`
- Errors: `QUERY_CURSOR_INVALID`

#### POST /(app)/api/auth/logout — Implemented

- Request: `{}`
- Response: `204 No Content` + clear session cookie
- Errors: `AUTH_UNAUTHORIZED`

#### POST /(app)/api/auth/delete-account — Implemented

- Request: `{ confirmation: string }`
- Response: `204 No Content` + clear session cookie
- Errors: `AUTH_UNAUTHORIZED`, `VALIDATION_FAILED`

#### PATCH /(app)/api/profile — Implemented

- Request: `{ urgencyWeight?: number, importanceWeight?: number, balanceWeight?: number, effortFitWeight?: number, urgentThresholdDays?: number, minChunkMinutes?: number, defaultEffortMinutes?: number, expectedVersion: number }`
- Response: `{ profile: PlanningProfile }`
- Errors: `VALIDATION_FAILED`, `CONFLICT_STALE_WRITE`
