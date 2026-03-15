# Blueprint: Remaining Compliance Remediation

## Executor Instructions

You are executing this blueprint. Follow these rules:

1. Read this file at the start of every loop.
2. Copy the next unchecked step into your scratchpad before changing code.
3. Do one step at a time. Do not merge adjacent steps unless this file explicitly says to.
4. Verify the step with the listed command before checking it off.
5. After a passing verification, update this file from `- [ ]` to `- [x]` and commit with `git add -A && git commit -m "blueprint: <step title>"`.
6. If a step turns out to need another prerequisite, add that prerequisite as a new unchecked step immediately above it.
7. Follow the existing patterns named in each step. Do not invent new structure when the plan points to an existing file.
8. For tests, follow the QA rules: no mocking libraries, hand-rolled fakes only, one behaviour per test, behaviour over implementation.
9. Authentication/session work and pure JSON API parity are deferred; do not expand scope into those areas.

## Context

This plan covers the remaining implementation work after two explicit deferrals: auth/session work and full JSON API route parity. The intended transport for this iteration is server loaders and form actions, following the pattern already implemented for tasks in `src/routes/(app)/tasks/task-server.ts`. The current codebase already has the domain layer, repository layer, service layer, controllers, and most routed screens, but many of them are placeholders or only partially enforce the documented invariants.

The core gaps are concentrated in four places. First, several domain services do not enforce the lifecycle and cascade rules described in `architecture/domain/invariants.md` and the sequence diagrams. Second, the unit-test suite is mostly scaffolding with skipped tests, so there is very little compliance evidence. Third, several loader-backed screens are still fed by placeholder `+page.server.ts` files that return empty data. Fourth, the UI routes often have the right shape but are missing the concrete behaviours described by the UX specs.

Use this precedence order when a spec conflict appears during execution: `architecture/domain/invariants.md` and `architecture/domain/interaction-matrix.md` first, `architecture/sequence-diagrams/**` second, `architecture/software-architecture/08-invariant-enforcement-matrix.md` and `09-interaction-traceability.md` third, `architecture/ui_ux/ui-screen-inventory.md` for route existence, and `DESIGN_SYSTEM.md` for visual rules only.

## Scope

**In scope:**

- Domain/service/repository compliance outside auth.
- Loader/action transport for plan, aspects, profile, availability, data, and audit screens.
- Missing unit tests and end-to-end verification for the in-scope features.
- UI work for dashboard, plan, aspects, tasks, profile, availability, data, audit, and plan history.
- Compliance docs so they reflect the actual implemented state.

**Out of scope:**

- Auth/session/OIDC/callback implementation.
- Replacing loaders/actions with JSON APIs.
- Resolving every contradiction in the spec set.
- New infrastructure beyond what is already in the repo.

## Architecture Decisions

- Use `src/routes/(app)/tasks/task-server.ts` as the transport pattern for new loader/action work: parse form data in one file, call controllers from `AppFactory.create(db)`, normalize values, redirect/fail cleanly.
- Use `src/lib/server/factory/app-factory.ts` as the only composition root. Missing dependencies should be injected there, not imported concretely inside services.
- Use the existing service classes as the implementation home for business rules: `AspectService`, `MilestoneService`, `TaskService`, `RecurrenceService`, `PlanningService`, `ReminderService`, `DataPortabilityService`, and `HealthComputationService`.
- Keep UI work on top of existing routed screens and components. Do not invent new route families; extend the current files under `src/routes/(app)/**` and `src/lib/components/domain/**`.

## Interfaces and Models

- The public method names already in the services and controllers stay in place unless a step explicitly says to extend a contract.
- New test helpers should live in `tests/fakes/` rather than being duplicated in test files.
- New loader/action helpers should stay next to the route they support, following the `task-server.ts` pattern.

## Plan

- [ ] **Step 1: Add shared unit-test builders for domain records**
      **Files:** `tests/fakes/builders.ts` (create)
      **What:** Create builder functions for the raw records currently seeded inline in tests and fake repositories. Add builders for at least aspect, milestone, task, planning profile, recurring series aggregate, reminder aggregate, planning cycle aggregate, and audit event records. Each builder should accept a partial override object and fill the rest with stable defaults so later test steps can construct inputs without repeating literals.
      **Pattern:** Follow the simple plain-object style already used by `FakeAspectRepository.seed` and `FakeTaskRepository.seed` in `tests/fakes/repositories.ts`.
      **Verify:** `pnpm exec prettier --check tests/fakes/builders.ts`

