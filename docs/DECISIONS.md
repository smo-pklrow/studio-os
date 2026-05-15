# Architecture Decisions — Studio OS

> Every major technical or product decision, with its rationale. Read before proposing a change to any of these. If you want to reverse a decision, add a new entry — don't delete the old one.

---

## ADR-001 — React + Vite over Next.js

**Decision**: Use React 18 + Vite for the frontend, not Next.js.

**Rationale**: Studio OS is a single-page application with client-side auth (Supabase) and no server-side rendering requirements. Next.js adds complexity (SSR, API routes, file-based routing) that this app doesn't need. Vite gives faster local dev and a simpler build config. Cloudflare Pages deploys static output cleanly.

**Trade-off accepted**: No server-side rendering, no SEO. Studio OS is a private authenticated tool — SEO is irrelevant. The client portal (`/portal/:token`) is public but doesn't need to be indexed.

---

## ADR-002 — Supabase over Firebase

**Decision**: Use Supabase for database, auth, storage, and Edge Functions.

**Rationale**: Supabase gives PostgreSQL (real relational data, proper RLS, foreign keys) vs Firebase's document model. The data in Studio OS is highly relational — clients → groups → tasks → subtasks — and would require denormalization in Firestore. Supabase's RLS is also cleaner for the subcontractor access model. Edge Functions handle the Anthropic API key securely.

**Trade-off accepted**: Supabase's free tier has limits (500MB DB, 1GB storage). Fine for a solo studio tool.

---

## ADR-003 — Cloudflare Pages over Vercel

**Decision**: Deploy to Cloudflare Pages, not Vercel.

**Rationale**: Sean already has a Cloudflare account with two other projects deployed there (pklrow-app, pkldash). Consistent tooling. Cloudflare Pages free tier has no bandwidth limits. Vercel's free tier limits serverless function invocations — though Studio OS doesn't use Vercel functions (Edge Functions are in Supabase).

**Trade-off accepted**: Cloudflare Pages has slightly less polish in the dev experience than Vercel. Acceptable.

---

## ADR-004 — Dark mode only

**Decision**: Ship dark mode only. No light mode in v1 or v2.

**Rationale**: The primary user (Leah, the studio owner) has migraines and specifically requested dark mode as a hard requirement. Light mode would be wasted engineering work until there's demand. The design system is built dark-first — retrofitting light mode later is possible but requires a full token audit. Deferred to Phase 4 as an explicit non-goal.

**Trade-off accepted**: Some users prefer light mode. Not the target user.

---

## ADR-005 — No Gmail API integration

**Decision**: No Gmail API. Email threads in Task Detail are manually linked (URL + label stored in `task_links`).

**Rationale**: Leah explicitly removed Gmail from the integration list citing security concerns and the risk of accidental operations. Connecting Gmail would require OAuth scopes that expose the entire inbox. The actual need (seeing relevant emails alongside a task) is met well enough by manually linking a Gmail thread URL — Leah knows which emails are relevant and can paste the link herself.

**Trade-off accepted**: No automatic email-to-task linking. Manual linking is a slightly higher-friction workflow. Acceptable given the security concern.

---

## ADR-006 — No Slack integration

**Decision**: No Slack integration at any phase.

**Rationale**: Explicitly removed by the user due to security concerns. Slack API tokens have broad workspace access. For a solo studio owner, Slack isn't a primary work tool anyway — communication happens via email and client-specific tools.

**Trade-off accepted**: No notifications via Slack. Digest delivery is email-based instead.

---

## ADR-007 — No ads manager integrations (Facebook Ads, Google Ads)

**Decision**: No Facebook Business Manager or Google Ads API integration.

**Rationale**: Leah identified these as a security and operational risk. Accidentally triggering a paid campaign through a misclick or API bug would have immediate financial consequences. The value of seeing ad performance data inside Studio OS doesn't outweigh that risk. If campaign data is needed, it's viewed in the native platforms.

**Trade-off accepted**: No performance data in the app. Studio OS is a work management tool, not a reporting dashboard.

---

## ADR-008 — Miro replaced by built-in brain dump canvas

**Decision**: Build a native drag-and-drop brain dump canvas instead of integrating Miro.

