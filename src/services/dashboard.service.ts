// @ts-nocheck
import { isDemo, db } from './base.service';
import type { MemberWithMembership } from './members.service';
import { fetchMembers } from './members.service';
import { fetchNotificationSettings } from './settings.service';

export interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  inactiveMembers: number;
  expiredMembers: number;
  blockedMembers: number;
  frozenMembers: number;
  todaysAttendance: number;
  todaysCollection: number;
  monthlyCollection: number;
  monthlyExpenses: number;
  pendingDues: number;
  revenueAtRisk: number;
  expiringSoon: number;
  activePT: number;
  ptDue: number;
  lifetimeRevenue: number;
}

export interface ExpiryAlert {
  member: MemberWithMembership;
  daysUntilExpiry: number;
  bucket: '1-3' | '4-7' | '8-15';
}

export interface BirthdayMember {
  id: string;
  full_name: string;
  phone: string;
  photo_url: string | null;
  date_of_birth: string;
  age: number;
}

export interface ActivityItem {
  id: string;
  type: 'member_added' | 'payment_received' | 'membership_renewed' | 'attendance' | 'expense_added' | 'enquiry_added';
  title: string;
  description: string;
  icon_color: string;
  time_ago: string;
  created_at: string;
}

export interface PaymentDueMember {
  id: string;
  full_name: string;
  phone: string;
  photo_url: string | null;
  member_id: string;
  due_amount: number;
  plan_name: string;
  expiry_date: string;
}

// ─── Dashboard Stats ──────────────────────────
export async function fetchDashboardStats(gymId: string): Promise<DashboardStats> {
  if (isDemo()) {
    return {
      totalMembers: 0,
      activeMembers: 0,
      inactiveMembers: 0,
      expiredMembers: 0,
      blockedMembers: 0,
      frozenMembers: 0,
      todaysAttendance: 0,
      todaysCollection: 0,
      monthlyCollection: 0,
      monthlyExpenses: 0,
      pendingDues: 0,
      revenueAtRisk: 0,
      expiringSoon: 0,
      activePT: 0,
      ptDue: 0,
      lifetimeRevenue: 0,
    };
  }

  try {
    const today = new Date().toISOString().split('T')[0];
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    // Members by status
    const membersRes: any = await db.from('members').select('status', { count: 'exact' }).eq('gym_id', gymId);
    const allMembers = membersRes.data || [];
    const totalMembers = allMembers.length;
    const activeMembers = allMembers.filter((m: any) => m.status === 'active').length;
    const inactiveMembers = allMembers.filter((m: any) => m.status === 'inactive').length;
    const expiredMembers = allMembers.filter((m: any) => m.status === 'expired').length;
    const blockedMembers = allMembers.filter((m: any) => m.status === 'blocked').length;
    const frozenMembers = allMembers.filter((m: any) => m.status === 'frozen').length;

    // Today's attendance
    const attendRes: any = await db.from('attendance').select('id', { count: 'exact' }).eq('gym_id', gymId).eq('date', today);
    const todaysAttendance = attendRes.data?.length || 0;

    // Today's collection
    const todayPayRes: any = await db.from('payments').select('amount').eq('gym_id', gymId).eq('status', 'completed').gte('payment_date', today + 'T00:00:00').lte('payment_date', today + 'T23:59:59');
    const todaysCollection = (todayPayRes.data || []).reduce((sum: number, p: any) => sum + Number(p.amount), 0);

    // Monthly collection
    const monthPayRes: any = await db.from('payments').select('amount').eq('gym_id', gymId).eq('status', 'completed').gte('payment_date', monthStart);
    const monthlyCollection = (monthPayRes.data || []).reduce((sum: number, p: any) => sum + Number(p.amount), 0);

    // Monthly expenses
    const expenseRes: any = await db.from('expenses').select('amount').eq('gym_id', gymId).gte('expense_date', monthStart);
    const monthlyExpenses = (expenseRes.data || []).reduce((sum: number, e: any) => sum + Number(e.amount), 0);

    // Lifetime Revenue
    const lifetimePayRes: any = await db.from('payments').select('amount').eq('gym_id', gymId).eq('status', 'completed');
    const lifetimeRevenue = (lifetimePayRes.data || []).reduce((sum: number, p: any) => sum + Number(p.amount), 0);

    // Pending dues
    const dueRes: any = await db.from('memberships').select('due_amount').eq('gym_id', gymId).gt('due_amount', 0);
    const pendingDues = (dueRes.data || []).reduce((sum: number, m: any) => sum + Number(m.due_amount), 0);

    // Expiring soon (next 15 days)
    const in15Days = new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0];
    const expiringRes: any = await db.from('memberships').select('final_amount').eq('gym_id', gymId).eq('status', 'active').gte('end_date', today).lte('end_date', in15Days);
    const expiringSoon = expiringRes.data?.length || 0;
    const revenueAtRisk = (expiringRes.data || []).reduce((sum: number, m: any) => sum + Number(m.final_amount), 0);

    return {
      totalMembers, activeMembers, inactiveMembers, expiredMembers, blockedMembers, frozenMembers,
      todaysAttendance, todaysCollection, monthlyCollection, monthlyExpenses,
      pendingDues, revenueAtRisk, expiringSoon, activePT: 0, ptDue: 0,
      lifetimeRevenue,
    };
  } catch (err) {
    console.error('Dashboard stats error:', err);
    return {
      totalMembers: 0, activeMembers: 0, inactiveMembers: 0, expiredMembers: 0, blockedMembers: 0, frozenMembers: 0,
      todaysAttendance: 0, todaysCollection: 0, monthlyCollection: 0, monthlyExpenses: 0,
      pendingDues: 0, revenueAtRisk: 0, expiringSoon: 0, activePT: 0, ptDue: 0,
      lifetimeRevenue: 0,
    };
  }
}

