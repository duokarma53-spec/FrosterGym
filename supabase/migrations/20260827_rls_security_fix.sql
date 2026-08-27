-- ==========================================
-- 1. HELPER FUNCTIONS
-- ==========================================

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
  SELECT role, email INTO v_role, v_email FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
  IF v_role = 'owner' THEN RETURN true; END IF;
  IF v_role = 'staff' THEN
    SELECT * INTO v_perm_row FROM public.staff_permissions WHERE user_id = auth.uid() AND LOWER(module_name) = LOWER(req_module) LIMIT 1;
    IF FOUND THEN
      IF req_action = 'view' AND v_perm_row.can_view THEN RETURN true; END IF;
      IF req_action = 'create' AND v_perm_row.can_create THEN RETURN true; END IF;
      IF req_action = 'edit' AND v_perm_row.can_edit THEN RETURN true; END IF;
      IF req_action = 'delete' AND v_perm_row.can_delete THEN RETURN true; END IF;
    END IF;
    IF v_email IS NOT NULL THEN
      SELECT (LOWER(req_module) = ANY(SELECT LOWER(p) FROM unnest(permissions) AS p)) INTO v_in_array FROM public.staff WHERE email = v_email LIMIT 1;
      IF v_in_array THEN RETURN true; END IF;
    END IF;
  END IF;
  RETURN false;
END;
$$;

-- ==========================================
-- 2. PRIVILEGE ESCALATION TRIGGERS
-- ==========================================

CREATE OR REPLACE FUNCTION public.prevent_profile_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN RAISE EXCEPTION 'Permission denied: Cannot modify role.'; END IF;
    IF NEW.gym_id IS DISTINCT FROM OLD.gym_id THEN RAISE EXCEPTION 'Permission denied: Cannot modify gym_id.'; END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_prevent_profile_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_escalation BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.prevent_profile_escalation();

CREATE OR REPLACE FUNCTION public.prevent_staff_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.is_owner() THEN
    IF NEW.permissions IS DISTINCT FROM OLD.permissions THEN RAISE EXCEPTION 'Permission denied: Cannot modify permissions.'; END IF;
    IF NEW.role IS DISTINCT FROM OLD.role THEN RAISE EXCEPTION 'Permission denied: Cannot modify role.'; END IF;
    IF NEW.gym_id IS DISTINCT FROM OLD.gym_id THEN RAISE EXCEPTION 'Permission denied: Cannot modify gym_id.'; END IF;
  END IF;
  RETURN NEW;
END;
$$;
DROP TRIGGER IF EXISTS trg_prevent_staff_escalation ON public.staff;
CREATE TRIGGER trg_prevent_staff_escalation BEFORE UPDATE ON public.staff FOR EACH ROW EXECUTE FUNCTION public.prevent_staff_escalation();

-- ==========================================
-- 3. PROFILES AND STAFF
-- ==========================================

DROP POLICY IF EXISTS "Users can view profiles in their gym" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Owners can manage gym profiles" ON public.profiles;
CREATE POLICY "Users can view profiles in their gym" ON public.profiles FOR SELECT USING (gym_id = public.get_gym_id());
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Owners can manage gym profiles" ON public.profiles FOR ALL USING (gym_id = public.get_gym_id() AND public.is_owner());

DROP POLICY IF EXISTS "Users can view staff in their gym" ON public.staff;
DROP POLICY IF EXISTS "Users can insert staff in their gym" ON public.staff;
DROP POLICY IF EXISTS "Users can update staff in their gym" ON public.staff;
DROP POLICY IF EXISTS "Users can delete staff in their gym" ON public.staff;
CREATE POLICY "Users can view staff in their gym" ON public.staff FOR SELECT USING (gym_id = public.get_gym_id());
CREATE POLICY "Staff can insert staff" ON public.staff FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('staff', 'create'));
CREATE POLICY "Staff can update staff" ON public.staff FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('staff', 'edit'));
CREATE POLICY "Staff can delete staff" ON public.staff FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('staff', 'delete'));


