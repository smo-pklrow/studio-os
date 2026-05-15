-- Migration 005 — Portal RLS
-- Allows the anonymous role (unauthenticated) to read client data
-- via a share_token. Security relies on the token being a secret UUID.
-- Run in Supabase SQL Editor.

-- Clients: anon can SELECT any client whose share_token is set.
-- The actual token check is enforced by the frontend .eq('share_token', token) query.
create policy "Portal reads client by share_token"
  on public.clients for select
  to anon
  using (share_token is not null);

-- Task groups: anon can read groups belonging to a portal-accessible client.
create policy "Portal reads task groups"
  on public.task_groups for select
  to anon
  using (
    exists (
      select 1 from public.clients c
      where c.id = task_groups.client_id
        and c.share_token is not null
    )
  );

-- Tasks: anon can read tasks whose group belongs to a portal-accessible client.
create policy "Portal reads tasks"
  on public.tasks for select
  to anon
  using (
    exists (
      select 1 from public.task_groups tg
      join public.clients c on c.id = tg.client_id
      where tg.id = tasks.group_id
        and c.share_token is not null
    )
  );
