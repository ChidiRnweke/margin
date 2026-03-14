# Blueprint: Margin End-to-End Implementation

## Executor Instructions

You are executing this blueprint. Follow these rules:

1. Read this file first on every loop. After context compaction, this file is the source of truth.
2. Copy the remaining unchecked steps into your scratchpad before starting work.
3. Validate the plan assumptions against the live repo before the first execution step; update this file if paths need to shift.
4. Do the next unchecked step only. Do not combine steps unless this file explicitly says to.
5. Verify each step exactly as written before checking it off.
6. After a passing verification, change the step from `- [ ]` to `- [x]` and commit with `git add -A && git commit -m "blueprint: [step title]"`.
7. Do not invent new architecture. Follow `architecture/software-architecture/`, `architecture/ui_ux/`, and `DESIGN_SYSTEM.md` exactly.
8. Keep controllers thin, keep models pure, keep repositories aggregate-scoped, and keep cross-cutting logic in shared infrastructure.
9. If blocked, add a note under the step describing the blocker, what was verified, and what assumption future steps must respect.
10. Keep this file current if execution discoveries change later steps.

## Context

Margin is specified as a full personal planning product, not a simple CRUD app. The domain docs in `architecture/domain/` define user-scoped aspects, milestones, tasks, recurring task series, availability blocks, weekly planning cycles, allocations, reminders, audit events, idempotency records, and portability jobs. The sequence diagrams in `architecture/sequence-diagrams/` define the exact end-to-end flows, alternate paths, cascades, retries, and background processing behavior. The translation in `architecture/software-architecture/` further fixes the implementation shape: pure domain models, aggregate repositories, orchestration services, thin controllers, job entry points, a single composition root, and explicit cross-cutting infrastructure for authorization, audit, idempotency, cursor pagination, and optimistic concurrency.

The UI docs in `architecture/ui_ux/` and `DESIGN_SYSTEM.md` specify the complete product surface: auth entry, auth callback, a four-step onboarding wizard, dashboard, weekly plan timeline, plan revision history feed, aspects overview and detail, tasks master-detail with progressive disclosure creation, recurrence controls, reminders, availability management, settings hub and spokes, data portability, and audit timeline. These documents also fix the UX patterns, responsive breakpoints, deep-linking, loading and empty states, glass usage limits, accessibility requirements, and component conventions.

The current repository is only a scaffold. `src/routes/+page.svelte` is still the default welcome page, `src/routes/+layout.svelte` only imports the global stylesheet, `src/lib/server/db/schema.ts` contains a toy SQLite `task` table, and `package.json` currently reflects a starter SvelteKit + Drizzle + SQLite setup. This plan therefore covers the full implementation from platform foundation through backend, frontend, jobs, tests, and release verification. The architecture docs are treated as the contract whenever they differ from the starter scaffold.

## Scope

**In scope:**

- Replace the starter persistence/runtime assumptions with the architecture-aligned implementation baseline.
- Implement every documented domain aggregate, value object, enum, invariant, interaction, controller, repository, service, job, and UI route.
- Implement the full design system, route groups, overlays, empty states, loading states, accessibility behavior, and responsive layouts.
- Implement idempotency, optimistic concurrency, audit emission, cursor pagination, import/export, reminder retry logic, and scheduler-driven weekly planning.
- Add automated tests and end-to-end verification that cover the documented flows and failure paths.

**Out of scope:**

- Production vendor selection beyond the architecture's required abstractions; concrete providers should plug into the interfaces defined here.
- Features not present in the architecture docs.
- Redis, MinIO, pgvector, or additional infrastructure explicitly ruled out in `architecture/software-architecture/13-infrastructure-considerations.md`.

## Architecture Decisions

- The implementation follows the architecture docs literally, including the move away from the current SQLite starter toward the architecture baseline of Postgres as the system of record and Hatchet-style background execution. The starter schema and DB bootstrap are transitional and should be replaced rather than extended. See `drizzle.config.ts`, `src/lib/server/db/index.ts`, and `architecture/software-architecture/13-infrastructure-considerations.md`.
- The server code will live under `src/lib/server/` with explicit layers: `domain`, `errors`, `repositories`, `services`, `controllers`, `jobs`, `factory`, and `infra`. Route files under `src/routes/` remain transport adapters that resolve request-scoped controllers from the factory.
- The frontend code will use token-aware primitives and layout components under `src/lib/components/` exactly as prescribed by `DESIGN_SYSTEM.md`. No raw buttons, inputs, ad hoc spacing, or unstructured layouts should survive in feature code.
- The task list, plan history, audit feed, and aspect/milestone queries use cursor pagination, never numbered pages. Task selection and aspect tab selection must be deep-linkable.
- Cross-cutting guarantees are treated as infrastructure, not repeated business logic: authorization scope, verified identity, idempotent command execution, job idempotency, audit emission, cursor validation, and optimistic concurrency enforcement.
- The scheduler is a deterministic heuristic greedy engine, not an optimizer. It must preserve locks, past allocations, due-feasibility, minimum chunk behavior, splittable vs non-splittable behavior, and deferred-but-feasible tasks.
- Account erasure is a true hard-delete cascade of user-owned data and operational records, including audit history, sessions, idempotency keys, and portability jobs, per the sequence diagrams.

## Interfaces and Models

The implementation must define these packages and types before feature work starts:

- `src/lib/server/domain/value-objects/`: `EmailAddress`, `DisplayName`, `IanaTimezone`, `PlannerWeight`, `UrgentThresholdDays`, `MinChunkMinutes`, `PositiveMinutes`, `NonNegativeMinutes`, `ImportanceScore`, `TargetPercentage`, `AspectName`, `AspectPurpose`, `MilestoneTitle`, `TaskTitle`, `TaskTitleTemplate`, `PositiveInterval`, `WeekdayMask`, `MonthDay`, `RevisionNumber`, local-date and UTC-window helper value objects, cursor tokens, request hashes, idempotency keys, and any remaining value objects named in `architecture/software-architecture/02-aggregates-and-models.md`.
- `src/lib/server/domain/models/`: `User`, `Session`, `PlanningProfile`, `Aspect`, `Milestone`, `Task`, `TaskLock`, `RecurringTaskSeries`, `RecurrenceRule`, `RecurrenceException`, `AvailabilityBlock`, `AvailabilityException`, `PlanningCycle`, `PlanningRevision`, `TaskAllocation`, `AllocationOutcome`, `AspectCycleHealth`, `Reminder`, `ReminderAttempt`, `ImportJob`, `AuditEvent`, `IdempotencyKey`, `SystemJobRun`.
- `src/lib/server/repositories/contracts/`: one repository contract per aggregate root plus read-model/query contracts for task list/detail, aspect list, milestone list, planning history, audit feed, and effective availability.
- `src/lib/server/services/contracts/`: `AuthService`, `ProfileService`, `AspectService`, `MilestoneService`, `TaskService`, `RecurrenceService`, `AvailabilityService`, `PlanningService`, `ExecutionService`, `ReminderService`, `DataPortabilityService`, `AuditQueryService`.
- `src/lib/server/services/internal/`: `IdentityProviderGateway`, `RecurrenceMaterializer`, `SchedulerEngine`, `AvailabilityWindowResolver`, `AspectTargetValidator`, `HealthComputationService`, `ReminderDispatchService`, `AccountErasureService`, `ImportRemapService`.
- `src/lib/server/controllers/`: one controller per concern mirroring the service surface and interaction IDs.
- `src/lib/server/infra/`: auth/session middleware, principal context, audit emitter, idempotency wrappers, cursor codec, clock abstraction, timezone utilities, request hashing, DTO validation, transport error mapping, and provider adapters.

