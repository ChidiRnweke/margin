# Reference Ledger

## Aggregate Boundaries

| Aggregate | Root | Children | Status |
|-----------|------|----------|--------|
| UserAccount | `User` | none | Pending |
| PlanningProfile | `PlanningProfile` | none | Pending |
| Session | `Session` | none | Pending |
| Aspect | `Aspect` | none | Pending |
| Milestone | `Milestone` | none | Pending |
| Task | `Task` | `TaskLock` | Pending |
| RecurringSeries | `RecurringTaskSeries` | `RecurrenceRule`, `RecurrenceException` | Pending |
| Availability | `AvailabilityBlock` | `AvailabilityException` | Pending |
| PlanningCycle | `PlanningCycle` | `PlanningRevision`, `TaskAllocation`, `AllocationOutcome`, `AspectCycleHealth` | Pending |
| Reminder | `Reminder` | `ReminderAttempt` | Pending |
| ImportJob | `ImportJob` | none | Pending |
| AuditLog | `AuditEvent` | none | Pending |
| Idempotency | `IdempotencyKey` | none | Pending |
| SystemJobRun | `SystemJobRun` | none | Pending |

## Public Services

| Service | Methods | Status |
|---------|---------|--------|
| `IAuthService` | `resolve_identity_callback`, `logout`, `expire_sessions`, `delete_account` | Pending |
| `IProfileService` | `complete_onboarding`, `update_planning_profile` | Pending |
| `IAspectService` | `create_aspect`, `activate_aspect`, `update_aspect`, `archive_aspect`, `restore_aspect`, `query_aspects` | Pending |
| `IMilestoneService` | `create_milestone`, `update_milestone`, `complete_milestone`, `reopen_milestone`, `archive_milestone`, `restore_milestone`, `query_milestones` | Pending |
| `ITaskService` | `create_task`, `update_task`, `move_task_milestone`, `start_task`, `complete_task`, `reopen_task`, `archive_task`, `restore_task`, `bulk_mutate_tasks`, `query_tasks`, `get_task_detail` | Pending |
| `IRecurrenceService` | `upsert_series`, `pause_or_resume_series`, `skip_or_move_next_occurrence`, `close_series` | Pending |
| `IAvailabilityService` | `create_one_off_block`, `create_recurring_block`, `add_recurring_exception`, `update_archive_restore_block`, `query_effective_availability` | Pending |
| `IPlanningService` | `generate_draft_plan`, `confirm_draft_plan`, `regenerate_confirmed_plan`, `edit_plan`, `replan_active_cycles`, `query_cycles` | Pending |
| `IExecutionService` | `mark_allocation_outcome` | Pending |
| `IReminderService` | `upsert_reminder`, `snooze_reminder` | Pending |
| `IDataPortabilityService` | `export_user_data`, `import_user_data` | Pending |
| `IAuditQueryService` | `query_audit_timeline` | Pending |

## Private Services

| Service | Methods | Status |
|---------|---------|--------|
| `IIdentityProviderGateway` | `build_sign_in_request`, `verify_callback` | Pending |
| `IRecurrenceMaterializer` | `generate_next_instance` | Pending |
| `ISchedulerEngine` | `build_weekly_schedule` | Pending |
| `IAvailabilityWindowResolver` | `resolve_effective_windows` | Pending |
| `IAspectTargetValidator` | `ensure_active_targets_total_100` | Pending |
| `IHealthComputationService` | `compute_cycle_health` | Pending |
| `IReminderDispatchService` | `dispatch_due_reminders`, `process_failed_reminders` | Pending |
| `IAccountErasureService` | `erase_user_account` | Pending |
| `IImportRemapService` | `remap_import_graph` | Pending |

## Controllers

| Controller | Methods | Status |
|------------|---------|--------|
| `AuthController` | `start_sign_in`, `handle_identity_callback`, `logout`, `delete_account` | Pending |
| `ProfileController` | `complete_onboarding`, `update_profile` | Pending |
| `AspectController` | `create_aspect`, `activate_aspect`, `update_aspect`, `archive_aspect`, `restore_aspect`, `query_aspects` | Pending |
| `MilestoneController` | `create_milestone`, `update_milestone`, `complete_milestone`, `reopen_milestone`, `archive_milestone`, `restore_milestone`, `query_milestones` | Pending |
| `TaskController` | `create_task`, `update_task`, `move_task`, `start_task`, `complete_task`, `reopen_task`, `archive_task`, `restore_task`, `bulk_mutate_tasks`, `query_tasks`, `get_task_detail` | Pending |
| `RecurrenceController` | `upsert_series`, `pause_or_resume_series`, `skip_or_move_occurrence`, `close_series` | Pending |
| `AvailabilityController` | `create_one_off_block`, `create_recurring_block`, `add_exception`, `update_archive_restore_block`, `query_effective_availability` | Pending |
| `PlanningController` | `generate_draft_plan`, `confirm_draft_plan`, `regenerate_confirmed_plan`, `edit_plan`, `query_cycles` | Pending |
| `ExecutionController` | `mark_allocation_outcome` | Pending |
| `ReminderController` | `upsert_reminder`, `snooze_reminder` | Pending |
| `DataPortabilityController` | `export_json`, `preview_import_json`, `start_import_json`, `get_import_status` | Pending |
| `AuditController` | `query_audit_timeline` | Pending |

