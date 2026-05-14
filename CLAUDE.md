# Studio OS — Claude Project Context

> Client management + AI second brain for solo creative consultants.
> React 18 + Vite · Supabase · Tailwind CSS · Cloudflare Pages · Claude API

---

## Orientation

This file is the single source of truth for every agent and session working in this repo.
Read it before touching code. Update it when decisions change.

- **PRD**: `docs/PRD.md` — what we're building and why
- **Phases**: `docs/PHASE_TRACKER.md` — current sprint, done/in-progress/blocked
- **Workstreams**: `docs/WORKSTREAMS.md` — parallel tracks and ownership
- **Codex Handoff**: `docs/CODEX_HANDOFF.md` — context for code-generation agents
- **Setup**: `docs/SETUP.md` — env, local dev, deploy

---

## Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| UI | React 18 + Vite | JSX, no TypeScript yet |
| Styling | Tailwind CSS v3 | Dark mode default, tokens in `src/styles/index.css` |
| Routing | React Router v6 | Three-level drill-down |
| Drag-drop | @dnd-kit | Tasks only |
| Backend | Supabase | Auth, Postgres, Storage, Edge Functions |
| AI | Claude API | Via Supabase Edge Functions, not called from frontend directly |
| Hosting | Cloudflare Pages | Auto-deploys on push to `main` |

---

## Project Structure

```
src/
  components/
    layout/       AppShell (auth guard, nav)
    clients/      ClientCard, ClientList, WeekCalendar, DigestStrip
    tasks/        TaskGroup, TaskRow, TaskDetail
    braindump/    BrainDumpCanvas, BrainDumpCard
    shared/       Badge, Button, Avatar, ProgressBar
  pages/
    Dashboard.jsx      Level 1 — all clients
    ClientBoard.jsx    Level 2 — tasks + brain dump tabs
    TaskDetail.jsx     Level 3 — task detail + files
    ClientPortal.jsx   Read-only shareable link
    Login.jsx          Google OAuth entry point
  lib/
    supabase.js        Supabase client singleton
  hooks/              Custom hooks (useClients, useTasks — in progress)
  styles/
    index.css          Tailwind + global design tokens
supabase/
  schema.sql           Full DB schema + RLS policies
docs/                  Planning docs (this tree)
.claude/               Claude Code settings + memory
```

---

## Key Architectural Decisions

- **No TypeScript** — plain JSX for now; add types if complexity demands it
- **No global state library** — Supabase real-time + local component state is sufficient
- **AI calls via Edge Functions** — Claude API key never exposed to browser
- **RLS enforced** — all Supabase tables have row-level security; never bypass
- **Single user per deployment** — auth is for the studio owner only; ClientPortal is public but read-only via token

---

## Coding Standards

- No comments unless the WHY is non-obvious
- No premature abstraction — three similar lines beats a helper
- Tailwind utility classes only; no custom CSS unless tokens fall short
- Components live in their feature folder; no barrel `index.js` files
- Supabase queries go in custom hooks under `src/hooks/`, not inline in JSX
- Never call Claude API directly from React components

---

## Environment Variables

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Edge Functions use `ANTHROPIC_API_KEY` set in Supabase dashboard (never in `.env`).

---

## Running Locally

```bash
npm install
npm run dev          # http://localhost:5173
```

```bash
# Supabase local (optional)
npx supabase start
```

---

## Deploying

Push to `main` — Cloudflare Pages auto-builds and deploys.
Schema migrations: run SQL in Supabase SQL Editor, then commit `supabase/schema.sql`.
