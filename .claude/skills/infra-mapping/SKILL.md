---
name: infra-mapping
description: Map architectural specifications to infrastructure components. Use this skill when the user has an architecture spec and needs to identify which operations require infrastructure beyond Postgres — Hatchet workflows, Redis caching, MinIO storage, pgvector search — and how they wire into the application. Also trigger when the user says "what infrastructure does this need", "should this be a Hatchet workflow", "do I need Redis here", "where does this file go", or is deciding how operations map onto available infrastructure. This skill is ruthlessly minimal — Postgres is the only default. Everything else must be justified by a concrete operation in the architecture spec.
---

# Infrastructure Mapping

Read the architecture spec. Find the operations that need more than Postgres. Map them to the right component. Don't add anything the architecture doesn't demand.

## Reference files

- `references/component-decision.md` — Decision rules for Hatchet, Redis, MinIO, pgvector: when to use, when not to, integration patterns

---

## Available infrastructure

The VPS has these components available. That does not mean every project uses them. A project only wires in what its architecture spec requires.

| Component                         | Available | Used by default                                                                           |
| --------------------------------- | --------- | ----------------------------------------------------------------------------------------- |
| **PostgreSQL**                    | ✅        | ✅ Every project                                                                          |
| **Redis**                         | ✅        | ❌ Only if caching or session store needed                                                |
| **Hatchet**                       | ✅        | ❌ Only if background workflows or cron jobs needed                                       |
| **MinIO**                         | ✅        | ❌ Only if file artifacts needed                                                          |
| **pgvector** (Postgres extension) | ✅        | ❌ Only if semantic search needed                                                         |
| **OpenTelemetry collector**       | ✅ (prod) | App-side instrumentation always; collector already running in prod, optional dev override |

The backend may be **FastAPI (Python)** or **SvelteKit-only** depending on the project.

Config is **Infisical** in production, **`.env` fallback** in development.

---

## What this skill produces

1. **Operation classification** — every non-synchronous operation from the architecture spec tagged with which component it needs and why.

2. **Component list** — only the components this project actually uses, with rationale for each.

3. **Integration specs** — for each used component: how it connects, which services consume it, key patterns, invalidation/lifecycle.

4. **Docker Compose** — containing only Postgres plus whatever the classification identified. Nothing speculative.

5. **Config additions** — `.env` entries for dev, Infisical entries for prod, for the components actually used.

---

## Workflow

### Step 1: Classify every operation

Read every service method and controller method in the architecture spec. For each, ask four questions:

**Is it too slow or too unreliable for a request cycle?**
→ Hatchet workflow. Examples: file processing, LLM calls, bulk imports, multi-step jobs with retries.

**Is it triggered on a schedule?**
→ Hatchet cron workflow. Examples: nightly cleanup, periodic recomputation, expiry sweeps.

**Does it read the same data on nearly every request?**
→ Redis cache. Examples: session/token resolution, slowly-changing computed values served on every page load.

**Does it produce or consume files?**
→ MinIO. Examples: exports, imports, uploads, generated artifacts.

**Does it need meaning-based similarity search?**
→ pgvector. Examples: "find similar documents", semantic matching. Not: substring search, keyword filtering, full-text search (those are plain Postgres).

Most operations will be **synchronous with Postgres only**. Don't list those — list only the exceptions.

```markdown
| Operation                  | Component    | Reason                              |
| -------------------------- | ------------ | ----------------------------------- |
| Generate PDF report        | Hatchet      | Slow (rendering), user doesn't wait |
| Nightly stale-data cleanup | Hatchet cron | Scheduled, no user trigger          |
| Authenticate request       | Redis        | Token validation on every request   |
| Download generated report  | MinIO        | File artifact retrieval             |
| "Find similar projects"    | pgvector     | Semantic similarity over embeddings |
```

If this table is empty — the project only needs Postgres. That's fine. Most CRUD apps are Postgres-only.

### Step 2: Determine the component list

From the classification, derive what this project actually uses:

```markdown
## Components for this project

| Component  | Needed | Operations                         |
| ---------- | ------ | ---------------------------------- |
| PostgreSQL | ✅     | Everything                         |
| Redis      | ✅     | Auth token caching (every request) |
| Hatchet    | ✅     | PDF generation, nightly cleanup    |
| MinIO      | ✅     | Report file storage                |
| pgvector   | ❌     | No semantic search operations      |
```

### Step 3: Design integration for each used component

For each component in the list, specify the integration. See `references/component-decision.md` for patterns per component.

### Step 4: Produce Docker Compose

Build the compose file from **only** what was identified. Start with Postgres. Add each component that earned its place.

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16 # or pgvector/pgvector:pg16 if pgvector needed
    # ...

  # Only if Redis was justified:
  redis:
    image: redis:7-alpine
    # ...

  # Only if Hatchet was justified:
  hatchet-engine:
    image: ghcr.io/hatchet-dev/hatchet/hatchet-engine:latest
    # ...
  worker:
    build: ./backend
    command: python -m myapp.workers
    # ...

  # Only if MinIO was justified:
  minio:
    image: minio/minio:latest
    # ...

  # Application services
  backend:
    # ...
  frontend:
    # ...
```

### Step 5: Produce config additions

Only for the components actually used:

```markdown
### .env (development)

# Only if Redis used:

REDIS_URL=redis://localhost:6379/0

# Only if Hatchet used:

HATCHET_CLIENT_TOKEN=<from local hatchet dashboard>

# Only if MinIO used:

MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin

### Infisical (production)

# Same keys, production values from Infisical
```

---

## Principles

### Postgres is the only default

Every project gets Postgres. Nothing else is assumed. Redis, Hatchet, MinIO, and pgvector are available on the VPS but they are not wired into a project unless a specific operation in the architecture spec requires them.

### Justify every component

If you can't point to a specific operation in the classification table that needs it, don't add it. "We might need caching later" is not a justification. "Auth token resolution hits Postgres 50 times per second" is.

### Postgres can do more than you think

Before reaching for another component:

- Full-text search → `tsvector` + GIN index, not pgvector
- Simple scheduled jobs → `pg_cron` or a lightweight cron container, not necessarily Hatchet
- Queuing → `SKIP LOCKED` pattern, though Hatchet is cleaner for anything non-trivial
- Substring search → `ILIKE`, not anything else

### Single machine, single instance

No distributed locks. No consumer groups. No sharding. One instance of each service. If an operation needs coordination, it happens in-process or via Postgres advisory locks.

### Postgres is always the source of truth

Redis is a cache — if it goes down, the app is slower but not broken. MinIO holds artifacts, but metadata and job state live in Postgres. Hatchet orchestrates work, but domain state lives in Postgres.

---

## For decision rules and integration patterns:

- **Hatchet, Redis, MinIO, pgvector** → `references/component-decision.md`