-- ==========================================
-- 4. OPERATIONAL TABLES
-- ==========================================

DROP POLICY IF EXISTS "Users can access gym members" ON public.members;
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.members;
DROP POLICY IF EXISTS "Users can view members in their gym" ON public.members;
DROP POLICY IF EXISTS "Users can insert members if they have permission" ON public.members;
DROP POLICY IF EXISTS "Users can update members if they have permission" ON public.members;
DROP POLICY IF EXISTS "Users can delete members if they have permission" ON public.members;

CREATE POLICY "Staff can view members" ON public.members FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('members', 'view'));
CREATE POLICY "Staff can insert members" ON public.members FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('members', 'create'));
CREATE POLICY "Staff can update members" ON public.members FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('members', 'edit'));
CREATE POLICY "Staff can delete members" ON public.members FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('members', 'delete'));

DROP POLICY IF EXISTS "Users can access gym member_custom_fields" ON public.member_custom_fields;
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.member_custom_fields;
DROP POLICY IF EXISTS "Users can view member custom fields in their gym" ON public.member_custom_fields;
DROP POLICY IF EXISTS "Users can insert member custom fields if they have permission" ON public.member_custom_fields;
DROP POLICY IF EXISTS "Users can update member custom fields if they have permission" ON public.member_custom_fields;
DROP POLICY IF EXISTS "Users can delete member custom fields if they have permission" ON public.member_custom_fields;

CREATE POLICY "Staff can view member_custom_fields" ON public.member_custom_fields FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('members', 'view'));
CREATE POLICY "Staff can insert member_custom_fields" ON public.member_custom_fields FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('members', 'create'));
CREATE POLICY "Staff can update member_custom_fields" ON public.member_custom_fields FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('members', 'edit'));
CREATE POLICY "Staff can delete member_custom_fields" ON public.member_custom_fields FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('members', 'delete'));

DROP POLICY IF EXISTS "Users can access gym memberships" ON public.memberships;
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.memberships;
DROP POLICY IF EXISTS "Users can view memberships in their gym" ON public.memberships;
DROP POLICY IF EXISTS "Users can insert memberships if they have permission" ON public.memberships;
DROP POLICY IF EXISTS "Users can update memberships if they have permission" ON public.memberships;
DROP POLICY IF EXISTS "Users can delete memberships if they have permission" ON public.memberships;

CREATE POLICY "Staff can view memberships" ON public.memberships FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('memberships', 'view'));
CREATE POLICY "Staff can insert memberships" ON public.memberships FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('memberships', 'create'));
CREATE POLICY "Staff can update memberships" ON public.memberships FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('memberships', 'edit'));
CREATE POLICY "Staff can delete memberships" ON public.memberships FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('memberships', 'delete'));

DROP POLICY IF EXISTS "Users can access gym membership_plans" ON public.membership_plans;
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.membership_plans;
DROP POLICY IF EXISTS "Users can view membership plans in their gym" ON public.membership_plans;
DROP POLICY IF EXISTS "Users can insert membership plans if they have permission" ON public.membership_plans;
DROP POLICY IF EXISTS "Users can update membership plans if they have permission" ON public.membership_plans;
DROP POLICY IF EXISTS "Users can delete membership plans if they have permission" ON public.membership_plans;

CREATE POLICY "Staff can view membership_plans" ON public.membership_plans FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('memberships', 'view'));
CREATE POLICY "Staff can insert membership_plans" ON public.membership_plans FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('memberships', 'create'));
CREATE POLICY "Staff can update membership_plans" ON public.membership_plans FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('memberships', 'edit'));
CREATE POLICY "Staff can delete membership_plans" ON public.membership_plans FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('memberships', 'delete'));

