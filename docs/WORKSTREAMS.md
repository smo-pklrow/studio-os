# Workstreams — Studio OS

> Independent tracks that can be built in parallel. Each stream has a clear boundary so agents and sessions don't step on each other.

---

## Stream A — Data Layer (Supabase)

**Scope**: Schema, RLS, hooks, Edge Functions
**Files**: `supabase/`, `src/lib/`, `src/hooks/`
**Dependencies**: None — this unblocks everything else

### Current tasks
- [ ] Audit `schema.sql` — confirm clients, tasks, brain_dump, portals tables exist with correct columns
- [ ] Write `useClients` hook — wraps all client CRUD
- [ ] Write `useTasks` hook — wraps task CRUD + reorder (updates `position` column)
- [ ] Write `useBrainDump` hook — wraps brain dump CRUD
- [ ] Write `usePortal` hook — token generation + public fetch

### Rules
- Every Supabase query in a hook, never inline in JSX
- RLS must be enforced for every table — test with anon key
- Edge Functions: TypeScript, deployed via `supabase functions deploy`

---

## Stream B — Component Library (Shared UI)

**Scope**: Reusable primitives in `src/components/shared/`
**Files**: `src/components/shared/`
**Dependencies**: None

### Current tasks
- [ ] `Button` — primary, secondary, ghost, danger variants
- [ ] `Badge` — status colors (active, paused, done, archived)
- [ ] `Avatar` — initials fallback + image
- [ ] `Modal` — accessible overlay with focus trap
- [ ] `ProgressBar` — task completion ratio
- [ ] `EmptyState` — illustration + CTA for zero-data views

### Rules
- Tailwind only, no inline styles
- Each component accepts a `className` prop for overrides
- No external UI library; keep bundle lean

---

## Stream C — Dashboard + Client Board

**Scope**: The two core views the studio owner uses daily
**Files**: `src/pages/Dashboard.jsx`, `src/pages/ClientBoard.jsx`, `src/components/clients/`, `src/components/tasks/`
**Dependencies**: Stream A (hooks), Stream B (primitives)

### Current tasks
- [ ] `ClientCard` — name, logo, status badge, last activity, click → ClientBoard
- [ ] `ClientList` — grid of ClientCards + add-client CTA
- [ ] Add Client modal — name, color picker, logo upload to Supabase Storage
- [ ] `ClientBoard` — tabbed layout (Tasks | Brain Dump) with client header
- [ ] `TaskGroup` — grouped by status column
- [ ] `TaskRow` — drag handle, title, due date, status chip, click → TaskDetail
- [ ] Drag-drop reorder wired to `useTasks`

---

## Stream D — Brain Dump + AI

**Scope**: Free-form note canvas + Claude-powered features
**Files**: `src/components/braindump/`, `supabase/functions/`
**Dependencies**: Stream A (hooks)

### Current tasks
- [ ] `BrainDumpCard` — editable card, tag chips, created date
- [ ] `BrainDumpCanvas` — masonry/grid layout of cards
- [ ] Add/edit card inline (contenteditable or textarea)
- [ ] Edge Function: `generate-brief` — takes brain dump entries, returns structured brief
- [ ] Edge Function: `auto-tag` — tags entries by theme
- [ ] Brief preview modal (Stream C dependency)

---

## Stream E — Client Portal

**Scope**: Public read-only view for clients
**Files**: `src/pages/ClientPortal.jsx`
**Dependencies**: Stream A (usePortal hook)

### Current tasks
- [ ] Token generation in ClientBoard header
- [ ] Copy-link button with clipboard API
- [ ] `/portal/:token` route — public, no auth required
- [ ] Read-only task list with status and completion bar
- [ ] "Powered by Studio OS" footer (subtle)

---

## Stream F — Polish + QA

**Scope**: Responsiveness, edge cases, perf, accessibility
**Dependencies**: All other streams
**When to start**: After Phase 2 features are feature-complete

### Checklist
- [ ] Mobile layout (375px breakpoint)
- [ ] Loading skeletons for all async views
- [ ] Error boundaries around each page
- [ ] Empty states for every zero-data condition
- [ ] Keyboard navigation for drag-drop
- [ ] Lighthouse score > 90 on all pages
