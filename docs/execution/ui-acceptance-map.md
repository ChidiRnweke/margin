# UI Acceptance Map

## Auth & Onboarding

| Route              | Screen   | Pattern          | Loading State     | Empty State     | Loaded State          | Error State           | Keyboard               | Responsive                       | Status      |
| ------------------ | -------- | ---------------- | ----------------- | --------------- | --------------------- | --------------------- | ---------------------- | -------------------------------- | ----------- |
| `/(auth)/login`    | Sign-in  | Standalone       | —                 | Centered card   | Sign-in button        | Provider error toast  | Enter triggers sign-in | Full-width card on mobile        | Implemented |
| `/(auth)/callback` | Callback | Loading→redirect | Spinner + message | —               | Auto-redirect         | Error message + retry | —                      | Centered                         | Implemented |
| `/(onboarding)`    | Wizard   | Wizard (4 steps) | Skeleton per step | Step 1: welcome | Step cards with glass | Inline validation     | Tab/Enter navigation   | Full-viewport, stacked on mobile | Implemented |

## Dashboard

| Route    | Screen    | Pattern   | Loading State | Empty State       | Loaded State           | Error State    | Keyboard | Responsive      | Status      |
| -------- | --------- | --------- | ------------- | ----------------- | ---------------------- | -------------- | -------- | --------------- | ----------- |
| `/(app)` | Dashboard | Dashboard | Skeleton grid | "No plan yet" CTA | KPI + schedule + tasks | Error boundary | —        | 12→6→1 col grid | Implemented |

## Plan

| Route                 | Screen    | Pattern  | Loading State     | Empty State         | Loaded State         | Error State    | Keyboard                 | Responsive                  | Status      |
| --------------------- | --------- | -------- | ----------------- | ------------------- | -------------------- | -------------- | ------------------------ | --------------------------- | ----------- |
| `/(app)/plan`         | Plan view | Timeline | Skeleton timeline | "Generate plan" CTA | Day columns + blocks | Error boundary | Arrow keys for block nav | Horizontal scroll preserved | Implemented |
| `/(app)/plan/history` | History   | Feed     | Skeleton items    | "No revisions"      | Revision feed items  | Error boundary | —                        | Single column               | Implemented |

## Aspects

| Route                 | Screen   | Pattern   | Loading State  | Empty State               | Loaded State | Error State    | Keyboard              | Responsive             | Status      |
| --------------------- | -------- | --------- | -------------- | ------------------------- | ------------ | -------------- | --------------------- | ---------------------- | ----------- |
| `/(app)/aspects`      | Overview | Card grid | Skeleton cards | "Create first aspect" CTA | Aspect cards | Error boundary | —                     | Auto-fill grid         | Implemented |
| `/(app)/aspects/[id]` | Detail   | Tabs (3)  | Skeleton tabs  | Per-tab empty             | Tab content  | Error boundary | Tab key switches tabs | Stacked tabs on mobile | Implemented |

## Tasks

| Route               | Screen               | Pattern       | Loading State | Empty State    | Loaded State       | Error State    | Keyboard                  | Responsive           | Status      |
| ------------------- | -------------------- | ------------- | ------------- | -------------- | ------------------ | -------------- | ------------------------- | -------------------- | ----------- |
| `/(app)/tasks`      | All tasks            | Master-Detail | Skeleton list | "No tasks" CTA | List + detail pane | Error boundary | Up/Down nav, Enter select | Drill-down on mobile | Implemented |
| `/(app)/tasks/[id]` | Task detail (mobile) | Detail        | Skeleton      | —              | Full detail        | Error boundary | —                         | Back button nav      | Implemented |

## Settings

| Route                          | Screen       | Pattern                | Loading State    | Empty State     | Loaded State        | Error State      | Keyboard            | Responsive       | Status      |
| ------------------------------ | ------------ | ---------------------- | ---------------- | --------------- | ------------------- | ---------------- | ------------------- | ---------------- | ----------- |
| `/(app)/settings`              | Hub          | Hub & Spoke            | Skeleton cards   | —               | Setting cards       | Error boundary   | —                   | Grid → stack     | Implemented |
| `/(app)/settings/profile`      | Profile      | Progressive Disclosure | Skeleton sliders | Default values  | Sliders + advanced  | Save error toast | Tab between sliders | Single column    | Implemented |
| `/(app)/settings/account`      | Account      | Form                   | Skeleton         | —               | Read-only + actions | Error boundary   | Tab navigation      | Single column    | Implemented |
| `/(app)/settings/availability` | Availability | Timeline + list        | Skeleton grid    | "Add block" CTA | Grid + block list   | Error boundary   | —                   | Grid → list only | Implemented |
| `/(app)/settings/data`         | Data         | Form                   | Skeleton         | —               | Export + import     | Error toast      | Tab navigation      | Single column    | Implemented |
| `/(app)/settings/audit`        | Audit        | Feed                   | Skeleton items   | "No events"     | Audit feed items    | Error boundary   | —                   | Single column    | Implemented |

## Glass Restrictions Compliance

All screens use glass/frosted effects only on non-interactive decorative surfaces.
Destructive confirmation dialogs use opaque backgrounds per design system rules.
**Status: Compliant** ✅

## Keyboard Accessibility

- All interactive controls reachable via Tab
- Enter/Space activates buttons and links
- Arrow keys navigate lists (tasks, aspects) and timeline blocks
- Escape closes modals, drawers, and command palette
- **Status: Implemented** ✅

## Empty & Loading States

- Every data-driven screen has a skeleton loading state
- Every list screen has an empty state with CTA
- Error boundaries wrap all async-loaded sections
- **Status: Implemented** ✅
