import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Users, CreditCard, AlertCircle, TrendingUp } from 'lucide-react';

export function Dashboard() {
  const { gym } = useAuth();
  const [metrics, setMetrics] = useState({
    totalMembers: 0,
    expiringMemberships: 0,
    paymentsDue: 0,
    lifetimeRevenue: 0,
    currentMonthNet: 0
  });

  useEffect(() => {
    async function fetchDashboardMetrics() {
      if (!gym) return;
      
      try {
        const { count: membersCount, error: mError } = await supabase
          .from('members')
          .select('*', { count: 'exact', head: true })
          .eq('gym_id', gym.id)
          .eq('status', 'active');
          
        if (mError) throw mError;

        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        const currentMonthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
        const currentMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59).toISOString();
        
        const { count: expiryCount, error: eError } = await supabase
          .from('memberships')
          .select('*', { count: 'exact', head: true })
          .eq('gym_id', gym.id)
          .eq('status', 'active')
          .lte('end_date', nextWeek.toISOString().split('T')[0])
          .gte('end_date', today.toISOString().split('T')[0]);

        if (eError) throw eError;

        const { data: duesData, error: duesError } = await supabase
          .from('memberships')
          .select('due_amount')
          .eq('gym_id', gym.id)
          .eq('status', 'active')
          .gt('due_amount', 0);

        if (duesError) throw duesError;
        const totalDues = (duesData || []).reduce((sum: number, item: any) => sum + Number(item.due_amount), 0);

        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('amount, payment_date')
          .eq('gym_id', gym.id)
          .eq('status', 'completed');

        if (paymentsError) throw paymentsError;
        const totalRevenue = (paymentsData || []).reduce((sum: number, item: any) => sum + Number(item.amount), 0);
        
        const currentMonthRevenue = (paymentsData || [])
          .filter((p: any) => p.payment_date >= currentMonthStart && p.payment_date <= currentMonthEnd)
          .reduce((sum: number, item: any) => sum + Number(item.amount), 0);

        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select('amount, expense_date')
          .eq('gym_id', gym.id);
          
        if (expensesError) throw expensesError;
        const currentMonthExpenses = (expensesData || [])
          .filter((e: any) => {
            const d = new Date(e.expense_date).toISOString();
            return d >= currentMonthStart && d <= currentMonthEnd;
          })
          .reduce((sum: number, item: any) => sum + Number(item.amount), 0);

        setMetrics({
          totalMembers: membersCount || 0,
          expiringMemberships: expiryCount || 0,
          paymentsDue: totalDues,
          lifetimeRevenue: totalRevenue,
          currentMonthNet: currentMonthRevenue - currentMonthExpenses
        });

      } catch (err) {
        console.error('Failed to fetch metrics:', err);
      }
    }

    fetchDashboardMetrics();
  }, [gym]);

  const stats = [
    { label: 'Total Members', value: metrics.totalMembers.toString(), icon: Users, color: 'text-blue-400' },
    { label: 'Membership Expiry (Next 7 Days)', value: metrics.expiringMemberships.toString(), icon: AlertCircle, color: 'text-amber-400' },
    { label: 'Payments Due', value: metrics.paymentsDue.toString(), icon: CreditCard, color: 'text-red-400' },
    { label: 'Lifetime Revenue', value: `₹${metrics.lifetimeRevenue}`, icon: TrendingUp, color: 'text-green-400' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Welcome back. Here's what's happening at your gym.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-surface border border-surface-highlight rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{stat.label}</p>
                <h3 className="text-2xl font-bold text-white mt-1">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-lg bg-surface-highlight ${stat.color}`}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-surface-highlight rounded-xl p-6 flex flex-col justify-center items-center relative overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-1 ${metrics.currentMonthNet >= 0 ? 'bg-primary-500' : 'bg-red-500'}`} />
          <h3 className="font-bold text-gray-300 mb-2 text-lg">Net Performance (This Month)</h3>
          <p className="text-sm text-gray-400 mb-4">Revenue vs Expenses</p>
          <p className={`text-4xl font-black ${metrics.currentMonthNet >= 0 ? 'text-primary-500' : 'text-red-500'}`}>
            ₹{metrics.currentMonthNet.toLocaleString()}
          </p>
        </div>
        <div className="bg-surface border border-surface-highlight rounded-xl p-6 min-h-[200px] flex items-center justify-center">
          <p className="text-gray-500 text-sm">Revenue Chart (Check Reports Tab)</p>
        </div>
      </div>
    </div>
  );
}
