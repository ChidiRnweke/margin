---
name: architecture-spec
description: Convert domain modeling artifacts into a complete architectural specification. Use this skill whenever the user has ERDs, sequence diagrams, invariants, and an interaction matrix from domain modeling and wants to translate them into an implementable architecture. Also trigger when the user says "turn this into an architecture", "what services do I need", "map this to code", "create the class diagrams", "design the architecture", or has a domain spec and wants to know how it maps to models, services, controllers, repositories, and factories. This skill enforces a strict layered architecture with dependency injection, aggregate-based repositories, stateless classes, and a clear separation between construction-time and behavioral invariants.
---

# Architecture Spec Skill

Take domain artifacts. Produce a complete architectural specification. Every entity, service, controller, repository, and wiring decision defined before any code is written.

## Reference files

Read these when working in the relevant area:

- `references/mapping-rules.md` — How to map ERDs to aggregates, interaction matrix to services and cross-cutting concerns, sequence diagrams to controllers, invariants to enforcement points, failures to error types
- `references/output-spec.md` — Class diagram conventions, wiring plan format, config mapping, the complete deliverable structure

---

## Input

This skill consumes the output of the domain modeling skill:

1. **Conceptual ERD** — entities, attributes, relationships with cardinality
2. **Sequence diagrams** — happy paths and failure paths for every operation
3. **Invariants file** — numbered rules grouped by entity/concern
4. **Interaction matrix** — the authoritative list of every operation in the system, grouped by concern area, with actors, participating entities, and per-interaction error contracts

If any of these are missing or incomplete, stop and tell the user. This skill does not guess at the domain — it translates a complete domain spec into architecture. Garbage in, garbage out.

---

## What this skill produces

A complete architectural specification that an implementation agent can execute without making structural decisions. Every class is named. Every method has a signature. Every dependency is explicit.

### Deliverables

1. **Cross-cutting concerns** — middleware, decorators, and infrastructure extracted from patterns that repeat across 80%+ of interactions. Identified before any service or controller design.

2. **Aggregate map** — which entities are aggregate roots, which are owned children, and the repository boundary for each aggregate.

3. **Model specifications** — every model class with its fields and construction-time invariants. Models are pure data. Validity is enforced at construction (Pydantic validators, smart constructors) — never by methods on the model.

4. **Service interfaces** — Protocol/interface for every service, with method signatures typed using domain models. Each service owns one domain concern (not one per entity). Services never import other services. Services are marked public or private.

5. **Controller specifications** — one controller per concern area (not per interaction). Each interaction becomes one method on the concern's controller. Dependencies are interface-typed. Job-triggered interactions bypass controllers entirely.

6. **Repository interfaces** — one repository per aggregate root. Methods handle the full atomic scope of an operation including cascades to children. ORM is an internal implementation detail — the interface speaks only in domain models.

7. **Wiring plan** — what the factory instantiates, what gets injected where, which services are public (used by controllers) vs private (injected into other services via DI), which interactions are job-triggered.

8. **Error mapping** — every failure path from the sequence diagrams and the interaction matrix's per-interaction error contracts mapped to a specific error type in the error hierarchy.

9. **Invariant classification** — every invariant categorized as construction-time (model), behavioral (service), or aggregate (repository), with the enforcing class identified.

10. **Config mapping** — external dependencies and configuration values derived from the domain's external system boundaries.

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

A repository method handles the **full atomic scope** of an operation — including cascade operations. If archiving an aggregate root cascades to children, the repository's archive method handles the entire cascade. If deleting a root orphans children in another aggregate, the repository documents that and the service coordinates.

This means:

- The repository `save` method persists the root and all its children in one operation
- Children are never persisted independently — always through the root
- Reading the aggregate returns the root with its children already loaded
- Deleting the root cascades to children within the aggregate
- Cascade/workflow operations (archive, soft-delete, status propagation) are explicit repository methods, not implicit ORM behavior

---

## Workflow

### Step 0: Extract cross-cutting concerns

Before designing any service or controller, scan the invariants file and the interaction matrix for patterns that repeat across 80%+ of interactions. These are **cross-cutting concerns** — they become middleware, decorators, or infrastructure. They are never duplicated in every controller or service method.

Common cross-cutting patterns:

- **Authorization / ownership scoping** — most interactions check that the acting user owns or has access to the target resource
- **Idempotency** — write operations that must be safely retryable
- **Audit emission** — most mutations emit an audit event with who/what/when
- **Optimistic concurrency** — entities with version fields checked on every write
- **Soft-delete filtering** — most reads exclude archived/deleted records

How to spot them:

1. Read each row in the interaction matrix. If a pattern (e.g., "check ownership", "emit audit event") appears in the error contracts or notes of 80%+ of interactions, it's cross-cutting.
2. Read the invariants file. Group invariants that apply identically across multiple entities — these are infrastructure, not per-service logic.
3. For each identified concern, decide the mechanism: middleware (runs before/after every request), decorator (applied per-method), or infrastructure service (injected everywhere).

Present the cross-cutting concerns as an assumption:

"From the interaction matrix and invariants, I see these cross-cutting concerns:

- **Ownership scoping** — 90% of interactions check `entity.user_id == requesting_user_id`. This becomes middleware that injects a scoped query filter, not a check in every service method.
- **Audit emission** — all mutations emit an audit event. This becomes a decorator or event hook on service methods.
- **Optimistic concurrency** — entities with `version` fields use version checks on write. This becomes a repository-level concern.

Does this match your expectations?"

Once confirmed, these concerns are **removed from individual service/controller design**. They are handled by infrastructure.

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

Services map to **domain concerns**, not individual entities. Multiple entities participate in a single service's operations. The interaction matrix's own section groupings are the primary signal for service boundaries.

Derivation logic:

1. **Read the interaction matrix sections.** Each section groups related interactions by concern area (e.g., "Pipeline Lifecycle", "Transform Management", "Execution & Monitoring"). Each section becomes a candidate service.
2. **Validate against sequence diagrams.** The entities that participate in a section's interactions should form a cohesive set. If an entity appears exclusively in one section, it clearly belongs to that service. If an entity spans multiple sections, it's shared data — accessed via repository, not a reason to merge services.
3. **Identify private services.** A service is **private** if it never appears as a direct target in any controller flow — it's only injected into other services via DI. Scan the sequence diagrams: if a participant is only ever called by another service participant (never by the actor or controller), it's private.

For each service, determine:

- **What domain concern does it own?** One service per cohesive behavior area — not per entity.
- **What methods does it expose?** Each interaction in its section of the interaction matrix becomes a method. Cross-reference with the sequence diagrams for the detailed flow.
- **What models does it take and return?** Input models and output models, typed with domain types.
- **What repository does it depend on?** Interface-typed. A service may depend on multiple repositories if its concern spans multiple aggregates.
- **What behavioral invariants does it enforce?** Each behavioral invariant from the invariants file is assigned to exactly one service.
- **Is it public or private?** Public services are used by controllers. Private services are only injected into other services.

### Step 4: Design controllers

Controllers mirror service groupings — **one controller per concern area**, not one per interaction. Each interaction in a concern area becomes one method on that concern's controller.

Grouping rules:

1. **Use the same sections from the interaction matrix** that defined service boundaries. Each section that has user-triggered interactions gets a controller.
2. **Each interaction becomes one method** on the controller. The method name describes the operation.
3. **Dependencies are service interfaces.** The controller declares the services it orchestrates.
4. **No business logic.** The controller calls services and composes results. If there's conditional logic over domain data, push it to a service.
5. **Parallel where possible.** If two service calls are independent (no data dependency between them), they run concurrently (TaskGroup in Python, Promise.all in TypeScript).

For interactions that involve only one service and no orchestration: no controller method. The route/loader calls the service directly via the factory.

**Job-triggered interactions** — Some interactions are triggered by background jobs or schedulers, not by users through HTTP. These bypass controllers entirely. They use the factory directly to obtain services. Identify which interactions are job-only by checking the actor column in the interaction matrix — if the actor is "System", "Scheduler", "Cron", or similar, it's job-triggered.

For each job-triggered interaction:

- **No controller method.** The job runner calls the factory to get the service and invokes the method directly.
- **Same service interface.** The service method is the same whether called by a controller or a job — the service doesn't know or care about the caller.
- **Document in the wiring plan** which interactions are job-triggered and what invokes them.

### Step 5: Design repository interfaces

For each aggregate root:

