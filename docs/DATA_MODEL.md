# Data Model — Studio OS

> The schema in plain English. For the actual SQL, see `supabase/schema.sql`. This file explains *intent* — what each table represents, what creates and deletes rows, and what the RLS is protecting. Read this before writing any Supabase query.

---

## Overview

All data belongs to one studio owner. There is no multi-tenancy — every table traces back to a single `auth.uid()` via the `profiles` table or a join through `clients`.

```
auth.users (Supabase managed)
  └── profiles (1:1 — the studio owner's identity)
        └── clients (1:many — the clients they manage)
              ├── task_groups (1:many — groups within a client project)
              │     └── tasks (1:many — individual tasks in a group)
              │           ├── task_assignments (many:many — who's assigned)
              │           ├── subtasks (1:many — checklist items)
              │           ├── notes (1:many — timestamped freetext)
              │           ├── files (1:many — uploaded to Supabase Storage)
              │           └── inspo_items (1:many — images, links, sticky notes)
              ├── brain_dump_cards (1:many — freeform canvas per client)
              └── client_context (1:many — AI memory entries per client)
```

---

## Table reference

---

### `profiles`

**What it is**: The studio owner's profile. One row per authenticated user. Created automatically by a trigger when a user signs up via Google OAuth.

**What creates a row**: `handle_new_user()` trigger fires on `auth.users` insert.

**What deletes a row**: Deleting the `auth.users` row (cascade). Only triggered by "Delete account" in settings.

**Key fields**:
- `id` — matches `auth.users.id` exactly (not generated)
- `full_name` — pulled from Google OAuth `raw_user_meta_data`
- `avatar_url` — Google profile photo URL
- `role` — `'owner'` or `'subcontractor'`. Currently all users are `'owner'`. Subcontractor support is Phase 4.
- `studio_name` — added in migration 006; shown in portal header and nav bar

**RLS**: User can only read and update their own row (`auth.uid() = id`).

---

### `clients`

**What it is**: A client the studio owner is working with. Each client can have multiple projects running over time, but the current model assumes one active project per client at a time (`project_name` field).

**What creates a row**: Studio owner submits AddClientModal.

**What deletes a row**: "Archive" sets `status: 'archived'`. Hard delete not exposed in UI — only in danger zone of a future admin screen.

**Key fields**:
- `owner_id` — FK to `profiles.id`. Every query filters by this.
- `name` — client company or person name (e.g. "Harvest & Co")
- `project_name` — current active project (e.g. "Brand Identity Refresh")
- `status` — `'active'` | `'paused'` | `'archived'`. Archived clients are hidden from the dashboard by default.
- `health` — `'on_track'` | `'needs_attention'` | `'blocked'` | `'nearly_done'`. Set manually by studio owner; eventually auto-calculated in Phase 3.
- `color` — hex color string for the client's visual identity in the UI
- `logo_url` — Supabase Storage path in `client-logos` bucket
- `share_token` — UUID string; the public URL token for the client portal. Generated at creation, never changes.
- `start_date` / `due_date` — project-level dates (not task-level)
- `buffer_tag` — the Buffer label/tag used to filter this client's scheduled posts (Phase 3)

**RLS**:
- Owner: full access where `owner_id = auth.uid()`
- Subcontractor (Phase 4): read-only on clients where they have an assigned task
- Portal: read-only where `share_token` matches (no auth required) — migration 005

---

### `task_groups`

**What it is**: A named group of tasks within a client project. Equivalent to "Website", "Student Orientation Campaign", "Ongoing Support" in the Level 2 board. The Monday.com "board section" equivalent.

**What creates a row**: Studio owner clicks "+ New group" on the Client Board.

**What deletes a row**: Studio owner deletes the group (with confirmation). Cascades to all tasks in the group.

**Key fields**:
- `client_id` — FK to `clients.id`
- `name` — the group label shown on the board
- `color` — hex string; shown as the colored dot next to the group name
- `sort_order` — integer; determines display order on the board; updated by drag-drop

**RLS**: Owner access only; subcontractors cannot see groups directly (they see tasks).

---

### `tasks`

**What it is**: A single unit of work within a task group. The core data object of the app.

**What creates a row**: Studio owner clicks "+ Add task" within a group, or the inline add-task row at the bottom of a group.

**What deletes a row**: Three-dot menu > Delete on a TaskRow. No cascade recovery — permanent.

**Key fields**:
- `group_id` — FK to `task_groups.id`
- `title` — the task name; editable inline on the board
- `description` — longer freetext; only shown in Task Detail (Level 3)
- `status` — `'todo'` | `'in_progress'` | `'done'` | `'blocked'`
- `priority` — `'low'` | `'normal'` | `'high'`
- `due_date` — date only (no time); shown on task row and in Level 3 sidebar
- `calendar_event_id` — Google Calendar event ID; populated when the task is pushed to calendar in Phase 3. Null until then.
- `sort_order` — drag-drop reorder within a group
- `figma_url` — Figma file URL (migration, Phase 3); shown as "Open in Figma ↗" in Task Detail sidebar

**RLS**:
- Owner: full access via join through task_groups → clients
- Subcontractor: read and update only on tasks where `task_assignments.user_id = auth.uid()`

---

### `task_assignments`

**What it is**: A junction table connecting a task to a user (owner or subcontractor). Used for "who's responsible for this task" display and for scoping subcontractor access.

**What creates a row**: Assigning a user to a task in the Task Detail sidebar.

**What deletes a row**: Removing a user assignment from a task.

**Key fields**:
- `task_id` / `user_id` — composite unique constraint; one assignment per user per task

**RLS**: Owner manages all assignments. This table is the security boundary for Phase 4 subcontractor access — get the policies right before enabling.

