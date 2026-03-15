# Blueprint: Margin End-to-End Implementation

## Executor Instructions

You are executing this blueprint. Follow these rules on every loop.

1. Read this file first. After context compaction, this file is your ground truth.
2. Before Step 1, read this mandatory reference packet in full and treat it as binding:
   - `architecture/software-architecture/index.md`
   - `architecture/software-architecture/01-overview-and-cross-cutting.md`
   - `architecture/software-architecture/02-aggregates-and-models.md`
   - `architecture/software-architecture/03-services.md`
   - `architecture/software-architecture/04-controllers-and-jobs.md`
   - `architecture/software-architecture/05-repositories.md`
   - `architecture/software-architecture/06-invariants-and-errors.md`
   - `architecture/software-architecture/07-wiring-and-config.md`
   - `architecture/software-architecture/08-invariant-enforcement-matrix.md`
   - `architecture/software-architecture/09-interaction-traceability.md`
   - `architecture/software-architecture/10-sequence-failure-mapping.md`
   - `architecture/software-architecture/11-aggregate-boundary-audit.md`
   - `architecture/software-architecture/12-mechanical-audit.md`
   - `architecture/software-architecture/13-infrastructure-considerations.md`
   - `architecture/ui_ux/ui-screen-inventory.md`
   - `architecture/ui_ux/ui-ux-patterns.md`
   - `architecture/ui_ux/ui-wireframes.md`
   - `DESIGN_SYSTEM.md`
   - `.claude/skills/qa/references/testing-patterns.md`
   - `.claude/skills/qa/references/validation.md`
3. Before each step, reread the specific references listed in that step. Do not rely on memory for names, states, routes, DTOs, or visual behavior.
4. Do the next unchecked step only. If a later step depends on information missing from the current step, update the relevant ledger file in this blueprint first, then continue.
5. Maintain these living reference files from Step 1 onward and update them whenever a later discovery matters:
   - `docs/execution/reference-ledger.md`
   - `docs/execution/invariant-coverage.md`
   - `docs/execution/interaction-route-map.md`
   - `docs/execution/transport-contracts.md`
   - `docs/execution/ui-acceptance-map.md`
   - `docs/execution/architecture-compliance.md`
6. No invention is allowed. Method names, aggregate boundaries, route groups, job entry points, UI patterns, and transport DTOs must come from the reference packet, the binding supplements in this blueprint, or the Step 1 ledgers copied from them.
7. Source precedence is fixed:
   - architecture docs override the starter scaffold.
   - `architecture/software-architecture/13-infrastructure-considerations.md` overrides older UI wording for data portability: `DAT-01` is synchronous inline export in v1, `DAT-02` is async import with job status polling.
   - `architecture/ui_ux/ui-ux-patterns.md` overrides the generic glass allowance for confirmation dialogs: modal backdrops may be frosted, but destructive confirmation dialog content must remain opaque.
8. Step 2 is the TDD setup step. After Step 2, every implementation step follows red -> green -> refactor: extend or unskip the failing tests for the cited invariants/interactions first, then implement until they pass, then clean up without changing behavior.
9. QA rules are mandatory for all tests:
   - no mocking libraries
   - one assertion per test
   - behavior and invariants over implementation details
   - shared fakes in `tests/fakes/` or `src/lib/__tests__/fakes/`
   - test names must describe the invariant or behavior being checked
10. Every behavior-changing step must update `docs/execution/invariant-coverage.md` with one of: `Covered`, `Partial`, `Implicit`, `Missing implementation`, `Missing test`, `False confidence`.
11. Every UI step must update `docs/execution/ui-acceptance-map.md` with route, screen, pattern, responsive behavior, empty/loading states, keyboard behavior, and verification status.
12. Every interaction/API step must update both `docs/execution/interaction-route-map.md` and `docs/execution/transport-contracts.md` with controller method, service method, page-loader shape, action or endpoint shape, request DTO fields, response DTO fields, cursor payload shape, idempotency rule, version inputs, and documented failure mapping.
13. Do not write page-level UI, `+page.server.ts`, form actions, or endpoint handlers until the relevant transport contract row exists in `docs/execution/transport-contracts.md`.
14. Verify before checking off. If verification passes, change `- [ ]` to `- [x]` and commit with `git add -A && git commit -m "blueprint: [step title]"`.
15. If blocked, add a note under the step with the blocker, the exact references reviewed, the failed verification, and the smallest plan update needed for later steps.

## Context

Margin is a full planning product with validated domain diagrams, sequence diagrams, invariant sets, and UI/UX specifications. The implementation must reproduce those artifacts faithfully, not approximate them. The architecture translation in `architecture/software-architecture/` fixes the aggregate boundaries, dependency graph, controller/service/repository surface, failure ownership, wiring, and infrastructure topology. The UI docs in `architecture/ui_ux/` plus `DESIGN_SYSTEM.md` fix the route groups, screen inventory, interaction patterns, responsive behavior, visual rules, accessibility constraints, and shared component conventions.

The current repository is still a starter scaffold: `src/routes/+page.svelte` is the default SvelteKit page, `src/routes/+layout.svelte` only imports global CSS, `src/lib/server/db/schema.ts` is a toy SQLite table, and `package.json` still reflects a starter runtime. This blueprint therefore starts by deriving exact implementation ledgers from the architecture packet, then creates tests immediately so the executor is forced to implement against the spec rather than hallucinating interfaces.

## Scope

**In scope:**

- Replace the starter runtime and data model with the architecture-aligned baseline.
- Implement every documented aggregate, value object, invariant, interaction, service, controller, repository, job, route group, screen, and cross-cutting policy.
- Implement the full UI surface defined by the screen inventory, UX patterns, wireframes, and design system.
- Implement automated tests that prove invariant coverage, architecture compliance, UI acceptance criteria, and end-to-end journey correctness.

**Out of scope:**

- Features not present in the architecture or UI docs.
- Infrastructure ruled out by `architecture/software-architecture/13-infrastructure-considerations.md`, including Redis, MinIO, and pgvector.
- Inventing alternate aggregate boundaries, extra lifecycle states, extra route groups, or extra background systems.

## Architecture Decisions

- Aggregate boundaries are fixed by `architecture/software-architecture/11-aggregate-boundary-audit.md`. `Aspect`, `Milestone`, `Task`, `Reminder`, and `PlanningCycle` are not to be merged just because they are ownership-related.
- Public service names, controller method names, repository method names, and job entry points are fixed by `architecture/software-architecture/03-services.md`, `architecture/software-architecture/04-controllers-and-jobs.md`, and `architecture/software-architecture/05-repositories.md`.
- Every behavioral rule must trace back to `architecture/software-architecture/08-invariant-enforcement-matrix.md`, `architecture/software-architecture/09-interaction-traceability.md`, and `architecture/software-architecture/10-sequence-failure-mapping.md`.
- Postgres is the single source of truth. Hatchet is the only background execution mechanism. Export is synchronous in v1. Import is async with job status persistence. See `architecture/software-architecture/13-infrastructure-considerations.md`.
- UI structure is fixed by route groups and screen contracts in `architecture/ui_ux/ui-screen-inventory.md`; interaction patterns are fixed by `architecture/ui_ux/ui-ux-patterns.md`; layout geometry and responsive behavior are fixed by `architecture/ui_ux/ui-wireframes.md`; visual tokens and component rules are fixed by `DESIGN_SYSTEM.md`.
- Tests are specification work, not cleanup work. The executor must use the QA pattern documents as hard rules and must keep the invariant coverage ledger current.

## Canonical Surface

These are the non-negotiable implementation surfaces to reproduce.

- Aggregate roots and contained children:
  - `User`
  - `PlanningProfile`
  - `Session`
  - `Aspect`
  - `Milestone`
  - `Task` + `TaskLock`
  - `RecurringTaskSeries` + `RecurrenceRule` + `RecurrenceException`
  - `AvailabilityBlock` + `AvailabilityException`
  - `PlanningCycle` + `PlanningRevision` + `TaskAllocation` + `AllocationOutcome` + `AspectCycleHealth`
  - `Reminder` + `ReminderAttempt`
  - `ImportJob`
  - `AuditEvent`
  - `IdempotencyKey`
  - `SystemJobRun`
- Public services to reproduce exactly: `IAuthService`, `IProfileService`, `IAspectService`, `IMilestoneService`, `ITaskService`, `IRecurrenceService`, `IAvailabilityService`, `IPlanningService`, `IExecutionService`, `IReminderService`, `IDataPortabilityService`, `IAuditQueryService`.
- Private services to reproduce exactly: `IIdentityProviderGateway`, `IRecurrenceMaterializer`, `ISchedulerEngine`, `IAvailabilityWindowResolver`, `IAspectTargetValidator`, `IHealthComputationService`, `IReminderDispatchService`, `IAccountErasureService`, `IImportRemapService`.
- Controllers to reproduce exactly: `AuthController`, `ProfileController`, `AspectController`, `MilestoneController`, `TaskController`, `RecurrenceController`, `AvailabilityController`, `PlanningController`, `ExecutionController`, `ReminderController`, `DataPortabilityController`, `AuditController`.
- Jobs to reproduce exactly: `SessionExpiryJob`, `DayBoundaryReplanJob`, `HealthJob`, `ReminderDispatchJob`, `ReminderRetryJob`, `TaskCompletionHook`, `JobIdempotencyWrapper`, plus the concrete import workflow worker entry point.
- Route groups to reproduce exactly: `/(auth)`, `/(onboarding)`, `/(app)`, and the settings spokes under `/(app)/settings/*`.

## Binding Supplements

These supplements close the remaining ambiguities in the architecture packet. They are planner-authored binding decisions for the executor, not optional design work.

- **Transport decomposition for `DAT-02`:**
  - Keep `DataPortabilityController.export_json` for `DAT-01`.
  - Decompose `DAT-02` transport into three explicit surfaces:
    - `POST /(app)/api/data/import/preview`
    - `POST /(app)/api/data/import/start`
    - `GET /(app)/api/data/import/[jobId]`
  - Preserve the architecture intent by treating preview/start as two transport variants of the single import use case. The controller layer may therefore expose `preview_import_json`, `start_import_json`, and `get_import_status` as planner-specified transport adapters backed by the same `IDataPortabilityService` concern. Do not invent any additional import endpoints.
  - Hatchet enqueueing belongs in infra/job wiring, never in page components, route files, or domain services.
- **Account settings scope resolution:**
  - `/(app)/settings/account` is not an editable profile screen.
  - It shows account identity summary data read-only plus `logout` and `delete account` actions.
  - Editable planning preferences live only in `/(app)/settings/profile`.
  - Do not invent account-update writes unless the architecture packet is amended with new interactions.
- **Page-loader and query DTO naming:** use these exact route-level DTO names in `docs/execution/transport-contracts.md` and code:
  - `DashboardPageData`
  - `AspectsPageData`
  - `AspectDetailPageData`
  - `TasksPageData`
  - `TaskDetailPageData`
  - `PlanPageData`
  - `PlanHistoryPageData`
  - `AvailabilitySettingsPageData`
  - `ProfileSettingsPageData`
  - `AccountSettingsPageData`
  - `DataSettingsPageData`
  - `AuditSettingsPageData`
- **List/query envelope rules:**
  - cursor-paginated list/query DTOs use the envelope `{ items, nextCursor }`
  - detail/page DTOs use explicit named properties, not anonymous nested blobs
  - query DTOs always separate `filters`, `sort`, and `cursor` fields when more than one concern is present
  - status/result polling DTOs for `DAT-02` use `{ jobId, status, summary, errors }`
- **Dashboard projection minimum fields:** `DashboardPageData` must contain KPI summary, aspect health summary, today's schedule blocks, and upcoming task summaries.
- **Aspect list/detail minimum fields:**
  - `AspectsPageData` contains paginated aspect summaries and create affordance state.
  - `AspectDetailPageData` contains `aspect`, `overview`, `milestones`, `tasks`, and `activeTab`.
- **Task list/detail minimum fields:**
  - `TasksPageData` contains list items, current filters, selected task id, and next cursor.
  - `TaskDetailPageData` contains core task fields, milestone summary, recurrence section data, reminder section data, and allocation summary.
- **Planning page minimum fields:**
  - `PlanPageData` contains cycle summary, current revision summary, availability lanes, allocation blocks, and generate/confirm/regenerate affordance state.
  - `PlanHistoryPageData` contains revision/history items in `{ items, nextCursor }` form.
