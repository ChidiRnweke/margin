# UI Wireframes — Margin

ASCII wireframes for every major screen. These define spatial relationships, hierarchy, and component placement. Combine with `DESIGN_SYSTEM.md` for style and `ui-ux-patterns.md` for interaction rules.

---

## App Shell

The persistent application frame for all `/(app)/` routes.

```
┌──────────────────────────────────────────────────────────────────────────┐
│ ┌────────────┐                                                          │
│ │  SIDEBAR    │  TOP BAR                                                │
│ │             │  ┌──────────────────────────────────────────────────────┐│
│ │  ◉ Margin   │  │ ◀ Week of Mar 9–15 ▶  │  🔍 Cmd+K  │  [avatar] ▾ ││
│ │             │  └──────────────────────────────────────────────────────┘│
│ │  ―――――――    │                                                          │
│ │  🏠 Home    │  CONTENT AREA                                            │
│ │  📅 Plan    │  ┌──────────────────────────────────────────────────────┐│
│ │  🎯 Aspects │  │                                                      ││
│ │  ✓  Tasks   │  │  (Page content renders here)                         ││
│ │             │  │                                                      ││
│ │  ―――――――    │  │                                                      ││
│ │  ⚙ Settings │  │                                                      ││
│ │             │  │                                                      ││
│ └────────────┘  └──────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────┘

Mobile (< 768px):
┌─────────────────────────────┐
│  TOP BAR (compact)          │
│  ◀ Mar 9–15 ▶  🔍  [av]   │
├─────────────────────────────┤
│                             │
│  (Content area, full width) │
│                             │
│                             │
├─────────────────────────────┤
│  🏠  📅  🎯  ✓  ⚙         │
│  BOTTOM NAV BAR             │
└─────────────────────────────┘
```

### Specs

- Sidebar: `256px` fixed on desktop, collapsible to icon-only `64px`, hidden on mobile
- Top bar: `56px` height, sticky
- Bottom nav (mobile): `56px` height, fixed
- Content area: fills remaining space, scrolls independently
- Week selector in top bar is global context — shared across dashboard, plan, and task views

---

## 1. Onboarding Wizard

No app shell. Full-viewport.

```
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  ┌────────────────────────────────────────────────┐          │
│  │  Step 2 of 4          ████████░░░░░░░░░░       │          │
│  └────────────────────────────────────────────────┘          │
│                                                              │
│  ╔════════════════════════════════════════════════╗          │
│  ║                                                ║          │
│  ║  ✨ What matters to you?                       ║          │
│  ║                                                ║          │
│  ║  Add the aspects of life you want to balance.  ║          │
│  ║                                                ║          │
│  ║  ┌──────────────────────────────────────┐      ║          │
│  ║  │ 📖 Reading                      [✕]  │      ║          │
│  ║  ├──────────────────────────────────────┤      ║          │
│  ║  │ 🏃 Sports                       [✕]  │      ║          │
│  ║  ├──────────────────────────────────────┤      ║          │
│  ║  │ 👥 Friends                      [✕]  │      ║          │
│  ║  └──────────────────────────────────────┘      ║          │
│  ║                                                ║          │
│  ║  [+ Add another aspect]                        ║          │
│  ║                                                ║          │
│  ╚════════════════════════════════════════════════╝          │
│          ← Glass card (frosted, subtle blur)                 │
│                                                              │
│  ┌────────────────────────────────────────────────┐          │
│  │  [← Back]                          [Next →]    │          │
│  └────────────────────────────────────────────────┘          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
   ← Soft gradient background (pastel lavender → blush)
```

---

## 2. Weekly Dashboard

