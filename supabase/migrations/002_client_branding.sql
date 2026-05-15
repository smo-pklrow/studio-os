-- ============================================================
-- Migration 002 — Client branding (color + logo)
-- Run in Supabase SQL Editor after 001 (initial schema)
-- ============================================================

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS color    text,
  ADD COLUMN IF NOT EXISTS logo_url text;

-- Storage bucket for client logos
-- Create manually in Supabase dashboard:
--   Storage > New bucket > name: "client-logos" > toggle Public ON
--   (logos are not sensitive; public URLs needed for unauthenticated portal views)