- **Settings page minimum fields:**
  - `AvailabilitySettingsPageData` contains effective windows plus source blocks and exceptions.
  - `ProfileSettingsPageData` contains planning profile values and dirty-state baseline.
  - `AccountSettingsPageData` contains read-only identity/account summary plus destructive-action affordances.
  - `DataSettingsPageData` contains export availability plus import preview/start/status state.
  - `AuditSettingsPageData` contains audit feed items in `{ items, nextCursor }` form.

## Plan

- [x] **Step 1: Create the fidelity ledgers, package skeleton, and exact contracts**
      **Refs:** `architecture/software-architecture/index.md`, `architecture/software-architecture/02-aggregates-and-models.md`, `architecture/software-architecture/03-services.md`, `architecture/software-architecture/04-controllers-and-jobs.md`, `architecture/software-architecture/05-repositories.md`, `architecture/software-architecture/11-aggregate-boundary-audit.md`, `architecture/software-architecture/13-infrastructure-considerations.md`, `architecture/ui_ux/ui-screen-inventory.md`
      **Files:** `docs/execution/reference-ledger.md` (create), `docs/execution/invariant-coverage.md` (create), `docs/execution/interaction-route-map.md` (create), `docs/execution/transport-contracts.md` (create), `docs/execution/ui-acceptance-map.md` (create), `docs/execution/architecture-compliance.md` (create), `src/lib/server/domain/README.md` (create), `src/lib/server/errors/index.ts` (create), `src/lib/server/repositories/contracts/` (create package and contract files), `src/lib/server/services/contracts/` (create package and contract files), `src/lib/server/controllers/index.ts` (create), `src/lib/server/jobs/index.ts` (create), `src/lib/server/factory/app-factory.ts` (create stub), `src/lib/server/infra/index.ts` (create)
      **What:** Derive exact ledgers from the reference packet and the `Binding Supplements` section above before any implementation work. The ledgers must record aggregate boundaries, service/controller/repository method names, interaction IDs, job entry points, route groups, screen contracts, and known source-precedence resolutions. `docs/execution/transport-contracts.md` must copy the canonical request DTO fields, response DTO fields, page-loader outputs, cursor payload shapes, query DTO fields, and action or endpoint shapes for every interaction using the supplement decisions above. Do not redesign open transport surfaces during execution; if a source doc is silent, the supplement in this blueprint is the answer. Reconcile the `DAT-02` async API shape and fix the Hatchet enqueue boundary here: controllers stay transport-only, services own business orchestration, and any Hatchet client or workflow dispatcher adapter stays in infra/job wiring rather than leaking into controllers or domain services. Create the server package skeleton and contract files only; do not add concrete logic yet.
      **Verify:** `pnpm check` passes, every interaction in `architecture/software-architecture/09-interaction-traceability.md` appears in `docs/execution/interaction-route-map.md`, every aggregate in `architecture/software-architecture/11-aggregate-boundary-audit.md` appears in `docs/execution/reference-ledger.md`, every UI screen in `architecture/ui_ux/ui-screen-inventory.md` appears in `docs/execution/ui-acceptance-map.md`, and every interactive route or endpoint has a corresponding transport row in `docs/execution/transport-contracts.md`.

- [x] **Step 2: Create the QA harness, shared fakes, and failing specification tests**
      **Refs:** `.claude/skills/qa/references/testing-patterns.md`, `.claude/skills/qa/references/validation.md`, `architecture/software-architecture/06-invariants-and-errors.md`, `architecture/software-architecture/08-invariant-enforcement-matrix.md`, `architecture/software-architecture/09-interaction-traceability.md`, `architecture/software-architecture/10-sequence-failure-mapping.md`, `architecture/ui_ux/ui-screen-inventory.md`, `architecture/ui_ux/ui-ux-patterns.md`
      **Files:** `tests/fakes/` (create shared fake packages), `tests/unit/models/` (create), `tests/unit/services/` (create), `tests/unit/controllers/` (create), `tests/integration/repositories/` (create), `src/lib/__tests__/fakes/` (create), `src/lib/__tests__/routes/` (create), `src/lib/__tests__/components/` (create), `vitest.config.ts` (create or modify), `playwright.config.ts` (create if needed for placeholders), `docs/execution/invariant-coverage.md` (modify), `docs/execution/ui-acceptance-map.md` (modify)
      **What:** This is the mandatory TDD step. Create shared hand-rolled fakes, repository integration harness, frontend test harness, and the first wave of intentionally failing tests derived from the ledgers created in Step 1. Route, action, and UI tests must assert against `docs/execution/transport-contracts.md` and `docs/execution/ui-acceptance-map.md`, not against guessed payloads. Repository integration tests must run against an isolated ephemeral Postgres harness (`testcontainers` or an equivalent throwaway Postgres workflow), never SQLite. Cover domain construction rules, service behaviors, controller transport mapping, repository persistence constraints, job behaviors, route contracts, and UI acceptance criteria. Every test must follow the QA rules: no mocks, one assertion per test, behavior-focused names, and shared fakes implementing full contracts. Mark unfinished cases as skipped only if the missing implementation truly blocks execution, and record each skipped or failing case in the invariant and UI ledgers.
      **Verify:** Test tooling runs, no mocking-library usage exists, the failing or skipped tests are mapped to invariants/interactions/screens in the ledgers, and the suite is intentionally red for missing implementation rather than green by omission.

- [x] **Step 3: Replace the starter runtime assumptions with the architecture baseline**
      **Refs:** `architecture/software-architecture/07-wiring-and-config.md`, `architecture/software-architecture/13-infrastructure-considerations.md`
      **Files:** `package.json` (modify), `drizzle.config.ts` (modify), `.env.example` (modify), `README.md` (modify), `src/lib/server/db/index.ts` (modify or replace), `docker-compose.yml` (create), `src/lib/server/config/runtime.ts` (create)
      **What:** Replace the SQLite starter assumptions with the architecture baseline: Postgres, backend process, worker process, and Hatchet runtime. Document the local runtime topology and add scripts for the app, worker, database tasks, and full-stack verification. Keep the runtime names and config expectations aligned with `13-infrastructure-considerations.md`.
      **Test first:** Unskip or extend the failing runtime/config smoke tests from Step 2 before implementing.
      **Verify:** `pnpm install`, `pnpm check`, and the runtime smoke test pass without any SQLite dependency in the active runtime path.

- [x] **Step 4: Implement validated environment and startup configuration**
      **Refs:** `architecture/software-architecture/07-wiring-and-config.md`, `architecture/software-architecture/13-infrastructure-considerations.md`
      **Files:** `src/lib/server/config/env.ts` (create), `src/lib/server/config/public.ts` (create), `src/lib/server/config/private.ts` (create), `src/lib/server/config/reminder-policy.ts` (create), `src/lib/server/config/timezone-policy.ts` (create), `src/lib/server/config/index.ts` (create)
      **What:** Add the typed startup validation layer for database connectivity, app base URL, session secrets, identity provider settings, reminder policy, retry windows, timezone policy, email provider config, and Hatchet token. Fail fast for invalid or unreachable configuration.
      **Test first:** Turn the config validation tests from Step 2 red without adding production logic to the tests.
      **Verify:** Config tests pass for valid config and fail fast for invalid env or unreachable database.

- [x] **Step 5: Implement shared domain errors, transport mapping, and auth principal plumbing**
      **Refs:** `architecture/software-architecture/01-overview-and-cross-cutting.md`, `architecture/software-architecture/06-invariants-and-errors.md`, `architecture/software-architecture/10-sequence-failure-mapping.md`
      **Files:** `src/lib/server/errors/domain-errors.ts` (create), `src/lib/server/errors/http-error-mapper.ts` (create), `src/lib/server/errors/index.ts` (modify), `src/lib/server/infra/auth/principals.ts` (create), `src/lib/server/infra/auth/session-context.ts` (create), `src/lib/server/infra/auth/authorization-scope.ts` (create), `src/lib/server/infra/auth/verified-identity-guard.ts` (create), `src/app.d.ts` (modify), `src/hooks.server.ts` (create or modify)
      **What:** Define the architecture-specified error taxonomy, transport mapping, request-scoped principal types, session loading, authorization scope helpers, and verified identity guards. Keep auth/session failure ownership in infrastructure where the failure mapping says it belongs.
      **Test first:** Turn on the failing hook, principal, and error-mapping tests from Step 2.
      **Verify:** Hook and mapper tests pass, and `docs/execution/invariant-coverage.md` records the implemented auth/error invariants.

- [x] **Step 6: Implement shared clock, timezone, cursor, and hashing infrastructure**
      **Refs:** `architecture/software-architecture/01-overview-and-cross-cutting.md`, `architecture/software-architecture/06-invariants-and-errors.md`, `architecture/software-architecture/10-sequence-failure-mapping.md`
      **Files:** `src/lib/server/infra/time/clock.ts` (create), `src/lib/server/infra/time/timezone.ts` (create), `src/lib/server/infra/pagination/cursor-codec.ts` (create), `src/lib/server/infra/pagination/cursor-shape.ts` (create), `src/lib/server/infra/idempotency/request-hash.ts` (create)
      **What:** Implement shared time, timezone, cursor, and request-hash utilities used by recurrence, planning, pagination, and idempotency. Cursor validation must remain query-shape aware.
      **Test first:** Enable the failing infrastructure tests from Step 2 for DST handling, cursor round-trips, invalid cursor rejection, and stable request hashing.
      **Verify:** Those tests pass and any cursor-related failure mappings are marked covered.

- [x] **Step 7: Implement domain enums and value objects**
      **Refs:** `architecture/software-architecture/02-aggregates-and-models.md`, `architecture/software-architecture/06-invariants-and-errors.md`, `architecture/software-architecture/08-invariant-enforcement-matrix.md`
      **Files:** `src/lib/server/domain/enums.ts` (create), `src/lib/server/domain/value-objects/` (create full set), `src/lib/server/domain/value-objects/index.ts` (create)
      **What:** Implement every enum and value object named or implied by the aggregate spec, not only the short starter list. Keep them pure, construction-validated, and free of persistence concerns.
      **Test first:** Unskip the value-object tests from Step 2 and add any missing invariant cases before implementation.
      **Verify:** Domain value-object tests pass and each named value object is marked covered in `docs/execution/invariant-coverage.md`.

- [x] **Step 8: Implement identity, profile, and session models**
      **Refs:** `architecture/software-architecture/02-aggregates-and-models.md`, `architecture/software-architecture/08-invariant-enforcement-matrix.md`
      **Files:** `src/lib/server/domain/models/user.ts` (create), `src/lib/server/domain/models/session.ts` (create), `src/lib/server/domain/models/planning-profile.ts` (create), `src/lib/server/domain/models/index.ts` (modify)
      **What:** Implement `User`, `Session`, and `PlanningProfile` exactly as specified, including lifecycle states, timezone snapshots, versioning, and single-profile assumptions.
      **Test first:** Turn the Step 2 model tests for identity/profile/session invariants red and then green.
      **Verify:** Model tests pass and the profile/session invariant rows move to `Covered`.

- [x] **Step 9: Implement aspect and milestone models**
      **Refs:** `architecture/software-architecture/02-aggregates-and-models.md`, `architecture/software-architecture/08-invariant-enforcement-matrix.md`, `architecture/software-architecture/11-aggregate-boundary-audit.md`
      **Files:** `src/lib/server/domain/models/aspect.ts` (create), `src/lib/server/domain/models/milestone.ts` (create), `src/lib/server/domain/models/index.ts` (modify)
      **What:** Implement flat aspect and milestone models with the exact state and restoration semantics from the architecture. Do not smuggle child-task collections into these roots.
      **Test first:** Enable the failing aspect and milestone model tests from Step 2.
      **Verify:** Model tests pass and the aggregate-boundary ledger still matches `11-aggregate-boundary-audit.md`.

- [x] **Step 10: Implement task, recurrence, and reminder models**
      **Refs:** `architecture/software-architecture/02-aggregates-and-models.md`, `architecture/software-architecture/08-invariant-enforcement-matrix.md`, `architecture/software-architecture/11-aggregate-boundary-audit.md`
      **Files:** `src/lib/server/domain/models/task.ts` (create), `src/lib/server/domain/models/task-lock.ts` (create), `src/lib/server/domain/models/recurring-task-series.ts` (create), `src/lib/server/domain/models/recurrence-rule.ts` (create), `src/lib/server/domain/models/recurrence-exception.ts` (create), `src/lib/server/domain/models/reminder.ts` (create), `src/lib/server/domain/models/reminder-attempt.ts` (create), `src/lib/server/domain/models/index.ts` (modify)
      **What:** Implement task lifecycle models, `TaskLock` as a child of `Task`, recurrence series/rule/exception as one aggregate, and reminder/attempt as a separate root with append-only attempts.
      **Test first:** Turn on the failing Step 2 model tests for task, recurrence, and reminder invariants.
      **Verify:** Those model tests pass and the coverage ledger reflects the correct aggregate boundaries.

