# Mapping Rules

How to translate domain modeling artifacts into architectural components. Each mapping is mechanical — given the domain spec, the architecture follows.

---

## Interaction matrix → Cross-cutting concerns (Step 0)

Before deriving any service or controller, scan the interaction matrix and invariants for patterns that repeat across 80%+ of interactions. These are **cross-cutting concerns** — they become middleware, decorators, or infrastructure, not logic duplicated in every service method.

### How to spot cross-cutting concerns

1. **Read the interaction matrix row by row.** For each interaction, note the error contracts and preconditions in the notes/error columns.
2. **Tally recurring patterns.** If a pattern appears in 80%+ of interactions, it's cross-cutting.
3. **Read the invariants file.** Group invariants that apply identically across multiple entities — these are infrastructure, not per-service logic.

### Common cross-cutting patterns

| Pattern                           | Signal in interaction matrix                                        | Mechanism                                                                                           |
| --------------------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Authorization / ownership scoping | Most rows list "403 if not owner" or "ownership check"              | Middleware that injects a scoped query filter or decorator that checks ownership before method body |
| Idempotency                       | Write operations list "idempotency key" or "retry-safe"             | Middleware that deduplicates by request ID                                                          |
| Audit emission                    | Most mutations note "audit event emitted"                           | Decorator on service methods or event hook                                                          |
| Optimistic concurrency            | Entities have `version` fields, rows note "409 on version mismatch" | Repository-level concern: version check on every write                                              |
| Soft-delete filtering             | Most reads note "exclude archived"                                  | Repository-level default filter                                                                     |

### Extraction decision

For each identified concern, decide:

- **Middleware** — runs before/after every request automatically. Use for concerns that apply uniformly (auth, request scoping).
- **Decorator** — applied per-method. Use for concerns that apply to most but not all methods (audit on mutations only).
- **Infrastructure service** — injected where needed. Use for concerns that need complex logic (idempotency store).

Once extracted, these concerns are **removed from individual service and controller specifications**. A service method's spec should not say "check ownership" if ownership is handled by middleware. The architecture spec documents the cross-cutting mechanism once, and individual services assume it's in place.

### Worked example

Given an interaction matrix where:

- 12 of 14 interactions have "403 if actor ≠ owner" in the error column
- 10 of 14 interactions note "audit event emitted"
- 4 of 14 interactions note "idempotency key required"

Result:

- **Ownership scoping** → cross-cutting (86%). Middleware injects `owner_id` filter.
- **Audit emission** → cross-cutting (71%). Close to threshold — check if the 4 non-audit interactions are reads. If all mutations emit audit and only reads don't, it's 100% of mutations → cross-cutting. Decorator on mutation service methods.
- **Idempotency** → NOT cross-cutting (29%). Stays as explicit logic in the 4 services that need it.

---

## ERD → Aggregates

### Identifying aggregate roots

An entity is an aggregate root if:

- It has an independent lifecycle — it can be created and deleted without depending on a parent
- Other entities reference it by ID from outside
- It's the entry point for a set of operations in the sequence diagrams

An entity is an aggregate child if:

- It only makes sense in the context of its parent
- It's always created/modified/deleted through the parent
- It shares a transactional boundary with the parent — they must be consistent together

### Worked example

Given this ERD:

```
Pipeline ||--|{ Stage : "contains (ordered)"
Stage }o--|| Transform : "applies"
Pipeline ||--o{ ExecutionLog : "produces"
ExecutionLog ||--|{ StageResult : "contains"
```

The aggregates are:

**Pipeline aggregate** — `Pipeline` (root) + `Stage` (child)

- Stages don't exist without a Pipeline
- Adding/removing/reordering stages is an operation on the Pipeline
- Stages and Pipeline must be consistent (ordering, status)

**Transform aggregate** — `Transform` (root, standalone)

- Transforms have independent lifecycles
- Stages reference Transforms by ID, not by containment
- A Transform can exist without any Stage using it

**ExecutionLog aggregate** — `ExecutionLog` (root) + `StageResult` (child)

- StageResults only exist as part of an ExecutionLog
- The log and its results are written atomically
- ExecutionLogs are immutable once created

### Cross-aggregate references

When an entity in one aggregate references an entity in another aggregate, the reference is **by ID only**. Never hold a direct object reference across aggregate boundaries.

```python
# Good — reference by ID
@dataclass(frozen=True, slots=True)
class Stage:
    transform_id: str   # ID of a Transform in another aggregate
    order: int
    name: str

# Bad — direct reference across aggregates
@dataclass(frozen=True, slots=True)
class Stage:
    transform: Transform  # breaks aggregate boundary
```

