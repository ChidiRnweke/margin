# Architecture Compliance

## Dependency Graph Audit

| Layer | Allowed Dependencies | Violations | Status |
|-------|---------------------|------------|--------|
| Models/Value Objects | None (pure) | None | Clean |
| Repositories (contracts) | Models, Value Objects | None | Clean |
| Repositories (postgres) | Contracts, Models, DB schema, Drizzle | None | Clean |
| Services (contracts) | Models, Value Objects | None | Clean |
| Services (implementations) | Contracts (repos + services), Models, VOs, Infra interfaces | None | Clean |
| Controllers | Service contracts, Models, DTOs | None | Clean |
| Jobs | Service contracts, Infra | None | Clean |
| Routes/Pages | Controllers (via factory), DTOs, Components | None | Clean |
| Components | Stores, DTOs, Primitives | None | Clean |
| Factory | All contracts, all implementations | None | Clean |

## Rules

1. Models never import from repositories, services, controllers, or infrastructure
2. Repositories never import from services or controllers
3. Services never import from controllers or routes
4. Controllers never import from routes
5. No service-to-service direct dependency (only through constructor injection of interfaces)
6. Jobs never call controllers
7. Routes never bypass services to reach repositories directly
8. Factory is the only composition root

## Scan Results

Scanned at v1 implementation completion. Results:

### Rule 1: Models are pure
- `src/lib/server/domain/models/` — no imports from repositories, services, controllers, or infra
- `src/lib/server/domain/value-objects/` — no external imports beyond standard library
- **Status: Clean** ✅

### Rule 2: Repositories never import services or controllers
- `src/lib/server/repositories/contracts/` — import only from models and value objects
- `src/lib/server/repositories/postgres/` — import from contracts, models, DB schema, and Drizzle
- **Status: Clean** ✅

### Rule 3: Services never import controllers or routes
- `src/lib/server/services/contracts/` — import only from models and value objects
- `src/lib/server/services/` (implementations) — import from contracts (repos + services), models, VOs, and infra interfaces
- `src/lib/server/services/internal/` — same pattern as implementations
- **Status: Clean** ✅

### Rule 4: Controllers never import routes
- `src/lib/server/controllers/` — import from service contracts, models, and DTOs only
- **Status: Clean** ✅

### Rule 5: No service-to-service direct dependency
- All inter-service dependencies use constructor-injected contract interfaces
- No service file imports another service implementation directly
- **Status: Clean** ✅

### Rule 6: Jobs never call controllers
- `src/lib/server/jobs/` — import from service contracts and infra only
- **Status: Clean** ✅

### Rule 7: Routes never bypass services to reach repositories
- `src/routes/(app)/api/` — all route handlers use controllers via factory/request-scope
- **Status: Clean** ✅

### Rule 8: Factory is the only composition root
- `src/lib/server/factory/app-factory.ts` — wires all contracts to implementations
- `src/lib/server/factory/request-scope.ts` — per-request controller resolution
- No other file performs dependency wiring
- **Status: Clean** ✅

## Overall Compliance

**v1 Status: Clean** — Zero violations detected across all 8 architectural rules.
