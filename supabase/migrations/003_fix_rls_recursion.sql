-- ============================================================
-- Migration 003 — Fix infinite RLS recursion
-- Root cause: "Subcontractors see assigned clients" on clients
-- joins task_assignments, whose own policy joins back to clients
-- creating an infinite loop.
--
-- These three policies are dropped until subcontractor support
-- is actually built (Phase 4+). Owner policies are unaffected.
-- ============================================================

DROP POLICY IF EXISTS "Subcontractors see assigned clients"  ON public.clients;
DROP POLICY IF EXISTS "Subcontractors see assigned tasks"    ON public.tasks;
DROP POLICY IF EXISTS "Subcontractors update assigned tasks" ON public.tasks;
