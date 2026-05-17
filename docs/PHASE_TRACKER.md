# Phase Tracker — Studio OS

> Update this file after every session. Mark tasks `[x]` when complete. Add blockers inline.

**Current phase**: Phase 3 — Intelligence Layer (3D + 3G complete → 3E next)
**Last updated**: 2026-05-16

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

### 2G+ — Design Elevation (pre-Phase 3 polish) `[COMPLETE]`

> Raised the visual and interaction quality from ~7.5 to ~9/10 before handing off to Phase 3. All items documented in `docs/DESIGN_TOKENS.md` → Design Elevation Record.

- [x] **Lenis smooth scroll** — global window scroll via `lenis` npm, initialized in `App.jsx`
- [x] **DM Serif Display** — display typeface added to `index.html`; `--font-display` CSS var; applied to Dashboard greeting + ClientHeader h1
- [x] **Time-aware dashboard greeting** — "Good morning/afternoon/evening, [FirstName]" using `supabase.auth.getUser()` → `user_metadata.full_name`
- [x] **Dashboard insight line** — single-sentence studio state summary (overdue > needs attention > all clear) below greeting
- [x] **Portal onboarding nudge** — dismissible inline banner; copies first client portal URL; state persisted in `localStorage`
- [x] **Toast notification system** — `ToastProvider` + `useToast()` hook in `src/components/shared/Toast.jsx`; used for clipboard copy confirmations
- [x] **CSS-only tooltip system** — `.tooltip` class + `data-tip` attribute; applied to all icon-only buttons (drag handle, delete, priority, status, collapse, color dot)
- [x] **Sticky task group headers** — `.task-group-header` in `index.css`; `position: sticky`, `backdrop-filter: blur(12px)`, full-bleed via negative margins
- [x] **Scroll-active group indicator** — `IntersectionObserver` in `TaskGroup.jsx`; color dot pulses + scales when group is in active viewport band
- [x] **Animated task done strikethrough** — `@keyframes strike-through` on `.task-title-done::after` pseudo-element; left-to-right animated line on task completion
- [x] **Checkbox satisfaction animation** — `@keyframes checkbox-pop` scale pulse on done toggle; detected via `prevDone` ref in `TaskRow.jsx`
- [x] **Animated progress bars** — `requestAnimationFrame` from 0 to actual pct on mount in `ClientRow.jsx`
- [x] **View Transitions API** — shared-element morph (client avatar card → header); `document.startViewTransition` + `flushSync` in `ClientRow.jsx`; `viewTransitionName` per client ID
- [x] **Browser theme-color** — `<meta name="theme-color">` set dynamically to `client.color` in `ClientBoard.jsx`; resets on unmount
- [x] **Keyboard shortcut `N`** — opens Add Client modal (Dashboard) or new group form (ClientBoard) when not focused on input
- [x] **`⌘K` command palette** — `CommandPalette.jsx` shell; global listener in `App.jsx`; navigates to `/` and `/settings`; Phase 3 placeholders for AI tools + calendar
- [x] **Staggered reveal animations** — task groups animate in with `animate-fade-up animate-delay-{1-4}` on ClientBoard load
- [x] **Counting animation in StatsBar** — `useCountUp` hook with cubic ease-out; all four stat tiles count from 0 on load
- [x] **Client color accent on ClientRow** — `borderLeftColor: accentColor, borderLeftWidth: '3px'` for visual identity per client

---

### 2H — Brain Dump Enhancement `[COMPLETE]`

> Upgraded brain dump from simple sticky notes to a rich Miro-like capture surface.

- [x] **Tiptap rich text editor** — per-card editing with bold, italic, bullet list toolbar; lazy mount (Tiptap only activates on card click; view mode uses `dangerouslySetInnerHTML`)
- [x] **Image card type** — `type` column distinguishes `sticky` vs `image`; image cards render `<img>` with error state
- [x] **Local file upload** — "Image" button → file picker → uploads to Supabase `brain-dump-images` bucket → stores `publicUrl` as card content
- [x] **Clipboard paste (⌘V)** — global `document.paste` listener; detects image MIME type; skips intercept when focus is in contentEditable/input/textarea; shows uploading skeleton during async upload
- [x] **Error toasts on upload failure** — `useToast` on `BrainDumpCanvas`; message includes bucket setup instructions
- [x] **Responsive card grid** — `repeat(auto-fill, minmax(240px, 1fr))` CSS grid; 1–4 columns depending on viewport
- [x] **Action bar** — "Text note" + "Image" buttons + "⌘V to paste a screenshot" hint
- [x] **Uploading skeleton** — animated placeholder card while image uploads
- [x] **Color picker per card** — 5-color swatch (amber/green/blue/pink/purple) with distinct dark background per theme
- [x] **Tiptap CSS** — placeholder, list, strong, em styles appended to `src/styles/index.css`
- [x] `useBrainDump` updated — `createCard` accepts `type` param; `createImageCard` handles storage upload + card insert; both returned from hook

**Manual Supabase step required**: Create `brain-dump-images` bucket in Supabase Storage and set it to **Public**.

---

### 2I — UX Fixes `[COMPLETE]`

