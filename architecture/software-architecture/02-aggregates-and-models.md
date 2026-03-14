# Aggregates and Models

## Aggregate Map

| Aggregate       | Root                  | Children                                                                       | Cross-Aggregate References                                                    |
| --------------- | --------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| UserAccount     | `User`                | none                                                                           | referenced by most user-owned roots via `user_id`                             |
| PlanningProfile | `PlanningProfile`     | none                                                                           | referenced by planning and task creation services                             |
| Session         | `Session`             | none                                                                           | referenced by auth/session middleware                                         |
| Aspect          | `Aspect`              | none                                                                           | referenced by `Milestone`, `Task`, `RecurringTaskSeries`, `AspectCycleHealth` |
| Milestone       | `Milestone`           | none                                                                           | references `Aspect`                                                           |
| Task            | `Task`                | `TaskLock`                                                                     | references `Aspect`, optional `Milestone`, optional `RecurringTaskSeries`     |
| RecurringSeries | `RecurringTaskSeries` | `RecurrenceRule`, `RecurrenceException`                                        | references `Aspect`, optional `Milestone`                                     |
| Availability    | `AvailabilityBlock`   | `AvailabilityException`                                                        | referenced by planning services                                               |
| PlanningCycle   | `PlanningCycle`       | `PlanningRevision`, `TaskAllocation`, `AllocationOutcome`, `AspectCycleHealth` | references `Task`, `Aspect` by id                                             |
| Reminder        | `Reminder`            | `ReminderAttempt`                                                              | references `Task`                                                             |
| ImportJob       | `ImportJob`           | none                                                                           | references affected user                                                      |
| ExportJob       | `ExportJob`           | none                                                                           | references affected user                                                      |
| AuditLog        | `AuditEvent`          | none                                                                           | references user and optionally system job run                                 |
| Idempotency     | `IdempotencyKey`      | none                                                                           | references user                                                               |
| SystemJobRun    | `SystemJobRun`        | none                                                                           | referenced by `AuditEvent`                                                    |

## Boundary Rationale

- `Aspect` is not the physical aggregate parent of every task or milestone because that would make all task writes part of one oversized transaction boundary.
- `Task` is its own aggregate because it has an independent lifecycle, reminder coordination, lock history, and planning side effects.
- `RecurringTaskSeries` owns its rule and exceptions because the rule cannot exist meaningfully without the series.
- `PlanningCycle` owns revisions, allocations, outcomes, and health scores because revision history must stay internally consistent.
- `Reminder` owns attempts because retry history is part of reminder lifecycle.

## Model Specifications

## UserAccount Aggregate

### User

| Field                       | Type           | Notes                              |
| --------------------------- | -------------- | ---------------------------------- |
| id                          | UUID           | system generated                   |
| email                       | `EmailAddress` | validated email                    |
| display_name                | `DisplayName`  | non-empty user-facing text         |
| timezone_name_iana          | `IanaTimezone` | canonical timezone identifier      |
| utc_offset_minutes_snapshot | int            | captured at account bootstrap      |
| dst_offset_minutes_snapshot | int            | captured at account bootstrap      |
| identity_verified           | bool           | must be true before mutation flows |
| created_at                  | datetime       | immutable                          |

## PlanningProfile Aggregate

### PlanningProfile

| Field                  | Type                  | Notes                  |
| ---------------------- | --------------------- | ---------------------- |
| id                     | UUID                  | system generated       |
| user_id                | UUID                  | owning user            |
| urgency_weight         | `PlannerWeight`       | `0..100`               |
| importance_weight      | `PlannerWeight`       | `0..100`               |
| balance_weight         | `PlannerWeight`       | `0..100`               |
| effort_fit_weight      | `PlannerWeight`       | `0..100`               |
| urgent_threshold_days  | `UrgentThresholdDays` | `0..30`                |
| min_chunk_minutes      | `MinChunkMinutes`     | `5..120`               |
| default_effort_minutes | `PositiveMinutes`     | positive               |
| version                | int                   | optimistic concurrency |
| updated_at             | datetime              | write timestamp        |

