-- Froster Gym Foundation Schema
-- Run this in your Supabase SQL Editor

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- GYMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.gyms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  logo_url TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gym_id UUID REFERENCES public.gyms(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT DEFAULT '',
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('owner', 'staff')),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, gym_id)
);

-- ============================================
-- STAFF PERMISSIONS TABLE
-- ============================================
DROP TABLE IF EXISTS public.staff_permissions CASCADE;

CREATE TABLE IF NOT EXISTS public.staff_permissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  permission TEXT NOT NULL,
  granted BOOLEAN DEFAULT true,
  granted_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(profile_id, permission)
);

-- ============================================
-- GYM SETTINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.gym_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(gym_id, key)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_gym_id ON public.profiles(gym_id);
CREATE INDEX IF NOT EXISTS idx_staff_permissions_profile_id ON public.staff_permissions(profile_id);
CREATE INDEX IF NOT EXISTS idx_gym_settings_gym_id ON public.gym_settings(gym_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_gyms_updated_at
  BEFORE UPDATE ON public.gyms
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_gym_settings_updated_at
  BEFORE UPDATE ON public.gym_settings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- AUTO-CREATE PROFILE + GYM ON FIRST SIGNUP
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  new_gym_id UUID;
  user_name TEXT;
  user_email TEXT;
BEGIN
  user_email := NEW.email;
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(user_email, '@', 1)
  );

  -- Create a gym for the new user (they become owner)
  INSERT INTO public.gyms (name, slug, owner_id)
  VALUES (
    user_name || '''s Gym',
    LOWER(REPLACE(user_name, ' ', '-')) || '-' || SUBSTR(NEW.id::text, 1, 8),
    NEW.id
  )
  RETURNING id INTO new_gym_id;

  -- Create the owner profile
  INSERT INTO public.profiles (user_id, gym_id, full_name, email, role)
  VALUES (NEW.id, new_gym_id, user_name, user_email, 'owner');

  -- Insert default gym settings
  INSERT INTO public.gym_settings (gym_id, key, value) VALUES
    (new_gym_id, 'currency', '"INR"'),
    (new_gym_id, 'timezone', '"Asia/Kolkata"'),
    (new_gym_id, 'date_format', '"DD/MM/YYYY"'),
    (new_gym_id, 'gym_name', to_jsonb(user_name || '''s Gym'));

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_settings ENABLE ROW LEVEL SECURITY;

-- Gyms: users can only see their own gym
CREATE POLICY "Users can view own gym"
  ON public.gyms FOR SELECT
  USING (
    id IN (SELECT gym_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Owner can update own gym"
  ON public.gyms FOR UPDATE
  USING (
    owner_id = auth.uid()
  );

-- Profiles: users can see profiles in their gym
CREATE POLICY "Users can view gym profiles"
  ON public.profiles FOR SELECT
  USING (
    gym_id IN (SELECT gym_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (
    user_id = auth.uid()
  );

CREATE POLICY "Owner can manage gym profiles"
  ON public.profiles FOR ALL
  USING (
    gym_id IN (
      SELECT id FROM public.gyms WHERE owner_id = auth.uid()
    )
  );

-- Staff permissions: viewable by gym members, manageable by owner
CREATE POLICY "Users can view gym permissions"
  ON public.staff_permissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = public.staff_permissions.profile_id
      AND gym_id IN (SELECT gym_id FROM public.profiles WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Owner can manage permissions"
  ON public.staff_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.gyms g
      JOIN public.profiles p ON g.id = p.gym_id
      WHERE p.id = public.staff_permissions.profile_id
      AND g.owner_id = auth.uid()
    )
  );

-- Gym settings: viewable by gym members, manageable by owner
CREATE POLICY "Users can view gym settings"
  ON public.gym_settings FOR SELECT
  USING (
    gym_id IN (SELECT gym_id FROM public.profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "Owner can manage gym settings"
  ON public.gym_settings FOR ALL
  USING (
    gym_id IN (SELECT id FROM public.gyms WHERE owner_id = auth.uid())
  );
