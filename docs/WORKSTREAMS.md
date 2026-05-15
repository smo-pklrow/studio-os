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

## Stream D — Dashboard (Level 1) Gaps `[COMPLETE]`

**Scope**: Client edit, health selector, pause flow, search/filter
**Files**: `src/pages/Dashboard.jsx`, `src/components/clients/`
**Dependencies**: Stream A (`updateClient` already in hook)

### Done
- [x] Client list rows with progress bars, health badges, stats
- [x] Add client modal (name, project, color, logo, health, start date, due date)
- [x] Archive client flow
- [x] Stats bar (live from DB)
- [x] Week calendar strip (UI shell)
- [x] Morning digest strip (UI shell)
- [x] Edit client modal — pre-fills all fields; saves via `updateClient` with optional logo upload
- [x] "Edit" in ClientRow three-dot menu
- [x] Health badge click → dropdown to change health inline
- [x] Pause client (`status: paused`) — amber border + opacity treatment
- [x] Search / filter bar — filter by name + health dropdown
- [x] Empty state polish — "No clients yet" vs "No clients match" states

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

**Left column**
- [ ] `useTaskDetail.js` — fetch task + subtasks + notes + files + inspo_items + task_links
- [ ] Two-column layout — left: content, right: sidebar cards
- [ ] Breadcrumb — All clients › Client › Group › Task
- [ ] Editable task title (large heading, click to edit)
- [ ] Status pill + due date + priority chips in header row — each clickable
- [ ] Description textarea (click to edit, saves on blur)
- [ ] Subtasks — add / check / delete; stored in `subtasks` table
- [ ] Notes — timestamped freetext; stored in `notes` table; "Add note" textarea
- [ ] Claude panel shell — placeholder card "Claude knows this client · Phase 3"

**Right sidebar cards**
- [ ] Linked calendar card — Phase 3 shell; static placeholder until Calendar MCP wired
- [ ] Gmail threads card — manually linked; "Link thread" form (URL + label); stored in `task_links`
- [ ] Inspo board card — image / link / note tiles; stored in `inspo_items`; drag to reorder
- [ ] Files card — upload to `task-files` bucket; list filename + size + date; delete

**Schema**
- [ ] Migration 004: `task_links` table (id, task_id, url, label, created_at); any missing task detail columns

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

**Scope**: Claude Managed Agents + all AI-powered features — the blue ocean differentiation
**Files**: `supabase/functions/`, `src/components/layout/DigestStrip.jsx`, `src/pages/TaskDetail.jsx`
**Dependencies**: All Phase 2 streams complete

### Architecture
One **Claude Managed Agent** per client (Anthropic infrastructure, 2026). Replaces n8n/Make/custom schedulers. Persistent memory per client built in. Webhooks fire into agents; agents read + write Supabase and live integrations.

> **Live connections**: Google Calendar (MCP, read + write) and Buffer (API).  
> **No Gmail API** — Gmail threads in TaskDetail are manually linked URLs only.  
> **Figma** — URL-linking only; opens natively.

### Tasks

**3A — Agent setup**
- [ ] Provision one Claude Managed Agent per client
- [ ] Wire memory feeds: brain dump, tasks, notes, files

**3B — Automated runs**
- [ ] Daily 7am — morning digest → DigestStrip
- [ ] Mon 7am — weekly priorities email to studio owner
- [ ] Task → Done trigger — agent suggests next action
- [ ] Deadline 3d — flag card + write Calendar reminder via MCP

**3C — Google Calendar MCP**
- [ ] Connect Google Calendar MCP on Anthropic infra
- [ ] Due dates push to calendar on change
- [ ] Live events appear in Level 1 WeekCalendar
- [ ] Linked calendar sidebar card in TaskDetail wired (replaces shell)

**3D — AI Brief + Smart Tools**
- [ ] Edge Function: `/generate-brief` — brain dump → client brief
- [ ] Edge Function: `/auto-tag` — brain dump → theme tags
- [ ] Brief preview modal in ClientBoard brain dump tab
- [ ] AI tag chips on brain dump cards
- [ ] Extract action items from notes → calendar items

**3E — Claude panel (TaskDetail)**
- [ ] Wire Claude panel — context from brain dump + notes + client memory
- [ ] Proactive message + action buttons ("Draft 3 directions ↗")
- [ ] Actions call Managed Agent with task context

**3F — Buffer**
- [ ] Connect Buffer API
- [ ] Queued posts visible per client board
- [ ] Draft post action via Claude panel → Buffer queue

**3G — Figma links**
- [ ] `figma_url text` column on `tasks` table (migration)
- [ ] Figma link field in TaskDetail sidebar

**3H — Scheduling**
- [ ] Connect Settings digest time to automated run schedule
- [ ] Email delivery for weekly digest

---

## Stream I — Studio Layer (Phase 4) `[NOT STARTED]`

**Scope**: Business ops features for the studio
**Dependencies**: Phase 3 complete

### Tasks
- [ ] Time tracking per task (log hours; roll up per client)
- [ ] Invoice PDF generator (from logged hours + client rate)
- [ ] Proposal template builder (brief → project scope)
- [ ] Subcontractor support (re-enable task_assignments RLS; invite flow)
