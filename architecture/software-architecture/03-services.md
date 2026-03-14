# Services

## Service Design Rules

- Services map to domain concerns, not one service per entity.
- A service may depend on multiple repositories.
- A public service is reachable from a controller.
- A private service is injected only into other services or jobs.
- Services enforce behavioral invariants, lifecycle transitions, and cross-aggregate orchestration.

## Public Services

## IAuthService

- Concern: identity resolution, session lifecycle, GDPR erasure entrypoint.
- Visibility: public.
- Dependencies:
  - `IUserRepository`
  - `ISessionRepository`
  - `IPlanningProfileRepository`
  - `IAccountErasureService`
- Methods:
  - `resolve_identity_callback(claims) -> AuthSessionResult`
  - `logout(session_id) -> None`
  - `expire_sessions(now) -> SessionExpiryResult`
  - `delete_account(user_id, session_id) -> None`
- Interaction coverage: `AUTH-02`, `AUTH-03`, `AUTH-04`, `AUTH-06`

## IProfileService

- Concern: planning profile maintenance and onboarding derivation.
- Visibility: public.
- Dependencies:
  - `IPlanningProfileRepository`
  - `IAspectRepository`
- Methods:
  - `complete_onboarding(user_id) -> OnboardingStatus`
  - `update_planning_profile(user_id, input, expected_version) -> PlanningProfile`
- Interaction coverage: `AUTH-05`, `PRF-01`

## IAspectService

- Concern: aspect lifecycle and its cascade coordination.
- Visibility: public.
- Dependencies:
  - `IAspectRepository`
  - `IMilestoneRepository`
  - `ITaskRepository`
  - `IRecurringSeriesRepository`
  - `IReminderRepository`
  - `IPlanningCycleRepository`
- Methods:
  - `create_aspect(user_id, input) -> Aspect`
  - `activate_aspect(user_id, aspect_id, input, expected_version) -> Aspect`
  - `update_aspect(user_id, aspect_id, input, expected_version) -> Aspect`
  - `archive_aspect(user_id, aspect_id, expected_version) -> None`
  - `restore_aspect(user_id, aspect_id, expected_version) -> Aspect`
  - `query_aspects(user_id, query) -> Page[AspectSummary]`
- Interaction coverage: `ASP-01..06`
- Key invariants owned:
  - active aspects participate in planning
  - activation requires valid metadata and target
  - archive cascades to descendant work and future planning artifacts
  - restore resets aspect to draft and leaves descendants archived

## IMilestoneService

- Concern: milestone lifecycle under an aspect.
- Visibility: public.
- Dependencies:
  - `IMilestoneRepository`
  - `IAspectRepository`
  - `ITaskRepository`
  - `IRecurringSeriesRepository`
- Methods:
  - `create_milestone(user_id, input) -> Milestone`
  - `update_milestone(user_id, milestone_id, input, expected_version) -> Milestone`
  - `complete_milestone(user_id, milestone_id, expected_version) -> Milestone`
  - `reopen_milestone(user_id, milestone_id, expected_version) -> Milestone`
  - `archive_milestone(user_id, milestone_id, expected_version) -> None`
  - `restore_milestone(user_id, milestone_id, expected_version) -> Milestone`
  - `query_milestones(user_id, query) -> Page[MilestoneSummary]`
- Interaction coverage: `MLS-01..07`

## ITaskService

- Concern: task lifecycle, bulk mutation, detail orchestration, and side effects.
- Visibility: public.
- Dependencies:
  - `ITaskRepository`
  - `IAspectRepository`
  - `IMilestoneRepository`
  - `IPlanningProfileRepository`
  - `IReminderRepository`
  - `IPlanningCycleRepository`
  - `IRecurrenceMaterializer`
