# Interaction Matrix

All interactions use typed domain errors. Command interactions require idempotency keys (`SYS-01`).

## Error Code Set

- `AUTH_UNAUTHORIZED`
- `AUTH_SESSION_EXPIRED`
- `VALIDATION_FAILED`
- `STATE_TRANSITION_INVALID`
- `OWNERSHIP_VIOLATION`
- `NOT_FOUND`
- `TARGET_PERCENT_TOTAL_INVALID`
- `CONFLICT_STALE_WRITE`
- `CAPACITY_EXCEEDED`
- `LOCK_CONFLICT`
- `IMPORT_CONFLICT_REMAP_FAILED`
- `RETRY_EXHAUSTED`

## Identity and Profile

- `AUTH-01` Identity sign-in start: user initiates sign-in, system creates pending identity context.
- `AUTH-02` Identity callback: system resolves identity, creates or links user, creates session.
- `AUTH-03` Logout: revokes current session token.
- `AUTH-04` Session expiry: background job invalidates sessions past max lifetime.
- `AUTH-05` First-run wizard completion: requires at least one active aspect before app entry.
- `PRF-01` Update planning profile: updates slider weights, urgency threshold, min chunk, default effort.

## Aspect

- `ASP-01` Create aspect in Draft.
- `ASP-02` Activate aspect: blocked if active target percentages would not total 100 after change.
- `ASP-03` Update aspect metadata and target percentage.
- `ASP-04` Archive aspect: cascades archive to child milestones and tasks.
- `ASP-05` Restore aspect: restores prior state; child entities restored according to prior states.
- `ASP-06` Query aspects: key query with status/date filters and cursor pagination.

## Milestone

- `MLS-01` Create milestone in active aspect.
- `MLS-02` Update milestone metadata.
- `MLS-03` Complete milestone: allowed only when all child tasks are Done.
- `MLS-04` Reopen milestone: `Done -> Open`.
- `MLS-05` Archive milestone: cascades archive to child tasks.
- `MLS-06` Restore milestone to prior state.
- `MLS-07` Query milestones by aspect/status/date.

## Task

- `TSK-01` Create task: title required; defaults from profile and aspect.
- `TSK-02` Update task fields: due date, effort, remaining minutes, importance, split override.
- `TSK-03` Move task between milestones in same aspect only.
- `TSK-04` Start task: manual `Backlog -> InProgress`.
- `TSK-05` Complete task: force complete allowed even when remaining minutes > 0.
- `TSK-06` Reopen task: `Done -> Backlog`, keep history, cancel active future allocations.
- `TSK-07` Archive task.
- `TSK-08` Restore task to prior state.
- `TSK-09` Bulk task mutation: archive/status/move-milestone in one command.
- `TSK-10` Query/search tasks: status/date/aspect filters, case-insensitive substring search, default excludes done+archived.
- `TSK-11` Read task detail.

## Recurrence

- `REC-01` Attach or update recurrence rule (daily/weekly/monthly).
- `REC-02` Pause or resume recurrence.
- `REC-03` Skip next recurrence occurrence.
- `REC-04` Generate next instance on task completion.

## Availability

- `AVL-01` Create one-off availability block.
- `AVL-02` Create recurring availability block.
- `AVL-03` Add recurring exception (skip/override specific date).
- `AVL-04` Update/archive/restore availability block.
- `AVL-05` Query effective availability: merge overlaps and apply exceptions.

## Planning

- `PLN-01` Generate draft weekly plan (ISO week Monday start).
- `PLN-02` Confirm draft plan.
- `PLN-03` Regenerate confirmed plan into new revision; prior revision superseded.
- `PLN-04` Edit allocations: lock/unlock/cancel/reslot with revision stamp.
- `PLN-05` Day-boundary replan job.
- `PLN-06` Query planning cycles and revisions.

## Execution and Health

- `EXE-01` Mark allocation outcome attended or missed (manual only).
- `EXE-02` Compute aspect health from completed minutes vs target minutes.

## Reminders

- `REM-01` Create or update reminder (absolute datetime, in-app/email).
- `REM-02` Snooze reminder (bounded snooze count).
- `REM-03` Reminder dispatch job with exponential retry.
- `REM-04` Retry exhaustion policy: daily retry queue up to 30 days then terminal fail.

## Data Portability

- `DAT-01` Export all domain data to JSON.
- `DAT-02` Import data: conflicting IDs are remapped to new IDs and references are rewritten.

## Audit and System

- `AUD-01` Write-path audit emission for all mutations with redacted diffs.
- `AUD-02` Query user audit timeline (read-only).
- `SYS-01` Idempotent command handling for all create/mutate commands.

## Diagram References

