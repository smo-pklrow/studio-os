# Codex Handoff — Studio OS

> Read this before generating any code. It tells you exactly how this codebase is shaped so you don't fight its conventions.

---

## What this app is

Studio OS is a single-user creative studio dashboard. One authenticated user (the studio owner) manages multiple clients. Each client has tasks and brain dump notes. Clients can be shared with a public read-only portal link.

No multi-tenancy. No teams. No real-time collaboration beyond Supabase's built-in subscriptions.

---

## Supporting documentation

Before generating any code, check the relevant doc in `/docs/`:
- `DESIGN_TOKENS.md` — all colors, spacing, typography, component patterns
- `UX_FLOWS.md` — user journeys, screen transitions, edge cases
- `DATA_MODEL.md` — every table in plain English, RLS intent, what creates/deletes rows
- `AGENT_PROMPTS.md` — all Claude API prompts for Phase 3 features (do not rewrite these)
- `INTEGRATIONS.md` — technical contracts for Calendar, Buffer, Figma, Managed Agents
- `DECISIONS.md` — why major decisions were made (read before proposing alternatives)

---

## Component conventions

```
src/components/<feature>/<ComponentName>.jsx
```

Current component tree:
```
components/
  layout/     AppShell, NavBar, WeekCalendar, DigestStrip, StatsBar
  clients/    ClientRow, ClientHeader, AddClientModal, EditClientModal
  tasks/      TaskGroup, TaskRow, AddTaskRow
  braindump/  BrainDumpCanvas, BrainDumpCard
  shared/     ErrorBoundary, Toast (+ ToastProvider + useToast), CommandPalette
```

- PascalCase filenames
- Default export only
- Props destructured at top of function signature
- Tailwind classes only — no styled-components, no CSS modules
- `className` prop accepted on all leaf components for caller overrides

Example skeleton:
```jsx
export default function ClientCard({ client, onClick, className = '' }) {
  return (
    <div
      onClick={onClick}
      className={`rounded-xl bg-zinc-900 p-4 cursor-pointer hover:bg-zinc-800 transition ${className}`}
    >
      {/* content */}
    </div>
  )
}
```

---

## Hook conventions

```
src/hooks/use<Feature>.js
```

- Named export: `export function useClients() { ... }`
- Always return `{ data, loading, error }` plus mutation functions
- Supabase queries live here, never in JSX
- Use `useEffect` + `useState` for initial fetch; expose refetch if needed

Example skeleton:
```js
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useClients() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    supabase
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) setError(error)
        else setClients(data)
        setLoading(false)
      })
  }, [])

  async function createClient(fields) {
    const { data, error } = await supabase.from('clients').insert(fields).select().single()
    if (!error) setClients(prev => [data, ...prev])
    return { data, error }
  }

  return { clients, loading, error, createClient }
}
```

---

## Supabase schema (current tables)

Confirm actuals in `supabase/schema.sql`. Expected shape:

```sql
clients          (id, owner_id, name, project_name, color, logo_url, status, health, start_date, due_date, share_token, created_at, updated_at)
task_groups      (id, client_id, name, color, sort_order, created_at)
tasks            (id, group_id, title, description, status, priority, due_date, sort_order, created_at, updated_at)
task_assignments (id, task_id, user_id)
subtasks         (id, task_id, title, done, assignee_id, sort_order, created_at)
notes            (id, task_id, author_id, body, created_at)
files            (id, task_id, uploaded_by, filename, storage_path, size_bytes, mime_type, created_at)
inspo_items      (id, task_id, type, content, caption, sort_order, created_at)
brain_dump_cards (id, client_id, type, content, color, pos_x, pos_y, width, created_at, updated_at)
client_context   (id, client_id, entry_type, body, source, created_at)
profiles         (id, full_name, avatar_url, role, created_at)
```

`color` and `logo_url` on `clients` are pending migration — add via SQL Editor, then update `supabase/schema.sql`.

Storage buckets: `task-files` (private), `brain-dump-images` (private), `client-logos` (private).

RLS: all tables filtered by `auth.uid() = user_id` (or join to clients.user_id).
`portals` table: read allowed without auth if `token` matches.

---

## AI integration

Claude is called **only** from Supabase Edge Functions. Never from React components.

Edge function pattern (`supabase/functions/<name>/index.ts`):
```ts
import Anthropic from 'npm:@anthropic-ai/sdk'

const client = new Anthropic()  // reads ANTHROPIC_API_KEY from env

Deno.serve(async (req) => {
  const { entries } = await req.json()
  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    messages: [{ role: 'user', content: buildPrompt(entries) }],
  })
  return Response.json({ result: message.content[0].text })
})
```

Frontend calls edge function via supabase client:
```js
const { data } = await supabase.functions.invoke('generate-brief', { body: { entries } })
```

---

## Routing structure

```
/                              → Dashboard (protected)
/client/:clientId              → ClientBoard (protected)
/client/:clientId/task/:taskId → TaskDetail (protected)
/portal/:shareToken            → ClientPortal (public — no auth)
/settings                      → Settings (protected)
/login                         → Login
```

Auth guard lives in `src/components/layout/AppShell.jsx`.

---

## Styling tokens

Defined in `src/styles/index.css` as CSS custom properties on `:root`. **Do not use Tailwind color values like `zinc-950` or `violet-500` — they do not exist in this design system.** Use the token names below.

Key tokens:
- `--color-bg`: `#1E1E1C` — page background
- `--color-surface` / `var(--color-card)`: `#252523` — card/panel background
- `--color-elevated`: `#2A2A28` — hover states, dropdowns
- `--color-brand`: `#1D9E75` — primary action green
- `--color-text`: `#E8E6DF` — primary text
- `--color-muted`: `#9C9A92` — secondary/meta text
- `--color-subtle`: `#6B6963` — placeholder, disabled
- `--border-default`: `rgba(255,255,255,0.08)` — card borders
- `--font-sans`: `'DM Sans', system-ui, sans-serif` — all UI text
- `--font-display`: `'DM Serif Display', Georgia, serif` — display moments 28px+ only

Full token reference: `docs/DESIGN_TOKENS.md`

---

## What NOT to do

- Do not add TypeScript — plain JSX only
- Do not install UI libraries (shadcn, Radix, MUI, etc.)
- Do not put Supabase queries in JSX — use hooks
- Do not call Claude API from the frontend
- Do not bypass RLS with service_role key in frontend code
- Do not create barrel `index.js` files
- Do not add Redux, Zustand, or any global state library
