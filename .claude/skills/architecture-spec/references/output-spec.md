# Output Spec

The complete structure of the architecture specification deliverable. This is what the implementation agent reads to build the system.

---

## Deliverable structure

The final output is a single Markdown file containing:

```markdown
# Architecture Specification: [System Name]

## Overview

[2–3 sentences: system type, architecture pattern, key constraints]

## Cross-cutting Concerns

[Middleware, decorators, infrastructure extracted in Step 0]

## Aggregate Map

[Table of aggregates with roots and children]

## Models

### [Aggregate Name]

[Class specifications with fields, value objects, construction-time invariants]

## Service Interfaces

### [Service Name]

[Interface with method signatures, behavioral invariants, dependencies, public/private]

## Controller Specifications

### [Controller Name — one per concern area]

[Methods (one per interaction), service dependencies, concern area]

## Job-triggered Interactions

[Interactions that bypass controllers — job name, service method, trigger]

## Repository Interfaces

### [Repository Name]

[Methods including cascade operations, aggregate boundary, return types]

## Error Mapping

[Table: failure path → error type → raising class, derived from interaction matrix error contracts]

## Invariant Classification

[Table: invariant → category → enforcement point, including cross-cutting]

## Wiring Plan

[Factory structure, DI graph, public vs private services, job entry points]

## Config Mapping

[External dependencies, required config values]

## Completeness Checklist

[Verification that everything is covered]
```

---

## Aggregate map format

```markdown
## Cross-cutting Concerns

| Concern                | Applies to                                       | Mechanism                 | Implementation                                                                                       |
| ---------------------- | ------------------------------------------------ | ------------------------- | ---------------------------------------------------------------------------------------------------- |
| Ownership scoping      | 90% of interactions (all mutations + most reads) | Middleware                | Injects `owner_id` filter into repository queries. Service methods never check ownership explicitly. |
| Audit emission         | All mutation interactions                        | Decorator                 | `@audited` decorator on service mutation methods. Emits event with actor, action, entity, timestamp. |
| Optimistic concurrency | All entities with `version` field                | Repository infrastructure | `save()` checks version match, raises `ConflictError` on mismatch. Transparent to services.          |
| Soft-delete filtering  | All reads except admin queries                   | Repository default filter | Default `WHERE archived_at IS NULL` on all queries. Explicit `include_archived=True` overrides.      |

For each concern, note:

- **Which interactions are excluded** (if any) and why
- **Where the mechanism is configured** (middleware registration, decorator application)
- **How services interact with it** (they don't — it's transparent, or they opt in via decorator)
```

---

## Aggregate map table format

```markdown
## Aggregate Map

| Aggregate    | Root         | Children    | Referenced by (via ID)   |
| ------------ | ------------ | ----------- | ------------------------ |
| Pipeline     | Pipeline     | Stage       | ExecutionLog.pipeline_id |
| Transform    | Transform    | —           | Stage.transform_id       |
| ExecutionLog | ExecutionLog | StageResult | —                        |
```

For each aggregate, include a brief note on the boundary rationale:

> **Pipeline aggregate**: Pipeline and Stage share a transactional boundary because stage ordering must be consistent with the pipeline's state. Stages are never created, modified, or deleted independently.

````

---

## Model specifications

For each model, specify:

### Domain model (the full representation)

```markdown
### Pipeline (aggregate root)

| Field | Type | Notes |
|---|---|---|
| id | string | System-generated |
| name | PipelineName | Value object: non-empty, max 100 chars (invariant #1) |
| status | PipelineStatus | Enum: idle, running, failed, complete |
| stages | list[Stage] | Ordered children, at least 1 required (invariant #2) |

**PipelineStatus enum:**
- `idle` → can transition to `running`
- `running` → can transition to `complete` or `failed`
- `failed` → can transition to `running` (retry)
- `complete` → terminal state

**Construction-time invariants:**
- Invariant #1: name is non-empty and ≤ 100 chars → enforced by `PipelineName`
- Invariant #2: stages list has ≥ 1 element → enforced by validator / `__post_init__`
````

### Input model (for creation/mutation)

```markdown
### CreatePipelineInput

| Field  | Type                   | Notes                             |
| ------ | ---------------------- | --------------------------------- |
| name   | PipelineName           | Same value object as domain model |
| stages | list[CreateStageInput] | At least 1 required               |