- [x] **Step 11: Implement availability, planning, audit, portability, idempotency, and job-run models**
      **Refs:** `architecture/software-architecture/02-aggregates-and-models.md`, `architecture/software-architecture/08-invariant-enforcement-matrix.md`, `architecture/software-architecture/11-aggregate-boundary-audit.md`
      **Files:** `src/lib/server/domain/models/availability-block.ts` (create), `src/lib/server/domain/models/availability-exception.ts` (create), `src/lib/server/domain/models/planning-cycle.ts` (create), `src/lib/server/domain/models/planning-revision.ts` (create), `src/lib/server/domain/models/task-allocation.ts` (create), `src/lib/server/domain/models/allocation-outcome.ts` (create), `src/lib/server/domain/models/aspect-cycle-health.ts` (create), `src/lib/server/domain/models/import-job.ts` (create), `src/lib/server/domain/models/audit-event.ts` (create), `src/lib/server/domain/models/idempotency-key.ts` (create), `src/lib/server/domain/models/system-job-run.ts` (create), `src/lib/server/domain/models/index.ts` (modify)
      **What:** Implement the remaining aggregates, preserving `PlanningCycle` as the historical root for revisions, allocations, outcomes, and health, and keeping audit/idempotency/job-run records append-only or first-write-only as required.
      **Test first:** Turn on the failing model tests from Step 2 for planning, availability, audit, portability, and infra records.
      **Verify:** Model tests pass and the invariant ledger reflects append-only and revision-history guarantees.

- [x] **Step 12: Implement the relational schema and migrations for all aggregates**
      **Refs:** `architecture/software-architecture/02-aggregates-and-models.md`, `architecture/software-architecture/05-repositories.md`, `architecture/software-architecture/11-aggregate-boundary-audit.md`, `architecture/software-architecture/13-infrastructure-considerations.md`
      **Files:** `src/lib/server/db/schema/` (create full schema modules), `src/lib/server/db/schema/index.ts` (create), `src/lib/server/db/index.ts` (replace), `src/lib/server/db/migrations/*` (generate)
      **What:** Replace the toy schema with the full Postgres relational model, including all unique constraints, FKs, indexes, current-revision integrity, per-user uniqueness constraints, and append-only record shapes implied by the repository rules and invariant matrix.
      **Test first:** Turn on the repository integration tests from Step 2 that validate schema-backed constraints.
      **Verify:** `pnpm db:generate` and migration application succeed on a fresh Postgres database, and the repository integration tests that only need the schema now pass.

- [x] **Step 13: Implement core repository contracts for identity and profile roots**
      **Refs:** `architecture/software-architecture/05-repositories.md`, `architecture/software-architecture/11-aggregate-boundary-audit.md`
      **Files:** `src/lib/server/repositories/contracts/user-repository.ts` (create), `src/lib/server/repositories/contracts/session-repository.ts` (create), `src/lib/server/repositories/contracts/planning-profile-repository.ts` (create)
      **What:** Create the exact repository interfaces for `User`, `Session`, and `PlanningProfile` using the method names and boundaries from `05-repositories.md`. Keep method signatures aligned with Step 1 ledgers.
      **Test first:** Turn on the contract compilation tests and fake implementations for these three repositories.
      **Verify:** `pnpm check` passes and the contract ledger matches the architecture docs exactly.

- [x] **Step 14: Implement repository contracts for aspect, milestone, and task roots**
      **Refs:** `architecture/software-architecture/05-repositories.md`, `architecture/software-architecture/11-aggregate-boundary-audit.md`
      **Files:** `src/lib/server/repositories/contracts/aspect-repository.ts` (create), `src/lib/server/repositories/contracts/milestone-repository.ts` (create), `src/lib/server/repositories/contracts/task-repository.ts` (create)
      **What:** Create the contract files for `Aspect`, `Milestone`, and `Task` + `TaskLock`, including the exact archive, restore, projection, and lock methods required by the architecture.
      **Test first:** Turn on the matching contract compilation tests and full fake implementations.
      **Verify:** Contracts compile and match the Step 1 reference ledger.

- [x] **Step 15: Implement repository contracts for recurrence, availability, and planning roots**
      **Refs:** `architecture/software-architecture/05-repositories.md`, `architecture/software-architecture/11-aggregate-boundary-audit.md`
      **Files:** `src/lib/server/repositories/contracts/recurring-series-repository.ts` (create), `src/lib/server/repositories/contracts/availability-repository.ts` (create), `src/lib/server/repositories/contracts/planning-cycle-repository.ts` (create)
      **What:** Create the contracts for recurrence, availability, and planning history, keeping the audited aggregate boundaries intact and not splitting children into standalone repositories.
      **Test first:** Turn on the matching contract and fake-implementation tests.
      **Verify:** Contracts compile and the planning-cycle contract still owns revisions, allocations, outcomes, and health.

- [x] **Step 16: Implement repository contracts for reminders and operational records**
      **Refs:** `architecture/software-architecture/05-repositories.md`, `architecture/software-architecture/13-infrastructure-considerations.md`
      **Files:** `src/lib/server/repositories/contracts/reminder-repository.ts` (create), `src/lib/server/repositories/contracts/import-job-repository.ts` (create), `src/lib/server/repositories/contracts/audit-event-repository.ts` (create), `src/lib/server/repositories/contracts/idempotency-key-repository.ts` (create), `src/lib/server/repositories/contracts/system-job-run-repository.ts` (create)
      **What:** Create the contracts for reminder lifecycle, import jobs, audit, idempotency, and job-run dedupe exactly as documented.
      **Test first:** Turn on the matching contract compilation tests and fakes.
      **Verify:** Contracts compile and the interaction ledger references them without invented methods.

- [x] **Step 17: Implement query models and read projection DTO contracts**
      **Refs:** `architecture/software-architecture/05-repositories.md`, `architecture/software-architecture/09-interaction-traceability.md`, `architecture/software-architecture/12-mechanical-audit.md`, `docs/execution/transport-contracts.md`
      **Files:** `src/lib/server/repositories/contracts/query-models.ts` (create), `docs/execution/transport-contracts.md` (modify), `docs/execution/reference-ledger.md` (modify)
      **What:** Turn the Step 1 transport decisions into explicit query DTO types for task list/detail, aspect list/detail, milestone list, planning history, audit feed, dashboard projections, and availability projections. This is where the executor fixes the under-specified read-model surface before repository implementations start.
      **Test first:** Turn on the DTO shape tests and fake projection tests from Step 2.
      **Verify:** Every loader and query interaction in the ledgers points to a concrete DTO type and cursor shape.

- [x] **Step 18: Implement Postgres `UserRepository` and tests**
      **Refs:** `architecture/software-architecture/05-repositories.md`, `architecture/software-architecture/08-invariant-enforcement-matrix.md`
      **Files:** `src/lib/server/repositories/postgres/user-repository.ts` (create), `tests/integration/repositories/test_user_repository.ts` (create or unskip)
      **What:** Implement identity lookup, create, delete, and user fetch behavior with the exact persistence rules from the architecture.
      **Test first:** Enable the `UserRepository` integration tests before implementation.
      **Verify:** User repository integration tests pass on Postgres.

- [x] **Step 19: Implement Postgres `SessionRepository` and tests**
      **Refs:** `architecture/software-architecture/05-repositories.md`, `architecture/software-architecture/10-sequence-failure-mapping.md`
      **Files:** `src/lib/server/repositories/postgres/session-repository.ts` (create), `tests/integration/repositories/test_session_repository.ts` (create or unskip)
      **What:** Implement session create, active lookup by token hash, revoke, revoke-all, and expiry sweep behavior.
      **Test first:** Enable the `SessionRepository` integration tests before implementation.
      **Verify:** Session repository integration tests pass, including expiry and revoke behavior.

- [x] **Step 20: Implement Postgres `PlanningProfileRepository` and tests**
      **Refs:** `architecture/software-architecture/05-repositories.md`, `architecture/software-architecture/08-invariant-enforcement-matrix.md`
      **Files:** `src/lib/server/repositories/postgres/planning-profile-repository.ts` (create), `tests/integration/repositories/test_planning_profile_repository.ts` (create or unskip)
      **What:** Implement single-profile-per-user persistence with optimistic concurrency.
      **Test first:** Enable the planning profile integration tests before implementation.
      **Verify:** Integration tests pass for create/load/save/stale-write rejection.

- [x] **Step 21: Implement Postgres `AspectRepository` and tests**
      **Refs:** `architecture/software-architecture/05-repositories.md`, `architecture/software-architecture/08-invariant-enforcement-matrix.md`
      **Files:** `src/lib/server/repositories/postgres/aspect-repository.ts` (create), `tests/integration/repositories/test_aspect_repository.ts` (create or unskip)
      **What:** Implement aspect save, archive, restore-to-draft, query, list-active, and delete-by-user behavior.
      **Test first:** Enable the aspect repository integration tests before implementation.
      **Verify:** Integration tests pass for pagination, archive/restore, and stale-write cases.

- [x] **Step 22: Implement Postgres `MilestoneRepository` and tests**
      **Refs:** `architecture/software-architecture/05-repositories.md`, `architecture/software-architecture/08-invariant-enforcement-matrix.md`
      **Files:** `src/lib/server/repositories/postgres/milestone-repository.ts` (create), `tests/integration/repositories/test_milestone_repository.ts` (create or unskip)
      **What:** Implement milestone save, archive, restore, query, and delete-by-aspect behavior.
      **Test first:** Enable the milestone repository integration tests before implementation.
      **Verify:** Integration tests pass for lifecycle and query behavior.

- [x] **Step 23: Implement Postgres `TaskRepository` write paths and lock behavior**
      **Refs:** `architecture/software-architecture/05-repositories.md`, `architecture/software-architecture/08-invariant-enforcement-matrix.md`, `architecture/software-architecture/11-aggregate-boundary-audit.md`
      **Files:** `src/lib/server/repositories/postgres/task-repository.ts` (create), `tests/integration/repositories/test_task_repository_writes.ts` (create or unskip)
      **What:** Implement task save, archive, restore, bulk load, active-lock lookup, lock replacement, lock release, and side-effect helpers for cancelling future allocations and pending reminders.
      **Test first:** Enable the task write-path integration tests before implementation.
      **Verify:** Integration tests pass for optimistic concurrency and one-active-lock-per-task guarantees.

- [x] **Step 24: Implement Postgres `TaskRepository` read projections and query behavior**
      **Refs:** `architecture/software-architecture/05-repositories.md`, `architecture/software-architecture/09-interaction-traceability.md`, `docs/execution/transport-contracts.md`
      **Files:** `src/lib/server/repositories/postgres/task-repository.ts` (modify), `tests/integration/repositories/test_task_repository_queries.ts` (create or unskip)
      **What:** Implement task list query, canonical sort order, filters, case-insensitive search, and detail projection loading exactly as fixed in the ledgers.
      **Test first:** Enable the task query integration tests before implementation.
      **Verify:** Integration tests pass for default filters, search, sorting, cursor pagination, and detail hydration.

- [x] **Step 25: Implement Postgres `RecurringSeriesRepository` and tests**
      **Refs:** `architecture/software-architecture/05-repositories.md`, `architecture/software-architecture/11-aggregate-boundary-audit.md`
      **Files:** `src/lib/server/repositories/postgres/recurring-series-repository.ts` (create), `tests/integration/repositories/test_recurring_series_repository.ts` (create or unskip)
      **What:** Implement load/save/close/find-by-task-instance behavior for the recurrence aggregate.
      **Test first:** Enable the recurrence repository integration tests before implementation.
      **Verify:** Integration tests pass for single active rule, exception history, and close semantics.

- [x] **Step 26: Implement Postgres `ReminderRepository` and tests**
      **Refs:** `architecture/software-architecture/05-repositories.md`, `architecture/software-architecture/08-invariant-enforcement-matrix.md`
      **Files:** `src/lib/server/repositories/postgres/reminder-repository.ts` (create), `tests/integration/repositories/test_reminder_repository.ts` (create or unskip)
      **What:** Implement active reminder lookup by task/channel, save, attempt recording, due-query, failed-for-retry query, cancel-pending-for-task, and delete-by-user behavior.
      **Test first:** Enable the reminder repository integration tests before implementation.
      **Verify:** Integration tests pass for one-active-reminder-per-task-per-channel and retry queries.

