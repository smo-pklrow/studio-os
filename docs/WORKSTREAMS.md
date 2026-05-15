# Workstreams — Studio OS

> Independent tracks that can be built in parallel. Each stream has a clear owner boundary so agents and sessions don't step on each other. Check PHASE_TRACKER.md for detailed task breakdowns and priority order.

---

## Stream A — Data Layer (Supabase) `[MOSTLY DONE]`

**Scope**: Schema, migrations, RLS policies, hooks, Edge Functions
**Files**: `supabase/`, `src/lib/`, `src/hooks/`
**Dependencies**: None — this unblocks everything else

### Done
- [x] Schema + RLS policies (`supabase/schema.sql`)
- [x] Migration 002: client branding columns
- [x] Migration 003: fix RLS recursion
- [x] `useClients` — fetch all with embedded task stats, full CRUD
- [x] `useClient` — single client fetch + update
- [x] `useTasks` — task groups + tasks CRUD + drag-drop reorder
- [x] `useBrainDump` — brain dump cards CRUD

### Remaining
- [ ] `useTaskDetail` — task + subtasks + notes + files + inspo_items
- [ ] `usePortal` — public read by share_token (no auth)
- [ ] Migration 004: any missing task detail columns
- [ ] Migration 005: portal RLS policy (public read via share_token)
- [ ] Migration 006: `studio_name` on profiles
- [ ] Edge Functions: `/weekly-digest`, `/generate-brief`, `/auto-tag` (Phase 3)

### Rules
- Every Supabase query lives in a hook, never inline in JSX
- RLS enforced on every table — never bypass with service_role key in frontend
- Edge Functions: TypeScript, call Claude API via `@anthropic-ai/sdk`, deployed via Supabase dashboard

---

## Stream B — Navigation & App Shell `[NOT STARTED — PRIORITY]`

**Scope**: Persistent nav, user menu, logout, 404
**Files**: `src/components/layout/AppShell.jsx`, `src/components/layout/NavBar.jsx`
**Dependencies**: None

### Tasks
- [ ] `NavBar.jsx` — persistent top bar: Studio OS logo, Dashboard link, Settings link, user avatar
- [ ] User avatar dropdown — display name, Sign out (`supabase.auth.signOut()`)
- [ ] Sign out flow — clears session, redirects to `/login`
- [ ] 404 page — friendly not-found with back link
- [ ] `AppShell.jsx` update — include NavBar above `<Outlet />`

### Rules
- NavBar must not re-render on route changes — lift user state to AppShell
- Sign out must clear all localStorage tab-persistence keys

---

## Stream C — Settings & Admin `[NOT STARTED]`

**Scope**: Settings page, profile, studio name, theme, danger zone
**Files**: `src/pages/Settings.jsx`, `src/hooks/useProfile.js`
**Dependencies**: Stream B (nav links to settings)

### Tasks
- [ ] `useProfile.js` — fetch + update `profiles` row for current user
- [ ] `Settings.jsx` — route `/settings`
- [ ] Profile section — Google avatar + display name (read-only from OAuth)
- [ ] Studio name field — editable, stored in `profiles.studio_name`
- [ ] Theme toggle — dark/light (dark-only for now, light deferred)
- [ ] Notification preferences — digest schedule (placeholder; wired in Phase 3)
- [ ] Danger zone — Sign out button, Delete account with confirmation modal
- [ ] Migration 006: `ALTER TABLE profiles ADD COLUMN studio_name text`

---

## Stream D — Dashboard (Level 1) Gaps `[IN PROGRESS]`

**Scope**: Client edit, health selector, pause flow, search/filter
**Files**: `src/pages/Dashboard.jsx`, `src/components/clients/`
**Dependencies**: Stream A (`updateClient` already in hook)

### Done
- [x] Client list rows with progress bars, health badges, stats
- [x] Add client modal (name, project, color, logo)
- [x] Archive client flow
- [x] Stats bar (live from DB)
- [x] Week calendar strip (UI shell)
- [x] Morning digest strip (UI shell)

### Remaining
- [ ] Edit client modal — pre-fills all fields; saves via `updateClient`
- [ ] "Edit" in ClientRow three-dot menu
- [ ] Health badge click → dropdown to change health
- [ ] Pause client (`status: paused`) — muted visual treatment in list
- [ ] Start date + due date in AddClientModal
- [ ] Search / filter bar — filter by name or health
- [ ] Empty state polish

