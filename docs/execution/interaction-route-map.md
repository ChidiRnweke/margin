# Interaction → Route Map

## Identity and Profile

| Interaction | Description | Controller Method | Route/Endpoint | HTTP Method |
|-------------|-------------|-------------------|----------------|-------------|
| AUTH-01 | Sign-in start | `AuthController.start_sign_in` | `/(auth)/login` | GET/POST |
| AUTH-02 | Identity callback | `AuthController.handle_identity_callback` | `/(auth)/callback` | GET |
| AUTH-03 | Logout | `AuthController.logout` | `/(app)/api/auth/logout` | POST |
| AUTH-04 | Session expiry | `SessionExpiryJob` | Hatchet cron | — |
| AUTH-05 | Onboarding complete | `ProfileController.complete_onboarding` | `/(onboarding)` action | POST |
| AUTH-06 | Account deletion | `AuthController.delete_account` | `/(app)/api/auth/delete-account` | POST |
| PRF-01 | Update profile | `ProfileController.update_profile` | `/(app)/api/profile` | PATCH |

## Aspect

| Interaction | Description | Controller Method | Route/Endpoint | HTTP Method |
|-------------|-------------|-------------------|----------------|-------------|
| ASP-01 | Create aspect | `AspectController.create_aspect` | `/(app)/api/aspects` | POST |
| ASP-02 | Activate aspect | `AspectController.activate_aspect` | `/(app)/api/aspects/[id]/activate` | POST |
| ASP-03 | Update aspect | `AspectController.update_aspect` | `/(app)/api/aspects/[id]` | PATCH |
| ASP-04 | Archive aspect | `AspectController.archive_aspect` | `/(app)/api/aspects/[id]/archive` | POST |
| ASP-05 | Restore aspect | `AspectController.restore_aspect` | `/(app)/api/aspects/[id]/restore` | POST |
| ASP-06 | Query aspects | `AspectController.query_aspects` | `/(app)/api/aspects` | GET |

## Milestone

| Interaction | Description | Controller Method | Route/Endpoint | HTTP Method |
|-------------|-------------|-------------------|----------------|-------------|
| MLS-01 | Create milestone | `MilestoneController.create_milestone` | `/(app)/api/milestones` | POST |
| MLS-02 | Update milestone | `MilestoneController.update_milestone` | `/(app)/api/milestones/[id]` | PATCH |
| MLS-03 | Complete milestone | `MilestoneController.complete_milestone` | `/(app)/api/milestones/[id]/complete` | POST |
| MLS-04 | Reopen milestone | `MilestoneController.reopen_milestone` | `/(app)/api/milestones/[id]/reopen` | POST |
| MLS-05 | Archive milestone | `MilestoneController.archive_milestone` | `/(app)/api/milestones/[id]/archive` | POST |
| MLS-06 | Restore milestone | `MilestoneController.restore_milestone` | `/(app)/api/milestones/[id]/restore` | POST |
| MLS-07 | Query milestones | `MilestoneController.query_milestones` | `/(app)/api/milestones` | GET |

## Task

| Interaction | Description | Controller Method | Route/Endpoint | HTTP Method |
|-------------|-------------|-------------------|----------------|-------------|
| TSK-01 | Create task | `TaskController.create_task` | `/(app)/api/tasks` | POST |
| TSK-02 | Update task | `TaskController.update_task` | `/(app)/api/tasks/[id]` | PATCH |
| TSK-03 | Move task | `TaskController.move_task` | `/(app)/api/tasks/[id]/move` | POST |
| TSK-04 | Start task | `TaskController.start_task` | `/(app)/api/tasks/[id]/start` | POST |
| TSK-05 | Complete task | `TaskController.complete_task` | `/(app)/api/tasks/[id]/complete` | POST |
| TSK-06 | Reopen task | `TaskController.reopen_task` | `/(app)/api/tasks/[id]/reopen` | POST |
| TSK-07 | Archive task | `TaskController.archive_task` | `/(app)/api/tasks/[id]/archive` | POST |
| TSK-08 | Restore task | `TaskController.restore_task` | `/(app)/api/tasks/[id]/restore` | POST |
| TSK-09 | Bulk mutate | `TaskController.bulk_mutate_tasks` | `/(app)/api/tasks/bulk` | POST |
| TSK-10 | Query tasks | `TaskController.query_tasks` | `/(app)/api/tasks` | GET |
| TSK-11 | Task detail | `TaskController.get_task_detail` | `/(app)/api/tasks/[id]` | GET |

## Recurrence

