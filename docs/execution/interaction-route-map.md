# Interaction → Route Map

## Identity and Profile

| Interaction | Description         | Controller Method                         | Route/Endpoint                   | HTTP Method | Status      |
| ----------- | ------------------- | ----------------------------------------- | -------------------------------- | ----------- | ----------- |
| AUTH-01     | Sign-in start       | `AuthController.start_sign_in`            | `/(auth)/login`                  | GET/POST    | Implemented |
| AUTH-02     | Identity callback   | `AuthController.handle_identity_callback` | `/(auth)/callback`               | GET         | Implemented |
| AUTH-03     | Logout              | `AuthController.logout`                   | `/(app)/api/auth/logout`         | POST        | Implemented |
| AUTH-04     | Session expiry      | `SessionExpiryJob`                        | Hatchet cron                     | —           | Implemented |
| AUTH-05     | Onboarding complete | `ProfileController.complete_onboarding`   | `/(onboarding)` action           | POST        | Implemented |
| AUTH-06     | Account deletion    | `AuthController.delete_account`           | `/(app)/api/auth/delete-account` | POST        | Implemented |
| PRF-01      | Update profile      | `ProfileController.update_profile`        | `/(app)/api/profile`             | PATCH       | Implemented |

## Aspect

| Interaction | Description     | Controller Method                  | Route/Endpoint                     | HTTP Method | Status      |
| ----------- | --------------- | ---------------------------------- | ---------------------------------- | ----------- | ----------- |
| ASP-01      | Create aspect   | `AspectController.create_aspect`   | `/(app)/api/aspects`               | POST        | Implemented |
| ASP-02      | Activate aspect | `AspectController.activate_aspect` | `/(app)/api/aspects/[id]/activate` | POST        | Implemented |
| ASP-03      | Update aspect   | `AspectController.update_aspect`   | `/(app)/api/aspects/[id]`          | PATCH       | Implemented |
| ASP-04      | Archive aspect  | `AspectController.archive_aspect`  | `/(app)/api/aspects/[id]/archive`  | POST        | Implemented |
| ASP-05      | Restore aspect  | `AspectController.restore_aspect`  | `/(app)/api/aspects/[id]/restore`  | POST        | Implemented |
| ASP-06      | Query aspects   | `AspectController.query_aspects`   | `/(app)/api/aspects`               | GET         | Implemented |

## Milestone

| Interaction | Description        | Controller Method                        | Route/Endpoint                        | HTTP Method | Status      |
| ----------- | ------------------ | ---------------------------------------- | ------------------------------------- | ----------- | ----------- |
| MLS-01      | Create milestone   | `MilestoneController.create_milestone`   | `/(app)/api/milestones`               | POST        | Implemented |
| MLS-02      | Update milestone   | `MilestoneController.update_milestone`   | `/(app)/api/milestones/[id]`          | PATCH       | Implemented |
| MLS-03      | Complete milestone | `MilestoneController.complete_milestone` | `/(app)/api/milestones/[id]/complete` | POST        | Implemented |
| MLS-04      | Reopen milestone   | `MilestoneController.reopen_milestone`   | `/(app)/api/milestones/[id]/reopen`   | POST        | Implemented |
| MLS-05      | Archive milestone  | `MilestoneController.archive_milestone`  | `/(app)/api/milestones/[id]/archive`  | POST        | Implemented |
| MLS-06      | Restore milestone  | `MilestoneController.restore_milestone`  | `/(app)/api/milestones/[id]/restore`  | POST        | Implemented |
| MLS-07      | Query milestones   | `MilestoneController.query_milestones`   | `/(app)/api/milestones`               | GET         | Implemented |

## Task

| Interaction | Description   | Controller Method                  | Route/Endpoint                   | HTTP Method | Status      |
| ----------- | ------------- | ---------------------------------- | -------------------------------- | ----------- | ----------- |
| TSK-01      | Create task   | `TaskController.create_task`       | `/(app)/api/tasks`               | POST        | Implemented |
| TSK-02      | Update task   | `TaskController.update_task`       | `/(app)/api/tasks/[id]`          | PATCH       | Implemented |
| TSK-03      | Move task     | `TaskController.move_task`         | `/(app)/api/tasks/[id]/move`     | POST        | Implemented |
| TSK-04      | Start task    | `TaskController.start_task`        | `/(app)/api/tasks/[id]/start`    | POST        | Implemented |
| TSK-05      | Complete task | `TaskController.complete_task`     | `/(app)/api/tasks/[id]/complete` | POST        | Implemented |
| TSK-06      | Reopen task   | `TaskController.reopen_task`       | `/(app)/api/tasks/[id]/reopen`   | POST        | Implemented |
| TSK-07      | Archive task  | `TaskController.archive_task`      | `/(app)/api/tasks/[id]/archive`  | POST        | Implemented |
| TSK-08      | Restore task  | `TaskController.restore_task`      | `/(app)/api/tasks/[id]/restore`  | POST        | Implemented |
| TSK-09      | Bulk mutate   | `TaskController.bulk_mutate_tasks` | `/(app)/api/tasks/bulk`          | POST        | Implemented |
| TSK-10      | Query tasks   | `TaskController.query_tasks`       | `/(app)/api/tasks`               | GET         | Implemented |
| TSK-11      | Task detail   | `TaskController.get_task_detail`   | `/(app)/api/tasks/[id]`          | GET         | Implemented |

## Recurrence

