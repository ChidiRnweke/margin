# Repositories

## Repository Rules

- One repository interface per aggregate root.
- Child entities are persisted through the root repository where they belong to the same aggregate.
- Repositories expose domain models only.
- Repositories own version checks and aggregate atomicity.
- Repositories never contain domain orchestration across different aggregates.
- Ownership enforcement uses one of two allowed patterns only: user-scoped query methods, or authorization middleware before unscoped repository access.

## Repository Interfaces

## IUserRepository

- Aggregate: `User`
- Methods:
  - `find_by_id(user_id) -> User`
  - `find_by_identity_claim(claims) -> User?`
  - `create(user: User) -> User`
  - `delete(user_id) -> None`

## ISessionRepository

- Aggregate: `Session`
- Methods:
  - `create(session: Session) -> Session`
  - `find_active_by_token_hash(token_hash) -> Session?`
  - `revoke(session_id) -> None`
  - `revoke_all_for_user(user_id) -> int`
  - `expire_past_lifetime(now) -> int`

## IPlanningProfileRepository

- Aggregate: `PlanningProfile`
- Methods:
  - `get_by_user_id(user_id) -> PlanningProfile`
  - `save(profile: PlanningProfile, expected_version: int) -> PlanningProfile`

## IAspectRepository

- Aggregate: `Aspect`
- Methods:
  - `find_by_id(aspect_id) -> Aspect`
  - `save(aspect: Aspect, expected_version: int | None) -> Aspect`
  - `archive(aspect_id, expected_version) -> None`
  - `restore_to_draft(aspect_id, expected_version) -> Aspect`
  - `query(user_id, query) -> Page[AspectSummary]`
  - `list_active_for_user(user_id) -> list[Aspect]`
  - `delete_by_user_id(user_id) -> int`

## IMilestoneRepository

- Aggregate: `Milestone`
- Methods:
  - `find_by_id(milestone_id) -> Milestone`
  - `save(milestone: Milestone, expected_version: int | None) -> Milestone`
  - `archive(milestone_id, expected_version) -> None`
  - `restore_to_open(milestone_id, expected_version) -> Milestone`
  - `query(user_id, query) -> Page[MilestoneSummary]`
  - `delete_by_aspect_ids(aspect_ids) -> int`

## ITaskRepository

- Aggregate: `Task` + `TaskLock`
- Methods:
  - `find_by_id(task_id) -> Task`
  - `save(task: Task, expected_version: int | None) -> Task`
  - `archive(task_id, expected_version) -> None`
  - `restore_to_backlog(task_id, expected_version) -> Task`
  - `bulk_load(task_ids) -> list[Task]`
  - `query(user_id, query) -> Page[TaskListItem]`
  - `load_detail_projection(task_id) -> TaskDetailProjection`
  - `find_active_lock(task_id) -> TaskLock?`
  - `replace_active_lock(task_id, lock_input) -> TaskLock`
  - `release_active_lock(task_id, expected_version) -> None`
  - `cancel_future_allocations(task_id) -> int`
  - `cancel_pending_reminders(task_id) -> int`
  - `delete_by_user_id(user_id) -> int`

## IRecurringSeriesRepository

- Aggregate: `RecurringTaskSeries` + `RecurrenceRule` + `RecurrenceException`
- Methods:
  - `find_by_id(series_id) -> RecurringTaskSeriesAggregate`
  - `save(aggregate, expected_version: int | None) -> RecurringTaskSeriesAggregate`
  - `close(series_id, expected_version) -> RecurringTaskSeriesAggregate`
  - `find_by_task_instance(task_id) -> RecurringTaskSeriesAggregate?`
  - `delete_by_user_id(user_id) -> int`

## IAvailabilityRepository