| Interaction | Description | Controller Method | Route/Endpoint | HTTP Method |
|-------------|-------------|-------------------|----------------|-------------|
| REC-01 | Upsert series | `RecurrenceController.upsert_series` | `/(app)/api/recurrence` | PUT |
| REC-02 | Pause/resume | `RecurrenceController.pause_or_resume_series` | `/(app)/api/recurrence/[id]/toggle` | POST |
| REC-03 | Skip/move | `RecurrenceController.skip_or_move_occurrence` | `/(app)/api/recurrence/[id]/exception` | POST |
| REC-04 | Generate next | `TaskCompletionHook` | Hatchet hook | — |
| REC-05 | Close series | `RecurrenceController.close_series` | `/(app)/api/recurrence/[id]/close` | POST |

## Availability

| Interaction | Description | Controller Method | Route/Endpoint | HTTP Method |
|-------------|-------------|-------------------|----------------|-------------|
| AVL-01 | Create one-off | `AvailabilityController.create_one_off_block` | `/(app)/api/availability` | POST |
| AVL-02 | Create recurring | `AvailabilityController.create_recurring_block` | `/(app)/api/availability` | POST |
| AVL-03 | Add exception | `AvailabilityController.add_exception` | `/(app)/api/availability/[id]/exception` | POST |
| AVL-04 | Update/archive/restore | `AvailabilityController.update_archive_restore_block` | `/(app)/api/availability/[id]` | PATCH |
| AVL-05 | Query effective | `AvailabilityController.query_effective_availability` | `/(app)/api/availability` | GET |

## Planning

| Interaction | Description | Controller Method | Route/Endpoint | HTTP Method |
|-------------|-------------|-------------------|----------------|-------------|
| PLN-01 | Generate draft | `PlanningController.generate_draft_plan` | `/(app)/api/planning/generate` | POST |
| PLN-02 | Confirm draft | `PlanningController.confirm_draft_plan` | `/(app)/api/planning/[id]/confirm` | POST |
| PLN-03 | Regenerate | `PlanningController.regenerate_confirmed_plan` | `/(app)/api/planning/[id]/regenerate` | POST |
| PLN-04 | Edit plan | `PlanningController.edit_plan` | `/(app)/api/planning/[id]/edit` | POST |
| PLN-05 | Day-boundary replan | `DayBoundaryReplanJob` | Hatchet cron | — |
| PLN-06 | Query cycles | `PlanningController.query_cycles` | `/(app)/api/planning` | GET |

## Execution

| Interaction | Description | Controller Method | Route/Endpoint | HTTP Method |
|-------------|-------------|-------------------|----------------|-------------|
| EXE-01 | Mark outcome | `ExecutionController.mark_allocation_outcome` | `/(app)/api/execution/[id]/outcome` | POST |
| EXE-02 | Compute health | `HealthJob` | Hatchet cron | — |

## Reminder

| Interaction | Description | Controller Method | Route/Endpoint | HTTP Method |
|-------------|-------------|-------------------|----------------|-------------|
| REM-01 | Upsert reminder | `ReminderController.upsert_reminder` | `/(app)/api/reminders` | PUT |
| REM-02 | Snooze reminder | `ReminderController.snooze_reminder` | `/(app)/api/reminders/[id]/snooze` | POST |
| REM-03 | Dispatch due | `ReminderDispatchJob` | Hatchet workflow | — |
| REM-04 | Process failed | `ReminderRetryJob` | Hatchet cron | — |

## Data Portability

| Interaction | Description | Controller Method | Route/Endpoint | HTTP Method |
|-------------|-------------|-------------------|----------------|-------------|
| DAT-01 | Export JSON | `DataPortabilityController.export_json` | `/(app)/api/data/export` | GET |
| DAT-02 | Import preview | `DataPortabilityController.preview_import_json` | `/(app)/api/data/import/preview` | POST |
| DAT-02 | Import start | `DataPortabilityController.start_import_json` | `/(app)/api/data/import/start` | POST |
| DAT-02 | Import status | `DataPortabilityController.get_import_status` | `/(app)/api/data/import/[jobId]` | GET |

## Audit

| Interaction | Description | Controller Method | Route/Endpoint | HTTP Method |
|-------------|-------------|-------------------|----------------|-------------|
| AUD-01 | Emit audit | Audit infrastructure | Transparent decorator | — |
| AUD-02 | Query audit | `AuditController.query_audit_timeline` | `/(app)/api/audit` | GET |

## System

| Interaction | Description | Entry Point | Route/Endpoint | HTTP Method |
|-------------|-------------|-------------|----------------|-------------|
| SYS-01 | Command idempotency | Idempotency middleware | Wraps create/mutate | — |
| SYS-02 | Job idempotency | JobIdempotencyWrapper | Wraps job runs | — |