- **One repository interface.** Methods speak only in domain models — never ORM types.
- **Methods derived from flows.** Read the sequence diagrams — every "load", "find", "save", "delete" operation on this aggregate becomes a repository method.
- **Standard method patterns:** `find_by_id`, `find_by_{field}`, `save` (upsert the aggregate), `delete`. Only add what the flows actually need — don't speculatively add methods.
- **Cascade/workflow atomicity.** If an operation cascades (archiving a root soft-deletes children, deleting a root removes children), the repository method handles the entire cascade. This is an explicit method — `archive(id)` not just `save(root_with_archived_flag)`. The method name communicates the full scope of what happens atomically.

### Step 6: Map errors

Read every `alt` (failure) block in every sequence diagram. For each failure:

- **Identify the error type** from the error hierarchy: `InputError` (bad input / validation), `NotFoundError` (entity doesn't exist), `UnauthorisedError` (permission denied), `InfraError` (external system failure), or domain-specific subtypes if needed.
- **Identify where it's raised** — which service or model constructor.
- **Map it to the sequence diagram** — the `alt` block references the error by type.

### Step 7: Produce the wiring plan

The factory needs to know:

- **What to instantiate** — every concrete class.
- **What to inject where** — which service gets which repository, which controller gets which services.
- **Public vs private services** — a service is public if a controller depends on it. A service is private if only another service depends on it (via DI). Private services are never directly available to controllers. Derive this from the sequence diagrams: if a service participant is only ever called by another service (never by a controller or route), it's private.
- **Job-triggered interactions** — which interactions bypass controllers and are invoked directly by background jobs. List the job, the service method it calls, and the trigger.
- **Config dependencies** — which services/repositories need config values (API keys, connection strings, etc).

### Step 8: Produce config mapping

From the domain model's external system boundaries and the service dependencies:

- **Each external system** referenced in sequence diagrams needs connection config
- **Each service** that calls an external API needs credentials/URLs
- **Environment-specific values** (database URLs, feature flags) are listed explicitly
- **Fail-fast validation** — every config value is required at startup with no silent defaults for critical values

### Step 9: Identify job-triggered interactions

Scan the interaction matrix for interactions where the actor is not a user (System, Scheduler, Cron, Worker, etc.). These interactions:

- **Do not get controller methods.** They bypass HTTP entirely.
- **Use the same service interfaces** as user-triggered interactions. The service doesn't know or care who called it.
- **Are documented in the wiring plan** with: the job/trigger name, the service method invoked, the schedule or trigger condition.

If an interaction can be both user-triggered and job-triggered, the service method is the same — the controller calls it for user requests, the job runner calls it for scheduled invocations.

### Step 10: Classify invariants

Take the full invariants list from domain modeling and classify each one:

| Invariant                                | Category          | Enforced by                  |
| ---------------------------------------- | ----------------- | ---------------------------- |
| "Name must be non-empty"                 | Construction-time | `PipelineName` value object  |
| "Users can only delete own pipelines"    | Behavioral        | `PipelineService.delete`     |
| "Pipeline + stages persisted atomically" | Aggregate         | `PipelineRepository.save`    |
| "All mutations emit audit events"        | Cross-cutting     | Audit middleware / decorator |

Every invariant must have exactly one enforcement point. If an invariant doesn't fit cleanly into one category, it may need to be split or the aggregate boundaries need revisiting. Invariants classified as **cross-cutting** should already be covered by Step 0's infrastructure — verify they are.

### Step 11: Completeness check

- [ ] Cross-cutting concerns identified and extracted before service/controller design
- [ ] Every entity in the ERD maps to a model
- [ ] Every aggregate has exactly one repository interface
- [ ] Every interaction in the interaction matrix maps to either a controller method, a direct service call, or a job entry point
- [ ] Every service has an interface with fully typed method signatures
- [ ] Every service is classified as public or private
- [ ] Controllers are grouped by concern area (one controller per concern, not per interaction)
- [ ] Job-triggered interactions are identified and documented in the wiring plan
- [ ] Every invariant is classified and has an identified enforcement point
- [ ] Every failure path (from sequence diagrams and interaction matrix error contracts) is mapped to an error type
- [ ] The wiring plan covers all dependencies
- [ ] The config mapping covers all external boundaries
- [ ] No service imports another service (composition via DI only)
- [ ] No controller contains business logic
- [ ] No model contains behavioral logic
- [ ] No cross-cutting concern is duplicated in individual services or controllers

---

## For detailed patterns, read:

- **Mapping rules from domain artifacts to architecture** → `references/mapping-rules.md`
- **Output format, class diagram conventions, wiring plan structure** → `references/output-spec.md`
