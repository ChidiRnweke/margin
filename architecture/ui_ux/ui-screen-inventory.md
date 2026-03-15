# Screen Inventory

Maps every domain interaction to a concrete screen, route, and primary UX pattern. This is the exhaustive list of views Margin needs.

## Route Conventions

- All authenticated routes live under `/(app)/`
- The onboarding wizard lives under `/(onboarding)/`
- Auth entry points live under `/(auth)/`
- Settings/profile routes live under `/(app)/settings/`

---

## 1. Authentication & Onboarding

| Screen            | Route              | Interactions                            | UX Pattern         | Description                                                                                                                                          |
| ----------------- | ------------------ | --------------------------------------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Sign-in           | `/(auth)/login`    | `AUTH-01`                               | Standalone page    | External identity provider sign-in initiation. Centered card, no app chrome.                                                                         |
| Auth callback     | `/(auth)/callback` | `AUTH-02`                               | Loading → redirect | System resolves identity, creates/matches user, redirects to app or onboarding.                                                                      |
| Onboarding wizard | `/(onboarding)`    | `AUTH-05`, `ASP-01`, `ASP-02`, `ASP-03` | **Wizard**         | 3–4 steps: welcome → create first aspects → set target percentages (must total 100) → set availability basics. Owns the full viewport. No app shell. |

## 2. Weekly Dashboard (Home)

| Screen           | Route    | Interactions                 | UX Pattern    | Description                                                                                                                                                                       |
| ---------------- | -------- | ---------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Weekly dashboard | `/(app)` | `PLN-06`, `EXE-02`, `AVL-05` | **Dashboard** | The primary landing screen. KPI row (total available hours, planned hours, aspect health scores). Below: this week's plan summary, upcoming tasks, aspect balance ring/bar chart. |

## 3. Weekly Plan

| Screen                | Route                 | Interactions                                     | UX Pattern   | Description                                                                                                                                                                  |
| --------------------- | --------------------- | ------------------------------------------------ | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Plan view (week)      | `/(app)/plan`         | `PLN-01`, `PLN-02`, `PLN-03`, `PLN-04`, `PLN-06` | **Timeline** | Full weekly timeline with day columns. Availability blocks as background lanes. Task allocations as positioned blocks. "Now" indicator. Generate/confirm/regenerate actions. |
| Plan revision history | `/(app)/plan/history` | `PLN-06`                                         | **Feed**     | Chronological list of planning revisions with diff summaries. Each revision is a feed item showing what changed.                                                             |

## 4. Aspects

| Screen             | Route                 | Interactions                          | UX Pattern                 | Description                                                                                                                                                |
| ------------------ | --------------------- | ------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Aspects overview   | `/(app)/aspects`      | `ASP-06`                              | **Dashboard** (card grid)  | Grid of aspect cards showing name, status badge, target %, health score, task counts. "Add aspect" CTA.                                                    |
| Aspect detail      | `/(app)/aspects/[id]` | `ASP-03`, `MLS-01`–`MLS-07`, `TSK-10` | **Tabs**                   | Tabbed view: **Overview** (health, target, purpose), **Milestones** (list with progress), **Tasks** (filtered task list). Inline edit for aspect metadata. |
| Aspect create/edit | Modal over aspects    | `ASP-01`, `ASP-02`, `ASP-03`          | **Progressive Disclosure** | Dialog/drawer: name, purpose, status, target %. Advanced: default splittable toggle.                                                                       |

## 5. Tasks

| Screen            | Route                       | Interactions                          | UX Pattern                 | Description                                                                                                                                                         |
| ----------------- | --------------------------- | ------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| All tasks         | `/(app)/tasks`              | `TSK-10`                              | **Master-Detail**          | Left: filterable, searchable task list (cursor-paginated). Right: selected task detail panel. Filters for status, aspect, due date. Default excludes done/archived. |
| Task detail panel | Right pane of master-detail | `TSK-01`–`TSK-09`, `TSK-11`, `REM-01` | Detail pane                | Full task info: title, description, effort/remaining, due date, importance, status actions, milestone, recurrence info, reminders. Inline editable fields.          |
| Task create       | Modal/drawer                | `TSK-01`                              | **Progressive Disclosure** | Quick create: title + aspect (required). Expandable: effort, due date, importance, milestone, split override, reminder.                                             |
| Bulk actions      | Inline on task list         | `TSK-09`                              | Selection toolbar          | Checkbox multi-select → toolbar with bulk archive, status change, move milestone. Per-item result feedback.                                                         |

## 6. Recurring Task Series