## Session Aggregate

### Session

| Field              | Type            | Notes                |
| ------------------ | --------------- | -------------------- | ------- | -------- |
| id                 | UUID            | system generated     |
| user_id            | UUID            | owning user          |
| session_token_hash | str             | hashed session token |
| status             | `SessionStatus` | `Active              | Revoked | Expired` |
| created_at         | datetime        | immutable            |
| expires_at         | datetime        | max lifetime cutoff  |
| revoked_at         | datetime?       | nullable             |

## Aspect Aggregate

### Aspect

| Field              | Type                | Notes                            |
| ------------------ | ------------------- | -------------------------------- | ------ | --------- |
| id                 | UUID                | system generated                 |
| user_id            | UUID                | owning user                      |
| name               | `AspectName`        | required                         |
| purpose            | `AspectPurpose`     | required for activation validity |
| status             | `AspectStatus`      | `Draft                           | Active | Archived` |
| target_percentage  | `TargetPercentage?` | optional until activation        |
| default_splittable | bool                | used by planning                 |
| version            | int                 | optimistic concurrency           |
| created_at         | datetime            | immutable                        |
| archived_at        | datetime?           | null unless archived             |

## Milestone Aggregate

### Milestone

| Field        | Type              | Notes                         |
| ------------ | ----------------- | ----------------------------- | ---- | --------- |
| id           | UUID              | system generated              |
| aspect_id    | UUID              | owning aspect                 |
| title        | `MilestoneTitle`  | required                      |
| description  | str               | optional rich text/plain text |
| target_date  | date?             | optional                      |
| status       | `MilestoneStatus` | `Open                         | Done | Archived` |
| version      | int               | optimistic concurrency        |
| completed_at | datetime?         | nullable                      |
| archived_at  | datetime?         | nullable                      |
| created_at   | datetime          | immutable                     |

## Task Aggregate

### Task

| Field                    | Type                 | Notes                            |
| ------------------------ | -------------------- | -------------------------------- | ---------- | ---- | --------- |
| id                       | UUID                 | system generated                 |
| aspect_id                | UUID                 | required                         |
| milestone_id             | UUID?                | optional, same aspect if present |
| recurring_task_series_id | UUID?                | optional origin series           |
| title                    | `TaskTitle`          | required                         |
| description              | str                  | optional                         |
| effort_minutes           | `PositiveMinutes`    | positive                         |
| remaining_minutes        | `NonNegativeMinutes` | non-negative                     |
| due_date                 | date?                | day-granular                     |
| importance_score         | `ImportanceScore`    | `0..100`                         |
| splittable_override      | bool?                | optional                         |
| status                   | `TaskStatus`         | `Backlog                         | InProgress | Done | Archived` |
| overdue                  | bool                 | derived or synchronized          |
| version                  | int                  | optimistic concurrency           |
| completed_at             | datetime?            | nullable                         |
| archived_at              | datetime?            | nullable                         |
| created_at               | datetime             | immutable                        |
| updated_at               | datetime             | write timestamp                  |

### TaskLock

| Field                     | Type      | Notes                            |
| ------------------------- | --------- | -------------------------------- |
| id                        | UUID      | system generated                 |
| task_id                   | UUID      | parent task                      |
| locked_start_utc          | datetime  | canonical UTC                    |
| locked_end_utc            | datetime  | canonical UTC                    |
| locked_utc_offset_minutes | int       | snapshot                         |
| locked_dst_offset_minutes | int       | snapshot                         |
| active                    | bool      | at most one active lock per task |
| version                   | int       | optimistic concurrency           |
| created_at                | datetime  | immutable                        |
| released_at               | datetime? | nullable                         |

## RecurringSeries Aggregate

### RecurringTaskSeries

