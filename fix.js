
const fs = require('fs');

// 1. AttendanceScreen.tsx
let att = fs.readFileSync('src/pages/attendance/AttendanceScreen.tsx', 'utf8');
att = att.replace('record.member_name', 'record.memberName');
fs.writeFileSync('src/pages/attendance/AttendanceScreen.tsx', att);

// 2. InvoiceView.tsx
let inv = fs.readFileSync('src/pages/payments/InvoiceView.tsx', 'utf8');
inv = inv.replace(/supabase\.from\('payments'\)\.select\('\*, members\\(full_name, phone\\)'\)\.eq\('id', id\)\.single\(\)/g, (supabase.from('payments').select('*, members(full_name, phone)').eq('id', id).single() as any));
fs.writeFileSync('src/pages/payments/InvoiceView.tsx', inv);

// 3. PaymentsList.tsx
let pl = fs.readFileSync('src/pages/payments/PaymentsList.tsx', 'utf8');
pl = pl.replace('const { data, error } = await fetchPayments', 'const res = await fetchPayments');
pl = pl.replace('if (error) throw new Error(error);', 'if (!res.data) throw new Error(\'Failed to load\');');
pl = pl.replace('setPayments(data || []);', 'setPayments(res.data || []);');
fs.writeFileSync('src/pages/payments/PaymentsList.tsx', pl);

// 4. AddPlan.tsx
let ap = fs.readFileSync('src/pages/plans/AddPlan.tsx', 'utf8');
ap = ap.replace(/createMembershipPlan/g, 'createPlan');
fs.writeFileSync('src/pages/plans/AddPlan.tsx', ap);

// 5. PlansList.tsx
let pList = fs.readFileSync('src/pages/plans/PlansList.tsx', 'utf8');
pList = pList.replace(/fetchMembershipPlans/g, 'fetchPlans');
pList = pList.replace('const { data, error } = await fetchPlans(gymId);', 'const data = await fetchPlans(gymId);');
pList = pList.replace('if (error) throw new Error(error);', '');
fs.writeFileSync('src/pages/plans/PlansList.tsx', pList);

// 6. settings.service.ts
let ss = fs.readFileSync('src/services/settings.service.ts', 'utf8');
ss = ss.replace(/if\\s*\\(\\s*isDemo\\s*\\)\\s*\\{[\\s\\S]*?\\}/g, '');
ss = ss.replace(/if\\s*\\(\\s*isDemo\\s*\\)\\s*return[^;]+;/g, '');
fs.writeFileSync('src/services/settings.service.ts', ss);

console.log('Fixed all remaining issues');

