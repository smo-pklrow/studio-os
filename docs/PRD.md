# Product Requirements Document — Studio OS

**Version**: 0.4 | **Last updated**: 2026-05-15 | **Owner**: Sean Owen

---

## Problem

Solo creative consultants (designers, strategists, brand consultants) juggle client work across scattered tools — notes in Notion, tasks in Linear, files in Google Drive, ideas in Notes. There's no single place that connects *who the client is*, *what's happening this week*, and *the creative thinking behind the work*.

Every tool they reach for was built for teams. The solo practitioner adapts and cobbles — and loses context, momentum, and the feeling of being in command.

---

## Target User

**The Solo Studio Owner**
- 3–12 active clients at any time
- Does the work themselves; no team
- Loses momentum when context-switching between clients
- Wants to feel "in command" of their studio, not buried in admin
- Currently uses: Notion (notes), Linear or Trello (tasks), Google Drive (files), Apple Notes (brain dump), Calendar (deadlines) — all disconnected

Secondary: **The Client** — receives a read-only portal link showing progress, no login required.

---

## Positioning

### Blue Ocean framing
Every other tool in this space (Notion, Linear, Asana, Monday) was built for teams and adapted for solo use. Studio OS is built for one person and one person only — the studio owner. It doesn't compete on features. It competes on *context*:

- It knows your clients (brain dump, history, brief)
- It knows your week (morning digest, deadline awareness)
- It thinks alongside you (AI as collaborator, not automation)

### Obviously Awesome positioning
**For**: Solo creative consultants who feel scattered across too many tools
**Who**: Want to feel in command of their practice, not buried in admin
**Studio OS is**: The operating system for a solo creative practice
**That**: Connects your client context, your tasks, and your thinking in one place — and surfaces what matters each morning
**Unlike**: Notion (no task structure), Linear (no client context, built for teams), Asana (overkill, team-first)
**Our difference**: An AI that knows your clients and thinks alongside you — not a generic assistant, a studio-aware collaborator

---

## Core Value Proposition

> Studio OS is the operating system for a solo creative practice — it knows your clients, tracks your work, and thinks alongside you.

The "aha moment" — when the user first sees Claude read their brain dump and hand back a structured client brief — is the product. Everything else is table stakes that earns the right to show them that moment.

---

## Integration Architecture

Studio OS connects to three external systems via **Claude Managed Agents** running on Anthropic infrastructure.

### Claude Managed Agents
One agent per client — instantiated at first use, persists across sessions. This is the intelligence backbone of Phase 3.

- Replaces custom schedulers (n8n, Make) — Anthropic infrastructure handles scheduling and webhooks
- **Persistent memory per client**: design notes, briefs, preferences, key decisions, approved directions
- Feeds: session notes, completed tasks, uploaded files, calendar events, Buffer post data, call summaries
- Outputs: briefs + strategy, next task ideas, calendar actions, proactive flags, content drafts, inspo suggestions
- Multi-agent capable for complex workflows

### Live Connections

| System | Integration method | Primary use |
|---|---|---|
| Google Calendar | MCP (read + write) | Events visible in Level 1 digest; due dates push to calendar; deadline reminders written automatically |
| Buffer | API | Queued posts visible per client; draft social content from app |
| Figma | URL linking (no API) | Figma file URLs linked per task; open natively in Figma — no file storage needed |

> **Note**: No Gmail API integration. Gmail threads in Task Detail are manually linked by the studio owner (paste URL + label). Calendar and Buffer are the two live external connections.

### Automated Runs

| Trigger | What happens |
|---|---|
| Mon 7am | Weekly priorities email drafted from all client data and sent to studio owner |
| Daily 7am | Morning digest: today's tasks + calendar events → Level 1 digest strip |
| Task → Done | Agent flags completion, suggests next action based on client memory |
| Deadline in 3 days | Task card flagged; calendar reminder written via Calendar MCP |

---

## Feature Set

### Phase 1 — Foundation `[COMPLETE]`

| Feature | Description | Status |
|---|---|---|
| Google OAuth | Single-user auth for studio owner | Done |
| Supabase schema | All tables, RLS policies, triggers | Done |
| Core UI tokens | Dark design system, typography, animations | Done |
| Cloudflare deploy | Auto-deploy on push to `main` | Done |

### Phase 2 — Core UX `[IN PROGRESS]`