DROP POLICY IF EXISTS "Users can access gym membership_freezes" ON public.membership_freezes;
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.membership_freezes;
DROP POLICY IF EXISTS "Users can view membership freezes in their gym" ON public.membership_freezes;
DROP POLICY IF EXISTS "Users can insert membership freezes if they have permission" ON public.membership_freezes;
DROP POLICY IF EXISTS "Users can update membership freezes if they have permission" ON public.membership_freezes;
DROP POLICY IF EXISTS "Users can delete membership freezes if they have permission" ON public.membership_freezes;

CREATE POLICY "Staff can view membership_freezes" ON public.membership_freezes FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('memberships', 'view'));
CREATE POLICY "Staff can insert membership_freezes" ON public.membership_freezes FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('memberships', 'create'));
CREATE POLICY "Staff can update membership_freezes" ON public.membership_freezes FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('memberships', 'edit'));
CREATE POLICY "Staff can delete membership_freezes" ON public.membership_freezes FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('memberships', 'delete'));

DROP POLICY IF EXISTS "Users can access gym membership_history" ON public.membership_history;
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.membership_history;
DROP POLICY IF EXISTS "Users can view membership history in their gym" ON public.membership_history;
DROP POLICY IF EXISTS "Users can insert membership history if they have permission" ON public.membership_history;
DROP POLICY IF EXISTS "Users can update membership history if they have permission" ON public.membership_history;
DROP POLICY IF EXISTS "Users can delete membership history if they have permission" ON public.membership_history;

CREATE POLICY "Staff can view membership_history" ON public.membership_history FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('memberships', 'view'));
CREATE POLICY "Staff can insert membership_history" ON public.membership_history FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('memberships', 'create'));
CREATE POLICY "Staff can update membership_history" ON public.membership_history FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('memberships', 'edit'));
CREATE POLICY "Staff can delete membership_history" ON public.membership_history FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('memberships', 'delete'));

DROP POLICY IF EXISTS "Users can access gym payments" ON public.payments;
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.payments;
DROP POLICY IF EXISTS "Users can view payments in their gym" ON public.payments;
DROP POLICY IF EXISTS "Users can insert payments if they have permission" ON public.payments;
DROP POLICY IF EXISTS "Users can update payments if they have permission" ON public.payments;
DROP POLICY IF EXISTS "Users can delete payments if they have permission" ON public.payments;

CREATE POLICY "Staff can view payments" ON public.payments FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('payments', 'view'));
CREATE POLICY "Staff can insert payments" ON public.payments FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('payments', 'create'));
CREATE POLICY "Staff can update payments" ON public.payments FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('payments', 'edit'));
CREATE POLICY "Staff can delete payments" ON public.payments FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('payments', 'delete'));

DROP POLICY IF EXISTS "Users can access gym invoices" ON public.invoices;
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.invoices;
DROP POLICY IF EXISTS "Users can view invoices in their gym" ON public.invoices;
DROP POLICY IF EXISTS "Users can insert invoices if they have permission" ON public.invoices;
DROP POLICY IF EXISTS "Users can update invoices if they have permission" ON public.invoices;
DROP POLICY IF EXISTS "Users can delete invoices if they have permission" ON public.invoices;

CREATE POLICY "Staff can view invoices" ON public.invoices FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('payments', 'view'));
CREATE POLICY "Staff can insert invoices" ON public.invoices FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('payments', 'create'));
CREATE POLICY "Staff can update invoices" ON public.invoices FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('payments', 'edit'));
CREATE POLICY "Staff can delete invoices" ON public.invoices FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('payments', 'delete'));

DROP POLICY IF EXISTS "Users can access gym invoice_items" ON public.invoice_items;
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can view invoice items in their gym" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can insert invoice items if they have permission" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can update invoice items if they have permission" ON public.invoice_items;
DROP POLICY IF EXISTS "Users can delete invoice items if they have permission" ON public.invoice_items;

