# Component Decision Rules

For each component, when to use it, when not to, and how to integrate it.

---

## Hatchet — Background Workflows

### Use when

- An operation is too slow for a request cycle (file processing, LLM calls, bulk data operations)
- An operation needs durable retry — if it fails mid-way, it resumes from the failed step
- An operation is cron-triggered (nightly cleanup, periodic sync, scheduled computation)
- An operation is multi-step with steps that fail independently

### Don't use when

- The operation completes in under a few hundred milliseconds — keep it synchronous
- The operation is a simple Postgres read/write — no queue needed
- The user needs the result immediately — return it in the response
- The only scheduled need is a single simple cron — a lightweight cron container or `pg_cron` may suffice

### Integration pattern

**Workflow definition:**
```python
from hatchet_sdk import Hatchet, Context

hatchet = Hatchet()

@hatchet.workflow()
class GenerateReportWorkflow:
    @hatchet.step(retries=2, timeout="30s")
    async def gather_data(self, context: Context):
        project_id = context.workflow_input()["project_id"]
        config = AppConfig.from_env()
        async with config.async_session() as session:
            factory = AppFactory(session=session, config=config, user_id="system")
            data = await factory.get_report_service().gather(project_id)
        return {"project_id": project_id, "row_count": len(data)}

    @hatchet.step(parents=["gather_data"], retries=2, timeout="120s")
    async def render_pdf(self, context: Context):
        prev = context.step_output("gather_data")
        config = AppConfig.from_env()
        async with config.async_session() as session:
            factory = AppFactory(session=session, config=config, user_id="system")
            key = await factory.get_report_service().render_and_upload(prev["project_id"])
        return {"artifact_key": key}
```

**Cron workflow:**
```python
@hatchet.workflow(on_crons=["0 3 * * *"])
class NightlyCleanupWorkflow:
    @hatchet.step(timeout="300s")
    async def sweep(self, context: Context):
        config = AppConfig.from_env()
        async with config.async_session() as session:
            factory = AppFactory(session=session, config=config, user_id="system")
            await factory.get_cleanup_service().sweep_expired()
```

**Triggering from application code:**
```python
# In a controller, after the synchronous part:
await hatchet.client.admin.run_workflow(
    "GenerateReportWorkflow",
    {"project_id": project.id},
)
# Returns immediately. Workflow runs in the worker.
```

**Worker entry point:**
```python
# myapp/workers.py
from hatchet_sdk import Hatchet
from myapp.workflows.generate_report import GenerateReportWorkflow
from myapp.workflows.nightly_cleanup import NightlyCleanupWorkflow

hatchet = Hatchet()
worker = hatchet.worker("myapp-worker")
worker.register_workflow(GenerateReportWorkflow())
worker.register_workflow(NightlyCleanupWorkflow())
worker.start()
```

**Docker (dev):**
```yaml
hatchet-engine:
  image: ghcr.io/hatchet-dev/hatchet/hatchet-engine:latest
  environment:
    DATABASE_URL: postgresql://${DB_USER:-myapp}:${DB_PASSWORD:-myapp}@postgres:5432/hatchet
    SERVER_AUTH_COOKIE_INSECURE: "true"
  ports:
    - "8080:8080"
    - "7077:7077"
  depends_on:
    postgres:
      condition: service_healthy

worker:
  build: ./backend
  command: python -m myapp.workers
  env_file: ./backend/.env
  depends_on:
    hatchet-engine:
      condition: service_healthy
    postgres:
      condition: service_healthy
```

In prod, Hatchet engine is already running. The project only deploys the worker.

**Config:**
```
# .env (dev)
HATCHET_CLIENT_TOKEN=<from local hatchet dashboard at localhost:8080>

# Infisical (prod)
HATCHET_CLIENT_TOKEN=<production token>
```

---

## Redis — Caching and Sessions

### Use when

- **Session/token caching:** the backend validates auth tokens on every request and hitting Postgres per request is wasteful
- **Expensive computed values:** a read endpoint serves data that's expensive to compute but changes infrequently, and the endpoint is hit often
- **Rate limiting:** the architecture needs per-user or per-endpoint rate limiting
- **Hatchet or ARQ backend:** if you're already adding Redis for caching, task queue libraries can piggyback on it

### Don't use when

- The project has no auth or uses cookie-based sessions handled by SvelteKit (no backend token resolution)
- Read queries are fast enough from Postgres with proper indexes
- There's no frequently-hit expensive computation
- You're considering it "just in case" — don't

### Integration pattern

**Session caching:**
```python
async def resolve_token(self, token_hash: str) -> User | None:
    # Check cache first
    cached = await self.redis.get(f"session:{token_hash}")
    if cached:
        return User.model_validate_json(cached)

    # Miss — hit Postgres, populate cache
    user = await self.session_repo.find_by_token(token_hash)
    if user:
        await self.redis.setex(f"session:{token_hash}", 300, user.model_dump_json())
    return user

async def invalidate_session(self, token_hash: str):
    await self.redis.delete(f"session:{token_hash}")
```

