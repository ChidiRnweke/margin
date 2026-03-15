# Invariant Coverage

## Coverage Status Key

- `Covered` — Implementation + passing test exist
- `Partial` — Some paths tested, others missing
- `Implicit` — Covered by construction/type system, no explicit test needed
- `Missing implementation` — No production code yet
- `Missing test` — Production code exists but no test
- `False confidence` — Test exists but does not actually verify the invariant

## Identity, Access, and Erasure (INV-001..013)

| ID | Description | Layer | Status |
|----|-------------|-------|--------|
| INV-001 | Authenticated session required for app routes | Middleware | Missing implementation |
| INV-002 | User ownership enforced on all user-scoped queries | Authorization | Missing implementation |
| INV-003 | New user gets default planning profile on creation | AuthService | Missing implementation |
| INV-004 | Session revocation is immediate | SessionRepository | Missing implementation |
| INV-005 | Expired sessions cannot authenticate | AuthService | Missing implementation |
| INV-006 | Session token is hashed before storage | Session model | Missing implementation |
| INV-007 | Session has max lifetime cutoff | Session model | Missing implementation |
| INV-008 | Identity provider callback must be verified | AuthService | Missing implementation |
| INV-009 | Audit event emitted on every successful mutation | Audit infra | Missing implementation |
| INV-010 | Account deletion cascades to all user data | AccountErasureService | Missing implementation |
| INV-011 | Account deletion revokes all sessions | AccountErasureService | Missing implementation |
| INV-012 | Account deletion creates final audit event | AccountErasureService | Missing implementation |
| INV-013 | Onboarding complete derived from active aspects | ProfileService | Missing implementation |

## Profile and Scoring (INV-020..026)

| ID | Description | Layer | Status |
|----|-------------|-------|--------|
| INV-020 | Planning profile exists from account creation | AuthService | Missing implementation |
| INV-021 | Planner weights are 0..100 | PlannerWeight VO | Missing implementation |
| INV-022 | Urgent threshold days 0..30 | UrgentThresholdDays VO | Missing implementation |
| INV-023 | Min chunk minutes 5..120 | MinChunkMinutes VO | Missing implementation |
| INV-024 | Default effort is positive | PositiveMinutes VO | Missing implementation |
| INV-025 | Profile update uses optimistic concurrency | PlanningProfileRepository | Missing implementation |
| INV-026 | Scheduler uses profile weights | SchedulerEngine | Missing implementation |

## Aspect Rules (INV-030..037)

| ID | Description | Layer | Status |
|----|-------------|-------|--------|
| INV-030 | Aspect requires valid name | AspectName VO | Missing implementation |
| INV-031 | Aspect requires purpose for activation | AspectService | Missing implementation |
| INV-032 | Active aspects participate in planning | PlanningService | Missing implementation |
| INV-033 | Active aspect targets must total 100% | AspectTargetValidator | Missing implementation |
| INV-034 | Target percentage is optional until activation | Aspect model | Missing implementation |
| INV-035 | Aspect archive cascades to descendants | AspectService | Missing implementation |
| INV-036 | Aspect restore resets to draft | AspectService | Missing implementation |
| INV-037 | Milestone/task/series require active or draft aspect | Services | Missing implementation |

## Milestone Rules (INV-040..045)

| ID | Description | Layer | Status |
|----|-------------|-------|--------|
| INV-040 | Milestone requires valid title | MilestoneTitle VO | Missing implementation |
| INV-041 | Milestone target date is optional | Milestone model | Missing implementation |
| INV-042 | Milestone completion gated by child tasks | MilestoneService | Missing implementation |
| INV-043 | Milestone state transitions enforced | MilestoneService | Missing implementation |
| INV-044 | Milestone archive cascades to tasks | MilestoneService | Missing implementation |
| INV-045 | Milestone restore resets to open | MilestoneService | Missing implementation |

## Task Rules (INV-050..065)

| ID | Description | Layer | Status |
|----|-------------|-------|--------|
| INV-050 | Task requires valid title | TaskTitle VO | Missing implementation |
| INV-051 | Task requires aspect | Task model | Missing implementation |
| INV-052 | Task status transitions enforced | TaskService | Missing implementation |
| INV-053 | Start requires Backlog status | TaskService | Missing implementation |
| INV-054 | Complete requires InProgress status | TaskService | Missing implementation |
| INV-055 | Reopen requires Done status | TaskService | Missing implementation |
| INV-056 | Restore requires Archived status | TaskService | Missing implementation |
| INV-057 | Effort minutes must be positive | PositiveMinutes VO | Missing implementation |
| INV-058 | Remaining minutes must be non-negative | NonNegativeMinutes VO | Missing implementation |
| INV-059 | Importance score 0..100 | ImportanceScore VO | Missing implementation |
| INV-060 | Task update validates field constraints | TaskService | Missing implementation |
| INV-061 | Move task milestone must be same aspect | TaskService | Missing implementation |
| INV-062 | Move task to null milestone allowed | TaskService | Missing implementation |
| INV-063 | Reopen task cancels future allocations | TaskService | Missing implementation |
| INV-064 | Archive task cancels future allocations | TaskService | Missing implementation |
| INV-065 | Archive task cancels pending reminders | TaskService | Missing implementation |