CREATE POLICY "Staff can view invoice_items" ON public.invoice_items FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('payments', 'view'));
CREATE POLICY "Staff can insert invoice_items" ON public.invoice_items FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('payments', 'create'));
CREATE POLICY "Staff can update invoice_items" ON public.invoice_items FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('payments', 'edit'));
CREATE POLICY "Staff can delete invoice_items" ON public.invoice_items FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('payments', 'delete'));

DROP POLICY IF EXISTS "Users can access gym expenses" ON public.expenses;
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.expenses;
DROP POLICY IF EXISTS "Users can view expenses in their gym" ON public.expenses;
DROP POLICY IF EXISTS "Users can insert expenses if they have permission" ON public.expenses;
DROP POLICY IF EXISTS "Users can update expenses if they have permission" ON public.expenses;
DROP POLICY IF EXISTS "Users can delete expenses if they have permission" ON public.expenses;

CREATE POLICY "Staff can view expenses" ON public.expenses FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('expenses', 'view'));
CREATE POLICY "Staff can insert expenses" ON public.expenses FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('expenses', 'create'));
CREATE POLICY "Staff can update expenses" ON public.expenses FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('expenses', 'edit'));
CREATE POLICY "Staff can delete expenses" ON public.expenses FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('expenses', 'delete'));

DROP POLICY IF EXISTS "Users can access gym expense_categories" ON public.expense_categories;
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.expense_categories;
DROP POLICY IF EXISTS "Users can view expense categories in their gym" ON public.expense_categories;
DROP POLICY IF EXISTS "Users can insert expense categories if they have permission" ON public.expense_categories;
DROP POLICY IF EXISTS "Users can update expense categories if they have permission" ON public.expense_categories;
DROP POLICY IF EXISTS "Users can delete expense categories if they have permission" ON public.expense_categories;

CREATE POLICY "Staff can view expense_categories" ON public.expense_categories FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('expenses', 'view'));
CREATE POLICY "Staff can insert expense_categories" ON public.expense_categories FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('expenses', 'create'));
CREATE POLICY "Staff can update expense_categories" ON public.expense_categories FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('expenses', 'edit'));
CREATE POLICY "Staff can delete expense_categories" ON public.expense_categories FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('expenses', 'delete'));

DROP POLICY IF EXISTS "Users can access gym attendance" ON public.attendance;
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.attendance;
DROP POLICY IF EXISTS "Users can view attendance in their gym" ON public.attendance;
DROP POLICY IF EXISTS "Users can insert attendance if they have permission" ON public.attendance;
DROP POLICY IF EXISTS "Users can update attendance if they have permission" ON public.attendance;
DROP POLICY IF EXISTS "Users can delete attendance if they have permission" ON public.attendance;

CREATE POLICY "Staff can view attendance" ON public.attendance FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('attendance', 'view'));
CREATE POLICY "Staff can insert attendance" ON public.attendance FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('attendance', 'create'));
CREATE POLICY "Staff can update attendance" ON public.attendance FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('attendance', 'edit'));
CREATE POLICY "Staff can delete attendance" ON public.attendance FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('attendance', 'delete'));

DROP POLICY IF EXISTS "Users can access gym attendance_devices" ON public.attendance_devices;
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.attendance_devices;
DROP POLICY IF EXISTS "Users can view attendance devices in their gym" ON public.attendance_devices;
DROP POLICY IF EXISTS "Users can insert attendance devices if they have permission" ON public.attendance_devices;
DROP POLICY IF EXISTS "Users can update attendance devices if they have permission" ON public.attendance_devices;
DROP POLICY IF EXISTS "Users can delete attendance devices if they have permission" ON public.attendance_devices;

CREATE POLICY "Staff can view attendance_devices" ON public.attendance_devices FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('attendance', 'view'));
CREATE POLICY "Staff can insert attendance_devices" ON public.attendance_devices FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('attendance', 'create'));
CREATE POLICY "Staff can update attendance_devices" ON public.attendance_devices FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('attendance', 'edit'));
CREATE POLICY "Staff can delete attendance_devices" ON public.attendance_devices FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('attendance', 'delete'));

