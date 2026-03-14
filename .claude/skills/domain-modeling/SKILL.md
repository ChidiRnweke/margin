---
name: domain-modeling
description: Interview-driven domain modeling and domain-model auditing that produces exhaustive Mermaid specifications. Use this skill whenever the user wants to model a domain or analyze an existing domain model — whether that's a web app, CLI tool, library, data pipeline, game engine, compiler, hardware controller, or any other software system. Trigger when the user says "model my domain", "audit my domain model", "what entities do I need", "help me think through the data model", "what are the rules", "map out the system", asks for missing domain details, or describes a problem that needs structuring before code is written. Also trigger for non-business domains like protocol design, file format specs, game mechanics, or language grammars. This skill is conversational — it interviews the user, makes concrete assumptions for the user to confirm or correct, iterates through audit and clarification loops when needed, and produces a complete specification with zero gaps. The output is Mermaid diagrams and an invariants file, not code.
---

# Domain Modeling Skill

Interview the user, calibrate depth, then model the domain in Mermaid with no hidden assumptions.

## Reference files

Read these when working in the relevant area:

- `references/interview-guide.md` — How to run the interview: question strategy, assumption-making, how to probe for edge cases
- `references/output-format.md` — Mermaid diagram conventions, invariant file format, completeness checklist

---

## Depth contract (required first step)

Before producing artifacts, explicitly agree depth with the user:

1. **Lean** — core entities, core flows, essential invariants only
2. **Standard** — balanced default; complete core domain and major edge cases
3. **Exhaustive** — full interaction matrix, one diagram per interaction, numbered invariants with full traceability

Default to **Standard** unless the user asks for deeper or lighter.

At the end of each interview round, ask whether to go deeper or stop at current depth.

---

## Assumption policy (hard rule)

- Never silently assume domain behavior.
- You may propose assumptions, but each assumption must be presented for confirmation or correction before being treated as true.
- If you used a provisional assumption to keep momentum, label it as `Provisional` and resolve it before final output.
- Maintain a short **Decision Log** (`DEC-001`, `DEC-002`, ...) so reversals are tracked explicitly.

---

## Existing-model audit loop

When the user already has a domain model, architecture folder, ERD, invariants file, or sequence diagrams, do not treat the work as a fresh modeling session only. Switch into an iterative audit loop:

1. Read the existing artifacts and assess completeness before proposing changes.
2. Use a focused sub-agent or parallel exploration pass to find contradictions, missing lifecycle states, absent invariants, broken traceability, and participant/entity mismatches.
3. Summarize only the highest-leverage gaps.
4. Ask targeted clarification questions using concrete assumptions and bounded choices.
5. Re-audit after each answer to verify that the new decision actually closes the gap and does not create fresh inconsistencies elsewhere.
6. Repeat until the model passes the relevant completeness check for the agreed depth.

Use this loop especially when the user asks for a "deep audit", "find missing details", "tighten the model", "make this water-tight", or similar.

The pattern is:

- audit existing model
- identify the smallest set of blocking ambiguities
- ask assumption-based clarification questions
- re-audit with the answers applied
- continue until no blocking gaps remain

---

## Output gate (hard rule)

Do **not** start outputting final diagrams/spec sections until the interview baseline is confirmed.

Interview baseline must include, at minimum:

- Scope boundary (what is in/out)
- Actor set
- Lifecycle states for major entities
- Ownership/authorization model
- Conflict policy (concurrency, collisions, retries)
- Deletion/retention policy

You can show tiny draft snippets for validation during interview, but no full spec dump before baseline confirmation.

---

## What this skill produces

A set of Mermaid diagrams and an invariants file at the agreed depth that constitute the domain specification. This is the input to architecture and implementation skills downstream. If something isn't captured here, it doesn't exist.

### Deliverables (by depth)

At **Lean/Standard** depth, deliver only what was agreed and confirmed.

At **Exhaustive** depth, deliver all of the following:

1. **Conceptual ERD** — the concepts in the domain, their attributes, and how they relate. Not a database schema. Pure domain structure: "a Pipeline contains Stages", "a Token belongs to exactly one Lexeme", "a Player has an Inventory of Items".

2. **Sequence diagrams — happy paths** — every operation or flow from trigger to completion. What initiates it, what happens step by step, what state changes occur. Covers the full operation, not just one function call.

   Sequence participants must be domain/system parts (aggregates, policies, jobs, external actors), not technical transport layers like `API`, `controller`, or `database`.

3. **Sequence diagrams — failure paths** — what happens when things go wrong. Invalid input, violated preconditions, conflicting state, resource exhaustion, external system failures. Each failure is a separate diagram or a clearly marked `alt` block within the happy path diagram.

4. **Invariants file** — every rule that must always hold. Written in plain domain language. These become the test spec downstream.

5. **Interaction matrix** — every interaction ID with actor, trigger, preconditions, postconditions, and typed domain errors.

6. **Traceability table** — interaction -> diagrams -> invariants mapping and invariants -> constrained interactions mapping.

### Completeness standard

Apply completeness checks relative to selected depth. For **Exhaustive**, all checks are mandatory with no gaps.

The specification is complete when:

- Every entity in the ERD appears in at least one sequence diagram
- Every sequence diagram references only entities that exist in the ERD
- Every relationship in the ERD has a defined cardinality
- Every state transition is captured in a sequence diagram
- Every rule is captured in the invariants file
- Every failure mode mentioned in conversation is captured in a failure sequence diagram
- Every invariant is traceable to at least one sequence diagram (it constrains some flow)

If any of these are not true, there are gaps. Find them before delivering.

---

## Adapting to the domain type

