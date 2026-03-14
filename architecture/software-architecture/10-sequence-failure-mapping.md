# Sequence Failure Mapping

This file converts the failure paths in `architecture/sequence-diagrams/*.md` into exact architectural raising points.

## Identity and Profile

| Interaction | Failure Path                   | Error Type                   | Raised By                                             |
| ----------- | ------------------------------ | ---------------------------- | ----------------------------------------------------- |
| `AUTH-01`   | invalid provider request       | `InputError`                 | `IIdentityProviderGateway.build_sign_in_request`      |
| `AUTH-02`   | claims invalid or unverifiable | `InputError`                 | `IAuthService.resolve_identity_callback`              |
| `AUTH-03`   | session missing                | `NotFoundError`              | `ISessionRepository.revoke` via `IAuthService.logout` |
| `AUTH-06`   | session invalid or expired     | `SessionExpiredError`        | auth middleware                                       |
| `AUTH-05`   | no active aspects              | `InputError`                 | `IProfileService.complete_onboarding`                 |
| `PRF-01`    | values outside allowed ranges  | `InputError`                 | `IProfileService.update_planning_profile`             |
| `PRF-01`    | stale version                  | `OptimisticConcurrencyError` | `IPlanningProfileRepository.save`                     |

## Aspect and Milestone

| Interaction | Failure Path                      | Error Type                   | Raised By                              |
| ----------- | --------------------------------- | ---------------------------- | -------------------------------------- |
| `ASP-01`    | missing required metadata         | `InputError`                 | `IAspectService.create_aspect`         |
| `ASP-02`    | aspect not owned by user          | `OwnershipError`             | `AuthorizationScope`                   |
| `ASP-02`    | stale version                     | `OptimisticConcurrencyError` | `IAspectRepository.save`               |
| `ASP-02`    | status is not Draft               | `StateTransitionError`       | `IAspectService.activate_aspect`       |
| `ASP-02`    | target or metadata invalid        | `InputError`                 | `IAspectService.activate_aspect`       |
| `ASP-03`    | aspect not found                  | `NotFoundError`              | `IAspectRepository.find_by_id`         |
| `ASP-03`    | aspect not owned by user          | `OwnershipError`             | `AuthorizationScope`                   |
| `ASP-03`    | stale version                     | `OptimisticConcurrencyError` | `IAspectRepository.save`               |
| `ASP-03`    | update violates field constraints | `InputError`                 | `IAspectService.update_aspect`         |
| `ASP-04`    | aspect not found                  | `NotFoundError`              | `IAspectRepository.find_by_id`         |
| `ASP-04`    | aspect already archived           | `StateTransitionError`       | `IAspectService.archive_aspect`        |
| `ASP-04`    | stale version                     | `OptimisticConcurrencyError` | `IAspectRepository.archive`            |
| `ASP-05`    | aspect not found                  | `NotFoundError`              | `IAspectRepository.find_by_id`         |
| `ASP-05`    | aspect is not Archived            | `StateTransitionError`       | `IAspectService.restore_aspect`        |
| `ASP-05`    | stale version                     | `OptimisticConcurrencyError` | `IAspectRepository.restore_to_draft`   |
| `ASP-06`    | cursor does not match query shape | `CursorShapeError`           | `CursorQueryShapePolicy`               |
| `MLS-01`    | aspect not found                  | `NotFoundError`              | `IAspectRepository.find_by_id`         |
| `MLS-01`    | aspect not owned by user          | `OwnershipError`             | `AuthorizationScope`                   |
| `MLS-01`    | aspect not active                 | `InputError`                 | `IMilestoneService.create_milestone`   |
| `MLS-02`    | milestone not found               | `NotFoundError`              | `IMilestoneRepository.find_by_id`      |
| `MLS-02`    | milestone not owned by user       | `OwnershipError`             | `AuthorizationScope`                   |
| `MLS-02`    | stale version                     | `OptimisticConcurrencyError` | `IMilestoneRepository.save`            |
| `MLS-02`    | invalid metadata                  | `InputError`                 | `IMilestoneService.update_milestone`   |
| `MLS-03`    | milestone not found               | `NotFoundError`              | `IMilestoneRepository.find_by_id`      |
| `MLS-03`    | milestone not owned by user       | `OwnershipError`             | `AuthorizationScope`                   |
| `MLS-03`    | stale version                     | `OptimisticConcurrencyError` | `IMilestoneRepository.save`            |
| `MLS-03`    | any child task not done           | `StateTransitionError`       | `IMilestoneService.complete_milestone` |
| `MLS-04`    | milestone not found               | `NotFoundError`              | `IMilestoneRepository.find_by_id`      |
| `MLS-04`    | milestone not owned by user       | `OwnershipError`             | `AuthorizationScope`                   |
| `MLS-04`    | milestone status is not Done      | `StateTransitionError`       | `IMilestoneService.reopen_milestone`   |
| `MLS-04`    | stale version                     | `OptimisticConcurrencyError` | `IMilestoneRepository.save`            |
| `MLS-05`    | milestone not found               | `NotFoundError`              | `IMilestoneRepository.find_by_id`      |
| `MLS-05`    | milestone not owned by user       | `OwnershipError`             | `AuthorizationScope`                   |
| `MLS-05`    | milestone already archived        | `StateTransitionError`       | `IMilestoneService.archive_milestone`  |
| `MLS-05`    | stale version                     | `OptimisticConcurrencyError` | `IMilestoneRepository.archive`         |
| `MLS-06`    | milestone not found               | `NotFoundError`              | `IMilestoneRepository.find_by_id`      |
| `MLS-06`    | milestone not owned by user       | `OwnershipError`             | `AuthorizationScope`                   |
| `MLS-06`    | milestone is not Archived         | `StateTransitionError`       | `IMilestoneService.restore_milestone`  |
| `MLS-06`    | stale version                     | `OptimisticConcurrencyError` | `IMilestoneRepository.restore_to_open` |
| `MLS-07`    | cursor does not match query shape | `CursorShapeError`           | `CursorQueryShapePolicy`               |

