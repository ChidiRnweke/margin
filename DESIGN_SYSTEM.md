# Margin Design System

This document is the single source of truth for Margin's visual identity, design tokens, component conventions, and UX pattern assignments. Every UI implementation must conform to this file.

---

## Style Commit

### Core Identity

Margin is a **glassmorphic** application first and foremost. Every surface, card, and panel uses frosted-glass layering over animated ambient backgrounds. The Swiss/minimalist influence governs **structure only** — grid alignment, typographic hierarchy, and spacing discipline — but the **visual character** is defined by deep glass layering, soft pastel blobs, and translucent depth.

| Role | What it controls | Weight |
|---|---|---|
| **Visual language** | Glassmorphism | Primary — all surfaces |
| **Structural discipline** | Swiss / Minimalism | Governs grid, type scale, spacing, alignment |

### How Glass Works Everywhere

- **Every card, panel, and container** is a glass surface: translucent background + `backdrop-blur-*` + subtle luminous border.
- **Depth is created by layering**: the page has an animated gradient/blob background; panels float above it as frosted layers; cards inside panels are a second glass layer with lighter blur.
- **Opacity and blur vary by depth level** to maintain hierarchy (see Elevation section).
- **There is no flat opaque card anywhere in the UI.** If a surface exists, it's glass.

### What Swiss Controls (Structure Only)

Swiss principles govern the invisible scaffolding beneath the glass:
- Strict grid alignment (12-column, consistent gutters)
- Modular type scale with clear hierarchy
- Consistent spacing tokens (no ad-hoc values)
- Clean information hierarchy — one focus per section
- No decorative fonts, no ornamental borders

### The Ambient Background (Critical — This Makes Glass Work)

Every page MUST have an animated ambient background behind all content. Without this, glass surfaces will look like slightly transparent gray cards — which is the failure mode of bad implementations.

The ambient background is a `fixed inset-0 z-0` container with 2–3 absolutely positioned blobs using `rounded-full blur-3xl` and `animate-float` (defined in Tailwind config). Each blob uses a different `--color-aspect-*` token at ~50% opacity. The blobs drift slowly via a custom `float` keyframe animation.

Pages may add extra blob `<div>`s for more colour (e.g., the dashboard adds a third mint blob center-right). Each blob should use a different aspect color.

The `AmbientBackground` component is **required on every page**. Glass over a solid background is not glass — it's a transparent box.

### Dark Mode

`prefers-color-scheme` auto-detection with Tailwind's `dark:` variant. Light and dark token sets defined in `tailwind.config`. No manual toggle in v1 — follows OS preference. In dark mode, blob opacity increases and blur intensifies for richer ambient colour.

---

## Tailwind Config (Token Definitions)

All tokens are defined in `tailwind.config.ts` under `theme.extend`. Components use ONLY these tokens — never Tailwind's default palette.