- Aggregate: `AvailabilityBlock` + `AvailabilityException`
- Methods:
  - `find_by_id(block_id) -> AvailabilityAggregate`
  - `save(aggregate, expected_version: int | None) -> AvailabilityAggregate`
  - `archive(block_id, expected_version) -> None`
  - `restore(block_id, expected_version) -> AvailabilityAggregate`
  - `add_exception(block_id, exception_input) -> AvailabilityException`
  - `query_live_blocks_for_range(user_id, range) -> list[AvailabilityAggregate]`
  - `delete_by_user_id(user_id) -> int`

## IPlanningCycleRepository

- Aggregate: `PlanningCycle` + `PlanningRevision` + `TaskAllocation` + `AllocationOutcome` + `AspectCycleHealth`
- Methods:
  - `find_cycle_for_week(user_id, week_start) -> PlanningCycleAggregate?`
  - `find_by_id(cycle_id) -> PlanningCycleAggregate`
  - `create_cycle_with_revision(aggregate) -> PlanningCycleAggregate`
  - `create_draft_revision(cycle_id, draft_input, expected_version) -> PlanningCycleAggregate`
  - `confirm_cycle(cycle_id, expected_version) -> PlanningCycleAggregate`
  - `supersede_and_create_revision(cycle_id, revision_input, expected_version) -> PlanningCycleAggregate`
  - `apply_plan_edit_revision(cycle_id, edit_input, expected_version) -> PlanningCycleAggregate`
  - `persist_outcome(allocation_id, outcome_input, expected_version) -> AllocationOutcome`
  - `persist_health_scores(cycle_id, scores) -> list[AspectCycleHealth]`
  - `query_cycles(user_id, query) -> Page[PlanningCycleHistoryItem]`
  - `delete_by_user_id(user_id) -> int`

## IReminderRepository

- Aggregate: `Reminder` + `ReminderAttempt`
- Methods:
  - `find_by_id(reminder_id) -> ReminderAggregate`
  - `find_active_by_task_channel(task_id, channel) -> ReminderAggregate?`
  - `save(aggregate, expected_version: int | None) -> ReminderAggregate`
  - `record_attempt(reminder_id, attempt_input) -> ReminderAttempt`
  - `query_due(now) -> list[ReminderAggregate]`
  - `query_failed_for_retry(now) -> list[ReminderAggregate]`
  - `cancel_pending_for_task(task_id) -> int`
  - `delete_by_user_id(user_id) -> int`

## IImportJobRepository

- Aggregate: `ImportJob`
- Methods:
  - `create_running(job: ImportJob) -> ImportJob`
  - `mark_succeeded(job_id, report) -> ImportJob`
  - `mark_failed(job_id, reason) -> ImportJob`
  - `delete_by_user_id(user_id) -> int`

## IAuditEventRepository

- Aggregate: `AuditEvent`
- Methods:
  - `append(event: AuditEvent) -> AuditEvent`
  - `query_for_user(user_id, query) -> Page[AuditEvent]`
  - `delete_by_user_id(user_id) -> int`

## IIdempotencyKeyRepository

- Aggregate: `IdempotencyKey`
- Methods:
  - `find_by_user_command_key(user_id, command_name, key_hash) -> IdempotencyKey?`
  - `save_first_response(record: IdempotencyKey) -> IdempotencyKey`
  - `delete_by_user_id(user_id) -> int`

## ISystemJobRunRepository

- Aggregate: `SystemJobRun`
- Methods:
  - `find_by_job_run_key(job_name, key_hash) -> SystemJobRun?`
  - `save_first_result(run: SystemJobRun) -> SystemJobRun`

## Persistence Responsibilities

- Repositories enforce optimistic concurrency on mutable records.
- `IPlanningCycleRepository` is responsible for revision contiguity and one-current-revision guarantees.
- `ITaskRepository` is responsible for one-active-lock-per-task guarantees.
- `IReminderRepository` is responsible for one-active-reminder-per-task-per-channel persistence rules.
- Repositories do not emit audit events and do not perform authorization.
- Query repositories/services must implement case-insensitive substring search and canonical task sorting for `TSK-10`.
