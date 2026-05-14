# Product Requirements Document — Studio OS

**Version**: 0.2 | **Last updated**: 2026-05-14 | **Owner**: Sean Owen

---

## Problem

Solo creative consultants (designers, strategists, brand consultants) juggle client work across scattered tools — notes in Notion, tasks in Linear, files in Google Drive, ideas in Notes. There's no single place that connects *who the client is*, *what's happening this week*, and *the creative thinking behind the work*.

---

## Target User

**The Solo Studio Owner**
- 3–12 active clients at any time
- Does the work themselves; no team
- Loses momentum when context-switching between clients
- Wants to feel "in command" of their studio, not buried in admin

Secondary: **The Client** — receives a read-only portal link showing progress, no login required.

---

## Core Value Proposition

> Studio OS is the operating system for a solo creative practice — it knows your clients, tracks your work, and thinks alongside you.

---

## Feature Set

### MVP (Phase 1–2)

| Feature | Description | Status |
|---|---|---|
| Google OAuth login | Single-user auth for studio owner | Done |
| Client list (Dashboard) | Cards showing all active clients, status, last activity | In progress |
| Client board | Per-client view: tasks tab + brain dump tab | In progress |
| Task management | Create, edit, reorder (drag-drop), status workflow | Scaffolded |
| Brain dump | Free-form note cards per client with AI tagging | Scaffolded |
| Client portal | Public read-only link with token, shows tasks + status | Scaffolded |

### Phase 3 — Intelligence Layer

| Feature | Description |
|---|---|
| Weekly digest | Monday morning summary: what's due, what's stalled, open loops |
| AI brief generator | Claude turns brain dump cards into a structured client brief |
| Smart tagging | Auto-tag brain dump entries by theme (brand, copy, visual, etc.) |
| Deadline inference | Claude reads task descriptions and suggests due dates |

### Phase 4 — Studio Layer

| Feature | Description |
|---|---|
| Time tracking | Log hours per task, roll up per client |
| Invoice generator | Generate PDF invoice from logged hours |
| Proposal templates | Turn brief into project scope/proposal |
| Calendar integration | Sync deadlines with Google Calendar |

---

## Non-Goals (explicitly out of scope)

- Multi-user / team collaboration
- Real-time client messaging / chat
- Native mobile app
- Payment processing

---

## Success Metrics

- Daily active use by studio owner
- Brain dump → brief conversion rate (Phase 3)
- Time from client creation to first task < 2 minutes

---

## Design Principles

1. **Dark, calm, focused** — this is a focused work tool, not a consumer app
2. **Depth on demand** — information architecture drills down (Dashboard → Board → Task), never overwhelming
3. **AI as collaborator** — suggestions, not automation; the owner stays in control
4. **Speed over features** — a fast, reliable tool beats a slow, feature-rich one
