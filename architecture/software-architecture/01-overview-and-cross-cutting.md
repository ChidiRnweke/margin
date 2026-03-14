# Overview and Cross-Cutting

## System Overview

Margin is a personal planning system that helps a user allocate constrained weekly time across life aspects, milestones, tasks, recurring work, availability, plans, reminders, and audit history.

The software architecture is a layered domain architecture:

- `models` -> pure domain data and construction-time validation
- `repositories` -> aggregate persistence and atomicity
- `services` -> business rules and orchestration
- `controllers` -> request/response adaptation only
- `jobs` -> scheduled/system entry points using the same services
- `factory` -> dependency injection and wiring only

## Dependency Rules

Required dependency graph:

```text
Models        -> import nothing
Errors        -> import nothing
Repositories  -> import models, errors
Services      -> import models, repository interfaces, errors
Controllers   -> import request/response DTOs, service interfaces
Jobs          -> import factory, service interfaces
Factory       -> import everything concrete
Routes        -> import factory and transport DTOs
Config        -> import nothing
```

Additional rules:

- Services never import other services directly.
- Controllers never contain business logic over domain data.
- Factory contains no branching business rules.
- Background jobs bypass controllers.
- Repositories speak only in domain models, never ORM models.

## Ownership Model

### Business Ownership

- Every mutable planning-domain record belongs to exactly one user, directly or by inheritance from a parent/root.
- Cross-user reads and writes are forbidden.
- `SystemJobRun` is system-owned, but user-affecting system mutations still stamp the affected user in audit history.

### Directly User-Owned Roots

- `User`
- `PlanningProfile`
- `Session`
- `Aspect`
- `RecurringTaskSeries`
- `AvailabilityBlock`
- `PlanningCycle`
- `ImportJob`
- `ExportJob`
- `AuditEvent`
- `IdempotencyKey`

### Inherited Ownership

- `Milestone` -> owned through `Aspect`
- `Task` -> owned through `Aspect`
- `TaskLock` -> owned through `Task`
- `Reminder` -> owned through `Task`
- `ReminderAttempt` -> owned through `Reminder`
- `RecurrenceRule` and `RecurrenceException` -> owned through `RecurringTaskSeries`
- `AvailabilityException` -> owned through `AvailabilityBlock`
- `PlanningRevision`, `TaskAllocation`, `AllocationOutcome`, `AspectCycleHealth` -> owned through `PlanningCycle`

### Architectural Ownership

- Models own data shape validity.
- Repositories own aggregate atomicity and version protection.
- Services own lifecycle rules and business invariants.
- Controllers own transport adaptation.
- Middleware and infrastructure own repeated systemic rules.

## Cross-Cutting Concerns

| Concern                             | Applies To                            | Primary Invariants                         | Mechanism                          | Notes                                                   |
| ----------------------------------- | ------------------------------------- | ------------------------------------------ | ---------------------------------- | ------------------------------------------------------- |
| Authorization scope                 | All authenticated reads and writes    | `INV-001`, `INV-002`, `INV-006`, `INV-007` | middleware/decorator               | Resolves principal and scopes access by `user_id`       |
| Verified identity                   | All user mutations after sign-in      | `INV-003`                                  | middleware                         | Rejects mutation if identity is unverified              |
| Session validity                    | Session-backed flows                  | `INV-004`, `INV-005`                       | auth middleware                    | Maps to unauthorized/session-expired errors             |
| Idempotent commands                 | All create and mutate user commands   | `INV-180..182`                             | infrastructure service + decorator | Uses `IdempotencyKey` storage                           |
| Idempotent jobs                     | Mutation-capable jobs                 | `INV-186`                                  | job wrapper                        | Uses `SystemJobRun` storage                             |
| Audit emission                      | All successful writes                 | `INV-009`, `INV-170..173`, `INV-185`       | service decorator                  | Emits one immutable audit event per successful mutation |
| Optimistic concurrency              | All mutable aggregates with `version` | `INV-118`, `INV-187`, `INV-188`            | repository policy                  | Repositories raise stale-write conflict                 |
| Cursor query shape binding          | Paginated query flows                 | `INV-150`, `INV-151`, `INV-155`            | shared cursor codec                | Cursor is bound to filter and sort contract             |
| Default read filtering              | Query services                        | `INV-152` plus archive exclusion rules     | query/repository defaults          | Task lists exclude archived and done by default         |
| Ownership-stamped service mutations | Service-principal writes to user data | `INV-173`                                  | audit infrastructure               | Ensures user-visible audit timeline remains correct     |

## Principal Types

- `UserSession`
- `ServicePrincipal`

The principal is attached to every mutation context and passed into audit emission infrastructure.

## Architectural Consequences

- Authorization checks are not repeated manually in every service method.
- Audit emission is not handwritten in each mutation path.
- Optimistic concurrency is enforced at the repository boundary, not scattered across controllers.
- Query cursor semantics are centralized so all paginated endpoints behave consistently.