## Repositories

| Repository | Aggregate | Key Methods | Status |
|------------|-----------|-------------|--------|
| `IUserRepository` | `User` | `find_by_id`, `find_by_identity_claim`, `create`, `delete` | Pending |
| `ISessionRepository` | `Session` | `create`, `find_active_by_token_hash`, `revoke`, `revoke_all_for_user`, `expire_past_lifetime` | Pending |
| `IPlanningProfileRepository` | `PlanningProfile` | `get_by_user_id`, `save` | Pending |
| `IAspectRepository` | `Aspect` | `find_by_id`, `save`, `archive`, `restore_to_draft`, `query`, `list_active_for_user`, `delete_by_user_id` | Pending |
| `IMilestoneRepository` | `Milestone` | `find_by_id`, `save`, `archive`, `restore_to_open`, `query`, `delete_by_aspect_ids` | Pending |
| `ITaskRepository` | `Task` + `TaskLock` | `find_by_id`, `save`, `archive`, `restore_to_backlog`, `bulk_load`, `query`, `load_detail_projection`, `find_active_lock`, `replace_active_lock`, `release_active_lock`, `cancel_future_allocations`, `cancel_pending_reminders`, `delete_by_user_id` | Pending |
| `IRecurringSeriesRepository` | `RecurringTaskSeries` | `find_by_id`, `save`, `close`, `find_by_task_instance`, `delete_by_user_id` | Pending |
| `IAvailabilityRepository` | `AvailabilityBlock` | `find_by_id`, `save`, `archive`, `restore`, `add_exception`, `query_live_blocks_for_range`, `delete_by_user_id` | Pending |
| `IPlanningCycleRepository` | `PlanningCycle` | `find_cycle_for_week`, `find_by_id`, `create_cycle_with_revision`, `create_draft_revision`, `confirm_cycle`, `supersede_and_create_revision`, `apply_plan_edit_revision`, `persist_outcome`, `persist_health_scores`, `query_cycles`, `delete_by_user_id` | Pending |
| `IReminderRepository` | `Reminder` | `find_by_id`, `find_active_by_task_channel`, `save`, `record_attempt`, `query_due`, `query_failed_for_retry`, `cancel_pending_for_task`, `delete_by_user_id` | Pending |
| `IImportJobRepository` | `ImportJob` | `create_running`, `mark_succeeded`, `mark_failed`, `delete_by_user_id` | Pending |
| `IAuditEventRepository` | `AuditEvent` | `append`, `query_for_user`, `delete_by_user_id` | Pending |
| `IIdempotencyKeyRepository` | `IdempotencyKey` | `find_by_user_command_key`, `save_first_response`, `delete_by_user_id` | Pending |
| `ISystemJobRunRepository` | `SystemJobRun` | `find_by_job_run_key`, `save_first_result` | Pending |

## Jobs

| Job | Interaction | Service Method | Status |
|-----|-------------|----------------|--------|
| `SessionExpiryJob` | `AUTH-04` | `IAuthService.expire_sessions(now)` | Pending |
| `DayBoundaryReplanJob` | `PLN-05` | `IPlanningService.replan_active_cycles(now)` | Pending |
| `HealthJob` | `EXE-02` | `IHealthComputationService.compute_cycle_health(cycle_id)` | Pending |
| `ReminderDispatchJob` | `REM-03` | `IReminderDispatchService.dispatch_due_reminders(now)` | Pending |
| `ReminderRetryJob` | `REM-04` | `IReminderDispatchService.process_failed_reminders(now)` | Pending |
| `TaskCompletionHook` | `REC-04` | `IRecurrenceMaterializer.generate_next_instance(completed_task_id)` | Pending |
| `JobIdempotencyWrapper` | `SYS-02` | wraps mutation-capable job entry points | Pending |
| `ImportUserDataWorkflow` | `DAT-02` | `IDataPortabilityService.import_user_data(user_id, payload)` | Pending |

## Source Precedence Resolutions

- `DAT-01` is synchronous inline export in v1 (overrides any older async wording)
- `DAT-02` is async import with job status polling
- Modal backdrops may be frosted, but destructive confirmation dialog content must remain opaque
- Hatchet enqueueing belongs in infra/job wiring, never in controllers or domain services
- `/(app)/settings/account` is read-only identity summary + logout/delete actions, not editable profile