```ts
// tailwind.config.ts — theme.extend
{
  colors: {
    // Surfaces — FALLBACKS only; prefer glass utilities for actual surfaces
    bg:              'oklch(0.985 0.005 280)',
    surface:         'oklch(0.995 0.003 280)',        // opaque fallback (forms)
    'surface-muted': 'oklch(0.965 0.008 280)',
    'surface-raised':'oklch(0.975 0.006 280)',

    // Glass fills
    glass:           'oklch(0.98 0.005 280 / 0.55)',  // standard glass
    'glass-strong':  'oklch(0.98 0.005 280 / 0.70)',  // nested / elevated glass
    'glass-border':  'oklch(0.95 0.01 280 / 0.40)',   // luminous top-left border
    'glass-border-subtle': 'oklch(0.90 0.01 280 / 0.20)', // dim bottom-right border
    'glass-shadow':  'oklch(0.50 0.03 280 / 0.08)',   // shadow color for glass

    // Text
    text:            'oklch(0.22 0.02 280)',
    'text-muted':    'oklch(0.48 0.02 280)',
    'text-faint':    'oklch(0.62 0.015 280)',

    // Borders
    border:          'oklch(0.88 0.012 280)',
    'border-muted':  'oklch(0.92 0.008 280)',

    // Accent — soft indigo-lavender
    accent:          'oklch(0.55 0.15 280)',
    'accent-hover':  'oklch(0.50 0.17 280)',
    'accent-muted':  'oklch(0.55 0.15 280 / 0.12)',
    'accent-fg':     'oklch(0.99 0.003 280)',

    // Semantic
    success:         'oklch(0.60 0.14 155)',
    'success-muted': 'oklch(0.60 0.14 155 / 0.12)',
    warning:         'oklch(0.72 0.14 75)',
    'warning-muted': 'oklch(0.72 0.14 75 / 0.12)',
    destructive:     'oklch(0.58 0.18 18)',
    'destructive-muted': 'oklch(0.58 0.18 18 / 0.12)',

    // Aspect colors (cards, allocation blocks, health rings, blobs)
    'aspect-1':      'oklch(0.72 0.12 330)',   // blush/rose
    'aspect-2':      'oklch(0.72 0.12 250)',   // periwinkle
    'aspect-3':      'oklch(0.72 0.12 170)',   // mint
    'aspect-4':      'oklch(0.72 0.12 55)',    // peach
    'aspect-5':      'oklch(0.72 0.12 200)',   // sky
    'aspect-6':      'oklch(0.72 0.12 300)',   // lilac
    'aspect-7':      'oklch(0.72 0.12 120)',   // sage
    'aspect-8':      'oklch(0.72 0.12 30)',    // coral
  },

  // Dark mode overrides — see Dark Mode Tokens section below

  borderRadius: {
    sm:   '6px',
    DEFAULT: '10px',
    lg:   '14px',
    xl:   '18px',
    full: '9999px',
  },

  fontFamily: {
    display: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    body:    ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    mono:    ['JetBrains Mono', 'ui-monospace', 'monospace'],
  },

  fontSize: {
    xs:   ['0.75rem',   { lineHeight: '1.5' }],
    sm:   ['0.875rem',  { lineHeight: '1.5' }],
    base: ['1rem',      { lineHeight: '1.5' }],
    lg:   ['1.125rem',  { lineHeight: '1.5' }],
    xl:   ['1.25rem',   { lineHeight: '1.25' }],
    '2xl':['1.5rem',    { lineHeight: '1.25' }],
    '3xl':['1.875rem',  { lineHeight: '1.25' }],
    '4xl':['2.25rem',   { lineHeight: '1.25' }],
  },

  letterSpacing: {
    tight:  '-0.025em',
    normal: '0em',
    wide:   '0.025em',
  },

  backdropBlur: {
    sm:  '8px',      // nested glass cards
    md:  '20px',     // primary panels
    lg:  '40px',     // modals, overlays
    xl:  '80px',     // ambient blobs (filter, not backdrop)
  },

  boxShadow: {
    glass:      '0 8px 32px oklch(0.50 0.03 280 / 0.08), inset 0 1px 0 oklch(1 0 0 / 0.08)',
    'glass-sm': '0 2px 8px oklch(0.50 0.03 280 / 0.08), inset 0 1px 0 oklch(1 0 0 / 0.06)',
    'glass-lg': '0 24px 48px oklch(0.50 0.03 280 / 0.12)',
  },

  keyframes: {
    float: {
      '0%':   { transform: 'translate(0, 0) scale(1)' },
      '100%': { transform: 'translate(30px, -20px) scale(1.05)' },
    },
  },
  animation: {
    float: 'float 20s ease-in-out infinite alternate',
  },

  spacing: {
    'gutter':      '2rem',     // 32px
    'section-gap': '3rem',     // 48px
    'card-pad':    '1.5rem',   // 24px
  },

  maxWidth: {
    content: '72rem',
  },

  width: {
    sidebar: '16rem',
  },
}
```

### Dark Mode Tokens

Dark mode colors override via Tailwind's `dark:` variant. Define as CSS variables toggled by `prefers-color-scheme: dark` so glass composites reference the right values.

| Token | Light | Dark |
|---|---|---|
| `bg` | `oklch(0.985 0.005 280)` | `oklch(0.13 0.02 280)` — deep blue-purple, **NOT gray** |
| `surface` | `oklch(0.995 0.003 280)` | `oklch(0.20 0.018 280)` |
| `glass` | `oklch(0.98 0.005 280 / 0.55)` | `oklch(0.20 0.025 280 / 0.45)` — richer tint |
| `glass-strong` | `oklch(0.98 0.005 280 / 0.70)` | `oklch(0.22 0.025 280 / 0.60)` |
| `glass-border` | `oklch(0.95 0.01 280 / 0.40)` | `oklch(0.50 0.03 280 / 0.30)` — brighter edge |
| `glass-border-subtle` | `oklch(0.90 0.01 280 / 0.20)` | `oklch(0.30 0.02 280 / 0.15)` |
| `glass-shadow` | `oklch(0.50 0.03 280 / 0.08)` | `oklch(0.10 0.03 280 / 0.30)` |
| `text` | `oklch(0.22 0.02 280)` | `oklch(0.92 0.01 280)` |
| `text-muted` | `oklch(0.48 0.02 280)` | `oklch(0.68 0.015 280)` |
| `text-faint` | `oklch(0.62 0.015 280)` | `oklch(0.50 0.012 280)` |
| `border` | `oklch(0.88 0.012 280)` | `oklch(0.32 0.02 280)` |
| `accent` | `oklch(0.55 0.15 280)` | `oklch(0.68 0.14 280)` |
| Aspect colors | `oklch(0.72 ...)` | `oklch(0.75 ...)` — slightly brighter |

