# Invariant Coverage

## Coverage Status Key

- `Covered` — Implementation + passing test exist
- `Partial` — Some paths tested, others missing
- `Implicit` — Covered by construction/type system, no explicit test needed
- `Missing test` — Production code exists but no test
- `False confidence` — Test exists but does not actually verify the invariant

> **Note (v1):** All production code for models, value objects, services, controllers,
> repositories (Postgres), jobs, and infra is implemented. Repository integration tests
> are absent because no Postgres instance is available in CI yet — those invariants are
> marked "Missing test". Unit tests exist for AuthService, AspectService, TaskService,
> PlanningService, all models/VOs, and cursor-codec/clock/request-hash infra.

## Identity, Access, and Erasure (INV-001..013)

| ID | Description | Layer | Status |
|----|-------------|-------|--------|
| INV-001 | Authenticated session required for app routes | Middleware | Missing test |
| INV-002 | User ownership enforced on all user-scoped queries | Authorization | Missing test |
| INV-003 | New user gets default planning profile on creation | AuthService | Covered |
| INV-004 | Session revocation is immediate | SessionRepository | Missing test |
| INV-005 | Expired sessions cannot authenticate | AuthService | Covered |
| INV-006 | Session token is hashed before storage | Session model | Implicit |
| INV-007 | Session has max lifetime cutoff | Session model | Implicit |
| INV-008 | Identity provider callback must be verified | AuthService | Covered |
| INV-009 | Audit event emitted on every successful mutation | Audit infra | Missing test |
| INV-010 | Account deletion cascades to all user data | AccountErasureService | Missing test |
| INV-011 | Account deletion revokes all sessions | AccountErasureService | Missing test |
| INV-012 | Account deletion creates final audit event | AccountErasureService | Missing test |
| INV-013 | Onboarding complete derived from active aspects | ProfileService | Missing test |

## Profile and Scoring (INV-020..026)

| ID | Description | Layer | Status |
|----|-------------|-------|--------|
| INV-020 | Planning profile exists from account creation | AuthService | Covered |
| INV-021 | Planner weights are 0..100 | PlannerWeight VO | Covered |
| INV-022 | Urgent threshold days 0..30 | UrgentThresholdDays VO | Covered |
| INV-023 | Min chunk minutes 5..120 | MinChunkMinutes VO | Covered |
| INV-024 | Default effort is positive | PositiveMinutes VO | Covered |
| INV-025 | Profile update uses optimistic concurrency | PlanningProfileRepository | Missing test |
| INV-026 | Scheduler uses profile weights | SchedulerEngine | Missing test |

## Aspect Rules (INV-030..037)

| ID | Description | Layer | Status |
|----|-------------|-------|--------|
| INV-030 | Aspect requires valid name | AspectName VO | Covered |
| INV-031 | Aspect requires purpose for activation | AspectService | Covered |
| INV-032 | Active aspects participate in planning | PlanningService | Covered |
| INV-033 | Active aspect targets must total 100% | AspectTargetValidator | Missing test |
| INV-034 | Target percentage is optional until activation | Aspect model | Implicit |
| INV-035 | Aspect archive cascades to descendants | AspectService | Covered |
| INV-036 | Aspect restore resets to draft | AspectService | Covered |
| INV-037 | Milestone/task/series require active or draft aspect | Services | Covered |

## Milestone Rules (INV-040..045)

| ID | Description | Layer | Status |
|----|-------------|-------|--------|
| INV-040 | Milestone requires valid title | MilestoneTitle VO | Covered |
| INV-041 | Milestone target date is optional | Milestone model | Implicit |
| INV-042 | Milestone completion gated by child tasks | MilestoneService | Missing test |
| INV-043 | Milestone state transitions enforced | MilestoneService | Missing test |
| INV-044 | Milestone archive cascades to tasks | MilestoneService | Missing test |
| INV-045 | Milestone restore resets to open | MilestoneService | Missing test |

## Task Rules (INV-050..065)

| ID | Description | Layer | Status |
|----|-------------|-------|--------|
| INV-050 | Task requires valid title | TaskTitle VO | Covered |
| INV-051 | Task requires aspect | Task model | Covered |
| INV-052 | Task status transitions enforced | TaskService | Covered |
| INV-053 | Start requires Backlog status | TaskService | Covered |
| INV-054 | Complete requires InProgress status | TaskService | Covered |
| INV-055 | Reopen requires Done status | TaskService | Covered |
| INV-056 | Restore requires Archived status | TaskService | Covered |
| INV-057 | Effort minutes must be positive | PositiveMinutes VO | Covered |
| INV-058 | Remaining minutes must be non-negative | NonNegativeMinutes VO | Covered |
| INV-059 | Importance score 0..100 | ImportanceScore VO | Covered |
| INV-060 | Task update validates field constraints | TaskService | Covered |
| INV-061 | Move task milestone must be same aspect | TaskService | Covered |
| INV-062 | Move task to null milestone allowed | TaskService | Covered |
| INV-063 | Reopen task cancels future allocations | TaskService | Covered |
| INV-064 | Archive task cancels future allocations | TaskService | Covered |
| INV-065 | Archive task cancels pending reminders | TaskService | Covered |

