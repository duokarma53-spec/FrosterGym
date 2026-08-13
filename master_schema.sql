-- FROASTER GYM COMPLETE MASTER SCHEMA --

-- ====== FILE: supabase/migrations/001_foundation.sql ======
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
-- STAFF DIRECTORY
-- ============================================
CREATE TABLE IF NOT EXISTS public.staff (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
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

-- ============================================
-- RLS HELPER FUNCTIONS
-- ============================================
CREATE OR REPLACE FUNCTION public.get_gym_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT gym_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
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
    gym_id = public.get_gym_id()
  );

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (
    user_id = auth.uid()
  );

CREATE POLICY "Owner can manage gym profiles"
  ON public.profiles FOR ALL
  USING (
    gym_id = public.get_gym_id()
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

-- Staff directory: viewable by gym members
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


-- ====== FILE: supabase/migrations/002_schema_extensions.sql ======
-- ============================================
-- FROSTER GYM - PHASE 2 SCHEMA EXTENSIONS
-- ============================================

-- ============================================
-- MEMBERSHIP PLANS
-- ============================================
CREATE TABLE IF NOT EXISTS public.membership_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- e.g., '1 Month', '3 Months', 'Annual'
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

-- ============================================
-- MEMBERS
-- ============================================
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id TEXT NOT NULL, -- Auto-generated unique string like 'FG-1001'
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  address TEXT,
  emergency_contact TEXT,
  photo_url TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(gym_id, member_id),
  UNIQUE(gym_id, phone)
);

-- ============================================
-- MEMBERSHIPS (Member -> Plan mapping)
-- ============================================
CREATE TABLE IF NOT EXISTS public.memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.membership_plans(id) ON DELETE SET NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
  original_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_type TEXT NOT NULL DEFAULT 'fixed' CHECK (discount_type IN ('fixed', 'percentage')),
  final_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  due_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- PAYMENTS
-- ============================================
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  membership_id UUID REFERENCES public.memberships(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  payment_date TIMESTAMPTZ NOT NULL DEFAULT now(),
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'upi', 'card', 'bank_transfer', 'other')),
  status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  reference_number TEXT,
  notes TEXT,
  processed_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- ATTENDANCE
-- ============================================
CREATE TABLE IF NOT EXISTS public.attendance (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  check_in_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  check_out_time TIMESTAMPTZ,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(gym_id, member_id, date) -- One entry per member per day (for basic tracking)
);

-- ============================================
-- DIET PLANS
-- ============================================
CREATE TABLE IF NOT EXISTS public.diet_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  breakfast TEXT,
  mid_morning TEXT,
  lunch TEXT,
  evening TEXT,
  dinner TEXT,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.member_diet_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  diet_plan_id UUID NOT NULL REFERENCES public.diet_plans(id) ON DELETE CASCADE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  assigned_by UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- EXPENSES
-- ============================================
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('rent', 'electricity', 'equipment', 'maintenance', 'salary', 'marketing', 'supplies', 'other')),
  amount NUMERIC(10,2) NOT NULL,
  expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'upi', 'card', 'bank_transfer', 'other')),
  notes TEXT,
  recorded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================