This means: if a controller needs data from two aggregates, it loads them separately through their respective repositories and combines in the controller. The repository for aggregate A never queries aggregate B's tables.

---

## ERD → Models

### Entity to model mapping

Every entity in the ERD becomes at least one model class. Entities with both read and write flows typically become:

- **A domain model** — the full representation, returned by repositories and services. Frozen/immutable.
- **An input model** — the data needed to create or update. May have fewer fields (no ID, no computed fields).

```python
# Domain model — frozen, represents a persisted entity
@dataclass(frozen=True, slots=True)
class Pipeline:
    id: str
    name: PipelineName       # value object
    status: PipelineStatus   # enum
    stages: list[Stage]      # children within the aggregate

# Input model — what you need to create one
@dataclass(frozen=True, slots=True)
class CreatePipelineInput:
    name: PipelineName
    stages: list[CreateStageInput]
```

### Attribute to field mapping

| ERD attribute type                    | Model field type                                    |
| ------------------------------------- | --------------------------------------------------- |
| `string` with no invariant            | `str`                                               |
| `string` with an invariant            | Value object (e.g., `PipelineName`, `EmailAddress`) |
| `int` / `float` with no invariant     | `int` / `float`                                     |
| `int` / `float` with an invariant     | Value object (e.g., `PositiveInt`, `Percentage`)    |
| `enum`                                | Python `Enum` or TypeScript string union            |
| `boolean`                             | `bool`                                              |
| `date` / `datetime`                   | `date` / `datetime`                                 |
| `list` of children (within aggregate) | `list[ChildModel]`                                  |
| Reference to another aggregate        | `str` (ID only)                                     |

### Value objects

A field gets a value object when there's a numbered invariant about it. The value object enforces the invariant at construction — after that, the value is guaranteed valid.

```python
# Invariant: "A pipeline name must be non-empty and at most 100 characters"
class PipelineName(str):
    def __new__(cls, value: str) -> "PipelineName":
        stripped = value.strip()
        if not stripped:
            raise InputError("Pipeline name cannot be empty")
        if len(stripped) > 100:
            raise InputError("Pipeline name cannot exceed 100 characters")
        return super().__new__(cls, stripped)
```

Or with Pydantic:

```python
from pydantic import field_validator

class CreatePipelineInput(BaseModel):
    name: str
    stages: list[CreateStageInput]

    @field_validator("name")
    @classmethod
    def name_not_empty(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Pipeline name cannot be empty")
        if len(stripped) > 100:
            raise ValueError("Pipeline name cannot exceed 100 characters")
        return stripped
```

Both approaches are valid. The key property is the same: once you have the object, the invariant holds. Code receiving a `PipelineName` or a validated `CreatePipelineInput` never needs to re-check.

### Don't over-engineer value objects

Not every string needs a value object. The threshold:

- **Has a numbered invariant** → value object
- **Is just a string with no rules** → stays `str`
- **Is used in a single place** → consider whether validation at the Pydantic boundary is enough
- **Is used across multiple services** → value object, so validation isn't duplicated

---

## Interaction matrix → Services (concern-based derivation)

Services map to **domain concerns**, not individual entities. The interaction matrix's own section groupings are the primary signal for service boundaries.

### Derivation logic

1. **Read the interaction matrix sections.** Each section groups related interactions by concern area. Each section is a candidate service.
2. **Name the service after the concern**, not after an entity. "Pipeline Lifecycle" → `PipelineLifecycleService`. "Execution & Monitoring" → `ExecutionService`. "Transform Management" → `TransformService`.
3. **List the entities that participate** in each section's interactions. Multiple entities participating in one service is expected and correct — that's why it's concern-based, not entity-based.
4. **Validate cohesion.** Every method on the service should relate to the same concern. If a section contains interactions that feel unrelated, consider splitting the service.
5. **Check for entity overlap.** If an entity appears in multiple service sections, it's shared data accessed via its repository — not a reason to merge the services.

### Worked example: entities → services

Given an interaction matrix with these sections:

**Section: "Pipeline Lifecycle"**

- Create Pipeline (entities: Pipeline, Stage)
- Update Pipeline (entities: Pipeline, Stage)
- Archive Pipeline (entities: Pipeline, Stage, ExecutionLog)
- Clone Pipeline (entities: Pipeline, Stage)

**Section: "Execution & Monitoring"**

