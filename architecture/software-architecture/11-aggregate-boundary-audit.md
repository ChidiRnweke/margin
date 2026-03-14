# Aggregate Boundary Audit

This file audits each aggregate choice against the ERD, interaction flows, and invariants so the software architecture does not rely on undocumented intuition.

## Audit Method

For each domain cluster, the boundary test is:

- Does the entity have an independent lifecycle?
- Is it mutated independently in the interaction matrix?
- Must it be persisted atomically with another entity to preserve invariants?
- Is it queried independently often enough to justify a root?
- Are cascades within the same aggregate or cross-aggregate orchestration?

## UserAccount

- Root: `User`
- Children: none
- Evidence:
  - ERD shows `USER` as the source owner for most other records.
  - `AUTH-02` creates user independently.
  - `AUTH-06` deletes user after dependent data is erased.
- Decision: root.
- Reason: top-level identity lifecycle.

## PlanningProfile

- Root: `PlanningProfile`
- Evidence:
  - one-to-one with `USER` in ERD
  - independently updated in `PRF-01`
  - `INV-020` says it exists from account creation onward
- Decision: standalone root, not child embedded in `User` repository.
- Reason: direct mutation flow and isolated concurrency boundary.

## Session

- Root: `Session`
- Evidence:
  - created in `AUTH-02`
  - revoked in `AUTH-03`
  - expired in `AUTH-04`
- Decision: standalone root.
- Reason: independent security lifecycle.

## Aspect

- Candidate choices considered:
  - root containing milestones, tasks, recurring series as children
  - standalone root referenced by those entities
- Evidence against giant aggregate:
  - `MLS-02`, `TSK-02`, `REC-02`, `REC-03`, `REM-01`, `PLN-04` all imply independent updates to downstream entities.
  - making them all children of `Aspect` would force unrelated task/reminder/recurrence updates through one oversized transaction boundary.
  - `INV-035` is a cascade rule, but cascade alone does not require same-aggregate persistence.
- Decision: `Aspect` is a root, but cascade operations are orchestrated by `IAspectService` across aggregates.

## Milestone

- Candidate choices considered:
  - child of `Aspect`
  - standalone root referencing `Aspect`
- Evidence:
  - `MLS-01..07` define milestone-specific lifecycle and query flows.
  - `INV-042` depends on child tasks, but this is a service-level check across task records, not proof of one transactional aggregate.
  - `MLS-07` queries milestones independently.
- Decision: standalone root.
- Reason: independent lifecycle and query behavior outweigh conceptual containment.

## Task

- Candidate choices considered:
  - child of `Aspect`
  - child of `Milestone`
  - standalone root
- Evidence:
  - `TSK-01..11` define a rich independent lifecycle.
  - tasks interact with planning, reminders, recurrence, and allocation outcomes.
  - `INV-061` and `INV-062` constrain milestone movement by same-aspect rules, which indicates reference integrity across aggregates rather than containment.
  - `INV-064` and `INV-065` create cross-aggregate side effects to planning and reminders.
- Decision: standalone root.
- Reason: clearly independent lifecycle and heavy cross-domain coordination.

## TaskLock

- Candidate choices considered:
  - child of `Task`
  - child of `PlanningCycle`
  - standalone root
- Evidence:
  - ERD links `TASK ||--o{ TASK_LOCK`
  - `INV-115` is phrased per task: at most one active lock per task.
  - planning uses active locks as constraints, but task identity owns the semantic rule.
- Decision: child of `Task` aggregate.
- Reason: the cardinality and invariant are task-scoped.

## RecurringTaskSeries

- Root: `RecurringTaskSeries`
- Children: `RecurrenceRule`, `RecurrenceException`
- Evidence:
  - ERD shows one series to one rule, one rule to many exceptions.
  - `REC-01..05` operate on series/rule/exception as one lifecycle cluster.
  - `INV-073` requires exactly one rule while active.
  - `INV-077` requires explicit exception records attached to the rule.
- Decision: root with contained children.
- Reason: strong transactional coupling and no independent child lifecycle.

## AvailabilityBlock

- Root: `AvailabilityBlock`
- Children: `AvailabilityException`
- Evidence:
  - ERD shows block-to-exception containment.
  - `AVL-01..05` define one availability lifecycle with exception attachment.
  - `INV-093` binds exceptions to recurring availability.
