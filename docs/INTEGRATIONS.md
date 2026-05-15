# Integrations — Studio OS

> Technical contracts for every external system Studio OS connects to. Read before building any integration code. For the *what* and *why*, see PRD.md. This file covers the *how*.

---

## Google Calendar

**Phase**: 3
**Method**: MCP server on Claude Managed Agent infrastructure
**Direction**: Read + Write
**Auth**: OAuth 2.1 via Google Workspace MCP server

### What it does

| Operation | When | Direction |
|---|---|---|
| Read calendar events | Daily 7am digest, Level 1 WeekCalendar load | Read |
| Create calendar event | Task due date set or changed | Write |
| Create calendar reminder | Task deadline within 3 days | Write |
| Update calendar event | Task due date changed after push | Write |
| Delete calendar event | Task deleted after calendar push | Write |

### OAuth scopes required

```
https://www.googleapis.com/auth/calendar.events
https://www.googleapis.com/auth/calendar.readonly
```

Do not request `calendar` (full access) — events-scoped is sufficient and reduces OAuth consent friction.

### Event creation spec

When a task's `due_date` is set and pushed to calendar:

```json
{
  "summary": "[Client name] — [Task title]",
  "description": "Studio OS task. Project: [project_name]\nPriority: [priority]\nView task: https://studio-os.pages.dev/client/[client_id]/task/[task_id]",
  "start": { "date": "YYYY-MM-DD" },
  "end": { "date": "YYYY-MM-DD" },
  "colorId": "10"
}
```

`colorId: 10` is Basil (dark green) in Google Calendar — matches the Studio OS brand green.

After creation, store the returned `event.id` in `tasks.calendar_event_id`.

### WeekCalendar display

Level 1 reads events for the current Mon–Fri. Event rendering:

```
{
  title: event.summary (truncated to 28 chars),
  time: start.dateTime formatted as "10am" or "2:30pm",
  color: mapped from event.colorId (see color map below)
}
```

Color map for display (Google Calendar colorId → Studio OS token):
- `10` (Basil) → green: `#0F2E22` bg, `#9FE1CB` text
- `11` (Tomato) → red: `#1C0808` bg, `#F09595` text
- `5` (Banana) → amber: `#1C130A` bg, `#FAC775` text
- all others → neutral: `#252523` bg, `#9C9A92` text

### Error handling

If a calendar write fails (network, scope error, quota), fail silently in the UI — the task still saves. Log the error to Supabase Edge Function logs. Do not block the task save on calendar sync.

---

## Buffer

**Phase**: 3
**Method**: Buffer API v1
**Direction**: Read + Write (draft only — no auto-publish)
**Auth**: OAuth 2.0 — studio owner connects their Buffer account once in Settings

### What it does

| Operation | When | Direction |
|---|---|---|
| List queued posts | Client Board loads | Read |
| Create draft post | "Draft post" via Claude panel | Write (to queue, not published) |

### API endpoints used

```
GET  /profiles — get the studio owner's connected social profiles
GET  /profiles/{id}/updates/pending — get queued posts for a profile
POST /updates/create — add a new draft to the queue
```

Base URL: `https://api.bufferapp.com/1`

### Filtering posts per client

Buffer doesn't have a native project/client concept. Posts are matched to a client using the `clients.buffer_tag` field — a text label that Leah adds to Buffer posts to associate them with a client (e.g. "harvest-co").

Matching logic: when displaying posts on a client board, filter `pending` posts where the post `text` contains the `buffer_tag` value. This is a loose text match — it works because Leah controls both the tag and the post copy.

### Post queue display

On the Client Board header: show the count of queued posts as a badge ("4 posts queued"). Clicking opens a small panel showing each queued post as a row: truncated post text, platform icon, scheduled time.

### Draft creation spec

When the Claude panel drafts a social post and the user clicks "Send to Buffer":

```json
{
  "text": "[Claude-generated post copy]",
  "profile_ids": ["[profile_id_for_platform]"],
  "shorten": false,
  "now": false
}
```