DROP POLICY IF EXISTS "Users can access gym pt_memberships" ON public.pt_memberships;
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.pt_memberships;
DROP POLICY IF EXISTS "Users can view pt memberships in their gym" ON public.pt_memberships;
DROP POLICY IF EXISTS "Users can insert pt memberships if they have permission" ON public.pt_memberships;
DROP POLICY IF EXISTS "Users can update pt memberships if they have permission" ON public.pt_memberships;
DROP POLICY IF EXISTS "Users can delete pt memberships if they have permission" ON public.pt_memberships;

CREATE POLICY "Staff can view pt_memberships" ON public.pt_memberships FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'view'));
CREATE POLICY "Staff can insert pt_memberships" ON public.pt_memberships FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'create'));
CREATE POLICY "Staff can update pt_memberships" ON public.pt_memberships FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'edit'));
CREATE POLICY "Staff can delete pt_memberships" ON public.pt_memberships FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'delete'));

DROP POLICY IF EXISTS "Users can access gym pt_plans" ON public.pt_plans;
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.pt_plans;
DROP POLICY IF EXISTS "Users can view pt plans in their gym" ON public.pt_plans;
DROP POLICY IF EXISTS "Users can insert pt plans if they have permission" ON public.pt_plans;
DROP POLICY IF EXISTS "Users can update pt plans if they have permission" ON public.pt_plans;
DROP POLICY IF EXISTS "Users can delete pt plans if they have permission" ON public.pt_plans;

CREATE POLICY "Staff can view pt_plans" ON public.pt_plans FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'view'));
CREATE POLICY "Staff can insert pt_plans" ON public.pt_plans FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'create'));
CREATE POLICY "Staff can update pt_plans" ON public.pt_plans FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'edit'));
CREATE POLICY "Staff can delete pt_plans" ON public.pt_plans FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'delete'));

DROP POLICY IF EXISTS "Users can access gym trainers" ON public.trainers;
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.trainers;
DROP POLICY IF EXISTS "Users can view trainers in their gym" ON public.trainers;
DROP POLICY IF EXISTS "Users can insert trainers if they have permission" ON public.trainers;
DROP POLICY IF EXISTS "Users can update trainers if they have permission" ON public.trainers;
DROP POLICY IF EXISTS "Users can delete trainers if they have permission" ON public.trainers;

CREATE POLICY "Staff can view trainers" ON public.trainers FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'view'));
CREATE POLICY "Staff can insert trainers" ON public.trainers FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'create'));
CREATE POLICY "Staff can update trainers" ON public.trainers FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'edit'));
CREATE POLICY "Staff can delete trainers" ON public.trainers FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'delete'));

DROP POLICY IF EXISTS "Users can access gym diet_plans" ON public.diet_plans;
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.diet_plans;
DROP POLICY IF EXISTS "Users can view diet plans in their gym" ON public.diet_plans;
DROP POLICY IF EXISTS "Users can insert diet plans if they have permission" ON public.diet_plans;
DROP POLICY IF EXISTS "Users can update diet plans if they have permission" ON public.diet_plans;
DROP POLICY IF EXISTS "Users can delete diet plans if they have permission" ON public.diet_plans;

CREATE POLICY "Staff can view diet_plans" ON public.diet_plans FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('diet-plans', 'view'));
CREATE POLICY "Staff can insert diet_plans" ON public.diet_plans FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('diet-plans', 'create'));
CREATE POLICY "Staff can update diet_plans" ON public.diet_plans FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('diet-plans', 'edit'));
CREATE POLICY "Staff can delete diet_plans" ON public.diet_plans FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('diet-plans', 'delete'));

