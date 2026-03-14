# Interaction Matrix

All create and mutate interactions require idempotency keys unless explicitly marked job-only. Read interactions execute under `UserSession` principal. Background jobs execute under `ServicePrincipal`.

## Error Code Set

- `AUTH_UNAUTHORIZED`
- `AUTH_SESSION_EXPIRED`
- `VALIDATION_FAILED`
- `STATE_TRANSITION_INVALID`
- `OWNERSHIP_VIOLATION`
- `NOT_FOUND`
- `TARGET_PERCENT_TOTAL_INVALID`
- `CONFLICT_STALE_WRITE`
- `LOCK_CONFLICT`
- `QUERY_CURSOR_INVALID`
- `IDEMPOTENCY_HASH_MISMATCH`
- `SNOOZE_LIMIT_EXCEEDED`
- `IMPORT_CONFLICT_REMAP_FAILED`
- `RETRY_EXHAUSTED`

## Identity and Profile

- `AUTH-01` Identity sign-in start: user initiates external sign-in.
- `AUTH-02` Identity callback: system resolves identity, matches or creates user, bootstraps planning profile for first sign-in, creates session.
- `AUTH-03` Logout: revokes current session token.
- `AUTH-04` Session expiry: background job invalidates sessions past max lifetime.
- `AUTH-05` First-run wizard completion: derived success requires at least one active aspect before app entry.
- `AUTH-06` GDPR account deletion: permanently erases user-owned domain data, audit history, sessions, and idempotency state.
- `PRF-01` Update planning profile: updates slider weights, urgency threshold, min chunk, default effort.

## Aspect

- `ASP-01` Create aspect in `Draft`.
- `ASP-02` Activate aspect: requires valid metadata and target percentage, but does not require active total to equal `100` yet.
- `ASP-03` Update aspect metadata and target percentage.
- `ASP-04` Archive aspect: cascades archive to child milestones, tasks, recurring series, pending reminders, and future allocations.
- `ASP-05` Restore aspect: resets aspect to `Draft`; descendants remain archived until separately restored.
- `ASP-06` Query aspects: status/date filters and cursor pagination.

## Milestone

- `MLS-01` Create milestone in active aspect.
- `MLS-02` Update milestone metadata.
- `MLS-03` Complete milestone: allowed only when all child tasks are `Done`.
- `MLS-04` Reopen milestone: `Done -> Open`.
- `MLS-05` Archive milestone: cascades archive to child tasks and child recurring series anchored to the milestone.
- `MLS-06` Restore milestone to `Open`.
- `MLS-07` Query milestones by aspect, status, and date.

## Task

- `TSK-01` Create task: title required; defaults from profile and aspect.
- `TSK-02` Update task fields: due date, effort, remaining minutes, importance, split override.
- `TSK-03` Move task between milestones in the same aspect only.
- `TSK-04` Start task: manual `Backlog -> InProgress`.
- `TSK-05` Complete task: force complete allowed even when remaining minutes > 0.
- `TSK-06` Reopen task: `Done -> Backlog`, keep history, cancel future active allocations.
- `TSK-07` Archive task.
- `TSK-08` Restore task to `Backlog`.
- `TSK-09` Bulk task mutation: archive, status change, or move milestone with per-item results.
- `TSK-10` Query and search tasks: filters, cursor pagination, case-insensitive substring search; default excludes done and archived.
- `TSK-11` Read task detail.

## Recurrence

- `REC-01` Create or update recurring task series and rule; initial creation materializes the first eligible task instance immediately.
- `REC-02` Pause or resume recurrence.
- `REC-03` Skip or move the next recurrence occurrence.
- `REC-04` Generate next task instance on completion using recurrence rule plus explicit recurrence exceptions.
- `REC-05` Close recurring task series and prevent future materialization while preserving history.

## Availability

- `AVL-01` Create one-off availability block.
- `AVL-02` Create recurring availability block.
- `AVL-03` Add recurring exception (skip or override specific date).
- `AVL-04` Update, archive, or restore availability block.
- `AVL-05` Query effective availability: merge overlaps and apply exceptions.

## Planning

