# Phase Tracker — Studio OS

> Update this file after every session. Mark tasks `[x]` when complete. Add blockers inline.

**Current phase**: Phase 2 — Core UX Completion (2F done → 2G next)
**Last updated**: 2026-05-15

---

## Phase 1 — Foundation `[COMPLETE]`

- [x] Vite + React + Tailwind scaffold
- [x] Supabase client setup (`src/lib/supabase.js`)
- [x] Google OAuth login page (animated dark UI)
- [x] Supabase schema + RLS policies (`supabase/schema.sql`)
- [x] Cloudflare Pages deploy pipeline
- [x] Core CSS tokens and global styles

---

## Phase 2 — Core UX Completion `[IN PROGRESS]`

Items are ordered by build priority. Do not skip ahead — each group unblocks the next.

---

### 2A — Navigation & App Shell `[COMPLETE]`

- [x] App nav bar — persistent top bar: logo, Studio OS wordmark (links to /), Settings link, user avatar
- [x] User avatar menu — dropdown: display name, email, Settings link, Sign out
- [x] Sign out flow — clears tab-persistence localStorage keys, `supabase.auth.signOut()`, redirects to `/login`
- [x] 404 / not-found page — friendly message + "Back to studio" button
- [x] `/settings` route — placeholder page with section shells (full build in 2F)

---

### 2B — Client Edit & Dashboard Gaps `[COMPLETE]`

> The single biggest day-two UX gap. Right now clients are write-once.

- [x] Edit client modal — pre-fills name, project name, color, logo, health, start date, due date; saves via `updateClient`
- [x] "Edit" option in ClientRow three-dot menu (opens edit modal)
- [x] Health selector — click health badge on ClientRow to cycle / dropdown-change status
- [x] Pause client flow — `status: paused` shows differently in the list (amber tint, not archived)
- [x] Start date + due date fields in AddClientModal (were in schema, missing from creation form)
- [x] Search / filter bar on Dashboard — filter rows by client name or health status
- [x] Empty state polish — better copy and visual for zero-client state

---

### 2C — Level 2 Task Board Gaps `[COMPLETE]`

> Core daily-use gaps. The board is incomplete without these.

- [x] Due date picker on TaskRow — click due date text → inline date input; updates `tasks.due_date` on change
- [x] Task title inline edit — double-click title on TaskRow to edit in place; Enter saves, Escape cancels
- [x] Group rename — double-click group name to edit inline
- [x] Group color picker — click group dot to change color from a swatch palette
- [x] Group delete — with confirmation inline in header; deletes all tasks in the group
- [x] Health / status editor in ClientHeader — click health badge to open dropdown and change `clients.health`
- [x] Priority selector on TaskRow — click priority badge to cycle (normal → high → low → normal)

---

### 2D — Task Detail (Level 3) `[COMPLETE]`

> Completes the drill-down. Clicking a task title currently leads nowhere.

**Left column (main content)**
- [x] Page layout — two-column: left (title, status, description, subtasks, notes, Claude panel), right (sidebar cards)
- [x] Breadcrumb — All clients › Client name › Group name › Task title
- [x] Task title — large editable heading (click to edit inline)
- [x] Status pill + due date + priority — row of chips at top; each clickable
- [x] Description — plain textarea, click to edit, saves on blur
- [x] Subtasks — add / check-off / delete; stored in `subtasks` table
- [x] Notes — timestamped freetext notes stored in `notes` table; "Add note" textarea
- [x] Claude panel shell — placeholder card "Claude knows this client · Phase 3" with muted description (wired in Phase 3)

**Right sidebar (stacked cards)**
- [x] Linked calendar card — Phase 3 shell; shows placeholder "Connect calendar in Phase 3"
- [x] Gmail threads card — manually linked email threads; "Link thread" opens a small form (URL + label); stored in `task_links` table; shows thread title + date; delete option
- [x] Inspo board card — image / link / note tiles; stored in `inspo_items`; drag to reorder; "drag to reorder" label
- [x] Files card — upload to Supabase Storage `task-files` bucket; list filename + size + date; delete

**Data + schema**
- [x] `useTaskDetail` hook — fetches task + subtasks + notes + files + inspo_items + task_links by task ID
- [x] Schema migration — `supabase/migrations/004_task_detail.sql` — add `task_links` table (id, task_id, url, label, created_at); any missing task detail columns

---

### 2E — Client Portal `[COMPLETE]`

> The client-facing differentiator. Makes the tool feel professional to clients — they get a live view without a login.

- [x] `/portal/:token` route — public, no auth; matches `clients.share_token`
- [x] Portal page layout — Studio name header, client name + project, progress bar, task list
- [x] Task groups — read-only, collapsible, with status counts
- [x] Task rows — title, status badge, due date; no edit controls
- [x] Empty state — "No tasks to show yet"
- [x] Invalid / expired token state — clear error message
- [x] "Powered by Studio OS" footer (subtle branding)
- [x] `usePortal` hook — public fetch by token; no auth required (RLS policy: token match = read access)
- [x] Schema migration — RLS policy on `clients` for portal read by `share_token` — `supabase/migrations/005_portal_rls.sql`

---

### 2F — Settings & Admin `[COMPLETE]`

> Needed before any real user can adopt this as their primary tool.

- [x] Settings page — route `/settings`, accessible from nav
- [x] Profile section — display name (from Google), avatar display
- [x] Studio name — stored in `profiles.studio_name`; shown in portal header and nav
- [x] Theme toggle — dark / light; dark-only for now, light mode deferred
- [x] Notification preferences — digest day + time (placeholder; wired in Phase 3)
- [x] Danger zone — Sign out button, delete account (with confirmation)
- [x] Schema migration — add `studio_name text` to `profiles` — `supabase/migrations/006_studio_name.sql`