```
┌──────────────────────────────────────────────────────────────┐
│  This Week                                   Mar 9–15, 2026  │
│  Here's how your week is shaping up.                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐│
│  │ AVAILABLE  │ │  PLANNED   │ │ COMPLETED  │ │  BALANCE   ││
│  │            │ │            │ │            │ │            ││
│  │   18 hrs   │ │   15 hrs   │ │   8 hrs    │ │  82%       ││
│  │            │ │            │ │            │ │  ████░     ││
│  │  +2 vs last│ │  83% used  │ │  53% done  │ │  Good      ││
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘│
│   ← Glass cards (frosted pastel surfaces)                    │
│                                                              │
│  ┌─────────────────────────────┐ ┌──────────────────────────┐│
│  │ Aspect Balance              │ │ Today's Schedule         ││
│  │                             │ │                          ││
│  │  Reading    ████░░  35/40%  │ │  9:00  📖 Read ch.12    ││
│  │  Sports     ███░░░  25/30%  │ │ 10:30  🏃 Gym session   ││
│  │  Friends    ██░░░░  15/20%  │ │ 14:00  👥 Call Marco    ││
│  │  Learning   █░░░░░  10/10%  │ │ 16:00  📖 Research      ││
│  │                             │ │                          ││
│  │  ■ target  ■ actual        │ │  [View full plan →]      ││
│  └─────────────────────────────┘ └──────────────────────────┘│
│                                                              │
│  Upcoming Tasks                               [View all →]   │
│  ┌──────────────────────────────────────────────────────────┐│
│  │  ◉ Finish chapter 12        📖 Reading    Due: Mar 11   ││
│  │  ○ Register for 10K         🏃 Sports     Due: Mar 13   ││
│  │  ○ Buy birthday gift        👥 Friends    Due: Mar 14   ││
│  │  ○ Complete Python module    📚 Learning   Due: Mar 15   ││
│  └──────────────────────────────────────────────────────────┘│
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. Weekly Plan (Timeline)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Weekly Plan                Draft  [Generate ▼]  [Confirm]          │
│  Mar 9–15, 2026            Revision 3                                │
├───────┬───────┬───────┬───────┬───────┬───────┬───────┬─────────────┤
│ Hour  │  Mon  │  Tue  │  Wed  │  Thu  │  Fri  │  Sat  │    Sun      │
├───────┼───────┼───────┼───────┼───────┼───────┼───────┼─────────────┤
│  8:00 │░░░░░░░│       │░░░░░░░│       │░░░░░░░│       │             │
│       │░░░░░░░│       │░░░░░░░│       │░░░░░░░│       │             │
│  9:00 │▓▓▓▓▓▓▓│░░░░░░░│░░░░░░░│░░░░░░░│▓▓▓▓▓▓▓│       │             │
│       │Read   │░░░░░░░│▓▓▓▓▓▓▓│░░░░░░░│Gym    │       │             │
│ 10:00 │ch.12  │▓▓▓▓▓▓▓│Python │▓▓▓▓▓▓▓│session│       │             │
│       │📖     │Essay  │module │Plan   │🏃     │       │             │
│ 11:00 │       │draft  │📚     │review │       │       │             │
│       │▓▓▓▓▓▓▓│📚     │       │📋     │       │       │             │
│ 12:00 │Resear.│       │       │       │       │       │             │
│       │📖     │       │       │       │       │       │             │
├───────┼───────┼───|───┼───────┼───────┼───────┼───────┼─────────────┤
│       │       │  NOW  │       │       │       │       │             │
│  ...  │       │  │    │       │       │       │       │             │
├───────┴───────┴───────┴───────┴───────┴───────┴───────┴─────────────┤
│  ░ Available  ▓ Allocated  │ Now   🔒 Locked   ✅ Attended  ✗ Missed│
│  Planned: 15h / 18h available  │  3h unallocated                     │
└──────────────────────────────────────────────────────────────────────┘

Allocation block detail (popover on click):
┌────────────────────────────┐
│  📖 Read chapter 12        │
│  Reading • 90 min          │
│  9:00–10:30 Monday         │
│                            │
│  [🔒 Lock]  [✕ Cancel]    │
│  [↔ Reslot] [✅ Attended]  │
└────────────────────────────┘
```

---

## 4. Aspects Overview

```
┌──────────────────────────────────────────────────────────────┐
│  Aspects                                    [+ New Aspect]   │
│  Balance your life across what matters.                      │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ 📖 Reading      │  │ 🏃 Sports       │  │ 👥 Friends   │ │
│  │                 │  │                 │  │              │ │
│  │ Active  40%     │  │ Active  30%     │  │ Active  20%  │ │
│  │                 │  │                 │  │              │ │
│  │ ████████░░ 82%  │  │ ██████░░░░ 65%  │  │ ████░░░░ 50% │ │
│  │ health         │  │ health         │  │ health       │ │
│  │                 │  │                 │  │              │ │
│  │ 5 tasks active  │  │ 3 tasks active  │  │ 2 tasks      │ │
│  │ 1 milestone     │  │ 0 milestones    │  │ 1 milestone  │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│                                                              │
│  ┌─────────────────┐                                         │
│  │ 📚 Learning     │     Target total: 100% ✓               │
│  │                 │                                         │
│  │ Active  10%     │                                         │
│  │                 │                                         │
│  │ ██░░░░░░░░ 20%  │                                         │
│  │ health         │                                         │
│  │                 │                                         │
│  │ 4 tasks active  │                                         │
│  │ 2 milestones    │                                         │
│  └─────────────────┘                                         │
│                                                              │
└──────────────────────────────────────────────────────────────┘
   Each card uses aspect's --color-aspect-N as left border accent
```

