-- ============================================================
-- FROSTER GYM - MISSING STAFF TABLE FIX
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/pndkqnnsxjpjvxufrdav/sql
-- ============================================================

CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- Re-use the existing get_gym_id() function for RLS
CREATE POLICY "Users can view staff in their gym" 
  ON public.staff FOR SELECT 
  USING (gym_id = public.get_gym_id());

CREATE POLICY "Users can insert staff in their gym" 
  ON public.staff FOR INSERT 
  WITH CHECK (gym_id = public.get_gym_id());

CREATE POLICY "Users can update staff in their gym" 
  ON public.staff FOR UPDATE 
  USING (gym_id = public.get_gym_id());

CREATE POLICY "Users can delete staff in their gym" 
  ON public.staff FOR DELETE 
  USING (gym_id = public.get_gym_id());