- [x] **Step 27: Implement Postgres `AvailabilityRepository` and tests**
      **Refs:** `architecture/software-architecture/05-repositories.md`, `architecture/software-architecture/11-aggregate-boundary-audit.md`
      **Files:** `src/lib/server/repositories/postgres/availability-repository.ts` (create), `tests/integration/repositories/test_availability_repository.ts` (create or unskip)
      **What:** Implement availability block save, archive, restore, add-exception, range query, and delete-by-user behavior.
      **Test first:** Enable the availability repository integration tests before implementation.
      **Verify:** Integration tests pass for recurring exceptions and range reads.

- [x] **Step 28: Implement Postgres `PlanningCycleRepository` cycle and revision creation**
      **Refs:** `architecture/software-architecture/05-repositories.md`, `architecture/software-architecture/08-invariant-enforcement-matrix.md`, `architecture/software-architecture/11-aggregate-boundary-audit.md`
      **Files:** `src/lib/server/repositories/postgres/planning-cycle-repository.ts` (create), `tests/integration/repositories/test_planning_cycle_repository_revisions.ts` (create or unskip)
      **What:** Implement cycle lookup, create-cycle-with-revision, create-draft-revision, confirm-cycle, and supersede/create-revision behavior with contiguity and single-current-revision guarantees.
      **Test first:** Enable the planning revision integration tests before implementation.
      **Verify:** Integration tests pass for cycle creation, current revision pointer integrity, and stale-write rejection.

- [x] **Step 29: Implement Postgres `PlanningCycleRepository` edits, outcomes, health, and history query**
      **Refs:** `architecture/software-architecture/05-repositories.md`, `architecture/software-architecture/09-interaction-traceability.md`
      **Files:** `src/lib/server/repositories/postgres/planning-cycle-repository.ts` (modify), `tests/integration/repositories/test_planning_cycle_repository_history.ts` (create or unskip)
      **What:** Implement apply-plan-edit-revision, outcome persistence, health persistence, cycle history query, and delete-by-user behavior.
      **Test first:** Enable the planning history integration tests before implementation.
      **Verify:** Integration tests pass for edit-generated revisions, one outcome per allocation, and history pagination.

- [x] **Step 30: Implement Postgres import-job, audit, idempotency, and system-job-run repositories**
      **Refs:** `architecture/software-architecture/05-repositories.md`, `architecture/software-architecture/13-infrastructure-considerations.md`
      **Files:** `src/lib/server/repositories/postgres/import-job-repository.ts` (create), `src/lib/server/repositories/postgres/audit-event-repository.ts` (create), `src/lib/server/repositories/postgres/idempotency-key-repository.ts` (create), `src/lib/server/repositories/postgres/system-job-run-repository.ts` (create), `tests/integration/repositories/test_operational_repositories.ts` (create or unskip)
      **What:** Implement operational repositories for async import, append-only audit, idempotent command records, and job-run dedupe records.
      **Test first:** Enable the operational repository integration tests before implementation.
      **Verify:** Integration tests pass for import lifecycle, immutable audit append, response replay persistence, and job dedupe.

- [x] **Step 31: Implement idempotency request hashing and command policy wrapper**
      **Refs:** `architecture/software-architecture/01-overview-and-cross-cutting.md`, `architecture/software-architecture/10-sequence-failure-mapping.md`
      **Files:** `src/lib/server/infra/idempotency/request-hash.ts` (modify if needed), `src/lib/server/infra/idempotency/command-policy.ts` (create), `tests/unit/services/test_command_idempotency_policy.ts` (create or unskip)
      **What:** Implement command replay and hash-mismatch behavior for user-triggered create/mutate commands.
      **Test first:** Enable the command idempotency policy tests before implementation.
      **Verify:** Unit and repository-backed tests pass for first execution, replay, and mismatch.

- [x] **Step 32: Implement job idempotency wrapper**
      **Refs:** `architecture/software-architecture/04-controllers-and-jobs.md`, `architecture/software-architecture/10-sequence-failure-mapping.md`
      **Files:** `src/lib/server/infra/idempotency/job-policy.ts` (create), `tests/unit/services/test_job_idempotency_policy.ts` (create or unskip)
      **What:** Implement job-run replay and dedupe behavior for mutation-capable jobs using `SystemJobRun` persistence.
      **Test first:** Enable the job idempotency policy tests before implementation.
      **Verify:** Job idempotency tests pass and the failure ledger marks `SYS-02` covered.

- [x] **Step 33: Implement audit diffing and immutable emission infrastructure**
      **Refs:** `architecture/software-architecture/01-overview-and-cross-cutting.md`, `architecture/software-architecture/06-invariants-and-errors.md`
      **Files:** `src/lib/server/infra/audit/audit-diff.ts` (create), `src/lib/server/infra/audit/audit-emitter.ts` (create), `src/lib/server/infra/audit/ownership-stamped-audit.ts` (create), `src/lib/server/infra/audit/index.ts` (create), `tests/unit/services/test_audit_emitter.ts` (create or unskip)
      **What:** Implement exactly-once immutable audit emission with redaction and service-principal user stamping.
      **Test first:** Enable the audit infrastructure tests before implementation.
      **Verify:** Audit tests pass and the invariant ledger marks audit emission covered.

- [x] **Step 34: Implement identity provider gateway and session cookie adapter**
      **Refs:** `architecture/software-architecture/03-services.md`, `architecture/software-architecture/07-wiring-and-config.md`
      **Files:** `src/lib/server/services/internal/identity-provider-gateway.ts` (create), `src/lib/server/infra/auth/session-cookie.ts` (create), `src/lib/server/infra/providers/oidc-provider.ts` (create), `src/lib/server/infra/providers/dev-provider.ts` (create), `tests/unit/services/test_identity_provider_gateway.ts` (create or unskip)
      **What:** Implement sign-in request generation, callback verification, and session cookie issuing/clearing adapters.
      **Test first:** Enable the identity provider and cookie tests before implementation.
      **Verify:** Provider and cookie tests pass.

- [x] **Step 35: Implement reminder delivery provider adapters**
      **Refs:** `architecture/software-architecture/13-infrastructure-considerations.md`
      **Files:** `src/lib/server/infra/providers/reminder-provider.ts` (create), `src/lib/server/infra/providers/in-app-reminder-provider.ts` (create), `src/lib/server/infra/providers/email-reminder-provider.ts` (create), `tests/unit/services/test_reminder_providers.ts` (create or unskip)
      **What:** Implement the reminder-provider boundary and concrete in-app/email adapters with stable result contracts.
      **Test first:** Enable the reminder provider tests before implementation.
      **Verify:** Provider tests pass for success/failure mapping.

- [x] **Step 36: Implement `AuthService`**
      **Refs:** `architecture/software-architecture/03-services.md`, `architecture/software-architecture/09-interaction-traceability.md`, `architecture/software-architecture/10-sequence-failure-mapping.md`
      **Files:** `src/lib/server/services/auth-service.ts` (create), `tests/unit/services/test_auth_service.ts` (create or unskip)
      **What:** Implement identity callback resolution, logout, and session expiry behavior. Do not include onboarding or profile mutation here except where the architecture explicitly wires them.
      **Test first:** Enable the auth service tests before implementation.
      **Verify:** Auth service tests pass for `AUTH-02`, `AUTH-03`, and `AUTH-04`.

- [x] **Step 37: Implement account erasure orchestration**
      **Refs:** `architecture/software-architecture/03-services.md`, `architecture/software-architecture/09-interaction-traceability.md`
      **Files:** `src/lib/server/services/internal/account-erasure-service.ts` (create), `src/lib/server/services/auth-service.ts` (modify), `tests/unit/services/test_account_erasure_service.ts` (create or unskip)
      **What:** Implement the full hard-delete cascade for user-owned and operational records and wire `AUTH-06` through `AuthService`.
      **Test first:** Enable the account erasure service tests before implementation.
      **Verify:** Account erasure tests pass and enumerate every deleted aggregate class from the architecture.

- [x] **Step 38: Implement `ProfileService`**
      **Refs:** `architecture/software-architecture/03-services.md`, `architecture/software-architecture/08-invariant-enforcement-matrix.md`
      **Files:** `src/lib/server/services/profile-service.ts` (create), `tests/unit/services/test_profile_service.ts` (create or unskip)
      **What:** Implement onboarding completion derivation and planning-profile updates with optimistic concurrency. Onboarding must remain derived from active aspects, not persisted as a new flag.
      **Test first:** Enable the profile service tests before implementation.
      **Verify:** Profile service tests pass for `AUTH-05` and `PRF-01`.

- [x] **Step 39: Implement `AspectTargetValidator` and `AspectService` create/update paths**
      **Refs:** `architecture/software-architecture/03-services.md`, `architecture/software-architecture/08-invariant-enforcement-matrix.md`
      **Files:** `src/lib/server/services/internal/aspect-target-validator.ts` (create), `src/lib/server/services/aspect-service.ts` (create), `tests/unit/services/test_aspect_service_create_update.ts` (create or unskip)
      **What:** Implement aspect creation, activation, update, and target validation behavior without pulling planning-boundary checks earlier than the architecture allows.
      **Test first:** Enable the aspect create/update tests before implementation.
      **Verify:** Tests pass for `ASP-01`, `ASP-02`, and `ASP-03`.

- [x] **Step 40: Implement `AspectService` archive/restore/query paths**
      **Refs:** `architecture/software-architecture/03-services.md`, `architecture/software-architecture/09-interaction-traceability.md`
      **Files:** `src/lib/server/services/aspect-service.ts` (modify), `tests/unit/services/test_aspect_service_archive_restore.ts` (create or unskip)
      **What:** Implement archive, restore, and query behavior, including cross-aggregate cascades and the exact restore-to-draft rule.
      **Test first:** Enable the aspect archive/restore/query tests before implementation.
      **Verify:** Tests pass for `ASP-04`, `ASP-05`, and `ASP-06`.

- [x] **Step 41: Implement `MilestoneService` create/update/query paths**
      **Refs:** `architecture/software-architecture/03-services.md`, `architecture/software-architecture/08-invariant-enforcement-matrix.md`
      **Files:** `src/lib/server/services/milestone-service.ts` (create), `tests/unit/services/test_milestone_service_create_update.ts` (create or unskip)
      **What:** Implement milestone creation, update, and query behavior with aspect ownership and state validation.
      **Test first:** Enable milestone create/update/query tests before implementation.
      **Verify:** Tests pass for `MLS-01`, `MLS-02`, and `MLS-07`.

- [x] **Step 42: Implement `MilestoneService` complete/reopen/archive/restore paths**
      **Refs:** `architecture/software-architecture/03-services.md`, `architecture/software-architecture/09-interaction-traceability.md`, `architecture/software-architecture/10-sequence-failure-mapping.md`
      **Files:** `src/lib/server/services/milestone-service.ts` (modify), `tests/unit/services/test_milestone_service_transitions.ts` (create or unskip)
      **What:** Implement milestone completion gating, reopen behavior, archive, and restore flows with exact child-task checks and state transitions.
      **Test first:** Enable milestone transition tests before implementation.
      **Verify:** Tests pass for `MLS-03` through `MLS-06`.

- [x] **Step 43: Implement `RecurrenceMaterializer` core generation logic**
      **Refs:** `architecture/software-architecture/03-services.md`, `architecture/software-architecture/04-controllers-and-jobs.md`, `architecture/software-architecture/10-sequence-failure-mapping.md`
      **Files:** `src/lib/server/services/internal/recurrence-materializer.ts` (create), `tests/unit/services/test_recurrence_materializer.ts` (create or unskip)
      **What:** Implement next-instance generation, overdue suppression, monthly clamp behavior, and close/pause awareness.
      **Test first:** Enable the recurrence materializer tests before implementation.
      **Verify:** Materializer tests pass and `REC-04` is marked covered.

- [x] **Step 44: Implement `RecurrenceService` upsert and pause/resume flows**
      **Refs:** `architecture/software-architecture/03-services.md`, `architecture/software-architecture/09-interaction-traceability.md`
      **Files:** `src/lib/server/services/recurrence-service.ts` (create), `tests/unit/services/test_recurrence_service_upsert.ts` (create or unskip)
      **What:** Implement series upsert, first-instance materialization, and pause/resume behavior.
      **Test first:** Enable the recurrence upsert/pause tests before implementation.
      **Verify:** Tests pass for `REC-01` and `REC-02`.

- [x] **Step 45: Implement `RecurrenceService` exception and close flows**
      **Refs:** `architecture/software-architecture/03-services.md`, `architecture/software-architecture/09-interaction-traceability.md`
      **Files:** `src/lib/server/services/recurrence-service.ts` (modify), `tests/unit/services/test_recurrence_service_exceptions.ts` (create or unskip)
      **What:** Implement skip/move-next-occurrence and close-series behavior with history preservation.
      **Test first:** Enable the recurrence exception/close tests before implementation.
      **Verify:** Tests pass for `REC-03` and `REC-05`.

