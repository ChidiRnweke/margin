# Output Spec

The complete structure of the architecture specification deliverable. This is what the implementation agent reads to build the system.

---

## Deliverable structure

The final output is a single Markdown file containing:

```markdown
# Architecture Specification: [System Name]

## Overview
[2–3 sentences: system type, architecture pattern, key constraints]

## Aggregate Map
[Table of aggregates with roots and children]

## Models
### [Aggregate Name]
[Class specifications with fields, value objects, construction-time invariants]

## Service Interfaces
### [Service Name]
[Interface with method signatures, behavioral invariants, dependencies]

## Controller Specifications
### [Controller Name]
[Methods, service dependencies, sequence diagram mapping]

## Repository Interfaces
### [Repository Name]
[Methods, aggregate boundary, return types]

## Error Mapping
[Table: failure path → error type → raising class]

## Invariant Classification
[Table: invariant → category → enforcement point]

## Wiring Plan
[Factory structure, DI graph, public vs private services]

## Config Mapping
[External dependencies, required config values]

## Completeness Checklist
[Verification that everything is covered]
```

---

## Aggregate map format

```markdown
## Aggregate Map

| Aggregate | Root | Children | Referenced by (via ID) |
|---|---|---|---|
| Pipeline | Pipeline | Stage | ExecutionLog.pipeline_id |
| Transform | Transform | — | Stage.transform_id |
| ExecutionLog | ExecutionLog | StageResult | — |
```

For each aggregate, include a brief note on the boundary rationale:

> **Pipeline aggregate**: Pipeline and Stage share a transactional boundary because stage ordering must be consistent with the pipeline's state. Stages are never created, modified, or deleted independently.
```

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
```

### Input model (for creation/mutation)

```markdown
### CreatePipelineInput

| Field | Type | Notes |
|---|---|---|
| name | PipelineName | Same value object as domain model |
| stages | list[CreateStageInput] | At least 1 required |

**Validation:** Pydantic model at the route boundary. After validation, the domain can trust the input.
```

### Value objects

List every value object with its invariant and construction behavior:

```markdown
### Value Objects

| Value Object | Wraps | Invariant | Construction behavior |
|---|---|---|---|
| PipelineName | str | #1: non-empty, ≤ 100 chars | Strips whitespace, raises InputError if empty or too long |
| PositiveInt | int | #5: stage order must be positive | Raises InputError if ≤ 0 |
| TransformConfig | str (JSON) | #7: must be valid JSON matching schema | Parses and validates against transform's config schema |
```

---

## Service interface specifications

For each service:

```markdown
### IPipelineService

**Concern:** Pipeline lifecycle management and stage execution.

**Dependencies:**
- `IPipelineRepository` (interface)

**Methods:**

#### get_by_id(pipeline_id: str) → Pipeline
- Loads the pipeline aggregate (root + stages)
- Raises `NotFoundError` if not found

#### execute(pipeline_id: str) → ExecutionLog
- **Behavioral invariants enforced:**
  - #3: Pipeline cannot be executed while already running → raises `InputError`
  - #14: Pipeline status transition must be valid → checked via `PipelineStatus.can_transition_to`
- **Flow:** loads pipeline, validates status, transitions to running, executes stages in order, creates execution log
- **Failure handling:**
  - If a stage fails: pipeline transitions to `failed`, remaining stages marked `skipped`
  - Stage results for completed stages are preserved (invariant #10)

#### retry(pipeline_id: str) → ExecutionLog
- **Behavioral invariants enforced:**
  - #15: Only failed pipelines can be retried → raises `InputError`
  - #12: Retry resumes from failed stage, not beginning
- **Flow:** loads pipeline, finds first failed/skipped stage, re-executes from there

**Sequence diagrams mapped:** "Execute Pipeline" (happy + failure), "Retry Failed Pipeline"
```

### Private service example

```markdown
### ITransformExecutor (private — not directly available to controllers)

**Concern:** Executing a transform against data.

**Dependencies:**
- `ITransformRepository` (interface)
- External API client (if transforms call external services)

**Injected into:** `PipelineService` (via DI in factory)

**Methods:**

#### execute(transform_id: str, data: StageInput) → StageOutput
- Loads the transform configuration
- Applies the transform to the input data
- Raises `NotFoundError` if transform doesn't exist
- Raises `InfraError` if external execution fails
```

---

## Controller specifications

For each controller:

```markdown
### PipelineController

**Service dependencies (all interface-typed):**
- `IPipelineService`
- `IExecutionService`

**Methods:**

#### execute_pipeline(pipeline_id: str) → ExecutionLog
- **Maps to sequence diagram:** "Execute Pipeline"
- **Flow:**
  1. Call `pipeline_service.execute(pipeline_id)` → returns ExecutionLog
  2. (If execution logging is a separate concern: call `execution_service.create_log(...)`)
- **No business logic.** Orchestration only.
- **Parallel opportunities:** None in this flow (sequential by nature)

#### get_pipeline_dashboard(pipeline_id: str) → PipelineDashboard
- **Maps to sequence diagram:** "View Pipeline Details"
- **Flow:**
  1. `pipeline_service.get_by_id(pipeline_id)` and `execution_service.get_recent_logs(pipeline_id)` — **parallel** (independent data)
  2. Compose into `PipelineDashboard`
```

### When no controller is needed

```markdown
### Direct service calls (no controller)

These flows are single-service operations routed directly through the factory:

| Flow | Service | Method |
|---|---|---|
| "Create Transform" | TransformService | create(input) |
| "List Transforms" | TransformService | list_all() |
| "Delete Transform" | TransformService | delete(id) |
```