**Validation:** Pydantic model at the route boundary. After validation, the domain can trust the input.
```

### Value objects

List every value object with its invariant and construction behavior:

```markdown
### Value Objects

| Value Object    | Wraps      | Invariant                              | Construction behavior                                     |
| --------------- | ---------- | -------------------------------------- | --------------------------------------------------------- |
| PipelineName    | str        | #1: non-empty, ≤ 100 chars             | Strips whitespace, raises InputError if empty or too long |
| PositiveInt     | int        | #5: stage order must be positive       | Raises InputError if ≤ 0                                  |
| TransformConfig | str (JSON) | #7: must be valid JSON matching schema | Parses and validates against transform's config schema    |
```

---

## Service interface specifications

For each service:

```markdown
### IPipelineLifecycleService

**Concern:** Creating, updating, archiving, and cloning pipelines.

**Visibility:** Public (used by PipelineLifecycleController)

**Dependencies:**

- `IPipelineRepository` (interface)

**Methods:**

#### create(input: CreatePipelineInput) → Pipeline

- Creates pipeline with initial stages
- **Behavioral invariants enforced:**
  - #2: Pipeline must have ≥ 1 stage → checked before save

#### archive(pipeline_id: str) → None

- **Behavioral invariants enforced:**
  - #4: Pipeline can only be archived when idle or failed → raises `InputError`
- **Flow:** validates status, calls `repository.archive(pipeline_id)` which cascades to stages

#### clone(pipeline_id: str) → Pipeline

- Loads source pipeline, creates a copy with new ID and idle status

**Interaction matrix sections mapped:** "Pipeline Lifecycle"
```

### Private service example

```markdown
### ITransformExecutor (private)

**Concern:** Executing a transform against data.

**Visibility:** Private — only injected into `ExecutionService` via DI. Never available to controllers.

**Dependencies:**

- `ITransformRepository` (interface)
- External API client (if transforms call external services)

**Methods:**

#### execute(transform_id: str, data: StageInput) → StageOutput

- Loads the transform configuration
- Applies the transform to the input data
- Raises `NotFoundError` if transform doesn't exist
- Raises `InfraError` if external execution fails
```

---

## Controller specifications

Controllers are grouped **one per concern area** (not one per interaction). Each interaction in the concern area becomes a method.

For each controller:

```markdown
### PipelineLifecycleController

**Concern area:** Pipeline Lifecycle (from interaction matrix)

**Service dependencies (all interface-typed):**

- `IPipelineLifecycleService`

**Methods:**

#### create_pipeline(input: CreatePipelineInput) → Pipeline

- **Maps to interaction:** "Create Pipeline"
- **Flow:** Call `service.create(input)` → returns Pipeline

#### update_pipeline(pipeline_id: str, input: UpdatePipelineInput) → Pipeline

- **Maps to interaction:** "Update Pipeline"
- **Flow:** Call `service.update(pipeline_id, input)` → returns Pipeline

#### archive_pipeline(pipeline_id: str) → None

- **Maps to interaction:** "Archive Pipeline"
- **Flow:** Call `service.archive(pipeline_id)`

#### clone_pipeline(pipeline_id: str) → Pipeline

- **Maps to interaction:** "Clone Pipeline"
- **Flow:** Call `service.clone(pipeline_id)` → returns Pipeline
```

### Multi-service controller example

```markdown
### ExecutionController

**Concern area:** Execution & Monitoring (from interaction matrix)

**Service dependencies (all interface-typed):**

- `IExecutionService`

**Methods:**

#### execute_pipeline(pipeline_id: str) → ExecutionLog

- **Maps to interaction:** "Execute Pipeline"
- **Flow:** Call `execution_service.execute(pipeline_id)` → returns ExecutionLog

#### retry_execution(pipeline_id: str) → ExecutionLog

- **Maps to interaction:** "Retry Failed Execution"
- **Flow:** Call `execution_service.retry(pipeline_id)` → returns ExecutionLog

#### get_execution_history(pipeline_id: str) → list[ExecutionLog]

- **Maps to interaction:** "Get Execution History"
- **Flow:** Call `execution_service.get_history(pipeline_id)` → returns list
- **Parallel opportunities:** None (single call)
```

### Job-triggered interactions (no controller)

```markdown
## Job-triggered Interactions

These interactions are triggered by background jobs or schedulers. They bypass controllers and use the factory directly to obtain services.