## Recurrence Rules (INV-070..089)

| ID | Description | Layer | Status |
|----|-------------|-------|--------|
| INV-070 | Series requires valid title template | TaskTitleTemplate VO | Missing implementation |
| INV-071 | Series requires aspect | RecurringTaskSeries model | Missing implementation |
| INV-072 | Series status transitions enforced | RecurrenceService | Missing implementation |
| INV-073 | Exactly one rule while active | RecurringSeriesRepository | Missing implementation |
| INV-074 | Frequency is Daily/Weekly/Monthly | RecurrenceFrequency enum | Missing implementation |
| INV-075 | Pause/resume requires active or paused | RecurrenceService | Missing implementation |
| INV-076 | Completion triggers next instance generation | RecurrenceMaterializer | Missing implementation |
| INV-077 | Exceptions attached to rule | RecurrenceException model | Missing implementation |
| INV-078 | Skip/move requires active series | RecurrenceService | Missing implementation |
| INV-079 | Move override date required | RecurrenceService | Missing implementation |
| INV-080 | Monthly clamp behavior | RecurrenceMaterializer | Missing implementation |
| INV-081 | Overdue suppression | RecurrenceMaterializer | Missing implementation |
| INV-082 | Next occurrence computed correctly | RecurrenceMaterializer | Missing implementation |
| INV-083 | Close series is terminal | RecurrenceService | Missing implementation |
| INV-084 | Series must be active/paused for mutation | RecurrenceService | Missing implementation |
| INV-085 | Series version concurrency | RecurringSeriesRepository | Missing implementation |
| INV-086 | Closed series rejects all mutations | RecurrenceService | Missing implementation |
| INV-087 | First instance materialized on upsert | RecurrenceService | Missing implementation |
| INV-088 | Generated task inherits series templates | RecurrenceMaterializer | Missing implementation |
| INV-089 | Close preserves history | RecurrenceService | Missing implementation |

## Availability Rules (INV-090..100)

| ID | Description | Layer | Status |
|----|-------------|-------|--------|
| INV-090 | Planning uses only availability as supply | PlanningService | Missing implementation |
| INV-091 | One-off requires UTC start/end | AvailabilityBlock model | Missing implementation |
| INV-092 | Recurring requires local time + weekday mask | AvailabilityBlock model | Missing implementation |
| INV-093 | Exceptions only on recurring blocks | AvailabilityService | Missing implementation |
| INV-094 | Exception skip/override semantics | AvailabilityWindowResolver | Missing implementation |
| INV-095 | Effective windows merge overlaps | AvailabilityWindowResolver | Missing implementation |
| INV-096 | Timezone handling in expansion | AvailabilityWindowResolver | Missing implementation |
| INV-097 | Block archive/restore semantics | AvailabilityService | Missing implementation |
| INV-098 | Block version concurrency | AvailabilityRepository | Missing implementation |
| INV-099 | Range query returns live blocks only | AvailabilityRepository | Missing implementation |
| INV-100 | Delete by user cascades exceptions | AvailabilityRepository | Missing implementation |

## Planning Rules (INV-101..126)

| ID | Description | Layer | Status |
|----|-------------|-------|--------|
| INV-101 | One cycle per user per week | PlanningCycleRepository | Missing implementation |
| INV-102 | Cycle week uses ISO Monday start | PlanningCycle model | Missing implementation |
| INV-103 | Cycle status Draft/Confirmed | PlanningCycle model | Missing implementation |
| INV-104 | Revision numbers contiguous per cycle | PlanningCycleRepository | Missing implementation |
| INV-105 | One current revision per cycle | PlanningCycleRepository | Missing implementation |
| INV-106 | Superseded revisions immutable | PlanningRevision model | Missing implementation |
| INV-107 | Revision history preserves diffs | PlanningRevision model | Missing implementation |
| INV-108 | Cycle confirmation requires draft | PlanningService | Missing implementation |
| INV-109 | Cycle version concurrency | PlanningCycleRepository | Missing implementation |
| INV-110 | Generation requires 100% aspect targets | PlanningService | Missing implementation |
| INV-111 | Scheduler deterministic scoring | SchedulerEngine | Missing implementation |
| INV-112 | Scheduler respects profile weights | SchedulerEngine | Missing implementation |
| INV-113 | Scheduler places in availability windows | SchedulerEngine | Missing implementation |
| INV-114 | Scheduler respects min-chunk | SchedulerEngine | Missing implementation |
| INV-115 | At most one active lock per task | TaskRepository | Missing implementation |
| INV-116 | Lock preserves timezone snapshot | TaskLock model | Missing implementation |
| INV-117 | Splittable tasks can split across windows | SchedulerEngine | Missing implementation |
| INV-118 | Deferred outcomes on placement | SchedulerEngine | Missing implementation |
| INV-119 | Regeneration supersedes current revision | PlanningService | Missing implementation |
| INV-120 | Plan edits create new revision | PlanningService | Missing implementation |
| INV-121 | Day-boundary replan handles conflicts | PlanningService | Missing implementation |
| INV-122 | Replan no-op when no changes | PlanningService | Missing implementation |
| INV-123 | Allocation status transitions | TaskAllocation model | Missing implementation |
| INV-124 | Cancelled allocations immutable | TaskAllocation model | Missing implementation |
| INV-125 | Allocation timezone snapshot | TaskAllocation model | Missing implementation |
| INV-126 | History query paginated | PlanningService | Missing implementation |