This adds to the queue as a draft — it does not publish immediately. The studio owner reviews and schedules in Buffer's own interface.

**Security note**: Auto-publish is explicitly disabled. `"now": false` is always set. This prevents accidental publishing (see ADR-007 for the rationale on why accidental publishing is a primary risk to avoid).

---

## Figma

**Phase**: 3 (migration only — one column add)
**Method**: URL field only — no API
**Auth**: None

### What it does

A `figma_url text` column on the `tasks` table stores a Figma file or frame URL. In Task Detail, this renders as an "Open in Figma ↗" link that opens the URL in a new tab.

### Migration

```sql
-- supabase/migrations/007_figma_url.sql
alter table public.tasks add column figma_url text;
```

### URL validation

A valid Figma URL starts with `https://www.figma.com/`. Validate this on input — reject anything else. Store as-is; don't attempt to parse frame IDs.

### Display

In Task Detail right sidebar, below the files card:

```
[Figma icon] Figma file
[figma_url truncated] Open in Figma ↗
```

If `figma_url` is null, show a small "Add Figma link" input instead.

---

## Claude Managed Agents

**Phase**: 3
**Method**: Anthropic Managed Agents API (2026)
**Direction**: Bidirectional — agents read Supabase, write Supabase + Calendar
**Auth**: Anthropic API key (stored in Supabase Edge Function secrets)

### Agent provisioning

One agent is created per client at the time the first AI feature is used for that client. Store the agent ID in a new column: `clients.agent_id text`.

### Memory feeding

On these events, append a row to `client_context` and re-sync the agent's memory:

| Event | `entry_type` | `source` | Example `body` |
|---|---|---|---|
| Task marked done | `'decision'` | `'task_complete'` | "Completed: Brand audit (Apr 21)" |
| Note added in Task Detail | `'note'` | `'task_notes'` | "Client mentioned preference for serif type in body copy" |
| Brain dump card created | `'preference'` | `'brain_dump'` | (raw card content if ≤ 120 chars, otherwise skip) |
| Brief generated | `'summary'` | `'brief_generated'` | (first 200 chars of the generated brief) |

### Webhook triggers

Register these Supabase webhooks to fire into the agent:

| Table event | Condition | Agent action |
|---|---|---|
| `tasks.status` updated to `'done'` | — | Run next-action suggestion prompt |
| `tasks.due_date` set or changed | `calendar_event_id` is null | Create calendar event |
| `tasks.due_date` within 3 days | `status != 'done'` | Create calendar reminder + flag card |

### MCP connections on the agent

The Managed Agent is configured with these MCP servers:

```
google-calendar-mcp: https://calendarmcp.googleapis.com/mcp/v1
```

No Gmail MCP — see ADR-005.

---

## Supabase Storage

**Not a third-party integration** — Supabase Storage is part of the core infrastructure. Documented here for completeness.

### Buckets

| Bucket | Privacy | Allowed MIME types |
|---|---|---|
| `task-files` | Private | `image/*, application/pdf, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.openxmlformats-officedocument.presentationml.presentation` |
| `brain-dump-images` | Private | `image/*` |
| `client-logos` | Private | `image/*` |

### Storage paths

| Bucket | Path pattern | Example |
|---|---|---|
| `task-files` | `tasks/{task_id}/{filename}` | `tasks/abc-123/brief-v2.pdf` |
| `brain-dump-images` | `clients/{client_id}/{filename}` | `clients/xyz-456/moodboard-ref.jpg` |
| `client-logos` | `logos/{client_id}/{filename}` | `logos/def-789/harvest-logo.png` |

### Signed URLs

All private bucket files are accessed via signed URLs generated at read time. URLs expire after 1 hour. Never store or cache signed URLs in the database — generate fresh on each render.

```js
const { data } = await supabase.storage
  .from('task-files')
  .createSignedUrl(storage_path, 3600)
```
