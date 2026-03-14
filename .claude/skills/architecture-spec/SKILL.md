---
name: architecture-spec
description: Convert domain modeling artifacts into a complete architectural specification. Use this skill whenever the user has ERDs, sequence diagrams, and invariants from domain modeling and wants to translate them into an implementable architecture. Also trigger when the user says "turn this into an architecture", "what services do I need", "map this to code", "create the class diagrams", "design the architecture", or has a domain spec and wants to know how it maps to models, services, controllers, repositories, and factories. This skill enforces a strict layered architecture with dependency injection, aggregate-based repositories, stateless classes, and a clear separation between construction-time and behavioral invariants.
---

# Architecture Spec Skill

Take domain artifacts. Produce a complete architectural specification. Every entity, service, controller, repository, and wiring decision defined before any code is written.

## Reference files

Read these when working in the relevant area:

- `references/mapping-rules.md` — How to map ERDs to aggregates, sequence diagrams to controllers, invariants to enforcement points, failures to error types
- `references/output-spec.md` — Class diagram conventions, wiring plan format, config mapping, the complete deliverable structure

---

## Input

This skill consumes the output of the domain modeling skill:

1. **Conceptual ERD** — entities, attributes, relationships with cardinality
2. **Sequence diagrams** — happy paths and failure paths for every operation
3. **Invariants file** — numbered rules grouped by entity/concern

If any of these are missing or incomplete, stop and tell the user. This skill does not guess at the domain — it translates a complete domain spec into architecture. Garbage in, garbage out.

---

## What this skill produces

A complete architectural specification that an implementation agent can execute without making structural decisions. Every class is named. Every method has a signature. Every dependency is explicit.

### Deliverables

1. **Aggregate map** — which entities are aggregate roots, which are owned children, and the repository boundary for each aggregate.

2. **Model specifications** — every model class with its fields and construction-time invariants. Models are pure data. Validity is enforced at construction (Pydantic validators, smart constructors) — never by methods on the model.

3. **Service interfaces** — Protocol/interface for every service, with method signatures typed using domain models. Each service owns one concern. Services never import other services.

4. **Controller specifications** — one controller per sequence diagram that requires multi-service orchestration. Each method maps to a sequence diagram. Dependencies are interface-typed.

5. **Repository interfaces** — one repository per aggregate root. Methods derived from the flows that read/write that aggregate. ORM is an internal implementation detail — the interface speaks only in domain models.

6. **Wiring plan** — what the factory instantiates, what gets injected where, which services are public (used by controllers) vs private (injected into other services via DI).

7. **Error mapping** — every failure path from the sequence diagrams mapped to a specific error type in the error hierarchy.

8. **Invariant classification** — every invariant categorized as construction-time (model), behavioral (service), or aggregate (repository), with the enforcing class identified.

9. **Config mapping** — external dependencies and configuration values derived from the domain's external system boundaries.

---

## Architecture rules

These are not guidelines. They are the architecture. Every decision this skill makes must respect them.

### Dependency graph

```
Models        → import nothing
Repositories  → import models, errors
Services      → import models, repository interfaces, errors
Controllers   → import models, service interfaces
Factory       → import everything concrete
Routes/Loader → import factory, models
Config        → import nothing
```

**Services never import other services.** If a service needs another service's capability, that composition happens through dependency injection — the factory injects the private service, and the consuming service declares it as an interface-typed constructor parameter.

**Controllers never contain business logic.** If you see an `if` statement over domain data in a controller, it belongs in a service.

**Factory contains zero logic.** It instantiates and wires. That's it.

### Statelessness

Every class is stateless. No mutable instance fields that change between method calls. Dependencies are set at construction and never change. This is what makes everything trivially testable — instantiate with fakes, call a method, assert on the output.

### Parse don't validate

Models enforce validity at construction time. Once you have an instance, it is valid by definition. No null fields on required data. No partial domain objects. No "call .validate() after construction."

In Python: Pydantic models with validators, or dataclasses with `__post_init__` / classmethods that raise on invalid input. In TypeScript: class constructors that throw, or factory functions that return the type or throw.

The implication: if an invariant says "title must be non-empty", the model's construction path rejects empty titles. Code that receives a `Recipe` instance can trust that its title is non-empty without checking.

### Aggregate repositories

A repository wraps an aggregate, not a single entity. Everything within the aggregate boundary is persisted atomically through the aggregate root's repository. You never need cross-repository transactions.

This means:
- The repository `save` method persists the root and all its children in one operation
- Children are never persisted independently — always through the root
- Reading the aggregate returns the root with its children already loaded
- Deleting the root cascades to children within the aggregate

---

## Workflow

### Step 1: Identify aggregates

Read the ERD. Group entities into aggregates by asking:

- **Which entities have independent lifecycles?** Those are aggregate roots.
- **Which entities only make sense as children of another?** Those belong to the parent's aggregate.
- **Which entities are referenced across aggregates?** Those references are by ID only — never direct object references across aggregate boundaries.

Present the aggregate groupings as an assumption:

