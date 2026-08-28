import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Users, CreditCard, AlertCircle, TrendingUp, TrendingDown, UserCheck, UserX, Cake } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Dashboard() {
  const { gym } = useAuth();
  const [metrics, setMetrics] = useState({
    totalMembers: 0,
    activeMembers: 0,
    expiredMembers: 0,
    expiringMemberships: 0,
    paymentsDue: 0,
    currentRevenue: 0,
    currentExpenses: 0
  });
  
  const [birthdays, setBirthdays] = useState<any[]>([]);

  async function fetchDashboardMetrics() {
    if (!gym) return;
    
    try {
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      
      const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
      const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59).toISOString();
      
      // Fetch Members
      const { data: members, error: mError } = await supabase
        .from('members')
        .select('id, status, date_of_birth, full_name, photo_url')
        .eq('gym_id', gym.id);
        
      if (mError) throw mError;

      // Fetch Memberships
      const { data: memberships, error: eError } = await supabase
        .from('memberships')
        .select('id, member_id, status, end_date, due_amount')
        .eq('gym_id', gym.id);

      if (eError) throw eError;

      // Fetch Payments for current month
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('amount, payment_date')
        .eq('gym_id', gym.id)
        .eq('status', 'completed')
        .gte('payment_date', currentMonthStart)
        .lte('payment_date', currentMonthEnd);

      if (paymentsError) throw paymentsError;

      // Fetch Expenses for current month
      const { data: expensesData, error: expensesError } = await supabase
        .from('expenses')
        .select('amount, expense_date')
        .eq('gym_id', gym.id)
        .gte('expense_date', currentMonthStart)
        .lte('expense_date', currentMonthEnd);
        
      if (expensesError) throw expensesError;

      // Calculations
      const totalMembers = members.length;
      
      const now = new Date();
      now.setHours(0,0,0,0);
      
      const activeMemberships = memberships.filter((m: any) => m.status === 'active' && new Date(m.end_date) >= now);
      const expiredMemberships = memberships.filter((m: any) => new Date(m.end_date) < now);
      
      const expiryCount = memberships.filter((m: any) => {
        const end = new Date(m.end_date);
        return end >= now && end <= nextWeek;
      }).length;

      const totalDues = activeMemberships.reduce((sum: number, item: any) => sum + Number(item.due_amount), 0);

      const currentMonthRevenue = paymentsData.reduce((sum: number, item: any) => sum + Number(item.amount), 0);
      const currentMonthExpenses = expensesData.reduce((sum: number, item: any) => sum + Number(item.amount), 0);

      setMetrics({
        totalMembers,
        activeMembers: activeMemberships.length,
        expiredMembers: expiredMemberships.length,
        expiringMemberships: expiryCount,
        paymentsDue: totalDues,
        currentRevenue: currentMonthRevenue,
        currentExpenses: currentMonthExpenses
      });
      
      // Birthdays today
      const todayMonth = today.getMonth() + 1;
      const todayDate = today.getDate();
      
      const bdays = members.filter((m: any) => {
        if (!m.date_of_birth) return false;
        const dob = new Date(m.date_of_birth);
        return (dob.getMonth() + 1) === todayMonth && dob.getDate() === todayDate;
      });
      setBirthdays(bdays);

    } catch (err) {
      console.error('Failed to fetch metrics:', err);
    }
  }

  useEffect(() => {
    fetchDashboardMetrics();
  }, [gym]);

  // Auto-refresh when underlying data changes
  useEffect(() => {
    if (!gym) return;
    const channel = supabase.channel('dashboard_realtime_' + gym.id)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members', filter: `gym_id=eq.${gym.id}` }, fetchDashboardMetrics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'memberships', filter: `gym_id=eq.${gym.id}` }, fetchDashboardMetrics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments', filter: `gym_id=eq.${gym.id}` }, fetchDashboardMetrics)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses', filter: `gym_id=eq.${gym.id}` }, fetchDashboardMetrics)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [gym]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Welcome back. Here's what's happening at your gym.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-surface-highlight rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Total Members</p>
              <h3 className="text-2xl font-bold text-white mt-1">{metrics.totalMembers}</h3>
            </div>
            <div className="p-3 rounded-lg bg-surface-highlight text-blue-400">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-surface border border-surface-highlight rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Active Members</p>
              <h3 className="text-2xl font-bold text-white mt-1">{metrics.activeMembers}</h3>
            </div>
            <div className="p-3 rounded-lg bg-surface-highlight text-green-400">
              <UserCheck className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-surface border border-surface-highlight rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Expired Members</p>
              <h3 className="text-2xl font-bold text-white mt-1">{metrics.expiredMembers}</h3>
            </div>
            <div className="p-3 rounded-lg bg-surface-highlight text-red-500">
              <UserX className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-surface border border-surface-highlight rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Expiring Soon (7d)</p>
              <h3 className="text-2xl font-bold text-white mt-1">{metrics.expiringMemberships}</h3>
            </div>
            <div className="p-3 rounded-lg bg-surface-highlight text-amber-400">
              <AlertCircle className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-surface-highlight rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Payment Dues</p>
              <h3 className="text-2xl font-bold text-white mt-1">₹{metrics.paymentsDue.toLocaleString()}</h3>
            </div>
            <div className="p-3 rounded-lg bg-surface-highlight text-orange-400">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-surface border border-surface-highlight rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Revenue (Month)</p>
              <h3 className="text-2xl font-bold text-white mt-1">₹{metrics.currentRevenue.toLocaleString()}</h3>
            </div>
            <div className="p-3 rounded-lg bg-surface-highlight text-primary-500">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>
        
        <div className="bg-surface border border-surface-highlight rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Expenses (Month)</p>
              <h3 className="text-2xl font-bold text-white mt-1">₹{metrics.currentExpenses.toLocaleString()}</h3>
            </div>
            <div className="p-3 rounded-lg bg-surface-highlight text-red-400">
              <TrendingDown className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-surface-highlight rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <Cake className="w-5 h-5 text-pink-500" />
            <h3 className="font-bold text-white text-lg">Today's Birthdays</h3>
          </div>
          
          {birthdays.length === 0 ? (
            <p className="text-gray-400 text-sm">No birthdays today.</p>
          ) : (
            <div className="space-y-3">
              {birthdays.map((b: any) => (
                <div key={b.id} className="flex items-center justify-between bg-background border border-surface-highlight rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-surface-highlight flex items-center justify-center overflow-hidden">
                      {b.photo_url ? (
                         <img src={b.photo_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                         <span className="text-xs font-bold text-gray-400">{b.full_name.charAt(0)}</span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">{b.full_name}</p>
                      <p className="text-xs text-pink-500 font-medium">Happy Birthday! 🎉</p>
                    </div>
                  </div>
                  <Link 
                    to={`/app/members/${b.id}`}
                    className="text-xs px-3 py-1.5 bg-surface-highlight hover:bg-surface-highlight/80 text-white rounded-md transition-colors"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="bg-surface border border-surface-highlight rounded-xl p-6 flex flex-col justify-center items-center relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-1 ${metrics.currentRevenue - metrics.currentExpenses >= 0 ? 'bg-primary-500' : 'bg-red-500'}`} />
          <h3 className="font-bold text-gray-300 mb-2 text-lg">Net Performance (This Month)</h3>
          <p className="text-sm text-gray-400 mb-4">Revenue vs Expenses</p>
          <p className={`text-4xl font-black ${metrics.currentRevenue - metrics.currentExpenses >= 0 ? 'text-primary-500' : 'text-red-500'}`}>
            ₹{(metrics.currentRevenue - metrics.currentExpenses).toLocaleString()}
          </p>
        </div>
      </div>
    </div>
  );
}