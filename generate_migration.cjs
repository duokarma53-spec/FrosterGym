const fs = require('fs');
const tablesToProtect = [
  { table: 'members', module: 'members' },
  { table: 'member_custom_fields', module: 'members' },
  { table: 'memberships', module: 'memberships' },
  { table: 'membership_plans', module: 'memberships' },
  { table: 'membership_freezes', module: 'memberships' },
  { table: 'membership_history', module: 'memberships' },
  { table: 'payments', module: 'payments' },
  { table: 'invoices', module: 'payments' },
  { table: 'invoice_items', module: 'payments' },
  { table: 'expenses', module: 'expenses' },
  { table: 'expense_categories', module: 'expenses' },
  { table: 'attendance', module: 'attendance' },
  { table: 'attendance_devices', module: 'attendance' },
  { table: 'pt_memberships', module: 'pt' },
  { table: 'pt_plans', module: 'pt' },
  { table: 'trainers', module: 'pt' },
  { table: 'diet_plans', module: 'diet-plans' },
  { table: 'member_diet_plans', module: 'diet-plans' },
  { table: 'body_measurements', module: 'members' },
  { table: 'batches', module: 'pt' },
  { table: 'batch_members', module: 'pt' },
  { table: 'enquiries', module: 'members' },
  { table: 'enquiry_followups', module: 'members' },
  { table: 'workout_plans', module: 'pt' },
  { table: 'workout_plan_items', module: 'pt' },
  { table: 'member_workout_plans', module: 'pt' },
  { table: 'message_templates', module: 'settings' },
  { table: 'gym_settings', module: 'settings' },
  { table: 'branches', module: 'settings' },
  { table: 'services', module: 'settings' }
];

let sql = `
-- ==========================================
-- 1. HELPER FUNCTIONS
-- ==========================================

-- Check if user is owner
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'owner'
  );
$$;

-- Check staff permissions
CREATE OR REPLACE FUNCTION public.has_staff_permission(req_module text, req_action text DEFAULT 'view')
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_role text;
  v_email text;
  v_perm_row RECORD;
  v_in_array boolean;
BEGIN
  -- Get user profile role and email
  SELECT role, email INTO v_role, v_email
  FROM public.profiles
  WHERE user_id = auth.uid()
  LIMIT 1;

  IF v_role = 'owner' THEN
    RETURN true;
  END IF;

  IF v_role = 'staff' THEN
    -- 1. Check staff_permissions table (granular)
    SELECT * INTO v_perm_row 
    FROM public.staff_permissions 
    WHERE user_id = auth.uid() AND LOWER(module_name) = LOWER(req_module)
    LIMIT 1;

    IF FOUND THEN
      IF req_action = 'view' AND v_perm_row.can_view THEN RETURN true; END IF;
      IF req_action = 'create' AND v_perm_row.can_create THEN RETURN true; END IF;
      IF req_action = 'edit' AND v_perm_row.can_edit THEN RETURN true; END IF;
      IF req_action = 'delete' AND v_perm_row.can_delete THEN RETURN true; END IF;
    END IF;

    -- 2. Fallback to staff.permissions array
    IF v_email IS NOT NULL THEN
      SELECT (LOWER(req_module) = ANY(SELECT LOWER(p) FROM unnest(permissions) AS p)) INTO v_in_array
      FROM public.staff
      WHERE email = v_email
      LIMIT 1;
      
      IF v_in_array THEN
        RETURN true;
      END IF;
    END IF;
  END IF;

  RETURN false;
END;
$$;

-- ==========================================
-- 2. PRIVILEGE ESCALATION TRIGGERS
-- ==========================================

-- Prevent modifying profile role/gym_id
CREATE OR REPLACE FUNCTION public.prevent_profile_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Permission denied: Cannot modify role.';
    END IF;
    IF NEW.gym_id IS DISTINCT FROM OLD.gym_id THEN
      RAISE EXCEPTION 'Permission denied: Cannot modify gym_id.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_escalation();

-- Prevent modifying staff role/permissions
CREATE OR REPLACE FUNCTION public.prevent_staff_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    IF NEW.permissions IS DISTINCT FROM OLD.permissions THEN
      RAISE EXCEPTION 'Permission denied: Cannot modify staff permissions.';
    END IF;
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Permission denied: Cannot modify staff role.';
    END IF;
    IF NEW.gym_id IS DISTINCT FROM OLD.gym_id THEN
      RAISE EXCEPTION 'Permission denied: Cannot modify gym_id.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_staff_escalation ON public.staff;
CREATE TRIGGER trg_prevent_staff_escalation
BEFORE UPDATE ON public.staff
FOR EACH ROW EXECUTE FUNCTION public.prevent_staff_escalation();

-- ==========================================
-- 3. PROFILES, STAFF, AND STAFF_PERMISSIONS
-- ==========================================

-- PROFILES
DROP POLICY IF EXISTS "Users can view profiles in their gym" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Owners can manage gym profiles" ON public.profiles;

CREATE POLICY "Users can view profiles in their gym" ON public.profiles
FOR SELECT USING (gym_id = public.get_gym_id());

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Owners can manage gym profiles" ON public.profiles
FOR ALL USING (gym_id = public.get_gym_id() AND public.is_owner());

-- STAFF
DROP POLICY IF EXISTS "Users can view staff in their gym" ON public.staff;
DROP POLICY IF EXISTS "Users can insert staff in their gym" ON public.staff;
DROP POLICY IF EXISTS "Users can update staff in their gym" ON public.staff;
DROP POLICY IF EXISTS "Users can delete staff in their gym" ON public.staff;

CREATE POLICY "Users can view staff in their gym" ON public.staff
FOR SELECT USING (gym_id = public.get_gym_id());

CREATE POLICY "Staff can insert staff" ON public.staff
FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('staff', 'create'));

CREATE POLICY "Staff can update staff" ON public.staff
FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('staff', 'edit'));

CREATE POLICY "Staff can delete staff" ON public.staff
FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('staff', 'delete'));

-- STAFF_PERMISSIONS
-- Handled properly by schema natively.

-- ==========================================
-- 4. OPERATIONAL TABLES
-- ==========================================
\`;

tablesToProtect.forEach(t => {
  sql += \`
-- Table: \${t.table}
DROP POLICY IF EXISTS "Users can access gym \${t.table}" ON public.\${t.table};
DROP POLICY IF EXISTS "Users can access gym members" ON public.\${t.table};
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.\${t.table};
DROP POLICY IF EXISTS "Users can view \${t.table.replace('_', ' ')} in their gym" ON public.\${t.table};
DROP POLICY IF EXISTS "Users can insert \${t.table.replace('_', ' ')} if they have permission" ON public.\${t.table};
DROP POLICY IF EXISTS "Users can update \${t.table.replace('_', ' ')} if they have permission" ON public.\${t.table};
DROP POLICY IF EXISTS "Users can delete \${t.table.replace('_', ' ')} if they have permission" ON public.\${t.table};

CREATE POLICY "Staff can view \${t.table}" ON public.\${t.table} FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('\${t.module}', 'view'));
CREATE POLICY "Staff can insert \${t.table}" ON public.\${t.table} FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('\${t.module}', 'create'));
CREATE POLICY "Staff can update \${t.table}" ON public.\${t.table} FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('\${t.module}', 'edit'));
CREATE POLICY "Staff can delete \${t.table}" ON public.\${t.table} FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('\${t.module}', 'delete'));
\`;
});

fs.writeFileSync('supabase/migrations/20260827_rls_security_fix.sql', sql);
console.log("Migration generated successfully!");