- `AUTH/PRF` -> [`AUTH-01`](./sequence-diagrams/01-auth-profile.md#AUTH-01), [`AUTH-02`](./sequence-diagrams/01-auth-profile.md#AUTH-02), [`AUTH-03`](./sequence-diagrams/01-auth-profile.md#AUTH-03), [`AUTH-04`](./sequence-diagrams/01-auth-profile.md#AUTH-04), [`AUTH-05`](./sequence-diagrams/01-auth-profile.md#AUTH-05), [`PRF-01`](./sequence-diagrams/01-auth-profile.md#PRF-01)
- `ASP/MLS` -> [`ASP-01`](./sequence-diagrams/02-aspects-milestones.md#ASP-01), [`ASP-02`](./sequence-diagrams/02-aspects-milestones.md#ASP-02), [`ASP-03`](./sequence-diagrams/02-aspects-milestones.md#ASP-03), [`ASP-04`](./sequence-diagrams/02-aspects-milestones.md#ASP-04), [`ASP-05`](./sequence-diagrams/02-aspects-milestones.md#ASP-05), [`ASP-06`](./sequence-diagrams/02-aspects-milestones.md#ASP-06), [`MLS-01`](./sequence-diagrams/02-aspects-milestones.md#MLS-01), [`MLS-02`](./sequence-diagrams/02-aspects-milestones.md#MLS-02), [`MLS-03`](./sequence-diagrams/02-aspects-milestones.md#MLS-03), [`MLS-04`](./sequence-diagrams/02-aspects-milestones.md#MLS-04), [`MLS-05`](./sequence-diagrams/02-aspects-milestones.md#MLS-05), [`MLS-06`](./sequence-diagrams/02-aspects-milestones.md#MLS-06), [`MLS-07`](./sequence-diagrams/02-aspects-milestones.md#MLS-07)
- `TSK/REC` -> [`TSK-01`](./sequence-diagrams/03-tasks-recurrence.md#TSK-01), [`TSK-02`](./sequence-diagrams/03-tasks-recurrence.md#TSK-02), [`TSK-03`](./sequence-diagrams/03-tasks-recurrence.md#TSK-03), [`TSK-04`](./sequence-diagrams/03-tasks-recurrence.md#TSK-04), [`TSK-05`](./sequence-diagrams/03-tasks-recurrence.md#TSK-05), [`TSK-06`](./sequence-diagrams/03-tasks-recurrence.md#TSK-06), [`TSK-07`](./sequence-diagrams/03-tasks-recurrence.md#TSK-07), [`TSK-08`](./sequence-diagrams/03-tasks-recurrence.md#TSK-08), [`TSK-09`](./sequence-diagrams/03-tasks-recurrence.md#TSK-09), [`TSK-10`](./sequence-diagrams/03-tasks-recurrence.md#TSK-10), [`TSK-11`](./sequence-diagrams/03-tasks-recurrence.md#TSK-11), [`REC-01`](./sequence-diagrams/03-tasks-recurrence.md#REC-01), [`REC-02`](./sequence-diagrams/03-tasks-recurrence.md#REC-02), [`REC-03`](./sequence-diagrams/03-tasks-recurrence.md#REC-03), [`REC-04`](./sequence-diagrams/03-tasks-recurrence.md#REC-04)
- `AVL/PLN` -> [`AVL-01`](./sequence-diagrams/04-availability-planning.md#AVL-01), [`AVL-02`](./sequence-diagrams/04-availability-planning.md#AVL-02), [`AVL-03`](./sequence-diagrams/04-availability-planning.md#AVL-03), [`AVL-04`](./sequence-diagrams/04-availability-planning.md#AVL-04), [`AVL-05`](./sequence-diagrams/04-availability-planning.md#AVL-05), [`PLN-01`](./sequence-diagrams/04-availability-planning.md#PLN-01), [`PLN-02`](./sequence-diagrams/04-availability-planning.md#PLN-02), [`PLN-03`](./sequence-diagrams/04-availability-planning.md#PLN-03), [`PLN-04`](./sequence-diagrams/04-availability-planning.md#PLN-04), [`PLN-05`](./sequence-diagrams/04-availability-planning.md#PLN-05), [`PLN-06`](./sequence-diagrams/04-availability-planning.md#PLN-06)
- `EXE/REM` -> [`EXE-01`](./sequence-diagrams/05-execution-reminders.md#EXE-01), [`EXE-02`](./sequence-diagrams/05-execution-reminders.md#EXE-02), [`REM-01`](./sequence-diagrams/05-execution-reminders.md#REM-01), [`REM-02`](./sequence-diagrams/05-execution-reminders.md#REM-02), [`REM-03`](./sequence-diagrams/05-execution-reminders.md#REM-03), [`REM-04`](./sequence-diagrams/05-execution-reminders.md#REM-04)
- `DAT/AUD/SYS` -> [`DAT-01`](./sequence-diagrams/06-data-audit-system.md#DAT-01), [`DAT-02`](./sequence-diagrams/06-data-audit-system.md#DAT-02), [`AUD-01`](./sequence-diagrams/06-data-audit-system.md#AUD-01), [`AUD-02`](./sequence-diagrams/06-data-audit-system.md#AUD-02), [`SYS-01`](./sequence-diagrams/06-data-audit-system.md#SYS-01)

## Per-Interaction Error Contract

- `AUTH-01`: `AUTH_UNAUTHORIZED`, `VALIDATION_FAILED`
- `AUTH-02`: `AUTH_UNAUTHORIZED`, `VALIDATION_FAILED`
- `AUTH-03`: `AUTH_UNAUTHORIZED`, `NOT_FOUND`
- `AUTH-04`: none (job-only)
- `AUTH-05`: `TARGET_PERCENT_TOTAL_INVALID`, `VALIDATION_FAILED`
- `PRF-01`: `AUTH_UNAUTHORIZED`, `VALIDATION_FAILED`

- `ASP-01`: `AUTH_UNAUTHORIZED`, `VALIDATION_FAILED`
- `ASP-02`: `TARGET_PERCENT_TOTAL_INVALID`, `STATE_TRANSITION_INVALID`, `OWNERSHIP_VIOLATION`
- `ASP-03`: `TARGET_PERCENT_TOTAL_INVALID`, `VALIDATION_FAILED`, `OWNERSHIP_VIOLATION`
- `ASP-04`: `STATE_TRANSITION_INVALID`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`
- `ASP-05`: `STATE_TRANSITION_INVALID`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`
- `ASP-06`: `AUTH_UNAUTHORIZED`

- `MLS-01`: `VALIDATION_FAILED`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`
- `MLS-02`: `VALIDATION_FAILED`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`
- `MLS-03`: `STATE_TRANSITION_INVALID`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`
- `MLS-04`: `STATE_TRANSITION_INVALID`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`
- `MLS-05`: `STATE_TRANSITION_INVALID`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`
- `MLS-06`: `STATE_TRANSITION_INVALID`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`
- `MLS-07`: `AUTH_UNAUTHORIZED`

- `TSK-01`: `VALIDATION_FAILED`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`
- `TSK-02`: `VALIDATION_FAILED`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`
- `TSK-03`: `VALIDATION_FAILED`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`
- `TSK-04`: `STATE_TRANSITION_INVALID`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`
- `TSK-05`: `STATE_TRANSITION_INVALID`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`
- `TSK-06`: `STATE_TRANSITION_INVALID`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`
- `TSK-07`: `STATE_TRANSITION_INVALID`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`
- `TSK-08`: `STATE_TRANSITION_INVALID`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`
- `TSK-09`: `VALIDATION_FAILED`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`
- `TSK-10`: `AUTH_UNAUTHORIZED`
- `TSK-11`: `OWNERSHIP_VIOLATION`, `NOT_FOUND`

- `REC-01`: `VALIDATION_FAILED`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`
- `REC-02`: `STATE_TRANSITION_INVALID`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`
- `REC-03`: `VALIDATION_FAILED`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`
- `REC-04`: `STATE_TRANSITION_INVALID`

- `AVL-01`: `VALIDATION_FAILED`, `OWNERSHIP_VIOLATION`
- `AVL-02`: `VALIDATION_FAILED`, `OWNERSHIP_VIOLATION`
- `AVL-03`: `VALIDATION_FAILED`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`
- `AVL-04`: `STATE_TRANSITION_INVALID`, `OWNERSHIP_VIOLATION`, `NOT_FOUND`
- `AVL-05`: `AUTH_UNAUTHORIZED`

- `PLN-01`: `VALIDATION_FAILED`, `CAPACITY_EXCEEDED`, `LOCK_CONFLICT`
- `PLN-02`: `STATE_TRANSITION_INVALID`, `NOT_FOUND`
- `PLN-03`: `STATE_TRANSITION_INVALID`, `LOCK_CONFLICT`, `NOT_FOUND`
- `PLN-04`: `LOCK_CONFLICT`, `STATE_TRANSITION_INVALID`, `NOT_FOUND`
- `PLN-05`: `LOCK_CONFLICT`
- `PLN-06`: `AUTH_UNAUTHORIZED`

- `EXE-01`: `VALIDATION_FAILED`, `NOT_FOUND`, `OWNERSHIP_VIOLATION`
- `EXE-02`: none (job-only)

- `REM-01`: `VALIDATION_FAILED`, `NOT_FOUND`, `OWNERSHIP_VIOLATION`
- `REM-02`: `STATE_TRANSITION_INVALID`, `VALIDATION_FAILED`, `NOT_FOUND`
- `REM-03`: `RETRY_EXHAUSTED`
- `REM-04`: `RETRY_EXHAUSTED`

- `DAT-01`: `AUTH_UNAUTHORIZED`
- `DAT-02`: `VALIDATION_FAILED`, `IMPORT_CONFLICT_REMAP_FAILED`

- `AUD-01`: `VALIDATION_FAILED`
- `AUD-02`: `AUTH_UNAUTHORIZED`
- `SYS-01`: `VALIDATION_FAILED`