- [ ] **Step 2: Extend fake repositories for aspect and milestone cascade testing**
      **Files:** `tests/fakes/repositories.ts` (modify)
      **What:** Add explicit inspection state needed by the aspect/milestone tests: arrays or counters for `archive`/`restore` calls, helpers to list milestones by `aspectId`, helpers to list tasks by `milestoneId`, and helpers to inspect whether descendant archive/restore paths were invoked. Keep the existing fake class names unchanged.
      **Pattern:** Follow the existing `seed()` + `getAll()` test-helper pattern already used in `FakeAspectRepository`, `FakeTaskRepository`, and `FakeMilestoneRepository`.
      **Verify:** `pnpm exec vitest run tests/unit/services/aspect-service.test.ts --runInBand`

- [ ] **Step 3: Replace the skipped aspect service tests with real coverage**
      **Files:** `tests/unit/services/aspect-service.test.ts` (modify)
      **What:** Replace all skipped placeholders with real tests for `createAspect`, `activateAspect`, `archiveAspect`, and `restoreAspect`. Cover these exact behaviours: aspect archive invokes descendant cleanup, aspect restore returns the aspect to draft, and create/activate still emit audit. Use the builders from `tests/fakes/builders.ts` and the enhanced fake repositories from `tests/fakes/repositories.ts`.
      **Pattern:** Follow the `describe` block layout already present in `tests/unit/services/task-service.test.ts`, but make every test executable.
      **Verify:** `pnpm exec vitest run tests/unit/services/aspect-service.test.ts`

- [ ] **Step 4: Implement aspect cascade behaviour in the service layer**
      **Files:** `src/lib/server/services/aspect-service.ts` (modify), `src/lib/server/factory/app-factory.ts` (modify only if constructor dependencies must change)
      **What:** Update `AspectService.archiveAspect` and `AspectService.restoreAspect` so they orchestrate the descendant work expected by the new tests instead of only mutating the aspect row. Keep the orchestration inside `AspectService`; do not move cascade logic into repositories or routes. If the service needs additional injected collaborators beyond the current constructor, add them through `AppFactory`.
      **Pattern:** Follow the constructor-injected orchestration style already used in `TaskService.completeTask` in `src/lib/server/services/task-service.ts`.
      **Verify:** `pnpm exec vitest run tests/unit/services/aspect-service.test.ts`

- [ ] **Step 5: Replace the skipped milestone service tests with real coverage**
      **Files:** `tests/unit/services/milestone-service.test.ts` (create)
      **What:** Add executable tests for `createMilestone`, `completeMilestone`, `archiveMilestone`, and `restoreMilestone`. Cover these exact behaviours: creation rejects an aspect that is not owned by the user, completion requires child tasks to be done, archive cascades to child tasks, and restore returns the milestone to open. Use the fake repositories already in `tests/fakes/repositories.ts`.
      **Pattern:** Match the style used in `tests/unit/services/task-service.test.ts`: one `describe` per public method and one behaviour per test.
      **Verify:** `pnpm exec vitest run tests/unit/services/milestone-service.test.ts`

- [ ] **Step 6: Implement milestone completion and cascade rules**
      **Files:** `src/lib/server/services/milestone-service.ts` (modify), `src/lib/server/factory/app-factory.ts` (modify if constructor dependencies change)
      **What:** Update `MilestoneService` so `completeMilestone` checks child-task state before saving, `archiveMilestone` cascades to child tasks, and `restoreMilestone` restores to open consistently. Keep `loadOwnedMilestone()` as the ownership gate and add any additional repository lookups through injected collaborators rather than local imports.
      **Pattern:** Keep the public methods in `MilestoneService` thin and shaped like the existing `updateMilestone` method: load -> validate -> save -> audit.
      **Verify:** `pnpm exec vitest run tests/unit/services/milestone-service.test.ts`

- [ ] **Step 7: Expand fake repositories for task lifecycle testing**
      **Files:** `tests/fakes/repositories.ts` (modify)
      **What:** Add explicit inspection state for task lifecycle side effects: record which task IDs were passed to `cancelFutureAllocations`, which task IDs were passed to `cancelPendingReminders`, and expose the most recent saved task per ID. Add a fake planning-profile lookup helper if the task tests need profile defaults.
      **Pattern:** Stay inside the existing fake class definitions; do not split them into multiple files.
      **Verify:** `pnpm exec vitest run tests/unit/services/task-service.test.ts --runInBand`

