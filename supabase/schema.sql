-- ============================================================
-- Studio OS — Supabase schema
-- Run this in the Supabase SQL editor (project > SQL Editor)
-- ============================================================

create extension if not exists "pgcrypto";

-- ────────────────────────────────────────────────
-- TABLES (all created first, policies applied after)
-- ────────────────────────────────────────────────

create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  role        text not null default 'owner'
                   check (role in ('owner', 'subcontractor')),
  studio_name text,
  created_at  timestamptz not null default now()
);

create table public.clients (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references public.profiles(id) on delete cascade,
  name         text not null,
  project_name text,
  color        text,
  logo_url     text,
  status       text not null default 'active'
                    check (status in ('active', 'paused', 'archived')),
  health       text not null default 'on_track'
                    check (health in ('on_track', 'needs_attention', 'blocked', 'nearly_done')),
  start_date   date,
  due_date     date,
  buffer_tag   text,
  share_token  text unique default gen_random_uuid()::text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Storage bucket for client logos (create manually in Supabase dashboard)
-- Storage > New bucket: client-logos (private) image/*

create table public.task_groups (
  id           uuid primary key default gen_random_uuid(),
  client_id    uuid not null references public.clients(id) on delete cascade,
  name         text not null,
  color        text not null default '#378ADD',
  sort_order   int  not null default 0,
  created_at   timestamptz not null default now()
);

create table public.tasks (
  id                uuid primary key default gen_random_uuid(),
  group_id          uuid not null references public.task_groups(id) on delete cascade,
  title             text not null,
  description       text,
  status            text not null default 'todo'
                         check (status in ('todo', 'in_progress', 'done', 'blocked')),
  priority          text not null default 'normal'
                         check (priority in ('low', 'normal', 'high')),
  due_date          date,
  assigned_to       text,
  calendar_event_id text,
  sort_order        int  not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create table public.task_assignments (
  id       uuid primary key default gen_random_uuid(),
  task_id  uuid not null references public.tasks(id) on delete cascade,
  user_id  uuid not null references public.profiles(id) on delete cascade,
  unique (task_id, user_id)
);

create table public.subtasks (
  id          uuid primary key default gen_random_uuid(),
  task_id     uuid not null references public.tasks(id) on delete cascade,
  title       text not null,
  done        boolean not null default false,
  assignee_id uuid references public.profiles(id),
  sort_order  int  not null default 0,
  created_at  timestamptz not null default now()
);

create table public.notes (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references public.tasks(id) on delete cascade,
  author_id  uuid not null references public.profiles(id),
  body       text not null,
  created_at timestamptz not null default now()
);

create table public.files (
  id           uuid primary key default gen_random_uuid(),
  task_id      uuid not null references public.tasks(id) on delete cascade,
  uploaded_by  uuid not null references public.profiles(id),
  filename     text not null,
  storage_path text not null,
  size_bytes   bigint,
  mime_type    text,
  created_at   timestamptz not null default now()
);

create table public.inspo_items (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references public.tasks(id) on delete cascade,
  type       text not null check (type in ('image', 'link', 'note')),
  content    text not null,
  caption    text,
  sort_order int  not null default 0,
  created_at timestamptz not null default now()
);

create table public.task_links (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references public.tasks(id) on delete cascade,
  url        text not null,
  label      text not null,
  created_at timestamptz not null default now()
);

create table public.brain_dump_cards (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references public.clients(id) on delete cascade,
  type       text not null default 'sticky'
                  check (type in ('sticky', 'image', 'text')),
  content    text not null,
  color      text not null default 'amber',
  pos_x      int  not null default 50,
  pos_y      int  not null default 50,
  width      int  not null default 160,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.client_context (
  id         uuid primary key default gen_random_uuid(),
  client_id  uuid not null references public.clients(id) on delete cascade,
  entry_type text not null
                  check (entry_type in ('note', 'preference', 'decision', 'summary')),
  body       text not null,
  source     text,
  created_at timestamptz not null default now()
);

-- ────────────────────────────────────────────────
-- ROW LEVEL SECURITY — enable on all tables
-- ────────────────────────────────────────────────

alter table public.profiles         enable row level security;
alter table public.clients          enable row level security;
alter table public.task_groups      enable row level security;
alter table public.tasks            enable row level security;
alter table public.task_assignments enable row level security;
alter table public.subtasks         enable row level security;
alter table public.notes            enable row level security;
alter table public.files            enable row level security;
alter table public.inspo_items      enable row level security;
alter table public.task_links      enable row level security;
alter table public.brain_dump_cards enable row level security;
alter table public.client_context   enable row level security;

-- ────────────────────────────────────────────────
-- POLICIES — applied after all tables exist
-- ────────────────────────────────────────────────

-- profiles
create policy "Users can read own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- clients
create policy "Owner sees all their clients"
  on public.clients for all
  using (owner_id = auth.uid());

create policy "Subcontractors see assigned clients"
  on public.clients for select
  using (
    exists (
      select 1 from public.task_assignments ta
      join public.tasks t       on t.id  = ta.task_id
      join public.task_groups tg on tg.id = t.group_id
      where tg.client_id = clients.id
      and   ta.user_id   = auth.uid()
    )
  );

-- task_groups
create policy "Owner manages all groups"
  on public.task_groups for all
  using (
    exists (
      select 1 from public.clients c
      where c.id = task_groups.client_id
      and   c.owner_id = auth.uid()
    )
  );

-- tasks
create policy "Owner manages all tasks"
  on public.tasks for all
  using (
    exists (
      select 1 from public.task_groups tg
      join public.clients c on c.id = tg.client_id
      where tg.id = tasks.group_id
      and   c.owner_id = auth.uid()
    )
  );

create policy "Subcontractors see assigned tasks"
  on public.tasks for select
  using (
    exists (
      select 1 from public.task_assignments ta
      where ta.task_id = tasks.id
      and   ta.user_id = auth.uid()
    )
  );

create policy "Subcontractors update assigned tasks"
  on public.tasks for update
  using (
    exists (
      select 1 from public.task_assignments ta
      where ta.task_id = tasks.id
      and   ta.user_id = auth.uid()
    )
  );

-- task_assignments
create policy "Owner manages assignments"
  on public.task_assignments for all
  using (
    exists (
      select 1 from public.tasks t
      join public.task_groups tg on tg.id = t.group_id
      join public.clients c      on c.id  = tg.client_id
      where t.id = task_assignments.task_id
      and   c.owner_id = auth.uid()
    )
  );

-- subtasks
create policy "Owner manages all subtasks"
  on public.subtasks for all
  using (
    exists (
      select 1 from public.tasks t
      join public.task_groups tg on tg.id = t.group_id
      join public.clients c      on c.id  = tg.client_id
      where t.id = subtasks.task_id
      and   c.owner_id = auth.uid()
    )
  );

-- notes
create policy "Owner manages all notes"
  on public.notes for all
  using (
    exists (
      select 1 from public.tasks t
      join public.task_groups tg on tg.id = t.group_id
      join public.clients c      on c.id  = tg.client_id
      where t.id = notes.task_id
      and   c.owner_id = auth.uid()
    )
  );

-- files
create policy "Owner manages all files"
  on public.files for all
  using (
    exists (
      select 1 from public.tasks t
      join public.task_groups tg on tg.id = t.group_id
      join public.clients c      on c.id  = tg.client_id
      where t.id = files.task_id
      and   c.owner_id = auth.uid()
    )
  );

-- inspo_items
create policy "Owner manages inspo"
  on public.inspo_items for all
  using (
    exists (
      select 1 from public.tasks t
      join public.task_groups tg on tg.id = t.group_id
      join public.clients c      on c.id  = tg.client_id
      where t.id = inspo_items.task_id
      and   c.owner_id = auth.uid()
    )
  );

-- task_links
create policy "Owner manages task links"
  on public.task_links for all
  using (
    exists (
      select 1 from public.tasks t
      join public.task_groups tg on tg.id = t.group_id
      join public.clients c      on c.id  = tg.client_id
      where t.id = task_links.task_id
      and   c.owner_id = auth.uid()
    )
  );

-- brain_dump_cards
create policy "Owner manages brain dump"
  on public.brain_dump_cards for all
  using (
    exists (
      select 1 from public.clients c
      where c.id = brain_dump_cards.client_id
      and   c.owner_id = auth.uid()
    )
  );

-- client_context
create policy "Owner manages client context"
  on public.client_context for all
  using (
    exists (
      select 1 from public.clients c
      where c.id = client_context.client_id
      and   c.owner_id = auth.uid()
    )
  );

-- ────────────────────────────────────────────────
-- AUTO-CREATE PROFILE ON SIGNUP
-- ────────────────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ────────────────────────────────────────────────
-- UPDATED_AT TRIGGERS
-- ────────────────────────────────────────────────

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_clients_updated_at
  before update on public.clients
  for each row execute function public.set_updated_at();

create trigger set_tasks_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

create trigger set_brain_dump_updated_at
  before update on public.brain_dump_cards
  for each row execute function public.set_updated_at();

-- ────────────────────────────────────────────────
-- STORAGE BUCKETS (create manually in dashboard)
-- ────────────────────────────────────────────────
-- Storage > New bucket:
--   task-files        (private)  image/*, application/pdf, .docx
--   brain-dump-images (private)  image/*