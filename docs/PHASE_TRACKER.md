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
- [ ] Tasks tab — full CRUD with drag-drop reorder
- [ ] Brain Dump tab — add/edit/delete note cards
- [ ] Tab persistence (remember last tab per client)
- [ ] Client header with logo, status selector

### Task Detail (Level 3)
- [ ] Task title, description, due date, status
- [ ] File attachments (Supabase Storage `task-files` bucket)
- [ ] Activity log (created, updated, commented)

### Client Portal
- [ ] Public route `/portal/:token`
- [ ] Token generation + copy-link button
- [ ] Read-only task list with status

### Hooks refactor
- [x] `useClients` — fetch, create, archive, update
- [ ] `useTasks` — fetch by client, CRUD, reorder
- [ ] `useBrainDump` — fetch by client, CRUD

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
