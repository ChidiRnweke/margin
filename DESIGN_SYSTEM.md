# Margin Design System

This document is the single source of truth for Margin's visual identity, design tokens, component conventions, and UX pattern assignments. Every UI implementation must conform to this file.

---

## Style Commit

### Chosen Styles

| Role | Style | Weight |
|---|---|---|
| **Primary** | Minimalism / Swiss | ~80% |
| **Modifier** | Glassmorphism | ~20% (restricted zones only) |

### Style Application Plan

**Primary — Swiss (≈80%)**
Controls: page grid, typography ladder, spacing scale, section structure, forms, tables, navigation scaffolding, all text hierarchy. Swiss gives Margin its calm, precise, trustworthy character. Every screen defaults to Swiss rules.

**Modifier — Glassmorphism (≈20%)**
Restricted to:
- Weekly plan allocation blocks (frosted cards over the timeline background)
- Dashboard KPI stat cards (subtle glass over the soft gradient header)
- Modal/dialog overlays (frosted backdrop)
- The onboarding wizard step cards

**Banned zones for Glass:**
- Forms and input fields (always opaque surfaces for readability)
- Data tables and task lists (always solid backgrounds)
- Navigation sidebar/bottom bar (always solid, conventional)
- Long-form text/descriptions

**Ornament budget:** Max 2 glass surfaces visible per screen at any time. Glass must never stack (no glass-on-glass).

### Dark Mode

`prefers-color-scheme` auto-detection with CSS custom properties switching. Light and dark token sets defined. No manual toggle in v1 — follows OS preference.

---

## Color Palette

**Mood:** Soft pastels — gentle, approachable, personal. Not corporate.

### Light Mode

```css
:root {
  /* Surfaces */
  --color-bg:              oklch(0.985 0.005 280);    /* near-white with faint lavender warmth */
  --color-surface:         oklch(0.995 0.003 280);    /* card/panel white */
  --color-surface-muted:   oklch(0.965 0.008 280);    /* subtle section background */
  --color-surface-raised:  oklch(0.975 0.006 280);    /* elevated cards */

  /* Glass (modifier zones only) */
  --color-glass:           oklch(0.98 0.005 280 / 0.60);
  --color-glass-strong:    oklch(0.98 0.005 280 / 0.75);
  --color-glass-border:    oklch(0.90 0.01 280 / 0.30);

  /* Text */
  --color-text:            oklch(0.22 0.02 280);      /* primary text — deep slate-purple */
  --color-text-muted:      oklch(0.48 0.02 280);      /* secondary/helper text */
  --color-text-faint:      oklch(0.62 0.015 280);     /* placeholder, disabled */

  /* Borders */
  --color-border:          oklch(0.88 0.012 280);     /* default border */
  --color-border-muted:    oklch(0.92 0.008 280);     /* subtle dividers */

  /* Accent — soft indigo-lavender (primary actions, links, focus) */
  --color-accent:          oklch(0.55 0.15 280);
  --color-accent-hover:    oklch(0.50 0.17 280);
  --color-accent-muted:    oklch(0.55 0.15 280 / 0.12);
  --color-accent-foreground: oklch(0.99 0.003 280);

  /* Semantic: success */
  --color-success:         oklch(0.60 0.14 155);
  --color-success-muted:   oklch(0.60 0.14 155 / 0.12);

  /* Semantic: warning */
  --color-warning:         oklch(0.72 0.14 75);
  --color-warning-muted:   oklch(0.72 0.14 75 / 0.12);

  /* Semantic: destructive */
  --color-destructive:     oklch(0.58 0.18 18);
  --color-destructive-muted: oklch(0.58 0.18 18 / 0.12);

  /* Aspect colors (used for aspect cards, allocation blocks, health rings) */
  --color-aspect-1:        oklch(0.72 0.12 330);      /* blush/rose */
  --color-aspect-2:        oklch(0.72 0.12 250);      /* periwinkle */
  --color-aspect-3:        oklch(0.72 0.12 170);      /* mint */
  --color-aspect-4:        oklch(0.72 0.12 55);       /* peach */
  --color-aspect-5:        oklch(0.72 0.12 200);      /* sky */
  --color-aspect-6:        oklch(0.72 0.12 300);      /* lilac */
  --color-aspect-7:        oklch(0.72 0.12 120);      /* sage */
  --color-aspect-8:        oklch(0.72 0.12 30);       /* coral */
}
```

