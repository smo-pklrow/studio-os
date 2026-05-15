-- Migration 006 — Studio name
-- Adds studio_name to profiles. Shown in the nav bar and (future) portal header.
-- Run in Supabase SQL Editor.

alter table public.profiles
  add column if not exists studio_name text;