---

## 5. Aspect Detail (Tabs)

```
┌──────────────────────────────────────────────────────────────┐
│  📖 Reading                              Active • 40%        │
│  Stay curious. Read broadly.                                 │
├──────────────────────────────────────────────────────────────┤
│  [Overview]  [Milestones]  [Tasks]                           │
│  ═══════════                                                 │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Health This Week                                            │
│  ┌──────────────────────────────────────────┐                │
│  │  ████████████████░░░░  82%               │                │
│  │  Target: 7.2 hrs  │  Completed: 5.9 hrs │                │
│  └──────────────────────────────────────────┘                │
│                                                              │
│  Details                                                     │
│  ┌──────────────────────────────────────────┐                │
│  │  Name:        Reading  [edit]            │                │
│  │  Purpose:     Stay curious. Read broadly.│                │
│  │  Target:      40%                        │                │
│  │  Splittable:  Yes (default)              │                │
│  │  Status:      Active                     │                │
│  │  Created:     Feb 1, 2026                │                │
│  └──────────────────────────────────────────┘                │
│                                                              │
│  Actions                                                     │
│  [Archive Aspect]                                            │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 6. Tasks (Master-Detail)

```
┌──────────────────────────────────────────────────────────────────────┐
│  Tasks                       [🔍 Search tasks...]  [Filter ▾]       │
├───────────────────────┬──────────────────────────────────────────────┤
│  MASTER LIST          │  DETAIL PANE                                 │
│  (resizable ↔)       │                                              │
│                       │  ┌──────────────────────────────────────┐    │
│  ☐ Finish chapter 12  │  │  Finish chapter 12              [✎]  │    │
│  ▎ 📖 Reading         │  │                                      │    │
│  ▎ Due: Mar 11  ●high │  │  📖 Reading → Q1 Reading Goal       │    │
│  ─────────────────────│  │  Status: In Progress                 │    │
│  ☐ Register for 10K   │  │                                      │    │
│    🏃 Sports          │  │  ┌──────────────────────────────┐    │    │
│    Due: Mar 13        │  │  │ Effort   ████████░░  60/90m  │    │    │
│  ─────────────────────│  │  │ Due      Mar 11, 2026        │    │    │
│  ☐ Buy birthday gift  │  │  │ Import.  ████████░░  80/100  │    │    │
│    👥 Friends         │  │  │ Split    Yes (aspect default)│    │    │
│    Due: Mar 14        │  │  └──────────────────────────────┘    │    │
│  ─────────────────────│  │                                      │    │
│  ☐ Python module 3    │  │  ▸ Recurrence (not recurring)        │    │
│    📚 Learning        │  │  ▸ Reminders (1 pending)             │    │
│    Due: Mar 15        │  │                                      │    │
│  ─────────────────────│  │  ┌──────────────────────────────┐    │    │
│                       │  │  │[▶ Start] [✓ Complete]        │    │    │
│  [+ New Task]         │  │  │[↩ Reopen] [📦 Archive]      │    │    │
│                       │  │  └──────────────────────────────┘    │    │
│  Load more...         │  │                                      │    │
├───────────────────────┴──────────────────────────────────────────────┤
│  ☑ 2 selected: [Archive] [Change Status ▾] [Move Milestone ▾]       │
└──────────────────────────────────────────────────────────────────────┘

   ▎ = accent left-border for selected item
```

---

## 7. Task Create (Progressive Disclosure Dialog)

```
┌──────────────────────────────────────────────────┐
│  New Task                                    [✕]  │
├──────────────────────────────────────────────────┤
│                                                  │
│  Title *                                         │
│  ┌──────────────────────────────────────────┐    │
│  │                                          │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  Aspect *                                        │
│  ┌──────────────────────────────────────────┐    │
│  │ 📖 Reading                            ▾  │    │
│  └──────────────────────────────────────────┘    │
│                                                  │
│  ─────────────────────────────────────────────   │
│  ▸ More options                                  │
│  ─────────────────────────────────────────────   │
│                                                  │
│                 [Cancel]  [Create Task]           │
│                                                  │
└──────────────────────────────────────────────────┘