## Tasks and Recurrence

| Interaction | Failure Path                                   | Error Type                                 | Raised By                                         |
| ----------- | ---------------------------------------------- | ------------------------------------------ | ------------------------------------------------- |
| `TSK-01`    | aspect missing                                 | `NotFoundError`                            | `IAspectRepository.find_by_id`                    |
| `TSK-01`    | aspect not owned by user                       | `OwnershipError`                           | `AuthorizationScope`                              |
| `TSK-01`    | aspect not active                              | `InputError`                               | `ITaskService.create_task`                        |
| `TSK-01`    | milestone not found or mismatched              | `InputError`                               | `ITaskService.create_task`                        |
| `TSK-02`    | task not found                                 | `NotFoundError`                            | `ITaskRepository.find_by_id`                      |
| `TSK-02`    | task not owned by user                         | `OwnershipError`                           | `AuthorizationScope`                              |
| `TSK-02`    | stale version                                  | `OptimisticConcurrencyError`               | `ITaskRepository.save`                            |
| `TSK-02`    | invalid ranges or forbidden state edit         | `InputError`                               | `ITaskService.update_task`                        |
| `TSK-03`    | task not found                                 | `NotFoundError`                            | `ITaskRepository.find_by_id`                      |
| `TSK-03`    | task not owned by user                         | `OwnershipError`                           | `AuthorizationScope`                              |
| `TSK-03`    | stale version                                  | `OptimisticConcurrencyError`               | `ITaskRepository.save`                            |
| `TSK-03`    | target milestone not found or different aspect | `InputError`                               | `ITaskService.move_task_milestone`                |
| `TSK-04`    | task not found                                 | `NotFoundError`                            | `ITaskRepository.find_by_id`                      |
| `TSK-04`    | task not owned by user                         | `OwnershipError`                           | `AuthorizationScope`                              |
| `TSK-04`    | stale version                                  | `OptimisticConcurrencyError`               | `ITaskRepository.save`                            |
| `TSK-04`    | status is not Backlog                          | `StateTransitionError`                     | `ITaskService.start_task`                         |
| `TSK-05`    | task not found                                 | `NotFoundError`                            | `ITaskRepository.find_by_id`                      |
| `TSK-05`    | task not owned by user                         | `OwnershipError`                           | `AuthorizationScope`                              |
| `TSK-05`    | stale version                                  | `OptimisticConcurrencyError`               | `ITaskRepository.save`                            |
| `TSK-05`    | task already archived                          | `StateTransitionError`                     | `ITaskService.complete_task`                      |
| `TSK-06`    | task not found                                 | `NotFoundError`                            | `ITaskRepository.find_by_id`                      |
| `TSK-06`    | task not owned by user                         | `OwnershipError`                           | `AuthorizationScope`                              |
| `TSK-06`    | stale version                                  | `OptimisticConcurrencyError`               | `ITaskRepository.save`                            |
| `TSK-06`    | status is not Done                             | `StateTransitionError`                     | `ITaskService.reopen_task`                        |
| `TSK-07`    | task not found                                 | `NotFoundError`                            | `ITaskRepository.find_by_id`                      |
| `TSK-07`    | task not owned by user                         | `OwnershipError`                           | `AuthorizationScope`                              |
| `TSK-07`    | task already archived                          | `StateTransitionError`                     | `ITaskService.archive_task`                       |
| `TSK-07`    | stale version                                  | `OptimisticConcurrencyError`               | `ITaskRepository.archive`                         |
| `TSK-08`    | task not found                                 | `NotFoundError`                            | `ITaskRepository.find_by_id`                      |
| `TSK-08`    | task not owned by user                         | `OwnershipError`                           | `AuthorizationScope`                              |
| `TSK-08`    | task status is not Archived                    | `StateTransitionError`                     | `ITaskService.restore_task`                       |
| `TSK-08`    | stale version                                  | `OptimisticConcurrencyError`               | `ITaskRepository.restore_to_backlog`              |
| `TSK-09`    | task missing                                   | `NotFoundError`                            | `ITaskRepository.find_by_id` per item             |
| `TSK-09`    | task not owned by user                         | `OwnershipError`                           | `AuthorizationScope` per item                     |
| `TSK-09`    | stale version for task                         | `OptimisticConcurrencyError`               | `ITaskRepository.save` per item                   |
| `TSK-09`    | milestone invalid                              | `InputError`                               | `ITaskService.bulk_mutate_tasks` per item         |
| `TSK-10`    | cursor does not match query shape              | `CursorShapeError`                         | `CursorQueryShapePolicy`                          |
| `TSK-11`    | task not found                                 | `NotFoundError`                            | `ITaskRepository.load_detail_projection`          |
| `TSK-11`    | task not owned by user                         | `OwnershipError`                           | `AuthorizationScope`                              |
| `REC-01`    | create or update request invalid               | `InputError`                               | `IRecurrenceService.upsert_series`                |
| `REC-01`    | series not found                               | `NotFoundError`                            | `IRecurringSeriesRepository.find_by_id`           |
| `REC-01`    | series not owned by user                       | `OwnershipError`                           | `AuthorizationScope`                              |
| `REC-01`    | series aspect invalid or inactive              | `InputError`                               | `IRecurrenceService.upsert_series`                |
| `REC-01`    | stale version                                  | `OptimisticConcurrencyError`               | `IRecurringSeriesRepository.save`                 |
| `REC-01`    | rule frequency or interval invalid             | `InputError`                               | recurrence rule validators                        |
| `REC-02`    | series not found                               | `NotFoundError`                            | `IRecurringSeriesRepository.find_by_id`           |
| `REC-02`    | series not owned by user                       | `OwnershipError`                           | `AuthorizationScope`                              |
| `REC-02`    | series already closed                          | `StateTransitionError`                     | `IRecurrenceService.pause_or_resume_series`       |
| `REC-02`    | stale version                                  | `OptimisticConcurrencyError`               | `IRecurringSeriesRepository.save`                 |
| `REC-03`    | rule not found                                 | `NotFoundError`                            | `IRecurringSeriesRepository.find_by_id`           |
| `REC-03`    | rule not owned by user                         | `OwnershipError`                           | `AuthorizationScope`                              |
| `REC-03`    | stale version                                  | `OptimisticConcurrencyError`               | `IRecurringSeriesRepository.save`                 |
| `REC-03`    | override date invalid                          | `InputError`                               | `IRecurrenceService.skip_or_move_next_occurrence` |
| `REC-04`    | series closed or paused                        | `StateTransitionError`                     | `IRecurrenceMaterializer.generate_next_instance`  |
| `REC-04`    | rule missing                                   | `InputError`                               | `IRecurrenceMaterializer.generate_next_instance`  |
| `REC-04`    | current instance overdue and not done          | no exception, suppressed generation result | `IRecurrenceMaterializer.generate_next_instance`  |
| `REC-05`    | series not found                               | `NotFoundError`                            | `IRecurringSeriesRepository.find_by_id`           |
| `REC-05`    | series not owned by user                       | `OwnershipError`                           | `AuthorizationScope`                              |
| `REC-05`    | stale version                                  | `OptimisticConcurrencyError`               | `IRecurringSeriesRepository.close`                |
| `REC-05`    | series already closed                          | `StateTransitionError`                     | `IRecurrenceService.close_series`                 |

