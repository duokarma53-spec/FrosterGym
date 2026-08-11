// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, IndianRupee, Clock, CreditCard,
  AlertCircle, ChevronRight, Plus, UserPlus, CalendarCheck, Receipt, Search, Zap
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchDashboardStats,
  fetchExpiryAlerts,
  fetchPaymentsDue,
  type DashboardStats,
  type ExpiryAlert,
  type PaymentDueMember,
} from '../services/dashboard.service';

export function Dashboard() {
  const navigate = useNavigate();
  const { profile, gym } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlert[]>([]);
  const [paymentsDue, setPaymentsDue] = useState<PaymentDueMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      const gymId = gym?.id || '6d4277db-8b39-43c3-9f69-89a70348e085';
      try {
        const [s, e, p] = await Promise.all([
          fetchDashboardStats(gymId),
          fetchExpiryAlerts(gymId),
          fetchPaymentsDue(gymId),
        ]);
        if (isMounted) {
          setStats(s || {
            totalMembers: 0, activeMembers: 0, inactiveMembers: 0, expiredMembers: 0, blockedMembers: 0, frozenMembers: 0,
            todaysAttendance: 0, todaysCollection: 0, monthlyCollection: 0, monthlyExpenses: 0,
            pendingDues: 0, revenueAtRisk: 0, expiringSoon: 0, activePT: 0, ptDue: 0, lifetimeRevenue: 0,
          });
          setExpiryAlerts(e || []);
          setPaymentsDue(p || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        if (isMounted) {
          setStats({
            totalMembers: 0, activeMembers: 0, inactiveMembers: 0, expiredMembers: 0, blockedMembers: 0, frozenMembers: 0,
            todaysAttendance: 0, todaysCollection: 0, monthlyCollection: 0, monthlyExpenses: 0,
            pendingDues: 0, revenueAtRisk: 0, expiringSoon: 0, activePT: 0, ptDue: 0, lifetimeRevenue: 0,
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    load();
    return () => { isMounted = false; };
  }, [gym]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (loading || !stats) {
    return (
      <div className="pb-6 space-y-4 animate-pulse">
        <div className="h-12 bg-[rgba(255,255,255,0.02)] rounded-2xl w-2/3" />
        <div className="grid grid-cols-2 gap-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-32 bg-[rgba(255,255,255,0.02)] rounded-3xl" />
          ))}
        </div>
      </div>
    );
  }

  const quickActions = [
    { label: 'Add Member', icon: <UserPlus className="w-5 h-5" />, path: '/app/members/add', color: 'text-[#E2C46B] bg-[#C9A24D]/10' },
    { label: 'Payment', icon: <IndianRupee className="w-5 h-5" />, path: '/app/payments', color: 'text-[#4D6B5A] bg-[#4D6B5A]/20' },
    { label: 'Attendance', icon: <CalendarCheck className="w-5 h-5" />, path: '/app/attendance', color: 'text-[#E2C46B] bg-[#C9A24D]/10' },
    { label: 'Expense', icon: <Receipt className="w-5 h-5" />, path: '/app/expenses/add', color: 'text-[#8B4B4B] bg-[#8B4B4B]/20' },
    { label: 'Renew', icon: <Zap className="w-5 h-5" />, path: '/app/members', color: 'text-[#5A6B7C] bg-[#5A6B7C]/20' },
  ];

  const alertBuckets = {
    '1-3': expiryAlerts.filter(a => a.bucket === '1-3'),
    '4-7': expiryAlerts.filter(a => a.bucket === '4-7'),
    '8-15': expiryAlerts.filter(a => a.bucket === '8-15'),
  };

  return (
    <div className="pb-6 animate-in fade-in duration-300">
      {/* ─── Greeting ─── */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#F4F1E8] tracking-tight">
          {greeting()}, {profile?.full_name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="text-sm text-[#706D66] mt-0.5">
          {gym?.name || 'Your Gym'} — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
        </p>
      </div>

      {/* ─── Quick Actions ─── */}
      <div className="mb-6">
        <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar -mx-4 px-4">
          {quickActions.map(action => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-1.5 min-w-[72px] group"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${action.color} group-hover:scale-110 transition-transform duration-200`}>
                {action.icon}
              </div>
              <span className="text-[11px] font-medium text-[#A7A39A] group-hover:text-[#F4F1E8] transition-colors">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ─── Core Stats Row ─── */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="!p-4 relative overflow-hidden group hover:border-[#C9A24D]/30 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#C9A24D]/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-[#E2C46B]" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#F4F1E8]">{stats.totalMembers}</h3>
            <p className="text-xs font-medium text-[#706D66] uppercase tracking-wider mt-1">Total Members</p>
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-gradient-to-tl from-[#C9A24D]/5 to-transparent rounded-tl-full opacity-50 group-hover:scale-110 transition-transform duration-500" />
        </Card>
        
        <Card className="!p-4 relative overflow-hidden group hover:border-[#4D6B5A]/30 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <div className="w-10 h-10 rounded-xl bg-[#4D6B5A]/20 flex items-center justify-center">
              <IndianRupee className="w-5 h-5 text-[#4D6B5A]" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-bold text-[#F4F1E8]">₹{stats.lifetimeRevenue.toLocaleString('en-IN')}</h3>
            <p className="text-xs font-medium text-[#706D66] uppercase tracking-wider mt-1">Lifetime Revenue</p>
          </div>
          <div className="absolute right-0 bottom-0 w-24 h-24 bg-gradient-to-tl from-[#4D6B5A]/5 to-transparent rounded-tl-full opacity-50 group-hover:scale-110 transition-transform duration-500" />
        </Card>
      </div>

      {/* ─── Expiry Alerts (Membership Expiry) ─── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#8E7135]" />
            <h2 className="text-base font-semibold text-[#F4F1E8]">Membership Expiry</h2>
          </div>
          <button onClick={() => navigate('/app/members?filter=expiring_7')} className="text-xs text-[#E2C46B] hover:underline">View all</button>
        </div>

        {expiryAlerts.length === 0 ? (
          <Card>
            <EmptyState icon={<Clock className="w-6 h-6" />} title="No expiring memberships" description="All memberships are healthy!" />
          </Card>
        ) : (
          <div className="space-y-2">
            {[{ key: '1-3' as const, label: '1-3 days', color: 'danger' as const },
              { key: '4-7' as const, label: '4-7 days', color: 'warning' as const },
              { key: '8-15' as const, label: '8-15 days', color: 'info' as const },
            ].map(bucket => {
              const items = alertBuckets[bucket.key];
              if (items.length === 0) return null;
              return (
                <Card key={bucket.key} className="!p-3 cursor-pointer" onClick={() => navigate(`/app/members?filter=expiring_${bucket.key === '1-3' ? '3' : bucket.key === '4-7' ? '7' : '15'}`)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge variant={bucket.color}>{bucket.label}</Badge>
                      <div className="flex -space-x-2">
                        {items.slice(0, 3).map(a => (
                          <Avatar key={a.member.id} name={a.member.full_name} size="sm" className="border-2 border-[#131b2f]" />
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#F4F1E8]">{items.length}</span>
                      <span className="text-xs text-[#706D66]">members</span>
                      <ChevronRight className="w-4 h-4 text-[#706D66]" />
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ─── Payment Due ─── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#8B4B4B]" />
            <h2 className="text-base font-semibold text-[#F4F1E8]">Payment Due</h2>
          </div>
          <button onClick={() => navigate('/app/members?filter=due')} className="text-xs text-[#E2C46B] hover:underline">View all</button>
        </div>
        {paymentsDue.length === 0 ? (
          <Card>
            <EmptyState icon={<CreditCard className="w-6 h-6" />} title="No pending payments" description="All payments are up to date!" />
          </Card>
        ) : (
          <div className="space-y-2">
            {paymentsDue.slice(0, 5).map(m => (
              <Card key={m.id} className="!p-3 cursor-pointer" onClick={() => navigate(`/app/members/${m.id}`)}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={m.full_name} src={m.photo_url || undefined} size="sm" />
                    <div>
                      <p className="text-sm font-semibold text-[#F4F1E8]">{m.full_name}</p>
                      <p className="text-xs text-[#706D66]">{m.member_id} • {m.plan_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-[#8B4B4B]">₹{m.due_amount.toLocaleString('en-IN')}</p>
                    <p className="text-[10px] text-[#706D66]">due</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ─── Mobile FAB ─── */}
      <div className="fixed bottom-24 right-4 sm:hidden z-40">
        <Button
          className="w-14 h-14 rounded-full shadow-[0_8px_32px_rgba(201,162,77,0.3)] flex items-center justify-center !p-0"
          onClick={() => navigate('/app/members/add')}
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}