- Execute Pipeline (entities: Pipeline, Stage, Transform, ExecutionLog, StageResult)
- Retry Failed Execution (entities: Pipeline, ExecutionLog, StageResult)
- Get Execution History (entities: ExecutionLog, StageResult)

**Section: "Transform Management"**

- Create Transform (entities: Transform)
- Update Transform (entities: Transform)
- Validate Transform Config (entities: Transform)

Service derivation:

| Service                    | Concern                                          | Entities involved                                     | Interactions                   |
| -------------------------- | ------------------------------------------------ | ----------------------------------------------------- | ------------------------------ |
| `PipelineLifecycleService` | Creating, updating, archiving, cloning pipelines | Pipeline, Stage                                       | Create, Update, Archive, Clone |
| `ExecutionService`         | Running pipelines and tracking results           | Pipeline, Stage, Transform, ExecutionLog, StageResult | Execute, Retry, Get History    |
| `TransformService`         | Managing transform definitions                   | Transform                                             | Create, Update, Validate       |

Note: `Pipeline` and `Stage` appear in both `PipelineLifecycleService` and `ExecutionService`. Each service accesses them through `IPipelineRepository` — the entity isn't "owned" by one service. The **concern** determines the boundary, not entity containment.

### How sequence diagram participants map to services

Sequence diagrams name **entities** as participants (Pipeline, Stage, Transform). Services name **concerns**. The mapping:

1. Find which interaction matrix section the sequence diagram belongs to (match by operation name).
2. That section's service owns the orchestration for this flow.
3. The entities in the sequence diagram tell you which **repositories** the service needs — not which services to create.

Example: The "Execute Pipeline" sequence diagram has participants `Pipeline`, `Stage`, `Transform`, `ExecutionLog`, `StageResult`. This maps to `ExecutionService` (from the "Execution & Monitoring" section), which depends on `IPipelineRepository`, `ITransformRepository`, and `IExecutionLogRepository`.

### Private service identification

A service is **private** if it is never used by a controller — only injected into other services via DI.

How to identify:

1. Scan all sequence diagrams. Find participants that are **only ever called by another service participant**, never directly by the actor or controller.
2. Check the interaction matrix — if no interaction lists this concern as its primary section, it's likely private infrastructure.
3. Common private services: execution engines, notification dispatchers, transformation runners, schedule calculators.

Example: If `TransformExecutor` only appears inside the "Execute Pipeline" sequence diagram as a sub-call from `ExecutionService`, and no interaction in the matrix directly targets transform execution, then `TransformExecutor` is private — injected into `ExecutionService`, never exposed to controllers.

---

## Sequence diagrams → Controllers

### Controller grouping by concern area

Controllers mirror service groupings — **one controller per concern area**. Each interaction in a concern area becomes one method on that concern's controller.

**Do not create one controller per interaction.** Group by the same sections from the interaction matrix that defined service boundaries.

### The mapping rule

For each interaction matrix section that has user-triggered interactions:

1. **One controller** for the section. Named after the concern: `PipelineLifecycleController`, `ExecutionController`, `TransformController`.
2. **One method per interaction** in that section. The method name comes from the interaction name.
3. **Dependencies** are the service interfaces the controller needs to orchestrate the section's interactions.

For single-service interactions within a section with no orchestration: still a method on the controller for consistency, unless the section has only simple CRUD — then direct service calls via the factory are acceptable.

### Job-triggered interactions

Some interactions come from background jobs, schedulers, or system triggers — not from users through HTTP. Check the actor column in the interaction matrix.

| Actor type                      | Routing                                        |
| ------------------------------- | ---------------------------------------------- |
| User, Operator, Admin           | Controller method → HTTP route                 |
| System, Scheduler, Cron, Worker | Job runner → factory → service method directly |

Job-triggered interactions:

- **Do not get controller methods.** No HTTP endpoint.
- **Use the same service interface.** The service method is identical whether called from a controller or a job.
- **Are documented in the wiring plan** with the job name, service method, and trigger condition.

If an interaction can be both user-triggered and job-triggered, the service method is shared. The controller calls it for HTTP requests; the job runner calls it for scheduled invocations.

### Extracting controller methods

For each interaction in a controller's concern area:

1. **Method name** — derived from the interaction name. "Execute Pipeline" → `execute_pipeline`. "Clone Pipeline" → `clone_pipeline`.

2. **Parameters** — the inputs that the initiating actor provides. Read them from the first arrow in the sequence diagram.

3. **Return type** — the output that the actor receives. Read it from the last arrow (the response).

4. **Service dependencies** — determined by which services the controller needs for all its methods combined (not per-method).

