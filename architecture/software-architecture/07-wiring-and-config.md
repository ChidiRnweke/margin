# Wiring and Config

## Factory

`AppFactory` is the composition root.

Responsibilities:

- instantiate repositories with database/session dependencies
- instantiate private services
- instantiate public services with interface-typed dependencies
- instantiate controllers for HTTP routes
- expose service getters for job runners
- provide request-scoped principal and config context

The factory contains no domain branching logic.

## Example Wiring Graph

```text
AuthController
-> IAuthService -> AuthService
   -> IUserRepository
   -> ISessionRepository
   -> IPlanningProfileRepository
   -> IAccountErasureService [PRIVATE]
-> IIdentityProviderGateway [PRIVATE]

ProfileController
-> IProfileService -> ProfileService
   -> IPlanningProfileRepository
   -> IAspectRepository

TaskController
-> ITaskService -> TaskService
   -> ITaskRepository
   -> IAspectRepository
   -> IMilestoneRepository
   -> IPlanningProfileRepository
   -> IReminderRepository
   -> IPlanningCycleRepository
   -> IRecurrenceMaterializer [PRIVATE]

RecurrenceController
-> IRecurrenceService -> RecurrenceService
   -> IRecurringSeriesRepository
   -> IAspectRepository
   -> IMilestoneRepository
   -> IRecurrenceMaterializer [PRIVATE]

PlanningController
-> IPlanningService -> PlanningService
   -> IPlanningCycleRepository
   -> ITaskRepository
   -> IAvailabilityRepository
   -> IPlanningProfileRepository
   -> IAspectRepository
   -> ISchedulerEngine [PRIVATE]
   -> IAvailabilityWindowResolver [PRIVATE]
   -> IAspectTargetValidator [PRIVATE]

Reminder jobs
-> IReminderDispatchService [PRIVATE]
   -> IReminderRepository
   -> notification adapters
```

## Public vs Private Services

| Service                      | Visibility | Reason                                      |
| ---------------------------- | ---------- | ------------------------------------------- |
| `AuthService`                | public     | controller and job entrypoint               |
| `ProfileService`             | public     | controller-facing                           |
| `AspectService`              | public     | controller-facing                           |
| `MilestoneService`           | public     | controller-facing                           |
| `TaskService`                | public     | controller-facing                           |
| `RecurrenceService`          | public     | controller-facing                           |
| `AvailabilityService`        | public     | controller-facing                           |
| `PlanningService`            | public     | controller-facing and job entrypoint        |
| `ExecutionService`           | public     | controller-facing                           |
| `ReminderService`            | public     | controller-facing                           |
| `DataPortabilityService`     | public     | controller-facing                           |
| `AuditQueryService`          | public     | controller-facing                           |
| `RecurrenceMaterializer`     | private    | only used by task completion flow           |
| `SchedulerEngine`            | private    | only used by planning service               |
| `AvailabilityWindowResolver` | private    | only used by availability/planning services |
| `AspectTargetValidator`      | private    | only used by planning service               |
| `HealthComputationService`   | private    | job-only                                    |
| `ReminderDispatchService`    | private    | job-only                                    |
| `AccountErasureService`      | private    | internal coordination only                  |
| `ImportRemapService`         | private    | internal import coordination                |

## Route and Job Entry Rules

- HTTP routes resolve controllers from the factory.
- Jobs resolve services from the factory directly.
- A job never calls a controller.
- A route never bypasses service interfaces to repositories.

## Config Mapping

Required configuration:

- `DATABASE_URL`
- identity provider client id
- identity provider client secret
- identity provider callback URL
- session signing secret
- session max lifetime
- app base URL
- email provider credentials
- reminder snooze limit
- reminder exponential retry schedule
- reminder daily retry window
- default timezone handling policy

Optional configuration:

- export artifact storage backend
- import payload size limit
- job polling intervals

## Startup Validation

- Missing required configuration aborts startup.
- Retry schedule and snooze limits are validated on startup.
- Invalid timezone fallback configuration aborts startup.
- Database connectivity is validated before serving requests.

## Completeness Checklist

- [x] Every interaction from `architecture/interaction-matrix.md` maps to a controller, job, or infrastructure concern.
- [x] Every invariant family from `architecture/invariants.md` maps to a primary enforcement point.
- [x] Every aggregate has one repository boundary.
- [x] Public and private services are separated.
- [x] Job-only interactions bypass controllers.
- [x] Ownership is explicit.
- [x] Cross-cutting concerns are centralized.
- [x] Controllers remain thin.
- [x] Repositories speak only in domain models.
- [x] The factory is the only composition root.