**Note**: The original schema had a circular RLS recursion between `clients` and `task_assignments`. Fixed in migration 003. See PHASE_TRACKER.md blockers.

---

### `subtasks`

**What it is**: A checklist item within a task. Simpler than tasks — no status enum, just `done: boolean`.

**What creates a row**: "+ Add subtask" in Task Detail left column.

**What deletes a row**: Delete icon on a subtask row. No cascade — subtasks don't own anything.

**Key fields**:
- `task_id` — FK to `tasks.id`
- `done` — boolean; toggled by clicking the checkbox
- `assignee_id` — optional FK to `profiles.id`; who's doing this specific step
- `sort_order` — drag-drop reorder within the subtask list

---

### `notes`

**What it is**: A timestamped freetext note attached to a task. Append-only in the UI — notes are never edited after creation, only deleted.

**What creates a row**: Studio owner types in the notes textarea and submits in Task Detail.

**What deletes a row**: Delete icon on a note row.

**Key fields**:
- `task_id` / `author_id` — FKs
- `body` — the note text; markdown not rendered (plain text only in v1)
- `created_at` — used as the timestamp shown in the UI

**Note**: Notes from the Task Detail notes section feed the Claude Managed Agent in Phase 3. The "Extract action items" button reads all notes for a task and returns calendar-ready items.

---

### `files`

**What it is**: Metadata for a file uploaded to Supabase Storage. The actual binary lives in the `task-files` bucket; this table stores the reference.

**What creates a row**: Studio owner uploads a file in the Task Detail files card.

**What deletes a row**: Delete icon in the files card. Deletes this row AND the object from Supabase Storage (two operations — handle both in the hook).

**Key fields**:
- `storage_path` — the full path in the `task-files` bucket (e.g. `tasks/{task_id}/{filename}`)
- `filename` — display name shown in the UI
- `size_bytes` — stored at upload; shown as "420 KB" in the UI
- `mime_type` — used to determine which icon to show per file type

---

### `inspo_items`

**What it is**: An inspiration reference attached to a task — an image, a URL, or a short text note. Displayed as a grid of tiles in the Task Detail right sidebar. Different from `notes` (which are for the studio owner's working notes) — inspo is visual reference material.

**What creates a row**: Drop a file, paste a URL, or click "+ Note" in the inspo board card.

**What deletes a row**: Delete icon on an inspo tile.

**Key fields**:
- `type` — `'image'` | `'link'` | `'note'`
- `content` — for image: Storage path; for link: URL; for note: text content
- `caption` — optional display label
- `sort_order` — drag-drop reorder within the tile grid

---

### `brain_dump_cards`

**What it is**: A freeform sticky card on the per-client brain dump canvas (Level 2 Brain dump tab). These are *project-level* (attached to a client), not task-level. They represent the creative thinking that informs the work — moodboard concepts, color ideas, directional notes.

**What creates a row**: "+ Sticky", "+ Image", or "+ Text" buttons on the brain dump canvas.

**What deletes a row**: Delete icon while a card is selected on the canvas.

**Key fields**:
- `client_id` — FK to `clients.id` (not task-level)
- `type` — `'sticky'` | `'image'` | `'text'`
- `content` — sticky: the text; image: Storage path in `brain-dump-images`; text: the text
- `color` — one of the five card color names: `'amber'`, `'teal'`, `'purple'`, `'red'`, `'gray'`
- `pos_x` / `pos_y` — absolute pixel position on the canvas; updated on drag-end
- `width` — card width in pixels; fixed per type in v1 (160px default)

**Phase 3 note**: All brain_dump_cards for a client are fed into the Claude Managed Agent as the creative memory context. The `/generate-brief` Edge Function reads these to produce a structured brief.

---

### `client_context`

**What it is**: The AI memory store for a client. Each row is one discrete piece of information that Claude should know about this client. Grows over time as the studio owner works on the account.

**What creates a row**:
- Manually: studio owner adds a note about the client (e.g. "Client prefers Kinfolk aesthetic")
- Automatically (Phase 3): agent appends an entry when a task is marked done, a brief is generated, or a key decision is made

**What deletes a row**: Only via admin tooling — these rows are intentionally durable. Deleting context degrades the AI's knowledge of the client.

**Key fields**:
- `client_id` — FK to `clients.id`
- `entry_type` — `'note'` | `'preference'` | `'decision'` | `'summary'`
  - `note` — general observation
  - `preference` — explicit client preference (aesthetics, communication style, etc.)
  - `decision` — something approved or rejected ("Client approved palette v2")
  - `summary` — a Claude-generated summary of a session or week
- `body` — the actual context text; should be concise and factual (1–3 sentences max)
- `source` — where the entry came from: `'manual'`, `'task_complete'`, `'brief_generated'`, `'meeting_notes'`

**Phase 3 note**: When the Claude Managed Agent runs, it reads ALL `client_context` rows for a client and assembles them into the system prompt. Keep `body` values concise — long entries dilute the context window.

---

## What the schema intentionally does NOT have

| Missing thing | Why |
|---|---|
| `tasks.client_id` | Tasks join to clients through `task_groups`. Never query tasks directly by client — always join through the group. |
| `comments` table | Async commenting is a team feature. Notes are append-only and owner-only. |
| `tags` table | Tags on tasks are Phase 3 (auto-generated by AI). No manual tag system in v1. |
| `invoices` / `time_entries` | Phase 4. Not in the current schema. |
| `notifications` table | Digest and alerts are email-based (Phase 3). No in-app notification inbox in v1. |
| `gmail_threads` table | Gmail threads in Task Detail are stored in `task_links` (migration 004). URL + label only — no Gmail API data. |
