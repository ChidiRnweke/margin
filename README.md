# Margin

**Intentional time-planning for a balanced life.**

Margin is a weekly planner that helps you allocate time across the areas of your life that matter most. Define life aspects (Career, Health, Relationships, etc.), set target percentages, and let the scheduler build a balanced weekly plan within your declared availability windows.

## Architecture

Margin follows **Domain-Driven Design** with a strict layered architecture:

| Layer                          | Responsibility                   | Dependencies                                |
| ------------------------------ | -------------------------------- | ------------------------------------------- |
| **Models / Value Objects**     | Domain rules, invariants         | None (pure)                                 |
| **Repository Contracts**       | Data access interfaces           | Models, VOs                                 |
| **Repository Implementations** | Postgres via Drizzle ORM         | Contracts, Models, DB schema                |
| **Service Contracts**          | Business operation interfaces    | Models, VOs                                 |
| **Service Implementations**    | Orchestration, state transitions | Contracts (repos + services), Models, VOs   |
| **Controllers**                | Request/response mapping         | Service contracts, DTOs                     |
| **Routes / Pages**             | SvelteKit endpoints + SSR        | Controllers (via factory), DTOs, Components |
| **Components**                 | UI rendering                     | Stores, DTOs, Primitives                    |

All wiring goes through a single **composition-root factory** — no service-to-service direct imports.

## Tech Stack

- **Framework:** [SvelteKit](https://svelte.dev/docs/kit) (Svelte 5, runes mode)
- **Runtime:** Node.js with `@sveltejs/adapter-node`
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) + custom design tokens (OKLCH)
- **Database:** PostgreSQL via [Drizzle ORM](https://orm.drizzle.team/)
- **Testing:** [Vitest](https://vitest.dev/) + Playwright (browser mode)
- **Type-checking:** TypeScript 5.9 + `svelte-check`
- **Linting:** ESLint 9 + Prettier

## Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **pnpm** ≥ 9
- **PostgreSQL** 16+ (for full backend; UI development works without it)

### Install

```bash
pnpm install
```

### Environment

Copy the example env file and fill in your database connection:

```bash
cp .env.example .env
```

Required variables:

```
DATABASE_URL=postgresql://user:password@localhost:5432/margin
```

### Database Setup

```bash
pnpm db:generate   # Generate migration files from schema
pnpm db:migrate    # Apply migrations
pnpm db:push       # Push schema directly (development)
pnpm db:studio     # Open Drizzle Studio GUI
```

### Seed Data

Deterministic seed data is available for development:

```bash
npx tsx scripts/seed.ts
```

This prints seed definitions for 1 user, 4 aspects, and 6 tasks. A running Postgres instance with applied migrations is required to persist seeds.

## Development Commands

| Command            | Description                                 |
| ------------------ | ------------------------------------------- |
| `pnpm dev`         | Start dev server with HMR                   |
| `pnpm check`       | Type-check (svelte-kit sync + svelte-check) |
| `pnpm check:watch` | Type-check in watch mode                    |
| `pnpm build`       | Production build                            |
| `pnpm preview`     | Preview production build                    |
| `pnpm lint`        | Prettier + ESLint check                     |
| `pnpm format`      | Auto-format with Prettier                   |
| `pnpm test`        | Run unit tests (single run)                 |
| `pnpm test:unit`   | Run unit tests (watch mode)                 |

## Project Structure

```
src/
├── lib/
│   ├── components/
│   │   ├── primitives/    # Token-aware base components (Text, Button, Stack, Card, etc.)
│   │   ├── layout/        # Structural layout components
│   │   └── domain/        # Feature components (aspects, tasks, plan, availability, settings)
│   ├── server/            # Server-side utilities and DB access
│   ├── stores/            # Svelte stores for client state
│   ├── hooks/             # SvelteKit hooks (auth, session)
│   ├── styles/            # Global CSS and design tokens
│   └── assets/            # Static assets (favicon, etc.)
├── routes/
│   ├── (app)/             # Authenticated app routes (dashboard, plan, aspects, tasks, settings)
│   ├── (auth)/            # Authentication routes (login, callback)
│   └── (onboarding)/      # Onboarding wizard
├── hooks.server.ts        # Server hooks entry point
└── app.html               # HTML shell
scripts/
  seed.ts                  # Deterministic development seed data
docs/
  execution/               # Execution ledgers (invariants, routes, contracts, compliance)
architecture/              # Domain model and architecture specifications
```

## Design System

Margin uses a **Swiss minimalism** base style (~80%) with a **glassmorphism** modifier (~20%, restricted to hero cards and overlays). Key principles:

- **OKLCH color palette** with light/dark mode support
- **Inter** font family with an 8-level modular type scale (1.25 ratio)
- **4px base** spacing scale
- **Token-aware primitives** — all UI goes through `Text`, `Button`, `Stack`, `Card`, `Badge`, `Input`, `Panel`, and `GlassCard`
- **Accessibility-first** — focus rings, WCAG contrast, keyboard navigation, reduced-motion support

See [`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md) for the full specification.

## License

Private — all rights reserved.