## Execution and Health (INV-130..133)

| ID | Description | Layer | Status |
|----|-------------|-------|--------|
| INV-130 | One outcome per allocation | ExecutionService | Missing implementation |
| INV-131 | Outcome is Attended/Missed | AllocationOutcome model | Missing implementation |
| INV-132 | Health computed from attended vs target | HealthComputationService | Missing implementation |
| INV-133 | Health stored per aspect per cycle | PlanningCycleRepository | Missing implementation |

## Reminder Rules (INV-140..149)

| ID | Description | Layer | Status |
|----|-------------|-------|--------|
| INV-140 | Reminder requires task reference | Reminder model | Missing implementation |
| INV-141 | Reminder channel is in_app/email | ReminderChannel enum | Missing implementation |
| INV-142 | Reminder status transitions | Reminder model | Missing implementation |
| INV-143 | One active reminder per task per channel | ReminderRepository | Missing implementation |
| INV-144 | Snooze bounded by policy limit | ReminderService | Missing implementation |
| INV-145 | Dispatch records attempt | ReminderDispatchService | Missing implementation |
| INV-146 | Retry uses exponential backoff | ReminderDispatchService | Missing implementation |
| INV-147 | Terminal failure after max retries | ReminderDispatchService | Missing implementation |
| INV-148 | Daily retry window enforced | ReminderDispatchService | Missing implementation |
| INV-149 | Attempt history append-only | ReminderAttempt model | Missing implementation |

## Query and Pagination (INV-150..155)

| ID | Description | Layer | Status |
|----|-------------|-------|--------|
| INV-150 | Cursor pagination on list queries | Query infra | Missing implementation |
| INV-151 | Invalid cursor rejected | Cursor codec | Missing implementation |
| INV-152 | Case-insensitive search for tasks | TaskRepository | Missing implementation |
| INV-153 | Canonical task sort order | TaskRepository | Missing implementation |
| INV-154 | Default excludes done/archived | TaskService | Missing implementation |
| INV-155 | Cursor shape validated per query | Cursor codec | Missing implementation |

## Data Portability (INV-160..166)

| ID | Description | Layer | Status |
|----|-------------|-------|--------|
| INV-160 | Export is synchronous inline JSON | DataPortabilityService | Missing implementation |
| INV-161 | Export excludes forbidden records | DataPortabilityService | Missing implementation |
| INV-162 | Import preview validates payload | DataPortabilityService | Missing implementation |
| INV-163 | Import remaps colliding IDs | ImportRemapService | Missing implementation |
| INV-164 | Import rejects forbidden entities | ImportRemapService | Missing implementation |
| INV-165 | Import job tracks status | ImportJobRepository | Missing implementation |
| INV-166 | Import async via Hatchet | Job wiring | Missing implementation |

## Audit and Compliance (INV-170..173)

| ID | Description | Layer | Status |
|----|-------------|-------|--------|
| INV-170 | Audit event emitted after writes | Audit infra | Missing implementation |
| INV-171 | Audit events immutable | AuditEventRepository | Missing implementation |
| INV-172 | Audit events redacted | Audit emitter | Missing implementation |
| INV-173 | Audit events stamped with principal | Audit emitter | Missing implementation |

## Idempotency, Bulk, Jobs (INV-180..189)

| ID | Description | Layer | Status |
|----|-------------|-------|--------|
| INV-180 | Idempotency key checked before command | Command policy | Missing implementation |
| INV-181 | Replay returns stored response | Command policy | Missing implementation |
| INV-182 | Hash mismatch rejected | Command policy | Missing implementation |
| INV-183 | Bulk mutation partial success | TaskService | Missing implementation |
| INV-184 | Bulk per-item results | TaskService | Missing implementation |
| INV-185 | Bulk audit per item | Audit infra | Missing implementation |
| INV-186 | Job idempotency wrapper | Job policy | Missing implementation |
| INV-187 | Optimistic concurrency on mutable records | Repositories | Missing implementation |
| INV-188 | Stale write rejected | Repositories | Missing implementation |
| INV-189 | Import job lifecycle transitions | ImportJobRepository | Missing implementation |