- [x] **Step 46: Implement `TaskService` create/update/move flows**
      **Refs:** `architecture/software-architecture/03-services.md`, `architecture/software-architecture/08-invariant-enforcement-matrix.md`
      **Files:** `src/lib/server/services/task-service.ts` (create), `src/lib/server/services/dto/task-dtos.ts` (create), `tests/unit/services/test_task_service_create_update.ts` (create or unskip)
      **What:** Implement task creation, update, and same-aspect milestone movement rules.
      **Test first:** Enable the task create/update/move tests before implementation.
      **Verify:** Tests pass for `TSK-01`, `TSK-02`, and `TSK-03`.

- [x] **Step 47: Implement `TaskService` start/complete/reopen flows**
      **Refs:** `architecture/software-architecture/03-services.md`, `architecture/software-architecture/09-interaction-traceability.md`, `architecture/software-architecture/10-sequence-failure-mapping.md`
      **Files:** `src/lib/server/services/task-service.ts` (modify), `tests/unit/services/test_task_service_transitions.ts` (create or unskip)
      **What:** Implement start, complete, and reopen transitions, including recurrence-materializer invocation and side-effect rules.
      **Test first:** Enable the task transition tests before implementation.
      **Verify:** Tests pass for `TSK-04`, `TSK-05`, and `TSK-06`.

- [x] **Step 48: Implement `TaskService` archive/restore and bulk mutation flows**
      **Refs:** `architecture/software-architecture/03-services.md`, `architecture/software-architecture/09-interaction-traceability.md`
      **Files:** `src/lib/server/services/task-service.ts` (modify), `tests/unit/services/test_task_service_bulk_archive.ts` (create or unskip)
      **What:** Implement archive, restore, and partial-success bulk mutation behavior with per-item results and future-artifact cancellation.
      **Test first:** Enable the task archive/restore/bulk tests before implementation.
      **Verify:** Tests pass for `TSK-07`, `TSK-08`, and `TSK-09`.

- [x] **Step 49: Implement `TaskService` query and detail flows**
      **Refs:** `architecture/software-architecture/03-services.md`, `architecture/software-architecture/09-interaction-traceability.md`, `docs/execution/transport-contracts.md`
      **Files:** `src/lib/server/services/task-service.ts` (modify), `tests/unit/services/test_task_service_queries.ts` (create or unskip)
      **What:** Implement cursor-validated task query and task-detail hydration using the query DTOs fixed earlier.
      **Test first:** Enable the task query/detail tests before implementation.
      **Verify:** Tests pass for `TSK-10` and `TSK-11`.

- [x] **Step 50: Implement `AvailabilityWindowResolver`**
      **Refs:** `architecture/software-architecture/03-services.md`, `architecture/software-architecture/08-invariant-enforcement-matrix.md`
      **Files:** `src/lib/server/services/internal/availability-window-resolver.ts` (create), `tests/unit/services/test_availability_window_resolver.ts` (create or unskip)
      **What:** Implement recurring expansion, exception application, timezone handling, and overlap merging for effective availability.
      **Test first:** Enable the resolver tests before implementation.
      **Verify:** Resolver tests pass.

- [x] **Step 51: Implement `AvailabilityService` command paths**
      **Refs:** `architecture/software-architecture/03-services.md`, `architecture/software-architecture/09-interaction-traceability.md`
      **Files:** `src/lib/server/services/availability-service.ts` (create), `tests/unit/services/test_availability_service_commands.ts` (create or unskip)
      **What:** Implement one-off creation, recurring creation, exception add, and update/archive/restore behavior.
      **Test first:** Enable the availability command tests before implementation.
      **Verify:** Tests pass for `AVL-01` through `AVL-04`.

- [x] **Step 52: Implement `AvailabilityService` read path**
      **Refs:** `architecture/software-architecture/03-services.md`, `docs/execution/transport-contracts.md`
      **Files:** `src/lib/server/services/availability-service.ts` (modify), `tests/unit/services/test_availability_service_queries.ts` (create or unskip)
      **What:** Implement effective availability querying through the resolver and projection DTOs.
      **Test first:** Enable the availability query tests before implementation.
      **Verify:** Tests pass for `AVL-05`.

- [x] **Step 53: Implement `SchedulerEngine` scoring and ranking**
      **Refs:** `architecture/software-architecture/03-services.md`, `architecture/software-architecture/08-invariant-enforcement-matrix.md`
      **Files:** `src/lib/server/services/internal/scoring.ts` (create), `src/lib/server/services/internal/scheduler-engine.ts` (create), `tests/unit/services/test_scheduler_engine_ranking.ts` (create or unskip)
      **What:** Implement deterministic scoring, ranking, and tie-break behavior using planning-profile inputs.
      **Test first:** Enable scheduler ranking tests before implementation.
      **Verify:** Ranking tests pass and deterministic ordering is covered.

- [x] **Step 54: Implement `SchedulerEngine` placement and feasibility rules**
      **Refs:** `architecture/software-architecture/03-services.md`, `architecture/software-architecture/09-interaction-traceability.md`
      **Files:** `src/lib/server/services/internal/scheduler-engine.ts` (modify), `tests/unit/services/test_scheduler_engine_placement.ts` (create or unskip)
      **What:** Implement availability-window placement, min-chunk, lock preservation, splittable behavior, and deferred outcomes.
      **Test first:** Enable scheduler placement tests before implementation.
      **Verify:** Placement tests pass.

- [x] **Step 55: Implement `PlanningService` draft generation and confirmation**
      **Refs:** `architecture/software-architecture/03-services.md`, `architecture/software-architecture/09-interaction-traceability.md`, `architecture/software-architecture/10-sequence-failure-mapping.md`
      **Files:** `src/lib/server/services/planning-service.ts` (create), `tests/unit/services/test_planning_service_generation.ts` (create or unskip)
      **What:** Implement generate-draft and confirm-draft flows with exact 100% aspect target gating and cycle creation semantics.
      **Test first:** Enable planning generation/confirm tests before implementation.
      **Verify:** Tests pass for `PLN-01` and `PLN-02`.

- [x] **Step 56: Implement `PlanningService` regenerate and edit flows**
      **Refs:** `architecture/software-architecture/03-services.md`, `architecture/software-architecture/09-interaction-traceability.md`
      **Files:** `src/lib/server/services/planning-service.ts` (modify), `tests/unit/services/test_planning_service_edits.ts` (create or unskip)
      **What:** Implement regeneration and manual plan edits with immutable revision creation and lock conflict handling.
      **Test first:** Enable planning regenerate/edit tests before implementation.
      **Verify:** Tests pass for `PLN-03` and `PLN-04`.

- [x] **Step 57: Implement `PlanningService` day-boundary replan and history query**
      **Refs:** `architecture/software-architecture/03-services.md`, `architecture/software-architecture/04-controllers-and-jobs.md`, `architecture/software-architecture/10-sequence-failure-mapping.md`
      **Files:** `src/lib/server/services/planning-service.ts` (modify), `tests/unit/services/test_planning_service_replan_history.ts` (create or unskip)
      **What:** Implement day-boundary replan no-op/new-revision/conflict branches and cycle history query behavior.
      **Test first:** Enable planning replan/history tests before implementation.
      **Verify:** Tests pass for `PLN-05` and `PLN-06`.

- [x] **Step 58: Implement `ExecutionService`**
      **Refs:** `architecture/software-architecture/03-services.md`, `architecture/software-architecture/09-interaction-traceability.md`
      **Files:** `src/lib/server/services/execution-service.ts` (create), `tests/unit/services/test_execution_service.ts` (create or unskip)
      **What:** Implement allocation outcome marking with exact one-outcome-per-allocation behavior.
      **Test first:** Enable execution service tests before implementation.
      **Verify:** Tests pass for `EXE-01`.

- [x] **Step 59: Implement `HealthComputationService`**
      **Refs:** `architecture/software-architecture/03-services.md`, `architecture/software-architecture/04-controllers-and-jobs.md`
      **Files:** `src/lib/server/services/internal/health-computation-service.ts` (create), `tests/unit/services/test_health_computation_service.ts` (create or unskip)
      **What:** Implement cycle health computation from attended vs target minutes for job-driven updates.
      **Test first:** Enable health computation tests before implementation.
      **Verify:** Tests pass for `EXE-02`.

- [x] **Step 60: Implement `ReminderService` upsert and snooze flows**
      **Refs:** `architecture/software-architecture/03-services.md`, `architecture/software-architecture/09-interaction-traceability.md`
      **Files:** `src/lib/server/services/reminder-service.ts` (create), `tests/unit/services/test_reminder_service.ts` (create or unskip)
      **What:** Implement create/replace reminder and snooze behavior with uniqueness and snooze-limit rules.
      **Test first:** Enable reminder service tests before implementation.
      **Verify:** Tests pass for `REM-01` and `REM-02`.

- [x] **Step 61: Implement `ReminderDispatchService` due dispatch flow**
      **Refs:** `architecture/software-architecture/04-controllers-and-jobs.md`, `architecture/software-architecture/10-sequence-failure-mapping.md`
      **Files:** `src/lib/server/services/internal/reminder-dispatch-service.ts` (create), `tests/unit/services/test_reminder_dispatch_due.ts` (create or unskip)
      **What:** Implement due-reminder dispatch with provider invocation and attempt recording.
      **Test first:** Enable due-dispatch tests before implementation.
      **Verify:** Tests pass for `REM-03` behavior.

- [x] **Step 62: Implement `ReminderDispatchService` retry flow**
      **Refs:** `architecture/software-architecture/04-controllers-and-jobs.md`, `architecture/software-architecture/10-sequence-failure-mapping.md`
      **Files:** `src/lib/server/services/internal/reminder-dispatch-service.ts` (modify), `tests/unit/services/test_reminder_dispatch_retry.ts` (create or unskip)
      **What:** Implement failed-reminder retry selection, exponential backoff windows, and terminal failure handling.
      **Test first:** Enable retry tests before implementation.
      **Verify:** Tests pass for `REM-04` behavior.

- [x] **Step 63: Implement `ImportRemapService`**
      **Refs:** `architecture/software-architecture/03-services.md`, `architecture/software-architecture/13-infrastructure-considerations.md`
      **Files:** `src/lib/server/services/internal/import-remap-service.ts` (create), `tests/unit/services/test_import_remap_service.ts` (create or unskip)
      **What:** Implement ID remapping and forbidden-entity rejection logic for import payload execution.
      **Test first:** Enable import remap tests before implementation.
      **Verify:** Import remap tests pass.

- [x] **Step 64: Implement `DataPortabilityService` synchronous export and preview validation**
      **Refs:** `architecture/software-architecture/03-services.md`, `architecture/software-architecture/13-infrastructure-considerations.md`, `docs/execution/transport-contracts.md`
      **Files:** `src/lib/server/services/data-portability-service.ts` (create), `tests/unit/services/test_data_portability_export_preview.ts` (create or unskip)
      **What:** Implement inline JSON export and import-preview validation while preserving the v1 rule that export remains synchronous and excludes forbidden records.
      **Test first:** Enable export/preview tests before implementation.
      **Verify:** Tests pass for `DAT-01` and preview behavior.

- [x] **Step 65: Implement `DataPortabilityService` async import start/status behavior**
      **Refs:** `architecture/software-architecture/03-services.md`, `architecture/software-architecture/13-infrastructure-considerations.md`, `docs/execution/transport-contracts.md`
      **Files:** `src/lib/server/services/data-portability-service.ts` (modify), `tests/unit/services/test_data_portability_import.ts` (create or unskip)
      **What:** Implement async import start, `ImportJob` state transitions, and status/result reads. Keep Hatchet enqueue concerns behind the wiring layer chosen in Step 1.
      **Test first:** Enable async import tests before implementation.
      **Verify:** Tests pass for `DAT-02` start/status behavior and the transport ledger remains aligned.

- [x] **Step 66: Implement `AuditQueryService`**
      **Refs:** `architecture/software-architecture/03-services.md`, `architecture/software-architecture/09-interaction-traceability.md`
      **Files:** `src/lib/server/services/audit-query-service.ts` (create), `tests/unit/services/test_audit_query_service.ts` (create or unskip)
      **What:** Implement read-only audit feed queries using the fixed pagination and projection DTOs.
      **Test first:** Enable the audit query tests before implementation.
      **Verify:** Tests pass for `AUD-02`.

