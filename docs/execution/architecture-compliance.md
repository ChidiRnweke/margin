# Architecture Compliance

## Dependency Graph Audit

| Layer | Allowed Dependencies | Violations | Status |
|-------|---------------------|------------|--------|
| Models/Value Objects | None (pure) | — | Pending |
| Repositories (contracts) | Models, Value Objects | — | Pending |
| Repositories (postgres) | Contracts, Models, DB schema, Drizzle | — | Pending |
| Services (contracts) | Models, Value Objects | — | Pending |
| Services (implementations) | Contracts (repos + services), Models, VOs, Infra interfaces | — | Pending |
| Controllers | Service contracts, Models, DTOs | — | Pending |
| Jobs | Service contracts, Infra | — | Pending |
| Routes/Pages | Controllers (via factory), DTOs, Components | — | Pending |
| Components | Stores, DTOs, Primitives | — | Pending |
| Factory | All contracts, all implementations | — | Pending |

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

_No scan performed yet. Will be populated during Step 112._