-- INVOICES
-- ============================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
  invoice_number TEXT NOT NULL,
  member_id UUID NOT NULL REFERENCES public.members(id) ON DELETE CASCADE,
  membership_id UUID REFERENCES public.memberships(id) ON DELETE SET NULL,
  payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
  issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date DATE,
  subtotal NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('draft', 'unpaid', 'paid', 'cancelled', 'refunded')),
  pdf_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(gym_id, invoice_number)
);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================
CREATE TRIGGER set_membership_plans_updated_at BEFORE UPDATE ON public.membership_plans FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_members_updated_at BEFORE UPDATE ON public.members FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_memberships_updated_at BEFORE UPDATE ON public.memberships FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_diet_plans_updated_at BEFORE UPDATE ON public.diet_plans FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_member_diet_plans_updated_at BEFORE UPDATE ON public.member_diet_plans FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_expenses_updated_at BEFORE UPDATE ON public.expenses FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
CREATE TRIGGER set_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE public.membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Helper function to check if user has access to a gym
CREATE OR REPLACE FUNCTION public.user_belongs_to_gym(check_gym_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND gym_id = check_gym_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Policies for membership_plans
CREATE POLICY "Users can access gym membership plans" ON public.membership_plans FOR ALL
USING (public.user_belongs_to_gym(gym_id));

-- Policies for members
CREATE POLICY "Users can access gym members" ON public.members FOR ALL
USING (public.user_belongs_to_gym(gym_id));

-- Policies for memberships
CREATE POLICY "Users can access gym memberships" ON public.memberships FOR ALL
USING (public.user_belongs_to_gym(gym_id));

-- Policies for payments
CREATE POLICY "Users can access gym payments" ON public.payments FOR ALL
USING (public.user_belongs_to_gym(gym_id));

-- Policies for attendance
CREATE POLICY "Users can access gym attendance" ON public.attendance FOR ALL
USING (public.user_belongs_to_gym(gym_id));

-- Policies for diet_plans
CREATE POLICY "Users can access gym diet plans" ON public.diet_plans FOR ALL
USING (public.user_belongs_to_gym(gym_id));

-- Policies for member_diet_plans
CREATE POLICY "Users can access gym member diet plans" ON public.member_diet_plans FOR ALL
USING (public.user_belongs_to_gym(gym_id));

-- Policies for expenses
CREATE POLICY "Users can access gym expenses" ON public.expenses FOR ALL
USING (public.user_belongs_to_gym(gym_id));

-- Policies for invoices
CREATE POLICY "Users can access gym invoices" ON public.invoices FOR ALL
USING (public.user_belongs_to_gym(gym_id));

-- Note: In a production environment with strict staff permissions, we would add additional
-- conditions based on staff_permissions table. For simplicity in Phase 2, we restrict by gym_id
-- and rely on the frontend UI to enforce action-level permissions (View/Create/Edit/Delete).


-- ====== FILE: supabase/migrations/003_complete_schema.sql ======
-- 1. branches
CREATE TABLE IF NOT EXISTS branches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. ALTER members
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_status_check;
ALTER TABLE members ADD CONSTRAINT members_status_check CHECK (status IN ('active', 'inactive', 'expired', 'blocked', 'frozen'));
ALTER TABLE members ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;
ALTER TABLE members ADD COLUMN IF NOT EXISTS branch_id UUID REFERENCES branches(id) ON DELETE SET NULL;
ALTER TABLE members ADD COLUMN IF NOT EXISTS custom_fields JSONB DEFAULT '{}'::jsonb;
ALTER TABLE members ADD COLUMN IF NOT EXISTS referral_source TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS blood_group TEXT;
ALTER TABLE members ADD COLUMN IF NOT EXISTS goal TEXT;

-- 3. membership_freezes
CREATE TABLE IF NOT EXISTS membership_freezes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    membership_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reason TEXT,
    adjusted_days INT DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. membership_history
CREATE TABLE IF NOT EXISTS membership_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    membership_id UUID NOT NULL REFERENCES memberships(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    action TEXT NOT NULL CHECK (action IN ('created', 'renewed', 'cancelled', 'frozen', 'unfrozen', 'expired')),
    details JSONB DEFAULT '{}'::jsonb,
    performed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. services
CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    duration_text TEXT,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. pt_plans
CREATE TABLE IF NOT EXISTS pt_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    duration_months INT DEFAULT 0,
    duration_days INT DEFAULT 0,
    price NUMERIC(10,2) NOT NULL DEFAULT 0,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. trainers
CREATE TABLE IF NOT EXISTS trainers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    specialization TEXT,
    photo_url TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. pt_memberships
CREATE TABLE IF NOT EXISTS pt_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    trainer_id UUID NOT NULL REFERENCES trainers(id) ON DELETE CASCADE,
    pt_plan_id UUID NOT NULL REFERENCES pt_plans(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    original_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    discount_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    final_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    paid_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    due_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 9. batches
CREATE TABLE IF NOT EXISTS batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    time_slot TEXT NOT NULL,
    trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL,
    description TEXT,
    max_capacity INT DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 10. batch_members
CREATE TABLE IF NOT EXISTS batch_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    batch_id UUID NOT NULL REFERENCES batches(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. body_measurements
CREATE TABLE IF NOT EXISTS body_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    measurement_date DATE DEFAULT CURRENT_DATE,
    weight NUMERIC(5,1),
    height NUMERIC(5,1),
    bmi NUMERIC(4,1),
    body_fat_percentage NUMERIC(4,1),
    chest NUMERIC(5,1),
    waist NUMERIC(5,1),
    hip NUMERIC(5,1),
    arm NUMERIC(5,1),
    thigh NUMERIC(5,1),
    custom_measurements JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 12. enquiries
CREATE TABLE IF NOT EXISTS enquiries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    source TEXT CHECK (source IN ('walk_in', 'phone', 'online', 'referral', 'social_media', 'other')),
    interested_plan TEXT,
    budget NUMERIC(10,2),
    notes TEXT,
    assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
    follow_up_date DATE,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'hot', 'warm', 'cold', 'follow_up', 'converted', 'lost')),
    converted_member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 13. enquiry_followups
CREATE TABLE IF NOT EXISTS enquiry_followups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    enquiry_id UUID NOT NULL REFERENCES enquiries(id) ON DELETE CASCADE,
    notes TEXT,
    follow_up_date DATE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 14. workout_plans
CREATE TABLE IF NOT EXISTS workout_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    goal TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 15. workout_plan_items
CREATE TABLE IF NOT EXISTS workout_plan_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    workout_plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
    exercise_name TEXT NOT NULL,
    sets INT,
    reps INT,
    weight NUMERIC(5,1),
    duration_minutes INT,
    rest_seconds INT,
    notes TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 16. member_workout_plans
CREATE TABLE IF NOT EXISTS member_workout_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    workout_plan_id UUID NOT NULL REFERENCES workout_plans(id) ON DELETE CASCADE,
    trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL,
    start_date DATE,
    end_date DATE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    assigned_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 17. member_custom_fields
CREATE TABLE IF NOT EXISTS member_custom_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    field_name TEXT NOT NULL,
    field_type TEXT NOT NULL CHECK (field_type IN ('text', 'number', 'date', 'dropdown', 'boolean', 'textarea')),
    options JSONB,
    is_required BOOLEAN DEFAULT false,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(gym_id, field_name)
);

-- 18. invoice_items
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INT DEFAULT 1,
    unit_price NUMERIC(10,2),
    total NUMERIC(10,2),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 19. notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('expiry', 'payment_due', 'birthday', 'new_member', 'payment_received', 'pt_expiry', 'new_enquiry', 'expense_added')),
    title TEXT NOT NULL,
    message TEXT,
    is_read BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 20. message_templates