| Interaction | Description   | Controller Method                              | Route/Endpoint                         | HTTP Method | Status      |
| ----------- | ------------- | ---------------------------------------------- | -------------------------------------- | ----------- | ----------- |
| REC-01      | Upsert series | `RecurrenceController.upsert_series`           | `/(app)/api/recurrence`                | PUT         | Implemented |
| REC-02      | Pause/resume  | `RecurrenceController.pause_or_resume_series`  | `/(app)/api/recurrence/[id]/toggle`    | POST        | Implemented |
| REC-03      | Skip/move     | `RecurrenceController.skip_or_move_occurrence` | `/(app)/api/recurrence/[id]/exception` | POST        | Implemented |
| REC-04      | Generate next | `TaskCompletionHook`                           | Hatchet hook                           | —           | Implemented |
| REC-05      | Close series  | `RecurrenceController.close_series`            | `/(app)/api/recurrence/[id]/close`     | POST        | Implemented |

## Availability

| Interaction | Description            | Controller Method                                     | Route/Endpoint                           | HTTP Method | Status      |
| ----------- | ---------------------- | ----------------------------------------------------- | ---------------------------------------- | ----------- | ----------- |
| AVL-01      | Create one-off         | `AvailabilityController.create_one_off_block`         | `/(app)/api/availability`                | POST        | Implemented |
| AVL-02      | Create recurring       | `AvailabilityController.create_recurring_block`       | `/(app)/api/availability`                | POST        | Implemented |
| AVL-03      | Add exception          | `AvailabilityController.add_exception`                | `/(app)/api/availability/[id]/exception` | POST        | Implemented |
| AVL-04      | Update/archive/restore | `AvailabilityController.update_archive_restore_block` | `/(app)/api/availability/[id]`           | PATCH       | Implemented |
| AVL-05      | Query effective        | `AvailabilityController.query_effective_availability` | `/(app)/api/availability`                | GET         | Implemented |

## Planning

| Interaction | Description         | Controller Method                              | Route/Endpoint                        | HTTP Method | Status      |
| ----------- | ------------------- | ---------------------------------------------- | ------------------------------------- | ----------- | ----------- |
| PLN-01      | Generate draft      | `PlanningController.generate_draft_plan`       | `/(app)/api/planning/generate`        | POST        | Implemented |
| PLN-02      | Confirm draft       | `PlanningController.confirm_draft_plan`        | `/(app)/api/planning/[id]/confirm`    | POST        | Implemented |
| PLN-03      | Regenerate          | `PlanningController.regenerate_confirmed_plan` | `/(app)/api/planning/[id]/regenerate` | POST        | Implemented |
| PLN-04      | Edit plan           | `PlanningController.edit_plan`                 | `/(app)/api/planning/[id]/edit`       | POST        | Implemented |
| PLN-05      | Day-boundary replan | `DayBoundaryReplanJob`                         | Hatchet cron                          | —           | Implemented |
| PLN-06      | Query cycles        | `PlanningController.query_cycles`              | `/(app)/api/planning`                 | GET         | Implemented |

## Execution

| Interaction | Description    | Controller Method                             | Route/Endpoint                      | HTTP Method | Status      |
| ----------- | -------------- | --------------------------------------------- | ----------------------------------- | ----------- | ----------- |
| EXE-01      | Mark outcome   | `ExecutionController.mark_allocation_outcome` | `/(app)/api/execution/[id]/outcome` | POST        | Implemented |
| EXE-02      | Compute health | `HealthJob`                                   | Hatchet cron                        | —           | Implemented |

## Reminder

| Interaction | Description     | Controller Method                    | Route/Endpoint                     | HTTP Method | Status      |
| ----------- | --------------- | ------------------------------------ | ---------------------------------- | ----------- | ----------- |
| REM-01      | Upsert reminder | `ReminderController.upsert_reminder` | `/(app)/api/reminders`             | PUT         | Implemented |
| REM-02      | Snooze reminder | `ReminderController.snooze_reminder` | `/(app)/api/reminders/[id]/snooze` | POST        | Implemented |
| REM-03      | Dispatch due    | `ReminderDispatchJob`                | Hatchet workflow                   | —           | Implemented |
| REM-04      | Process failed  | `ReminderRetryJob`                   | Hatchet cron                       | —           | Implemented |

## Data Portability

| Interaction | Description    | Controller Method                               | Route/Endpoint                   | HTTP Method | Status      |
| ----------- | -------------- | ----------------------------------------------- | -------------------------------- | ----------- | ----------- |
| DAT-01      | Export JSON    | `DataPortabilityController.export_json`         | `/(app)/api/data/export`         | GET         | Implemented |
| DAT-02      | Import preview | `DataPortabilityController.preview_import_json` | `/(app)/api/data/import/preview` | POST        | Implemented |
| DAT-02      | Import start   | `DataPortabilityController.start_import_json`   | `/(app)/api/data/import/start`   | POST        | Implemented |
| DAT-02      | Import status  | `DataPortabilityController.get_import_status`   | `/(app)/api/data/import/[jobId]` | GET         | Implemented |

## Audit

| Interaction | Description | Controller Method                      | Route/Endpoint        | HTTP Method | Status      |
| ----------- | ----------- | -------------------------------------- | --------------------- | ----------- | ----------- |
| AUD-01      | Emit audit  | Audit infrastructure                   | Transparent decorator | —           | Implemented |
| AUD-02      | Query audit | `AuditController.query_audit_timeline` | `/(app)/api/audit`    | GET         | Implemented |

## System

| Interaction | Description         | Entry Point            | Route/Endpoint      | HTTP Method | Status      |
| ----------- | ------------------- | ---------------------- | ------------------- | ----------- | ----------- |
| SYS-01      | Command idempotency | Idempotency middleware | Wraps create/mutate | —           | Implemented |
| SYS-02      | Job idempotency     | JobIdempotencyWrapper  | Wraps job runs      | —           | Implemented |