## Plan

- [ ] **Step 1: Replace the starter runtime assumptions with the architecture baseline**
      **Files:** `package.json` (modify), `drizzle.config.ts` (modify), `.env.example` (modify), `README.md` (modify), `src/lib/server/db/index.ts` (modify or replace), `docker-compose.yml` (create), `src/lib/server/config/runtime.ts` (create)
      **What:** Replace the current SQLite-oriented setup with the architecture-aligned baseline: Postgres connection config, worker/runtime scripts, and environment placeholders for app URL, session secrets, identity provider config, reminder policy, email/notification provider credentials, and Hatchet token. Keep Drizzle if useful, but the dialect and DB bootstrap must target Postgres. Document local runtime services (`postgres`, app, worker, Hatchet engine or equivalent dev runtime) and the expected startup flow.
      **Verify:** `pnpm install`, `pnpm check`, and a local config smoke test command such as `pnpm exec tsx src/lib/server/config/runtime.ts` succeed without referencing SQLite.

- [ ] **Step 2: Create the server package skeleton and dependency boundaries**
      **Files:** `src/lib/server/domain/README.md` (create), `src/lib/server/errors/index.ts` (create), `src/lib/server/repositories/contracts/index.ts` (create), `src/lib/server/services/contracts/index.ts` (create), `src/lib/server/controllers/index.ts` (create), `src/lib/server/jobs/index.ts` (create), `src/lib/server/factory/app-factory.ts` (create), `src/lib/server/infra/index.ts` (create)
      **What:** Establish the exact package layout the architecture expects. Add barrel files and short module comments only where necessary to communicate layer intent. Ensure there is no leftover starter-only structure implying business logic should live in route files.
      **Verify:** `pnpm check` passes and imports can resolve through the new package skeleton.

- [ ] **Step 3: Implement validated environment and startup configuration**
      **Files:** `src/lib/server/config/env.ts` (create), `src/lib/server/config/public.ts` (create), `src/lib/server/config/private.ts` (create), `src/lib/server/config/reminder-policy.ts` (create), `src/lib/server/config/timezone-policy.ts` (create), `src/lib/server/config/index.ts` (create)
      **What:** Build the startup validation layer described by the architecture docs. Validate database URL, app base URL, session lifetime, identity provider credentials, session secret, reminder snooze limit, exponential retry schedule, daily retry window, timezone defaults, email/notification provider credentials for reminder channels, and Hatchet token. Add an explicit boot-time database connectivity check so the app and worker fail fast if the URL is syntactically valid but the database cannot be contacted. Export typed config objects for app runtime and worker runtime.
      **Verify:** A config unit test or smoke test proves invalid env fails fast, unreachable databases fail startup fast, and valid env produces typed config.

- [ ] **Step 4: Implement shared domain errors and transport mapping**
      **Files:** `src/lib/server/errors/domain-errors.ts` (create), `src/lib/server/errors/http-error-mapper.ts` (create), `src/lib/server/errors/index.ts` (modify), `src/hooks.server.ts` (create or modify)
      **What:** Define the architecture-specified domain error taxonomy (`UnauthorisedError`, `SessionExpiredError`, `InputError`, `StateTransitionError`, `OwnershipError`, `NotFoundError`, `TargetPercentTotalError`, `OptimisticConcurrencyError`, `LockConflictError`, `CursorShapeError`, `IdempotencyHashMismatchError`, `SnoozeLimitExceededError`, `ImportRemapError`, `RetryExhaustedError`). Add a transport mapper so route handlers and hooks can convert domain failures into stable HTTP responses.
      **Verify:** Unit tests prove each error maps to the expected HTTP status and response shape.

- [ ] **Step 5: Implement principal context, auth scope, and verified identity guards**
      **Files:** `src/lib/server/infra/auth/principals.ts` (create), `src/lib/server/infra/auth/session-context.ts` (create), `src/lib/server/infra/auth/authorization-scope.ts` (create), `src/lib/server/infra/auth/verified-identity-guard.ts` (create), `src/app.d.ts` (modify), `src/hooks.server.ts` (modify)
      **What:** Introduce `UserSession` and `ServicePrincipal` models, request-scoped principal loading, verified identity checks, and reusable authorization helpers. This must support the rule that all domain reads/writes happen under a principal except pre-session auth flows.
      **Verify:** Hook/middleware tests prove anonymous requests stay anonymous, valid sessions resolve to `locals`, expired/revoked sessions fail correctly, and mutation guards reject unverified identities.

- [ ] **Step 6: Implement shared clock, timezone, cursor, and hashing utilities**
      **Files:** `src/lib/server/infra/time/clock.ts` (create), `src/lib/server/infra/time/timezone.ts` (create), `src/lib/server/infra/pagination/cursor-codec.ts` (create), `src/lib/server/infra/pagination/cursor-shape.ts` (create), `src/lib/server/infra/idempotency/request-hash.ts` (create)
      **What:** Build reusable infrastructure for time handling, timezone-aware local date operations, cursor encoding/decoding bound to query shape, and normalized request hashing for commands and jobs. These utilities are prerequisites for recurrence, planning, reminders, and cursor-based list UIs.
      **Verify:** Unit tests cover DST-sensitive local date conversion, cursor encode/decode round-trips, invalid cursor rejection, and stable request hash generation.

- [ ] **Step 7: Implement domain enums and value objects**
      **Files:** `src/lib/server/domain/enums.ts` (create), `src/lib/server/domain/value-objects/email-address.ts` (create), `src/lib/server/domain/value-objects/iana-timezone.ts` (create), `src/lib/server/domain/value-objects/planner-weight.ts` (create), `src/lib/server/domain/value-objects/urgent-threshold-days.ts` (create), `src/lib/server/domain/value-objects/min-chunk-minutes.ts` (create), `src/lib/server/domain/value-objects/positive-minutes.ts` (create), `src/lib/server/domain/value-objects/non-negative-minutes.ts` (create), `src/lib/server/domain/value-objects/importance-score.ts` (create), `src/lib/server/domain/value-objects/target-percentage.ts` (create), `src/lib/server/domain/value-objects/index.ts` (create)
      **What:** Encode all status enums and validated primitives that the architecture expects. This step must not stop at the short seed list above: add every value object and enum named or implied by `architecture/software-architecture/02-aggregates-and-models.md`, including display/name/title template objects, recurrence cadence helpers, weekday masks, month-day objects, and revision numbers. Keep them free of persistence concerns and enforce exact allowed ranges and construction-time validation derived from the invariants.
      **Verify:** Domain unit tests cover valid ranges, invalid construction, enum exhaustiveness, and one test per value object named in the aggregate spec.