### Dark Mode

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-bg:              oklch(0.16 0.015 280);
    --color-surface:         oklch(0.20 0.018 280);
    --color-surface-muted:   oklch(0.18 0.016 280);
    --color-surface-raised:  oklch(0.23 0.02 280);

    --color-glass:           oklch(0.22 0.02 280 / 0.50);
    --color-glass-strong:    oklch(0.22 0.02 280 / 0.65);
    --color-glass-border:    oklch(0.40 0.02 280 / 0.25);

    --color-text:            oklch(0.92 0.01 280);
    --color-text-muted:      oklch(0.68 0.015 280);
    --color-text-faint:      oklch(0.50 0.012 280);

    --color-border:          oklch(0.32 0.02 280);
    --color-border-muted:    oklch(0.26 0.018 280);

    --color-accent:          oklch(0.68 0.14 280);
    --color-accent-hover:    oklch(0.72 0.15 280);
    --color-accent-muted:    oklch(0.68 0.14 280 / 0.15);
    --color-accent-foreground: oklch(0.15 0.02 280);

    --color-success:         oklch(0.68 0.13 155);
    --color-success-muted:   oklch(0.68 0.13 155 / 0.15);
    --color-warning:         oklch(0.75 0.13 75);
    --color-warning-muted:   oklch(0.75 0.13 75 / 0.15);
    --color-destructive:     oklch(0.65 0.16 18);
    --color-destructive-muted: oklch(0.65 0.16 18 / 0.15);

    /* Aspect colors shift slightly brighter in dark mode */
    --color-aspect-1:        oklch(0.75 0.11 330);
    --color-aspect-2:        oklch(0.75 0.11 250);
    --color-aspect-3:        oklch(0.75 0.11 170);
    --color-aspect-4:        oklch(0.75 0.11 55);
    --color-aspect-5:        oklch(0.75 0.11 200);
    --color-aspect-6:        oklch(0.75 0.11 300);
    --color-aspect-7:        oklch(0.75 0.11 120);
    --color-aspect-8:        oklch(0.75 0.11 30);
  }
}
```

---

## Typography

**Philosophy:** Swiss — hierarchy through size, weight, and tracking. No decorative fonts. Clean sans-serif system stack with an optional geometric sans for display.

```css
:root {
  /* Font families */
  --font-display: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-body:    'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-mono:    'JetBrains Mono', ui-monospace, monospace;

  /* Type scale (modular, 1.25 ratio) */
  --text-xs:   0.75rem;    /* 12px — captions, badges */
  --text-sm:   0.875rem;   /* 14px — helper text, metadata */
  --text-base: 1rem;       /* 16px — body text */
  --text-lg:   1.125rem;   /* 18px — section subtitles */
  --text-xl:   1.25rem;    /* 20px — card titles */
  --text-2xl:  1.5rem;     /* 24px — page section headings */
  --text-3xl:  1.875rem;   /* 30px — page titles */
  --text-4xl:  2.25rem;    /* 36px — hero/onboarding display */

  /* Tracking */
  --tracking-tight:   -0.025em;  /* display headings */
  --tracking-normal:   0em;       /* body */
  --tracking-wide:     0.025em;   /* uppercase labels, badges */

  /* Line heights */
  --leading-tight:  1.25;   /* headings */
  --leading-normal: 1.5;    /* body */
  --leading-relaxed: 1.625; /* long-form */

  /* Font weights */
  --weight-normal:   400;
  --weight-medium:   500;
  --weight-semibold: 600;
  --weight-bold:     700;
}
```

### Typography ladder

| Use | Size | Weight | Tracking | Example |
|---|---|---|---|---|
| Display / hero | `--text-4xl` | bold | tight | Onboarding headline |
| Page title | `--text-3xl` | bold | tight | "This Week" |
| Section heading | `--text-2xl` | semibold | tight | "Aspects", "Tasks" |
| Card title | `--text-xl` | semibold | normal | Aspect card header |
| Subtitle | `--text-lg` | medium | normal | Panel subtitle |
| Body | `--text-base` | normal | normal | Descriptions, paragraphs |
| Small / meta | `--text-sm` | normal–medium | normal | Timestamps, helper text |
| Caption / badge | `--text-xs` | medium | wide | Status badges, labels |

---

## Spacing & Layout

**Density:** Airy — generous whitespace, one focus per viewport section.

```css
:root {
  /* 4px base spacing scale */
  --space-0:   0;
  --space-0.5: 0.125rem;   /* 2px */
  --space-1:   0.25rem;    /* 4px */
  --space-2:   0.5rem;     /* 8px */
  --space-3:   0.75rem;    /* 12px */
  --space-4:   1rem;       /* 16px */
  --space-5:   1.25rem;    /* 20px */
  --space-6:   1.5rem;     /* 24px */
  --space-8:   2rem;       /* 32px */
  --space-10:  2.5rem;     /* 40px */
  --space-12:  3rem;       /* 48px */
  --space-16:  4rem;       /* 64px */

  /* Layout */
  --gutter:      var(--space-8);     /* 32px page gutter */
  --section-gap: var(--space-12);    /* 48px between major sections */
  --card-padding: var(--space-6);    /* 24px inside cards */
  --max-width:   72rem;              /* 1152px content max */
  --sidebar-width: 16rem;            /* 256px sidebar */
}
```

### Grid System

- **Page layout:** CSS Grid with `sidebar | main` on desktop, single-column on mobile
- **Dashboard widgets:** 12-column grid, widgets snap to 3/4/6/12 column spans
- **Card grids:** Auto-fill with `min(280px, 1fr)` for responsive aspect cards
- **Timeline:** Fixed-width day columns with horizontal scroll

---

## Shape & Elevation

```css
:root {
  /* Border radius — single family per Swiss rules */
  --radius-sm:   6px;
  --radius:      10px;     /* default for cards, inputs */
  --radius-lg:   14px;     /* larger panels, modals */
  --radius-xl:   18px;     /* glass cards, onboarding */
  --radius-full: 9999px;   /* pills, avatars */

  /* Borders */
  --border-width: 1px;

  /* Shadows — minimal per Swiss, used only for elevation */
  --shadow-sm:   0 1px 2px oklch(0 0 0 / 0.04);
  --shadow:      0 2px 8px oklch(0 0 0 / 0.06);
  --shadow-lg:   0 8px 24px oklch(0 0 0 / 0.08);
  --shadow-glass: 0 8px 32px oklch(0 0 0 / 0.10);

  /* Blur (glass modifier only) */
  --blur-glass:  20px;

  /* Motion */
  --duration-fast:   120ms;
  --duration-normal: 200ms;
  --duration-slow:   300ms;
  --easing:          cubic-bezier(0.25, 0.1, 0.25, 1);
}
```

### Elevation hierarchy

| Level | Use | Shadow | Blur |
|---|---|---|---|
| 0 — Flat | Body sections, table rows | none | none |
| 1 — Raised | Cards, inputs | `--shadow-sm` | none |
| 2 — Overlay | Dropdowns, tooltips, toasts | `--shadow` | none |
| 3 — Modal | Dialogs, drawers | `--shadow-lg` | none |
| Glass | Allocation blocks, KPI cards (modifier zones) | `--shadow-glass` | `--blur-glass` |

---

## UX Pattern Assignments

Each major feature maps to a proven UX pattern. See [architecture/ui-ux-patterns.md](./ui-ux-patterns.md) for detailed specifications per pattern.

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
├── primitives/    # token-aware wrappers
│   ├── Button.svelte        # Swiss: crisp, outline-default, accent-primary
│   ├── Card.svelte          # Swiss: flat border + Glass variant prop
│   ├── Input.svelte         # Always opaque, never on glass
│   ├── Badge.svelte         # Uppercase caption, wide tracking
│   ├── Text.svelte          # Typography ladder enforcement
│   ├── Stack.svelte         # Vertical rhythm via spacing tokens
│   ├── GlassCard.svelte     # Modifier: frosted surface, restricted zones
│   └── Panel.svelte         # Dashboard widget container
├── layout/
│   ├── AppShell.svelte      # Sidebar + topbar + content area
│   ├── WizardLayout.svelte  # Full-viewport wizard frame
│   ├── TimelineLayout.svelte
│   ├── MasterDetailLayout.svelte
│   ├── DashboardGrid.svelte
│   ├── PageHeader.svelte
│   ├── EmptyState.svelte    # Contextual, pastel illustration placeholder
│   └── Skeleton.svelte
└── domain/                  # Feature-specific components
    ├── aspects/
    ├── tasks/
    ├── plan/
    ├── availability/
    └── settings/
```

