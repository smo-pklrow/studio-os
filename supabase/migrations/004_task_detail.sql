-- Migration 004 — task_links table for manually-linked Gmail/email threads
-- Run in Supabase SQL Editor

create table public.task_links (
  id         uuid primary key default gen_random_uuid(),
  task_id    uuid not null references public.tasks(id) on delete cascade,
  url        text not null,
  label      text not null,
  created_at timestamptz not null default now()
);

alter table public.task_links enable row level security;

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