| Interaction               | Actor     | Service Method                  | Trigger                  | Schedule        |
| ------------------------- | --------- | ------------------------------- | ------------------------ | --------------- |
| "Expire Stale Executions" | Scheduler | ExecutionService.expire_stale() | Cron job                 | Every hour      |
| "Reindex Transforms"      | System    | TransformService.reindex_all()  | Event: transform updated | On event        |
| "Generate Daily Report"   | Scheduler | ReportService.generate_daily()  | Cron job                 | Daily 02:00 UTC |

For each job-triggered interaction:

- **No HTTP route.** The job runner calls `factory.get_execution_service().expire_stale()`.
- **Same service interface.** The method signature is identical to what a controller would call.
- **Error handling:** Job failures are logged and optionally retried by the job framework — not translated to HTTP responses.
```

### Direct service calls (no controller)

```markdown
### Direct service calls

These flows are single-service operations with no orchestration, routed directly through the factory:

| Interaction        | Service          | Method        |
| ------------------ | ---------------- | ------------- |
| "Create Transform" | TransformService | create(input) |
| "List Transforms"  | TransformService | list_all()    |
| "Delete Transform" | TransformService | delete(id)    |
```

---

## Repository interface specifications

For each aggregate root:

```markdown
### IPipelineRepository

**Aggregate:** Pipeline (root) + Stage (children)

**Methods:**

| Method            | Signature                            | Notes                                                                              |
| ----------------- | ------------------------------------ | ---------------------------------------------------------------------------------- |
| find_by_id        | (pipeline_id: str) → Pipeline        | Loads root + all stages. Raises NotFoundError if absent.                           |
| find_by_workspace | (workspace_id: str) → list[Pipeline] | Returns pipelines without stages (summary query).                                  |
| save              | (pipeline: Pipeline) → Pipeline      | Upserts root + all children atomically. Handles stage adds/removes/reorders.       |
| delete            | (pipeline_id: str) → None            | Deletes root + all children. Raises NotFoundError if absent.                       |
| archive           | (pipeline_id: str) → None            | Sets archived_at on root + cascades to all stages. Raises NotFoundError if absent. |
| restore           | (pipeline_id: str) → None            | Clears archived_at on root + all stages. Raises NotFoundError if absent.           |

**Cascade operations:**

- `archive` — sets `archived_at` on Pipeline and all child Stages atomically
- `delete` — removes Pipeline and all child Stages atomically
- `save` — diffs current stages against persisted stages to handle adds/deletes/reorders

**Internal implementation notes (for the developer, not part of the interface):**

- ORM models: `PipelineORM`, `StageORM` — private to repository
- All operations within a single DB transaction
```

---

## Error mapping

```markdown
## Error Mapping

| Sequence Diagram | Failure Path                 | Error Type                                         | Raised By                 |
| ---------------- | ---------------------------- | -------------------------------------------------- | ------------------------- |
| Execute Pipeline | Pipeline not found           | NotFoundError("Pipeline")                          | PipelineService.execute   |
| Execute Pipeline | Pipeline already running     | InputError("Pipeline is already running")          | PipelineService.execute   |
| Execute Pipeline | Stage transform not found    | NotFoundError("Transform")                         | TransformExecutor.execute |
| Execute Pipeline | External API failure         | InfraError("Transform execution failed")           | TransformExecutor.execute |
| Create Pipeline  | Name already taken           | InputError("Pipeline name must be unique")         | PipelineService.create    |
| Retry Pipeline   | Pipeline not in failed state | InputError("Only failed pipelines can be retried") | PipelineService.retry     |
```

---

## Invariant classification

```markdown
## Invariant Classification

| #   | Invariant                                        | Category          | Enforced By                                            |
| --- | ------------------------------------------------ | ----------------- | ------------------------------------------------------ |
| 1   | Pipeline name non-empty, ≤ 100 chars             | Construction-time | PipelineName value object                              |
| 2   | Pipeline must have ≥ 1 stage                     | Construction-time | Pipeline model validator                               |
| 3   | Cannot execute while already running             | Behavioral        | PipelineService.execute                                |
| 4   | Pipeline can only be deleted when idle or failed | Behavioral        | PipelineService.delete                                 |
| 5   | Stage order must be positive                     | Construction-time | PositiveInt value object                               |
| 6   | Stage ordering contiguous within pipeline        | Aggregate         | PipelineRepository.save                                |
| 7   | Stage config must match transform schema         | Construction-time | TransformConfig value object                           |
| 10  | Completed stage results preserved on failure     | Behavioral        | PipelineService.execute                                |
| 12  | Retry resumes from failed stage                  | Behavioral        | PipelineService.retry                                  |
| 13  | idle → running → complete/failed                 | State transition  | PipelineService (via PipelineStatus.can_transition_to) |
```

---

## Wiring plan

```markdown
## Wiring Plan