---

## Stream E — Client Board (Level 2) Gaps `[IN PROGRESS]`

**Scope**: Task editing gaps, group management, client health editor
**Files**: `src/pages/ClientBoard.jsx`, `src/components/tasks/`
**Dependencies**: Stream A

### Done
- [x] Task groups with drag-drop reorder
- [x] Task rows (checkbox, status dropdown, due date display, priority badge)
- [x] Inline add task per group
- [x] New group flow
- [x] Brain dump canvas + cards
- [x] Tab persistence

### Remaining
- [ ] Due date picker on TaskRow (inline date input)
- [ ] Task title inline edit (double-click to edit)
- [ ] Group rename (double-click group name)
- [ ] Group color picker (click group dot)
- [ ] Group delete (with confirmation)
- [ ] Health editor in ClientHeader (click badge → dropdown)
- [ ] Priority selector on TaskRow (click badge → cycle)

---

## Stream F — Task Detail (Level 3) `[NOT STARTED]`

**Scope**: Full task detail page — the deepest drill-down level
**Files**: `src/pages/TaskDetail.jsx`, `src/hooks/useTaskDetail.js`, `src/components/tasks/`
**Dependencies**: Streams A, D, E

### Tasks
- [ ] `useTaskDetail.js` — fetch task + subtasks + notes + files + inspo_items
- [ ] Two-column layout — left: content, right: sidebar
- [ ] Breadcrumb — All clients › Client › Group › Task
- [ ] Editable task title (large heading, click to edit)
- [ ] Status pill + due date + priority in header row
- [ ] Description textarea (click to edit, saves on blur)
- [ ] Subtasks — add / check / delete; stored in `subtasks` table
- [ ] Notes — timestamped; stored in `notes` table
- [ ] Files — upload to `task-files` bucket; list + delete
- [ ] Inspo board — image/link/note tiles; stored in `inspo_items`; drag to reorder
- [ ] Claude panel shell — placeholder (wired in Phase 3)

---

## Stream G — Client Portal `[NOT STARTED]`

**Scope**: Public read-only client-facing view — the trust-builder
**Files**: `src/pages/ClientPortal.jsx`, `src/hooks/usePortal.js`
**Dependencies**: Stream A (migration 005 + usePortal hook)

### Tasks
- [ ] Migration 005: RLS policy — public SELECT on `clients` where `share_token` matches
- [ ] `usePortal.js` — public fetch (no auth); joins task_groups + tasks
- [ ] Portal page layout — studio name header, client name + project, progress bar
- [ ] Task groups — read-only, collapsible, status counts
- [ ] Task rows — title, status badge, due date; no edit controls
- [ ] Invalid token state — clear error message
- [ ] "Powered by Studio OS" footer

---

## Stream H — Intelligence Layer (Phase 3) `[NOT STARTED]`

**Scope**: Claude-powered features — the blue ocean differentiation
**Files**: `supabase/functions/`, `src/components/layout/DigestStrip.jsx`
**Dependencies**: All Phase 2 streams complete

### Tasks
- [ ] Edge Function: `/weekly-digest` — reads all tasks + brain dump for user; returns briefing bullets
- [ ] Edge Function: `/generate-brief` — brain dump cards → structured client brief
- [ ] Edge Function: `/auto-tag` — brain dump entries → theme tags
- [ ] Wire `DigestStrip` to `/weekly-digest` (replace shell with real data)
- [ ] Brief preview modal in ClientBoard brain dump tab
- [ ] AI tag chips on brain dump cards
- [ ] "Extract action items" in TaskDetail notes (Claude reads notes → calendar items)
- [ ] Claude panel in TaskDetail (context from brain dump + history)
- [ ] Digest scheduling + notifications

---

## Stream I — Studio Layer (Phase 4) `[NOT STARTED]`

**Scope**: Business ops features for the studio
**Dependencies**: Phase 3 complete

### Tasks
- [ ] Time tracking per task (log hours; roll up per client)
- [ ] Invoice PDF generator (from logged hours + client rate)
- [ ] Proposal template builder (brief → project scope)
- [ ] Google Calendar sync (task due dates ↔ calendar events; feeds WeekCalendar)
- [ ] Subcontractor support (re-enable task_assignments RLS; invite flow)