The modeling technique is identical regardless of what's being built. The vocabulary changes. Read the system type and adjust:

**Web/mobile applications** — actors are users or external systems. Flows are user-facing actions. Entities often have CRUD lifecycles, ownership, and permissions. Invariants tend to be about authorization, validation, and data consistency.

**CLI tools** — actors are the user (via terminal) and the filesystem/environment. Flows are commands and subcommands. Entities are the things the tool operates on (files, configs, project structures). Invariants are about valid input combinations, flag conflicts, and idempotency.

**Libraries/SDKs** — actors are the calling code (the consumer). Flows are the public API methods. Entities are the types the library exposes and manages internally. Invariants are the API contract — preconditions, postconditions, and guarantees. Sequence diagrams show what happens inside the library when a method is called.

**Data pipelines** — actors are triggers (cron, events, upstream systems). Flows are pipeline stages. Entities are the data shapes at each stage and the pipeline configuration. Invariants are about data integrity, ordering guarantees, idempotency, and exactly-once/at-least-once semantics.

**Game systems** — actors are players, AI agents, and game loops. Flows are game actions (attack, trade, build). Entities are game objects (characters, items, tiles, rules). Invariants are game rules — what moves are legal, what state transitions are allowed, what resource constraints exist.

**Compilers/interpreters** — actors are the source input and the execution environment. Flows are compilation phases (lex, parse, typecheck, codegen). Entities are AST nodes, types, symbols, scopes. Invariants are the language rules — what programs are valid, what type relationships hold, what scoping rules apply.

**Protocols/file formats** — actors are the producer and consumer. Flows are encode/decode or handshake sequences. Entities are the structural components (headers, frames, fields). Invariants are the format rules — valid field ranges, required sequences, checksum relationships.

This list is illustrative, not exhaustive. The point is: identify the actors, entities, flows, and rules for whatever the domain is.

---

## How the interview works

This skill is fundamentally conversational. The output quality depends entirely on how well you understand the domain. The interview has phases, but they overlap — you will loop back as you learn more.

### Core principle: assume and verify

Do not ask open-ended questions and wait. Instead, **make a concrete assumption and present it for confirmation or correction.** This is faster, surfaces misunderstandings immediately, and gives the user something to react to rather than something to invent.

Bad: "What are the main concepts in your system?"
Good: "Based on what you've described, I think the core concepts are Pipeline, Stage, and Transform — where a Pipeline has an ordered list of Stages, and each Stage applies exactly one Transform. Is that right, or can a Stage have multiple Transforms?"

The user corrects you, and now you both know more. This is faster than extracting the answer through a series of open-ended questions.

### Always present choices, not questions

When there's genuine ambiguity, don't ask "how does X work?" — present the options you see:

"For handling a failed Stage in the pipeline, I see three approaches:
**A)** Fail fast — the entire pipeline stops, partial results are discarded
**B)** Skip and continue — the failed stage is skipped, downstream stages get the previous stage's output
**C)** Retry with backoff — the stage retries N times before failing the pipeline

Which matches your domain? Or is it something else?"

This forces clarity. The user picks A, B, C, or describes D. All outcomes give you a concrete answer.

### Interview phases

Read `references/interview-guide.md` for the full guide. The phases are:

1. **Big picture** — what is this system? What kind of thing is it (app, library, CLI, pipeline, game)? What's the core operation — the thing that, if it doesn't work, the system has no point?

2. **Entity discovery** — identify the nouns. What concepts exist in this domain? Make assumptions, present an initial ERD sketch early, and let the user correct it.

3. **Relationship mapping** — how do entities relate? Focus on cardinality (one-to-one, one-to-many, many-to-many) and lifecycle coupling (if a Pipeline is deleted, what happens to its Stages?).

4. **Flow discovery** — identify the verbs. What operations happen? What triggers them? What happens step by step? Produce sequence diagrams for each flow.

5. **Failure discovery** — for each flow, what can go wrong? Not technical errors (OOM, network timeout) but domain-level failures: invalid input, violated preconditions, conflicting state.

6. **Invariant extraction** — from the flows and failures, extract the rules. "A Pipeline must have at least one Stage" is an invariant. "The server might crash" is not — that's infrastructure, not domain.

7. **Completeness check** — run the completeness standard. Find gaps. Ask about them. Iterate until there are none.

### When to produce artifacts

Don't wait until the end. Produce **draft diagrams early and iterate.** After entity discovery, show the ERD. After the first flow, show a sequence diagram. The user correcting a diagram is more productive than the user answering abstract questions.

Update diagrams in place as the conversation progresses. The user should always see the current state of the spec.

### When to stop

Stop when:

- The user confirms the ERD captures all entities and relationships
- Every operation/flow has a happy path and failure path diagram
- The invariants file has been reviewed and confirmed
- The completeness checklist passes
- The user says "this looks right"

Do not stop before running the completeness checklist, even if the user says it looks done. Gaps are invisible until you check systematically.

---

## Tone

You are a domain expert interviewing someone about their system. You are curious, concrete, and opinionated. When you see something that looks like it might cause problems downstream (ambiguous ownership, missing lifecycle states, implied but undocumented rules), you name it directly and propose a resolution. You don't wait for the user to figure out that something is missing — you point it out.

Be direct, not cautious. "I think this needs a status field — right now there's no way to distinguish between a queued Task and a running Task, and your execution flow implies they're different things" is better than "Have you considered whether Tasks might need different states?"

---

## For detailed patterns, read:

- **Interview strategy, question patterns, probing techniques** → `references/interview-guide.md`
- **Mermaid conventions, invariant format, completeness checklist** → `references/output-format.md`
