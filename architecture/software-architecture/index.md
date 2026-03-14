# Margin Software Architecture

This folder translates the domain artifacts in `architecture/` into an implementation-ready software architecture.

Source domain artifacts:

- `architecture/index.md`
- `architecture/margin-domain-model.md`
- `architecture/erd.md`
- `architecture/interaction-matrix.md`
- `architecture/invariants.md`
- `architecture/sequence-diagrams.md`
- `architecture/traceability.md`

Documents in this folder:

- `01-overview-and-cross-cutting.md` - architecture style, ownership model, cross-cutting concerns, dependency rules
- `02-aggregates-and-models.md` - aggregate boundaries, model specifications, value objects
- `03-services.md` - public and private service interfaces, responsibilities, interaction coverage
- `04-controllers-and-jobs.md` - controller grouping, method mapping, job-triggered flows
- `05-repositories.md` - repository interfaces and persistence boundaries
- `06-invariants-and-errors.md` - invariant classification and primary error mapping
- `08-invariant-enforcement-matrix.md` - line-by-line `INV-001` through `INV-189` enforcement map
- `07-wiring-and-config.md` - factory wiring, dependency graph, configuration mapping, completeness checklist
- `09-interaction-traceability.md` - per-interaction mapping from domain interaction to controller/service/repository/invariants/errors
- `10-sequence-failure-mapping.md` - sequence-diagram `alt` path conversion into exact raising layer and error type
- `11-aggregate-boundary-audit.md` - aggregate root and child audit justified from the ERD, flows, and invariants
- `12-mechanical-audit.md` - source-to-architecture audit log based on skeptical subagent review
- `13-infrastructure-considerations.md` - required infrastructure, job/runtime topology, and config implications

Design principles:

- Models are pure data plus construction-time validation.
- Repositories own aggregate persistence and optimistic concurrency.
- Services own business rules, orchestration, and state transitions.
- Controllers are thin transport adapters only.
- Jobs bypass controllers and call services through the factory.
- Authorization, idempotency, audit, pagination, and concurrency are cross-cutting infrastructure concerns.

Exhaustiveness note:

- `08-invariant-enforcement-matrix.md` is the line-by-line invariant map.
- `09-interaction-traceability.md` is the line-by-line interaction conversion map.
- `10-sequence-failure-mapping.md` is the line-by-line failure-path conversion map.
- `11-aggregate-boundary-audit.md` is the aggregate-boundary proof document.

Together, these files are intended to close the gap between the source domain documents and the software architecture translation.