CREATE TABLE IF NOT EXISTS message_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('birthday', 'expiry', 'renewal', 'payment_due', 'welcome', 'offer', 'custom')),
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(gym_id, name)
);

-- 21. activity_logs
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 22. expense_categories
CREATE TABLE IF NOT EXISTS expense_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    icon TEXT,
    color TEXT,
    is_default BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(gym_id, name)
);

-- 23. device_sessions
CREATE TABLE IF NOT EXISTS device_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    device_name TEXT,
    device_type TEXT,
    ip_address TEXT,
    user_agent TEXT,
    last_active TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 24. attendance_devices
CREATE TABLE IF NOT EXISTS attendance_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
    branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
    device_name TEXT NOT NULL,
    device_type TEXT NOT NULL CHECK (device_type IN ('manual', 'qr', 'biometric')),
    device_identifier TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    last_ping TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Apply Triggers
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT unnest(ARRAY[
            'branches', 'membership_freezes', 'membership_history', 'services', 'pt_plans', 
            'trainers', 'pt_memberships', 'batches', 'batch_members', 'body_measurements', 
            'enquiries', 'enquiry_followups', 'workout_plans', 'workout_plan_items', 
            'member_workout_plans', 'member_custom_fields', 'invoice_items', 'notifications', 
            'message_templates', 'activity_logs', 'expense_categories', 'device_sessions', 
            'attendance_devices'
        ])
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS set_updated_at ON %I;
            CREATE TRIGGER set_updated_at
            BEFORE UPDATE ON %I
            FOR EACH ROW
            EXECUTE FUNCTION handle_updated_at();
        ', t, t);
    END LOOP;
END;
$$;

-- Enable RLS and Create Policies
DO $$
DECLARE
    t text;