| Feature | Description | Status |
|---|---|---|
| Dashboard (Level 1) | Client list with progress bars, stats bar, week calendar, morning digest shell | Done |
| Add/edit/archive client | Full client CRUD: name, project, color, logo, health, dates | Done |
| Client Board (Level 2) | Tasks tab + Brain dump tab, tab persistence | Done |
| Task management | Groups, tasks, status, priority, drag-drop reorder | Done |
| Task detail (Level 3) | Description, subtasks, notes, files, inspo board, Gmail thread links | Pending |
| Brain dump | Sticky note cards, click to edit, color variants | Done |
| Navigation & logout | App nav bar, user menu, sign out | Done |
| Settings & admin | Studio name, profile, preferences, danger zone | Pending |
| Client portal | Public read-only view via share token | Pending |
| Health selector | Click health badge to change client health inline | Done |
| Pause client | status: paused — amber visual treatment, not archived | Done |
| Search + filter | Filter dashboard by name + health | Done |

### Phase 3 — Intelligence Layer `[NOT STARTED]`

> The blue ocean. These features are what make Studio OS obviously different from every competitor. Built on Claude Managed Agents (one per client, persistent memory, Anthropic infrastructure).

| Feature | Description |
|---|---|
| Claude Managed Agent per client | One agent per client; persistent memory; Anthropic infra (replaces custom Edge Functions) |
| Morning digest (live) | Claude reads all tasks + brain dump + calendar events; surfaces what's due, stalled, and needs attention |
| Weekly priorities email | Mon 7am auto-run: all client data → structured priorities email sent to studio owner |
| Task-done proactive flag | When task marked done, agent suggests next action based on client memory |
| Deadline 3d warning | Auto-flag task; write calendar reminder via Google Calendar MCP |
| AI brief generator | Brain dump cards → structured shareable client brief in one click |
| Smart tagging | Auto-tag brain dump entries by theme: brand, copy, visual, strategy |
| Action item extraction | Claude reads task notes → surfaces calendar action items |
| Claude panel (Task Detail) | Proactive suggestions from client memory + current task context; action buttons (e.g. "Draft 3 directions") |
| Google Calendar MCP | Bidirectional: due dates push to calendar; events appear in Level 1 week strip; reminders auto-written |
| Buffer integration | Queued social posts visible per client board; draft post content from app |
| Figma link field | URL field per task — opens in Figma natively; no file storage needed |
| Digest scheduling | Configurable delivery time for morning digest |

### Phase 4 — Studio Layer `[NOT STARTED]`

| Feature | Description |
|---|---|
| Time tracking | Log hours per task; roll up per client per week |
| Invoice generator | PDF invoice from logged hours + client rate |
| Proposal builder | Turn AI brief into a project scope / proposal doc |
| Subcontractor access | Invite collaborators; scoped task-level access |

---

## Information Architecture

```
/ (Dashboard — Level 1)
  → All clients, week calendar, morning digest, stats

/client/:id (Client Board — Level 2)
  → Tasks tab: groups + sortable task rows
  → Brain dump tab: sticky cards + AI brief

/client/:clientId/task/:taskId (Task Detail — Level 3)
  Left: description, subtasks, notes, Claude panel
  Right sidebar: linked calendar, linked Gmail threads (manual), inspo board, files

/portal/:token (Client Portal — public, no auth)
  → Read-only task list + progress for the client

/settings
  → Profile, studio name, notifications, theme, danger zone
```

---

## Non-Goals (explicitly out of scope)

- Multi-user / team collaboration (the tool is for one person)
- Real-time client messaging / chat
- Native mobile app (responsive web only)
- Payment processing
- Light mode (dark-only for now; may revisit)
- Gmail API integration (threads are manually linked, not auto-pulled)

---

## Success Metrics

- Daily active use by studio owner (primary signal)
- Time from first login to first client with tasks < 2 minutes
- Brain dump → brief conversion rate (Phase 3 unlock)
- Client portal links shared per month (signal that clients are seeing value)
- Morning digest open rate (once delivered via email/notification)

---

## Design Principles

1. **Dark, calm, focused** — a focused work tool for a focused person; not a consumer app
2. **Depth on demand** — information drills down (Dashboard → Board → Task); never overwhelming at any level
3. **AI as collaborator** — proactive and context-aware, but the owner stays in control and gets credit for the thinking
4. **Speed over features** — fast and reliable beats slow and feature-rich; cut scope before cutting performance
5. **The solo owner feels like a studio** — not a freelancer with a to-do list; the tool should make one person feel like a well-run operation