- `PLN-01` Generate draft weekly plan (ISO week Monday start) with a deterministic heuristic scheduler that ranks feasible tasks with weighted scoring and greedily assigns valid windows under hard constraints.
- `PLN-02` Confirm draft plan; blocked unless active aspect targets total exactly `100`.
- `PLN-03` Regenerate confirmed plan into a new revision in the same cycle; preserve past allocations and active locks, reoptimize future unlocked work, and supersede the prior current revision.
- `PLN-04` Edit allocations: lock, unlock, cancel, or reslot with revision stamp.
- `PLN-05` Day-boundary replan job that preserves past allocations and active locks while reoptimizing future unlocked work.
- `PLN-06` Query planning cycles and revisions with diff summaries.

## Execution and Health

- `EXE-01` Mark allocation outcome attended or missed (manual only).
- `EXE-02` Compute aspect health from attended allocation minutes versus target minutes.

## Reminders

- `REM-01` Create or update reminder (absolute datetime, in-app or email, one active reminder per channel per task).
- `REM-02` Snooze reminder (bounded snooze count).
- `REM-03` Reminder dispatch job with exponential retry.
- `REM-04` Retry exhaustion policy: 5 exponential retries (`15/30/60/120/240` minutes), then daily retry queue up to 30 days, then terminal fail.

## Data Portability

- `DAT-01` Export live planning-domain data to JSON, excluding audit and operational state.
- `DAT-02` Import planning-domain data with ID remap and reference rewrite, excluding audit recreation.

## Audit and System

- `AUD-01` Write-path audit emission for all successful mutations with redacted diffs.
- `AUD-02` Query user audit timeline (read-only).
- `SYS-01` Idempotent command handling for all create and mutate commands.
- `SYS-02` Idempotent job handling for all mutation-capable background jobs via job-run keys.

## Diagram References