// ─── Expiry Alerts ──────────────────────────
export async function fetchExpiryAlerts(gymId: string): Promise<ExpiryAlert[]> {
  try {
    const settings = await fetchNotificationSettings(gymId);
    if (!settings.membershipExpiryAlerts) return [];

    const result = await fetchMembers(gymId, { filter: 'all', pageSize: 100 });
    const now = new Date();
    const alerts: ExpiryAlert[] = [];

    for (const member of (result?.data || [])) {
      if (!member.current_membership || member.status !== 'active') continue;
      const end = new Date(member.current_membership.end_date);
      const days = Math.ceil((end.getTime() - now.getTime()) / 86400000);

      if (days >= 1 && days <= 3) alerts.push({ member, daysUntilExpiry: days, bucket: '1-3' });
      else if (days >= 4 && days <= 7) alerts.push({ member, daysUntilExpiry: days, bucket: '4-7' });
      else if (days >= 8 && days <= 15) alerts.push({ member, daysUntilExpiry: days, bucket: '8-15' });
    }

    return alerts.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  } catch {
    return [];
  }
}


// ─── Recent Activity ──────────────────────────
export async function fetchRecentActivity(gymId: string, limit = 10): Promise<ActivityItem[]> {
  if (isDemo()) {
    return [];
  }

  try {
    const res: any = await db.from('activity_logs').select('*').eq('gym_id', gymId).order('created_at', { ascending: false }).limit(limit);
    return (res.data || []).map((log: any) => ({
      id: log.id,
      type: log.action,
      title: log.action.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      description: log.details?.description || log.action,
      icon_color: 'text-[#E5D3B3]',
      time_ago: getTimeAgo(new Date(log.created_at)),
      created_at: log.created_at,
    }));
  } catch {
    return [];
  }
}

// ─── Payments Due ──────────────────────────
export async function fetchPaymentsDue(gymId: string): Promise<PaymentDueMember[]> {
  if (isDemo()) {
    return [];
  }
  
  try {
    const settings = await fetchNotificationSettings(gymId);
    if (!settings.paymentDueAlerts) return [];

    const res: any = await db.from('memberships').select(`
      id, due_amount, end_date, plan_id,
      member:members!inner(id, full_name, phone, photo_url, member_id),
      plan:membership_plans(name)
    `).eq('gym_id', gymId).eq('status', 'active').gt('due_amount', 0);
    
    return (res.data || []).map((m: any) => ({
      id: m.member.id,
      full_name: m.member.full_name,
      phone: m.member.phone,
      photo_url: m.member.photo_url,
      member_id: m.member.member_id,
      due_amount: m.due_amount,
      plan_name: m.plan?.name || 'Custom Plan',
      expiry_date: m.end_date
    }));
  } catch {
    return [];
  }
}

// ─── Helpers ──────────────────────────
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return `${Math.floor(seconds / 86400)} days ago`;
}