- Methods:
  - `create_task(user_id, input) -> Task`
  - `update_task(user_id, task_id, input, expected_version) -> Task`
  - `move_task_milestone(user_id, task_id, milestone_id_or_none, expected_version) -> Task`
  - `start_task(user_id, task_id, expected_version) -> Task`
  - `complete_task(user_id, task_id, expected_version) -> TaskCompletionResult`
  - `reopen_task(user_id, task_id, expected_version) -> Task`
  - `archive_task(user_id, task_id, expected_version) -> None`
  - `restore_task(user_id, task_id, expected_version) -> Task`
  - `bulk_mutate_tasks(user_id, input) -> BulkTaskMutationResult`
  - `query_tasks(user_id, query) -> Page[TaskListItem]`
  - `get_task_detail(user_id, task_id) -> TaskDetail`
- Interaction coverage: `TSK-01..11`

## IRecurrenceService

- Concern: series, rule, and exception lifecycle.
- Visibility: public.
- Dependencies:
  - `IRecurringSeriesRepository`
  - `IAspectRepository`
  - `IMilestoneRepository`
  - `IRecurrenceMaterializer`
- Methods:
  - `upsert_series(user_id, input, expected_version_or_none) -> RecurringTaskSeries`
  - `pause_or_resume_series(user_id, series_id, paused, expected_version) -> RecurringTaskSeries`
  - `skip_or_move_next_occurrence(user_id, series_id, input, expected_version) -> RecurrenceException`
  - `close_series(user_id, series_id, expected_version) -> RecurringTaskSeries`
- Interaction coverage: `REC-01`, `REC-02`, `REC-03`, `REC-05`

## IAvailabilityService

- Concern: availability lifecycle and effective availability queries.
- Visibility: public.
- Dependencies:
  - `IAvailabilityRepository`
  - `IAvailabilityWindowResolver`
- Methods:
  - `create_one_off_block(user_id, input) -> AvailabilityBlock`
  - `create_recurring_block(user_id, input) -> AvailabilityBlock`
  - `add_recurring_exception(user_id, block_id, input) -> AvailabilityException`
  - `update_archive_restore_block(user_id, block_id, input, expected_version) -> AvailabilityBlock`
  - `query_effective_availability(user_id, range) -> EffectiveAvailability`
- Interaction coverage: `AVL-01..05`

## IPlanningService

- Concern: weekly planning lifecycle, revisions, edits, confirmations, and replans.
- Visibility: public.
- Dependencies:
  - `IPlanningCycleRepository`
  - `ITaskRepository`
  - `IAvailabilityRepository`
  - `IPlanningProfileRepository`
  - `IAspectRepository`
  - `ISchedulerEngine`
  - `IAvailabilityWindowResolver`
  - `IAspectTargetValidator`
- Methods:
  - `generate_draft_plan(user_id, week_start) -> PlanningDraftResult`
  - `confirm_draft_plan(user_id, cycle_id, expected_version) -> PlanningCycle`
  - `regenerate_confirmed_plan(user_id, cycle_id, expected_version) -> PlanningCycle`
  - `edit_plan(user_id, cycle_id, input, expected_version) -> PlanningRevisionSnapshot`
  - `replan_active_cycles(now) -> ReplanSummary`
  - `query_cycles(user_id, query) -> Page[PlanningCycleHistoryItem]`
- Interaction coverage: `PLN-01..06`

## IExecutionService

- Concern: manual allocation outcome recording.
- Visibility: public.
- Dependencies:
  - `IPlanningCycleRepository`
- Methods:
  - `mark_allocation_outcome(user_id, allocation_id, input, expected_version) -> AllocationOutcome`
- Interaction coverage: `EXE-01`

## IReminderService

- Concern: reminder creation, replacement, and snoozing.
- Visibility: public.
- Dependencies:
  - `IReminderRepository`
  - `ITaskRepository`
- Methods:
  - `upsert_reminder(user_id, task_id, input, expected_version_or_none) -> Reminder`
  - `snooze_reminder(user_id, reminder_id, input, expected_version) -> Reminder`