## Availability and Planning

| Interaction | Failure Path                                         | Error Type                   | Raised By                                                |
| ----------- | ---------------------------------------------------- | ---------------------------- | -------------------------------------------------------- |
| `AVL-01`    | start is not before end                              | `InputError`                 | availability validators                                  |
| `AVL-02`    | recurrence shape or duration invalid                 | `InputError`                 | `IAvailabilityService.create_recurring_block`            |
| `AVL-03`    | block missing                                        | `NotFoundError`              | `IAvailabilityRepository.find_by_id`                     |
| `AVL-03`    | block not owned by user                              | `OwnershipError`             | `AuthorizationScope`                                     |
| `AVL-03`    | invalid override shape                               | `InputError`                 | `IAvailabilityService.add_recurring_exception`           |
| `AVL-04`    | block not found                                      | `NotFoundError`              | `IAvailabilityRepository.find_by_id`                     |
| `AVL-04`    | block not owned by user                              | `OwnershipError`             | `AuthorizationScope`                                     |
| `AVL-04`    | stale version                                        | `OptimisticConcurrencyError` | `IAvailabilityRepository.save`                           |
| `AVL-04`    | invalid lifecycle change                             | `StateTransitionError`       | `IAvailabilityService.update_archive_restore_block`      |
| `PLN-01`    | invalid planning input shape                         | `InputError`                 | `IPlanningService.generate_draft_plan`                   |
| `PLN-01`    | active aspect targets do not total 100               | `TargetPercentTotalError`    | `IAspectTargetValidator`                                 |
| `PLN-01`    | active lock makes a user-forced slot impossible      | `LockConflictError`          | `IPlanningService.generate_draft_plan`                   |
| `PLN-02`    | cycle not found                                      | `NotFoundError`              | `IPlanningCycleRepository.find_by_id`                    |
| `PLN-02`    | stale version                                        | `OptimisticConcurrencyError` | `IPlanningCycleRepository.confirm_cycle`                 |
| `PLN-02`    | cycle already confirmed without newer draft revision | `StateTransitionError`       | `IPlanningService.confirm_draft_plan`                    |
| `PLN-02`    | active targets drift from 100                        | `TargetPercentTotalError`    | `IAspectTargetValidator`                                 |
| `PLN-03`    | cycle not found                                      | `NotFoundError`              | `IPlanningCycleRepository.find_by_id`                    |
| `PLN-03`    | stale version                                        | `OptimisticConcurrencyError` | `IPlanningCycleRepository.supersede_and_create_revision` |
| `PLN-03`    | cycle is not Confirmed                               | `StateTransitionError`       | `IPlanningService.regenerate_confirmed_plan`             |
| `PLN-03`    | lock constraints are impossible to preserve          | `LockConflictError`          | `IPlanningService.regenerate_confirmed_plan`             |
| `PLN-04`    | cycle or revision missing                            | `NotFoundError`              | `IPlanningCycleRepository.find_by_id`                    |
| `PLN-04`    | stale version                                        | `OptimisticConcurrencyError` | `IPlanningCycleRepository.apply_plan_edit_revision`      |
| `PLN-04`    | requested lock conflicts with existing active lock   | `LockConflictError`          | `IPlanningService.edit_plan`                             |
| `PLN-04`    | invalid lifecycle mutation                           | `StateTransitionError`       | `IPlanningService.edit_plan`                             |
| `PLN-05`    | lock conflict blocks safe replan                     | `LockConflictError`          | `IPlanningService.replan_active_cycles`                  |
| `PLN-06`    | cursor does not match query shape                    | `CursorShapeError`           | `CursorQueryShapePolicy`                                 |