- [x] **Step 67: Implement auth/profile controllers**
      **Refs:** `architecture/software-architecture/04-controllers-and-jobs.md`, `architecture/software-architecture/09-interaction-traceability.md`, `docs/execution/transport-contracts.md`
      **Files:** `src/lib/server/controllers/auth-controller.ts` (create), `src/lib/server/controllers/profile-controller.ts` (create), `tests/unit/controllers/test_auth_profile_controllers.ts` (create or unskip)
      **What:** Implement transport adapters for auth and profile interactions exactly as mapped in the ledgers.
      **Test first:** Enable auth/profile controller tests before implementation.
      **Verify:** Tests pass and no controller invents extra methods.

- [x] **Step 68: Implement aspect, milestone, and task controllers**
      **Refs:** `architecture/software-architecture/04-controllers-and-jobs.md`, `docs/execution/transport-contracts.md`
      **Files:** `src/lib/server/controllers/aspect-controller.ts` (create), `src/lib/server/controllers/milestone-controller.ts` (create), `src/lib/server/controllers/task-controller.ts` (create), `tests/unit/controllers/test_work_item_controllers.ts` (create or unskip)
      **What:** Implement controllers for aspect, milestone, and task interactions with exact DTO mapping and no business branching.
      **Test first:** Enable these controller tests before implementation.
      **Verify:** Tests pass for all mapped methods.

- [x] **Step 69: Implement recurrence, availability, and planning controllers**
      **Refs:** `architecture/software-architecture/04-controllers-and-jobs.md`, `docs/execution/transport-contracts.md`
      **Files:** `src/lib/server/controllers/recurrence-controller.ts` (create), `src/lib/server/controllers/availability-controller.ts` (create), `src/lib/server/controllers/planning-controller.ts` (create), `tests/unit/controllers/test_planning_family_controllers.ts` (create or unskip)
      **What:** Implement the recurrence, availability, and planning controller layer.
      **Test first:** Enable the planning-family controller tests before implementation.
      **Verify:** Tests pass and all controller methods match the interaction matrix.

- [x] **Step 70: Implement execution, reminder, portability, and audit controllers**
      **Refs:** `architecture/software-architecture/04-controllers-and-jobs.md`, `docs/execution/transport-contracts.md`
      **Files:** `src/lib/server/controllers/execution-controller.ts` (create), `src/lib/server/controllers/reminder-controller.ts` (create), `src/lib/server/controllers/data-portability-controller.ts` (create), `src/lib/server/controllers/audit-controller.ts` (create), `src/lib/server/controllers/index.ts` (modify), `tests/unit/controllers/test_operational_controllers.ts` (create or unskip)
      **What:** Implement the remaining controllers, including the three explicit `DAT-02` transport surfaces.
      **Test first:** Enable the operational controller tests before implementation.
      **Verify:** Tests pass and controller surface area matches the transport ledger exactly.

- [x] **Step 71: Implement `AppFactory` repository and infrastructure wiring**
      **Refs:** `architecture/software-architecture/07-wiring-and-config.md`, `architecture/software-architecture/13-infrastructure-considerations.md`
      **Files:** `src/lib/server/factory/app-factory.ts` (modify), `src/lib/server/factory/request-scope.ts` (create), `src/lib/server/factory/index.ts` (create), `tests/unit/services/test_factory_infra_wiring.ts` (create or unskip)
      **What:** Wire the DB, repository adapters, providers, idempotency/audit infra, and request scope into the composition root.
      **Test first:** Enable the factory wiring tests before implementation.
      **Verify:** Factory tests pass for repository and infra resolution.

- [x] **Step 72: Implement `AppFactory` service and controller wiring**
      **Refs:** `architecture/software-architecture/07-wiring-and-config.md`
      **Files:** `src/lib/server/factory/app-factory.ts` (modify), `tests/unit/services/test_factory_service_controller_wiring.ts` (create or unskip)
      **What:** Finish service/controller construction order, ensuring no service-to-service coupling violates the architecture.
      **Test first:** Enable service/controller factory tests before implementation.
      **Verify:** Factory tests pass and `pnpm check` shows no circular dependencies.

- [x] **Step 73: Implement the design token layer and global styles**
      **Refs:** `DESIGN_SYSTEM.md`, `architecture/ui_ux/ui-wireframes.md`
      **Files:** `src/routes/layout.css` (replace), `src/lib/styles/tokens.css` (create), `src/lib/styles/base.css` (create), `src/lib/styles/motion.css` (create), `src/lib/components/ui/` (generate if not present)
      **What:** Replace the starter CSS with the full design-token layer and ensure the generated `ui` layer exists as the primitive foundation expected by the design system.
      **Test first:** Turn on token/style smoke tests before implementation.
      **Verify:** Visual smoke tests pass for tokens, dark mode, reduced motion, and glass fallback.

- [x] **Step 74: Implement primitive wrappers for buttons, inputs, cards, text, and stack**
      **Refs:** `DESIGN_SYSTEM.md`
      **Files:** `src/lib/components/primitives/Button.svelte` (create), `src/lib/components/primitives/Input.svelte` (create), `src/lib/components/primitives/Card.svelte` (create), `src/lib/components/primitives/Text.svelte` (create), `src/lib/components/primitives/Stack.svelte` (create), `tests/unit/components/test_primitives_core.spec.ts` (create or unskip)
      **What:** Build the core token-aware wrappers for the most commonly used primitives.
      **Test first:** Enable the core primitive tests before implementation.
      **Verify:** Primitive tests pass and no raw button/input usage remains in new code.

- [x] **Step 75: Implement primitive wrappers for badge, panel, and glass card**
      **Refs:** `DESIGN_SYSTEM.md`, `architecture/ui_ux/ui-ux-patterns.md`
      **Files:** `src/lib/components/primitives/Badge.svelte` (create), `src/lib/components/primitives/Panel.svelte` (create), `src/lib/components/primitives/GlassCard.svelte` (create), `tests/unit/components/test_primitives_surface.spec.ts` (create or unskip)
      **What:** Build the remaining surface primitives with the design system's typography and glass restrictions.
      **Test first:** Enable the surface primitive tests before implementation.
      **Verify:** Surface primitive tests pass.

- [x] **Step 76: Implement modal, drawer, confirm dialog, toast stack, and command palette**
      **Refs:** `DESIGN_SYSTEM.md`, `architecture/ui_ux/ui-screen-inventory.md`, `architecture/ui_ux/ui-ux-patterns.md`
      **Files:** `src/lib/components/overlays/Modal.svelte` (create), `src/lib/components/overlays/Drawer.svelte` (create), `src/lib/components/overlays/ConfirmDialog.svelte` (create), `src/lib/components/overlays/ToastStack.svelte` (create), `src/lib/components/overlays/CommandPalette.svelte` (create), `tests/unit/components/test_overlays.spec.ts` (create or unskip)
      **What:** Implement shared overlay infrastructure with keyboard focus management and the opaque destructive confirmation surface rule.
      **Test first:** Enable overlay tests before implementation.
      **Verify:** Overlay tests pass for focus trapping, keyboard access, and visual restrictions.

- [x] **Step 77: Implement shared layout shells and empty/loading states**
      **Refs:** `architecture/ui_ux/ui-screen-inventory.md`, `architecture/ui_ux/ui-wireframes.md`, `DESIGN_SYSTEM.md`
      **Files:** `src/lib/components/layout/AppShell.svelte` (create), `src/lib/components/layout/WizardLayout.svelte` (create), `src/lib/components/layout/TimelineLayout.svelte` (create), `src/lib/components/layout/MasterDetailLayout.svelte` (create), `src/lib/components/layout/DashboardGrid.svelte` (create), `src/lib/components/layout/PageHeader.svelte` (create), `src/lib/components/layout/EmptyState.svelte` (create), `src/lib/components/layout/Skeleton.svelte` (create), `src/routes/(app)/+layout.server.ts` (create), `src/routes/(app)/+layout.svelte` (create), `tests/unit/components/test_layouts.spec.ts` (create or unskip)
      **What:** Implement all structural layout components before any screen-level route work. `AppShell` must wire the global `Cmd+K` / `Ctrl+K` command palette trigger and the top-bar week selector described in the UI inventory, not only render static layout chrome.
      **Test first:** Enable layout tests before implementation.
      **Verify:** Layout tests pass for responsive shell behavior.

- [x] **Step 78: Implement auth transport routes and login screen**
      **Refs:** `architecture/ui_ux/ui-screen-inventory.md`, `architecture/ui_ux/ui-wireframes.md`, `docs/execution/transport-contracts.md`
      **Files:** `src/routes/(auth)/login/+server.ts` (create), `src/routes/(auth)/login/+page.svelte` (create), `tests/unit/routes/test_login_route.spec.ts` (create or unskip)
      **What:** Implement the auth entry route and login screen using the exact transport contract and standalone layout.
      **Test first:** Enable login route tests before implementation.
      **Verify:** Login route tests pass and the UI ledger marks the login screen complete.

- [x] **Step 79: Implement auth callback transport route and callback screen**
      **Refs:** `architecture/ui_ux/ui-screen-inventory.md`, `docs/execution/transport-contracts.md`
      **Files:** `src/routes/(auth)/callback/+server.ts` (create), `src/routes/(auth)/callback/+page.svelte` (create), `tests/unit/routes/test_callback_route.spec.ts` (create or unskip)
      **What:** Implement the callback handler and loading/redirect screen exactly as specified.
      **Test first:** Enable callback route tests before implementation.
      **Verify:** Callback tests pass.

- [x] **Step 80: Implement onboarding data loader and action plumbing**
      **Refs:** `architecture/ui_ux/ui-screen-inventory.md`, `architecture/ui_ux/ui-ux-patterns.md`, `docs/execution/transport-contracts.md`
      **Files:** `src/routes/(onboarding)/+page.server.ts` (create), `tests/unit/routes/test_onboarding_server.spec.ts` (create or unskip)
      **What:** Implement the onboarding page server contract before the page component so the executor cannot invent loader/action shapes inside the UI.
      **Test first:** Enable onboarding server tests before implementation.
      **Verify:** Onboarding server tests pass.

- [x] **Step 81: Implement onboarding wizard UI**
      **Refs:** `architecture/ui_ux/ui-ux-patterns.md`, `architecture/ui_ux/ui-wireframes.md`, `DESIGN_SYSTEM.md`
      **Files:** `src/routes/(onboarding)/+page.svelte` (create), `tests/unit/routes/test_onboarding_page.spec.ts` (create or unskip)
      **What:** Implement the exact four-step wizard with sessionStorage persistence, target-sum validation, back button behavior, and single glass step card.
      **Test first:** Enable onboarding page tests before implementation.
      **Verify:** Onboarding page tests pass and the UI acceptance map records each wizard constraint.

- [x] **Step 82: Implement dashboard data loader**
      **Refs:** `architecture/ui_ux/ui-screen-inventory.md`, `docs/execution/transport-contracts.md`
      **Files:** `src/routes/(app)/+page.server.ts` (create), `tests/unit/routes/test_dashboard_server.spec.ts` (create or unskip)
      **What:** Implement the dashboard loader contract and projection mapping before the dashboard page component.
      **Test first:** Enable dashboard server tests before implementation.
      **Verify:** Dashboard server tests pass.

- [x] **Step 83: Implement dashboard UI**
      **Refs:** `architecture/ui_ux/ui-ux-patterns.md`, `architecture/ui_ux/ui-wireframes.md`, `DESIGN_SYSTEM.md`
      **Files:** `src/lib/components/domain/dashboard/KpiCard.svelte` (create), `src/lib/components/domain/dashboard/AspectBalanceChart.svelte` (create), `src/lib/components/domain/dashboard/TodaySchedule.svelte` (create), `src/lib/components/domain/dashboard/UpcomingTasks.svelte` (create), `src/routes/(app)/+page.svelte` (create), `tests/unit/routes/test_dashboard_page.spec.ts` (create or unskip)
      **What:** Implement the above-the-fold dashboard screen with glass only in the KPI zone.
      **Test first:** Enable dashboard page tests before implementation.
      **Verify:** Dashboard UI tests pass.

- [x] **Step 84: Implement aspects list loader and list screen**
      **Refs:** `architecture/ui_ux/ui-screen-inventory.md`, `docs/execution/transport-contracts.md`
      **Files:** `src/routes/(app)/aspects/+page.server.ts` (create), `src/lib/components/domain/aspects/AspectCard.svelte` (create), `src/routes/(app)/aspects/+page.svelte` (create), `tests/unit/routes/test_aspects_list.spec.ts` (create or unskip)
      **What:** Implement the aspects overview route and card-grid screen.
      **Test first:** Enable aspects list tests before implementation.
      **Verify:** Aspects list tests pass.