| Screen                | Route                           | Interactions      | UX Pattern                 | Description                                                                                                                                                                                 |
| --------------------- | ------------------------------- | ----------------- | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Recurrence management | Inline within task detail       | `REC-01`–`REC-05` | **Progressive Disclosure** | Shown as a collapsible section on task detail when task is a recurring instance. Shows series info, rule, next occurrence, exceptions. Actions: pause/resume, skip/move next, close series. |
| Recurring series list | `/(app)/tasks?filter=recurring` | `TSK-10`          | Filter on Master-Detail    | Filtered view of the task list showing only recurring task series.                                                                                                                          |

## 7. Availability

| Screen                    | Route                          | Interactions                           | UX Pattern                 | Description                                                                                                                                     |
| ------------------------- | ------------------------------ | -------------------------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Availability manager      | `/(app)/settings/availability` | `AVL-01`–`AVL-05`                      | **Timeline** + list        | Top: visual weekly availability grid (recurring blocks rendered). Bottom: list of all blocks with exceptions. Add/edit via drawer.              |
| Availability block editor | Drawer                         | `AVL-01`, `AVL-02`, `AVL-03`, `AVL-04` | **Progressive Disclosure** | Form: one-off vs recurring toggle. One-off: date + time range. Recurring: weekday mask, time range, start/end dates. Advanced: exceptions list. |

## 8. Planning Profile & Settings

| Screen           | Route                     | Interactions         | UX Pattern                 | Description                                                                                                                                                                   |
| ---------------- | ------------------------- | -------------------- | -------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Settings hub     | `/(app)/settings`         | —                    | **Hub & Spoke**            | Cards linking to: Profile, Availability, Data, Account.                                                                                                                       |
| Planning profile | `/(app)/settings/profile` | `PRF-01`             | **Progressive Disclosure** | Primary: weight sliders (urgency, importance, balance, effort-fit). Always visible. Advanced (collapsible): urgent threshold days, min chunk minutes, default effort minutes. |
| Account settings | `/(app)/settings/account` | `AUTH-03`, `AUTH-06` | Standalone form            | Display name, email, timezone. Logout button. Danger zone: account deletion (GDPR erasure) with confirmation.                                                                 |

## 9. Data Portability

| Screen          | Route                  | Interactions       | UX Pattern      | Description                                                                                                                     |
| --------------- | ---------------------- | ------------------ | --------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Data management | `/(app)/settings/data` | `DAT-01`, `DAT-02` | Standalone form | Export button (triggers JSON export job). Import dropzone (triggers import job with validation preview). Job status indicators. |

## 10. Audit Log

| Screen         | Route                   | Interactions | UX Pattern | Description                                                                                                                                            |
| -------------- | ----------------------- | ------------ | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Audit timeline | `/(app)/settings/audit` | `AUD-02`     | **Feed**   | Cursor-paginated, chronological feed of audit events. Each item shows: event type, entity type, timestamp, redacted diff summary. Load-more at bottom. |

## 11. Execution & Reminders

| Screen                     | Route                 | Interactions       | UX Pattern     | Description                                                                                                 |
| -------------------------- | --------------------- | ------------------ | -------------- | ----------------------------------------------------------------------------------------------------------- |
| Allocation outcome marking | Inline on plan view   | `EXE-01`           | Inline action  | Each past allocation block on the timeline has attended/missed toggle.                                      |
| Reminder management        | Inline on task detail | `REM-01`, `REM-02` | Inline section | Reminder section on task detail: create/edit reminder (datetime + channel), snooze button, delivery status. |

---

## Screen Count Summary

| Category                 | Screens    |
| ------------------------ | ---------- |
| Auth & onboarding        | 3          |
| Dashboard                | 1          |
| Weekly plan              | 2          |
| Aspects                  | 3          |
| Tasks                    | 4          |
| Recurrence               | 2 (inline) |
| Availability             | 2          |
| Settings                 | 4          |
| Data portability         | 1          |
| Audit                    | 1          |
| Execution/reminders      | 2 (inline) |
| **Total distinct views** | **~18**    |

## Cross-Cutting UI Elements

| Element              | Description                                                                                                                        |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| App shell            | Persistent sidebar nav (aspects, tasks, plan, settings) + top bar (user avatar, week selector). Collapses to bottom nav on mobile. |
| Global search        | Launcher/command palette (`Cmd+K`) for quick task search (`TSK-10`).                                                               |
| Toast notifications  | In-app reminder delivery, operation confirmations, error feedback.                                                                 |
| Confirmation dialogs | Destructive actions (archive, delete account, close series).                                                                       |
| Empty states         | Every list/grid has a contextual empty state with setup guidance.                                                                  |