## Execution, Reminders, Data, Audit, System

| Interaction | Failure Path                                | Error Type                     | Raised By                                                |
| ----------- | ------------------------------------------- | ------------------------------ | -------------------------------------------------------- |
| `EXE-01`    | allocation not found                        | `NotFoundError`                | `IPlanningCycleRepository.persist_outcome` lookup path   |
| `EXE-01`    | allocation not owned by user                | `OwnershipError`               | `AuthorizationScope`                                     |
| `EXE-01`    | stale version                               | `OptimisticConcurrencyError`   | `IPlanningCycleRepository.persist_outcome`               |
| `EXE-01`    | invalid outcome payload                     | `InputError`                   | `IExecutionService.mark_allocation_outcome`              |
| `REM-01`    | task missing or terminal                    | `NotFoundError`                | `IReminderService.upsert_reminder`                       |
| `REM-01`    | task not owned by user                      | `OwnershipError`               | `AuthorizationScope`                                     |
| `REM-01`    | stale version                               | `OptimisticConcurrencyError`   | `IReminderRepository.save`                               |
| `REM-01`    | channel or datetime invalid                 | `InputError`                   | reminder validators / `IReminderService.upsert_reminder` |
| `REM-02`    | reminder not found                          | `NotFoundError`                | `IReminderRepository.find_by_id`                         |
| `REM-02`    | reminder not owned by user                  | `OwnershipError`               | `AuthorizationScope`                                     |
| `REM-02`    | stale version                               | `OptimisticConcurrencyError`   | `IReminderRepository.save`                               |
| `REM-02`    | reminder is not Pending                     | `StateTransitionError`         | `IReminderService.snooze_reminder`                       |
| `REM-02`    | snooze count exceeds policy                 | `SnoozeLimitExceededError`     | `IReminderService.snooze_reminder`                       |
| `REM-03`    | retry policy exhausted on dispatch path     | `RetryExhaustedError`          | `IReminderDispatchService.dispatch_due_reminders`        |
| `REM-04`    | retry age exceeds 30 days                   | `RetryExhaustedError`          | `IReminderDispatchService.process_failed_reminders`      |
| `DAT-01`    | no domain alt failure beyond auth           | auth-layer error               | auth middleware                                          |
| `DAT-02`    | schema invalid or forbidden entity included | `InputError`                   | `IDataPortabilityService.import_user_data`               |
| `DAT-02`    | remap fails                                 | `ImportRemapError`             | `IImportRemapService`                                    |
| `AUD-02`    | cursor does not match query shape           | `CursorShapeError`             | `CursorQueryShapePolicy`                                 |
| `SYS-01`    | command payload invalid before dedupe       | `InputError`                   | `IdempotencyCommandPolicy`                               |
| `SYS-01`    | key exists with different hash              | `IdempotencyHashMismatchError` | `IdempotencyCommandPolicy`                               |
| `SYS-02`    | job payload invalid before dedupe           | `InputError`                   | `JobRunIdempotencyPolicy`                                |
| `SYS-02`    | key exists with different hash              | `IdempotencyHashMismatchError` | `JobRunIdempotencyPolicy`                                |

## Notes

- Some sequence branches produce a non-exception domain result rather than an error, such as recurrence generation suppression in `REC-04` and no-op replan in `PLN-05`; these are intentionally represented as non-raising outcomes.
- Auth-related failures may occur before a controller method body executes because they are enforced by middleware.