- [ ] **Step 8: Implement identity, profile, and session aggregate models**
      **Files:** `src/lib/server/domain/models/user.ts` (create), `src/lib/server/domain/models/session.ts` (create), `src/lib/server/domain/models/planning-profile.ts` (create), `src/lib/server/domain/models/index.ts` (modify)
      **What:** Model `User`, `Session`, and `PlanningProfile` exactly as defined in the ERD and aggregate docs, including timezone snapshots, identity verification, session lifecycle, profile weights, urgent threshold, min chunk, default effort, and optimistic concurrency where required.
      **Verify:** Unit tests cover one-profile assumptions, valid/invalid profile ranges, session terminal states, and value-object composition.

- [ ] **Step 9: Implement aspect and milestone aggregate models**
      **Files:** `src/lib/server/domain/models/aspect.ts` (create), `src/lib/server/domain/models/milestone.ts` (create), `src/lib/server/domain/models/index.ts` (modify)
      **What:** Model flat aspects, status transitions, target percentages, default splittable policy, milestone ownership, milestone statuses, and archive/restore metadata. Do not embed child tasks inside the models; keep aggregate boundaries aligned with the architecture.
      **Verify:** Unit tests cover valid state construction, archive/restore reset semantics, and target percentage constraints.

- [ ] **Step 10: Implement task, lock, recurrence, and reminder aggregate models**
      **Files:** `src/lib/server/domain/models/task.ts` (create), `src/lib/server/domain/models/task-lock.ts` (create), `src/lib/server/domain/models/recurring-task-series.ts` (create), `src/lib/server/domain/models/recurrence-rule.ts` (create), `src/lib/server/domain/models/recurrence-exception.ts` (create), `src/lib/server/domain/models/reminder.ts` (create), `src/lib/server/domain/models/reminder-attempt.ts` (create), `src/lib/server/domain/models/index.ts` (modify)
      **What:** Implement task lifecycle, effort and remaining minutes, due-date day granularity, milestone linkage, recurring series metadata, recurrence rules and exceptions, reminder channels/statuses, retry/snooze fields, and time snapshot fields. Capture the exact distinctions between paused, closed, failed, cancelled, sent, backlog, in-progress, done, and archived.
      **Verify:** Unit tests cover task state validity, recurrence rule shapes, exception action validity, and reminder state field requirements.

- [ ] **Step 11: Implement availability, planning, execution, audit, portability, idempotency, and job aggregate models**
      **Files:** `src/lib/server/domain/models/availability-block.ts` (create), `src/lib/server/domain/models/availability-exception.ts` (create), `src/lib/server/domain/models/planning-cycle.ts` (create), `src/lib/server/domain/models/planning-revision.ts` (create), `src/lib/server/domain/models/task-allocation.ts` (create), `src/lib/server/domain/models/allocation-outcome.ts` (create), `src/lib/server/domain/models/aspect-cycle-health.ts` (create), `src/lib/server/domain/models/import-job.ts` (create), `src/lib/server/domain/models/audit-event.ts` (create), `src/lib/server/domain/models/idempotency-key.ts` (create), `src/lib/server/domain/models/system-job-run.ts` (create), `src/lib/server/domain/models/index.ts` (modify)
      **What:** Model one-off and recurring availability, exceptions, weekly planning cycles, immutable revisions, allocations, outcomes, health snapshots, async import jobs, immutable audit events, idempotency records, and system job runs. Do not add a persisted export job in v1; `DAT-01` remains synchronous. Preserve all time snapshots and state machines from the ERD and the software architecture.
      **Verify:** Unit tests cover availability shape validation, revision immutability metadata, allocation status constraints, and append-only audit/job state construction.

- [ ] **Step 12: Implement the relational schema and migrations for all aggregates**
      **Files:** `src/lib/server/db/schema/users.ts` (create), `src/lib/server/db/schema/sessions.ts` (create), `src/lib/server/db/schema/planning-profiles.ts` (create), `src/lib/server/db/schema/aspects.ts` (create), `src/lib/server/db/schema/milestones.ts` (create), `src/lib/server/db/schema/tasks.ts` (create), `src/lib/server/db/schema/recurrence.ts` (create), `src/lib/server/db/schema/availability.ts` (create), `src/lib/server/db/schema/planning.ts` (create), `src/lib/server/db/schema/reminders.ts` (create), `src/lib/server/db/schema/portability.ts` (create), `src/lib/server/db/schema/audit.ts` (create), `src/lib/server/db/schema/idempotency.ts` (create), `src/lib/server/db/schema/system-jobs.ts` (create), `src/lib/server/db/schema/index.ts` (create), `src/lib/server/db/index.ts` (replace), `src/lib/server/db/migrations/*` (generate)
      **What:** Replace the toy starter schema with the full relational model. Encode foreign keys, unique constraints, indexes, current revision pointer integrity, one planning profile per user, one cycle per user/week, contiguous revision support, one active lock per task, one active reminder per task/channel, and query indexes for task search, feed pagination, and planning lookups.
      **Verify:** `pnpm db:generate` and migration application succeed on a fresh database; schema inspection shows the required constraints.

- [ ] **Step 13: Implement repository contracts for every aggregate root and read model**
      **Files:** `src/lib/server/repositories/contracts/user-repository.ts` (create), `src/lib/server/repositories/contracts/session-repository.ts` (create), `src/lib/server/repositories/contracts/planning-profile-repository.ts` (create), `src/lib/server/repositories/contracts/aspect-repository.ts` (create), `src/lib/server/repositories/contracts/milestone-repository.ts` (create), `src/lib/server/repositories/contracts/task-repository.ts` (create), `src/lib/server/repositories/contracts/recurring-series-repository.ts` (create), `src/lib/server/repositories/contracts/availability-repository.ts` (create), `src/lib/server/repositories/contracts/planning-cycle-repository.ts` (create), `src/lib/server/repositories/contracts/reminder-repository.ts` (create), `src/lib/server/repositories/contracts/import-job-repository.ts` (create), `src/lib/server/repositories/contracts/audit-event-repository.ts` (create), `src/lib/server/repositories/contracts/idempotency-key-repository.ts` (create), `src/lib/server/repositories/contracts/system-job-run-repository.ts` (create), `src/lib/server/repositories/contracts/query-models.ts` (create)
      **What:** Define repository interfaces and query DTOs for both aggregate persistence and list/detail reads. Include methods needed for task list search, task detail projection, aspect list pagination, milestone list pagination, planning history, audit feed, and effective availability windows.
      **Verify:** `pnpm check` passes and service-layer stubs can compile against the contracts.