## Recurrence Rules (INV-070..089)

| ID | Description | Layer | Status |
|----|-------------|-------|--------|
| INV-070 | Series requires valid title template | TaskTitleTemplate VO | Covered |
| INV-071 | Series requires aspect | RecurringTaskSeries model | Covered |
| INV-072 | Series status transitions enforced | RecurrenceService | Missing test |
| INV-073 | Exactly one rule while active | RecurringSeriesRepository | Missing test |
| INV-074 | Frequency is Daily/Weekly/Monthly | RecurrenceFrequency enum | Implicit |
| INV-075 | Pause/resume requires active or paused | RecurrenceService | Missing test |
| INV-076 | Completion triggers next instance generation | RecurrenceMaterializer | Missing test |
| INV-077 | Exceptions attached to rule | RecurrenceException model | Covered |
| INV-078 | Skip/move requires active series | RecurrenceService | Missing test |
| INV-079 | Move override date required | RecurrenceService | Missing test |
| INV-080 | Monthly clamp behavior | RecurrenceMaterializer | Missing test |
| INV-081 | Overdue suppression | RecurrenceMaterializer | Missing test |
| INV-082 | Next occurrence computed correctly | RecurrenceMaterializer | Missing test |
| INV-083 | Close series is terminal | RecurrenceService | Missing test |
| INV-084 | Series must be active/paused for mutation | RecurrenceService | Missing test |
| INV-085 | Series version concurrency | RecurringSeriesRepository | Missing test |
| INV-086 | Closed series rejects all mutations | RecurrenceService | Missing test |
| INV-087 | First instance materialized on upsert | RecurrenceService | Missing test |
| INV-088 | Generated task inherits series templates | RecurrenceMaterializer | Missing test |
| INV-089 | Close preserves history | RecurrenceService | Missing test |

## Availability Rules (INV-090..100)

| ID | Description | Layer | Status |
|----|-------------|-------|--------|
| INV-090 | Planning uses only availability as supply | PlanningService | Covered |
| INV-091 | One-off requires UTC start/end | AvailabilityBlock model | Implicit |
| INV-092 | Recurring requires local time + weekday mask | AvailabilityBlock model | Implicit |
| INV-093 | Exceptions only on recurring blocks | AvailabilityService | Missing test |
| INV-094 | Exception skip/override semantics | AvailabilityWindowResolver | Missing test |
| INV-095 | Effective windows merge overlaps | AvailabilityWindowResolver | Missing test |
| INV-096 | Timezone handling in expansion | AvailabilityWindowResolver | Missing test |
| INV-097 | Block archive/restore semantics | AvailabilityService | Missing test |
| INV-098 | Block version concurrency | AvailabilityRepository | Missing test |
| INV-099 | Range query returns live blocks only | AvailabilityRepository | Missing test |
| INV-100 | Delete by user cascades exceptions | AvailabilityRepository | Missing test |

## Planning Rules (INV-101..126)

| ID | Description | Layer | Status |
|----|-------------|-------|--------|
| INV-101 | One cycle per user per week | PlanningCycleRepository | Missing test |
| INV-102 | Cycle week uses ISO Monday start | PlanningCycle model | Implicit |
| INV-103 | Cycle status Draft/Confirmed | PlanningCycle model | Implicit |
| INV-104 | Revision numbers contiguous per cycle | PlanningCycleRepository | Missing test |
| INV-105 | One current revision per cycle | PlanningCycleRepository | Missing test |
| INV-106 | Superseded revisions immutable | PlanningRevision model | Implicit |
| INV-107 | Revision history preserves diffs | PlanningRevision model | Implicit |
| INV-108 | Cycle confirmation requires draft | PlanningService | Covered |
| INV-109 | Cycle version concurrency | PlanningCycleRepository | Missing test |
| INV-110 | Generation requires 100% aspect targets | PlanningService | Covered |
| INV-111 | Scheduler deterministic scoring | SchedulerEngine | Missing test |
| INV-112 | Scheduler respects profile weights | SchedulerEngine | Missing test |
| INV-113 | Scheduler places in availability windows | SchedulerEngine | Missing test |
| INV-114 | Scheduler respects min-chunk | SchedulerEngine | Missing test |
| INV-115 | At most one active lock per task | TaskRepository | Missing test |
| INV-116 | Lock preserves timezone snapshot | TaskLock model | Implicit |
| INV-117 | Splittable tasks can split across windows | SchedulerEngine | Missing test |
| INV-118 | Deferred outcomes on placement | SchedulerEngine | Missing test |
| INV-119 | Regeneration supersedes current revision | PlanningService | Covered |
| INV-120 | Plan edits create new revision | PlanningService | Covered |
| INV-121 | Day-boundary replan handles conflicts | PlanningService | Covered |
| INV-122 | Replan no-op when no changes | PlanningService | Covered |
| INV-123 | Allocation status transitions | TaskAllocation model | Implicit |
| INV-124 | Cancelled allocations immutable | TaskAllocation model | Implicit |
| INV-125 | Allocation timezone snapshot | TaskAllocation model | Implicit |
| INV-126 | History query paginated | PlanningService | Missing test |

