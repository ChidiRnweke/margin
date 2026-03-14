# Controllers and Jobs

## Controller Design Rules

- One controller per concern area from the interaction matrix.
- One method per user-triggered interaction.
- Controllers only translate transport input into service input and map domain output/errors back to transport responses.
- Controllers do not perform domain `if` logic over entity state.

## Controllers

## AuthController

- Concern area: identity and account lifecycle.
- Service dependencies:
  - `IAuthService`
  - `IIdentityProviderGateway`
- Methods:
  - `start_sign_in` -> `AUTH-01`
  - `handle_identity_callback` -> `AUTH-02`
  - `logout` -> `AUTH-03`
  - `delete_account` -> `AUTH-06`

## ProfileController

- Concern area: planning profile and onboarding.
- Service dependencies:
  - `IProfileService`
- Methods:
  - `complete_onboarding` -> `AUTH-05`
  - `update_profile` -> `PRF-01`

## AspectController

- Concern area: aspect lifecycle.
- Service dependencies:
  - `IAspectService`
- Methods:
  - `create_aspect` -> `ASP-01`
  - `activate_aspect` -> `ASP-02`
  - `update_aspect` -> `ASP-03`
  - `archive_aspect` -> `ASP-04`
  - `restore_aspect` -> `ASP-05`
  - `query_aspects` -> `ASP-06`

## MilestoneController

- Concern area: milestone lifecycle.
- Service dependencies:
  - `IMilestoneService`
- Methods:
  - `create_milestone` -> `MLS-01`
  - `update_milestone` -> `MLS-02`
  - `complete_milestone` -> `MLS-03`
  - `reopen_milestone` -> `MLS-04`
  - `archive_milestone` -> `MLS-05`
  - `restore_milestone` -> `MLS-06`
  - `query_milestones` -> `MLS-07`

## TaskController

- Concern area: task lifecycle and queries.
- Service dependencies:
  - `ITaskService`
- Methods:
  - `create_task` -> `TSK-01`
  - `update_task` -> `TSK-02`
  - `move_task` -> `TSK-03`
  - `start_task` -> `TSK-04`
  - `complete_task` -> `TSK-05`
  - `reopen_task` -> `TSK-06`
  - `archive_task` -> `TSK-07`
  - `restore_task` -> `TSK-08`
  - `bulk_mutate_tasks` -> `TSK-09`
  - `query_tasks` -> `TSK-10`
  - `get_task_detail` -> `TSK-11`

## RecurrenceController

- Concern area: recurrence lifecycle.
- Service dependencies:
  - `IRecurrenceService`
- Methods:
  - `upsert_series` -> `REC-01`
  - `pause_or_resume_series` -> `REC-02`
  - `skip_or_move_occurrence` -> `REC-03`
  - `close_series` -> `REC-05`

## AvailabilityController

- Concern area: availability lifecycle.
- Service dependencies:
  - `IAvailabilityService`
- Methods:
  - `create_one_off_block` -> `AVL-01`
  - `create_recurring_block` -> `AVL-02`
  - `add_exception` -> `AVL-03`
  - `update_archive_restore_block` -> `AVL-04`
  - `query_effective_availability` -> `AVL-05`

## PlanningController

- Concern area: planning lifecycle and revision history.
- Service dependencies:
  - `IPlanningService`
- Methods:
  - `generate_draft_plan` -> `PLN-01`
  - `confirm_draft_plan` -> `PLN-02`
  - `regenerate_confirmed_plan` -> `PLN-03`
  - `edit_plan` -> `PLN-04`
  - `query_cycles` -> `PLN-06`

## ExecutionController

- Concern area: execution outcome marking.
- Service dependencies:
  - `IExecutionService`
- Methods:
  - `mark_allocation_outcome` -> `EXE-01`

## ReminderController

- Concern area: reminder management.
- Service dependencies:
  - `IReminderService`
- Methods:
  - `upsert_reminder` -> `REM-01`
  - `snooze_reminder` -> `REM-02`

## DataPortabilityController

- Concern area: import/export.
- Service dependencies:
  - `IDataPortabilityService`
- Methods:
  - `export_json` -> `DAT-01`
  - `import_json` -> `DAT-02`

## AuditController

- Concern area: audit timeline.
- Service dependencies:
  - `IAuditQueryService`
- Methods:
  - `query_audit_timeline` -> `AUD-02`

## Direct Infrastructure-Controlled Flow

- `AUD-01` is not a controller method.
- It is emitted transparently by audit decoration/infrastructure after successful writes.
- `SYS-01` is not a controller method.
- It wraps every create and mutate command before service execution.

## Job-Triggered Interactions

| Job                     | Interaction | Service Method                                                      | Trigger                    |
| ----------------------- | ----------- | ------------------------------------------------------------------- | -------------------------- |
| `SessionExpiryJob`      | `AUTH-04`   | `IAuthService.expire_sessions(now)`                                 | scheduled sweep            |
| `DayBoundaryReplanJob`  | `PLN-05`    | `IPlanningService.replan_active_cycles(now)`                        | day boundary               |
| `HealthJob`             | `EXE-02`    | `IHealthComputationService.compute_cycle_health(cycle_id)`          | scheduled computation      |
| `ReminderDispatchJob`   | `REM-03`    | `IReminderDispatchService.dispatch_due_reminders(now)`              | due-reminder polling       |
| `ReminderRetryJob`      | `REM-04`    | `IReminderDispatchService.process_failed_reminders(now)`            | daily retry processing     |
| `TaskCompletionHook`    | `REC-04`    | `IRecurrenceMaterializer.generate_next_instance(completed_task_id)` | successful task completion |
| `JobIdempotencyWrapper` | `SYS-02`    | wraps mutation-capable job entry points                             | every relevant job run     |

## Controller-to-Interaction Coverage

- All user-triggered interactions in `architecture/interaction-matrix.md` map to exactly one controller method.
- All system-triggered interactions map to jobs or infrastructure.
- No interaction is left unmapped.