- [ ] **Step 14: Implement Postgres repository adapters for auth/profile/aspect/milestone roots**
      **Files:** `src/lib/server/repositories/postgres/user-repository.ts` (create), `src/lib/server/repositories/postgres/session-repository.ts` (create), `src/lib/server/repositories/postgres/planning-profile-repository.ts` (create), `src/lib/server/repositories/postgres/aspect-repository.ts` (create), `src/lib/server/repositories/postgres/milestone-repository.ts` (create)
      **What:** Implement aggregate persistence, optimistic concurrency, user scoping, cursor pagination where applicable, and helper queries for onboarding status and active aspect target totals. The aspect and milestone repositories must support archive and restore state changes and paged querying.
      **Verify:** Repository integration tests pass against a test database for create, update, stale write rejection, and paged queries.

- [ ] **Step 15: Implement Postgres repository adapters for tasks, recurrence, and reminders**
      **Files:** `src/lib/server/repositories/postgres/task-repository.ts` (create), `src/lib/server/repositories/postgres/recurring-series-repository.ts` (create), `src/lib/server/repositories/postgres/reminder-repository.ts` (create)
      **What:** Implement same-aspect milestone checks, task search/query defaults, detail projection loading, recurring series persistence with single active rule and exception history, reminder uniqueness per channel, reminder attempt history, and cancellation/update helpers used by task lifecycle flows.
      **Verify:** Integration tests cover task list sort/filter rules, detail reads, recurring series upsert semantics, and one-active-reminder-per-channel enforcement.

      **What:** Implement aggregate persistence, optimistic concurrency, user scoping, cursor pagination where applicable, and helper queries for onboarding status and active aspect target totals. The aspect and milestone repositories must support archive and restore state changes and paged querying.
      **Verify:** Repository integration tests pass against a test database for create, update, stale write rejection, and paged queries.

- [ ] **Step 16: Implement Postgres repository adapters for availability, planning, portability, audit, idempotency, and jobs**
      **Files:** `src/lib/server/repositories/postgres/availability-repository.ts` (create), `src/lib/server/repositories/postgres/planning-cycle-repository.ts` (create), `src/lib/server/repositories/postgres/import-job-repository.ts` (create), `src/lib/server/repositories/postgres/audit-event-repository.ts` (create), `src/lib/server/repositories/postgres/idempotency-key-repository.ts` (create), `src/lib/server/repositories/postgres/system-job-run-repository.ts` (create)
      **What:** Implement effective availability source persistence, cycle/revision/allocation persistence, current revision pointer updates, lock uniqueness, `ImportJob` state only, immutable audit storage, command idempotency lookups, and job-run dedupe. `DAT-01` has no persisted export-job record in v1. Keep revisions immutable and audit append-only.
      **Verify:** Integration tests prove one cycle per user/week, one active revision, lock uniqueness, import-job lifecycle behavior, idempotent replay behavior, and immutable audit appends.

- [ ] **Step 17: Implement command idempotency and job idempotency wrappers**
      **Files:** `src/lib/server/infra/idempotency/command-policy.ts` (create), `src/lib/server/infra/idempotency/job-policy.ts` (create), `src/lib/server/infra/idempotency/index.ts` (create)
      **What:** Build reusable wrappers that enforce required idempotency key semantics for all create/mutate commands and job-run key semantics for mutation-capable jobs. Exact behavior must match the sequence diagrams: same key + same hash replays prior result, same key + different hash raises mismatch.
      **Verify:** Unit and integration tests cover first execution, replay, hash mismatch, and job dedupe.

- [ ] **Step 18: Implement immutable audit emission infrastructure**
      **Files:** `src/lib/server/infra/audit/audit-diff.ts` (create), `src/lib/server/infra/audit/audit-emitter.ts` (create), `src/lib/server/infra/audit/ownership-stamped-audit.ts` (create), `src/lib/server/infra/audit/index.ts` (create)
      **What:** Build the shared audit emitter used by services and wrappers. It must produce exactly one immutable, redacted before/after event per successful write, support `UserSession` and `ServicePrincipal` actor types, and stamp affected user IDs for service-principal mutations.
      **Verify:** Tests prove audit events emit once per successful mutation, redact payloads, remain append-only, and support service-principal attribution.

- [ ] **Step 19: Implement the external identity provider gateway and session token handling**
      **Files:** `src/lib/server/services/internal/identity-provider-gateway.ts` (create), `src/lib/server/infra/auth/session-cookie.ts` (create), `src/lib/server/infra/providers/oidc-provider.ts` (create), `src/lib/server/infra/providers/dev-provider.ts` (create)
      **What:** Create a provider abstraction for auth initiation and callback claim resolution plus session cookie/signing helpers. Support a concrete OIDC-compatible provider adapter and a dev-friendly adapter so the application can be exercised locally without breaking the architecture boundary.
      **Verify:** Unit tests cover sign-in URL generation, callback claim mapping, and session cookie issuance/clear flows.

- [ ] **Step 19b: Implement reminder delivery provider adapters**
      **Files:** `src/lib/server/infra/providers/reminder-provider.ts` (create), `src/lib/server/infra/providers/in-app-reminder-provider.ts` (create), `src/lib/server/infra/providers/email-reminder-provider.ts` (create)
      **What:** Create the provider boundary used by reminder dispatch. Add concrete adapters for the required channels in v1, including in-app delivery and email delivery, with a stable success/failure result contract that `ReminderDispatchService` can consume.
      **Verify:** Provider tests cover success and failure mapping for each channel adapter.

- [ ] **Step 20: Implement `AuthService`, `ProfileService`, and account erasure orchestration**
      **Files:** `src/lib/server/services/auth-service.ts` (create), `src/lib/server/services/profile-service.ts` (create), `src/lib/server/services/internal/account-erasure-service.ts` (create)
      **What:** Implement `AUTH-01` through `AUTH-06` and `PRF-01`: sign-in start, callback bootstrap, logout, onboarding completion, session expiry compatibility, profile update, and full hard-delete cascade of user-owned data and operational records. The callback path must match-or-create a user, bootstrap the single planning profile, and issue a session. The erase path must explicitly delete reminders, attempts, planning data, locks, availability, aspects, recurrence, the planning profile, import jobs, idempotency records, audit timeline, sessions, and user.
      **Verify:** Service tests cover sign-in bootstrap, logout, profile optimistic concurrency, onboarding gate, and full-account-erasure side effects, including planning-profile removal.

