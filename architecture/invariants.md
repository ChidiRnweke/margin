# Domain Invariants

## Sequence References by Concern

- Identity/Profile/Erasure -> `architecture/sequence-diagrams/01-auth-profile.md`
- Aspect/Milestone -> `architecture/sequence-diagrams/02-aspects-milestones.md`
- Task/Recurrence -> `architecture/sequence-diagrams/03-tasks-recurrence.md`
- Availability/Planning -> `architecture/sequence-diagrams/04-availability-planning.md`
- Execution/Reminders -> `architecture/sequence-diagrams/05-execution-reminders.md`
- Data/Audit/System -> `architecture/sequence-diagrams/06-data-audit-system.md`

## Identity, Access, and Erasure

- `INV-001` Every mutable domain entity is owned by exactly one user.
- `INV-002` Cross-user reads and writes are forbidden.
- `INV-003` Verified identity is required before domain mutation.
- `INV-004` A session is active until it is revoked or expires.
- `INV-005` Revoked or expired sessions are unauthorized and cannot be reactivated.
- `INV-006` Every user-initiated interaction executes authorization validation before domain read or mutation.
- `INV-007` Every mutation-capable system job executes service-principal authorization validation before mutation.
- `INV-008` Principal types are `UserSession` and `ServicePrincipal`.
- `INV-009` Every successful write records actor principal type and principal reference when available.
- `INV-010` Account deletion is destructive GDPR erasure, not soft delete.
- `INV-011` Account deletion permanently removes user-owned domain data, sessions, audit events, idempotency keys, and portability jobs.
- `INV-012` Once account deletion succeeds, future sign-in must create a new user identity rather than revive the erased account.
- `INV-013` First-run onboarding completion is derived from the existence of at least one active aspect; it is not a separately persisted state.

## Profile and Scoring Configuration

- `INV-020` Every user has exactly one planning profile from the moment the user account is created.
- `INV-021` Planner weights are integers in `0..100`.
- `INV-022` Planner weights are normalized at score evaluation time.
- `INV-023` `urgent_threshold_days` is in `0..30`.
- `INV-024` `min_chunk_minutes` is in `5..120`.
- `INV-025` `default_effort_minutes` is positive.

## Aspect Rules

- `INV-030` Aspects are flat; no parent-child hierarchy exists.
- `INV-031` Aspect status is one of `Draft`, `Active`, `Archived`.
- `INV-032` Only active aspects participate in planning and target balancing.
- `INV-033` Sum of target percentages across active aspects must equal `100` at planning generation and confirmation time.
- `INV-034` Aspect activation and target edits may temporarily violate `INV-033`; planning generation and confirmation reject drift.
- `INV-035` Archiving an aspect cascades archive to child milestones, tasks, recurring task series, pending reminders, and future allocations.
- `INV-036` Restoring an aspect resets the aspect to `Draft`; descendants remain archived until explicitly restored.
- `INV-037` Tasks, milestones, and recurring task series cannot be created under draft or archived aspects.

## Milestone Rules

- `INV-040` Each milestone belongs to exactly one aspect.
- `INV-041` Milestone status is one of `Open`, `Done`, `Archived`.
- `INV-042` Milestone completion requires all child tasks in `Done`.
- `INV-043` Milestone can reopen from `Done` to `Open`.
- `INV-044` Milestone archive cascades archive to child tasks and child recurring task series anchored to that milestone.
- `INV-045` Milestone restore resets status to `Open`.

## Task Structure and Lifecycle

- `INV-050` Each task belongs to exactly one aspect.
- `INV-051` Task milestone is optional; when present it must belong to the same aspect.
- `INV-052` Task status is one of `Backlog`, `InProgress`, `Done`, `Archived`.
- `INV-053` Valid manual start transition is `Backlog -> InProgress` only.
- `INV-054` Valid manual completion transitions are `Backlog -> Done` and `InProgress -> Done`.
- `INV-055` Reopen transition is `Done -> Backlog`.
- `INV-056` Restoring an archived task resets status to `Backlog`.
- `INV-057` Due date is optional and day-granular.
- `INV-058` Past due dates are allowed; overdue is derived or synchronized and is not a distinct lifecycle state.
- `INV-059` `remaining_minutes` is non-negative.
- `INV-060` Force completion is allowed even if `remaining_minutes > 0`.
- `INV-061` Cross-aspect task moves are forbidden.
- `INV-062` Task milestone moves are allowed only between milestones in the same aspect.
- `INV-063` Reopening a done task preserves historical allocations and outcomes.
- `INV-064` Reopening or archiving a task cancels future non-terminal allocations for that task.
- `INV-065` Completing or archiving a task cancels pending reminders for that task.

