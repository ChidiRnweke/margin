# UI Acceptance Map

## Auth & Onboarding

| Route | Screen | Pattern | Loading State | Empty State | Loaded State | Error State | Keyboard | Responsive | Status |
|-------|--------|---------|---------------|-------------|--------------|-------------|----------|------------|--------|
| `/(auth)/login` | Sign-in | Standalone | — | Centered card | Sign-in button | Provider error toast | Enter triggers sign-in | Full-width card on mobile | Pending |
| `/(auth)/callback` | Callback | Loading→redirect | Spinner + message | — | Auto-redirect | Error message + retry | — | Centered | Pending |
| `/(onboarding)` | Wizard | Wizard (4 steps) | Skeleton per step | Step 1: welcome | Step cards with glass | Inline validation | Tab/Enter navigation | Full-viewport, stacked on mobile | Pending |

## Dashboard

| Route | Screen | Pattern | Loading State | Empty State | Loaded State | Error State | Keyboard | Responsive | Status |
|-------|--------|---------|---------------|-------------|--------------|-------------|----------|------------|--------|
| `/(app)` | Dashboard | Dashboard | Skeleton grid | "No plan yet" CTA | KPI + schedule + tasks | Error boundary | — | 12→6→1 col grid | Pending |

## Plan

| Route | Screen | Pattern | Loading State | Empty State | Loaded State | Error State | Keyboard | Responsive | Status |
|-------|--------|---------|---------------|-------------|--------------|-------------|----------|------------|--------|
| `/(app)/plan` | Plan view | Timeline | Skeleton timeline | "Generate plan" CTA | Day columns + blocks | Error boundary | Arrow keys for block nav | Horizontal scroll preserved | Pending |
| `/(app)/plan/history` | History | Feed | Skeleton items | "No revisions" | Revision feed items | Error boundary | — | Single column | Pending |

## Aspects

| Route | Screen | Pattern | Loading State | Empty State | Loaded State | Error State | Keyboard | Responsive | Status |
|-------|--------|---------|---------------|-------------|--------------|-------------|----------|------------|--------|
| `/(app)/aspects` | Overview | Card grid | Skeleton cards | "Create first aspect" CTA | Aspect cards | Error boundary | — | Auto-fill grid | Pending |
| `/(app)/aspects/[id]` | Detail | Tabs (3) | Skeleton tabs | Per-tab empty | Tab content | Error boundary | Tab key switches tabs | Stacked tabs on mobile | Pending |

## Tasks

| Route | Screen | Pattern | Loading State | Empty State | Loaded State | Error State | Keyboard | Responsive | Status |
|-------|--------|---------|---------------|-------------|--------------|-------------|----------|------------|--------|
| `/(app)/tasks` | All tasks | Master-Detail | Skeleton list | "No tasks" CTA | List + detail pane | Error boundary | Up/Down nav, Enter select | Drill-down on mobile | Pending |
| `/(app)/tasks/[id]` | Task detail (mobile) | Detail | Skeleton | — | Full detail | Error boundary | — | Back button nav | Pending |

## Settings

| Route | Screen | Pattern | Loading State | Empty State | Loaded State | Error State | Keyboard | Responsive | Status |
|-------|--------|---------|---------------|-------------|--------------|-------------|----------|------------|--------|
| `/(app)/settings` | Hub | Hub & Spoke | Skeleton cards | — | Setting cards | Error boundary | — | Grid → stack | Pending |
| `/(app)/settings/profile` | Profile | Progressive Disclosure | Skeleton sliders | Default values | Sliders + advanced | Save error toast | Tab between sliders | Single column | Pending |
| `/(app)/settings/account` | Account | Form | Skeleton | — | Read-only + actions | Error boundary | Tab navigation | Single column | Pending |
| `/(app)/settings/availability` | Availability | Timeline + list | Skeleton grid | "Add block" CTA | Grid + block list | Error boundary | — | Grid → list only | Pending |
| `/(app)/settings/data` | Data | Form | Skeleton | — | Export + import | Error toast | Tab navigation | Single column | Pending |
| `/(app)/settings/audit` | Audit | Feed | Skeleton items | "No events" | Audit feed items | Error boundary | — | Single column | Pending |
