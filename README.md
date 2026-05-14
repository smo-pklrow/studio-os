# Studio OS

Client management + AI second brain for solo creative consultants.

## Stack
- React 18 + Vite
- Tailwind CSS (dark mode default)
- Supabase (auth, database, storage)
- Cloudflare Pages (hosting)
- @dnd-kit (drag and drop)
- Claude API via Supabase Edge Functions

---

## First-time setup

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/studio-os.git
cd studio-os
npm install
```

### 2. Create your Supabase project

1. Go to https://supabase.com and create a new project
2. Wait for it to provision (~2 min)
3. Go to **Settings > API** and copy your Project URL and anon key

### 3. Set up environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in:
- `VITE_SUPABASE_URL` — your project URL
- `VITE_SUPABASE_ANON_KEY` — your anon/public key

### 4. Run the database schema

1. In your Supabase project, go to **SQL Editor**
2. Paste the entire contents of `supabase/schema.sql`
3. Click **Run**

### 5. Enable Google Auth in Supabase

1. Go to **Authentication > Providers > Google**
2. Enable it
3. Add your Google OAuth Client ID and Secret
   (Create these at https://console.cloud.google.com — OAuth 2.0 credentials)
4. Add `http://localhost:5173` to your Google OAuth authorized origins
5. Add `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback` as authorized redirect URI

### 6. Create Supabase Storage buckets

In **Storage > New bucket**, create two buckets:
- `task-files` (private)
- `brain-dump-images` (private)

### 7. Run locally

```bash
npm run dev
```

App runs at http://localhost:5173

---

## Deploy to Cloudflare Pages

### First deploy
1. Push this repo to GitHub
2. Go to https://dash.cloudflare.com > Pages > Create a project
3. Connect your GitHub repo
4. Set build settings:
   - **Framework preset**: Vite
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
5. Under **Environment variables**, add your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
6. Click **Save and Deploy**

### Subsequent deploys
Push to `main` — Cloudflare Pages auto-deploys on every push.

### Update Google OAuth for production
Once deployed, add your `https://studio-os.pages.dev` URL to:
- Google OAuth authorized JavaScript origins
- Supabase Auth > URL Configuration > Site URL

---

## Project structure

```
src/
  components/
    layout/       AppShell (auth guard, nav)
    clients/      ClientCard, ClientList, WeekCalendar, DigestStrip
    tasks/        TaskGroup, TaskRow, TaskDetail
    braindump/    BrainDumpCanvas, BrainDumpCard
    shared/       Badge, Button, Avatar, ProgressBar
  pages/
    Dashboard.jsx     Level 1
    ClientBoard.jsx   Level 2 (tasks + brain dump tabs)
    TaskDetail.jsx    Level 3
    ClientPortal.jsx  Read-only client link
    Login.jsx
  lib/
    supabase.js   Supabase client singleton
  hooks/          useClients, useTasks, useCalendar (coming soon)
  styles/
    index.css     Tailwind + global tokens
supabase/
  schema.sql      Full DB schema + RLS policies
```
