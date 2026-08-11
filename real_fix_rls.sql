-- ============================================================
-- FROSTER GYM - SUPABASE RLS INFINITE RECURSION (42P17) FIX
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/pndkqnnsxjpjvxufrdav/sql
-- ============================================================

-- 1. Create SECURITY DEFINER function to fetch user gym_id without triggering RLS recursion
CREATE OR REPLACE FUNCTION public.get_gym_id() 
RETURNS UUID AS $$
DECLARE
  v_gym_id UUID;
BEGIN
  SELECT gym_id INTO v_gym_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
  RETURN v_gym_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Alias for get_user_gym_id
CREATE OR REPLACE FUNCTION public.get_user_gym_id() 
RETURNS UUID AS $$
BEGIN
  RETURN public.get_gym_id();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update user_belongs_to_gym helper to be SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.user_belongs_to_gym(check_gym_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN check_gym_id = public.get_gym_id();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Drop legacy problematic recursive policies on profiles and gyms
DROP POLICY IF EXISTS "Users can view gym profiles" ON public.profiles;
DROP POLICY IF EXISTS "Owner can manage gym profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

DROP POLICY IF EXISTS "Users can view own gym" ON public.gyms;
DROP POLICY IF EXISTS "Owner can update own gym" ON public.gyms;

-- 3. Re-create non-recursive policies for profiles
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (user_id = auth.uid() OR gym_id = public.get_gym_id());

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Owner can manage gym profiles"
  ON public.profiles FOR ALL
  USING (gym_id = public.get_gym_id());

-- 4. Re-create non-recursive policies for gyms
CREATE POLICY "Users can view own gym"
  ON public.gyms FOR SELECT
  USING (id = public.get_gym_id() OR owner_id = auth.uid());

CREATE POLICY "Owner can update own gym"
  ON public.gyms FOR UPDATE
  USING (owner_id = auth.uid());