### Hard Rules

1. **Never use raw `<button>`** → always `primitives/Button`
2. **Never use raw `<input>`** → always `primitives/Input` (wraps shadcn)
3. **Never ad-hoc spacing** → use `Stack` or spacing tokens
4. **Never Tailwind default palette** → tokens only for final colors
5. **Never hand-roll structural layouts** → use pattern layout components
6. **Glass only in approved zones** → flag if glass leaks elsewhere
7. **Max 2 glass surfaces per screen** → ornament budget enforced
8. **Forms always on opaque surfaces** — even inside glass-zone screens

---

## Anti-Patterns (Banned)

- Default gray-on-white soup with no personality
- Random `text-sm`, `text-lg` without following the typography ladder
- Bare shadcn components without token integration
- Gradients in the primary style (Swiss is flat; glass blur is the only depth effect)
- Multiple accent hues competing (one accent: lavender-indigo)
- Nested tabs (use drill-down or master-detail instead)
- Paginated feeds (use load-more or virtualized scroll)
- Glass-on-glass stacking
- Full-page blank states (always provide setup guidance)
- Hiding primary actions behind progressive disclosure

---

## Accessibility Guardrails

- **Focus rings:** 2px accent ring, always visible on keyboard navigation
- **Contrast:** WCAG AA minimum for all text (especially on glass surfaces — test!)
- **Tap targets:** ≥ 44×44px for all interactive elements
- **States:** Every interactive element has hover, active, disabled, focus, error states
- **Keyboard:** Full keyboard navigation for menus, dialogs, forms, timeline blocks
- **Reduced motion:** Respect `prefers-reduced-motion` — disable transitions, keep glass static
- **Glass fallback:** `@supports not (backdrop-filter: blur(1px))` → solid surface fallback

---

## Document References

- Screen inventory: [architecture/ui-screen-inventory.md](./ui-screen-inventory.md)
- UX patterns detail: [architecture/ui-ux-patterns.md](./ui-ux-patterns.md)
- Wireframe layouts: [architecture/ui-wireframes.md](./ui-wireframes.md)
- Domain model: [architecture/margin-domain-model.md](./margin-domain-model.md)
- Invariants: [architecture/invariants.md](./invariants.md)