- [ ] **Step 21: Implement `AspectService` and `MilestoneService`**
      **Files:** `src/lib/server/services/aspect-service.ts` (create), `src/lib/server/services/milestone-service.ts` (create), `src/lib/server/services/internal/aspect-target-validator.ts` (create)
      **What:** Implement `ASP-01` through `ASP-06` and `MLS-01` through `MLS-07`, including draft creation, activation, metadata update, archive/restore cascades, paged querying, milestone lifecycle transitions, and all cascade/reset semantics from the sequence diagrams. Keep target-total enforcement deferred to planning boundaries while still validating aspect-level inputs.
      **Verify:** Service tests cover activation rules, archive/restore side effects, milestone done gating, milestone archive/restore, and paged query behavior.

- [ ] **Step 22: Implement `TaskService` with lifecycle, search, detail, and bulk mutation behavior**
      **Files:** `src/lib/server/services/task-service.ts` (create), `src/lib/server/services/dto/task-dtos.ts` (create)
      **What:** Implement `TSK-01` through `TSK-11`, including create, update, move within same aspect, start, complete, reopen, archive, restore, partial-success bulk mutation, cursor-based query/search, and detail reads that include reminders, recurrence, and allocations. Respect same-aspect milestone rules, force completion semantics, default query filters, and canonical sort order.
      **Verify:** Service tests cover every transition, same-aspect move rules, future reminder/allocation cancellations, bulk per-item results, cursor validation, and detail hydration.

- [ ] **Step 23: Implement `RecurrenceService` and `RecurrenceMaterializer`**
      **Files:** `src/lib/server/services/recurrence-service.ts` (create), `src/lib/server/services/internal/recurrence-materializer.ts` (create)
      **What:** Implement `REC-01` through `REC-05`, including series upsert, first-instance materialization, pause/resume, skip/move exceptions, next-instance generation on completion, overdue suppression, timezone-aware local recurrence evaluation, monthly clamp behavior, and close-with-history-preserved semantics.
      **Verify:** Service tests cover immediate first materialization, pause/resume, skip vs move, overdue suppression, monthly edge dates, and close behavior.

- [ ] **Step 24: Implement `AvailabilityService` and `AvailabilityWindowResolver`**
      **Files:** `src/lib/server/services/availability-service.ts` (create), `src/lib/server/services/internal/availability-window-resolver.ts` (create)
      **What:** Implement `AVL-01` through `AVL-05`, covering one-off vs recurring creation, exception management, update/archive/restore, and effective availability read modeling with exception application and overlap merging. Preserve source blocks; derive effective windows at read time.
      **Verify:** Service tests cover invalid time shapes, exception application, overlap normalization, and archive/restore behavior.

- [ ] **Step 25: Implement `SchedulerEngine`**
      **Files:** `src/lib/server/services/internal/scheduler-engine.ts` (create), `src/lib/server/services/internal/scoring.ts` (create)
      **What:** Implement the deterministic heuristic weekly scheduler defined by the architecture. It must rank tasks using the planning profile, enforce constraint order (lock, due-feasibility, min chunk, capacity), respect aspect targets and splittable rules, preserve locked/past allocations where relevant, and return both placed and deferred work with stable tie-break behavior.
      **Verify:** Engine tests cover deterministic ranking, due-feasibility, min chunk behavior, splittable vs non-splittable tasks, deferred tasks, and lock preservation.

- [ ] **Step 26: Implement `PlanningService`**
      **Files:** `src/lib/server/services/planning-service.ts` (create)
      **What:** Implement `PLN-01`, `PLN-02`, `PLN-03`, `PLN-04`, `PLN-05`, and `PLN-06`: draft generation, confirmation, regeneration, allocation edit/lock/unlock/cancel, day-boundary replan, and cycle/revision query. Expose the documented service-level `replan_active_cycles(now)` behavior for `PLN-05`, including the no-material-change no-op branch, the safe-replan new-revision branch, and the lock-conflict branch. Enforce ISO week boundaries, exact 100 target-total gating at generation and confirmation, immutable revisions, superseding logic, current revision pointer updates, stale-write protection, and lock conflict detection.
      **Verify:** Service tests cover draft creation, confirm flow, regenerate preserving past/locked allocations, edit generating a new revision, `replan_active_cycles(now)` no-op behavior, safe day-boundary replan creating a new revision, lock conflicts, and planning history queries.

- [ ] **Step 27: Implement `ExecutionService`, `HealthComputationService`, and `ReminderService`**
      **Files:** `src/lib/server/services/execution-service.ts` (create), `src/lib/server/services/reminder-service.ts` (create), `src/lib/server/services/internal/health-computation-service.ts` (create), `src/lib/server/services/internal/reminder-dispatch-service.ts` (create)
      **What:** Implement `EXE-01`, `EXE-02`, `REM-01`, and `REM-02`: manual attended/missed outcome marking, aspect health computation from attended vs target minutes, reminder create/update, and reminder snooze behavior. Also implement delivery-state transitions, one-active-reminder-per-channel enforcement, exponential retries, daily retry window, terminal failure rules, and provider-bound dispatch behavior for later jobs.
      **Verify:** Service tests cover one outcome per allocation, health computation persistence format, reminder uniqueness, snooze limits, retry scheduling, terminal failure thresholds, and provider success/failure mapping.

- [ ] **Step 28: Implement `DataPortabilityService` and `AuditQueryService`**
      **Files:** `src/lib/server/services/data-portability-service.ts` (create), `src/lib/server/services/audit-query-service.ts` (create), `src/lib/server/services/internal/import-remap-service.ts` (create)
      **What:** Implement `DAT-01`, `DAT-02`, `AUD-02`, and supporting parts of `AUD-01`. `DAT-01` must remain synchronous inline export returning the full allowed live state as JSON while excluding sessions, idempotency keys, audit events, and operational job records. `DAT-02` must expose a validation-preview path before execution, then an async start-import flow that validates payload shape, creates an `ImportJob`, and delegates persistence/remapping to the worker job. Add status/result read methods so the UI can poll and resume import progress after reload. Import must reject forbidden entities, remap IDs and references, persist supported entities, and never recreate audit history.
      **Verify:** Service tests cover synchronous export inclusion/exclusion rules, import-preview validation, forbidden-entity preview, import-start job creation, import-status polling, collision remapping, and paged audit querying.

- [ ] **Step 29: Implement controller classes for every concern and map DTOs to services**
      **Files:** `src/lib/server/controllers/auth-controller.ts` (create), `src/lib/server/controllers/profile-controller.ts` (create), `src/lib/server/controllers/aspect-controller.ts` (create), `src/lib/server/controllers/milestone-controller.ts` (create), `src/lib/server/controllers/task-controller.ts` (create), `src/lib/server/controllers/recurrence-controller.ts` (create), `src/lib/server/controllers/availability-controller.ts` (create), `src/lib/server/controllers/planning-controller.ts` (create), `src/lib/server/controllers/execution-controller.ts` (create), `src/lib/server/controllers/reminder-controller.ts` (create), `src/lib/server/controllers/data-portability-controller.ts` (create), `src/lib/server/controllers/audit-controller.ts` (create), `src/lib/server/controllers/index.ts` (modify)
      **What:** Add thin controllers that map transport DTOs to service calls and preserve principal, idempotency, cursor, and version inputs. One method per documented interaction; no business logic.
      **Verify:** Controller unit tests prove request DTOs map correctly and all controllers compile against the service contracts.