---

## Typography Ladder

| Use | Classes | Example |
|---|---|---|
| Display / hero | `text-4xl font-bold tracking-tight` | Onboarding headline |
| Page title | `text-3xl font-bold tracking-tight` | "This Week" |
| Section heading | `text-2xl font-semibold tracking-tight` | "Aspects", "Tasks" |
| Card title | `text-xl font-semibold` | Aspect card header |
| Subtitle | `text-lg font-medium` | Panel subtitle |
| Body | `text-base font-normal` | Descriptions, paragraphs |
| Small / meta | `text-sm font-normal` or `text-sm font-medium` | Timestamps, helper text |
| Caption / badge | `text-xs font-medium tracking-wide uppercase` | Status badges, labels |

---

## Glass Surface Utility Patterns

These are the **exact Tailwind class combinations** to use for glass surfaces. Do not improvise — use these patterns.

### Glass Panel (Level 1 — primary containers)

Use for: dashboard sections, main content cards, sidebar panels.

```
bg-glass backdrop-blur-md border border-glass-border border-b-glass-border-subtle border-r-glass-border-subtle rounded-lg shadow-glass
```

### Glass Card (Level 2 — nested inside panels or directly over ambient bg)

Use for: KPI stat cards, aspect cards inside a grid, task cards inside a list panel.

```
bg-glass-strong backdrop-blur-sm border border-glass-border border-b-glass-border-subtle border-r-glass-border-subtle rounded shadow-glass-sm
```

### Glass Nav

```
bg-glass-strong backdrop-blur-md border-b border-glass-border-subtle
```

### Glass Modal

```
<!-- Backdrop -->
bg-black/30 backdrop-blur-lg

<!-- Dialog -->
bg-glass-strong backdrop-blur-lg border border-glass-border rounded-xl shadow-glass-lg
```

### Luminous Border (Critical Detail)

The directional border is what makes glass look like a physical surface with light catching its top-left edge. Every glass surface MUST have this:
- `border-glass-border` on top and left (brighter)
- `border-b-glass-border-subtle border-r-glass-border-subtle` on bottom and right (dimmer)

Without this, glass surfaces look like transparent boxes instead of frosted panels.

---

## Ambient Background Blob Patterns

Each blob is an absolutely positioned `<div>` inside the `AmbientBackground` component:

```
<!-- Standard blob base classes -->
absolute rounded-full blur-3xl opacity-50 motion-safe:animate-float motion-reduce:animate-none

<!-- Blob 1: lilac, top-left -->
w-[40vw] h-[40vw] -top-[10%] -left-[10%] bg-aspect-6

<!-- Blob 2: periwinkle, bottom-right -->
w-[35vw] h-[35vw] -bottom-[10%] -right-[10%] bg-aspect-2 [animation-delay:-10s]

<!-- Optional blob 3 (dashboard): mint, center-right -->
w-[30vw] h-[30vw] top-[20%] right-[5%] bg-aspect-3 [animation-delay:-5s]
```

The `AmbientBackground` container itself uses `fixed inset-0 z-0 overflow-hidden bg-bg`.

---

## Spacing & Layout

**Density:** Airy — generous whitespace, one focus per viewport section.

Standard Tailwind spacing scale (4px base) plus semantic aliases:
- `p-gutter` / `px-gutter` — 32px page gutter
- `gap-section-gap` — 48px between major sections
- `p-card-pad` — 24px inside cards

### Grid System

- **Page layout:** Full-width progressive disclosure and hub-and-spoke models (no traditional sidebars). Use a top-bar or stacked central cards.
- **Dashboard widgets:** `grid grid-cols-12 gap-gutter` — widgets snap to `col-span-3` / `col-span-4` / `col-span-6` / `col-span-12`
- **Card grids:** `grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6` for responsive aspect cards
- **Timeline:** Fixed-width day columns with `overflow-x-auto`

