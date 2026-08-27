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

let sql = `\n-- ==========================================\n-- 4. OPERATIONAL TABLES\n-- ==========================================\n`;
tablesToProtect.forEach(t => {
  sql += `
DROP POLICY IF EXISTS "Users can access gym ${t.table}" ON public.${t.table};
DROP POLICY IF EXISTS "Gym users can access their gym data" ON public.${t.table};
DROP POLICY IF EXISTS "Users can view ${t.table.replace(/_/g, ' ')} in their gym" ON public.${t.table};
DROP POLICY IF EXISTS "Users can insert ${t.table.replace(/_/g, ' ')} if they have permission" ON public.${t.table};
DROP POLICY IF EXISTS "Users can update ${t.table.replace(/_/g, ' ')} if they have permission" ON public.${t.table};
DROP POLICY IF EXISTS "Users can delete ${t.table.replace(/_/g, ' ')} if they have permission" ON public.${t.table};

CREATE POLICY "Staff can view ${t.table}" ON public.${t.table} FOR SELECT USING (gym_id = public.get_gym_id() AND public.has_staff_permission('${t.module}', 'view'));
CREATE POLICY "Staff can insert ${t.table}" ON public.${t.table} FOR INSERT WITH CHECK (gym_id = public.get_gym_id() AND public.has_staff_permission('${t.module}', 'create'));
CREATE POLICY "Staff can update ${t.table}" ON public.${t.table} FOR UPDATE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('${t.module}', 'edit'));
CREATE POLICY "Staff can delete ${t.table}" ON public.${t.table} FOR DELETE USING (gym_id = public.get_gym_id() AND public.has_staff_permission('${t.module}', 'delete'));
`;
});

fs.appendFileSync('supabase/migrations/20260827_rls_security_fix.sql', sql);
console.log("Appended tables successfully!");