DROP POLICY IF EXISTS "Users can access gym member_diet_plans" ON public.member_diet_plans;
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.member_diet_plans;
DROP POLICY IF EXISTS "Users can view member diet plans in their gym" ON public.member_diet_plans;
DROP POLICY IF EXISTS "Users can insert member diet plans if they have permission" ON public.member_diet_plans;
DROP POLICY IF EXISTS "Users can update member diet plans if they have permission" ON public.member_diet_plans;
DROP POLICY IF EXISTS "Users can delete member diet plans if they have permission" ON public.member_diet_plans;

CREATE POLICY "Staff can view member_diet_plans" ON public.member_diet_plans FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('diet-plans', 'view'));
CREATE POLICY "Staff can insert member_diet_plans" ON public.member_diet_plans FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('diet-plans', 'create'));
CREATE POLICY "Staff can update member_diet_plans" ON public.member_diet_plans FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('diet-plans', 'edit'));
CREATE POLICY "Staff can delete member_diet_plans" ON public.member_diet_plans FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('diet-plans', 'delete'));

DROP POLICY IF EXISTS "Users can access gym body_measurements" ON public.body_measurements;
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.body_measurements;
DROP POLICY IF EXISTS "Users can view body measurements in their gym" ON public.body_measurements;
DROP POLICY IF EXISTS "Users can insert body measurements if they have permission" ON public.body_measurements;
DROP POLICY IF EXISTS "Users can update body measurements if they have permission" ON public.body_measurements;
DROP POLICY IF EXISTS "Users can delete body measurements if they have permission" ON public.body_measurements;

CREATE POLICY "Staff can view body_measurements" ON public.body_measurements FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('members', 'view'));
CREATE POLICY "Staff can insert body_measurements" ON public.body_measurements FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('members', 'create'));
CREATE POLICY "Staff can update body_measurements" ON public.body_measurements FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('members', 'edit'));
CREATE POLICY "Staff can delete body_measurements" ON public.body_measurements FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('members', 'delete'));

DROP POLICY IF EXISTS "Users can access gym batches" ON public.batches;
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.batches;
DROP POLICY IF EXISTS "Users can view batches in their gym" ON public.batches;
DROP POLICY IF EXISTS "Users can insert batches if they have permission" ON public.batches;
DROP POLICY IF EXISTS "Users can update batches if they have permission" ON public.batches;
DROP POLICY IF EXISTS "Users can delete batches if they have permission" ON public.batches;

CREATE POLICY "Staff can view batches" ON public.batches FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'view'));
CREATE POLICY "Staff can insert batches" ON public.batches FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'create'));
CREATE POLICY "Staff can update batches" ON public.batches FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'edit'));
CREATE POLICY "Staff can delete batches" ON public.batches FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'delete'));

DROP POLICY IF EXISTS "Users can access gym batch_members" ON public.batch_members;
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.batch_members;
DROP POLICY IF EXISTS "Users can view batch members in their gym" ON public.batch_members;
DROP POLICY IF EXISTS "Users can insert batch members if they have permission" ON public.batch_members;
DROP POLICY IF EXISTS "Users can update batch members if they have permission" ON public.batch_members;
DROP POLICY IF EXISTS "Users can delete batch members if they have permission" ON public.batch_members;

CREATE POLICY "Staff can view batch_members" ON public.batch_members FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'view'));
CREATE POLICY "Staff can insert batch_members" ON public.batch_members FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'create'));
CREATE POLICY "Staff can update batch_members" ON public.batch_members FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'edit'));
CREATE POLICY "Staff can delete batch_members" ON public.batch_members FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'delete'));

DROP POLICY IF EXISTS "Users can access gym enquiries" ON public.enquiries;
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.enquiries;
DROP POLICY IF EXISTS "Users can view enquiries in their gym" ON public.enquiries;
DROP POLICY IF EXISTS "Users can insert enquiries if they have permission" ON public.enquiries;
DROP POLICY IF EXISTS "Users can update enquiries if they have permission" ON public.enquiries;
DROP POLICY IF EXISTS "Users can delete enquiries if they have permission" ON public.enquiries;