---

## Elevation Hierarchy (All Levels Use Glass)

Every elevation level is a glass surface. Hierarchy is expressed through **blur intensity**, **opacity**, and **shadow depth** — not by switching between glass and opaque.

| Level | Use | Pattern to Apply |
|---|---|---|
| 1 — Panel | Dashboard panels, content cards | Glass Panel classes |
| 2 — Card | Nested cards, KPIs | Glass Card classes |
| 3 — Overlay | Dropdowns, tooltips, toasts | Glass Panel classes + higher `z-*` |
| 4 — Modal | Dialogs, drawers | Glass Modal classes |

**Key principle:** Deeper blur + higher opacity + larger shadow = more elevated. Never use flat/opaque surfaces to indicate elevation.

---

## Dashboard Composition Example

This is how the dashboard should be composed. Every implementation must follow this layering:

```
┌─────────────────────────────────────────────────────┐
│  AmbientBackground (fixed inset-0 z-0)              │
│  ┌─ blob: aspect-6 lilac, top-left ────────────┐    │
│  └─────────────────────────────────────────────┘    │
│  ┌─ blob: aspect-2 periwinkle, bottom-right ───┐    │
│  └─────────────────────────────────────────────┘    │
│  ┌─ blob: aspect-3 mint, center-right ─────────┐    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  ┌─ Glass Nav (z-50) ──────────────────────────┐    │
│  │  Margin    Dashboard  Plan  Aspects  Tasks   │    │
│  └──────────────────────────────────────────────┘    │
│                                                     │
│  ┌─ Content (z-10 relative) ───────────────────┐    │
│  │                                              │    │
│  │  Page Title: "Dashboard"                     │    │
│  │  Subtitle: "Your weekly overview"            │    │
│  │                                              │    │
│  │  ┌─ KPI Row (4x Glass Card) ────────────┐   │    │
│  │  │ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐  │   │    │
│  │  │ │Active│ │In    │ │Done  │ │Over- │  │   │    │
│  │  │ │Aspc. │ │Prog. │ │      │ │due   │  │   │    │
│  │  │ └──────┘ └──────┘ └──────┘ └──────┘  │   │    │
│  │  └───────────────────────────────────────┘   │    │
│  │                                              │    │
│  │  ┌─ Glass Panel ────┐ ┌─ Glass Panel ────┐   │    │
│  │  │ Today's Schedule  │ │ Upcoming Tasks  │   │    │
│  │  │                   │ │                 │   │    │
│  │  │ (content/empty)   │ │ (content/empty) │   │    │
│  │  └───────────────────┘ └─────────────────┘   │    │
│  └──────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

KPI cards use **Glass Card** pattern. Schedule/Upcoming panels use **Glass Panel** pattern. Everything floats over the ambient blobs.

---

## UX Pattern Assignments

| Feature | Primary Pattern | Notes |
|---|---|---|
| Onboarding | **Wizard** | Full-viewport, 3–4 steps, no app shell |
| Weekly dashboard | **Dashboard** | KPIs top, charts middle, activity bottom; fits above fold |
| Weekly plan | **Timeline** | Day-column layout, horizontal scroll, zoom day/week |
| Aspects overview | **Dashboard** (card grid) | Responsive card grid with health indicators |
| Aspect detail | **Tabs** | Overview / Milestones / Tasks — max 3 tabs |
| All tasks | **Master-Detail** | Left list + right detail pane; collapses to drill-down on mobile |
| Task create/edit | **Progressive Disclosure** | Quick-create with expandable advanced fields |
| Availability | **Timeline** + list | Visual weekly grid + block list |
| Settings hub | **Hub & Spoke** | Card grid dispatching to isolated setting screens |
| Planning profile | **Progressive Disclosure** | Sliders primary, thresholds advanced |
| Audit log | **Feed** | Cursor-paginated, load-more, skeleton loading |
| Plan history | **Feed** | Revision list with diff summaries |

---

## Component Conventions

### Primitives (encode tokens, wrap shadcn-svelte)

```
src/lib/components/
├── ui/            # shadcn-svelte generated — never hand-edit
├── primitives/
│   ├── Button.svelte        # Accent-filled or ghost; always glass-compatible
│   ├── GlassPanel.svelte    # Level 1 glass — use for ALL primary containers
│   ├── GlassCard.svelte     # Level 2 glass — use for ALL nested cards
│   ├── Input.svelte         # Opaque bg-surface (readability), glass-compatible border
│   ├── Badge.svelte         # text-xs font-medium tracking-wide uppercase, glass-tinted bg
│   ├── Text.svelte          # Typography ladder enforcement
│   ├── Stack.svelte         # Vertical rhythm via spacing tokens
│   └── Panel.svelte         # DEPRECATED — use GlassPanel
├── layout/
│   ├── AppShell.svelte      # Glass navbar + content area
│   ├── AmbientBackground.svelte  # Animated blob background (REQUIRED on every page)
│   ├── WizardLayout.svelte
│   ├── TimelineLayout.svelte
│   ├── MasterDetailLayout.svelte
│   ├── DashboardGrid.svelte
│   ├── PageHeader.svelte
│   ├── EmptyState.svelte
│   └── Skeleton.svelte      # Glass-tinted loading placeholder
└── domain/
    ├── aspects/
    ├── tasks/
    ├── plan/
    ├── availability/
    └── settings/
