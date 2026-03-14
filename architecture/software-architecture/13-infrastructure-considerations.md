# Infrastructure Considerations

This document maps the software architecture to the minimum infrastructure required to implement Margin end to end.

Decision constraints captured during planning:

- use background jobs for scheduled/system work and async import flows
- use Hatchet as the background job runner
- keep export synchronous and inline for v1
- do not add speculative infrastructure

## Infrastructure Summary

| Component    | Needed | Why                                                                                   |
| ------------ | ------ | ------------------------------------------------------------------------------------- |
| `PostgreSQL` | yes    | source of truth for all aggregates, sessions, audit, idempotency, and job-run records |
| `Hatchet`    | yes    | scheduled jobs and async import execution                                             |
| `MinIO`      | no     | export is synchronous inline JSON in v1, so no artifact storage is required           |
| `Redis`      | no     | sessions, idempotency, and job deduplication are modeled in Postgres                  |
| `pgvector`   | no     | search is standard query/filter/search behavior, not semantic similarity              |

## Operation Classification

Only operations that justify infrastructure beyond plain synchronous request/response + Postgres are listed here.

| Operation                          | Entry Point                             | Infrastructure          | Why                                                                   |
| ---------------------------------- | --------------------------------------- | ----------------------- | --------------------------------------------------------------------- |
| `AUTH-04` Session expiry           | `SessionExpiryJob`                      | `Hatchet` cron workflow | scheduled sweep over expired sessions                                 |
| `PLN-05` Day-boundary replan       | `DayBoundaryReplanJob`                  | `Hatchet` cron workflow | scheduled planning recomputation should stay off the request path     |
| `EXE-02` Compute aspect health     | `HealthJob`                             | `Hatchet` cron workflow | scheduled derived-state computation                                   |
| `REM-03` Dispatch due reminders    | `ReminderDispatchJob`                   | `Hatchet` workflow      | polling, delivery, and retry-friendly background execution            |
| `REM-04` Process failed reminders  | `ReminderRetryJob`                      | `Hatchet` cron workflow | scheduled retry processing                                            |
| `DAT-02` Import JSON with ID remap | `DataPortabilityController.import_json` | `Hatchet` workflow      | async import may touch many aggregates and should return a job handle |

The following operations stay synchronous and do not justify extra infrastructure:

- `DAT-01` export JSON remains an inline HTTP response in v1.
- `SYS-01` idempotent command handling uses `IdempotencyKey` persistence in Postgres.
- `SYS-02` idempotent job handling uses `SystemJobRun` persistence in Postgres.
- auth session lookup remains Postgres-backed until a concrete cache requirement appears.

## Infrastructure Responsibilities

## PostgreSQL

Postgres remains the only stateful system of record.

It stores:

- all domain aggregates and projections implied by repository interfaces
- session records through `ISessionRepository`
- idempotency records through `IIdempotencyKeyRepository`
- job deduplication and status records through `ISystemJobRunRepository`
- import job records through `IImportJobRepository`
- audit events through `IAuditEventRepository`

Design rules:

- Postgres is authoritative even when work is executed by Hatchet.
- Hatchet workflow state is orchestration-only; domain state changes are persisted through repositories.
- No Redis cache is assumed for correctness.

## Hatchet

Hatchet is the single background execution mechanism for this architecture.

It is responsible for:

- cron-triggered jobs for session expiry, replan, health computation, and reminder retry/dispatch loops
- async execution of `DAT-02` import flows
- durable retries for reminder delivery and import steps where appropriate
- isolating long-running or scheduled work from the HTTP request cycle

Integration rules:

- jobs resolve services from `AppFactory` directly and never call controllers
- each mutation-capable job run is wrapped by the `SYS-02` job idempotency policy
- workflow steps write results back through repositories rather than keeping state in the workflow engine
- import workflows update `ImportJob` status as `Running`, `Succeeded`, or `Failed`

Recommended workflow split:

- `SessionExpiryWorkflow` -> `IAuthService.expire_sessions(now)`
- `DayBoundaryReplanWorkflow` -> `IPlanningService.replan_active_cycles(now)`
- `HealthComputationWorkflow` -> `IHealthComputationService.compute_cycle_health(cycle_id)`
- `ReminderDispatchWorkflow` -> `IReminderDispatchService.dispatch_due_reminders(now)`
- `ReminderRetryWorkflow` -> `IReminderDispatchService.process_failed_reminders(now)`
- `ImportUserDataWorkflow` -> `IDataPortabilityService.import_user_data(user_id, payload)` or a workflow-owned decomposition of that use case

## External Providers

The architecture also depends on external providers that are not self-hosted infrastructure components in this repo:

- identity provider for `AUTH-01` and `AUTH-02`
- email or notification provider for reminder delivery in `REM-03`
- Infisical in production for secret/config delivery

These are required integrations, but they do not change the core local runtime topology beyond adapter wiring.

## Runtime Topology

Local development/runtime services:

- `postgres` - primary database
- `hatchet-engine` - workflow engine for local development
- `backend` - HTTP API and application services
- `worker` - Hatchet worker process registering workflows
- `frontend` - application UI

Production services:

- `postgres`
- `backend`
- `worker`
- existing production OpenTelemetry collector
- existing production Hatchet control plane/engine, with project-specific worker deployment

## Docker Compose Shape

The minimum compose topology implied by this architecture is:

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16

  hatchet-engine:
    image: ghcr.io/hatchet-dev/hatchet/hatchet-engine:latest

  backend:
    build: ./backend

  worker:
    build: ./backend
    command: python -m myapp.workers

  frontend:
    build: ./frontend
```

Notes:

- no `redis` service is included
- no `minio` service is included
- no `pgvector` image is needed

## Configuration Additions

Required application config from the architecture remains in force:

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

Additional config required by the chosen infrastructure:

### Development

```dotenv
DATABASE_URL=<local postgres url>
HATCHET_CLIENT_TOKEN=<local hatchet token>
```

### Production

Store the same keys in Infisical with production values:

- `DATABASE_URL`
- `HATCHET_CLIENT_TOKEN`
- identity provider secrets
- email provider secrets
- session signing secret

Optional knobs that may be surfaced explicitly in config:

- job polling intervals
- cron schedules for reminder dispatch and retry windows
- import payload size limit

## API and Execution Consequences

- `DAT-02` should expose an async job-oriented API shape: start import, then query job status/result.
- `DAT-01` should remain a synchronous controller/service flow returning JSON directly.
- if export later becomes async or downloadable by link, add `MinIO` at that time and reintroduce persisted export artifact handling.

## Implementation Guardrails

- do not introduce Redis unless a concrete cache, rate-limit, or session-throughput bottleneck appears
- do not introduce MinIO unless import/export or uploads require durable file artifacts
- do not introduce pgvector unless the product adds semantic similarity search
- keep scheduled and long-running work in Hatchet, not inside request handlers
- keep Postgres as the source of truth for all durable domain and job state

## Completeness Statement

With this document added, the `architecture/software-architecture/` folder now covers:

- architecture style and cross-cutting concerns
- aggregates and repositories
- services, controllers, and jobs
- invariants, failures, and traceability
- wiring and config
- infrastructure mapping and runtime composition

That is enough for an implementation agent to execute the project end to end, with one caveat: external provider choices still need concrete adapter selections and credentials at implementation time.
