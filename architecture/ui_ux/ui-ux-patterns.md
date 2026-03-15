# UX Patterns — Margin

Detailed UX pattern specifications for every major feature. Each section documents the chosen pattern, its Do/Don't rules applied to Margin's domain, and the interaction flow.

---

## 1. Wizard — Onboarding

**Route:** `/(onboarding)` (steps 1–4)
**Interaction refs:** `AUTH-05`, `ASP-01`, `ASP-02`, `ASP-03`

### Why Wizard?

First-run completion requires at least one active aspect (`INV-013`). Users must configure aspects and set target percentages totaling 100 (`INV-033`). This is a multi-step prerequisite that benefits from guided, linear sequencing.

### Step Flow

| Step | Title                 | Content                                                                               | Validation Gate      |
| ---- | --------------------- | ------------------------------------------------------------------------------------- | -------------------- |
| 1    | Welcome               | App introduction, value proposition. "Margin helps you balance your week." No inputs. | None — always valid. |
| 2    | Define your aspects   | Create 1–8 aspects (name + purpose). Inline add/remove.                               | ≥ 1 aspect created.  |
| 3    | Set balance targets   | Slider/input per aspect, live total indicator. Must total exactly 100%.               | Sum = 100.           |
| 4    | Set your availability | Quick availability setup: pick recurring weekly blocks. Optional — can skip.          | None — can skip.     |

### Rules Applied

- **Owns the full viewport** — no sidebar, no app shell, no global nav.
- **Progress bar** at top showing step N of 4.
- **Back button** always visible (except step 1).
- **Next disabled** until validation gate passes.
- **Persist progress** to `sessionStorage` so a refresh doesn't lose work.
- **Glass modifier:** The step content card uses `GlassCard` over a soft gradient background. The only glass surface on screen.
- **After completion:** redirect to `/(app)` (weekly dashboard).

### Empty / Error States

- Step 2 starts with an empty aspect list and a prominent "Add your first aspect" CTA.
- Step 3 shows a red indicator if total ≠ 100%, with inline guidance.

---

## 2. Dashboard — Weekly Overview

**Route:** `/(app)`
**Interaction refs:** `PLN-06`, `EXE-02`, `AVL-05`

### Why Dashboard?

The home screen must give an at-a-glance overview of the current week: are you balanced? what's planned? what's overdue? This is a read-heavy, scan-first surface.

### Layout Zones

```
┌──────────────────────────────────────────────────────────────┐
│  Page Header: "This Week" + week date range + navigation     │
├──────────────────────────────────────────────────────────────┤
│  KPI Row (4 stat cards — glass modifier allowed):            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐       │
│  │Available │ │ Planned  │ │Completed │ │ Balance  │       │
│  │  hrs     │ │   hrs    │ │   hrs    │ │  score   │       │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘       │
├──────────────────────────────────────────────────────────────┤
│  Main Row (2 panels):                                        │
│  ┌──────────────────────────┐ ┌─────────────────────────┐   │
│  │ Aspect Health Chart      │ │ Today's Allocations     │   │
│  │ (ring/bar per aspect     │ │ (mini timeline or list  │   │
│  │  with color + target %)  │ │  of today's blocks)     │   │
│  └──────────────────────────┘ └─────────────────────────┘   │
├──────────────────────────────────────────────────────────────┤
│  Upcoming Tasks (compact list, max 5–7 items):               │
│  Tasks due this week, sorted by urgency desc → due asc      │
│  "View all tasks →" link                                     │
└──────────────────────────────────────────────────────────────┘
```

### Rules Applied