"From the ERD, I see these aggregates:
- **Pipeline aggregate** — Pipeline (root) + Stage (child). Stages don't exist without a Pipeline and are persisted through it.
- **Transform aggregate** — Transform (root). Standalone, referenced by Stage via ID.
- **ExecutionLog aggregate** — ExecutionLog (root) + StageResult (child). Created atomically when a pipeline completes.

Does this match your mental model?"

The test for aggregate boundaries: if two entities must be consistent with each other in the same transaction, they belong in the same aggregate. If they can be eventually consistent, they're separate aggregates.

### Step 2: Design models

For each entity in the ERD, produce a model specification:

- **Fields** from the ERD attributes
- **Value objects** for fields that have invariants. If an invariant says "X must be non-empty" or "X must match pattern Y", that field gets a value object that enforces it at construction.
- **Enum types** for fields with fixed states
- **Construction-time invariants** from the invariants file — every invariant about data shape and validity

Don't over-engineer value objects. The threshold: if there's a numbered invariant about this field, it gets a value object. If it's just a string with no rules, it stays a string.

### Step 3: Design service interfaces

For each service, determine:

- **What concern does it own?** One service, one concern.
- **What methods does it expose?** Derived from the sequence diagrams — every step in a diagram where the system does something within this concern becomes a method.
- **What models does it take and return?** Input models and output models, typed with domain types.
- **What repository does it depend on?** Interface-typed.
- **What behavioral invariants does it enforce?** Each behavioral invariant from the invariants file is assigned to exactly one service.

### Step 4: Design controllers

For each sequence diagram that involves more than one service:

- **One controller method per sequence diagram.** The method name describes the operation.
- **Dependencies are service interfaces.** The controller declares the services it orchestrates.
- **No business logic.** The controller calls services and composes results. If there's conditional logic over domain data, push it to a service.
- **Parallel where possible.** If two service calls are independent (no data dependency between them), they run concurrently (TaskGroup in Python, Promise.all in TypeScript).

For sequence diagrams that involve only one service: no controller. The route/loader calls the service directly via the factory.

### Step 5: Design repository interfaces

For each aggregate root:

- **One repository interface.** Methods speak only in domain models — never ORM types.
- **Methods derived from flows.** Read the sequence diagrams — every "load", "find", "save", "delete" operation on this aggregate becomes a repository method.
- **Standard method patterns:** `find_by_id`, `find_by_{field}`, `save` (upsert the aggregate), `delete`. Only add what the flows actually need — don't speculatively add methods.

### Step 6: Map errors

Read every `alt` (failure) block in every sequence diagram. For each failure:

- **Identify the error type** from the error hierarchy: `InputError` (bad input / validation), `NotFoundError` (entity doesn't exist), `UnauthorisedError` (permission denied), `InfraError` (external system failure), or domain-specific subtypes if needed.
- **Identify where it's raised** — which service or model constructor.
- **Map it to the sequence diagram** — the `alt` block references the error by type.

### Step 7: Produce the wiring plan

The factory needs to know:

- **What to instantiate** — every concrete class.
- **What to inject where** — which service gets which repository, which controller gets which services.
- **Public vs private services** — a service is public if a controller depends on it. A service is private if only another service depends on it (via DI). Private services are never directly available to controllers.
- **Config dependencies** — which services/repositories need config values (API keys, connection strings, etc).

### Step 8: Produce config mapping

From the domain model's external system boundaries and the service dependencies:

- **Each external system** referenced in sequence diagrams needs connection config
- **Each service** that calls an external API needs credentials/URLs
- **Environment-specific values** (database URLs, feature flags) are listed explicitly
- **Fail-fast validation** — every config value is required at startup with no silent defaults for critical values

### Step 9: Classify invariants

Take the full invariants list from domain modeling and classify each one:

| Invariant | Category | Enforced by |
|---|---|---|
| "Title must be non-empty" | Construction-time | `RecipeTitle` value object |
| "Users can only delete own recipes" | Behavioral | `RecipeService.delete` |
| "Pipeline + stages persisted atomically" | Aggregate | `PipelineRepository.save` |

Every invariant must have exactly one enforcement point. If an invariant doesn't fit cleanly into one category, it may need to be split or the aggregate boundaries need revisiting.

### Step 10: Completeness check

- [ ] Every entity in the ERD maps to a model
- [ ] Every aggregate has exactly one repository interface
- [ ] Every sequence diagram maps to either a controller method or a direct service call
- [ ] Every service has an interface with fully typed method signatures
- [ ] Every invariant is classified and has an identified enforcement point
- [ ] Every failure path is mapped to an error type
- [ ] The wiring plan covers all dependencies
- [ ] The config mapping covers all external boundaries
- [ ] No service imports another service (composition via DI only)
- [ ] No controller contains business logic
- [ ] No model contains behavioral logic

---

## For detailed patterns, read:

- **Mapping rules from domain artifacts to architecture** → `references/mapping-rules.md`
- **Output format, class diagram conventions, wiring plan structure** → `references/output-spec.md`
