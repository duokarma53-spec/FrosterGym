import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { 
  TrendingUp, TrendingDown, Users, 
  CreditCard, CalendarCheck, Loader2, DollarSign 
} from 'lucide-react';

export function Reports() {
  const { gym } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Date filter (default to 'this_month')
  const [dateFilter, setDateFilter] = useState<'this_month' | 'last_month' | 'this_year' | 'all'>('this_month');

  // Metrics
  const [metrics, setMetrics] = useState({
    revenue: { total: 0, current: 0, previous: 0 },
    expenses: { total: 0, current: 0, previous: 0 },
    net: 0,
    members: { total: 0, active: 0, new: 0 },
    memberships: { active: 0, expired: 0, expiringSoon: 0 },
    dues: { totalOutstanding: 0, membersWithDues: 0 },
    attendance: { totalVisits: 0 }
  });

  useEffect(() => {
    if (gym) {
      loadReportData();
    }
  }, [gym, dateFilter]);

  async function loadReportData() {
    try {
      setLoading(true);
      setError(null);
      
      const now = new Date();
      
      // Determine date ranges
      const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();
      
      const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
      const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59).toISOString();

      let startDate = new Date(0).toISOString(); // all time
      if (dateFilter === 'this_month') {
        startDate = currentMonthStart;
      } else if (dateFilter === 'last_month') {
        startDate = previousMonthStart;
      } else if (dateFilter === 'this_year') {
        startDate = new Date(now.getFullYear(), 0, 1).toISOString();
      }

      // Fetch all required data in parallel
      const [
        paymentsRes, expensesRes, membersRes, 
        membershipsRes, attendanceRes
      ] = await Promise.all([
        supabase.from('payments').select('amount, payment_date').eq('gym_id', gym!.id).eq('status', 'completed'),
        supabase.from('expenses').select('amount, expense_date').eq('gym_id', gym!.id),
        supabase.from('members').select('id, created_at, status').eq('gym_id', gym!.id),
        supabase.from('memberships').select('id, member_id, status, end_date, due_amount').eq('gym_id', gym!.id),
        supabase.from('attendance').select('id, check_in_time').eq('gym_id', gym!.id)
      ]);

      if (paymentsRes.error) throw paymentsRes.error;
      if (expensesRes.error) throw expensesRes.error;
      if (membersRes.error) throw membersRes.error;
      if (membershipsRes.error) throw membershipsRes.error;
      if (attendanceRes.error) throw attendanceRes.error;

      const payments = paymentsRes.data || [];
      const expenses = expensesRes.data || [];
      const members = membersRes.data || [];
      const memberships = membershipsRes.data || [];
      const attendance = attendanceRes.data || [];

      // Calculate Revenue
      const lifetimeRevenue = payments.reduce((sum: number, p: any) => sum + Number(p.amount), 0);
      const currentRevenue = payments
        .filter((p: any) => p.payment_date >= currentMonthStart && p.payment_date <= currentMonthEnd)
        .reduce((sum: number, p: any) => sum + Number(p.amount), 0);
      const previousRevenue = payments
        .filter((p: any) => p.payment_date >= previousMonthStart && p.payment_date <= previousMonthEnd)
        .reduce((sum: number, p: any) => sum + Number(p.amount), 0);
      
      const filteredRevenue = payments
        .filter((p: any) => dateFilter === 'all' || p.payment_date >= startDate)
        .reduce((sum: number, p: any) => sum + Number(p.amount), 0);

      // Calculate Expenses
      const lifetimeExpenses = expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);
      const currentExpenses = expenses
        .filter((e: any) => {
          const d = new Date(e.expense_date).toISOString();
          return d >= currentMonthStart && d <= currentMonthEnd;
        })
        .reduce((sum: number, e: any) => sum + Number(e.amount), 0);
      const previousExpenses = expenses
        .filter((e: any) => {
          const d = new Date(e.expense_date).toISOString();
          return d >= previousMonthStart && d <= previousMonthEnd;
        })
        .reduce((sum: number, e: any) => sum + Number(e.amount), 0);

      const filteredExpenses = expenses
        .filter((e: any) => dateFilter === 'all' || new Date(e.expense_date).toISOString() >= startDate)
        .reduce((sum: number, e: any) => sum + Number(e.amount), 0);

      // Calculate Members
      const newMembers = members.filter((m: any) => dateFilter === 'all' || m.created_at >= startDate).length;
      const activeMembers = members.filter((m: any) => m.status === 'active').length;

      // Calculate Memberships
      const activeMemberships = memberships.filter((m: any) => m.status === 'active' && new Date(m.end_date) >= now);
      const expiredMemberships = memberships.filter((m: any) => new Date(m.end_date) < now);
      
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
      const expiringSoon = memberships.filter((m: any) => {
        const end = new Date(m.end_date);
        return end >= now && end <= sevenDaysFromNow;
      }).length;

      // Calculate Dues (active memberships only)
      const membershipsWithDues = activeMemberships.filter((m: any) => Number(m.due_amount) > 0);
      const totalOutstanding = membershipsWithDues.reduce((sum: number, m: any) => sum + Number(m.due_amount), 0);
      const membersWithDues = new Set(membershipsWithDues.map((m: any) => m.member_id)).size;

      // Calculate Attendance
      const filteredAttendance = attendance.filter((a: any) => dateFilter === 'all' || a.check_in_time >= startDate).length;

      setMetrics({
        revenue: { total: lifetimeRevenue, current: currentRevenue, previous: previousRevenue },
        expenses: { total: lifetimeExpenses, current: currentExpenses, previous: previousExpenses },
        net: filteredRevenue - filteredExpenses,
        members: { total: members.length, active: activeMembers, new: newMembers },
        memberships: { active: activeMemberships.length, expired: expiredMemberships.length, expiringSoon },
        dues: { totalOutstanding, membersWithDues },
        attendance: { totalVisits: filteredAttendance }
      });

    } catch (err: any) {
      console.error('Report generation error:', err.message);
      setError('Failed to generate reports. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        <p className="text-gray-400">Aggregating business reports...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={loadReportData} className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-gray-400 mt-1">Key business insights across all modules.</p>
        </div>
        <div className="flex bg-background border border-surface-highlight rounded-lg p-1 overflow-x-auto w-full sm:w-auto">
          {(['this_month', 'last_month', 'this_year', 'all'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setDateFilter(filter)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize whitespace-nowrap transition-colors ${
                dateFilter === filter 
                  ? 'bg-surface-highlight text-white' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {filter.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Primary Financial Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface border border-surface-highlight p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-500/10 text-green-500 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-300">Revenue</h3>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-3xl font-bold text-white">{formatCurrency(metrics.revenue.current)}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">This Month</p>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-surface-highlight">
              <span className="text-sm text-gray-400">Previous Month</span>
              <span className="text-sm font-medium text-white">{formatCurrency(metrics.revenue.previous)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm text-gray-400">Lifetime Revenue</span>
              <span className="text-sm font-medium text-white">{formatCurrency(metrics.revenue.total)}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-surface-highlight p-6 rounded-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
              <TrendingDown className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-gray-300">Expenses</h3>
          </div>
          <div className="space-y-2">
            <div>
              <p className="text-3xl font-bold text-white">{formatCurrency(metrics.expenses.current)}</p>
              <p className="text-xs text-gray-500 uppercase tracking-wider mt-1">This Month</p>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-surface-highlight">
              <span className="text-sm text-gray-400">Previous Month</span>
              <span className="text-sm font-medium text-white">{formatCurrency(metrics.expenses.previous)}</span>
            </div>
            <div className="flex justify-between items-center pt-2">
              <span className="text-sm text-gray-400">Lifetime Expenses</span>
              <span className="text-sm font-medium text-white">{formatCurrency(metrics.expenses.total)}</span>
            </div>
          </div>
        </div>

        <div className="bg-surface border border-surface-highlight p-6 rounded-xl flex flex-col justify-center relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-1 h-full ${metrics.net >= 0 ? 'bg-primary-500' : 'bg-red-500'}`} />
          <h3 className="font-bold text-gray-300 mb-2 text-lg">Net Performance</h3>
          <p className="text-sm text-gray-400 mb-4">Revenue vs Expenses ({dateFilter.replace('_', ' ')})</p>
          <p className={`text-4xl font-black ${metrics.net >= 0 ? 'text-primary-500' : 'text-red-500'}`}>
            {formatCurrency(metrics.net)}
          </p>
        </div>
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Members */}
        <div className="bg-surface border border-surface-highlight p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-blue-400" />
            <h3 className="font-bold text-white">Members</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Total</span>
              <span className="text-sm font-bold text-white">{metrics.members.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Active</span>
              <span className="text-sm font-bold text-white">{metrics.members.active}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-surface-highlight">
              <span className="text-sm text-gray-400">New (Period)</span>
              <span className="text-sm font-bold text-green-400">+{metrics.members.new}</span>
            </div>
          </div>
        </div>

        {/* Memberships */}
        <div className="bg-surface border border-surface-highlight p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-purple-400" />
            <h3 className="font-bold text-white">Memberships</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Active</span>
              <span className="text-sm font-bold text-white">{metrics.memberships.active}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Expired</span>
              <span className="text-sm font-bold text-red-400">{metrics.memberships.expired}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-surface-highlight">
              <span className="text-sm text-gray-400">Expiring soon</span>
              <span className="text-sm font-bold text-amber-400">{metrics.memberships.expiringSoon}</span>
            </div>
          </div>
        </div>

        {/* Payment Dues */}
        <div className="bg-surface border border-surface-highlight p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-amber-500" />
            <h3 className="font-bold text-white">Payment Dues</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Total Outstanding</span>
              <span className="text-sm font-bold text-amber-500">{formatCurrency(metrics.dues.totalOutstanding)}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-surface-highlight">
              <span className="text-sm text-gray-400">Members with dues</span>
              <span className="text-sm font-bold text-white">{metrics.dues.membersWithDues}</span>
            </div>
          </div>
        </div>

        {/* Attendance */}
        <div className="bg-surface border border-surface-highlight p-5 rounded-xl">
          <div className="flex items-center gap-2 mb-3">
            <CalendarCheck className="w-4 h-4 text-primary-500" />
            <h3 className="font-bold text-white">Attendance</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Total Visits</span>
              <span className="text-sm font-bold text-white">{metrics.attendance.totalVisits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Period Filter</span>
              <span className="text-sm font-bold text-gray-300 capitalize">{dateFilter.replace('_', ' ')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