- [x] **Task strikethrough rendering** — `task-title-done::after` was clipped by `overflow: hidden` on the same element. Fix: moved `task-title-done` class to a wrapper `<div>` (no overflow); inner `<span>` keeps `truncate` for text overflow. Now renders correctly.
- [x] **Assignee column header** — `COL_HEADERS` in `TaskGroup.jsx` had empty string for assignee column; changed to `'Assign'`
- [x] **Assignee avatar always visible** — unassigned avatar was `opacity-0 group-hover:opacity-60` (invisible at rest). Changed to always-visible at 22% opacity, hover brightens to 70% via inline `onMouseEnter/Leave`

---

### 2J — Clone Client Structure `[COMPLETE]`

> Deliberate alternative to a template admin system. See Architecture Decision below.

- [x] **`cloneClientStructure(sourceClientId, targetClientId)`** in `useClients.js` — fetches source task groups + tasks; inserts new groups for target client; batch-inserts tasks with `status: 'todo'`, `due_date: null`, `assigned_to: null`
- [x] **"Copy task structure from" dropdown** in `AddClientModal` — only shown when `clients.length > 0`; "— Start fresh —" default; lists all existing clients with `name — project_name`; hint text when a source is selected
- [x] **`handleAddClient` in `Dashboard.jsx`** — wraps `createClient` + `cloneClientStructure`; shows error toast if clone step fails but client was created; passes `clients` prop and `handleAddClient` to `AddClientModal`

---

### Architecture Decision Log

**No template admin system / No project-type presets** (decided 2026-05-16)

Templates were considered for pre-populating task groups for recurring client types (e.g., brand refresh, website build). Rejected because:
1. Templates go stale — the moment they're saved they start drifting from how work actually runs
2. Templates require admin UI to build and maintain (another surface to design, build, and explain)
3. Phase 3 makes templates obsolete — AI will generate a project plan from a brief in Phase 3 (see 3I below), which is both smarter and more customized than any static template

**Current approach**: Clone task structure from an existing client (2J). Good enough for Phase 2 without the maintenance burden.

**Phase 3 approach**: AI-generated project plan from brief (3I). Brief → Claude → structured groups + tasks. Smarter, adapts to each engagement.

---

### Hooks — all done ✓

- [x] `useClients` — fetch all (enriched with task stats), create, archive, update, pause, cloneClientStructure
- [x] `useClient` — single client by ID
- [x] `useTasks` — task groups + tasks by client, CRUD, drag-drop reorder
- [x] `useBrainDump` — brain dump cards by client, CRUD (sticky + image types)
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

### 3D — AI Brief Generator `[COMPLETE]`

- [x] Edge Function: `generate-brief` — reads brain dump text cards, strips HTML, calls Claude API (`claude-sonnet-4-6`), returns structured JSON brief with 5 sections
- [x] `BriefModal.jsx` — loading spinner, error state, 5 formatted sections, copy-to-clipboard (plain text format)
- [x] "Generate client brief" button in brain dump tab — only shown when text cards exist; opens modal; calls edge function via `supabase.functions.invoke`
- [x] Brief sections: Project overview, Design direction, Key decisions, Open questions, Next steps

**Deploy step required**: `supabase functions deploy generate-brief` — needs `ANTHROPIC_API_KEY` set in Supabase dashboard → Settings → Edge Functions secrets.

**Deferred to later**:
- Auto-tag brain dump entries (theme chips: brand, copy, visual, strategy)
- Extract action items from notes → calendar items

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

### 3G — Figma Link Field `[COMPLETE]`

- [x] Add `figma_url text` column to `tasks` table (`migrations/009_figma_url.sql`)
- [x] Figma link field in TaskDetail sidebar — paste URL → saves on blur → shows "Open in Figma ↗" link with edit + clear
- [x] No file storage — URL-only, opens natively in Figma

---

### 3H — Digest + Notifications

- [ ] Notification preferences wired — connect Settings digest time to automated run schedule
- [ ] Email delivery for weekly digest (Supabase edge function or Resend)

---

### 3I — AI-Generated Project Plan from Brief

> Replaces templates and presets entirely. Smarter and always fresh.

- [ ] "Generate project plan" button in AddClientModal (or ClientBoard empty state)
- [ ] Studio owner writes a plain-English brief: "Brand identity for a wellness startup, 3-month engagement, deliverables: logo, guidelines, website"
- [ ] Edge Function calls Claude with the brief → returns structured task groups + task names
- [ ] Groups + tasks inserted into the new client automatically (same structure as `cloneClientStructure`)
- [ ] Studio owner reviews and adjusts before proceeding
- [ ] Claude Managed Agent memory: plan becomes the initial context for the client's agent in 3A

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
| `migrations/007_task_assignee.sql` | Add `assigned_to text` to `tasks` | **Run in SQL Editor** |
| `migrations/008_storage_policies.sql` | RLS policies for client-logos + brain-dump-images buckets | Run in SQL Editor |
| `migrations/009_figma_url.sql` | Add `figma_url text` to `tasks` | **Run in SQL Editor** |

---

## Blockers & Notes

| Date | Blocker | Status |
|---|---|---|
| 2026-05-15 | RLS infinite recursion on `task_assignments` ↔ `clients` | Fixed via migration 003 |