- [ ] **Step 8: Replace the skipped task service tests with real coverage**
      **Files:** `tests/unit/services/task-service.test.ts` (modify)
      **What:** Replace the skipped tests with executable coverage for `createTask`, `startTask`, `completeTask`, `reopenTask`, `moveTaskMilestone`, `archiveTask`, and `bulkMutateTasks`. Add concrete tests for the current audit findings: profile-derived default effort, reopen cancels future allocations, archive cancels reminders and allocations, and move rejects a milestone in a different aspect.
      **Pattern:** Reuse the existing file structure and create helper setup functions at the top of the file instead of repeating fixture construction in every test.
      **Verify:** `pnpm exec vitest run tests/unit/services/task-service.test.ts`

- [ ] **Step 9: Implement task lifecycle fixes and profile-derived defaults**
      **Files:** `src/lib/server/services/task-service.ts` (modify), `src/lib/server/factory/app-factory.ts` (modify if constructor dependencies change)
      **What:** Update `TaskService.createTask` to derive the default effort from the user planning profile instead of the hard-coded `30`. Update `reopenTask`, `archiveTask`, and `restoreTask` so they perform the side effects required by the new tests. Keep `moveTaskMilestone` as the method that validates cross-aspect milestone moves.
      **Pattern:** Follow the service structure already present in `TaskService.completeTask`: save first when appropriate, then run side effects through the repository abstractions.
      **Verify:** `pnpm exec vitest run tests/unit/services/task-service.test.ts`

- [ ] **Step 10: Create explicit recurrence service tests**
      **Files:** `tests/unit/services/recurrence-service.test.ts` (create)
      **What:** Add tests for the four public recurrence methods already in `RecurrenceService`: `upsertSeries`, `pauseOrResumeSeries`, `skipOrMoveNextOccurrence`, and `closeSeries`. Cover these exact behaviours: creation delegates first-instance creation correctly, pause and resume update state consistently, skip/move appends an exception with the expected action, and close is terminal.
      **Pattern:** Model the file after `tests/unit/services/task-service.test.ts`, one `describe` block per method.
      **Verify:** `pnpm exec vitest run tests/unit/services/recurrence-service.test.ts`

- [ ] **Step 11: Create explicit recurrence materializer tests**
      **Files:** `tests/unit/services/recurrence-materializer.test.ts` (create)
      **What:** Add direct tests for `RecurrenceMaterializer.generateNextInstance`. Cover at least daily, weekly, and monthly rule handling, overdue suppression, and exception-aware next-date selection. Use fake recurring-series and fake task data built from `tests/fakes/builders.ts`.
      **Pattern:** Follow the small, pure-behaviour style used in the model tests under `tests/unit/models/**`.
      **Verify:** `pnpm exec vitest run tests/unit/services/recurrence-materializer.test.ts`

- [ ] **Step 12: Implement recurrence service state fixes**
      **Files:** `src/lib/server/services/recurrence-service.ts` (modify), `src/lib/server/factory/app-factory.ts` (modify if constructor dependencies change)
      **What:** Update `RecurrenceService` so the state transitions exercised by the new tests pass. In particular, stop hard-coding the first task creation inline if the materializer path should own that work, keep pause/resume consistent with rule state, and make close stay terminal. Do not add route logic here.
      **Pattern:** Preserve the existing `loadOwnedAggregate()` ownership gate and the public method names already in the file.
      **Verify:** `pnpm exec vitest run tests/unit/services/recurrence-service.test.ts`

- [ ] **Step 13: Implement recurrence materializer date logic**
      **Files:** `src/lib/server/services/internal/recurrence-materializer.ts` (modify)
      **What:** Update `generateNextInstance` so it passes the new daily/weekly/monthly, exception, and overdue-suppression tests. Keep all date-derivation logic in this file rather than moving it into `RecurrenceService`.
      **Pattern:** Follow the existing responsibility split between `RecurrenceService` and `RecurrenceMaterializer` in the current codebase.
      **Verify:** `pnpm exec vitest run tests/unit/services/recurrence-materializer.test.ts tests/unit/services/recurrence-service.test.ts`