### Factory: AppFactory

**Instantiated per-request** with session, config, and user context.

| Method                              | Returns                     | Assembles                                                                                            |
| ----------------------------------- | --------------------------- | ---------------------------------------------------------------------------------------------------- |
| get_pipeline_lifecycle_controller() | PipelineLifecycleController | PipelineLifecycleService(PipelineRepository)                                                         |
| get_execution_controller()          | ExecutionController         | ExecutionService(PipelineRepository, TransformRepository, ExecutionLogRepository, TransformExecutor) |
| get_transform_service()             | TransformService            | TransformService(TransformRepository)                                                                |
| get_execution_service()             | ExecutionService            | (for job runners — same instance as controller would get)                                            |

### Dependency graph
```

PipelineLifecycleController
└── IPipelineLifecycleService → PipelineLifecycleService
└── IPipelineRepository → PipelineRepository(session)

ExecutionController
└── IExecutionService → ExecutionService
├── IPipelineRepository → PipelineRepository(session)
├── ITransformRepository → TransformRepository(session)
├── IExecutionLogRepository → ExecutionLogRepository(session)
└── ITransformExecutor → TransformExecutor [PRIVATE]
└── ITransformRepository → TransformRepository(session)

TransformService (direct, no controller)
└── ITransformRepository → TransformRepository(session)

Job: expire_stale_executions (hourly)
└── factory.get_execution_service().expire_stale()

```

### Public vs Private services

| Service | Visibility | Reason |
|---|---|---|
| PipelineLifecycleService | Public | Used by PipelineLifecycleController |
| ExecutionService | Public | Used by ExecutionController + job runner |
| TransformService | Public | Used directly from routes (simple CRUD) |
| TransformExecutor | **Private** | Only injected into ExecutionService, never used by controllers |

### Job-triggered entry points

| Job | Service Method | Trigger | Notes |
|---|---|---|---|
| expire_stale_executions | ExecutionService.expire_stale() | Cron: hourly | Factory provides service directly |
| reindex_transforms | TransformService.reindex_all() | Event: transform updated | Factory provides service directly |
```

---

## Config mapping

```markdown
## Config Mapping

### AppConfig fields

| Field               | Type | Source                    | Required         | Used By           |
| ------------------- | ---- | ------------------------- | ---------------- | ----------------- |
| db_url              | str  | DATABASE_URL env var      | Yes              | Session factory   |
| transform_api_url   | str  | TRANSFORM_API_URL env var | Yes              | TransformExecutor |
| transform_api_key   | str  | TRANSFORM_API_KEY env var | Yes              | TransformExecutor |
| max_pipeline_stages | int  | MAX_STAGES env var        | No (default: 50) | PipelineService   |

**Fail-fast:** All required fields validated at startup via `AppConfig.from_env()`. Missing values raise `AppStartupError` with a clear message.
```

---

## Completeness checklist

```markdown
## Completeness Checklist

- [x] Cross-cutting concerns identified and extracted before service/controller design
- [x] Every entity in the ERD maps to a model specification
- [x] Every aggregate has exactly one repository interface
- [x] Repository interfaces include explicit cascade/workflow methods where needed
- [x] Every interaction in the interaction matrix maps to a controller method, direct service call, or job entry point
- [x] Controllers are grouped by concern area (one controller per concern, not per interaction)
- [x] Job-triggered interactions are identified with trigger conditions and documented in the wiring plan
- [x] Every service has a complete interface with typed signatures
- [x] Every service is classified as public or private with justification
- [x] Private services are identified from sequence diagrams and excluded from controller access
- [x] Every invariant is classified (construction-time / behavioral / aggregate / cross-cutting)
- [x] Every invariant has exactly one identified enforcement point
- [x] Every failure path from sequence diagrams and interaction matrix error contracts is mapped to an error type
- [x] The wiring plan covers all dependencies with no cycles
- [x] The config mapping covers all external system boundaries
- [x] No service directly imports another service
- [x] No controller contains conditional logic over domain data
- [x] No model has behavioral methods (only pure data + construction validation)
- [x] No cross-cutting concern is duplicated in individual services or controllers
```
