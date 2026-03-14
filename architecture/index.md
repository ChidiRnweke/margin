# Margin Domain Overview

Margin is a personal planning domain that helps a user allocate limited weekly time across life aspects, instead of optimizing only for urgency.

Core domain structure:

- A user defines **aspects** (for example reading, sports, friends).
- Each aspect can contain **milestones** and **tasks**.
- Tasks can be scheduled into weekly planning cycles via **allocations**.
- Weekly planning uses a deterministic heuristic scheduler rather than an exact optimization solver in v1.
- **Availability blocks** constrain what time can be planned.
- **Recurrence rules** generate repeated work.
- **Reminders** support task execution.
- **Audit events** capture immutable write history.

Domain references:

- `architecture/erd.md`
- `architecture/interaction-matrix.md`
- `architecture/sequence-diagrams.md`
- `architecture/invariants.md`
- `architecture/traceability.md`
- `architecture/margin-domain-model.md`

UI/UX references:

- `DESIGN_SYSTEM.md` — visual identity, tokens, style rules, component conventions
- `architecture/ui-screen-inventory.md` — every screen mapped to routes and interactions
- `architecture/ui-ux-patterns.md` — UX pattern specs for each feature
- `architecture/ui-wireframes.md` — ASCII wireframes for all major screens