- [ ] **Step 14: Add planning-service tests for generation and confirmation**
      **Files:** `tests/unit/services/planning-service.test.ts` (modify)
      **What:** Replace the skipped `generateDraftPlan` and `confirmDraftPlan` tests with real tests for these exact behaviours: active aspect targets must total 100, generation creates the first cycle/revision, scheduler output is persisted into the cycle aggregate, and confirmation only accepts a draft cycle.
      **Pattern:** Keep the existing `describe('PlanningService.generateDraftPlan')` and `describe('PlanningService.confirmDraftPlan')` sections and turn them into executable tests instead of renaming the whole file.
      **Verify:** `pnpm exec vitest run tests/unit/services/planning-service.test.ts`

- [ ] **Step 15: Add scheduler-engine tests for ordering and placement**
      **Files:** `tests/unit/services/scheduler-engine.test.ts` (create)
      **What:** Add direct tests for `SchedulerEngine.buildWeeklySchedule` that lock down the desired placement contract before you change the engine. Cover deterministic ordering, availability-window placement, min-chunk handling, and split-task handling. Use plain task/window/profile inputs rather than spinning up `PlanningService`.
      **Pattern:** Treat this like a pure-logic test file, similar in spirit to `tests/unit/infra/cursor-codec.test.ts`.
      **Verify:** `pnpm exec vitest run tests/unit/services/scheduler-engine.test.ts`

- [ ] **Step 16: Inject target validation into planning generation**
      **Files:** `src/lib/server/factory/app-factory.ts` (modify), `src/lib/server/services/planning-service.ts` (modify)
      **What:** Add `AspectTargetValidator` to the `PlanningService` constructor wiring in `AppFactory`, then use it inside `generateDraftPlan` before scheduler execution. Keep the target-total check at the service layer, not in loaders.
      **Pattern:** Follow the getter-and-inject pattern already used in `AppFactory` for `windowResolver`, `schedulerEngine`, and `auditEmitter`.
      **Verify:** `pnpm exec vitest run tests/unit/services/planning-service.test.ts`

- [ ] **Step 17: Fix planning cycle week-end and confirmation semantics**
      **Files:** `src/lib/server/services/planning-service.ts` (modify)
      **What:** Correct `computeWeekEnd()` so the generated week end matches the intended ISO Sunday boundary. Keep `confirmDraftPlan()` limited to draft cycles and make the saved result shape continue matching the controller usage.
      **Pattern:** Make the smallest possible change inside `PlanningService`; do not restructure the class.
      **Verify:** `pnpm exec vitest run tests/unit/services/planning-service.test.ts`

- [ ] **Step 18: Implement scheduler placement fixes**
      **Files:** `src/lib/server/services/internal/scheduler-engine.ts` (modify), `src/lib/server/services/internal/scoring.ts` (modify)
      **What:** Update the scheduler and its scoring helper so the placement tests from Step 15 pass. Keep score calculation in `scoring.ts` and placement in `scheduler-engine.ts`; do not collapse them into one file.
      **Pattern:** Follow the current split between `buildWeeklySchedule()` and the scoring helper rather than introducing a new scheduler abstraction.
      **Verify:** `pnpm exec vitest run tests/unit/services/scheduler-engine.test.ts tests/unit/services/planning-service.test.ts`

- [ ] **Step 19: Implement planning edit and day-boundary replan behaviour**
      **Files:** `src/lib/server/services/planning-service.ts` (modify)
      **What:** Update `editPlan()` and `replanActiveCycles()` so the existing skipped test sections can be turned into passing behaviour. Keep manual edit handling in `editPlan()` and make `replanActiveCycles()` perform real work instead of returning a stub summary.
      **Pattern:** Use the same aggregate-load -> derive -> repository-save flow already used earlier in `PlanningService`.
      **Verify:** `pnpm exec vitest run tests/unit/services/planning-service.test.ts`

- [ ] **Step 20: Create reminder and health unit tests**
      **Files:** `tests/unit/services/reminder-service.test.ts` (create), `tests/unit/services/reminder-dispatch-service.test.ts` (create), `tests/unit/services/health-computation-service.test.ts` (create)
      **What:** Add executable tests for `ReminderService`, `ReminderDispatchService`, and `HealthComputationService`. Cover task validation on reminder upsert, snooze-limit enforcement, retry/backoff scheduling, terminal failure, and health-score persistence through the planning-cycle repository.
      **Pattern:** Reuse the same fake repositories file and the same `describe` grouping used in the other service tests.
      **Verify:** `pnpm exec vitest run tests/unit/services/reminder-service.test.ts tests/unit/services/reminder-dispatch-service.test.ts tests/unit/services/health-computation-service.test.ts`