- `AUTH/PRF` -> [`AUTH-01`](./sequence-diagrams/01-auth-profile.md#AUTH-01), [`AUTH-02`](./sequence-diagrams/01-auth-profile.md#AUTH-02), [`AUTH-03`](./sequence-diagrams/01-auth-profile.md#AUTH-03), [`AUTH-04`](./sequence-diagrams/01-auth-profile.md#AUTH-04), [`AUTH-05`](./sequence-diagrams/01-auth-profile.md#AUTH-05), [`AUTH-06`](./sequence-diagrams/01-auth-profile.md#AUTH-06), [`PRF-01`](./sequence-diagrams/01-auth-profile.md#PRF-01)
- `ASP/MLS` -> [`ASP-01`](./sequence-diagrams/02-aspects-milestones.md#ASP-01), [`ASP-02`](./sequence-diagrams/02-aspects-milestones.md#ASP-02), [`ASP-03`](./sequence-diagrams/02-aspects-milestones.md#ASP-03), [`ASP-04`](./sequence-diagrams/02-aspects-milestones.md#ASP-04), [`ASP-05`](./sequence-diagrams/02-aspects-milestones.md#ASP-05), [`ASP-06`](./sequence-diagrams/02-aspects-milestones.md#ASP-06), [`MLS-01`](./sequence-diagrams/02-aspects-milestones.md#MLS-01), [`MLS-02`](./sequence-diagrams/02-aspects-milestones.md#MLS-02), [`MLS-03`](./sequence-diagrams/02-aspects-milestones.md#MLS-03), [`MLS-04`](./sequence-diagrams/02-aspects-milestones.md#MLS-04), [`MLS-05`](./sequence-diagrams/02-aspects-milestones.md#MLS-05), [`MLS-06`](./sequence-diagrams/02-aspects-milestones.md#MLS-06), [`MLS-07`](./sequence-diagrams/02-aspects-milestones.md#MLS-07)
- `TSK/REC` -> [`TSK-01`](./sequence-diagrams/03-tasks-recurrence.md#TSK-01), [`TSK-02`](./sequence-diagrams/03-tasks-recurrence.md#TSK-02), [`TSK-03`](./sequence-diagrams/03-tasks-recurrence.md#TSK-03), [`TSK-04`](./sequence-diagrams/03-tasks-recurrence.md#TSK-04), [`TSK-05`](./sequence-diagrams/03-tasks-recurrence.md#TSK-05), [`TSK-06`](./sequence-diagrams/03-tasks-recurrence.md#TSK-06), [`TSK-07`](./sequence-diagrams/03-tasks-recurrence.md#TSK-07), [`TSK-08`](./sequence-diagrams/03-tasks-recurrence.md#TSK-08), [`TSK-09`](./sequence-diagrams/03-tasks-recurrence.md#TSK-09), [`TSK-10`](./sequence-diagrams/03-tasks-recurrence.md#TSK-10), [`TSK-11`](./sequence-diagrams/03-tasks-recurrence.md#TSK-11), [`REC-01`](./sequence-diagrams/03-tasks-recurrence.md#REC-01), [`REC-02`](./sequence-diagrams/03-tasks-recurrence.md#REC-02), [`REC-03`](./sequence-diagrams/03-tasks-recurrence.md#REC-03), [`REC-04`](./sequence-diagrams/03-tasks-recurrence.md#REC-04), [`REC-05`](./sequence-diagrams/03-tasks-recurrence.md#REC-05)
- `AVL/PLN` -> [`AVL-01`](./sequence-diagrams/04-availability-planning.md#AVL-01), [`AVL-02`](./sequence-diagrams/04-availability-planning.md#AVL-02), [`AVL-03`](./sequence-diagrams/04-availability-planning.md#AVL-03), [`AVL-04`](./sequence-diagrams/04-availability-planning.md#AVL-04), [`AVL-05`](./sequence-diagrams/04-availability-planning.md#AVL-05), [`PLN-01`](./sequence-diagrams/04-availability-planning.md#PLN-01), [`PLN-02`](./sequence-diagrams/04-availability-planning.md#PLN-02), [`PLN-03`](./sequence-diagrams/04-availability-planning.md#PLN-03), [`PLN-04`](./sequence-diagrams/04-availability-planning.md#PLN-04), [`PLN-05`](./sequence-diagrams/04-availability-planning.md#PLN-05), [`PLN-06`](./sequence-diagrams/04-availability-planning.md#PLN-06)
- `EXE/REM` -> [`EXE-01`](./sequence-diagrams/05-execution-reminders.md#EXE-01), [`EXE-02`](./sequence-diagrams/05-execution-reminders.md#EXE-02), [`REM-01`](./sequence-diagrams/05-execution-reminders.md#REM-01), [`REM-02`](./sequence-diagrams/05-execution-reminders.md#REM-02), [`REM-03`](./sequence-diagrams/05-execution-reminders.md#REM-03), [`REM-04`](./sequence-diagrams/05-execution-reminders.md#REM-04)
- `DAT/AUD/SYS` -> [`DAT-01`](./sequence-diagrams/06-data-audit-system.md#DAT-01), [`DAT-02`](./sequence-diagrams/06-data-audit-system.md#DAT-02), [`AUD-01`](./sequence-diagrams/06-data-audit-system.md#AUD-01), [`AUD-02`](./sequence-diagrams/06-data-audit-system.md#AUD-02), [`SYS-01`](./sequence-diagrams/06-data-audit-system.md#SYS-01), [`SYS-02`](./sequence-diagrams/06-data-audit-system.md#SYS-02)

## Per-Interaction Error Contract

- `AUTH-01`: `VALIDATION_FAILED`
- `AUTH-02`: `VALIDATION_FAILED`
- `AUTH-03`: `AUTH_UNAUTHORIZED`, `NOT_FOUND`
- `AUTH-04`: none (job-only)
- `AUTH-05`: `VALIDATION_FAILED`
- `AUTH-06`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`
- `PRF-01`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `VALIDATION_FAILED`, `CONFLICT_STALE_WRITE`

- `ASP-01`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `VALIDATION_FAILED`
- `ASP-02`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `STATE_TRANSITION_INVALID`, `VALIDATION_FAILED`, `OWNERSHIP_VIOLATION`, `CONFLICT_STALE_WRITE`
- `ASP-03`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `VALIDATION_FAILED`, `OWNERSHIP_VIOLATION`, `CONFLICT_STALE_WRITE`
- `ASP-04`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `STATE_TRANSITION_INVALID`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`
- `ASP-05`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `STATE_TRANSITION_INVALID`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`
- `ASP-06`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `QUERY_CURSOR_INVALID`

- `MLS-01`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `VALIDATION_FAILED`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`
- `MLS-02`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `VALIDATION_FAILED`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`
- `MLS-03`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `STATE_TRANSITION_INVALID`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`
- `MLS-04`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `STATE_TRANSITION_INVALID`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`
- `MLS-05`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `STATE_TRANSITION_INVALID`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`
- `MLS-06`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `STATE_TRANSITION_INVALID`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`
- `MLS-07`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `QUERY_CURSOR_INVALID`

- `TSK-01`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `VALIDATION_FAILED`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`
- `TSK-02`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `VALIDATION_FAILED`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`
- `TSK-03`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `VALIDATION_FAILED`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`
- `TSK-04`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `STATE_TRANSITION_INVALID`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`
- `TSK-05`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `STATE_TRANSITION_INVALID`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`
- `TSK-06`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `STATE_TRANSITION_INVALID`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`
- `TSK-07`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `STATE_TRANSITION_INVALID`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`
- `TSK-08`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `STATE_TRANSITION_INVALID`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`
- `TSK-09`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `VALIDATION_FAILED`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`
- `TSK-10`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `QUERY_CURSOR_INVALID`
- `TSK-11`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`

- `REC-01`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `VALIDATION_FAILED`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`
- `REC-02`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `STATE_TRANSITION_INVALID`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`
- `REC-03`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `VALIDATION_FAILED`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`
- `REC-04`: `STATE_TRANSITION_INVALID`, `VALIDATION_FAILED`
- `REC-05`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `STATE_TRANSITION_INVALID`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`

- `AVL-01`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `VALIDATION_FAILED`, `OWNERSHIP_VIOLATION`
- `AVL-02`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `VALIDATION_FAILED`, `OWNERSHIP_VIOLATION`
- `AVL-03`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `VALIDATION_FAILED`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`
- `AVL-04`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `STATE_TRANSITION_INVALID`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`
- `AVL-05`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`

- `PLN-01`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `VALIDATION_FAILED`, `TARGET_PERCENT_TOTAL_INVALID`, `LOCK_CONFLICT`
- `PLN-02`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `STATE_TRANSITION_INVALID`, `TARGET_PERCENT_TOTAL_INVALID`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`
- `PLN-03`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `STATE_TRANSITION_INVALID`, `LOCK_CONFLICT`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`
- `PLN-04`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `LOCK_CONFLICT`, `STATE_TRANSITION_INVALID`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`
- `PLN-05`: `LOCK_CONFLICT`
- `PLN-06`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `QUERY_CURSOR_INVALID`

- `EXE-01`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `VALIDATION_FAILED`, `NOT_FOUND`, `OWNERSHIP_VIOLATION`, `CONFLICT_STALE_WRITE`
- `EXE-02`: none (job-only)

- `REM-01`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `VALIDATION_FAILED`, `NOT_FOUND`, `OWNERSHIP_VIOLATION`, `CONFLICT_STALE_WRITE`
- `REM-02`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `STATE_TRANSITION_INVALID`, `SNOOZE_LIMIT_EXCEEDED`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`, `CONFLICT_STALE_WRITE`
- `REM-03`: `RETRY_EXHAUSTED`
- `REM-04`: `RETRY_EXHAUSTED`

- `DAT-01`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`
- `DAT-02`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `VALIDATION_FAILED`, `IMPORT_CONFLICT_REMAP_FAILED`

- `AUD-01`: `VALIDATION_FAILED`
- `AUD-02`: `AUTH_UNAUTHORIZED`, `AUTH_SESSION_EXPIRED`, `QUERY_CURSOR_INVALID`
- `SYS-01`: `VALIDATION_FAILED`, `IDEMPOTENCY_HASH_MISMATCH`
- `SYS-02`: `VALIDATION_FAILED`, `IDEMPOTENCY_HASH_MISMATCH`
