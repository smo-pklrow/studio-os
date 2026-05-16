-- Add assignee field to tasks
-- Stores a free-text name (no user account required in Phase 2).
-- Phase 4 will migrate this to a FK on a team_members table with proper invite flow.
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS assigned_to text;