CREATE POLICY "Staff can view enquiries" ON public.enquiries FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('members', 'view'));
CREATE POLICY "Staff can insert enquiries" ON public.enquiries FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('members', 'create'));
CREATE POLICY "Staff can update enquiries" ON public.enquiries FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('members', 'edit'));
CREATE POLICY "Staff can delete enquiries" ON public.enquiries FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('members', 'delete'));

DROP POLICY IF EXISTS "Users can access gym enquiry_followups" ON public.enquiry_followups;
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.enquiry_followups;
DROP POLICY IF EXISTS "Users can view enquiry followups in their gym" ON public.enquiry_followups;
DROP POLICY IF EXISTS "Users can insert enquiry followups if they have permission" ON public.enquiry_followups;
DROP POLICY IF EXISTS "Users can update enquiry followups if they have permission" ON public.enquiry_followups;
DROP POLICY IF EXISTS "Users can delete enquiry followups if they have permission" ON public.enquiry_followups;

CREATE POLICY "Staff can view enquiry_followups" ON public.enquiry_followups FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('members', 'view'));
CREATE POLICY "Staff can insert enquiry_followups" ON public.enquiry_followups FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('members', 'create'));
CREATE POLICY "Staff can update enquiry_followups" ON public.enquiry_followups FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('members', 'edit'));
CREATE POLICY "Staff can delete enquiry_followups" ON public.enquiry_followups FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('members', 'delete'));

DROP POLICY IF EXISTS "Users can access gym workout_plans" ON public.workout_plans;
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.workout_plans;
DROP POLICY IF EXISTS "Users can view workout plans in their gym" ON public.workout_plans;
DROP POLICY IF EXISTS "Users can insert workout plans if they have permission" ON public.workout_plans;
DROP POLICY IF EXISTS "Users can update workout plans if they have permission" ON public.workout_plans;
DROP POLICY IF EXISTS "Users can delete workout plans if they have permission" ON public.workout_plans;

CREATE POLICY "Staff can view workout_plans" ON public.workout_plans FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'view'));
CREATE POLICY "Staff can insert workout_plans" ON public.workout_plans FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'create'));
CREATE POLICY "Staff can update workout_plans" ON public.workout_plans FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'edit'));
CREATE POLICY "Staff can delete workout_plans" ON public.workout_plans FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'delete'));

DROP POLICY IF EXISTS "Users can access gym workout_plan_items" ON public.workout_plan_items;
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.workout_plan_items;
DROP POLICY IF EXISTS "Users can view workout plan items in their gym" ON public.workout_plan_items;
DROP POLICY IF EXISTS "Users can insert workout plan items if they have permission" ON public.workout_plan_items;
DROP POLICY IF EXISTS "Users can update workout plan items if they have permission" ON public.workout_plan_items;
DROP POLICY IF EXISTS "Users can delete workout plan items if they have permission" ON public.workout_plan_items;

CREATE POLICY "Staff can view workout_plan_items" ON public.workout_plan_items FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'view'));
CREATE POLICY "Staff can insert workout_plan_items" ON public.workout_plan_items FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'create'));
CREATE POLICY "Staff can update workout_plan_items" ON public.workout_plan_items FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'edit'));
CREATE POLICY "Staff can delete workout_plan_items" ON public.workout_plan_items FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'delete'));

DROP POLICY IF EXISTS "Users can access gym member_workout_plans" ON public.member_workout_plans;
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.member_workout_plans;
DROP POLICY IF EXISTS "Users can view member workout plans in their gym" ON public.member_workout_plans;
DROP POLICY IF EXISTS "Users can insert member workout plans if they have permission" ON public.member_workout_plans;
DROP POLICY IF EXISTS "Users can update member workout plans if they have permission" ON public.member_workout_plans;
DROP POLICY IF EXISTS "Users can delete member workout plans if they have permission" ON public.member_workout_plans;