- [ ] **Step 21: Implement reminder validation, retry policy, and health persistence**
      **Files:** `src/lib/server/services/reminder-service.ts` (modify), `src/lib/server/services/internal/reminder-dispatch-service.ts` (modify), `src/lib/server/services/internal/health-computation-service.ts` (modify), `src/lib/server/factory/app-factory.ts` (modify if constructor dependencies change), `src/lib/server/config/reminder-policy.ts` (modify if needed)
      **What:** Make the reminder and health services pass the tests from Step 20. `ReminderService` should validate against the task repository, `ReminderDispatchService` should centralize its retry timing in `reminder-policy.ts`, and `HealthComputationService` should persist the computed scores instead of only returning them.
      **Pattern:** Follow the existing constructor-injected service style and keep retry constants in `src/lib/server/config/reminder-policy.ts`.
      **Verify:** `pnpm exec vitest run tests/unit/services/reminder-service.test.ts tests/unit/services/reminder-dispatch-service.test.ts tests/unit/services/health-computation-service.test.ts`

- [ ] **Step 22: Create data-portability and erasure unit tests**
      **Files:** `tests/unit/services/data-portability-service.test.ts` (create), `tests/unit/services/account-erasure-service.test.ts` (create)
      **What:** Add tests for export shape, import-job lifecycle, remap failure handling, and delete cascade coverage. Keep auth/session semantics out of scope, but do cover the owned records that this iteration still expects to be removed or exported.
      **Pattern:** Use the fake repositories in `tests/fakes/repositories.ts` and the builder helpers from `tests/fakes/builders.ts`.
      **Verify:** `pnpm exec vitest run tests/unit/services/data-portability-service.test.ts tests/unit/services/account-erasure-service.test.ts`

- [ ] **Step 23: Implement data portability and erasure fixes**
      **Files:** `src/lib/server/services/data-portability-service.ts` (modify), `src/lib/server/services/internal/import-remap-service.ts` (modify if needed), `src/lib/server/services/internal/account-erasure-service.ts` (modify), `src/lib/server/factory/app-factory.ts` (modify if constructor dependencies change)
      **What:** Expand export/import and account-erasure behaviour so the tests from Step 22 pass. Keep remap logic in `ImportRemapService`, orchestration in `DataPortabilityService`, and deletion ordering in `AccountErasureService`.
      **Pattern:** Match the current separation already present between these three files.
      **Verify:** `pnpm exec vitest run tests/unit/services/data-portability-service.test.ts tests/unit/services/account-erasure-service.test.ts`

- [ ] **Step 24: Add an audit-coverage regression test for in-scope services**
      **Files:** `tests/unit/services/audit-coverage.test.ts` (create), `tests/fakes/services.ts` (modify if extra emitter inspection is needed)
      **What:** Create one focused regression test file that proves the key in-scope mutation services emit audit events on success. Cover at least `AspectService`, `MilestoneService`, `TaskService`, `PlanningService`, `ReminderService`, and `DataPortabilityService`.
      **Pattern:** Use `FakeAuditEmitter` from `tests/fakes/services.ts` instead of spying on methods.
      **Verify:** `pnpm exec vitest run tests/unit/services/audit-coverage.test.ts`

- [ ] **Step 25: Standardize audit emission in mutation services**
      **Files:** `src/lib/server/services/task-service.ts` (modify), `src/lib/server/services/planning-service.ts` (modify), `src/lib/server/services/availability-service.ts` (modify), `src/lib/server/services/reminder-service.ts` (modify), `src/lib/server/services/data-portability-service.ts` (modify)
      **What:** Add or normalize successful-mutation audit emission so the regression tests from Step 24 pass. Keep the service methods returning the same shapes they return today.
      **Pattern:** Copy the existing `auditEmitter.emit({...})` call shape already used in `AspectService` and `MilestoneService`.
      **Verify:** `pnpm exec vitest run tests/unit/services/audit-coverage.test.ts`

