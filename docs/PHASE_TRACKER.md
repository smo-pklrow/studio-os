# Phase Tracker — Studio OS

> Update this file after every session. Mark tasks `[x]` when complete. Add blockers inline.

**Current phase**: Phase 2 — Core UX Completion
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

### Dashboard (Level 1)
- [x] Add client modal (name, project name, color picker, logo upload)
- [x] Archive client flow
- [x] Client color — per-client brand color picker (stored in `clients.color`)
- [x] Client logo — upload via Supabase Storage `client-logos` bucket (stored in `clients.logo_url`)
- [x] Schema migration — `supabase/migrations/002_client_branding.sql` (run in SQL Editor)
- [x] Header — date, active client count, New client button
- [x] Week calendar strip — Mon–Fri, today highlighted, event slots (no data yet)
- [x] Morning digest panel — UI shell (wired up in Phase 3 with Claude Edge Function)
- [x] Stats bar — Active clients · Open tasks · Overdue · Done this week (live from DB)
- [x] Client list rows — logo/avatar, progress bar (health-colored), task status counts (done / in progress / to do / overdue / blocked), health badge, last-updated timestamp
- [x] `useClients` enriched — embeds task_groups + tasks per client, computes per-client and global stats
- [ ] Week calendar events — requires Google Calendar sync (Phase 4) or custom event model
- [ ] Empty state polish — illustration / onboarding copy

### Client Board (Level 2)
- [x] `useClient` hook — fetch single client by ID
- [x] `useTasks` hook — fetch task_groups + tasks by client_id, create/update/delete tasks + groups, drag-drop reorder (sort_order)
- [x] `useBrainDump` hook — fetch brain_dump_cards by client_id, create/update/delete
- [x] Breadcrumb nav — All clients › Client name
- [x] Client header — logo/avatar, name + project_name, health badge + % complete, start_date + due_date, "Client link" button (copies portal URL)
- [x] Tasks tab — active state underline
- [x] Brain dump tab — active state underline
- [x] Tab persistence — localStorage keyed by client ID
- [x] Task group row — colored dot, group name, task count + done count, collapse/expand
- [x] Task row — checkbox (toggles done/todo), title (strikethrough when done), status dropdown (todo / in_progress / done / blocked), due date (amber if overdue or today), priority badge, drag handle, delete on hover
- [x] Inline "Add task" — per group, Enter to save, Escape to cancel
- [x] "New group" — inline input at bottom of task list, auto-assigned color from palette
- [x] Drag-drop reorder — tasks within a group via @dnd-kit (PointerSensor + distance:8 activation)
- [x] Brain dump canvas — responsive grid of sticky cards, "Add card" slot
- [x] Brain dump card — colored sticky (amber/green/blue/pink/purple), click to edit, delete on hover

### Task Detail (Level 3)
- [ ] Task title, description, due date, status
- [ ] File attachments (Supabase Storage `task-files` bucket)
- [ ] Activity log (created, updated, commented)

### Client Portal
- [ ] Public route `/portal/:token`
- [ ] Token generation + copy-link button
- [ ] Read-only task list with status

### Hooks refactor
- [x] `useClients` — fetch all (enriched with task stats), create, archive, update
- [x] `useClient` — single client by ID (for ClientBoard header)
- [x] `useTasks` — task groups + tasks by client, CRUD, drag-drop reorder
- [x] `useBrainDump` — brain dump cards by client, CRUD

---

## Phase 3 — Intelligence Layer `[NOT STARTED]`

- [ ] Supabase Edge Function: `/weekly-digest`
- [ ] Supabase Edge Function: `/generate-brief`
- [ ] Supabase Edge Function: `/auto-tag`
- [ ] Weekly digest UI (DigestStrip component)
- [ ] Brief preview modal
- [ ] AI tag display on brain dump cards

---

## Phase 4 — Studio Layer `[NOT STARTED]`

- [ ] Time tracking (log hours per task)
- [ ] Invoice PDF generator
- [ ] Proposal template builder
- [ ] Google Calendar sync

---

## Blockers & Notes

_Add blockers here as they arise, with date and resolution._

| Date | Blocker | Status |
|---|---|---|
| — | — | — |