## Recurrence

- `INV-070` Recurring work is modeled as a stable recurring task series with concrete task instances materialized over time.
- `INV-071` A task belongs to at most one recurring task series.
- `INV-072` A recurring task series belongs to exactly one aspect and optionally one milestone in that same aspect.
- `INV-073` A recurring task series has exactly one recurrence rule while active.
- `INV-074` Recurrence frequencies are limited to `Daily`, `Weekly`, and `Monthly`.
- `INV-075` A recurrence rule may be paused and resumed without destroying series history.
- `INV-076` The next concrete task instance is generated only on completion of the current instance.
- `INV-077` Recurrence exceptions are explicit records attached to the recurrence rule, not opaque JSON.
- `INV-078` Skip exceptions suppress materialization for the targeted occurrence.
- `INV-079` Move exceptions remap one occurrence to one explicit replacement local date.
- `INV-080` At most one overdue carried instance may exist for a recurring task series at a time.
- `INV-081` Monthly recurrence on a nonexistent month day clamps to the last day of that month.
- `INV-082` Recurrence evaluation uses the user's IANA timezone rules and materializes UTC instants only when generating reminders or allocations.
- `INV-083` Closing a recurring task series prevents future task materialization without deleting historical instances.
- `INV-084` `RECURRING_TASK_SERIES.status = Active` iff its recurrence rule exists and `paused = false`.
- `INV-085` `RECURRING_TASK_SERIES.status = Paused` iff its recurrence rule exists and `paused = true`.
- `INV-086` `RECURRING_TASK_SERIES.status = Closed` is terminal and requires future materialization to remain disabled regardless of rule history.

## Availability

- `INV-090` Manual availability is the only scheduling supply source in v1.
- `INV-091` Availability block must satisfy `start < end`.
- `INV-092` Availability supports one-off and recurring forms.
- `INV-093` Recurring availability supports date-specific skip and override exceptions.
- `INV-094` Overlapping availability blocks are normalized into merged effective windows at read and planning time; source blocks are not rewritten solely because they overlap.
- `INV-095` A live availability block has `active = true` and `archived_at = null`.
- `INV-096` An archived availability block has `active = false` and `archived_at` set.
- `INV-097` Restoring availability clears `archived_at` and sets `active = true`.
- `INV-098` Archived availability does not contribute to effective windows.
- `INV-099` One-off availability stores canonical UTC instants.
- `INV-100` Recurring availability stores local wall-clock windows and is expanded using the user's timezone rules.

## Planning Cycles, Revisions, and Allocation

- `INV-101` Planning horizon is weekly, ISO week Monday start.
- `INV-102` There is at most one planning cycle per user per ISO week.
- `INV-103` Planning cycle status is one of `Draft` and `Confirmed`.
- `INV-104` A planning cycle has one or more revisions and at most one current active revision.
- `INV-105` Revision numbers are unique and contiguous within a planning cycle starting from `1`.
- `INV-106` Every plan generation or regeneration that changes the active draft or confirmed snapshot creates a new immutable revision inside the same planning cycle.
- `INV-107` Superseded revisions remain immutable historical records.
- `INV-108` A revision has status `Active` or `Superseded`.
- `INV-109` Allocation status is one of `Proposed`, `Confirmed`, `Cancelled`.
- `INV-110` Planner applies hard constraints in order: active lock, due feasibility, minimum chunk, then capacity.
- `INV-111` If capacity is insufficient, lower-ranked feasible tasks are deferred; draft generation still succeeds with the best feasible subset.
- `INV-112` Effective split behavior is task override else aspect default.
- `INV-113` Splittable allocations must respect user minimum chunk.
- `INV-114` Tie-break order is due date ascending, then task age ascending.
- `INV-115` A task may have many historical locks but at most one active lock.
- `INV-116` A task lock binds to an exact time window and cannot be silently violated.
- `INV-117` Planning generation and confirmation require active aspect target percentages to total exactly `100`.
- `INV-118` Mutable planning aggregates reject stale writes using optimistic concurrency version checks.
- `INV-119` Materialized plan windows store canonical UTC instants plus numeric UTC offset and DST offset snapshots.
- `INV-120` Allocation edits and lock changes create a new revision when they alter the active plan snapshot.
- `INV-121` Revision diffs are summarized and queryable as part of cycle history.