- [ ] **Step 26: Replace the placeholder plan loader with real cycle data**
      **Files:** `src/routes/(app)/plan/+page.server.ts` (modify)
      **What:** Replace the hard-coded empty return object with a real loader that reads the current user from `event.locals.principal`, gets a factory via `AppFactory.create(db)`, queries planning data through the controller/service layer, and maps it into the existing `PageData` shape consumed by `src/routes/(app)/plan/+page.svelte`. Keep the output keys `weekStart`, `allocations`, `availability`, and `status` so the page does not need a full prop redesign.
      **Pattern:** Follow the load-and-normalize style used in `loadTaskWorkspace()` inside `src/routes/(app)/tasks/task-server.ts`.
      **Verify:** `pnpm check`

- [ ] **Step 27: Add plan actions for generate, confirm, and edit**
      **Files:** `src/routes/(app)/plan/+page.server.ts` (modify)
      **What:** Add `actions` to the same file for the plan mutations this iteration supports: generate draft, confirm draft, and submit a simple edit payload. Parse `FormData` in the same style as the task workspace, call the controller methods through `AppFactory`, and redirect back to `/plan` on success.
      **Pattern:** Copy the action structure from `taskActions` in `src/routes/(app)/tasks/task-server.ts`.
      **Verify:** `pnpm check`

- [ ] **Step 28: Update the plan page UI to consume the real loader/action data**
      **Files:** `src/routes/(app)/plan/+page.svelte` (modify), `src/lib/components/domain/plan/PlanHeader.svelte` (modify if needed), `src/lib/components/domain/plan/TimelineGrid.svelte` (modify if needed), `src/lib/components/domain/plan/AllocationPopover.svelte` (modify if needed)
      **What:** Keep the existing route and component structure, but wire the page to the new loader/action data from Steps 26 and 27. Add the concrete action buttons needed to trigger generate/confirm/edit from the page rather than leaving the buttons inert.
      **Pattern:** Preserve `PageHeader -> PlanHeader -> TimelineGrid` as the page structure already established in `src/routes/(app)/plan/+page.svelte`.
      **Verify:** `pnpm check && pnpm exec playwright test tests/e2e/aspects-tasks-planning.spec.ts`

- [ ] **Step 29: Replace the placeholder plan-history loader with real revision data**
      **Files:** `src/routes/(app)/plan/history/+page.server.ts` (modify)
      **What:** Replace the empty `revisions` array with a real loader that queries plan history through the controller/service stack and maps the returned revision snapshots into the existing page shape. Keep the output keys `id`, `timestamp`, `action`, `summary`, and `author` so `RevisionFeedItem` continues to work.
      **Pattern:** Follow the same route-loader style as Step 26 and keep the data mapping local to this file.
      **Verify:** `pnpm check`

- [ ] **Step 30: Replace the placeholder aspect-detail loader and add URL-synced tab selection**
      **Files:** `src/routes/(app)/aspects/[id]/+page.server.ts` (modify), `src/routes/(app)/aspects/[id]/+page.svelte` (modify)
      **What:** Replace the placeholder server load with real aspect, milestone, and task data fetched through the action/loader stack. Add a `tab` query-param contract with the exact allowed values `overview`, `milestones`, and `tasks`, and have the page respect that value when choosing the active tab.
      **Pattern:** Use `src/routes/(app)/tasks/task-server.ts` as the server pattern and keep the current three-tab page structure already present in `+page.svelte`.
      **Verify:** `pnpm check`

- [ ] **Step 31: Upgrade aspect card and overview content without changing the route model**
      **Files:** `src/lib/components/domain/aspects/AspectCard.svelte` (modify), `src/lib/components/domain/aspects/AspectOverviewTab.svelte` (modify)
      **What:** Expand the data shown in the existing aspect card and overview tab so the page can display the extra progress/health/detail information returned by Step 30. Keep both files as presentational components only; do not fetch inside them.
      **Pattern:** Preserve the current prop-driven structure of both components and keep the link in `AspectCard` pointing at `/aspects/{id}`.
      **Verify:** `pnpm check`

- [ ] **Step 32: Wire the existing bulk-action toolbar into the task workspace**
      **Files:** `src/routes/(app)/tasks/+page.svelte` (modify), `src/lib/components/domain/tasks/BulkActionToolbar.svelte` (modify only if the current props are insufficient)
      **What:** Add selection state to the task workspace page, render `BulkActionToolbar` when one or more items are selected, and connect the toolbar buttons to real form submissions or navigation hooks. Keep the current `TaskList`/`TaskDetail` master-detail layout in place.
      **Pattern:** Reuse the current `currentReturnTo` and query-param helpers already defined in `src/routes/(app)/tasks/+page.svelte`.
      **Verify:** `pnpm check && pnpm exec playwright test tests/e2e/tasks-mobile-drilldown.spec.ts`