- [ ] **Step 30: Implement the `AppFactory` composition root and request-scoped resolution helpers**
      **Files:** `src/lib/server/factory/app-factory.ts` (modify), `src/lib/server/factory/request-scope.ts` (create), `src/lib/server/factory/index.ts` (create)
      **What:** Wire repositories, private services, public services, controllers, and shared infra in a single composition root. Support request-scoped principal injection and worker-scoped `ServicePrincipal` resolution. This is the only place where concrete adapters should be instantiated, including the identity provider and reminder delivery providers.
      **Verify:** Factory tests or a boot smoke test resolve every controller/service without circular dependencies.

- [ ] **Step 31: Implement auth and onboarding route groups**
      **Files:** `src/routes/(auth)/login/+server.ts` (create), `src/routes/(auth)/login/+page.svelte` (create), `src/routes/(auth)/callback/+server.ts` (create), `src/routes/(auth)/callback/+page.svelte` (create), `src/routes/(onboarding)/+page.server.ts` (create), `src/routes/(onboarding)/+page.svelte` (create)
      **What:** Add the auth entry and callback routes plus the exact four-step onboarding wizard: welcome, define aspects, set target percentages, set availability basics. Enforce the step contracts from the UI docs: no app shell, no global nav, progress bar at top, back button on steps 2-4, `sessionStorage` persistence on refresh, 1-8 aspect limit, live target-total indicator that must equal exactly 100, optional availability skip path, and a single glass step card over the gradient background. Use the controllers via the factory, gate the next buttons by validation, and redirect completion to `/(app)` only when the documented constraints are satisfied.
      **Verify:** Component/server tests cover login initiation, callback redirect behavior, refresh persistence, max-aspect limit, invalid target-total blocking, availability skip path, back-button behavior, and completion redirect.

- [ ] **Step 32: Implement the design token layer and global styles**
      **Files:** `src/routes/layout.css` (replace), `src/lib/styles/tokens.css` (create), `src/lib/styles/base.css` (create), `src/lib/styles/motion.css` (create)
      **What:** Replace the starter CSS import with the full design token system from `DESIGN_SYSTEM.md`: light/dark CSS variables, typography ladder, spacing, radii, elevation, motion, focus rings, reduced-motion support, and glass fallback behavior. Keep colors token-driven and respect the Swiss-first visual system.
      **Verify:** Visual smoke test in the browser shows tokens applied, dark mode follows OS preference, and reduced-motion/glass fallback CSS is present.

- [ ] **Step 33: Implement primitive UI wrappers and overlay infrastructure**
      **Files:** `src/lib/components/primitives/Button.svelte` (create), `src/lib/components/primitives/Card.svelte` (create), `src/lib/components/primitives/Input.svelte` (create), `src/lib/components/primitives/Badge.svelte` (create), `src/lib/components/primitives/Text.svelte` (create), `src/lib/components/primitives/Stack.svelte` (create), `src/lib/components/primitives/GlassCard.svelte` (create), `src/lib/components/primitives/Panel.svelte` (create), `src/lib/components/overlays/Modal.svelte` (create), `src/lib/components/overlays/Drawer.svelte` (create), `src/lib/components/overlays/ConfirmDialog.svelte` (create), `src/lib/components/overlays/ToastStack.svelte` (create), `src/lib/components/overlays/CommandPalette.svelte` (create)
      **What:** Build the token-aware primitives and shared overlays required by every feature. Enforce the hard rules from `DESIGN_SYSTEM.md`: no raw buttons or inputs, no ad hoc spacing, forms always opaque, and glass only in allowed zones.
      **Verify:** Component tests prove basic rendering, disabled/focus states, keyboard interaction for overlays, and token-class usage.

- [ ] **Step 34: Implement layout shells and route-group layouts**
      **Files:** `src/lib/components/layout/AppShell.svelte` (create), `src/lib/components/layout/WizardLayout.svelte` (create), `src/lib/components/layout/TimelineLayout.svelte` (create), `src/lib/components/layout/MasterDetailLayout.svelte` (create), `src/lib/components/layout/DashboardGrid.svelte` (create), `src/lib/components/layout/PageHeader.svelte` (create), `src/lib/components/layout/EmptyState.svelte` (create), `src/lib/components/layout/Skeleton.svelte` (create), `src/routes/(app)/+layout.server.ts` (create), `src/routes/(app)/+layout.svelte` (create)
      **What:** Build the responsive shell and structural components described in the UI docs: desktop sidebar, sticky top bar, mobile bottom nav, global week selector, contextual empty states, skeletons, and the required page-layout patterns. Integrate the command-palette trigger into the top bar and shell, wire `Cmd+K` / `Ctrl+K`, include a mobile fallback trigger, and support quick task search, aspect jump, and route navigation from the palette.
      **Verify:** Component tests and browser verification confirm desktop/mobile layouts, bottom nav behavior, independent content scrolling, command-palette keyboard shortcut behavior, focus trapping, and mobile trigger availability.

- [ ] **Step 35: Implement dashboard UI and data loading**
      **Files:** `src/lib/components/domain/dashboard/KpiCard.svelte` (create), `src/lib/components/domain/dashboard/AspectBalanceChart.svelte` (create), `src/lib/components/domain/dashboard/TodaySchedule.svelte` (create), `src/lib/components/domain/dashboard/UpcomingTasks.svelte` (create), `src/routes/(app)/+page.server.ts` (create), `src/routes/(app)/+page.svelte` (create)
      **What:** Implement the weekly dashboard route with KPI cards, aspect health visualization, today's schedule, upcoming tasks, skeletons, empty states, and deep links to tasks and plan. Keep the page above the fold and use glass only for the KPI zone.
      **Verify:** Route/component tests cover empty/new-user state, loaded state, and links to detailed views.

- [ ] **Step 36: Implement aspects overview, aspect detail tabs, and aspect create/edit overlay**
      **Files:** `src/lib/components/domain/aspects/AspectCard.svelte` (create), `src/lib/components/domain/aspects/AspectEditor.svelte` (create), `src/lib/components/domain/aspects/AspectOverviewTab.svelte` (create), `src/lib/components/domain/aspects/MilestoneList.svelte` (create), `src/lib/components/domain/aspects/AspectTasksTab.svelte` (create), `src/routes/(app)/aspects/+page.server.ts` (create), `src/routes/(app)/aspects/+page.svelte` (create), `src/routes/(app)/aspects/[id]/+page.server.ts` (create), `src/routes/(app)/aspects/[id]/+page.svelte` (create)
      **What:** Implement the aspects card grid, the URL-synced three-tab aspect detail screen, and the create/edit progressive-disclosure modal or drawer. Preserve scroll and unsaved state when switching tabs and expose target-total warnings without blocking non-planning edits.
      **Verify:** Route/component tests cover aspect list pagination, tab deep-linking, create/edit validation, and restore/archive affordances.