- Decision: root with contained children.

## PlanningCycle

- Candidate choices considered:
  - one large root containing revisions, allocations, outcomes, health
  - separate roots for revision, allocation, outcome, health
- Evidence for one aggregate:
  - ERD ties `PLANNING_CYCLE` to revisions, current revision, and health.
  - revisions are immutable historical snapshots under one cycle.
  - `INV-104`, `INV-105`, `INV-106`, `INV-107`, `INV-121` all require internal consistency of revision history.
  - `PLN-01..06` all operate in terms of cycle-with-revisions.
  - `EXE-01` and `EXE-02` write outcome/health into cycle history.
- Decision: `PlanningCycle` root with `PlanningRevision`, `TaskAllocation`, `AllocationOutcome`, and `AspectCycleHealth` inside the same repository boundary.
- Reason: revision history consistency is more important than carving out smaller roots.

## TaskAllocation

- Decision: child of `PlanningCycle`, not standalone root.
- Evidence:
  - allocations are created as part of revisions in `PLN-01`, replaced in `PLN-03`, mutated through revision creation in `PLN-04`.
  - `INV-120` says allocation edits create a new revision, which makes them cycle-history artifacts rather than independent entities.

## AllocationOutcome

- Decision: child of `PlanningCycle`, attached through `TaskAllocation`.
- Evidence:
  - ERD shows `TASK_ALLOCATION ||--o| ALLOCATION_OUTCOME`.
  - `INV-131` is per allocation, but the outcome is still part of cycle traceability.
  - `EXE-01` marks an outcome on an allocation that belongs to a revisioned plan.

## AspectCycleHealth

- Decision: child of `PlanningCycle`.
- Evidence:
  - ERD shows `PLANNING_CYCLE ||--o{ ASPECT_CYCLE_HEALTH`.
  - `INV-133` says health is stored per aspect per cycle for traceability.
- Reason: cycle-scoped historical computation, not an independent lifecycle root.

## Reminder

- Candidate choices considered:
  - child of `Task`
  - standalone root referencing `Task`
- Evidence:
  - ERD shows `TASK ||--o{ REMINDER`, but reminder has its own retry lifecycle and attempts.
  - `REM-01..04` operate directly on reminders independent of task mutation.
  - jobs fetch reminders due now without going through tasks.
  - `INV-143` is a per-task-per-channel uniqueness rule, but reminders still have a separate operational lifecycle.
- Decision: standalone root referencing `Task`.
- Reason: dispatch and retry behavior justify independent loading and mutation.

## ReminderAttempt

- Decision: child of `Reminder`.
- Evidence:
  - attempts are append-only history of reminder delivery.
  - no independent lifecycle or query interaction in the interaction matrix.

## ImportJob and ExportJob

- Decision: standalone roots.
- Evidence:
  - directly started and status-tracked in `DAT-01` and `DAT-02`.
  - `INV-189` defines their lifecycle transitions independently.

## AuditEvent

- Decision: standalone root.
- Evidence:
  - append-only timeline queried independently in `AUD-02`.
  - emitted cross-cuttingly across all writes.

## IdempotencyKey

- Decision: standalone root.
- Evidence:
  - `SYS-01` manages it as a distinct infrastructure record.
  - lifecycle is orthogonal to business aggregates.

## SystemJobRun

- Decision: standalone root.
- Evidence:
  - `SYS-02` manages job-run keys and results independently of business aggregates.

## Boundary Conclusions

- The architecture intentionally avoids a giant ownership-shaped aggregate tree.
- Ownership does not imply repository containment.
- Repository boundaries follow mutation independence and invariant locality, not just ERD cardinality.
- Cross-aggregate cascades are handled in services when the domain requires coordinated side effects.

## Final Aggregate Set

- `User`
- `PlanningProfile`
- `Session`
- `Aspect`
- `Milestone`
- `Task` + `TaskLock`
- `RecurringTaskSeries` + `RecurrenceRule` + `RecurrenceException`
- `AvailabilityBlock` + `AvailabilityException`
- `PlanningCycle` + `PlanningRevision` + `TaskAllocation` + `AllocationOutcome` + `AspectCycleHealth`
- `Reminder` + `ReminderAttempt`
- `ImportJob`
- `ExportJob`
- `AuditEvent`
- `IdempotencyKey`
- `SystemJobRun`