- [ ] **Step 33: Expand task composer and task detail to match the implemented server behaviour**
      **Files:** `src/lib/components/domain/tasks/TaskComposerDialog.svelte` (modify), `src/lib/components/domain/tasks/TaskDetail.svelte` (modify)
      **What:** Add only the fields and affordances that the current server layer can truly support after the earlier backend steps: milestone selection if available, recurrence/reminder sections if the data now exists, and any missing lifecycle affordances already backed by the task service. Do not add controls for server behaviour that still does not exist.
      **Pattern:** Follow the existing progressive-disclosure form structure in `TaskComposerDialog.svelte` and the read/write detail-pane layout in `TaskDetail.svelte`.
      **Verify:** `pnpm check && pnpm exec playwright test tests/e2e/aspects-tasks-planning.spec.ts tests/e2e/tasks-mobile-drilldown.spec.ts`

- [ ] **Step 34: Replace the placeholder profile loader with real planning-profile data**
      **Files:** `src/routes/(app)/settings/profile/+page.server.ts` (modify)
      **What:** Replace the stubbed `aspectWeights` and threshold values with a real load from the planning-profile service/controller. Keep the route-local `PageData` shape if possible, but populate it from the actual planning profile rather than a static object.
      **Pattern:** Follow the same `AppFactory.create(db)` loader style used in the task workspace.
      **Verify:** `pnpm check`

- [ ] **Step 35: Rework the profile UI around the actual planning-profile fields**
      **Files:** `src/routes/(app)/settings/profile/+page.svelte` (modify), `src/lib/components/domain/settings/ProfileSliders.svelte` (modify)
      **What:** Keep the existing route and component pair, but replace the current aspect-weight UI with controls for the actual planning-profile fields in the backend model: urgency, importance, balance, effort-fit, urgent-threshold days, min-chunk minutes, and default-effort minutes. Keep the component prop-driven; do not fetch from inside `ProfileSliders.svelte`.
      **Pattern:** Reuse `PageHeader`, `Stack`, `Button`, and `Input` rather than adding new primitives.
      **Verify:** `pnpm check`

- [ ] **Step 36: Replace the placeholder availability loader and add actions**
      **Files:** `src/routes/(app)/settings/availability/+page.server.ts` (modify)
      **What:** Replace the empty block list with real availability data loaded through the controller/service path. Add actions for create, update, archive, and restore using the same form-handling style already used in the task workspace.
      **Pattern:** Follow the load/action shape in `src/routes/(app)/tasks/task-server.ts`, but keep all availability-specific mapping local to this file.
      **Verify:** `pnpm check`

- [ ] **Step 37: Rework the availability UI around the route actions from Step 36**
      **Files:** `src/routes/(app)/settings/availability/+page.svelte` (modify), `src/lib/components/domain/availability/AvailabilityEditor.svelte` (modify), `src/lib/components/domain/availability/AvailabilityGrid.svelte` (modify)
      **What:** Keep the page route and existing component trio, but make them submit to the real actions from Step 36. `AvailabilityEditor` should become a form-friendly editor instead of an isolated callback-only widget, and `AvailabilityGrid` should keep using buttons for slots while exposing the metadata the page now needs.
      **Pattern:** Preserve the current `PageHeader -> AvailabilityGrid -> AvailabilityBlockList -> AvailabilityEditor` page structure.
      **Verify:** `pnpm check && pnpm exec playwright test tests/e2e/availability-reminders.spec.ts`

- [ ] **Step 38: Replace the placeholder data loader and add export/import actions**
      **Files:** `src/routes/(app)/settings/data/+page.server.ts` (modify)
      **What:** Replace the stubbed timestamps with real last-export/last-import values if available, and add actions for export and import using the in-scope data-portability service from earlier steps. Keep the route-level output keys `lastExport` and `lastImport` so the page and panel do not need a full prop redesign.
      **Pattern:** Follow the task workspace action style for parsing `FormData`, calling the controller/service, and returning `fail()` payloads.
      **Verify:** `pnpm check`