| Field                      | Type                    | Notes                  |
| -------------------------- | ----------------------- | ---------------------- | ------ | ------- |
| id                         | UUID                    | system generated       |
| user_id                    | UUID                    | owning user            |
| aspect_id                  | UUID                    | required               |
| milestone_id               | UUID?                   | optional               |
| title_template             | `TaskTitleTemplate`     | required               |
| description_template       | str                     | optional               |
| effort_minutes_template    | `PositiveMinutes`       | positive               |
| importance_score_template  | `ImportanceScore`       | `0..100`               |
| splittable_override        | bool?                   | optional               |
| status                     | `RecurringSeriesStatus` | `Active                | Paused | Closed` |
| next_occurrence_date_local | date?                   | next pointer           |
| version                    | int                     | optimistic concurrency |
| created_at                 | datetime                | immutable              |
| closed_at                  | datetime?               | nullable               |

### RecurrenceRule

| Field                    | Type                  | Notes                     |
| ------------------------ | --------------------- | ------------------------- | ------ | -------- |
| id                       | UUID                  | system generated          |
| recurring_task_series_id | UUID                  | parent series             |
| frequency                | `RecurrenceFrequency` | `Daily                    | Weekly | Monthly` |
| interval                 | `PositiveInterval`    | positive integer          |
| weekday_mask             | `WeekdayMask?`        | weekly only               |
| month_day                | `MonthDay?`           | monthly only              |
| anchor_date_local        | date                  | required                  |
| paused                   | bool                  | controls active vs paused |
| version                  | int                   | optimistic concurrency    |
| ends_on                  | date?                 | optional                  |
| created_at               | datetime              | immutable                 |
| updated_at               | datetime              | write timestamp           |

### RecurrenceException

| Field                          | Type                        | Notes                        |
| ------------------------------ | --------------------------- | ---------------------------- | ----- |
| id                             | UUID                        | system generated             |
| recurrence_rule_id             | UUID                        | parent rule                  |
| occurrence_date_local          | date                        | explicit targeted occurrence |
| action                         | `RecurrenceExceptionAction` | `Skip                        | Move` |
| override_occurrence_date_local | date?                       | required for move            |
| created_at                     | datetime                    | immutable                    |

## Availability Aggregate

### AvailabilityBlock

| Field                 | Type               | Notes                  |
| --------------------- | ------------------ | ---------------------- | ---------- |
| id                    | UUID               | system generated       |
| user_id               | UUID               | owning user            |
| kind                  | `AvailabilityKind` | `OneOff                | Recurring` |
| one_off_starts_at_utc | datetime?          | one-off only           |
| one_off_ends_at_utc   | datetime?          | one-off only           |
| local_start_minute    | int?               | recurring only         |
| local_end_minute      | int?               | recurring only         |
| weekday_mask          | `WeekdayMask?`     | recurring only         |
| starts_on_local       | date?              | recurring only         |
| ends_on_local         | date?              | recurring only         |
| active                | bool               | live if true           |
| version               | int                | optimistic concurrency |
| created_at            | datetime           | immutable              |
| archived_at           | datetime?          | nullable               |

### AvailabilityException

| Field                       | Type                          | Notes               |
| --------------------------- | ----------------------------- | ------------------- | --------- |
| id                          | UUID                          | system generated    |
| availability_block_id       | UUID                          | parent block        |
| exception_date              | date                          | targeted local date |
| action                      | `AvailabilityExceptionAction` | `Skip               | Override` |
| override_starts_at_utc      | datetime?                     | optional override   |
| override_ends_at_utc        | datetime?                     | optional override   |
| override_local_start_minute | int?                          | optional override   |
| override_local_end_minute   | int?                          | optional override   |
| created_at                  | datetime                      | immutable           |

## PlanningCycle Aggregate

### PlanningCycle