Expanded:
│  ▾ More options                                  │
│  ┌──────────────────────────────────────────┐    │
│  │ Effort        [  30  ] minutes           │    │
│  │ Due date      [  Pick date...  ]         │    │
│  │ Importance    [───●────────] 50          │    │
│  │ Milestone     [  None              ▾]    │    │
│  │ Splittable    [toggle ●──]               │    │
│  │ Reminder      [  Set reminder...  ]      │    │
│  └──────────────────────────────────────────┘    │
```

---

## 8. Settings Hub

```
┌──────────────────────────────────────────────────────────────┐
│  Settings                                                    │
│  Manage your planning preferences and account.               │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐          │
│  │  🎯                  │  │  📅                  │          │
│  │  Planning Profile    │  │  Availability        │          │
│  │                      │  │                      │          │
│  │  Weight sliders,     │  │  Weekly schedule,    │          │
│  │  scoring config      │  │  one-off blocks      │          │
│  │                  →   │  │                  →   │          │
│  └──────────────────────┘  └──────────────────────┘          │
│                                                              │
│  ┌──────────────────────┐  ┌──────────────────────┐          │
│  │  💾                  │  │  👤                  │          │
│  │  Data & Export       │  │  Account             │          │
│  │                      │  │                      │          │
│  │  Import/export       │  │  Profile, timezone,  │          │
│  │  your planning data  │  │  sign out, delete    │          │
│  │                  →   │  │                  →   │          │
│  └──────────────────────┘  └──────────────────────┘          │
│                                                              │
│  ┌──────────────────────┐                                    │
│  │  📋                  │                                    │
│  │  Audit History       │                                    │
│  │                      │                                    │
│  │  Review all changes  │                                    │
│  │  to your data        │                                    │
│  │                  →   │                                    │
│  └──────────────────────┘                                    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 9. Planning Profile (Progressive Disclosure)

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back to Settings                                          │
│                                                              │
│  Planning Profile                                            │
│  Configure how Margin ranks and schedules your tasks.        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Scoring Weights                                             │
│  These weights control how tasks are prioritized in your     │
│  weekly plan. They're normalized at scoring time.            │
│                                                              │
│  Urgency        [────────●──────] 60                         │
│  How much due-date pressure matters.                         │
│                                                              │
│  Importance     [──────●────────] 50                         │
│  How much your importance rating matters.                    │
│                                                              │
│  Balance        [────────────●──] 80                         │
│  How much to favor underserved aspects.                      │
│                                                              │
│  Effort Fit     [──●────────────] 30                         │
│  How much to prefer tasks that fit available windows.        │
│                                                              │
│  ─────────────────────────────────────────────               │
│  ▸ Advanced tuning                                           │
│  ─────────────────────────────────────────────               │
│                                                              │
│                                         [Save Changes]       │
│                                                              │
└──────────────────────────────────────────────────────────────┘