- [ ] **Step 39: Rework the data portability panel around the route actions from Step 38**
      **Files:** `src/routes/(app)/settings/data/+page.svelte` (modify), `src/lib/components/domain/settings/DataPortabilityPanel.svelte` (modify)
      **What:** Keep the current page and panel pairing, but make `DataPortabilityPanel` submit through route actions instead of relying on callback props alone. Remove the raw shadcn `Button` import if it is still unused and keep the component on the shared primitives.
      **Pattern:** Preserve the current `PageHeader -> DataPortabilityPanel` route structure and the two-panel layout inside `DataPortabilityPanel.svelte`.
      **Verify:** `pnpm check && pnpm exec playwright test tests/e2e/data-audit.spec.ts`

- [ ] **Step 40: Replace the placeholder audit loader and keep the existing feed page**
      **Files:** `src/routes/(app)/settings/audit/+page.server.ts` (modify), `src/routes/(app)/settings/audit/+page.svelte` (modify only if the returned data shape needs a minimal adjustment)
      **What:** Replace the empty audit event list with real data loaded through `AuditController`/`AuditQueryService`. Keep the existing page structure and only adjust `+page.svelte` if the real event mapping needs a small prop rename or formatting change.
      **Pattern:** Use the same local route-mapping style as the task workspace and keep `AuditFeedItem` presentational.
      **Verify:** `pnpm check && pnpm exec playwright test tests/e2e/data-audit.spec.ts`

- [ ] **Step 41: Fix the high-confidence design-system violations on updated routes**
      **Files:** `src/routes/(app)/aspects/[id]/+page.svelte` (modify), `src/lib/components/domain/settings/ProfileSliders.svelte` (modify), `src/lib/components/domain/settings/DataPortabilityPanel.svelte` (modify), `src/lib/components/layout/AmbientBackground.svelte` (modify)
      **What:** After the behavioural work is done, replace the remaining raw controls and missing motion-safe handling in the files touched by this iteration. Keep the fixes limited to the current route/component set instead of trying to normalize the entire app shell in the same step.
      **Pattern:** Use `Button.svelte`, `Input.svelte`, and the existing glass utility approach already used elsewhere in the app.
      **Verify:** `pnpm check && pnpm lint`

- [ ] **Step 42: Refresh the compliance docs so they match the code**
      **Files:** `docs/execution/invariant-coverage.md` (modify), `docs/execution/interaction-route-map.md` (modify), `docs/execution/ui-acceptance-map.md` (modify), `docs/execution/architecture-compliance.md` (modify), `docs/execution/reference-ledger.md` (modify)
      **What:** Rewrite the execution docs after the code and tests are green. Mark auth and pure API parity as deferred, describe loaders/actions as the implemented transport for this iteration, and only mark behaviour as covered when there is real code and a passing test or a verified UI path.
      **Pattern:** Preserve the current table-driven ledger format in all five docs.
      **Verify:** `pnpm exec prettier --check docs/execution/*.md`

- [ ] **Step 43: Run the final verification sweep and record remaining blockers**
      **Files:** `compliance-remediation-plan.md` (modify only to check boxes and add notes)
      **What:** Run the full verification suite for this iteration. If any failure is caused by a still-deferred auth/session or JSON API concern, record that explicitly under this step instead of silently treating it as a plan failure.
      **Verify:** `pnpm test && pnpm check && pnpm lint && pnpm exec playwright test tests/e2e/aspects-tasks-planning.spec.ts tests/e2e/availability-reminders.spec.ts tests/e2e/data-audit.spec.ts tests/e2e/tasks-mobile-drilldown.spec.ts`

## Tests

- Unit tests should live in `tests/unit/services/**` and use the shared fake infrastructure in `tests/fakes/**`.
- Do not use mocking libraries.
- Keep each test focused on one invariant or one service behaviour.
- Minimum per-workstream commands are already listed in each step; use them instead of running the whole suite prematurely.

## Verification

- Backend work is complete when the in-scope service tests are real, passing, and no longer skipped.
- Loader/action work is complete when the placeholder `+page.server.ts` files covered by this plan are replaced with real service-backed loads/actions.
- UI work is complete when the updated pages are driven by real data/actions and the targeted Playwright specs pass.
- Documentation work is complete when `docs/execution/**` stops claiming compliance that the code and tests do not support.
