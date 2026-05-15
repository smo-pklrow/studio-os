# Workstreams — Studio OS

> Independent tracks that can be built in parallel. Each stream has a clear owner boundary so agents and sessions don't step on each other. Check PHASE_TRACKER.md for detailed task breakdowns and priority order.

---

## Stream A — Data Layer (Supabase) `[PHASE 2 COMPLETE]`

**Scope**: Schema, migrations, RLS policies, hooks, Edge Functions
**Files**: `supabase/`, `src/lib/`, `src/hooks/`
**Dependencies**: None — this unblocks everything else

### Done
- [x] Schema + RLS policies (`supabase/schema.sql`)
- [x] Migration 002: client branding columns
- [x] Migration 003: fix RLS recursion
- [x] Migration 004: `task_links` table + RLS
- [x] Migration 005: portal RLS (public read via share_token)
- [x] Migration 006: `studio_name` on profiles
- [x] `useClients` — fetch all with embedded task stats, full CRUD
- [x] `useClient` — single client fetch + update
- [x] `useTasks` — task groups + tasks CRUD + drag-drop reorder
- [x] `useBrainDump` — brain dump cards CRUD
- [x] `useTaskDetail` — task + subtasks + notes + files + inspo_items + task_links
- [x] `usePortal` — public read by share_token (no auth)
- [x] `useProfile` — fetch + update profiles row for current user

### Remaining (Phase 3)
- [ ] Edge Functions: `/weekly-digest`, `/generate-brief`, `/auto-tag` (Phase 3)

### Rules
- Every Supabase query lives in a hook, never inline in JSX
- RLS enforced on every table — never bypass with service_role key in frontend
- Edge Functions: TypeScript, call Claude API via `@anthropic-ai/sdk`, deployed via Supabase dashboard

---

## Stream B — Navigation & App Shell `[COMPLETE]`

**Scope**: Persistent nav, user menu, logout, 404
**Files**: `src/components/layout/AppShell.jsx`, `src/components/layout/NavBar.jsx`
**Dependencies**: None

### Done
- [x] `NavBar.jsx` — persistent top bar: logo, studio name (or "Studio OS"), Settings link, user avatar
- [x] User avatar dropdown — display name, email, Settings link, Sign out
- [x] Sign out flow — clears localStorage tab-persistence keys, redirects to `/login`
- [x] 404 page — friendly not-found with back link
- [x] `AppShell.jsx` — auth guard + NavBar + Outlet; fetches studio_name for nav display

### Rules
- NavBar must not re-render on route changes — lift user state to AppShell
- Sign out must clear all localStorage tab-persistence keys

---

## Stream C — Settings & Admin `[COMPLETE]`

**Scope**: Settings page, profile, studio name, theme, danger zone
**Files**: `src/pages/Settings.jsx`, `src/hooks/useProfile.js`
**Dependencies**: Stream B (nav links to settings)

### Done
- [x] `useProfile.js` — fetch + update `profiles` row for current user
- [x] `Settings.jsx` — route `/settings`
- [x] Profile section — Google avatar + display name (read-only from OAuth)
- [x] Studio name field — editable, stored in `profiles.studio_name`; shown in nav bar
- [x] Theme toggle — dark active, light disabled ("coming soon")
- [x] Notification preferences — digest schedule placeholder (Phase 3 badge, disabled selects)
- [x] Danger zone — Sign out button + Delete account with inline confirmation
- [x] Migration 006: `ALTER TABLE profiles ADD COLUMN studio_name text`

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

## Stream E — Client Board (Level 2) Gaps `[COMPLETE]`

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
- [x] Due date picker on TaskRow (inline date input)
- [x] Task title inline edit (double-click to edit; 280ms timer disambiguates vs navigate)
- [x] Group rename (double-click group name)
- [x] Group color picker (click group dot → swatch popover)
- [x] Group delete (inline confirmation in header)
- [x] Health editor in ClientHeader (click badge → dropdown)
- [x] Priority selector on TaskRow (click badge → cycles normal → high → low)

---

## Stream F — Task Detail (Level 3) `[COMPLETE]`

**Scope**: Full task detail page — the deepest drill-down level
**Files**: `src/pages/TaskDetail.jsx`, `src/hooks/useTaskDetail.js`, `src/components/tasks/`
**Dependencies**: Streams A, D, E

### Done

**Left column**
- [x] `useTaskDetail.js` — fetch task + subtasks + notes + files + inspo_items + task_links (parallel Promise.all)
- [x] Two-column layout — left: content, right: 272px sidebar
- [x] Breadcrumb — All clients › Client › Group › Task
- [x] Editable task title (large heading, click to edit)
- [x] Status pill + due date + priority chips in header row — each clickable
- [x] Description textarea (click to edit, saves on blur)
- [x] Subtasks — add / check / delete; stored in `subtasks` table
- [x] Notes — timestamped freetext; stored in `notes` table; Enter to save
- [x] Claude panel shell — placeholder card with Phase 3 badge

**Right sidebar cards**
- [x] Linked calendar card — Phase 3 shell with dashed border placeholder
- [x] Gmail threads card — "Link thread" form (URL + label); stored in `task_links`; delete option
- [x] Inspo board card — note / link / image tiles; stored in `inspo_items`; @dnd-kit drag to reorder; 2-col grid
- [x] Files card — upload to `task-files` bucket; ext badge + size + date; signed URL download; delete

**Schema**
- [x] Migration 004: `task_links` table (id, task_id, url, label, created_at) + RLS policy

---

## Stream G — Client Portal `[COMPLETE]`

**Scope**: Public read-only client-facing view — the trust-builder
**Files**: `src/pages/ClientPortal.jsx`, `src/hooks/usePortal.js`
**Dependencies**: Stream A (migration 005 + usePortal hook)

### Done
- [x] Migration 005: RLS policy — anon SELECT on `clients`, `task_groups`, `tasks` where `share_token` not null
- [x] `usePortal.js` — public fetch (no auth); joins task_groups + tasks; sorted in JS
- [x] Portal page layout — "Studio OS" header + "Client View" label, client hero card with logo/avatar + health badge + progress bar
- [x] Task groups — read-only, collapsible (chevron toggle), status count badges
- [x] Task rows — visual checkbox, title (strikethrough if done), status badge, due date
- [x] Empty state — "No tasks to show yet"
- [x] Invalid token state — "Link not found or expired"
- [x] "Powered by Studio OS" footer

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
