# UX Flows — Studio OS

> User journeys for every persona and screen transition. Read this before building any navigation, modal, or redirect logic. The PRD covers what exists; this file covers how people move through it.

---

## Personas

| Persona | Auth | Entry point | What they can do |
|---|---|---|---|
| Studio Owner (Leah) | Google OAuth | `/` | Everything — full CRUD on all data |
| Subcontractor | Google OAuth | `/` | See only tasks assigned to them (Phase 4) |
| Client | None (share token) | `/portal/:token` | Read-only view of their project |

---

## Flow 1 — First-time login

```
User visits studio-os.pages.dev
  → /login
  → Clicks "Sign in with Google"
  → Google OAuth consent screen
  → Supabase creates auth.users row + fires trigger → profiles row auto-created
  → Redirect to /
  → Dashboard loads with empty state ("No clients yet")
  → Prominent "Add your first client" CTA
```

**Edge cases**:
- OAuth failure → return to `/login` with error message
- Profile trigger fails → user lands on dashboard but name is blank; settings can fix it

---

## Flow 2 — Daily use (Studio Owner)

```
Morning — opens app
  → Dashboard (Level 1)
  → DigestStrip shows Claude's morning summary (Phase 3)
  → WeekCalendar shows today highlighted, today's events
  → Scans client cards — health badges, progress bars
  → Notices Summit Financial is flagged red
  → Clicks Summit Financial card

  → Client Board (Level 2)
  → Tasks tab is default
  → Scans task groups ("Website", "Orientation Campaign", etc.)
  → Sees "Social asset pack" is overdue
  → Clicks task row

  → Task Detail (Level 3)
  → Reads description + notes
  → Checks off two subtasks
  → Adds a note
  → Clicks "Extract action items" → Claude reads notes → Calendar items suggested (Phase 3)
  → Clicks back breadcrumb → returns to Level 2
```

---

## Flow 3 — Adding a new client

```
Dashboard → "+ New client" button (top right)
  → AddClientModal opens (overlay, centered)
  → Fields: name, project name, color swatch, logo upload, health selector, start date, due date
  → "Save client" → inserts to DB → modal closes → new ClientCard appears at top of list
  → Click into client → empty ClientBoard
  → "+ New group" → group name input → creates first TaskGroup
  → "+ Add task" → inline task row appears → type title → Enter saves
```

**Edge cases**:
- Save with blank name → inline validation, no submit
- Logo upload fails → client saves without logo; no blocking error
- Duplicate client names → allowed (no uniqueness constraint on name)

---

## Flow 4 — Brain dump → brief (Phase 3)

```
Client Board → "Brain dump" tab
  → Freeform canvas with draggable sticky cards
  → Studio owner drops ideas: sticky notes, image refs, text blocks
  → Clicks "Suggest from notes ↗" (Claude button, top right of canvas)
  → Edge Function: /generate-brief fires
  → Claude reads all brain_dump_cards for this client + client_context
  → Brief preview modal opens — structured brief with sections
  → "Copy brief" or "Save to notes" options
  → Brief saved to client_context as entry_type: 'summary'
```

---

## Flow 5 — Sharing with a client (Client Portal)

```
Client Board (Level 2)
  → "Client link" button in header (top right)
  → Copies share URL to clipboard: /portal/{share_token}
  → Studio owner sends link to client via email/Slack (outside the app)

Client receives link → visits /portal/{share_token}
  → No login prompt
  → Sees: studio name header, their project name, progress bar
  → Task groups — read-only, collapsible
  → Task rows — title, status, due date; no edit controls
  → No internal notes, no files, no brain dump
  → "Powered by Studio OS" footer
```

**Edge cases**:
- Invalid token → "This link is no longer valid" message, no data exposed
- Token not found → same message (no distinction between expired vs wrong)

---

## Flow 6 — Subcontractor access (Phase 4)

```
Studio Owner → Settings → "Invite collaborator"
  → Email input → sends Supabase magic link invite
  → Subcontractor clicks link → creates account
  → Lands on filtered dashboard — only sees tasks assigned to them
  → No client-level view
  → Can update task status, add notes, upload files to assigned tasks
  → Cannot see client health, billing info, brain dump, or other clients
```

---

## Flow 7 — Task detail navigation

```
Entering Level 3:
  Client Board → click task title text (not the checkbox)
  → /client/:clientId/task/:taskId
  → Breadcrumb: All clients › [Client name] › [Group name] › [Task title]

Returning from Level 3:
  → Click "All clients" in breadcrumb → /
  → Click client name in breadcrumb → /client/:clientId
  → Click group name in breadcrumb → /client/:clientId (scrolled to group)
  → Browser back button → works via React Router history
```

**Rule**: breadcrumb always reflects the actual route. No "fake" back buttons.

---

## Flow 8 — Sign out

```
Any page → top-right user avatar
  → Dropdown opens: display name, email, Settings, Sign out
  → Click "Sign out"
  → supabase.auth.signOut()
  → Clear tab-persistence localStorage keys
  → Redirect to /login
  → Login page, no session
```

**Edge cases**:
- Network failure during sign out → still redirect to login; session will expire naturally
- Sign out on portal page → no-op (portal has no auth state)

---

## Flow 9 — Mobile (responsive)

Studio OS is responsive but desktop-first. At 375px breakpoint:

```
Dashboard:
  → Stats bar collapses to 2×2 grid
  → WeekCalendar collapses to today-only strip
  → Client cards stack full-width

Client Board:
  → Tab bar stays at top
  → Task columns collapse: status + assignee hidden; title + due date only
  → Brain dump canvas scrolls horizontally

Task Detail:
  → Two-column layout stacks vertically
  → Right sidebar cards appear below left column
```

Mobile is fully usable but not the primary design target. No mobile-specific features.

---

## Modal / overlay behavior

All modals follow these rules:
- Open: fade in, slight translate-up (200ms)
- Close: click backdrop, press Escape, or explicit close button
- While open: scroll on background is locked
- Focus: first input receives focus on open
- Validation: inline, on blur or on submit attempt — never on keystroke

Modals used in the app:
| Modal | Trigger | Size |
|---|---|---|
| AddClientModal | "+ New client" | Medium (500px) |
| EditClientModal | Three-dot > Edit | Medium (500px) |
| DeleteGroupConfirm | Group delete option | Small (confirm only) |
| DeleteAccountConfirm | Settings danger zone | Small (type to confirm) |
| BriefPreviewModal | Brain dump "Generate brief" | Large (700px) |

---

## URL structure and deep linking

All app URLs are deep-linkable. Sharing a task URL directly works — auth guard redirects to login then back to the original URL after sign-in.

```
/                         Dashboard
/client/:id               Client Board (Tasks tab)
/client/:id?tab=braindump Client Board (Brain dump tab)
/client/:id/task/:id      Task Detail
/portal/:token            Client Portal (public)
/settings                 Settings
/login                    Login
```

The `?tab=` param on Client Board persists the active tab — used for direct links and browser back navigation.

---

## Error states

| Condition | What the user sees |
|---|---|
| Not authenticated, visits protected route | Redirect to `/login`; after login, redirect back to original URL |
| Valid auth, but RLS blocks the query | Empty state (same as no data) — never expose the error message |
| Supabase offline | Inline "Something went wrong" with retry button |
| File upload too large | Inline error below the file input |
| Portal token invalid | Full-page message: "This link is no longer valid" |
| 404 / unknown route | Friendly 404 page with "Back to studio" button |