**Computed value caching:**
```python
async def get_dashboard_stats(self, project_id: str) -> DashboardStats:
    key = f"stats:{project_id}"
    cached = await self.redis.get(key)
    if cached:
        return DashboardStats.model_validate_json(cached)

    stats = await self._compute_stats(project_id)
    await self.redis.setex(key, 600, stats.model_dump_json())
    return stats

# Bust on write:
async def update_project(self, project_id: str, input: UpdateInput) -> Project:
    result = await self.repo.save(project)
    await self.redis.delete(f"stats:{project_id}")
    return result
```

**Key naming:** `{concern}:{identifier}` — `session:{token_hash}`, `stats:{project_id}`, `rate:{user_id}:{window}`

**Docker (dev):**
```yaml
redis:
  image: redis:7-alpine
  command: redis-server --appendonly yes
  ports:
    - "${REDIS_PORT:-6379}:6379"
  volumes:
    - redisdata:/data
  healthcheck:
    test: ["CMD", "redis-cli", "ping"]
    interval: 5s
    timeout: 3s
    retries: 5
```

**Config:**
```
# .env (dev)
REDIS_URL=redis://localhost:6379/0

# Infisical (prod)
REDIS_URL=<production redis URL>
```

---

## MinIO — Object Storage

### Use when

- The architecture has **export operations** that produce downloadable files
- The architecture has **import operations** that accept uploaded files
- The architecture has **user uploads** (avatars, attachments, documents)
- The architecture has **generated artifacts** (reports, thumbnails, processed output)

### Don't use when

- The project has no file artifacts of any kind
- The only "files" are JSON responses returned inline — those aren't artifacts, they're API responses
- You're considering it for "future file support" — add it when a file operation actually appears

### Integration pattern

```python
from miniopy_async import Minio

@dataclass
class AppConfig:
    minio_endpoint: str
    minio_access_key: str
    minio_secret_key: str
    minio_secure: bool = False  # True in prod
    minio_bucket: str = "myproject"

    def get_minio(self) -> Minio:
        return Minio(
            self.minio_endpoint,
            access_key=self.minio_access_key,
            secret_key=self.minio_secret_key,
            secure=self.minio_secure,
        )
```

**Bucket/key structure:** `{project-bucket}/{type}/{identifier}.{ext}`
```
myproject/
├── exports/{job_id}.json
├── imports/{job_id}/original.json
├── uploads/{entity_type}/{entity_id}/{filename}
└── generated/{type}/{id}.{ext}
```

**Upload:**
```python
async def store_artifact(self, key: str, data: bytes, content_type: str) -> str:
    await self.minio.put_object(
        self.config.minio_bucket, key, io.BytesIO(data), len(data),
        content_type=content_type,
    )
    return key
```

**Pre-signed download:**
```python
async def get_download_url(self, key: str, expires: int = 3600) -> str:
    return await self.minio.presigned_get_object(
        self.config.minio_bucket, key, expires=timedelta(seconds=expires),
    )
```

**Docker (dev):**
```yaml
minio:
  image: minio/minio:latest
  command: server /data --console-address ":9001"
  environment:
    MINIO_ROOT_USER: ${MINIO_ACCESS_KEY:-minioadmin}
    MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY:-minioadmin}
  volumes:
    - miniodata:/data
  ports:
    - "9000:9000"
    - "9001:9001"
  healthcheck:
    test: ["CMD", "mc", "ready", "local"]
    interval: 5s
    timeout: 3s
    retries: 5
```

**Config:**
```
# .env (dev)
MINIO_ENDPOINT=localhost:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_SECURE=false
MINIO_BUCKET=myproject

# Infisical (prod)
MINIO_ENDPOINT=<prod minio>
MINIO_ACCESS_KEY=<from Infisical>
MINIO_SECRET_KEY=<from Infisical>
MINIO_SECURE=true
MINIO_BUCKET=myproject
```

---

## pgvector — Semantic Search

### Use when

- The architecture has operations that take freeform text and return **semantically similar** entities
- The spec explicitly mentions embeddings, vector similarity, or semantic search
- There's an LLM integration that produces embeddings

### Don't use when

- Search is keyword-based → use Postgres `tsvector` + GIN index
- Search is substring matching → use `ILIKE`
- Search is filtering + sorting → use standard Postgres queries
- You're considering it because "AI" — only add it for actual similarity search operations

### Integration pattern

Use `pgvector/pgvector:pg16` as the Postgres image instead of `postgres:16`:

```yaml
postgres:
  image: pgvector/pgvector:pg16
  # ... everything else unchanged
```

```sql
CREATE EXTENSION IF NOT EXISTS vector;
ALTER TABLE documents ADD COLUMN embedding vector(1536);
CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
```

```python
from pgvector.sqlalchemy import Vector

class DocumentORM(Base):
    __tablename__ = "documents"
    embedding = mapped_column(Vector(1536), nullable=True)

# Repository method:
async def find_similar(self, embedding: list[float], limit: int = 10) -> list[Document]:
    result = await self._session.execute(
        select(DocumentORM)
        .order_by(DocumentORM.embedding.cosine_distance(embedding))
        .limit(limit)
    )
    return [self._to_domain(row) for row in result.scalars()]
```

Embeddings are typically computed in a Hatchet workflow (LLM call is slow) and written to Postgres. The similarity query itself is synchronous and fast.

No additional Docker service — pgvector is a Postgres extension, just a different image.