| Field                 | Type                  | Notes                  |
| --------------------- | --------------------- | ---------------------- | ---------- |
| id                    | UUID                  | system generated       |
| user_id               | UUID                  | owning user            |
| week_start_iso_monday | date                  | unique per user        |
| week_end_iso_sunday   | date                  | derived/captured       |
| status                | `PlanningCycleStatus` | `Draft                 | Confirmed` |
| version               | int                   | optimistic concurrency |
| current_revision_id   | UUID?                 | active revision        |
| created_at            | datetime              | immutable              |
| confirmed_at          | datetime?             | nullable               |

### PlanningRevision

| Field             | Type                     | Notes                        |
| ----------------- | ------------------------ | ---------------------------- | ----------- |
| id                | UUID                     | system generated             |
| planning_cycle_id | UUID                     | parent cycle                 |
| revision_number   | `RevisionNumber`         | contiguous per cycle         |
| status            | `PlanningRevisionStatus` | `Active                      | Superseded` |
| change_reason     | str                      | domain summary               |
| diff_summary      | json                     | queryable historical summary |
| superseded_at     | datetime?                | nullable                     |
| created_at        | datetime                 | immutable                    |

### TaskAllocation

| Field                        | Type               | Notes                  |
| ---------------------------- | ------------------ | ---------------------- | --------- | ---------- |
| id                           | UUID               | system generated       |
| planning_revision_id         | UUID               | parent revision        |
| task_id                      | UUID               | referenced task        |
| scheduled_start_utc          | datetime           | canonical UTC          |
| scheduled_end_utc            | datetime           | canonical UTC          |
| scheduled_utc_offset_minutes | int                | snapshot               |
| scheduled_dst_offset_minutes | int                | snapshot               |
| allocated_minutes            | `PositiveMinutes`  | positive               |
| status                       | `AllocationStatus` | `Proposed              | Confirmed | Cancelled` |
| version                      | int                | optimistic concurrency |
| created_at                   | datetime           | immutable              |
| cancelled_at                 | datetime?          | nullable               |

### AllocationOutcome

| Field              | Type                      | Notes             |
| ------------------ | ------------------------- | ----------------- | ------- |
| id                 | UUID                      | system generated  |
| task_allocation_id | UUID                      | parent allocation |
| outcome            | `AllocationOutcomeStatus` | `Attended         | Missed` |
| marked_at          | datetime                  | immutable         |

### AspectCycleHealth

| Field             | Type                 | Notes               |
| ----------------- | -------------------- | ------------------- |
| id                | UUID                 | system generated    |
| planning_cycle_id | UUID                 | parent cycle        |
| aspect_id         | UUID                 | referenced aspect   |
| target_minutes    | `NonNegativeMinutes` | computed target     |
| completed_minutes | `NonNegativeMinutes` | computed completion |
| health_score      | float                | computed score      |
| computed_at       | datetime             | immutable           |

## Reminder Aggregate

### Reminder

| Field                     | Type              | Notes                  |
| ------------------------- | ----------------- | ---------------------- | ------ | ------ | ---------- |
| id                        | UUID              | system generated       |
| task_id                   | UUID              | referenced task        |
| remind_at_utc             | datetime          | absolute anchor        |
| remind_utc_offset_minutes | int               | snapshot               |
| remind_dst_offset_minutes | int               | snapshot               |
| channel                   | `ReminderChannel` | `in_app                | email` |
| status                    | `ReminderStatus`  | `Pending               | Sent   | Failed | Cancelled` |
| snooze_count              | int               | bounded by policy      |
| version                   | int               | optimistic concurrency |
| last_attempt_at           | datetime?         | nullable               |
| next_retry_at             | datetime?         | nullable               |
| terminal_failed_at        | datetime?         | nullable               |
| created_at                | datetime          | immutable              |

### ReminderAttempt

| Field          | Type                    | Notes                  |
| -------------- | ----------------------- | ---------------------- | ------- |
| id             | UUID                    | system generated       |
| reminder_id    | UUID                    | parent reminder        |
| attempt_number | int                     | monotonic per reminder |
| result         | `ReminderAttemptResult` | `Sent                  | Failed` |
| error_code     | str?                    | optional               |
| attempted_at   | datetime                | immutable              |