Advanced expanded:
│  ▾ Advanced tuning                                           │
│  ┌─────────────────────────────────────────────────────┐     │
│  │ Urgent threshold    [  7  ] days (0–30)             │     │
│  │ Tasks due within this window get urgency boost.     │     │
│  │                                                     │     │
│  │ Min chunk           [ 15  ] minutes (5–120)         │     │
│  │ Smallest allocation block the planner will create.  │     │
│  │                                                     │     │
│  │ Default effort      [ 30  ] minutes                 │     │
│  │ Applied to new tasks when no effort is specified.   │     │
│  └─────────────────────────────────────────────────────┘     │
```

---

## 10. Availability Manager

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back to Settings                                          │
│                                                              │
│  Availability                                [+ Add Block]   │
│  Define when you're available for planned activities.        │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Weekly View (read-only visualization)                       │
│  ┌──────┬──────┬──────┬──────┬──────┬──────┬──────┐         │
│  │ Mon  │ Tue  │ Wed  │ Thu  │ Fri  │ Sat  │ Sun  │         │
│  │      │      │      │      │      │      │      │         │
│  │░░░░░░│      │░░░░░░│      │░░░░░░│      │      │         │
│  │░░░░░░│░░░░░░│░░░░░░│░░░░░░│░░░░░░│      │      │         │
│  │      │░░░░░░│      │░░░░░░│      │      │      │         │
│  │      │      │      │      │      │      │      │         │
│  │      │      │░░░░░░│      │      │      │      │         │
│  └──────┴──────┴──────┴──────┴──────┴──────┴──────┘         │
│  ░ = available                               18 hrs/week     │
│                                                              │
│  Your Blocks                                                 │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ 🔄 Recurring  Mon,Wed,Fri  9:00–12:00               │    │
│  │    Since Feb 1  •  No exceptions          [Edit] [⋮] │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │ 🔄 Recurring  Tue,Thu  10:00–12:00                  │    │
│  │    Since Feb 1  •  1 exception (Mar 13)   [Edit] [⋮] │    │
│  ├──────────────────────────────────────────────────────┤    │
│  │ 📌 One-off   Wed Mar 12  14:00–17:00               │    │
│  │    Extra afternoon session               [Edit] [⋮] │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 11. Audit Log (Feed)

```
┌─────────────────────────────────────────────────────┐
│  ← Back to Settings                                  │
│                                                      │
│  Audit History                                       │
│  A record of all changes to your data.               │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │ 🔄 Task Updated                             │    │
│  │ 📖 Reading → Finish chapter 12              │    │
│  │ 2 minutes ago                               │    │
│  │ ▸ View changes                              │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │ ✅ Allocation Outcome Marked                │    │
│  │ 🏃 Sports → Gym session                    │    │
│  │ 1 hour ago                                  │    │
│  │ Outcome: Attended                           │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │ 🆕 Task Created                             │    │
│  │ 👥 Friends → Buy birthday gift              │    │
│  │ 3 hours ago                                 │    │
│  │ ▸ View changes                              │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │           [Load more]                       │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 12. Account Settings (Danger Zone)

```
┌──────────────────────────────────────────────────────────────┐
│  ← Back to Settings                                          │
│                                                              │
│  Account                                                     │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  Profile                                                     │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ Display name    [  Chidi  ]                          │    │
│  │ Email           chidi@example.com (via provider)     │    │
│  │ Timezone        Belgium/Brussels (WAT, UTC+01:00)       │    │
│  └──────────────────────────────────────────────────────┘    │
│                                       [Save Changes]         │
│                                                              │
│  Session                                                     │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ Signed in since Mar 14, 2026                        │    │
│  │                                      [Sign Out]      │    │
│  └──────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐    │
│  │ ⚠️ Danger Zone                                       │    │
│  │                                                      │    │
│  │ Delete your account and all associated data.         │    │
│  │ This action is permanent and cannot be undone.       │    │
│  │ All aspects, tasks, plans, and audit history will    │    │
│  │ be permanently erased (GDPR erasure).                │    │
│  │                                                      │    │
│  │                            [Delete Account]          │    │
│  └──────────────────────────────────────────────────────┘    │
│   ← Red border, destructive styling                          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 13. Empty States

### No Aspects (after onboarding — edge case if all archived)

```
┌──────────────────────────────────────────────┐
│                                              │
│            🎯                                │
│                                              │
│     No active aspects                        │
│                                              │
│     Aspects define the areas of life you     │
│     want to balance. Create or restore       │
│     an aspect to start planning.             │
│                                              │
│          [+ Create Aspect]                   │
│                                              │
└──────────────────────────────────────────────┘
```

### No Plan for This Week

```
┌──────────────────────────────────────────────┐
│                                              │
│            📅                                │
│                                              │
│     No plan for this week                    │
│                                              │
│     Generate a weekly plan to see how        │
│     your tasks fit into your available       │
│     time.                                    │
│                                              │
│        [Generate Weekly Plan]                │
│                                              │
└──────────────────────────────────────────────┘
```

### No Tasks Match Filter

```
┌──────────────────────────────────────────────┐
│                                              │
│            🔍                                │
│                                              │
│     No tasks found                           │
│                                              │
│     Try adjusting your filters or search     │
│     terms, or create a new task.             │
│                                              │
│     [Clear Filters]  [+ New Task]            │
│                                              │
└──────────────────────────────────────────────┘
```

---

## Responsive Breakpoints

| Breakpoint | Width      | Layout Changes                                                                   |
| ---------- | ---------- | -------------------------------------------------------------------------------- |
| Mobile     | < 768px    | Single column, bottom nav, master-detail collapses to drill-down, sidebar hidden |
| Tablet     | 768–1024px | Sidebar collapsible to icons, 2-column grids, master-detail with narrow master   |
| Desktop    | > 1024px   | Full sidebar, multi-column grids, full master-detail split                       |
| Wide       | > 1440px   | Content max-width `72rem` centered, extra whitespace margins                     |
