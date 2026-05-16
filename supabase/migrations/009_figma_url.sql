-- Add figma_url to tasks table for Phase 3G
alter table public.tasks add column if not exists figma_url text;