5. **Parallel opportunities** — if two service calls in the flow don't depend on each other's results, they can run concurrently (TaskGroup / Promise.all).

### Extracting service methods

For each service (derived from an interaction matrix section):

1. **Gather all interactions** in that section.
2. **Each interaction** becomes a method on the service interface.
3. **Input types** — derived from the data flowing into the service in the sequence diagram.
4. **Return types** — derived from the data flowing out.
5. **Behavioral invariants** — rules from the invariants file that are checked during this operation.

### Worked example

Given this interaction matrix section "Execution & Monitoring" and corresponding sequence diagram:

```
Operator → System: Execute pipeline (pipelineId)
System → Pipeline: Load pipeline and validate status
System → Pipeline: Set status to "running"
loop For each Stage
    System → Stage: Execute
    System → Transform: Apply transform
end
System → ExecutionLog: Create log
System → Operator: Execution result
```

**Controller:** `ExecutionController` (covers all interactions in "Execution & Monitoring")

- Method: `execute_pipeline(pipeline_id: str) -> ExecutionLog`
- Method: `retry_execution(pipeline_id: str) -> ExecutionLog`
- Method: `get_execution_history(pipeline_id: str) -> list[ExecutionLog]`
- Dependencies: `IExecutionService`

**Service:** `ExecutionService` (concern: running pipelines and tracking results)

- methods: `execute(pipeline_id) -> ExecutionLog`, `retry(pipeline_id) -> ExecutionLog`, `get_history(pipeline_id) -> list[ExecutionLog]`
- Dependencies: `IPipelineRepository`, `ITransformRepository`, `IExecutionLogRepository`

Note: the sequence diagram participants are Pipeline, Stage, Transform, ExecutionLog, StageResult (entities), but the service is `ExecutionService` (a concern). The entities tell us which repositories the service needs, not which services to create.

---

## Invariants → Enforcement points

### Classification rules

| Invariant type                                                               | Enforcement point                                                                | Examples                                                                                  |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| **Construction-time** — about the shape/validity of a single field or entity | Model layer: value object, Pydantic validator, `__post_init__`                   | "Name must be non-empty", "Quantity must be positive", "Email must match pattern"         |
| **Behavioral** — about what operations are allowed given context             | Service layer: checked in the service method before performing the operation     | "Can't execute while already running", "Max 10 items per list"                            |
| **Aggregate** — about consistency between related entities                   | Repository layer: enforced by persisting the aggregate atomically                | "Stages must be contiguously ordered within their Pipeline", "Aggregate saved atomically" |
| **State transition** — about valid lifecycle progressions                    | Service layer: checked before transitioning, enum restricts valid states         | "Pipeline: idle → running → complete, no other transitions"                               |
| **Cross-aggregate** — about consistency across aggregate boundaries          | Controller or saga: checked at orchestration level, may be eventually consistent | "Transform referenced by a Stage must exist"                                              |
| **Cross-cutting** — repeats identically across 80%+ of interactions          | Middleware, decorator, or infrastructure                                         | "All mutations require ownership", "All writes emit audit events"                         |

### Construction-time invariants in detail

These are the "parse don't validate" invariants. They make illegal states unrepresentable:

```
Invariant: "Stage order must be a positive integer"
→ Enforced by: PositiveInt value object or Pydantic validator
→ After construction: code receiving a Stage can trust order > 0
```

```
Invariant: "Pipeline status can only be idle, running, failed, or complete"
→ Enforced by: PipelineStatus enum
→ After construction: no string comparison needed, just match on the enum
```

### Behavioral invariants in detail

These require context beyond the single entity:

```
Invariant: "A pipeline cannot be executed while it is already running"
→ Enforced by: PipelineService.execute() checks pipeline.status != running
→ Raises: InputError("Pipeline is already running")
```

```
Invariant: "Users can only delete their own pipelines"
→ If ownership check applies to 80%+ of interactions: cross-cutting → middleware
→ If ownership check is specific to delete: Behavioral → PipelineLifecycleService.delete()
→ Raises: UnauthorisedError()
```

### State transition invariants

These are a special form of behavioral invariant. They define valid state progressions:

```
Invariant: "Pipeline: idle → running → complete | failed. Failed → running (retry)."
→ Enforced by: PipelineService checks current status before transitioning
→ Consider a helper: allowed_transitions dict or method on the enum
```

