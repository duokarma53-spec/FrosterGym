-- ============================================================
-- FROSTER GYM - MEMBERSHIP PLANS ADDONS MIGRATION
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/pndkqnnsxjpjvxufrdav/sql
-- ============================================================

-- First, create the table if it completely doesn't exist yet
CREATE TABLE IF NOT EXISTS public.membership_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  duration_months INTEGER NOT NULL DEFAULT 1,
  duration_days INTEGER NOT NULL DEFAULT 0,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  description TEXT,
  includes_pt BOOLEAN NOT NULL DEFAULT false,
  includes_diet BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Then, ensure the new columns exist in case the table was already created in a previous step
ALTER TABLE public.membership_plans
ADD COLUMN IF NOT EXISTS includes_pt BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS includes_diet BOOLEAN NOT NULL DEFAULT false;