**Rationale**: Leah wanted to eliminate Miro (consolidation, cost). The use case is specific — a per-client freeform space for sticky notes, image references, and text blocks. A full Miro integration would be overkill. The `brain_dump_cards` table + `BrainDumpCanvas` component built with `@dnd-kit` covers the actual need. Miro's advanced features (drawing, connectors, real-time collaboration) aren't needed for a solo practitioner.

**Trade-off accepted**: Less powerful than Miro. No drawing tools, no connectors between cards. Acceptable for the use case.

---

## ADR-009 — Monday.com replaced entirely

**Decision**: Studio OS replaces Monday.com with no integration.

**Rationale**: Monday was already killed by Leah due to price hikes. No data migration needed — she's starting fresh. The key pain point with Monday was its seat-based pricing model for client views. Studio OS's client portal solves this with a free share link (no login required).

**Trade-off accepted**: None. This was the original motivation for the product.

---

## ADR-010 — Figma as URL-only (no API)

**Decision**: Figma files are linked by URL only. No Figma API integration.

**Rationale**: The actual need is "I want to open the right Figma file for this task." A URL field that opens Figma natively satisfies that need. The Figma API would enable embedding previews or syncing frame names, but that adds complexity and an OAuth flow for marginal gain. Figma is Leah's design tool — Studio OS doesn't need to understand its contents, just link to them.

**Trade-off accepted**: No live Figma previews in the app. Acceptable.

---

## ADR-011 — Claude API only via Supabase Edge Functions

**Decision**: All Anthropic API calls are made from Supabase Edge Functions, never from the React frontend.

**Rationale**: The Anthropic API key must never be exposed in browser code. Edge Functions run in Deno on Supabase's servers; the key is stored as a secret and never transmitted to the client. The React frontend calls `supabase.functions.invoke()` which is authenticated via the user's Supabase session.

**Trade-off accepted**: Every AI feature requires a round-trip through Supabase. Adds ~100–200ms latency vs calling the API directly. Acceptable given the security requirement is non-negotiable.

---

## ADR-012 — Claude Managed Agents over n8n / Make.com

**Decision**: Use Claude Managed Agents (Anthropic, 2026) for all scheduled automations and the per-client AI memory system. Not n8n, Make.com, or custom Supabase cron functions.

**Rationale**: Managed Agents provide persistent memory per agent instance, scheduled run support, webhook triggers, and MCP connector support — all on Anthropic's infrastructure with no additional tool to host or maintain. This replaces what would otherwise require: n8n (workflow automation), a vector database (memory), and custom cron scheduling. The architecture is simpler and the memory quality is better because the agent has native access to the Claude model's context handling.

**Trade-off accepted**: Managed Agents are a newer product (beta as of 2026). There is some API surface risk. If Anthropic changes the product, some Phase 3 work may need rearchitecting. The benefit justifies the risk for a v1 product.

---

## ADR-013 — No TypeScript

**Decision**: Plain JavaScript (JSX) only. No TypeScript.

**Rationale**: From CODEX_HANDOFF.md: the velocity benefit of TypeScript doesn't outweigh the friction for a rapidly-evolving solo project built with AI-assisted coding. Type safety is enforced at the database layer (Supabase RLS and schema constraints) rather than at the application layer. Revisit if the codebase grows beyond 3 contributors.

**Trade-off accepted**: No compile-time type checking. Bugs caught at runtime instead. Mitigated by good hook conventions and Supabase's typed responses.

---

## ADR-014 — No global state library

**Decision**: No Redux, Zustand, Jotai, or any global state manager.

**Rationale**: From CODEX_HANDOFF.md: Studio OS has no complex shared state that justifies a state manager. Each page fetches its own data via hooks (`useClients`, `useTasks`, etc.). The only "shared" state is the authenticated user, which lives in Supabase's auth session and is accessed via the AppShell.

**Trade-off accepted**: No cross-page reactive state. If a client is updated on the Dashboard, the ClientBoard won't auto-refresh without a page navigation. Acceptable for v1.

---

## ADR-015 — Single share token per client (no expiry)

**Decision**: Each client has one `share_token` that never expires and cannot be regenerated in v1.

**Rationale**: Simplicity. Token regeneration (to revoke access) adds a settings UI, confirmation flow, and "this link is broken" communication to the client. The studio owner controls the relationship — if they want to stop sharing, they can simply stop sending the link. Hard revocation is a Phase 4 feature.

**Trade-off accepted**: No way to revoke a shared link without deleting the client record. Acceptable for a trust-based client relationship context.
