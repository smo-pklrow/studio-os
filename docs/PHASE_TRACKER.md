# Phase Tracker — Studio OS

> Update this file after every session. Mark tasks `[x]` when complete. Add blockers inline.

**Current phase**: Phase 2 — Core UX Completion (2B done → 2C next)
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

### 2C — Level 2 Task Board Gaps `[NEXT — current]`

> Core daily-use gaps. The board is incomplete without these.

- [ ] Due date picker on TaskRow — inline date input; updates `tasks.due_date` on change
- [ ] Task title inline edit — double-click title on TaskRow to edit in place; Enter saves, Escape cancels
- [ ] Group rename — double-click group name to edit inline
- [ ] Group color picker — click group dot to change color from a swatch palette
- [ ] Group delete — with confirmation; deletes all tasks in the group
- [ ] Health / status editor in ClientHeader — click health badge to open dropdown and change `clients.health`
- [ ] Priority selector on TaskRow — click priority badge to cycle (normal → high → low → normal)

---

### 2D — Task Detail (Level 3) `[AFTER 2A–2C]`

> Completes the drill-down. Clicking a task title currently leads nowhere.

- [ ] Page layout — two-column: left (title, status, description, subtasks, notes), right sidebar (due date, priority, files, inspo board)
- [ ] Breadcrumb — All clients › Client name › Group name › Task title
- [ ] Task title — large editable heading (click to edit inline)
- [ ] Status pill — click to change (same dropdown as TaskRow)
- [ ] Due date picker — date input in sidebar
- [ ] Priority selector — dropdown in sidebar
- [ ] Description — plain textarea, click to edit, saves on blur
- [ ] Subtasks — add / check-off / delete; stored in `subtasks` table
- [ ] Notes — timestamped freetext notes stored in `notes` table; "Add note" button
- [ ] Files — upload to Supabase Storage `task-files` bucket; list filename + size; delete
- [ ] Inspo board — image / link / note tiles; stored in `inspo_items`; drag to reorder
- [ ] `useTaskDetail` hook — fetches task + subtasks + notes + files + inspo_items by task ID
- [ ] Claude panel shell — placeholder card "Claude knows this client · Phase 3" (wired in Phase 3)
- [ ] Schema migration for any missing columns — `supabase/migrations/004_task_detail.sql`

---

### 2E — Client Portal `[AFTER 2D]`

> The client-facing differentiator. Makes the tool feel professional to clients — they get a live view without a login.

- [ ] `/portal/:token` route — public, no auth; matches `clients.share_token`
- [ ] Portal page layout — Studio name header, client name + project, progress bar, task list
- [ ] Task groups — read-only, collapsible, with status counts
- [ ] Task rows — title, status badge, due date; no edit controls
- [ ] Empty state — "No tasks to show yet"
- [ ] Invalid / expired token state — clear error message
- [ ] "Powered by Studio OS" footer (subtle branding)
- [ ] `usePortal` hook — public fetch by token; no auth required (RLS policy: token match = read access)
- [ ] Schema migration — RLS policy on `clients` for portal read by `share_token` — `supabase/migrations/005_portal_rls.sql`

---

### 2F — Settings & Admin `[AFTER 2E]`

> Needed before any real user can adopt this as their primary tool.

- [ ] Settings page — route `/settings`, accessible from nav
- [ ] Profile section — display name (from Google), avatar display
- [ ] Studio name — stored in `profiles.studio_name`; shown in portal header and nav
- [ ] Theme toggle — dark / light; dark-only for now, light mode deferred
- [ ] Notification preferences — digest day + time (placeholder; wired in Phase 3)
- [ ] Danger zone — Sign out button, delete account (with confirmation)
- [ ] Schema migration — add `studio_name text` to `profiles` — `supabase/migrations/006_studio_name.sql`

---

### 2G — Completeness & Polish `[ONGOING]`

- [ ] Loading skeletons on Dashboard, ClientBoard, TaskDetail
- [ ] Error boundaries on each page route
- [ ] Mobile layout (375px breakpoint) — Dashboard list collapses gracefully
- [ ] Empty states for every zero-data condition (no groups, no brain dump cards, no tasks)
- [ ] Keyboard navigation — Escape closes all modals/dropdowns
- [ ] Week calendar events — custom event model or Phase 4 Google Calendar sync
- [ ] Pause client visual treatment — muted card style in list

---

### Hooks — all done ✓

- [x] `useClients` — fetch all (enriched with task stats), create, archive, update
- [x] `useClient` — single client by ID
- [x] `useTasks` — task groups + tasks by client, CRUD, drag-drop reorder
- [x] `useBrainDump` — brain dump cards by client, CRUD
- [ ] `useTaskDetail` — task + subtasks + notes + files + inspo_items (Phase 2D)
- [ ] `usePortal` — public fetch by share_token (Phase 2E)

---

## Phase 3 — Intelligence Layer `[NOT STARTED]`

> This is the blue ocean. Everything below is what makes Studio OS different from Notion + Linear.
> Build after Phase 2 is fully complete and stable.

- [ ] Edge Function: `/weekly-digest` — Claude reads all tasks + brain dump; returns bullet-point briefing
- [ ] Edge Function: `/generate-brief` — Claude turns brain dump cards into a structured client brief
- [ ] Edge Function: `/auto-tag` — Claude tags brain dump entries by theme (brand, copy, visual, strategy, etc.)
- [ ] Morning digest wired — `DigestStrip` calls `/weekly-digest`, caches result, shows real bullets
- [ ] Digest scheduling — send digest email (or in-app) at configured day/time
- [ ] Brief preview modal — trigger from ClientBoard brain dump tab; shows Claude's generated brief; copy / export
- [ ] AI tag chips on brain dump cards — displayed after `/auto-tag` runs
- [ ] "Extract action items" from notes (seen in Level 3 mockup) — Claude reads task notes, returns calendar items
- [ ] Claude panel in TaskDetail — context loaded from brain dump + notes; shows proactive suggestions + action buttons
- [ ] Notification preferences wired — connect Settings digest time to Edge Function scheduling

---

## Phase 4 — Studio Layer `[NOT STARTED]`

- [ ] Time tracking — log hours per task; roll up per client per week
- [ ] Invoice generator — PDF from logged hours + client rate; downloadable
- [ ] Proposal template builder — turn client brief into a project scope doc
- [ ] Google Calendar sync — sync task due dates as calendar events; surface in WeekCalendar
- [ ] Subcontractor support — re-enable task_assignments RLS policies; invite flow; limited portal access

---

## Migrations Index

| File | Description | Status |
|---|---|---|
| `supabase/schema.sql` | Full initial schema — run once | Done |
| `migrations/002_client_branding.sql` | Add `color`, `logo_url` to `clients` | Run in SQL Editor |
| `migrations/003_fix_rls_recursion.sql` | Drop circular subcontractor policies | Run in SQL Editor |
| `migrations/004_task_detail.sql` | Any task detail columns needed | Pending |
| `migrations/005_portal_rls.sql` | RLS policy: public read by `share_token` | Pending |
| `migrations/006_studio_name.sql` | Add `studio_name` to `profiles` | Pending |

---

## Blockers & Notes

| Date | Blocker | Status |
|---|---|---|
| 2026-05-15 | RLS infinite recursion on `task_assignments` ↔ `clients` | Fixed via migration 003 |
