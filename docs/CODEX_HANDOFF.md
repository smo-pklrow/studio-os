# Codex Handoff — Studio OS

> Read this before generating any code. It tells you exactly how this codebase is shaped so you don't fight its conventions.

---

## What this app is

Studio OS is a single-user creative studio dashboard. One authenticated user (the studio owner) manages multiple clients. Each client has tasks and brain dump notes. Clients can be shared with a public read-only portal link.

No multi-tenancy. No teams. No real-time collaboration beyond Supabase's built-in subscriptions.

---

## Component conventions

```
src/components/<feature>/<ComponentName>.jsx
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
clients        (id, user_id, name, color, logo_url, status, created_at)
tasks          (id, client_id, title, description, status, position, due_date, created_at)
brain_dump     (id, client_id, content, tags, created_at)
portals        (id, client_id, token, created_at)
task_files     (id, task_id, file_path, file_name, created_at)
```

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
/              → Dashboard (protected)
/client/:id    → ClientBoard (protected)
/task/:id      → TaskDetail (protected)
/portal/:token → ClientPortal (public)
/login         → Login
```

Auth guard lives in `src/components/layout/AppShell.jsx`.

---

## Styling tokens

Defined in `src/styles/index.css`. Key design decisions:
- Background: `zinc-950` (near black)
- Cards: `zinc-900`
- Hover: `zinc-800`
- Accent: `violet-500` (primary actions)
- Destructive: `red-500`
- Text primary: `zinc-100`
- Text muted: `zinc-400`
- Border: `zinc-800`

---

## What NOT to do

- Do not add TypeScript — plain JSX only
- Do not install UI libraries (shadcn, Radix, MUI, etc.)
- Do not put Supabase queries in JSX — use hooks
- Do not call Claude API from the frontend
- Do not bypass RLS with service_role key in frontend code
- Do not create barrel `index.js` files
- Do not add Redux, Zustand, or any global state library
