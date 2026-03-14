# Mapping Rules

How to translate domain modeling artifacts into architectural components. Each mapping is mechanical — given the domain spec, the architecture follows.

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

| ERD attribute type | Model field type |
|---|---|
| `string` with no invariant | `str` |
| `string` with an invariant | Value object (e.g., `PipelineName`, `EmailAddress`) |
| `int` / `float` with no invariant | `int` / `float` |
| `int` / `float` with an invariant | Value object (e.g., `PositiveInt`, `Percentage`) |
| `enum` | Python `Enum` or TypeScript string union |
| `boolean` | `bool` |
| `date` / `datetime` | `date` / `datetime` |
| `list` of children (within aggregate) | `list[ChildModel]` |
| Reference to another aggregate | `str` (ID only) |

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

## Sequence diagrams → Controllers and Services

### The mapping rule

Each sequence diagram in the domain spec describes an operation. The mapping depends on complexity:

**Multi-service flow** (sequence diagram has multiple domain participants) → **Controller method**

The controller orchestrates the services. Each domain participant in the diagram that isn't an external system maps to a service dependency on the controller.

**Single-service flow** (sequence diagram has one domain participant) → **Direct service call**

No controller needed. The route/loader calls the service directly via the factory. But default toward creating a controller — if there's any chance a second service will be needed in the future, make the controller now.

### Extracting controller methods

For each multi-service sequence diagram:

1. **Method name** — derived from the operation name in the diagram. "Execute Pipeline" → `execute_pipeline`. "Add Recipe to Meal Plan" → `add_recipe_to_plan`.

2. **Parameters** — the inputs that the initiating actor provides. Read them from the first arrow in the diagram.

3. **Return type** — the output that the actor receives. Read it from the last arrow (the response).

4. **Service dependencies** — every domain participant in the diagram (except the actor and external systems) maps to a service interface on the controller.

5. **Parallel opportunities** — if two service calls in the diagram don't depend on each other's results, they can run concurrently (TaskGroup / Promise.all).

### Extracting service methods

For each service (derived from a domain participant across all sequence diagrams):

1. **Gather all sequence diagrams** where this participant appears.
2. **Each distinct operation** on this participant becomes a method on the service interface.
3. **Input types** — derived from the data flowing into the participant in the diagram.
4. **Return types** — derived from the data flowing out.
5. **Behavioral invariants** — rules from the invariants file that are checked during this operation.

### Worked example

Given this sequence diagram:

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

**Controller:** `PipelineController`
- Method: `execute_pipeline(pipeline_id: str) -> ExecutionLog`
- Dependencies: `IPipelineService`, `IExecutionService`

**Services:**
- `PipelineService` — methods: `get_by_id(id) -> Pipeline`, `set_status(id, status)`, `execute_stages(pipeline) -> list[StageResult]`
- `ExecutionService` — methods: `create_log(pipeline_id, results) -> ExecutionLog`

**Or** if execution is tightly coupled to the pipeline concept:
- `PipelineService` — methods: `get_by_id(id) -> Pipeline`, `execute(pipeline_id) -> ExecutionLog`

The right decomposition depends on the domain. If execution is a distinct concern (with its own invariants, its own storage), it's a separate service. If it's just "what a pipeline does", it belongs on the pipeline service.

Present both options to the user and let them decide.

---

## Invariants → Enforcement points

### Classification rules

| Invariant type | Enforcement point | Examples |
|---|---|---|
| **Construction-time** — about the shape/validity of a single field or entity | Model layer: value object, Pydantic validator, `__post_init__` | "Name must be non-empty", "Quantity must be positive", "Email must match pattern" |
| **Behavioral** — about what operations are allowed given context | Service layer: checked in the service method before performing the operation | "Users can only delete own resources", "Can't execute while already running", "Max 10 items per list" |
| **Aggregate** — about consistency between related entities | Repository layer: enforced by persisting the aggregate atomically | "Stages must be contiguously ordered within their Pipeline", "Aggregate saved atomically" |
| **State transition** — about valid lifecycle progressions | Service layer: checked before transitioning, enum restricts valid states | "Pipeline: idle → running → complete, no other transitions" |
| **Cross-aggregate** — about consistency across aggregate boundaries | Controller or saga: checked at orchestration level, may be eventually consistent | "Transform referenced by a Stage must exist" |

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
Invariant: "Users can only delete their own recipes"
→ Enforced by: RecipeService.delete() checks recipe.user_id == requesting_user_id
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

### Mapping table

| Failure type in sequence diagram | Error type | HTTP mapping (at route edge) |
|---|---|---|
| Input validation fails | `InputError` | 400 |
| Entity not found | `NotFoundError` | 404 |
| Permission/ownership check fails | `UnauthorisedError` | 401 / 403 |
| State conflict (already running, already deleted) | `InputError` or domain-specific subtype | 409 |
| External system failure | `InfraError` | 500 |
| Business limit exceeded | `InputError` or domain-specific subtype | 400 / 422 |

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

### Exception: read-only queries

Sometimes you need to query across aggregates for read-heavy operations (dashboards, reports, search). This is fine — create a **read-only query service** that can query the database directly. It returns read models (DTOs), not domain aggregates. It bypasses the repository pattern for reads because it's not modifying state.

This is a pragmatic escape hatch, not a violation of the architecture. The write path goes through aggregates and repositories. The read path can be optimized separately.