---

### 2G — Completeness & Polish `[COMPLETE]`

- [x] Loading skeletons on Dashboard (client rows + stats bar), ClientBoard (task groups)
- [x] Error boundaries on each protected page route (`ErrorBoundary` wraps Dashboard, ClientBoard, TaskDetail, Settings)
- [x] Mobile layout — StatsBar 2×2 on mobile, WeekCalendar horizontal scroll on mobile
- [x] Empty states — brain dump canvas; groups (already existed); task rows (already existed)
- [x] Keyboard navigation — Escape closes AddClientModal and EditClientModal
- [ ] Week calendar events — deferred to Phase 3 (Google Calendar MCP)
- [x] Pause client visual treatment — amber border + opacity on ClientRow (was already built in 2B)

---

### Hooks — all done ✓

- [x] `useClients` — fetch all (enriched with task stats), create, archive, update
- [x] `useClient` — single client by ID
- [x] `useTasks` — task groups + tasks by client, CRUD, drag-drop reorder
- [x] `useBrainDump` — brain dump cards by client, CRUD
- [x] `useTaskDetail` — task + subtasks + notes + files + inspo_items (Phase 2D)
- [x] `usePortal` — public fetch by share_token (Phase 2E)

---

## Phase 3 — Intelligence Layer `[NOT STARTED]`

> The blue ocean. Build after Phase 2 is fully complete and stable.
> Architecture: **Claude Managed Agents** (Anthropic infrastructure, 2026) — one agent per client, persistent memory built in. Replaces n8n, Make, and custom Edge Function schedulers. Webhooks fire into agents; agents read + write Supabase and live integrations.

---

### 3A — Claude Managed Agent Setup

- [ ] Provision one Claude Managed Agent per client (Anthropic dashboard)
- [ ] Wire agent memory feeds: brain dump cards, completed tasks, uploaded files, session notes
- [ ] Agent persistently knows: design preferences, approved directions, key decisions, client tone

---

### 3B — Automated Runs

- [ ] **Daily 7am** — morning digest: agent reads tasks + calendar events → populates DigestStrip on Level 1
- [ ] **Mon 7am** — weekly priorities email: agent reads all client data → drafts + sends email to studio owner
- [ ] **Task → Done trigger** — agent flags completion; proactively suggests next action based on client memory
- [ ] **Deadline in 3 days** — agent flags task card; writes calendar reminder via Google Calendar MCP

---

### 3C — Google Calendar MCP

- [ ] Connect Google Calendar via MCP on Anthropic infra (read + write access)
- [ ] Due dates push to calendar automatically when set or changed
- [ ] Calendar events appear in Level 1 WeekCalendar (replacing static placeholder)
- [ ] Linked calendar card in TaskDetail right sidebar — shows live event for this task if one exists

---

### 3D — AI Brief + Smart Tools

- [ ] Edge Function: `/generate-brief` — brain dump cards → structured shareable client brief
- [ ] Edge Function: `/auto-tag` — brain dump entries → theme tags (brand, copy, visual, strategy)
- [ ] Brief preview modal in ClientBoard brain dump tab
- [ ] AI tag chips on brain dump cards
- [ ] "Extract action items" in TaskDetail notes — Claude reads notes → returns calendar items

---

### 3E — Claude Panel (Task Detail)

- [ ] Wire Claude panel in TaskDetail — context from brain dump + notes + client memory
- [ ] Proactive message ("I know this client from N sessions")
- [ ] Action buttons: e.g. "Draft 3 directions ↗", "Draft review email ↗"
- [ ] Actions call Claude Managed Agent with current task context

---

### 3F — Buffer Integration

- [ ] Connect Buffer API per studio owner account
- [ ] Queued posts visible per client (on ClientBoard or sidebar)
- [ ] "Draft post" action in Claude panel → Buffer queue

---

### 3G — Figma Link Field

- [ ] Add `figma_url text` column to `tasks` table (migration)
- [ ] Figma link field in TaskDetail sidebar — paste URL; shows "Open in Figma ↗"
- [ ] No file storage — URL-only, opens natively in Figma

---

### 3H — Digest + Notifications

- [ ] Notification preferences wired — connect Settings digest time to automated run schedule
- [ ] Email delivery for weekly digest (Supabase edge function or Resend)

---

## Phase 4 — Studio Layer `[NOT STARTED]`

- [ ] Time tracking — log hours per task; roll up per client per week
- [ ] Invoice generator — PDF from logged hours + client rate; downloadable
- [ ] Proposal template builder — turn client brief into a project scope doc
- [ ] Subcontractor support — re-enable task_assignments RLS policies; invite flow; limited portal access

---

## Migrations Index

| File | Description | Status |
|---|---|---|
| `supabase/schema.sql` | Full initial schema — run once | Done |
| `migrations/002_client_branding.sql` | Add `color`, `logo_url` to `clients` | Run in SQL Editor |
| `migrations/003_fix_rls_recursion.sql` | Drop circular subcontractor policies | Run in SQL Editor |
| `migrations/004_task_detail.sql` | `task_links` table + RLS policy | Run in SQL Editor |
| `migrations/005_portal_rls.sql` | RLS policy: public read by `share_token` | Run in SQL Editor |
| `migrations/006_studio_name.sql` | Add `studio_name` to `profiles` | Run in SQL Editor |

---

## Blockers & Notes

| Date | Blocker | Status |
|---|---|---|
| 2026-05-15 | RLS infinite recursion on `task_assignments` ↔ `clients` | Fixed via migration 003 |