- [x] **Step 85: Implement aspect detail loader and tab shell**
      **Refs:** `architecture/ui_ux/ui-ux-patterns.md`, `docs/execution/transport-contracts.md`
      **Files:** `src/routes/(app)/aspects/[id]/+page.server.ts` (create), `src/routes/(app)/aspects/[id]/+page.svelte` (create), `tests/unit/routes/test_aspect_detail_tabs.spec.ts` (create or unskip)
      **What:** Implement the aspect detail loader and the URL-synced three-tab shell with keep-alive tab state.
      **Test first:** Enable aspect detail shell tests before implementation.
      **Verify:** Aspect detail shell tests pass.

- [x] **Step 86: Implement aspect editor, overview tab, milestone list, and task tab**
      **Refs:** `architecture/ui_ux/ui-screen-inventory.md`, `architecture/ui_ux/ui-ux-patterns.md`
      **Files:** `src/lib/components/domain/aspects/AspectEditor.svelte` (create), `src/lib/components/domain/aspects/AspectOverviewTab.svelte` (create), `src/lib/components/domain/aspects/MilestoneList.svelte` (create), `src/lib/components/domain/aspects/AspectTasksTab.svelte` (create), `tests/unit/components/test_aspect_components.spec.ts` (create or unskip)
      **What:** Implement the feature components that populate the aspect detail views and editor overlay.
      **Test first:** Enable aspect component tests before implementation.
      **Verify:** Aspect component tests pass.

- [x] **Step 87: Implement tasks list loader and master pane**
      **Refs:** `architecture/ui_ux/ui-ux-patterns.md`, `docs/execution/transport-contracts.md`
      **Files:** `src/routes/(app)/tasks/+page.server.ts` (create), `src/lib/components/domain/tasks/TaskList.svelte` (create), `src/lib/components/domain/tasks/TaskListItem.svelte` (create), `tests/unit/routes/test_tasks_list.spec.ts` (create or unskip)
      **What:** Implement the task list loader and master pane with cursor pagination and canonical filters.
      **Test first:** Enable tasks list tests before implementation.
      **Verify:** Tasks list tests pass.

- [x] **Step 88: Implement task detail loader and desktop/mobile route shell**
      **Refs:** `architecture/ui_ux/ui-screen-inventory.md`, `architecture/ui_ux/ui-wireframes.md`, `docs/execution/transport-contracts.md`
      **Files:** `src/routes/(app)/tasks/[id]/+page.server.ts` (create), `src/routes/(app)/tasks/+page.svelte` (create), `src/routes/(app)/tasks/[id]/+page.svelte` (create), `tests/unit/routes/test_task_detail_shell.spec.ts` (create or unskip)
      **What:** Implement the selected-task route shell for desktop master-detail and mobile drill-down parity.
      **Test first:** Enable task detail shell tests before implementation.
      **Verify:** Task detail shell tests pass.

- [x] **Step 89: Implement task detail components and editor**
      **Refs:** `architecture/ui_ux/ui-screen-inventory.md`, `architecture/ui_ux/ui-ux-patterns.md`
      **Files:** `src/lib/components/domain/tasks/TaskDetail.svelte` (create), `src/lib/components/domain/tasks/EffortBar.svelte` (create), `src/lib/components/domain/tasks/TaskEditor.svelte` (create), `src/lib/components/domain/tasks/BulkActionToolbar.svelte` (create), `tests/unit/components/test_task_components.spec.ts` (create or unskip)
      **What:** Implement the task detail surface, effort visualization, bulk toolbar, and editor overlay.
      **Test first:** Enable task component tests before implementation.
      **Verify:** Task component tests pass.

- [x] **Step 90: Implement recurrence and reminder UI sections inside task detail**
      **Refs:** `architecture/ui_ux/ui-ux-patterns.md`, `DESIGN_SYSTEM.md`
      **Files:** `src/lib/components/domain/tasks/RecurrenceSection.svelte` (create), `src/lib/components/domain/tasks/ReminderSection.svelte` (create), `tests/unit/components/test_task_detail_recurring.spec.ts` (create or unskip)
      **What:** Implement the recurrence and reminder sections with validation, duplicate-channel feedback, and snooze controls.
      **Test first:** Enable recurrence/reminder UI tests before implementation.
      **Verify:** These UI tests pass.

- [x] **Step 91: Implement plan page loader and page shell**
      **Refs:** `architecture/ui_ux/ui-screen-inventory.md`, `docs/execution/transport-contracts.md`
      **Files:** `src/routes/(app)/plan/+page.server.ts` (create), `src/routes/(app)/plan/+page.svelte` (create), `tests/unit/routes/test_plan_page_shell.spec.ts` (create or unskip)
      **What:** Implement the weekly plan page contract and screen shell before the specialized timeline components.
      **Test first:** Enable plan shell tests before implementation.
      **Verify:** Plan shell tests pass.

- [x] **Step 92: Implement plan timeline components**
      **Refs:** `architecture/ui_ux/ui-ux-patterns.md`, `architecture/ui_ux/ui-wireframes.md`, `DESIGN_SYSTEM.md`
      **Files:** `src/lib/components/domain/plan/PlanHeader.svelte` (create), `src/lib/components/domain/plan/TimelineGrid.svelte` (create), `src/lib/components/domain/plan/AvailabilityLane.svelte` (create), `src/lib/components/domain/plan/AllocationBlock.svelte` (create), `src/lib/components/domain/plan/AllocationPopover.svelte` (create), `tests/unit/components/test_plan_timeline.spec.ts` (create or unskip)
      **What:** Implement the weekly timeline UI, availability lanes, allocations, popovers, and summary interactions.
      **Test first:** Enable plan timeline tests before implementation.
      **Verify:** Timeline tests pass.

- [x] **Step 93: Implement plan history loader and revision feed UI**
      **Refs:** `architecture/ui_ux/ui-screen-inventory.md`, `architecture/ui_ux/ui-ux-patterns.md`, `docs/execution/transport-contracts.md`
      **Files:** `src/routes/(app)/plan/history/+page.server.ts` (create), `src/routes/(app)/plan/history/+page.svelte` (create), `src/lib/components/domain/plan/RevisionFeedItem.svelte` (create), `tests/unit/routes/test_plan_history.spec.ts` (create or unskip)
      **What:** Implement plan history loading, feed pagination, collapsed diffs, and scroll restoration behavior.
      **Test first:** Enable plan history tests before implementation.
      **Verify:** Plan history tests pass.

- [x] **Step 94: Implement availability settings loader and page shell**
      **Refs:** `architecture/ui_ux/ui-screen-inventory.md`, `docs/execution/transport-contracts.md`
      **Files:** `src/routes/(app)/settings/availability/+page.server.ts` (create), `src/routes/(app)/settings/availability/+page.svelte` (create), `tests/unit/routes/test_availability_settings_shell.spec.ts` (create or unskip)
      **What:** Implement the availability settings route contract and page shell.
      **Test first:** Enable availability settings shell tests before implementation.
      **Verify:** Availability shell tests pass.

- [x] **Step 95: Implement availability grid, block list, and editor drawer**
      **Refs:** `architecture/ui_ux/ui-ux-patterns.md`, `architecture/ui_ux/ui-wireframes.md`
      **Files:** `src/lib/components/domain/availability/AvailabilityGrid.svelte` (create), `src/lib/components/domain/availability/AvailabilityBlockList.svelte` (create), `src/lib/components/domain/availability/AvailabilityEditor.svelte` (create), `tests/unit/components/test_availability_components.spec.ts` (create or unskip)
      **What:** Implement the availability manager feature components for one-off, recurring, and exception editing flows.
      **Test first:** Enable availability component tests before implementation.
      **Verify:** Availability component tests pass.

- [x] **Step 96: Implement settings hub route and card grid**
      **Refs:** `architecture/ui_ux/ui-screen-inventory.md`, `architecture/ui_ux/ui-ux-patterns.md`
      **Files:** `src/routes/(app)/settings/+page.svelte` (create), `src/lib/components/domain/settings/SettingsCardGrid.svelte` (create), `tests/unit/routes/test_settings_hub.spec.ts` (create or unskip)
      **What:** Implement the settings hub-and-spoke index route and card grid.
      **Test first:** Enable settings hub tests before implementation.
      **Verify:** Settings hub tests pass.

- [x] **Step 97: Implement planning-profile settings route and slider form**
      **Refs:** `architecture/ui_ux/ui-ux-patterns.md`, `docs/execution/transport-contracts.md`
      **Files:** `src/routes/(app)/settings/profile/+page.server.ts` (create), `src/routes/(app)/settings/profile/+page.svelte` (create), `src/lib/components/domain/settings/ProfileSliders.svelte` (create), `tests/unit/routes/test_settings_profile.spec.ts` (create or unskip)
      **What:** Implement the planning profile spoke with primary sliders and advanced disclosure behavior.
      **Test first:** Enable profile settings tests before implementation.
      **Verify:** Profile settings tests pass.

- [x] **Step 98: Implement account settings route and danger-zone form**
      **Refs:** `architecture/ui_ux/ui-ux-patterns.md`, `docs/execution/transport-contracts.md`
      **Files:** `src/routes/(app)/settings/account/+page.server.ts` (create), `src/routes/(app)/settings/account/+page.svelte` (create), `src/lib/components/domain/settings/AccountForm.svelte` (create), `tests/unit/routes/test_settings_account.spec.ts` (create or unskip)
      **What:** Implement the account spoke with logout and delete-account affordances.
      **Test first:** Enable account settings tests before implementation.
      **Verify:** Account settings tests pass.

- [x] **Step 99: Implement data settings route server contract**
      **Refs:** `architecture/software-architecture/13-infrastructure-considerations.md`, `docs/execution/transport-contracts.md`
      **Files:** `src/routes/(app)/settings/data/+page.server.ts` (create), `tests/unit/routes/test_settings_data_server.spec.ts` (create or unskip)
      **What:** Implement the data settings loader/action contract for sync export plus async import preview/start/status.
      **Test first:** Enable data settings server tests before implementation.
      **Verify:** Data server tests pass and still reflect sync export vs async import.

- [x] **Step 100: Implement data portability settings UI**
      **Refs:** `architecture/ui_ux/ui-screen-inventory.md`, `architecture/ui_ux/ui-ux-patterns.md`
      **Files:** `src/routes/(app)/settings/data/+page.svelte` (create), `src/lib/components/domain/settings/DataPortabilityPanel.svelte` (create), `tests/unit/routes/test_settings_data_page.spec.ts` (create or unskip)
      **What:** Implement the data portability spoke UI for export, preview, start import, and poll status/result. Polling is endpoint-driven through the explicit `DAT-02` status/result transport surface and page-driven in the sense that the page owns the polling lifecycle and resume-after-reload behavior.
      **Test first:** Enable data settings page tests before implementation.
      **Verify:** Data settings page tests pass.

- [x] **Step 101: Implement audit settings route and feed UI**
      **Refs:** `architecture/ui_ux/ui-screen-inventory.md`, `architecture/ui_ux/ui-ux-patterns.md`, `docs/execution/transport-contracts.md`
      **Files:** `src/routes/(app)/settings/audit/+page.server.ts` (create), `src/routes/(app)/settings/audit/+page.svelte` (create), `src/lib/components/domain/settings/AuditFeedItem.svelte` (create), `tests/unit/routes/test_settings_audit.spec.ts` (create or unskip)
      **What:** Implement the audit spoke with read-only feed pagination, collapsed diffs, and restoration behavior.
      **Test first:** Enable audit settings tests before implementation.
      **Verify:** Audit settings tests pass.

- [x] **Step 102: Implement auth and onboarding server handlers/actions**
      **Refs:** `architecture/software-architecture/09-interaction-traceability.md`, `docs/execution/transport-contracts.md`
      **Files:** `src/routes/(auth)/**` server files (modify as needed), `src/routes/(onboarding)/**` server files (modify as needed), `tests/unit/routes/test_auth_onboarding_handlers.spec.ts` (create or unskip)
      **What:** Implement the actual auth and onboarding request handling on top of the controller layer, using the already-fixed transport contracts.
      **Test first:** Enable the auth/onboarding handler tests before implementation.
      **Verify:** Handler tests pass.

- [x] **Step 103: Implement task/aspect/milestone/recurrence API handlers**
      **Refs:** `architecture/software-architecture/09-interaction-traceability.md`, `docs/execution/transport-contracts.md`
      **Files:** `src/routes/(app)/api/aspects/**` (create), `src/routes/(app)/api/milestones/**` (create), `src/routes/(app)/api/tasks/**` (create), `src/routes/(app)/api/recurrence/**` (create), `tests/unit/routes/test_work_item_api.spec.ts` (create or unskip)
      **What:** Implement the work-item HTTP surface exactly as mapped in the interaction ledger.
      **Test first:** Enable work-item API tests before implementation.
      **Verify:** API tests pass for success and documented failure paths.