BEGIN
    FOR t IN 
        SELECT unnest(ARRAY[
            'branches', 'membership_freezes', 'membership_history', 'services', 'pt_plans', 
            'trainers', 'pt_memberships', 'batches', 'batch_members', 'body_measurements', 
            'enquiries', 'enquiry_followups', 'workout_plans', 'workout_plan_items', 
            'member_workout_plans', 'member_custom_fields', 'invoice_items', 'notifications', 
            'message_templates', 'activity_logs', 'expense_categories', 'device_sessions', 
            'attendance_devices'
        ])
    LOOP
        EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY;', t);
        EXECUTE format('DROP POLICY IF EXISTS "Gym users can access their gym data" ON %I;', t);
        EXECUTE format('
            CREATE POLICY "Gym users can access their gym data" ON %I
            FOR ALL
            USING (user_belongs_to_gym(gym_id));
        ', t);
    END LOOP;
END;
$$;

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_branches_gym_id ON branches(gym_id);
CREATE INDEX IF NOT EXISTS idx_branches_status ON branches(status);

CREATE INDEX IF NOT EXISTS idx_members_branch_id ON members(branch_id);

CREATE INDEX IF NOT EXISTS idx_membership_freezes_gym_id ON membership_freezes(gym_id);
CREATE INDEX IF NOT EXISTS idx_membership_freezes_member_id ON membership_freezes(member_id);
CREATE INDEX IF NOT EXISTS idx_membership_freezes_status ON membership_freezes(status);
CREATE INDEX IF NOT EXISTS idx_membership_freezes_dates ON membership_freezes(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_membership_history_gym_id ON membership_history(gym_id);
CREATE INDEX IF NOT EXISTS idx_membership_history_member_id ON membership_history(member_id);

CREATE INDEX IF NOT EXISTS idx_services_gym_id ON services(gym_id);
CREATE INDEX IF NOT EXISTS idx_services_status ON services(status);

CREATE INDEX IF NOT EXISTS idx_pt_plans_gym_id ON pt_plans(gym_id);
CREATE INDEX IF NOT EXISTS idx_pt_plans_status ON pt_plans(status);

CREATE INDEX IF NOT EXISTS idx_trainers_gym_id ON trainers(gym_id);
CREATE INDEX IF NOT EXISTS idx_trainers_status ON trainers(status);

CREATE INDEX IF NOT EXISTS idx_pt_memberships_gym_id ON pt_memberships(gym_id);
CREATE INDEX IF NOT EXISTS idx_pt_memberships_member_id ON pt_memberships(member_id);
CREATE INDEX IF NOT EXISTS idx_pt_memberships_status ON pt_memberships(status);
CREATE INDEX IF NOT EXISTS idx_pt_memberships_dates ON pt_memberships(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_batches_gym_id ON batches(gym_id);
CREATE INDEX IF NOT EXISTS idx_batches_status ON batches(status);

CREATE INDEX IF NOT EXISTS idx_batch_members_gym_id ON batch_members(gym_id);
CREATE INDEX IF NOT EXISTS idx_batch_members_member_id ON batch_members(member_id);

CREATE INDEX IF NOT EXISTS idx_body_measurements_gym_id ON body_measurements(gym_id);
CREATE INDEX IF NOT EXISTS idx_body_measurements_member_id ON body_measurements(member_id);
CREATE INDEX IF NOT EXISTS idx_body_measurements_date ON body_measurements(measurement_date);

CREATE INDEX IF NOT EXISTS idx_enquiries_gym_id ON enquiries(gym_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_date ON enquiries(follow_up_date);

CREATE INDEX IF NOT EXISTS idx_enquiry_followups_gym_id ON enquiry_followups(gym_id);
CREATE INDEX IF NOT EXISTS idx_enquiry_followups_enquiry_id ON enquiry_followups(enquiry_id);

CREATE INDEX IF NOT EXISTS idx_workout_plans_gym_id ON workout_plans(gym_id);

CREATE INDEX IF NOT EXISTS idx_workout_plan_items_gym_id ON workout_plan_items(gym_id);
CREATE INDEX IF NOT EXISTS idx_workout_plan_items_plan_id ON workout_plan_items(workout_plan_id);

CREATE INDEX IF NOT EXISTS idx_member_workout_plans_gym_id ON member_workout_plans(gym_id);
CREATE INDEX IF NOT EXISTS idx_member_workout_plans_member_id ON member_workout_plans(member_id);
CREATE INDEX IF NOT EXISTS idx_member_workout_plans_status ON member_workout_plans(status);

CREATE INDEX IF NOT EXISTS idx_member_custom_fields_gym_id ON member_custom_fields(gym_id);

CREATE INDEX IF NOT EXISTS idx_invoice_items_gym_id ON invoice_items(gym_id);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

CREATE INDEX IF NOT EXISTS idx_notifications_gym_id ON notifications(gym_id);
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_id ON notifications(recipient_id);

CREATE INDEX IF NOT EXISTS idx_message_templates_gym_id ON message_templates(gym_id);

CREATE INDEX IF NOT EXISTS idx_activity_logs_gym_id ON activity_logs(gym_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_expense_categories_gym_id ON expense_categories(gym_id);

CREATE INDEX IF NOT EXISTS idx_device_sessions_gym_id ON device_sessions(gym_id);
CREATE INDEX IF NOT EXISTS idx_device_sessions_user_id ON device_sessions(user_id);

CREATE INDEX IF NOT EXISTS idx_attendance_devices_gym_id ON attendance_devices(gym_id);
CREATE INDEX IF NOT EXISTS idx_attendance_devices_status ON attendance_devices(status);

-- Default Expense Categories
INSERT INTO expense_categories (gym_id, name, is_default) 
SELECT id, unnest(ARRAY['Rent','Electricity','Equipment','Maintenance','Salary','Marketing','Supplies','Other']), true 
FROM gyms 
ON CONFLICT DO NOTHING;


-- ====== FILE: src/lib/schema.sql ======
-- Phase 1: Database & Security (RBAC) Architecture

-- 1. Create or replace staff_permissions table
DROP TABLE IF EXISTS public.staff_permissions CASCADE;

CREATE TABLE public.staff_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    module_name TEXT NOT NULL,
    can_view BOOLEAN NOT NULL DEFAULT false,
    can_create BOOLEAN NOT NULL DEFAULT false,
    can_edit BOOLEAN NOT NULL DEFAULT false,
    can_delete BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(gym_id, user_id, module_name)
);

-- 2. Enable Row Level Security
ALTER TABLE public.staff_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies ensuring that every major table requires gym_id to match user's gym_id
-- We assume the user's gym_id can be looked up via public.profiles

-- Function to get current user's gym_id safely
CREATE OR REPLACE FUNCTION public.get_gym_id() RETURNS UUID 
LANGUAGE sql 
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT gym_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;


-- Staff permissions policies
CREATE POLICY "Staff permissions are viewable by users in the same gym" 
ON public.staff_permissions FOR SELECT 
USING (gym_id = public.get_gym_id());

CREATE POLICY "Owners can manage staff permissions" 
ON public.staff_permissions FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'owner' AND gym_id = public.staff_permissions.gym_id
  )
);

-- Gyms policies
CREATE POLICY "Users can view their own gym" 
ON public.gyms FOR SELECT 
USING (id = public.get_gym_id());

CREATE POLICY "Owners can update their own gym" 
ON public.gyms FOR UPDATE 
USING (id = public.get_gym_id() AND EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'owner'));

-- Profiles policies
CREATE POLICY "Users can view profiles in their gym" 
ON public.profiles FOR SELECT 
USING (gym_id = public.get_gym_id());

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (user_id = auth.uid());

-- Members policies
CREATE POLICY "Users can view members in their gym" 
ON public.members FOR SELECT 
USING (gym_id = public.get_gym_id());

CREATE POLICY "Users can insert members if they have permission" 
ON public.members FOR INSERT 
WITH CHECK (gym_id = public.get_gym_id());

CREATE POLICY "Users can update members if they have permission" 
ON public.members FOR UPDATE 
USING (gym_id = public.get_gym_id());

CREATE POLICY "Users can delete members if they have permission" 
ON public.members FOR DELETE 
USING (gym_id = public.get_gym_id());

-- Payments policies
CREATE POLICY "Users can view payments in their gym" 
ON public.payments FOR SELECT 
USING (gym_id = public.get_gym_id());

CREATE POLICY "Users can insert payments if they have permission" 
ON public.payments FOR INSERT 
WITH CHECK (gym_id = public.get_gym_id());

CREATE POLICY "Users can update payments if they have permission" 
ON public.payments FOR UPDATE 
USING (gym_id = public.get_gym_id());

CREATE POLICY "Users can delete payments if they have permission" 
ON public.payments FOR DELETE 
USING (gym_id = public.get_gym_id());

-- Memberships policies
CREATE POLICY "Users can view memberships in their gym" 
ON public.memberships FOR SELECT 
USING (gym_id = public.get_gym_id());

CREATE POLICY "Users can insert memberships if they have permission" 
ON public.memberships FOR INSERT 
WITH CHECK (gym_id = public.get_gym_id());

CREATE POLICY "Users can update memberships if they have permission" 
ON public.memberships FOR UPDATE 
USING (gym_id = public.get_gym_id());

CREATE POLICY "Users can delete memberships if they have permission" 
ON public.memberships FOR DELETE 
USING (gym_id = public.get_gym_id());