- [ ] **Step 37: Implement tasks master-detail UI, task detail sections, and task creation overlay**
      **Files:** `src/lib/components/domain/tasks/TaskList.svelte` (create), `src/lib/components/domain/tasks/TaskListItem.svelte` (create), `src/lib/components/domain/tasks/TaskDetail.svelte` (create), `src/lib/components/domain/tasks/EffortBar.svelte` (create), `src/lib/components/domain/tasks/TaskEditor.svelte` (create), `src/lib/components/domain/tasks/BulkActionToolbar.svelte` (create), `src/routes/(app)/tasks/+page.server.ts` (create), `src/routes/(app)/tasks/+page.svelte` (create), `src/routes/(app)/tasks/[id]/+page.server.ts` (create), `src/routes/(app)/tasks/[id]/+page.svelte` (create)
      **What:** Implement the searchable, filterable, cursor-paginated master-detail task experience with independent scrolling, URL-based selected task, mobile drill-down fallback, bulk actions, inline editing, and progressive-disclosure create flow. The mobile route must render a detail-only page with back navigation to the list, selected-task hydration from the server, and parity with the desktop detail content.
      **Verify:** Route/component tests cover default filters, search, cursor pagination, selected-task deep linking, desktop master-detail rendering, mobile drill-down rendering, back navigation, and bulk action visibility.

- [ ] **Step 38: Implement recurrence and reminder UI sections inside task detail**
      **Files:** `src/lib/components/domain/tasks/RecurrenceSection.svelte` (create), `src/lib/components/domain/tasks/ReminderSection.svelte` (create)
      **What:** Add the collapsible recurrence and reminder sections to task detail, including series state, exception management UI, channel uniqueness feedback, snooze controls, and delivery state display. Keep progressive disclosure without hiding primary task actions.
      **Verify:** Component tests cover expand/collapse behavior, validation messages, and duplicate-channel prevention messaging.

- [ ] **Step 39: Implement weekly plan timeline UI, allocation popover, and revision history feed**
      **Files:** `src/lib/components/domain/plan/PlanHeader.svelte` (create), `src/lib/components/domain/plan/TimelineGrid.svelte` (create), `src/lib/components/domain/plan/AvailabilityLane.svelte` (create), `src/lib/components/domain/plan/AllocationBlock.svelte` (create), `src/lib/components/domain/plan/AllocationPopover.svelte` (create), `src/lib/components/domain/plan/RevisionFeedItem.svelte` (create), `src/routes/(app)/plan/+page.server.ts` (create), `src/routes/(app)/plan/+page.svelte` (create), `src/routes/(app)/plan/history/+page.server.ts` (create), `src/routes/(app)/plan/history/+page.svelte` (create)
      **What:** Implement the weekly timeline route with day/week views, horizontal scroll, hour gutter, availability background lanes, allocation blocks with minimum 44px height, now indicator, summary bar, generate/confirm/regenerate actions, and allocation popover actions. Also implement the plan revision feed with load-more pagination, collapsed-by-default diff summaries, expandable detail, and snapshot-based scroll restoration after navigation.
      **Verify:** Route/component tests cover empty state, loaded timeline, lock indicators, outcome badges, generate/confirm buttons, collapsed/expanded revision diffs, and revision feed scroll restoration.

- [ ] **Step 40: Implement availability settings UI and block editor drawer**
      **Files:** `src/lib/components/domain/availability/AvailabilityGrid.svelte` (create), `src/lib/components/domain/availability/AvailabilityBlockList.svelte` (create), `src/lib/components/domain/availability/AvailabilityEditor.svelte` (create), `src/routes/(app)/settings/availability/+page.server.ts` (create), `src/routes/(app)/settings/availability/+page.svelte` (create)
      **What:** Implement the weekly availability manager with timeline + list layout, one-off/recurring block creation, exception editing, archive/restore actions, and the progressive-disclosure drawer.
      **Verify:** Route/component tests cover one-off vs recurring forms, exception UI, and loaded grid/list display.

- [ ] **Step 41: Implement settings hub, planning profile, account, data portability, and audit routes**
      **Files:** `src/lib/components/domain/settings/SettingsCardGrid.svelte` (create), `src/lib/components/domain/settings/ProfileSliders.svelte` (create), `src/lib/components/domain/settings/AccountForm.svelte` (create), `src/lib/components/domain/settings/DataPortabilityPanel.svelte` (create), `src/lib/components/domain/settings/AuditFeedItem.svelte` (create), `src/routes/(app)/settings/+page.svelte` (create), `src/routes/(app)/settings/profile/+page.server.ts` (create), `src/routes/(app)/settings/profile/+page.svelte` (create), `src/routes/(app)/settings/account/+page.server.ts` (create), `src/routes/(app)/settings/account/+page.svelte` (create), `src/routes/(app)/settings/data/+page.server.ts` (create), `src/routes/(app)/settings/data/+page.svelte` (create), `src/routes/(app)/settings/audit/+page.server.ts` (create), `src/routes/(app)/settings/audit/+page.svelte` (create)
      **What:** Implement the hub-and-spoke settings flow, profile slider form with advanced fields, account form and logout/delete controls, synchronous export UI, import validation-preview UX followed by async import UI with running/succeeded/failed polling and resume-after-reload behavior, and the read-only audit feed with load-more pagination, collapsed-by-default redacted diffs, snapshot-based scroll restoration, and virtualization for large feeds. The import screen must let the user preview validation errors and forbidden entities before confirming execution.
      **Verify:** Route/component tests cover settings navigation, profile dirty/save behavior, delete confirmation flow, export download behavior, import preview validation, import confirmation, import job polling and reload resume, audit feed pagination, diff expand/collapse, virtualization, and scroll restoration.

- [ ] **Step 42: Implement route handlers and server actions for every interaction**
      **Files:** `src/routes/(app)/api/auth/*` (create as needed), `src/routes/(app)/api/aspects/*` (create as needed), `src/routes/(app)/api/milestones/*` (create as needed), `src/routes/(app)/api/tasks/*` (create as needed), `src/routes/(app)/api/recurrence/*` (create as needed), `src/routes/(app)/api/availability/*` (create as needed), `src/routes/(app)/api/planning/*` (create as needed), `src/routes/(app)/api/execution/*` (create as needed), `src/routes/(app)/api/reminders/*` (create as needed), `src/routes/(app)/api/data/*` (create as needed), `src/routes/(app)/api/audit/*` (create as needed)
      **What:** Add the HTTP endpoints and form actions backing every documented interaction ID. Each endpoint should resolve the request-scoped controller from the factory, apply auth/idempotency/cursor/version requirements, and return stable DTOs to the UI. `DAT-01` must be a synchronous export response. `DAT-02` must expose explicit import-preview, import-start, and import-status/result endpoints so the UI can preview validation, confirm execution, poll progress, and recover state after reload.
      **Verify:** Endpoint tests cover success and documented failure paths for at least one interaction in every concern area, including synchronous export download, import preview validation, and async import status polling.