## Execution and Health (INV-130..133)

| ID | Description | Layer | Status |
|----|-------------|-------|--------|
| INV-130 | One outcome per allocation | ExecutionService | Missing test |
| INV-131 | Outcome is Attended/Missed | AllocationOutcome model | Implicit |
| INV-132 | Health computed from attended vs target | HealthComputationService | Missing test |
| INV-133 | Health stored per aspect per cycle | PlanningCycleRepository | Missing test |

## Reminder Rules (INV-140..149)

| ID | Description | Layer | Status |
|----|-------------|-------|--------|
| INV-140 | Reminder requires task reference | Reminder model | Implicit |
| INV-141 | Reminder channel is in_app/email | ReminderChannel enum | Implicit |
| INV-142 | Reminder status transitions | Reminder model | Implicit |
| INV-143 | One active reminder per task per channel | ReminderRepository | Missing test |
| INV-144 | Snooze bounded by policy limit | ReminderService | Missing test |
| INV-145 | Dispatch records attempt | ReminderDispatchService | Missing test |
| INV-146 | Retry uses exponential backoff | ReminderDispatchService | Missing test |
| INV-147 | Terminal failure after max retries | ReminderDispatchService | Missing test |
| INV-148 | Daily retry window enforced | ReminderDispatchService | Missing test |
| INV-149 | Attempt history append-only | ReminderAttempt model | Implicit |

## Query and Pagination (INV-150..155)

| ID | Description | Layer | Status |
|----|-------------|-------|--------|
| INV-150 | Cursor pagination on list queries | Query infra | Missing test |
| INV-151 | Invalid cursor rejected | Cursor codec | Covered |
| INV-152 | Case-insensitive search for tasks | TaskRepository | Missing test |
| INV-153 | Canonical task sort order | TaskRepository | Missing test |
| INV-154 | Default excludes done/archived | TaskService | Covered |
| INV-155 | Cursor shape validated per query | Cursor codec | Covered |

## Data Portability (INV-160..166)

| ID | Description | Layer | Status |
|----|-------------|-------|--------|
| INV-160 | Export is synchronous inline JSON | DataPortabilityService | Missing test |
| INV-161 | Export excludes forbidden records | DataPortabilityService | Missing test |
| INV-162 | Import preview validates payload | DataPortabilityService | Missing test |
| INV-163 | Import remaps colliding IDs | ImportRemapService | Missing test |
| INV-164 | Import rejects forbidden entities | ImportRemapService | Missing test |
| INV-165 | Import job tracks status | ImportJobRepository | Missing test |
| INV-166 | Import async via Hatchet | Job wiring | Missing test |

## Audit and Compliance (INV-170..173)

| ID | Description | Layer | Status |
|----|-------------|-------|--------|
| INV-170 | Audit event emitted after writes | Audit infra | Missing test |
| INV-171 | Audit events immutable | AuditEventRepository | Missing test |
| INV-172 | Audit events redacted | Audit emitter | Missing test |
| INV-173 | Audit events stamped with principal | Audit emitter | Missing test |

## Idempotency, Bulk, Jobs (INV-180..189)

| ID | Description | Layer | Status |
|----|-------------|-------|--------|
| INV-180 | Idempotency key checked before command | Command policy | Missing test |
| INV-181 | Replay returns stored response | Command policy | Missing test |
| INV-182 | Hash mismatch rejected | Command policy | Missing test |
| INV-183 | Bulk mutation partial success | TaskService | Covered |
| INV-184 | Bulk per-item results | TaskService | Covered |
| INV-185 | Bulk audit per item | Audit infra | Missing test |
| INV-186 | Job idempotency wrapper | Job policy | Missing test |
| INV-187 | Optimistic concurrency on mutable records | Repositories | Missing test |
| INV-188 | Stale write rejected | Repositories | Missing test |
| INV-189 | Import job lifecycle transitions | ImportJobRepository | Missing test |