## Execution and Health

- `INV-130` Allocation outcome is manually marked as `Attended` or `Missed`.
- `INV-131` An allocation may have at most one outcome record.
- `INV-132` Aspect health is computed from attended allocation minutes versus target minutes within the planning cycle.
- `INV-133` Health is stored per aspect per cycle for traceability.

## Reminders

- `INV-140` Reminder anchor is an absolute datetime.
- `INV-141` Reminder channels are limited to `in_app` and `email`.
- `INV-142` Reminder status is one of `Pending`, `Sent`, `Failed`, `Cancelled`.
- `INV-143` A task may have at most one active reminder per channel.
- `INV-144` Snoozes are bounded by policy; overflow attempts are rejected.
- `INV-145` Failed reminders retry with exponential backoff using delays of `15`, `30`, `60`, `120`, and `240` minutes.
- `INV-146` After 5 exponential retries, a reminder enters a daily retry queue.
- `INV-147` Daily retry window is capped at 30 days from first failure.
- `INV-148` After the retry window expires, the reminder becomes terminal `Failed`.
- `INV-149` Materialized reminders store canonical UTC instant plus numeric UTC offset and DST offset snapshots.

## Query and Pagination

- `INV-150` Cursor pagination is required for key list queries.
- `INV-151` Cursor is bound to query shape, including filters and sort contract.
- `INV-152` Default task query excludes archived and done items.
- `INV-153` Task search uses case-insensitive substring semantics.
- `INV-154` Task list sort order is urgency descending, then due date ascending, then created date ascending.
- `INV-155` A single paginated query chain is cursor-stable for its captured sort and filter shape; concurrent writes appear only on a fresh query.

## Data Portability

- `INV-160` Export format is JSON.
- `INV-161` Export includes all user-owned planning domain entities required to reconstruct live state, including profile, aspects, milestones, tasks, recurring task series, recurrence rules, recurrence exceptions, availability, planning cycles, revisions, allocations, outcomes, reminders, reminder attempts, and locks.
- `INV-162` Export excludes sessions, idempotency keys, system job runs, import jobs, export jobs, and audit events.
- `INV-163` Import validates schema and ownership scope before applying writes.
- `INV-164` ID collisions during import are resolved by minting new IDs.
- `INV-165` Reference graphs are remapped consistently during import.
- `INV-166` Imported audit history is never recreated.

## Audit and Compliance

- `INV-170` Every successful write emits one immutable audit event.
- `INV-171` Audit payload stores redacted diffs only.
- `INV-172` Audit timeline is user-readable and append-only until the owning user invokes GDPR erasure.
- `INV-173` Service-principal mutations against user-owned data stamp the affected user so the event appears in that user's audit timeline before erasure.

## Idempotency, Bulk Mutation, and Jobs

- `INV-180` All create and mutate commands require an idempotency key.
- `INV-181` Replayed command with the same key and request hash returns the prior response.
- `INV-182` Reused key with a different request hash is rejected.
- `INV-183` Bulk task mutation is per-item transactional; one task's failure does not roll back successful sibling mutations.
- `INV-184` Bulk task mutation returns a per-item success or error result for every submitted task ID.
- `INV-185` Every successful per-item mutation in a bulk command emits its own audit event.
- `INV-186` Mutation-capable scheduled jobs are idempotent by job-run key.
- `INV-187` Mutable aggregates reject stale writes using optimistic concurrency version checks.
- `INV-188` Every mutable aggregate exposes a monotonic version field that increments on successful mutation.
- `INV-189` Import, export, reminder delivery, health computation, and replan jobs transition `Running -> Succeeded` or `Running -> Failed` only.
