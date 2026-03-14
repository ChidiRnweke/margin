# Traceability Matrix

## Concern-Level Traceability

| Concern                             | Interactions                                                     | Primary Entities                                                                                                      | Governing Invariants                           |
| ----------------------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Identity and access                 | `AUTH-01` to `AUTH-06`, `PRF-01`                                 | `USER`, `SESSION`, `PLANNING_PROFILE`                                                                                 | `INV-001` to `INV-026`                         |
| Aspects and milestones              | `ASP-01` to `ASP-06`, `MLS-01` to `MLS-07`                       | `ASPECT`, `MILESTONE`, `TASK`                                                                                         | `INV-030` to `INV-045`, `INV-050` to `INV-065` |
| Tasks and recurrence                | `TSK-01` to `TSK-11`, `REC-01` to `REC-05`                       | `TASK`, `RECURRING_TASK_SERIES`, `RECURRENCE_RULE`, `RECURRENCE_EXCEPTION`                                            | `INV-050` to `INV-089`, `INV-180` to `INV-185` |
| Availability and planning           | `AVL-01` to `AVL-05`, `PLN-01` to `PLN-06`                       | `AVAILABILITY_BLOCK`, `AVAILABILITY_EXCEPTION`, `PLANNING_CYCLE`, `PLANNING_REVISION`, `TASK_ALLOCATION`, `TASK_LOCK` | `INV-090` to `INV-126`, `INV-187` to `INV-189` |
| Execution and reminders             | `EXE-01` to `EXE-02`, `REM-01` to `REM-04`                       | `TASK_ALLOCATION`, `ALLOCATION_OUTCOME`, `ASPECT_CYCLE_HEALTH`, `REMINDER`, `REMINDER_ATTEMPT`                        | `INV-130` to `INV-149`                         |
| Portability, audit, and idempotency | `DAT-01` to `DAT-02`, `AUD-01` to `AUD-02`, `SYS-01` to `SYS-02` | `IMPORT_JOB`, `EXPORT_JOB`, `AUDIT_EVENT`, `IDEMPOTENCY_KEY`, `SYSTEM_JOB_RUN`                                        | `INV-160` to `INV-189`                         |

## Cross-Cutting Guarantees

- Every create and mutate interaction is governed by idempotency and optimistic concurrency invariants.
- Every successful mutation emits one audit event until GDPR erasure permanently removes the user's audit history.
- Every query interaction is bound by cursor-shape validity and ownership scope.
- Every lifecycle transition with a terminal or protected state has an explicit failure path in its sequence diagram.