```

### Hard Rules

1. **Every page MUST render `AmbientBackground`** — glass is invisible without it.
2. **Never use flat/opaque cards** → always `GlassPanel` or `GlassCard`. The only opaque surfaces are form inputs (`bg-surface`) and the `<body>` itself.
3. **Never use raw `<button>`** → always `primitives/Button`.
4. **Never use raw `<input>`** → always `primitives/Input` (wraps shadcn).
5. **Never ad-hoc spacing** → use `Stack` or spacing tokens from config.
6. **Never use Tailwind's default color palette** (`gray-*`, `slate-*`, `zinc-*`, `neutral-*`, etc.) → design system tokens only.
7. **Never hand-roll structural layouts** → use pattern layout components.
8. **All glass surfaces MUST include `backdrop-blur-*`** — translucent `bg-` without blur is NOT glass.
9. **All glass surfaces MUST have the luminous directional border** — brighter top/left, dimmer bottom/right.
10. **Form inputs use opaque `bg-surface`** for readability — even inside glass containers.

---

## Anti-Patterns (Banned)

- **Flat gray/opaque surfaces** — if it looks like a dark gray card with no transparency, it's wrong.
- **Glass without `AmbientBackground`** — glass over a solid color is just a slightly transparent box.
- **Missing `backdrop-blur-*`** — translucent background without blur is NOT glass.
- **Missing luminous directional borders** — glass without bright-top-left / dim-bottom-right edges looks like a hole, not a surface.
- **Using Tailwind default grays** (`bg-gray-800`, `bg-slate-900`, etc.) — the dark bg is deep blue-purple, NOT neutral gray.
- **Using `bg-white` or `bg-black`** — use token colors only.
- Random `text-sm`, `text-lg` without following the typography ladder.
- Bare shadcn components without token integration.
- Multiple accent hues competing (one accent: lavender-indigo).
- Nested tabs (use drill-down or master-detail instead).
- Paginated feeds (use load-more or virtualized scroll).
- Full-page blank states (always provide setup guidance).
- Hiding primary actions behind progressive disclosure.

---

## Accessibility Guardrails

- **Focus rings:** `ring-2 ring-accent ring-offset-2` — always visible on keyboard navigation.
- **Contrast:** WCAG AA minimum for all text. **Test text contrast on glass surfaces with blobs behind them.** Use `bg-glass-strong` if contrast fails on thinner glass.
- **Tap targets:** `min-w-[44px] min-h-[44px]` for all interactive elements.
- **States:** Every interactive element has hover, active, disabled, focus, error states.
- **Keyboard:** Full keyboard navigation for menus, dialogs, forms, timeline blocks.
- **Reduced motion:** Use `motion-safe:` prefix on animations. Blobs use `motion-reduce:animate-none`.
- **Glass fallback:** Provide a `@supports not (backdrop-filter: blur(1px))` rule in global CSS that sets glass surfaces to `bg-surface` with `border-border`. This is the ONE place raw CSS is acceptable.

---

## Document References

- Screen inventory: [architecture/ui-screen-inventory.md](./ui-screen-inventory.md)
- UX patterns detail: [architecture/ui-ux-patterns.md](./ui-ux-patterns.md)
- Wireframe layouts: [architecture/ui-wireframes.md](./ui-wireframes.md)
- Domain model: [architecture/margin-domain-model.md](./margin-domain-model.md)
- Invariants: [architecture/invariants.md](./invariants.md)