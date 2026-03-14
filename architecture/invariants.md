# Domain Invariants

## Sequence References by Concern

- Identity/Profile -> `architecture/sequence-diagrams/01-auth-profile.md`
- Aspect/Milestone -> `architecture/sequence-diagrams/02-aspects-milestones.md`
- Task/Recurrence -> `architecture/sequence-diagrams/03-tasks-recurrence.md`
- Availability/Planning -> `architecture/sequence-diagrams/04-availability-planning.md`
- Execution/Reminders -> `architecture/sequence-diagrams/05-execution-reminders.md`
- Data/Audit/System -> `architecture/sequence-diagrams/06-data-audit-system.md`

## Identity and Ownership

- `INV-001` Every mutable domain entity is owned by exactly one user.
- `INV-002` Cross-user reads and writes are forbidden.
- `INV-003` Verified identity is required before domain mutation.
- `INV-004` Session max lifetime is enforced; expired sessions are unauthorized.
- `INV-005` Deleted accounts are pseudonymized in retained audit artifacts.
- `INV-006` Every user-initiated interaction executes authorization policy validation before query or mutation.
- `INV-007` Every system job executes service-principal authorization policy validation before mutation.

## Profile and Scoring Configuration

- `INV-010` Planner weights are integers in `0..100`.
- `INV-011` Planner weights are normalized at score evaluation time.
- `INV-012` `urgent_threshold_days` is in `0..30`.
- `INV-013` `min_chunk_minutes` is in `5..120`.
- `INV-014` `default_effort_minutes` is positive.

## Aspect Rules

- `INV-020` Aspects are flat; no parent-child hierarchy exists.
- `INV-021` Aspect status is one of `Draft`, `Active`, `Archived`.
- `INV-022` Only active aspects participate in planning and target balancing.
- `INV-023` Sum of target percentages across active aspects is exactly `100`.
- `INV-024` Aspect activation is rejected when activation would violate `INV-023`.
- `INV-025` Archiving an aspect cascades archive to child milestones and tasks.
- `INV-026` Restoring an aspect restores descendants to their prior lifecycle states.
- `INV-027` Tasks cannot be created under draft or archived aspects.

## Milestone Rules

- `INV-030` Each milestone belongs to exactly one aspect.
- `INV-031` Milestone status is one of `Open`, `Done`, `Archived`.
- `INV-032` Milestone completion requires all child tasks in `Done`.
- `INV-033` Milestone can reopen from `Done` to `Open`.
- `INV-034` Milestone archive cascades archive to child tasks.
- `INV-035` Milestone restore returns to prior state, not a forced default.

## Task Structure and Lifecycle

- `INV-040` Each task belongs to exactly one aspect.
- `INV-041` Task milestone is optional; when present it must belong to the same aspect.
- `INV-042` Task status is one of `Backlog`, `InProgress`, `Done`, `Archived`.
- `INV-043` Valid manual transition to start work is `Backlog -> InProgress` only.
- `INV-044` Reopen transition is `Done -> Backlog`.
- `INV-045` Due date is optional and day-granular.
- `INV-046` Past due dates are allowed; overdue flag must reflect lateness.
- `INV-047` Overdue is a derived or synchronized flag, not a distinct state.
- `INV-048` `remaining_minutes` is non-negative.
- `INV-049` Force completion is allowed even if `remaining_minutes > 0`.
- `INV-050` Cross-aspect task moves are forbidden.
- `INV-051` Task moves are allowed only between milestones in same aspect.
- `INV-052` Reopening a done task preserves historical allocations.
- `INV-053` Reopening cancels future active allocations for that task.

## Recurrence

- `INV-060` Recurrence frequencies are limited to `Daily`, `Weekly`, `Monthly`.
- `INV-061` A task has at most one active recurrence rule.
- `INV-062` Next recurrence instance is generated only on completion of current instance.
- `INV-063` Recurrence pause blocks auto-generation until resumed.
- `INV-064` Skips/exceptions prevent generation for the skipped occurrence.
- `INV-065` Missed recurrence carries at most one overdue carried instance.

## Availability

- `INV-070` Manual availability is the only scheduling supply source in v1.
- `INV-071` Availability block must satisfy `start < end`.
- `INV-072` Availability supports one-off and recurring forms.
- `INV-073` Recurring availability supports date-specific skip/override exceptions.
- `INV-074` Overlapping availability blocks are normalized into merged effective windows.
- `INV-075` Archived availability does not contribute to effective windows.

## Planning Cycles, Revisions, and Allocation

- `INV-080` Planning horizon is weekly, ISO week Monday start.
- `INV-081` Cycle status is one of `Draft`, `Confirmed`, `Superseded`.
- `INV-082` Confirmed cycles can be regenerated only by creating a new revision.
- `INV-083` Superseded revisions remain immutable historical records.
- `INV-084` Allocation status is one of `Proposed`, `Confirmed`, `Cancelled`.
- `INV-085` Planner applies hard constraints in order: lock, due feasibility, min chunk, capacity.
- `INV-086` If capacity is insufficient, lowest-ranked feasible tasks are deferred.
- `INV-087` Effective split behavior is task override else aspect default.
- `INV-088` Splittable allocations must respect user min chunk.
- `INV-089` Tie-break order is due date ascending, then task age ascending.
- `INV-090` Task lock binds to exact time window.
- `INV-091` Lock conflicts are not silently violated; plan must reallocate or flag.
- `INV-092` Day-boundary replan may create a new superseding revision.

## Execution and Health

- `INV-100` Allocation outcome is manually marked as `Attended` or `Missed`.
- `INV-101` Aspect health is computed from completed minutes vs target minutes.
- `INV-102` Health is stored per aspect per cycle for traceability.

## Reminders

- `INV-110` Reminder anchor is absolute datetime.
- `INV-111` Reminder channels are limited to `in_app` and `email`.
- `INV-112` Reminder status is one of `Pending`, `Sent`, `Failed`, `Cancelled`.
- `INV-113` Snoozes are bounded by policy; overflow attempts are rejected.
- `INV-114` Failed reminders retry with exponential backoff first.
- `INV-115` After exponential retries, reminder enters daily retry queue.
- `INV-116` Daily retry window is capped at 30 days.
- `INV-117` After 30 days, reminder becomes terminal failed.
- `INV-118` Completing or archiving a task cancels pending reminders.

## Query and Pagination

- `INV-120` Cursor pagination is required for key list queries.
- `INV-121` Cursor is bound to query shape (filters and sort contract).
- `INV-122` Default task query excludes archived and done items.
- `INV-123` Task search uses case-insensitive substring semantics.
- `INV-124` List consistency is eventual under concurrent writes.

## Data Portability

- `INV-130` Export format is JSON and includes all user-owned domain entities.
- `INV-131` Import validates ownership scope and schema before applying writes.
- `INV-132` ID collisions during import are resolved by minting new IDs.
- `INV-133` Reference graph is remapped consistently during import.

## Audit and Compliance

- `INV-140` Every successful write emits one immutable audit event.
- `INV-141` Audit payload stores redacted diffs only.
- `INV-142` Audit timeline is user-readable and append-only.
- `INV-143` Audit events survive account deletion with pseudonymized linkage.

## Idempotency and Concurrency

- `INV-150` All create/mutate commands require an idempotency key.
- `INV-151` Replayed command with same key and request hash returns prior response.
- `INV-152` Reused key with different request hash is rejected.
- `INV-153` Scheduled jobs are idempotent by job-run key.
- `INV-154` Write conflict policy is last-write-wins for concurrent client updates.