CREATE POLICY "Staff can view member_workout_plans" ON public.member_workout_plans FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'view'));
CREATE POLICY "Staff can insert member_workout_plans" ON public.member_workout_plans FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'create'));
CREATE POLICY "Staff can update member_workout_plans" ON public.member_workout_plans FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'edit'));
CREATE POLICY "Staff can delete member_workout_plans" ON public.member_workout_plans FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('pt', 'delete'));

DROP POLICY IF EXISTS "Users can access gym message_templates" ON public.message_templates;
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.message_templates;
DROP POLICY IF EXISTS "Users can view message templates in their gym" ON public.message_templates;
DROP POLICY IF EXISTS "Users can insert message templates if they have permission" ON public.message_templates;
DROP POLICY IF EXISTS "Users can update message templates if they have permission" ON public.message_templates;
DROP POLICY IF EXISTS "Users can delete message templates if they have permission" ON public.message_templates;

CREATE POLICY "Staff can view message_templates" ON public.message_templates FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('settings', 'view'));
CREATE POLICY "Staff can insert message_templates" ON public.message_templates FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('settings', 'create'));
CREATE POLICY "Staff can update message_templates" ON public.message_templates FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('settings', 'edit'));
CREATE POLICY "Staff can delete message_templates" ON public.message_templates FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('settings', 'delete'));

DROP POLICY IF EXISTS "Users can access gym gym_settings" ON public.gym_settings;
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.gym_settings;
DROP POLICY IF EXISTS "Users can view gym settings in their gym" ON public.gym_settings;
DROP POLICY IF EXISTS "Users can insert gym settings if they have permission" ON public.gym_settings;
DROP POLICY IF EXISTS "Users can update gym settings if they have permission" ON public.gym_settings;
DROP POLICY IF EXISTS "Users can delete gym settings if they have permission" ON public.gym_settings;

CREATE POLICY "Staff can view gym_settings" ON public.gym_settings FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('settings', 'view'));
CREATE POLICY "Staff can insert gym_settings" ON public.gym_settings FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('settings', 'create'));
CREATE POLICY "Staff can update gym_settings" ON public.gym_settings FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('settings', 'edit'));
CREATE POLICY "Staff can delete gym_settings" ON public.gym_settings FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('settings', 'delete'));

DROP POLICY IF EXISTS "Users can access gym branches" ON public.branches;
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.branches;
DROP POLICY IF EXISTS "Users can view branches in their gym" ON public.branches;
DROP POLICY IF EXISTS "Users can insert branches if they have permission" ON public.branches;
DROP POLICY IF EXISTS "Users can update branches if they have permission" ON public.branches;
DROP POLICY IF EXISTS "Users can delete branches if they have permission" ON public.branches;

CREATE POLICY "Staff can view branches" ON public.branches FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('settings', 'view'));
CREATE POLICY "Staff can insert branches" ON public.branches FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('settings', 'create'));
CREATE POLICY "Staff can update branches" ON public.branches FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('settings', 'edit'));
CREATE POLICY "Staff can delete branches" ON public.branches FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('settings', 'delete'));

DROP POLICY IF EXISTS "Users can access gym services" ON public.services;
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.services;
DROP POLICY IF EXISTS "Users can view services in their gym" ON public.services;
DROP POLICY IF EXISTS "Users can insert services if they have permission" ON public.services;
DROP POLICY IF EXISTS "Users can update services if they have permission" ON public.services;
DROP POLICY IF EXISTS "Users can delete services if they have permission" ON public.services;

CREATE POLICY "Staff can view services" ON public.services FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('settings', 'view'));
CREATE POLICY "Staff can insert services" ON public.services FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('settings', 'create'));
CREATE POLICY "Staff can update services" ON public.services FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('settings', 'edit'));
CREATE POLICY "Staff can delete services" ON public.services FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('settings', 'delete'));
