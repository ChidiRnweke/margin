# Invariants and Errors

## Invariant Enforcement Strategy

- Construction-time invariants -> models and value objects
- Behavioral invariants -> services
- Aggregate invariants -> repositories
- Cross-cutting invariants -> middleware, decorators, infrastructure

## Invariant Classification by Domain Area

## Identity, Access, and Erasure

- `INV-001..009` -> cross-cutting auth and audit infrastructure
- `INV-010..012` -> `IAuthService` + `IAccountErasureService` + hard-delete repository methods
- `INV-013` -> `IProfileService.complete_onboarding`

## Profile and Scoring

- `INV-020` -> `IAuthService.resolve_identity_callback` plus `IPlanningProfileRepository`
- `INV-021..025` -> `PlanningProfile` value objects and validators
- `INV-026` -> `ISchedulerEngine`

## Aspect Rules

- `INV-030..032` -> `Aspect` model and `IPlanningService`
- `INV-033..034` -> `IAspectTargetValidator` inside planning generation and confirmation
- `INV-035..036` -> `IAspectService`
- `INV-037` -> `IMilestoneService`, `ITaskService`, `IRecurrenceService`

## Milestone Rules

- `INV-040..041` -> `Milestone` model
- `INV-042..045` -> `IMilestoneService`

## Task Rules

- `INV-050..052` -> `Task` model
- `INV-053..056` -> `ITaskService`
- `INV-057..060` -> task validators and `ITaskService.complete_task`
- `INV-061..062` -> `ITaskService.move_task_milestone`
- `INV-063` -> `ITaskService.reopen_task`
- `INV-064..065` -> `ITaskService`

## Recurrence Rules

- `INV-070..077` -> `RecurringTaskSeries` aggregate model and repository
- `INV-078..079` -> `IRecurrenceService`
- `INV-080..082` -> `IRecurrenceMaterializer`
- `INV-083..089` -> `IRecurrenceService` and `IRecurrenceMaterializer`

## Availability Rules

- `INV-090` -> architectural restriction enforced by planning services using only availability as supply source
- `INV-091..100` -> `AvailabilityBlock` validators, `IAvailabilityService`, and `IAvailabilityWindowResolver`

## Planning Rules

- `INV-101..109` -> planning models and `IPlanningCycleRepository`
- `INV-110..126` -> `IPlanningService` + `ISchedulerEngine`

## Execution and Health Rules

- `INV-130..131` -> `IExecutionService` + `IPlanningCycleRepository.persist_outcome`
- `INV-132..133` -> `IHealthComputationService` + `IPlanningCycleRepository.persist_health_scores`

## Reminder Rules

- `INV-140..143` -> reminder model and `IReminderRepository`
- `INV-144` -> `IReminderService.snooze_reminder`
- `INV-145..149` -> `IReminderDispatchService`

## Query and Pagination Rules

- `INV-150..155` -> query infrastructure and query services

## Data Portability Rules

- `INV-160..166` -> `IDataPortabilityService` + `IImportRemapService`

## Audit and Compliance Rules

- `INV-170..173` -> audit decorator + `IAuditEventRepository`

## Idempotency, Bulk Mutation, and Jobs

- `INV-180..182` -> command idempotency infrastructure
- `INV-183..185` -> `ITaskService.bulk_mutate_tasks` + audit decorator
- `INV-186` -> job idempotency wrapper
- `INV-187..188` -> repository concurrency policy
- `INV-189` -> job services + job repositories

## Primary Error Types

| Interaction Error Code         | Domain Error Type              | Primary Raising Layer                   |
| ------------------------------ | ------------------------------ | --------------------------------------- |
| `AUTH_UNAUTHORIZED`            | `UnauthorisedError`            | auth middleware                         |
| `AUTH_SESSION_EXPIRED`         | `SessionExpiredError`          | auth middleware / auth service          |
| `VALIDATION_FAILED`            | `InputError`                   | model validators or services            |
| `STATE_TRANSITION_INVALID`     | `StateTransitionError`         | services                                |
| `OWNERSHIP_VIOLATION`          | `OwnershipError`               | authorization scope                     |
| `NOT_FOUND`                    | `NotFoundError`                | repositories/services                   |
| `TARGET_PERCENT_TOTAL_INVALID` | `TargetPercentTotalError`      | planning service                        |
| `CONFLICT_STALE_WRITE`         | `OptimisticConcurrencyError`   | repositories                            |
| `LOCK_CONFLICT`                | `LockConflictError`            | planning/task repositories and services |
| `QUERY_CURSOR_INVALID`         | `CursorShapeError`             | query infrastructure                    |
| `IDEMPOTENCY_HASH_MISMATCH`    | `IdempotencyHashMismatchError` | idempotency infrastructure              |
| `SNOOZE_LIMIT_EXCEEDED`        | `SnoozeLimitExceededError`     | reminder service                        |
| `IMPORT_CONFLICT_REMAP_FAILED` | `ImportRemapError`             | import remap service                    |
| `RETRY_EXHAUSTED`              | `RetryExhaustedError`          | reminder dispatch service               |

## Error Ownership Rules

- Transport-layer auth failures originate before controller logic.
- Construction errors originate in value objects and DTO validation.
- State and business-rule errors originate in services.
- Concurrency and persistence absence errors originate in repositories.
- Cursor and idempotency mismatches originate in shared infrastructure.