- **Fits above the fold** — no endless scrolling. If data is sparse, show contextual empty states.
- **No complex forms** inside widgets — link out to dedicated views.
- **KPI stat cards** may use glass modifier (max 4 glass surfaces, but they're small cards in a row so this counts as 1 visual zone).
- **Grid:** 4-column KPI row, 7-4-3 split for main panels, full-width task list.
- **Skeleton loading:** Each widget has its own skeleton matching the final layout.
- **Aspect colors:** Health chart and allocation blocks use the `--color-aspect-N` palette.
- **Empty state:** New user (no plan yet) sees "Generate your first weekly plan →" CTA.

### Key Interactions

- Click KPI card → navigate to relevant detail (e.g., planned hrs → plan view).
- Click allocation item → navigate to plan view focused on that block.
- Click task → navigate to task detail in master-detail view.
- Week navigation arrows → shift dashboard to prev/next week.

---

## 3. Timeline — Weekly Plan

**Route:** `/(app)/plan`
**Interaction refs:** `PLN-01`–`PLN-06`, `EXE-01`

### Why Timeline?

The weekly plan is fundamentally temporal — allocations have start/end times, availability blocks define when work can happen, and the "now" indicator shows what's current. Time as a spatial axis is the natural representation.

### Layout

```
┌──────────────────────────────────────────────────────────────┐
│  Plan Header: "Week of Mar 9–15" + status badge (Draft/      │
│  Confirmed) + actions: [Generate] [Confirm] [Regenerate]     │
├──────────────────────────────────────────────────────────────┤
│  Day Columns (Mon–Sun), horizontal scroll:                   │
│                                                              │
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ │
│  │ Mon │ │ Tue │ │ Wed │ │ Thu │ │ Fri │ │ Sat │ │ Sun │ │
│  │     │ │     │ │     │ │     │ │     │ │     │ │     │ │
│  │░░░░░│ │     │ │░░░░░│ │     │ │░░░░░│ │     │ │     │ │
│  │▓▓▓▓▓│ │░░░░░│ │     │ │░░░░░│ │▓▓▓▓▓│ │     │ │     │ │
│  │     │ │▓▓▓▓▓│ │░░░░░│ │▓▓▓▓▓│ │     │ │     │ │     │ │
│  │     │ │     │ │▓▓▓▓▓│ │     │ │     │ │     │ │     │ │
│  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ │
│                                                              │
│  ░ = availability block (background lane)                    │
│  ▓ = task allocation (positioned card — glass modifier)      │
│  | = "now" indicator (red vertical line)                     │
├──────────────────────────────────────────────────────────────┤
│  Legend / Summary bar: total planned vs available, warnings   │
└──────────────────────────────────────────────────────────────┘
```

### Rules Applied

- **Zoom levels:** Day view (single column, full-width) and Week view (7 columns, scroll).
- **"Now" indicator:** Red vertical line, always rendered on current day.
- **Allocation blocks** use aspect colors + glass modifier (frosted translucent cards).
- **Availability blocks** render as subtle background highlights behind allocation blocks.
- **Minimum block height:** 44px for interaction, even for short allocations. Tooltip on hover for details.
- **Past allocations** show attended/missed badge. Click to mark outcome (`EXE-01`).
- **Locked allocations** have a lock icon and cannot be dragged.
- **Click allocation** → popover/drawer with task details, lock/unlock, cancel, reslot actions.
- **No HTML tables** — use positioned elements within relative containers.
- **Horizontal scroll** via `ScrollArea` component.
- **Skeleton:** Shows empty day columns with faint availability lane backgrounds.

### Plan Actions

| Action          | When Available              | UI                                     |
| --------------- | --------------------------- | -------------------------------------- |
| Generate draft  | No plan for this week       | Primary button in header               |
| Confirm plan    | Draft exists, targets = 100 | Primary button, replaces Generate      |
| Regenerate      | Confirmed plan exists       | Secondary button, creates new revision |
| Edit allocation | Draft or confirmed          | Click block → popover with actions     |

---

## 4. Tabs — Aspect Detail

**Route:** `/(app)/aspects/[id]`
**Interaction refs:** `ASP-03`, `MLS-01`–`MLS-07`, `TSK-10`

### Why Tabs?

An aspect has three peer content areas (overview, milestones, tasks) that users switch between laterally. Max 3 tabs — well within the pattern limits.

### Tab Structure

| Tab            | Content                                                                                                              |
| -------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Overview**   | Aspect name/purpose (inline editable), status, target %, health ring for current cycle, default splittable toggle.   |
| **Milestones** | List of milestones with status badges, progress bars (done tasks / total tasks), target dates. Create milestone CTA. |
| **Tasks**      | Filtered task list for this aspect only. Same layout as the master-detail task list but scoped.                      |

### Rules Applied

- **URL synced:** `/(app)/aspects/[id]?tab=overview` — deep-linkable.
- **Keep alive:** Switching tabs preserves scroll position and unsaved form state.
- **Never nest tabs** — milestone detail and task detail open as drawers/modals, not as sub-tabs.
- **Active tab** is unambiguously highlighted (accent underline per Swiss style).
- **Mobile:** Tabs remain as a horizontal scrollable tab bar (3 tabs always fit).

---

## 5. Master-Detail — Task Management

**Route:** `/(app)/tasks`
**Interaction refs:** `TSK-01`–`TSK-11`, `REC-01`–`REC-05`, `REM-01`–`REM-02`

### Why Master-Detail?

Tasks are the most interacted-with entity. Users need to rapidly scan, filter, search, and triage tasks without losing context. The bifurcated list + detail eliminates pogo-sticking.

### Layout

```
┌────────────────────────────────────────────────────────────────┐
│  Page Header: "Tasks" + search bar + filter toggles            │
├──────────────────┬─────────────────────────────────────────────┤
│  Master List     │  Detail Pane                                │
│  (resizable,     │                                             │
│   30% default)   │  Selected task: title, description,         │
│                  │  aspect badge, milestone, effort bar,       │
│  ┌────────────┐  │  due date, importance, status actions,      │
│  │ Task item  │  │  recurrence section (collapsible),          │
│  │ (active)   │◄─│  reminder section.                          │
│  ├────────────┤  │                                             │
│  │ Task item  │  │  Inline editing for all fields.             │
│  ├────────────┤  │                                             │
│  │ Task item  │  │  Bottom: history / related info.            │
│  ├────────────┤  │                                             │
│  │ ...        │  │                                             │
│  └────────────┘  │                                             │
│                  │                                             │
│  [+ New task]    │                                             │
├──────────────────┴─────────────────────────────────────────────┤
│  Bulk action toolbar (visible when items selected)             │
└────────────────────────────────────────────────────────────────┘
```

### Rules Applied

- **Deep linking:** URL reflects selected task `/(app)/tasks/[id]`.
- **Responsive collapse:** On mobile (< 768px), master-detail becomes drill-down (list page → full task page).
- **Independent scrolling:** Master list and detail pane scroll independently.
- **Active state:** Selected task in master list has accent left-border indicator.
- **Cursor pagination:** Master list uses cursor pagination with "Load more" at bottom.
- **Default filter:** Excludes done and archived (`INV-152`).
- **Search:** Case-insensitive substring (`INV-153`).
- **Sort:** Urgency desc → due date asc → created asc (`INV-154`).
- **Skeleton:** Detail pane shows skeleton while loading; master list stays interactive.
- **Bulk select:** Checkbox on each item → toolbar appears with archive, status change, move milestone.
- **No blanking:** When switching tasks, master list stays visible, detail fades in.

### Task Detail Sections

1. **Header:** Title (editable), aspect color badge, status pill
2. **Core fields:** Effort bar (remaining/total), due date picker, importance slider
3. **Milestone:** Select dropdown to assign/move milestone
4. **Recurrence** (collapsible, `Progressive Disclosure`): Series info, rule, pause/resume, skip/move, close
5. **Reminders** (collapsible): Create/edit, snooze, delivery status
6. **Actions:** Start, complete, reopen, archive with confirmation for destructive actions

---

## 6. Progressive Disclosure — Task Create

**Trigger:** "+ New task" button in task list or aspect detail
**Interaction ref:** `TSK-01`

### Layout

```
┌─────────────────────────────────────────────┐
│  Dialog / Drawer: "New Task"                │
│                                             │
│  Title*:  [________________________]        │
│  Aspect*: [dropdown_______________▾]        │
│                                             │
│  ─── Advanced (collapsed) ──────────────    │
│  ▸ Show more options                        │
│                                             │
│           [Cancel]  [Create Task]           │
└─────────────────────────────────────────────┘
```

**Expanded:**

```
│  ─── Advanced (expanded) ───────────────    │
│  Effort:     [__30__] minutes               │
│  Due date:   [date picker________]          │
│  Importance: [slider 0────────100]          │
│  Milestone:  [dropdown___________▾]         │
│  Splittable: [toggle]                       │
│  Reminder:   [datetime + channel]           │
│  ─────────────────────────────────────────  │
```

### Rules Applied

- **80/20:** Title + aspect are always visible (required fields). Everything else is advanced.
- **Inline expansion:** Collapsible section, not a new route.
- **Smart defaults:** Effort defaults to `default_effort_minutes` from planning profile. Importance defaults to 50. Splittable defaults to aspect's `default_splittable`.
- **Never hide submit button** behind disclosure — Cancel and Create always visible.

---

## 7. Progressive Disclosure — Planning Profile

**Route:** `/(app)/settings/profile`
**Interaction ref:** `PRF-01`

### Layout

Always visible:

- Urgency weight slider (0–100)
- Importance weight slider (0–100)
- Balance weight slider (0–100)
- Effort-fit weight slider (0–100)
- Live explanation of what each weight influences

Collapsible "Advanced tuning":

- Urgent threshold days (0–30)
- Minimum chunk minutes (5–120)
- Default effort minutes

### Rules Applied

- **Smart defaults:** Profile is bootstrapped on account creation (`INV-020`). Sliders show current values.
- **Optimistic concurrency:** Save button disabled until a value changes. Version check on submit.
- **No navigation away** — in-place expansion only.

---

## 8. Hub & Spoke — Settings

**Route:** `/(app)/settings`
**Interaction refs:** Various

### Hub Layout

```
┌──────────────────────────────────────────────┐
│  Page Header: "Settings"                     │
├──────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐          │
│  │ 🎯 Planning  │  │ 📅 Availab.  │          │
│  │   Profile    │  │   Schedule   │          │
│  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐          │
│  │ 💾 Data      │  │ 👤 Account   │          │
│  │   Export/Imp │  │   Settings   │          │
│  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐                            │
│  │ 📋 Audit     │                            │
│  │   History    │                            │
│  └──────────────┘                            │
└──────────────────────────────────────────────┘
```

### Rules Applied

- **No cross-linking** between spokes. Each spoke has a "← Back to Settings" button.
- **Spokes own the viewport** — they replace the settings grid entirely.
- **Deliberate transitions:** Slide-over animation when entering a spoke.
- **Each spoke is an isolated page** with its own route: `/settings/profile`, `/settings/availability`, `/settings/data`, `/settings/account`, `/settings/audit`.

---

## 9. Feed — Audit Log

**Route:** `/(app)/settings/audit`
**Interaction ref:** `AUD-02`

### Layout

```
┌─────────────────────────────────────────┐
│  Sticky Header: "Audit History"          │
│  (glass-backed per feed header pattern)  │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────┐    │
│  │ 🔄 Task updated                 │    │
│  │ reading / Run 5K               │    │
│  │ 2 minutes ago                  │    │
│  │ Changed: effort 30→45 min      │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ ✅ Allocation marked attended   │    │
│  │ sports / Gym session           │    │
│  │ 1 hour ago                     │    │
│  └─────────────────────────────────┘    │
│  ...                                    │
│  ┌─────────────────────────────────┐    │
│  │     [Load more]                │    │
│  └─────────────────────────────────┘    │
├─────────────────────────────────────────┤
│  Skeleton items while loading           │
└─────────────────────────────────────────┘
```

### Rules Applied

- **Virtualization** if feed grows large (use `@tanstack/svelte-virtual`).
- **Skeleton loading** while fetching — card-shaped placeholder matching feed item dimensions.
- **Scroll restoration** via SvelteKit snapshots.
- **Load more** button (not pagination links per `INV-150` cursor pagination).
- **No inline editing** — audit is read-only and append-only.
- **Max width** constrained (single column, centered) for readability.
- **Each item:** Icon for event type, entity type + name, timestamp, redacted diff summary (collapsed by default, expandable).

---

## 10. Feed — Plan Revision History

**Route:** `/(app)/plan/history`
**Interaction ref:** `PLN-06`

### Item Structure

Each revision feed item shows:

- Revision number + status (Active / Superseded)
- Change reason text
- Diff summary (collapsed, expandable)
- Timestamp

Same rules as audit feed (load-more, skeleton, scroll restoration).

---

## 11. Timeline + List — Availability Manager

**Route:** `/(app)/settings/availability`
**Interaction refs:** `AVL-01`–`AVL-05`

### Layout

```
┌──────────────────────────────────────────────────┐
│  Page Header: "Availability" + [Add Block] btn   │
├──────────────────────────────────────────────────┤
│  Visual Weekly Grid (read-only visualization):   │
│  Mon–Sun columns, hour rows, colored blocks      │
│  showing effective merged availability (`AVL-05`)│
├──────────────────────────────────────────────────┤
│  Block List:                                     │
│  ┌──────────────────────────────────────────┐    │
│  │ Recurring: Mon,Wed,Fri 9:00–12:00       │    │
│  │ [Edit] [Archive]                        │    │
│  ├──────────────────────────────────────────┤    │
│  │ One-off: Mar 15 14:00–17:00             │    │
│  │ [Edit] [Archive]                        │    │
│  └──────────────────────────────────────────┘    │
└──────────────────────────────────────────────────┘
```

### Block Editor (Drawer)

Opens as a side drawer with Progressive Disclosure:

- **Always visible:** Type toggle (one-off / recurring)
- **One-off fields:** Date picker + start/end time
- **Recurring fields:** Weekday checkboxes, start/end time, date range (optional)
- **Advanced (collapsed):** Exceptions list (skip/override per date)

---

## Cross-Cutting Patterns

### Global Search (Launcher)

- **Trigger:** `Cmd+K` / `Ctrl+K` or search icon in top bar
- **Pattern:** Launcher overlay (command palette style)
- **Functionality:** Quick task search (`TSK-10`), aspect jump, route navigation
- **Keyboard-first** — arrow keys to navigate, Enter to select, Escape to close

### Toast Notifications

- **Position:** Bottom-right, stacking upward
- **Use:** In-app reminder delivery, mutation confirmations, error feedback
- **Auto-dismiss:** 4s for success, persistent for errors
- **Action button** on some toasts (e.g., "Undo archive")

### Confirmation Dialogs

- **Trigger:** All destructive actions (archive aspect, close series, delete account)
- **Swiss style:** Clean, centered dialog with clear title, description, two buttons
- **Always opaque** — never glassmorphism on dialogs with important decisions

### Empty States

Every list and grid must have a contextual empty state:

- **Aspects overview (no aspects):** "Define your first life aspect to start planning." → CTA to create
- **Tasks (no tasks):** "No tasks match your filters." or "Create your first task." → CTA
- **Plan (no plan):** "Generate your weekly plan to see allocations." → Generate button
- **Audit (no events):** "Your audit history will appear here as you make changes."

Empty states use a single soft illustration placeholder + text + primary CTA. Keep within ornament budget.
