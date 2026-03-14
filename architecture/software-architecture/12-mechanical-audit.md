# Mechanical Audit

This file records a skeptical audit of the domain-to-architecture conversion using independent subagent reviews of the source domain files.

## Audit Scope

Reviewed source files:

- `architecture/index.md`
- `architecture/margin-domain-model.md`
- `architecture/erd.md`
- `architecture/interaction-matrix.md`
- `architecture/invariants.md`
- `architecture/sequence-diagrams.md`
- `architecture/sequence-diagrams/01-auth-profile.md`
- `architecture/sequence-diagrams/02-aspects-milestones.md`
- `architecture/sequence-diagrams/03-tasks-recurrence.md`
- `architecture/sequence-diagrams/04-availability-planning.md`
- `architecture/sequence-diagrams/05-execution-reminders.md`
- `architecture/sequence-diagrams/06-data-audit-system.md`
- `architecture/traceability.md`

Reviewed destination set:

- every file in `architecture/software-architecture/`

## Audit Method

- Separate subagents reviewed the ERD, interaction matrix, invariants, sequence diagrams, and traceability/overview docs independently.
- Each subagent was instructed to be skeptical and unbiased.
- Findings were consolidated here.
- Where a finding exposed a straightforward documentation inconsistency, the architecture files were updated before this audit log was written.

## Subagent Verdict Summary

| Source Area               | Initial Verdict                               | Main Issues Found                                                                                                                                             | Status After Fix Pass |
| ------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------- |
| ERD                       | mostly covered, not fully exhaustive          | missing explicit model specs for `Session`, `ImportJob`, `ExportJob`, `AuditEvent`, `IdempotencyKey`, `SystemJobRun`; planning containment wording too coarse | improved              |
| Interaction matrix        | mostly translated, not fully faithful         | `AUTH-01` ownership inconsistency, missing `SYS-01` infra mapping, `TSK-01` dependency mismatch, some error-contract mismatches                               | improved              |
| Invariants                | all IDs covered, some ownership too generic   | weak structural representation for session/audit/system records; optimistic concurrency wording too broad                                                     | partially improved    |
| Sequence diagrams         | nearly all paths mapped                       | some non-exact raiser ownership, `REC-01` materializer gap, `TSK-01` defaults dependency mismatch                                                             | improved              |
| Traceability and overview | concern coverage reconstructable but implicit | source overview files missing from README, concern-level carry-over not explicit enough                                                                       | improved              |

## Fixes Applied Because of the Audit

- Added source references to `architecture/index.md` and `architecture/margin-domain-model.md` in `README.md`.
- Added `Session` model fields to `02-aggregates-and-models.md`.
- Expanded explicit model specs for `ImportJob`, `ExportJob`, `AuditEvent`, `IdempotencyKey`, and `SystemJobRun` in `02-aggregates-and-models.md`.
- Added `IPlanningProfileRepository` to `ITaskService` dependencies in `03-services.md` and wiring in `07-wiring-and-config.md`.
- Added `IRecurrenceMaterializer` to `IRecurrenceService` dependencies in `03-services.md` and wiring in `07-wiring-and-config.md`.
- Added `IIdentityProviderGateway` as the explicit owner for `AUTH-01`/`AUTH-02` infrastructure work in `03-services.md`, `04-controllers-and-jobs.md`, and `10-sequence-failure-mapping.md`.
- Added explicit `SYS-01` infrastructure flow to `04-controllers-and-jobs.md`.
- Added global mutation-rule notes to `09-interaction-traceability.md` so idempotency and audit rules are explicitly universal for mutation flows.
- Reconciled several failure-path ownership rows in `10-sequence-failure-mapping.md` and added missing ownership branches where the interaction contracts allowed them.

## Remaining Non-Zero Ambiguities

These are not ignored; they are the remaining places where the architecture is still a design translation rather than a literal mirror.

### Aggregate decisions remain architectural, not purely mechanical

- `Aspect`, `Milestone`, `Task`, and `Reminder` boundaries are justified in `11-aggregate-boundary-audit.md`, but they remain architecture decisions inferred from the domain rather than direct statements in the source files.

### Optimistic concurrency scope is still interpreted

- The domain invariants require versioned mutable aggregates broadly.
- The software architecture now models versioned business aggregates clearly, but some operational/system records still rely on status-oriented lifecycle documentation more than explicit version semantics.

### Query read-model ownership is still partly service-level

- Search and canonical sort behavior are now called out in repository responsibilities, but not every read projection is decomposed into separate DTO specifications.

## Mechanical Coverage Statement

- `architecture/erd.md` -> covered by `02-aggregates-and-models.md`, `05-repositories.md`, `11-aggregate-boundary-audit.md`, plus supporting invariant/service docs.
- `architecture/interaction-matrix.md` -> covered line-by-line by `09-interaction-traceability.md`, with controller/job/service ownership in `03-services.md` and `04-controllers-and-jobs.md`.
- `architecture/invariants.md` -> covered line-by-line by `08-invariant-enforcement-matrix.md`, with higher-level categorization in `06-invariants-and-errors.md`.
- `architecture/sequence-diagrams.md` and `architecture/sequence-diagrams/*.md` -> covered by `10-sequence-failure-mapping.md`, with interaction ownership in `09-interaction-traceability.md`.
- `architecture/traceability.md` -> covered across the architecture set, with concern-level equivalence documented in this audit summary.
- `architecture/index.md` and `architecture/margin-domain-model.md` -> now explicitly recognized as source context in `README.md`.

## Confidence Statement

- This is now an audited conversion with independent skeptical review, not just a single-pass interpretation.
- It is substantially closer to exhaustive than the earlier version.
- It is still honest architecture work rather than a claim of formal proof: where the source domain leaves room for architectural judgment, that judgment is now documented rather than hidden.