- [x] **Step 104: Implement availability/planning/execution/reminder API handlers**
      **Refs:** `architecture/software-architecture/09-interaction-traceability.md`, `docs/execution/transport-contracts.md`
      **Files:** `src/routes/(app)/api/availability/**` (create), `src/routes/(app)/api/planning/**` (create), `src/routes/(app)/api/execution/**` (create), `src/routes/(app)/api/reminders/**` (create), `tests/unit/routes/test_planning_family_api.spec.ts` (create or unskip)
      **What:** Implement the planning-family HTTP surface and preserve idempotency, cursor, and version requirements.
      **Test first:** Enable planning-family API tests before implementation.
      **Verify:** API tests pass.

- [x] **Step 105: Implement data portability and audit API handlers**
      **Refs:** `architecture/software-architecture/09-interaction-traceability.md`, `architecture/software-architecture/13-infrastructure-considerations.md`, `docs/execution/transport-contracts.md`
      **Files:** `src/routes/(app)/api/data/**` (create), `src/routes/(app)/api/audit/**` (create), `tests/unit/routes/test_data_audit_api.spec.ts` (create or unskip)
      **What:** Implement `DAT-01`, `DAT-02`, and audit APIs, including explicit preview/start/status/result surfaces for import.
      **Test first:** Enable data/audit API tests before implementation.
      **Verify:** Data/audit API tests pass.

- [x] **Step 106: Implement `SessionExpiryJob` and worker bootstrap**
      **Refs:** `architecture/software-architecture/04-controllers-and-jobs.md`, `architecture/software-architecture/13-infrastructure-considerations.md`
      **Files:** `src/lib/server/jobs/session-expiry-job.ts` (create), `src/lib/server/jobs/worker.ts` (create), `tests/unit/services/test_session_expiry_job.ts` (create or unskip)
      **What:** Implement the session-expiry job and the initial worker registration skeleton.
      **Test first:** Enable session-expiry job tests before implementation.
      **Verify:** Job tests pass and worker bootstrap can register the job.

- [x] **Step 107: Implement planning and health jobs**
      **Refs:** `architecture/software-architecture/04-controllers-and-jobs.md`, `architecture/software-architecture/13-infrastructure-considerations.md`
      **Files:** `src/lib/server/jobs/day-boundary-replan-job.ts` (create), `src/lib/server/jobs/health-job.ts` (create), `tests/unit/services/test_planning_health_jobs.ts` (create or unskip)
      **What:** Implement the day-boundary replan and health recomputation jobs.
      **Test first:** Enable planning/health job tests before implementation.
      **Verify:** Job tests pass.

- [x] **Step 108: Implement reminder jobs and task completion hook**
      **Refs:** `architecture/software-architecture/04-controllers-and-jobs.md`, `architecture/software-architecture/10-sequence-failure-mapping.md`
      **Files:** `src/lib/server/jobs/reminder-dispatch-job.ts` (create), `src/lib/server/jobs/reminder-retry-job.ts` (create), `src/lib/server/jobs/task-completion-hook.ts` (create), `tests/unit/services/test_reminder_and_completion_jobs.ts` (create or unskip)
      **What:** Implement due dispatch, retry processing, and task-completion recurrence generation hook jobs.
      **Test first:** Enable reminder/completion job tests before implementation.
      **Verify:** Job tests pass.

- [x] **Step 109: Implement import workflow job and job-idempotent wrapping**
      **Refs:** `architecture/software-architecture/04-controllers-and-jobs.md`, `architecture/software-architecture/13-infrastructure-considerations.md`
      **Files:** `src/lib/server/jobs/import-user-data-job.ts` (create), `src/lib/server/jobs/index.ts` (modify), `tests/unit/services/test_import_job.ts` (create or unskip)
      **What:** Implement the async import workflow entry point and ensure it uses the job idempotency wrapper and updates `ImportJob` correctly.
      **Test first:** Enable import job tests before implementation.
      **Verify:** Import job tests pass.

- [x] **Step 110: Run a focused repository integration gap pass**
      **Refs:** `.claude/skills/qa/references/validation.md`, `architecture/software-architecture/08-invariant-enforcement-matrix.md`
      **Files:** `tests/integration/repositories/*.ts` (modify as needed), `docs/execution/invariant-coverage.md` (modify)
      **What:** Close any still-missing repository integration coverage and update the invariant ledger accordingly.
      **Test first:** Add the missing repository tests before production fixes.
      **Verify:** No repository-level `Missing test` rows remain.

- [x] **Step 111: Run a focused service and controller failure-matrix gap pass**
      **Refs:** `.claude/skills/qa/references/testing-patterns.md`, `architecture/software-architecture/10-sequence-failure-mapping.md`
      **Files:** `tests/unit/services/*.ts` (modify as needed), `tests/unit/controllers/*.ts` (modify as needed), `docs/execution/invariant-coverage.md` (modify)
      **What:** Close any remaining service/controller gaps for alt paths and non-raising branches.
      **Test first:** Add the missing tests before production fixes.
      **Verify:** No service/controller `Missing test` or `False confidence` rows remain.

- [x] **Step 112: Run the mechanical architecture-compliance audit**
      **Refs:** `.claude/skills/qa/references/validation.md`, `architecture/software-architecture/01-overview-and-cross-cutting.md`
      **Files:** `docs/execution/architecture-compliance.md` (modify)
      **What:** Scan imports and layering for models, repositories, services, controllers, routes, stores, and factory code. Record every violation and fix until the dependency graph is clean.
      **Verify:** `docs/execution/architecture-compliance.md` records a clean pass.

- [x] **Step 113: Run the UI acceptance gap pass**
      **Refs:** `architecture/ui_ux/ui-screen-inventory.md`, `architecture/ui_ux/ui-ux-patterns.md`, `architecture/ui_ux/ui-wireframes.md`, `DESIGN_SYSTEM.md`
      **Files:** `src/lib/__tests__/components/**` (modify as needed), `src/lib/__tests__/routes/**` (modify as needed), `docs/execution/ui-acceptance-map.md` (modify)
      **What:** Close any remaining UI acceptance gaps, especially keyboard behavior, empty/loading states, responsive transitions, and scroll restoration.
      **Test first:** Add the missing UI tests before production fixes.
      **Verify:** No unchecked UI acceptance rows remain.

- [x] **Step 114: Add end-to-end test for auth and onboarding**
      **Refs:** `architecture/ui_ux/ui-screen-inventory.md`, `architecture/software-architecture/09-interaction-traceability.md`
      **Files:** `tests/e2e/auth-onboarding.spec.ts` (create), `playwright.config.ts` (modify if needed)
      **What:** Add E2E coverage for sign-in, callback, and onboarding completion.
      **Test first:** Write the E2E spec before last-mile fixes.
      **Verify:** Auth/onboarding E2E passes.

- [x] **Step 115: Add end-to-end test for aspects, tasks, and planning**
      **Refs:** `architecture/ui_ux/ui-screen-inventory.md`, `architecture/software-architecture/09-interaction-traceability.md`
      **Files:** `tests/e2e/aspects-tasks-planning.spec.ts` (create)
      **What:** Add E2E coverage for aspect creation, task lifecycle, and planning flows.
      **Test first:** Write the E2E spec before last-mile fixes.
      **Verify:** This E2E spec passes.

- [x] **Step 116: Add end-to-end test for availability and reminders**
      **Refs:** `architecture/ui_ux/ui-screen-inventory.md`, `architecture/software-architecture/09-interaction-traceability.md`
      **Files:** `tests/e2e/availability-reminders.spec.ts` (create)
      **What:** Add E2E coverage for availability editing and reminder creation/snooze behavior.
      **Test first:** Write the E2E spec before last-mile fixes.
      **Verify:** This E2E spec passes.

- [x] **Step 117: Add end-to-end test for data portability and audit**
      **Refs:** `architecture/software-architecture/13-infrastructure-considerations.md`, `architecture/ui_ux/ui-screen-inventory.md`
      **Files:** `tests/e2e/data-audit.spec.ts` (create)
      **What:** Add E2E coverage for synchronous export, async import polling/resume, and audit feed browsing.
      **Test first:** Write the E2E spec before last-mile fixes.
      **Verify:** This E2E spec passes.

- [x] **Step 117b: Add end-to-end mobile parity test for task drill-down**
      **Refs:** `architecture/ui_ux/ui-ux-patterns.md`, `architecture/ui_ux/ui-wireframes.md`
      **Files:** `tests/e2e/tasks-mobile-drilldown.spec.ts` (create)
      **What:** Add a mobile-viewport E2E test proving `/(app)/tasks` and `/(app)/tasks/[id]` preserve the documented drill-down parity and back-navigation behavior.
      **Test first:** Write the mobile E2E spec before any parity fixes.
      **Verify:** This mobile drill-down E2E spec passes.

- [x] **Step 118: Add deterministic seed data and local diagnostics**
      **Refs:** `architecture/ui_ux/ui-screen-inventory.md`, `architecture/software-architecture/13-infrastructure-considerations.md`
      **Files:** `scripts/seed.ts` (create), `src/lib/server/db/seeds/*` (create), `README.md` (modify)
      **What:** Add deterministic seed data that exercises every major screen and workflow.
      **Test first:** Add seed smoke checks before implementation.
      **Verify:** Seed script succeeds and all major routes render seeded data.

- [x] **Step 119: Finalize runtime docs, error boundary, and release scripts**
      **Refs:** `architecture/software-architecture/13-infrastructure-considerations.md`, `DESIGN_SYSTEM.md`
      **Files:** `README.md` (modify), `package.json` (modify if needed), `src/routes/+layout.svelte` (modify if needed), `src/routes/+error.svelte` (create)
      **What:** Finalize runtime documentation, error boundaries, and any last required scripts for local/prod-like operation.
      **Test first:** Add doc/script smoke checks before final tweaks where practical.
      **Verify:** `pnpm check`, `pnpm build`, and runtime smoke checks pass.

- [x] **Step 120: Finalize ledgers and full release verification**
      **Refs:** `.claude/skills/qa/references/validation.md`, `architecture/software-architecture/13-infrastructure-considerations.md`, `DESIGN_SYSTEM.md`
      **Files:** `docs/execution/invariant-coverage.md` (finalize), `docs/execution/interaction-route-map.md` (finalize), `docs/execution/transport-contracts.md` (finalize), `docs/execution/ui-acceptance-map.md` (finalize), `docs/execution/architecture-compliance.md` (finalize)
      **What:** Produce the final verification package so an independent reviewer can audit fidelity from docs to code to tests to runtime behavior.
      **Verify:** `pnpm check`, `pnpm test`, `pnpm build`, and the E2E suite all pass; all execution ledgers show no unresolved gaps.

## Tests

- Step 2 is mandatory and comes before runtime or feature implementation so the executor starts from failing spec tests instead of invented behavior.
- Repository tests are integration tests against real Postgres. Service and controller tests are unit tests with shared hand-rolled fakes. Do not write service/controller integration tests unless the architecture explicitly requires it.
- Every invariant in `architecture/software-architecture/08-invariant-enforcement-matrix.md` must map to implementation and at least one test entry in `docs/execution/invariant-coverage.md`.
- Every documented failure path in `architecture/software-architecture/10-sequence-failure-mapping.md` must have at least one representative test at the layer that owns the failure.
- Every route and screen in `architecture/ui_ux/ui-screen-inventory.md` must have acceptance rows in `docs/execution/ui-acceptance-map.md`, including loading, empty, loaded, error, keyboard, and responsive behavior.
- Every test must follow the QA rules: no mocks, one assertion, behavior-focused naming, and shared fakes implementing the full contract.

## Verification

- The ledgers in `docs/execution/` provide a complete trace from source docs -> implementation surface -> tests -> verification status.
- A fresh user can sign in, complete onboarding, and land on the dashboard with the exact route and UI behavior defined by the docs.
- The user can create and manage aspects, milestones, tasks, recurrence, reminders, availability, and planning cycles with the documented state transitions and failure paths.
- The app can export data synchronously, start async import jobs with preview and polling, and browse the audit feed.
- Worker jobs run through Hatchet-backed flows for session expiry, planning replan, health computation, reminder dispatch/retry, recurrence materialization, and import execution.
- Final QA audits show no unresolved invariant coverage gaps, interaction mapping gaps, or UI acceptance gaps.