- Interaction coverage: `REM-01`, `REM-02`

## IDataPortabilityService

- Concern: import/export orchestration.
- Visibility: public.
- Dependencies:
  - `IImportJobRepository`
  - repositories for all exported/imported aggregates
  - `IImportRemapService`
- Methods:
  - `export_user_data(user_id) -> ExportPayload`
  - `import_user_data(user_id, payload) -> ImportReport`
- Interaction coverage: `DAT-01`, `DAT-02`

## IAuditQueryService

- Concern: read-only audit timeline queries.
- Visibility: public.
- Dependencies:
  - `IAuditEventRepository`
- Methods:
  - `query_audit_timeline(user_id, query) -> Page[AuditEvent]`
- Interaction coverage: `AUD-02`

## Private Services

## IIdentityProviderGateway

- Concern: provider request generation and callback claim verification.
- Visibility: private.
- Dependencies: external identity SDK/client.
- Methods:
  - `build_sign_in_request() -> RedirectRequest`
  - `verify_callback(input) -> VerifiedIdentityClaims`
- Interaction coverage: `AUTH-01`, `AUTH-02`

## IRecurrenceMaterializer

- Concern: generation of the next recurring task instance after completion.
- Visibility: private.
- Dependencies:
  - `IRecurringSeriesRepository`
  - `ITaskRepository`
  - timezone/calendar utilities
- Methods:
  - `generate_next_instance(completed_task_id) -> GenerationResult`
- Interaction coverage: `REC-04`

## ISchedulerEngine

- Concern: deterministic heuristic scheduling.
- Visibility: private.
- Dependencies: none beyond pure models and helpers.
- Methods:
  - `build_weekly_schedule(tasks, availability, profile, locks, horizon) -> SchedulerResult`
- Owns scoring, tie-breaks, feasibility filtering, greedy window assignment.

## IAvailabilityWindowResolver

- Concern: recurring expansion, exception application, and overlap merge.
- Visibility: private.
- Methods:
  - `resolve_effective_windows(blocks, range, timezone) -> list[EffectiveWindow]`

## IAspectTargetValidator

- Concern: active aspect target total validation at planning boundaries.
- Visibility: private.
- Methods:
  - `ensure_active_targets_total_100(aspects) -> None`

## IHealthComputationService

- Concern: aspect health computation.
- Visibility: private/job-only.
- Dependencies:
  - `IPlanningCycleRepository`
  - `IAspectRepository`
- Methods:
  - `compute_cycle_health(cycle_id) -> HealthComputationResult`
- Interaction coverage: `EXE-02`

## IReminderDispatchService

- Concern: reminder delivery, retries, daily retry queue, terminal failure.
- Visibility: private/job-only.
- Dependencies:
  - `IReminderRepository`
  - notification adapters
  - `IClock`
- Methods:
  - `dispatch_due_reminders(now) -> DispatchSummary`
  - `process_failed_reminders(now) -> RetrySummary`
- Interaction coverage: `REM-03`, `REM-04`

## IAccountErasureService

- Concern: full GDPR destructive deletion.
- Visibility: private.
- Dependencies:
  - all repositories containing user-owned data
- Methods:
  - `erase_user_account(user_id) -> None`

## IImportRemapService

- Concern: ID collision handling and reference rewrite during import.
- Visibility: private.
- Methods:
  - `remap_import_graph(payload, user_id) -> RemappedImportGraph`

## Cross-Service Composition Rule

- `TaskService` may use `IRecurrenceMaterializer` via constructor injection.
- `RecurrenceService` may use `IRecurrenceMaterializer` for first-instance materialization on `REC-01`.
- `PlanningService` may use `ISchedulerEngine`, `IAvailabilityWindowResolver`, and `IAspectTargetValidator` via constructor injection.
- No service reaches into another public service directly.
