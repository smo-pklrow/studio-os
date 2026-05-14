# Setup Guide — Studio OS

> Full environment setup from zero to running locally and deployed.

---

## Prerequisites

- Node 20+
- npm 10+
- A Supabase account (free tier works)
- A Google Cloud project with OAuth credentials
- A Cloudflare account (free tier works)

---

## 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/studio-os.git
cd studio-os
npm install
```

---

## 2. Supabase project

1. Go to [supabase.com](https://supabase.com) → New project
2. Wait for provisioning (~2 min)
3. Go to **Settings > API**, copy:
   - `Project URL` → `VITE_SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`

---

## 3. Environment variables

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

Never commit `.env`. It's in `.gitignore`.

---

## 4. Database schema

In Supabase → **SQL Editor**, paste and run the full contents of `supabase/schema.sql`.

Verify tables exist: `clients`, `tasks`, `brain_dump`, `portals`, `task_files`.

---

## 5. Google OAuth

1. [console.cloud.google.com](https://console.cloud.google.com) → Create OAuth 2.0 credentials
2. Authorized JavaScript origins: `http://localhost:5173`
3. Authorized redirect URIs: `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`
4. In Supabase → **Authentication > Providers > Google** — enable, paste Client ID + Secret

---

## 6. Storage buckets

In Supabase → **Storage**, create:
- `task-files` (private)
- `brain-dump-images` (private)

---

## 7. Anthropic API key (for AI features)

In Supabase → **Edge Functions > Secrets**, add:
```
ANTHROPIC_API_KEY=sk-ant-...
```

Never put this in `.env` or any frontend file.

---

## 8. Run locally

```bash
npm run dev
# → http://localhost:5173
```

---

## Deploy to Cloudflare Pages

1. Push repo to GitHub
2. [dash.cloudflare.com](https://dash.cloudflare.com) → Pages → Create project → Connect GitHub repo
3. Build settings:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
4. Environment variables: add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
5. Deploy

After first deploy, update Google OAuth:
- Add `https://studio-os.pages.dev` to authorized origins
- Update Supabase **Auth > URL Configuration > Site URL**

---

## Supabase Edge Functions (local dev)

```bash
npx supabase start          # starts local Supabase stack
npx supabase functions serve # serves edge functions locally
```

Deploy a function:
```bash
npx supabase functions deploy generate-brief
```

---

## Common issues

| Problem | Fix |
|---|---|
| Blank page after login | Check `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` |
| OAuth redirect error | Confirm redirect URI matches exactly in Google Console + Supabase |
| RLS blocking queries | Check `auth.uid()` is present on session; verify RLS policies in `schema.sql` |
| Edge function 500 | Check `ANTHROPIC_API_KEY` is set in Supabase Edge Function secrets |