```python
class PipelineStatus(Enum):
    IDLE = "idle"
    RUNNING = "running"
    COMPLETE = "complete"
    FAILED = "failed"

    def can_transition_to(self, target: "PipelineStatus") -> bool:
        allowed = {
            PipelineStatus.IDLE: {PipelineStatus.RUNNING},
            PipelineStatus.RUNNING: {PipelineStatus.COMPLETE, PipelineStatus.FAILED},
            PipelineStatus.FAILED: {PipelineStatus.RUNNING},  # retry
            PipelineStatus.COMPLETE: set(),
        }
        return target in allowed[self]
```

The enum is a model-level construct, but the `can_transition_to` method is a pure function with no side effects — it's still "models are just data." The service calls it and raises if the transition is invalid.

---

## Failure paths → Error types

### Mapping from interaction matrix and sequence diagrams

The interaction matrix is the authoritative list of per-interaction error contracts. Each row's error column lists the failures that can occur. The sequence diagrams provide the detailed `alt` blocks showing where each failure is detected.

Use both sources:

1. **Interaction matrix** — gives you the complete list of error types per interaction. No error should exist in the spec that isn't listed here.
2. **Sequence diagrams** — give you the exact point in the flow where the error is raised (which service method, which check).

### Mapping table

| Failure type in sequence diagram                  | Error type                              | HTTP mapping (at route edge) |
| ------------------------------------------------- | --------------------------------------- | ---------------------------- |
| Input validation fails                            | `InputError`                            | 400                          |
| Entity not found                                  | `NotFoundError`                         | 404                          |
| Permission/ownership check fails                  | `UnauthorisedError`                     | 401 / 403                    |
| State conflict (already running, already deleted) | `InputError` or domain-specific subtype | 409                          |
| External system failure                           | `InfraError`                            | 500                          |
| Business limit exceeded                           | `InputError` or domain-specific subtype | 400 / 422                    |

### Annotating the sequence diagram

Each `alt` block in the domain spec's sequence diagrams gets annotated with the error type:

```
alt Pipeline not found
    → NotFoundError("Pipeline")
else Pipeline already running
    → InputError("Pipeline is already running")
else Stage transform not found
    → NotFoundError("Transform")
else External API failure
    → InfraError("Transform execution failed")
```

This annotation appears in the architecture spec output so the implementation agent knows exactly which error to raise at each failure point.

---

## Aggregate children → No separate repository

This is important enough to call out explicitly. When an entity is an aggregate child:

- **No repository interface** for it. It's loaded and saved through the root's repository.
- **No direct queries** for it. If you need to find a specific Stage, you load the Pipeline and look through its stages.
- **No independent lifecycle.** Creating a Stage means modifying the Pipeline aggregate and saving through `PipelineRepository.save()`.

If this feels constraining for a particular entity, it might not be a child — it might be its own aggregate root. Revisit the boundary.

### Cascade and workflow atomicity

A repository method handles the **full atomic scope** of its operation — including cascade effects on children.

| Operation                   | What the repository method does atomically                                   |
| --------------------------- | ---------------------------------------------------------------------------- |
| `save(root)`                | Upserts root + all children. Diffs children to handle adds/removes/reorders. |
| `delete(id)`                | Deletes root + all children within the aggregate.                            |
| `archive(id)`               | Sets archived flag on root + propagates to all children.                     |
| `restore(id)`               | Clears archived flag on root + all children.                                 |
| `update_status(id, status)` | Updates root status + propagates status-dependent changes to children.       |

The method name communicates the full scope. `archive(id)` means "archive the root and cascade to all children" — not "set a flag on the root and hope the caller handles children."

**Worked example:**

```python
class IPipelineRepository(Protocol):
    def archive(self, pipeline_id: str) -> None:
        """Archive pipeline and all its stages atomically.

        Sets archived_at on the Pipeline and all child Stages.
        Archived pipelines are excluded from default queries.
        Raises NotFoundError if pipeline doesn't exist.
        """
        ...
```

The implementation handles the cascade internally — the service calls `repository.archive(id)` and trusts that the full scope is handled.

If an operation on one aggregate needs to affect another aggregate (cross-aggregate cascade), that coordination happens in the **controller or service**, not the repository. The repository only handles its own aggregate boundary.

### Exception: read-only queries

Sometimes you need to query across aggregates for read-heavy operations (dashboards, reports, search). This is fine — create a **read-only query service** that can query the database directly. It returns read models (DTOs), not domain aggregates. It bypasses the repository pattern for reads because it's not modifying state.

This is a pragmatic escape hatch, not a violation of the architecture. The write path goes through aggregates and repositories. The read path can be optimized separately.