---

## Repository interface specifications

For each aggregate root:

```markdown
### IPipelineRepository

**Aggregate:** Pipeline (root) + Stage (children)

**Methods:**

| Method | Signature | Notes |
|---|---|---|
| find_by_id | (pipeline_id: str) → Pipeline | Loads root + all stages. Raises NotFoundError if absent. |
| find_by_workspace | (workspace_id: str) → list[Pipeline] | Returns pipelines without stages (summary query). |
| save | (pipeline: Pipeline) → Pipeline | Upserts root + all children atomically. Handles stage adds/removes/reorders. |
| delete | (pipeline_id: str) → None | Deletes root + all children. Raises NotFoundError if absent. |

**Internal implementation notes (for the developer, not part of the interface):**
- ORM models: `PipelineORM`, `StageORM` — private to repository
- `save` diffs current stages against persisted stages to handle adds/deletes
- All operations within a single DB transaction
```

---

## Error mapping

```markdown
## Error Mapping

| Sequence Diagram | Failure Path | Error Type | Raised By |
|---|---|---|---|
| Execute Pipeline | Pipeline not found | NotFoundError("Pipeline") | PipelineService.execute |
| Execute Pipeline | Pipeline already running | InputError("Pipeline is already running") | PipelineService.execute |
| Execute Pipeline | Stage transform not found | NotFoundError("Transform") | TransformExecutor.execute |
| Execute Pipeline | External API failure | InfraError("Transform execution failed") | TransformExecutor.execute |
| Create Pipeline | Name already taken | InputError("Pipeline name must be unique") | PipelineService.create |
| Retry Pipeline | Pipeline not in failed state | InputError("Only failed pipelines can be retried") | PipelineService.retry |
```

---

## Invariant classification

```markdown
## Invariant Classification

| # | Invariant | Category | Enforced By |
|---|---|---|---|
| 1 | Pipeline name non-empty, ≤ 100 chars | Construction-time | PipelineName value object |
| 2 | Pipeline must have ≥ 1 stage | Construction-time | Pipeline model validator |
| 3 | Cannot execute while already running | Behavioral | PipelineService.execute |
| 4 | Pipeline can only be deleted when idle or failed | Behavioral | PipelineService.delete |
| 5 | Stage order must be positive | Construction-time | PositiveInt value object |
| 6 | Stage ordering contiguous within pipeline | Aggregate | PipelineRepository.save |
| 7 | Stage config must match transform schema | Construction-time | TransformConfig value object |
| 10 | Completed stage results preserved on failure | Behavioral | PipelineService.execute |
| 12 | Retry resumes from failed stage | Behavioral | PipelineService.retry |
| 13 | idle → running → complete/failed | State transition | PipelineService (via PipelineStatus.can_transition_to) |
```

---

## Wiring plan

```markdown
## Wiring Plan

### Factory: AppFactory

**Instantiated per-request** with session, config, and user context.

| Method | Returns | Assembles |
|---|---|---|
| get_pipeline_controller() | PipelineController | PipelineService(PipelineRepository, TransformExecutor), ExecutionService(ExecutionLogRepository) |
| get_transform_service() | TransformService | TransformService(TransformRepository) |

### Dependency graph

```
PipelineController
├── IPipelineService → PipelineService
│   ├── IPipelineRepository → PipelineRepository(session)
│   └── ITransformExecutor → TransformExecutor  [PRIVATE]
│       └── ITransformRepository → TransformRepository(session)
└── IExecutionService → ExecutionService
    └── IExecutionLogRepository → ExecutionLogRepository(session)

TransformService (direct, no controller)
└── ITransformRepository → TransformRepository(session)
```

### Public vs Private services

| Service | Visibility | Reason |
|---|---|---|
| PipelineService | Public | Used by PipelineController |
| ExecutionService | Public | Used by PipelineController |
| TransformService | Public | Used directly from routes (simple CRUD) |
| TransformExecutor | **Private** | Only injected into PipelineService, never used by controllers |
```

---

## Config mapping

```markdown
## Config Mapping

### AppConfig fields

| Field | Type | Source | Required | Used By |
|---|---|---|---|---|
| db_url | str | DATABASE_URL env var | Yes | Session factory |
| transform_api_url | str | TRANSFORM_API_URL env var | Yes | TransformExecutor |
| transform_api_key | str | TRANSFORM_API_KEY env var | Yes | TransformExecutor |
| max_pipeline_stages | int | MAX_STAGES env var | No (default: 50) | PipelineService |

**Fail-fast:** All required fields validated at startup via `AppConfig.from_env()`. Missing values raise `AppStartupError` with a clear message.
```

---

## Completeness checklist

```markdown
## Completeness Checklist

- [x] Every entity in the ERD maps to a model specification
- [x] Every aggregate has exactly one repository interface
- [x] Every multi-service sequence diagram maps to a controller method
- [x] Every single-service sequence diagram is listed as a direct call
- [x] Every service has a complete interface with typed signatures
- [x] Every invariant is classified (construction-time / behavioral / aggregate)
- [x] Every invariant has exactly one identified enforcement point
- [x] Every failure path from sequence diagrams is mapped to an error type
- [x] The wiring plan covers all dependencies with no cycles
- [x] The config mapping covers all external system boundaries
- [x] No service directly imports another service
- [x] No controller contains conditional logic over domain data
- [x] No model has behavioral methods (only pure data + construction validation)
- [x] Private services are identified and excluded from controller access
```