## Additional Root Models

### ImportJob

| Field                        | Type        | Notes                 |
| ---------------------------- | ----------- | --------------------- | --------- | ------- |
| id                           | UUID        | system generated      |
| user_id                      | UUID        | owning user           |
| status                       | `JobStatus` | `Running              | Succeeded | Failed` |
| created_entities             | int         | import result counter |
| conflicted_entities_remapped | int         | remap result counter  |
| started_at                   | datetime    | immutable after start |
| finished_at                  | datetime?   | nullable              |

### ExportJob

| Field        | Type           | Notes                      |
| ------------ | -------------- | -------------------------- | --------- | ------- |
| id           | UUID           | system generated           |
| user_id      | UUID           | owning user                |
| status       | `JobStatus`    | `Running                   | Succeeded | Failed` |
| format       | `ExportFormat` | `json` in v1               |
| started_at   | datetime       | immutable after start      |
| finished_at  | datetime?      | nullable                   |
| artifact_ref | str?           | nullable storage reference |

### AuditEvent

| Field                | Type            | Notes                         |
| -------------------- | --------------- | ----------------------------- | ----------------- |
| id                   | UUID            | system generated              |
| user_id              | UUID            | timeline owner                |
| system_job_run_id    | UUID?           | nullable source job reference |
| actor_principal_type | `PrincipalType` | `UserSession                  | ServicePrincipal` |
| actor_principal_ref  | str?            | nullable principal reference  |
| event_type           | str             | domain mutation label         |
| entity_type          | str             | mutated entity type           |
| entity_id            | UUID?           | nullable affected entity      |
| redacted_before      | json            | redacted payload only         |
| redacted_after       | json            | redacted payload only         |
| occurred_at          | datetime        | immutable                     |

### IdempotencyKey

| Field        | Type     | Notes                           |
| ------------ | -------- | ------------------------------- |
| id           | UUID     | system generated                |
| user_id      | UUID     | owning user                     |
| command_name | str      | mutation command identifier     |
| key_hash     | str      | hashed external idempotency key |
| request_hash | str      | hashed normalized request       |
| response_ref | str      | prior response handle           |
| created_at   | datetime | immutable                       |
| expires_at   | datetime | retry-safe window cutoff        |

### SystemJobRun

| Field            | Type        | Notes                            |
| ---------------- | ----------- | -------------------------------- | --------- | ------- |
| id               | UUID        | system generated                 |
| job_name         | str         | scheduled job identifier         |
| job_run_key_hash | str         | hashed idempotency key           |
| request_hash     | str?        | nullable normalized request hash |
| status           | `JobStatus` | `Running                         | Succeeded | Failed` |
| started_at       | datetime    | immutable after start            |
| finished_at      | datetime?   | nullable                         |

## Common Value Objects and Enums

- `EmailAddress`
- `IanaTimezone`
- `PlannerWeight`
- `UrgentThresholdDays`
- `MinChunkMinutes`
- `PositiveMinutes`
- `NonNegativeMinutes`
- `ImportanceScore`
- `TargetPercentage`
- `AspectStatus`
- `MilestoneStatus`
- `TaskStatus`
- `RecurringSeriesStatus`
- `RecurrenceFrequency`
- `RecurrenceExceptionAction`
- `AvailabilityKind`
- `AvailabilityExceptionAction`
- `PlanningCycleStatus`
- `PlanningRevisionStatus`
- `AllocationStatus`
- `AllocationOutcomeStatus`
- `ReminderChannel`
- `ReminderStatus`
- `ReminderAttemptResult`
- `SessionStatus`
- `PrincipalType`
- `JobStatus`
- `ExportFormat`
- job and export/import status enums

All construction-time invariants live in these model/value-object boundaries.