- [ ] **Step 43: Implement worker jobs and workflow registration**
      **Files:** `src/lib/server/jobs/session-expiry-job.ts` (create), `src/lib/server/jobs/day-boundary-replan-job.ts` (create), `src/lib/server/jobs/health-job.ts` (create), `src/lib/server/jobs/reminder-dispatch-job.ts` (create), `src/lib/server/jobs/reminder-retry-job.ts` (create), `src/lib/server/jobs/task-completion-hook.ts` (create), `src/lib/server/jobs/import-user-data-job.ts` (create), `src/lib/server/jobs/worker.ts` (create)
      **What:** Implement the asynchronous flows from the sequence diagrams: session expiry, day-boundary replan, health recomputation, reminder dispatch, reminder retry, task-completion-triggered recurrence generation, and async user-data import execution. Wrap mutation-capable jobs in the job idempotency policy and stamp `ServicePrincipal` audit metadata. The import job must update `ImportJob` through `Running`, `Succeeded`, and `Failed` states with a result report the UI can consume.
      **Verify:** Job tests prove state transitions, idempotent replay behavior, import-job lifecycle behavior, and correct repository/service wiring.

- [ ] **Step 44: Add server-side integration tests for repositories and services**
      **Files:** `tests/server/repositories/*.test.ts` (create), `tests/server/services/*.test.ts` (create), `vitest.config.ts` (modify if needed)
      **What:** Add broad integration coverage for repository constraints and service behavior. Cover optimistic concurrency, one-profile-per-user, one-cycle-per-week, one-active-lock, one-active-reminder-per-channel, target-total enforcement, recurrence generation, reminder retry policy, synchronous export rules, async import rules, audit emission, and idempotency. Include an explicit failure-matrix suite keyed to the documented alt paths and failure mapping: cursor mismatch, stale writes, ownership violations, lock conflicts, target-total rejection, reminder retry exhaustion, import remap failure, invalid transitions, recurrence suppression, and no-op day-boundary replan.
      **Verify:** `pnpm test` passes with the new integration suites and a report or checklist shows every documented error code has at least one representative test at the documented layer.

- [ ] **Step 45: Add component and route tests for the full UI surface**
      **Files:** `src/routes/(auth)/**/*.spec.ts` (create), `src/routes/(onboarding)/**/*.spec.ts` (create), `src/routes/(app)/**/*.spec.ts` (create), `src/lib/components/**/*.spec.ts` (create), `src/routes/page.svelte.spec.ts` (remove or replace), `src/demo.spec.ts` (remove or replace)
      **What:** Replace the placeholder tests with meaningful component and route tests for auth, onboarding, dashboard, aspects, tasks, plan, availability, settings, data portability, and audit. Include deep-linking, empty states, skeletons, validation gating, and keyboard interaction for overlays.
      **Verify:** `pnpm test` passes and no placeholder scaffold tests remain.

- [ ] **Step 46: Add end-to-end tests for the critical product journeys**
      **Files:** `tests/e2e/auth-onboarding.spec.ts` (create), `tests/e2e/aspects-tasks-planning.spec.ts` (create), `tests/e2e/availability-reminders.spec.ts` (create), `tests/e2e/data-audit.spec.ts` (create), `playwright.config.ts` (create or modify)
      **What:** Add browser-level E2E coverage for sign in, callback, onboarding, aspect creation, target balancing, availability setup, task creation, plan generation and confirmation, allocation outcome marking, reminder setup/snooze, synchronous export download, async import start and progress recovery, audit viewing, and representative failure-path UX for stale writes, invalid totals, and reminder retry exhaustion visibility.
      **Verify:** The E2E suite runs locally and passes against a seeded local environment, including import job polling/resume and mobile task drill-down coverage.

- [ ] **Step 47: Seed local demo data and add developer diagnostics**
      **Files:** `scripts/seed.ts` (create), `src/lib/server/db/seeds/*` (create), `README.md` (modify)
      **What:** Add a deterministic local seed script that creates a realistic user, aspects, milestones, tasks, recurring series, availability, planning cycles, reminders, and audit events so the full app can be exercised. Document how to run the seeded environment.
      **Verify:** Running the seed script on a fresh local database produces data that renders across the major routes.

- [ ] **Step 48: Final hardening, accessibility, and release verification**
      **Files:** `README.md` (modify), `package.json` (modify if final scripts are needed), `src/routes/+layout.svelte` (modify if final providers are required), `src/routes/+error.svelte` (create)
      **What:** Finish the release path: top-level app providers, global error boundary, final build/test scripts, accessibility polish, reduced-motion validation, glass fallback validation, and documentation for running app + worker + database locally and in production-like mode.
      **Verify:** `pnpm check`, `pnpm test`, `pnpm build`, and the E2E suite all pass; manual verification confirms desktop/mobile layouts, keyboard navigation, focus rings, and critical route flows.

## Tests

- Domain/value-object tests must cover all construction-time validation and enum/state constraints.
- Repository integration tests must cover ownership scoping, unique constraints, optimistic concurrency, cursor pagination, and append-only/immutable records.
- Service tests must cover every interaction family: `AUTH`, `PRF`, `ASP`, `MLS`, `TSK`, `REC`, `AVL`, `PLN`, `EXE`, `REM`, `DAT`, `AUD`, `SYS`.
- Failure-matrix tests must cover the alt paths and non-raising branches from the sequence diagrams and `architecture/software-architecture/10-sequence-failure-mapping.md`, including recurrence suppression and no-op day-boundary replan.
- UI component tests must cover empty, loading, loaded, validation-error, and responsive states for each route family.
- E2E tests must cover sign in -> onboarding -> aspects -> tasks -> availability -> planning -> execution -> reminders -> synchronous export -> async import -> audit.
- Required commands at steady state: `pnpm check`, `pnpm test`, `pnpm build`, and the E2E command configured in `package.json` or Playwright config.

## Verification

- Local stack boots with Postgres, app server, and worker runtime using the documented env vars.
- A fresh user can sign in, complete the four-step onboarding wizard, and land on the dashboard.
- The user can create and edit aspects, milestones, tasks, recurring series, reminders, and availability blocks.
- The planner can generate, confirm, regenerate, and edit weekly plans while preserving locks and revision history.
- The user can mark allocation outcomes, see aspect health, export data, import data with remapped IDs, and browse the audit feed.
- Session expiry, reminder dispatch/retry, day-boundary replan, recurrence completion hook, and health jobs run successfully through the worker.
- All documented views in `architecture/ui_ux/ui-screen-inventory.md` render and all major invariants in `architecture/domain/invariants.md` are enforced by code and tests.
