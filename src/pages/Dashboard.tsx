// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, IndianRupee, UserCheck, Clock, CreditCard, Cake,
  AlertCircle, Activity, UserPlus, CalendarCheck, Receipt,
  Search, TrendingUp, TrendingDown, ShieldAlert, Snowflake,
  Ban, Phone, MessageCircle, ChevronRight, Plus, Zap,
} from 'lucide-react';
import { StatCard, Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { Badge } from '../components/ui/Badge';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchDashboardStats,
  fetchExpiryAlerts,
  fetchBirthdaysToday,
  fetchRecentActivity,
  fetchPaymentsDue,
  type DashboardStats,
  type ExpiryAlert,
  type BirthdayMember,
  type ActivityItem,
  type PaymentDueMember,
} from '../services/dashboard.service';

export function Dashboard() {
  const navigate = useNavigate();
  const { profile, gym } = useAuth();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [expiryAlerts, setExpiryAlerts] = useState<ExpiryAlert[]>([]);
  const [birthdays, setBirthdays] = useState<BirthdayMember[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [paymentsDue, setPaymentsDue] = useState<PaymentDueMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setLoading(true);
      const gymId = gym?.id || '6d4277db-8b39-43c3-9f69-89a70348e085';
      try {
        const [s, e, b, a, p] = await Promise.all([
          fetchDashboardStats(gymId),
          fetchExpiryAlerts(gymId),
          fetchBirthdaysToday(gymId),
          fetchRecentActivity(gymId),
          fetchPaymentsDue(gymId),
        ]);
        if (isMounted) {
          setStats(s || {
            totalMembers: 0, activeMembers: 0, inactiveMembers: 0, expiredMembers: 0, blockedMembers: 0, frozenMembers: 0,
            todaysAttendance: 0, todaysCollection: 0, monthlyCollection: 0, monthlyExpenses: 0,
            pendingDues: 0, revenueAtRisk: 0, birthdaysToday: 0, expiringSoon: 0, activePT: 0, ptDue: 0,
          });
          setExpiryAlerts(e || []);
          setBirthdays(b || []);
          setActivity(a || []);
          setPaymentsDue(p || []);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
        if (isMounted) {
          setStats({
            totalMembers: 0, activeMembers: 0, inactiveMembers: 0, expiredMembers: 0, blockedMembers: 0, frozenMembers: 0,
            todaysAttendance: 0, todaysCollection: 0, monthlyCollection: 0, monthlyExpenses: 0,
            pendingDues: 0, revenueAtRisk: 0, birthdaysToday: 0, expiringSoon: 0, activePT: 0, ptDue: 0,
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
          {[...Array(6)].map((_, i) => (
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
    { label: 'Enquiry', icon: <Search className="w-5 h-5" />, path: '/app/enquiries/add', color: 'text-[#8E7135] bg-[#8E7135]/20' },
    { label: 'Renew', icon: <Zap className="w-5 h-5" />, path: '/app/members', color: 'text-[#5A6B7C] bg-[#5A6B7C]/20' },
  ];

  const statCards = [
    { label: "Today's Members", value: stats.todaysAttendance, icon: <Users className="w-5 h-5" />, bg: 'bg-[#C9A24D]/10 text-[#E2C46B]' },
    { label: "Today's Collection", value: `₹${stats.todaysCollection.toLocaleString('en-IN')}`, icon: <IndianRupee className="w-5 h-5" />, bg: 'bg-[#4D6B5A]/20 text-[#4D6B5A]' },
    { label: 'Active Members', value: stats.activeMembers, icon: <UserCheck className="w-5 h-5" />, bg: 'bg-[#C9A24D]/10 text-[#E2C46B]' },
    { label: 'Expiring Soon', value: stats.expiringSoon, icon: <Clock className="w-5 h-5" />, bg: 'bg-[#8E7135]/20 text-[#8E7135]' },
    { label: 'Pending Dues', value: `₹${stats.pendingDues.toLocaleString('en-IN')}`, icon: <CreditCard className="w-5 h-5" />, bg: 'bg-[#8B4B4B]/20 text-[#8B4B4B]' },
    { label: 'Birthdays Today', value: stats.birthdaysToday, icon: <Cake className="w-5 h-5" />, bg: 'bg-[#5A6B7C]/20 text-[#5A6B7C]' },
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

      {/* ─── Revenue At Risk ─── */}
      {stats.revenueAtRisk > 0 && (
        <Card className="mb-4 !p-4 cursor-pointer hover:border-amber-500/30 transition-colors" onClick={() => navigate('/app/members?filter=expiring_7')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#8E7135]/20 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-[#8E7135]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#8E7135]">Revenue At Risk</p>
                <p className="text-xs text-[#706D66]">{stats.expiringSoon} members expiring soon</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-[#F4F1E8]">₹{stats.revenueAtRisk.toLocaleString('en-IN')}</span>
              <ChevronRight className="w-4 h-4 text-[#706D66]" />
            </div>
          </div>
        </Card>
      )}

      {/* ─── Stats Grid ─── */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {statCards.map(stat => (
          <StatCard key={stat.label} label={stat.label} value={stat.value} icon={stat.icon} iconBg={stat.bg} />
        ))}
      </div>

      {/* ─── More Stats Row ─── */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <Card className="!p-3 text-center">
          <p className="text-2xl font-bold text-[#F4F1E8]">{stats.totalMembers}</p>
          <p className="text-[10px] font-medium text-[#706D66] uppercase tracking-wider mt-1">Total</p>
        </Card>
        <Card className="!p-3 text-center">
          <p className="text-2xl font-bold text-[#F4F1E8]">₹{(stats.monthlyCollection / 1000).toFixed(0)}K</p>
          <p className="text-[10px] font-medium text-[#706D66] uppercase tracking-wider mt-1">Monthly Rev</p>
        </Card>
        <Card className="!p-3 text-center">
          <p className="text-2xl font-bold text-[#F4F1E8]">₹{(stats.monthlyExpenses / 1000).toFixed(0)}K</p>
          <p className="text-[10px] font-medium text-[#706D66] uppercase tracking-wider mt-1">Expenses</p>
        </Card>
      </div>

      {/* ─── Expiry Alerts ─── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[#8E7135]" />
            <h2 className="text-base font-semibold text-[#F4F1E8]">Expiry Alerts</h2>
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

      {/* ─── Birthdays ─── */}
      {birthdays.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Cake className="w-4 h-4 text-[#5A6B7C]" />
            <h2 className="text-base font-semibold text-[#F4F1E8]">Birthdays Today 🎂</h2>
          </div>
          <div className="space-y-2">
            {birthdays.map(b => (
              <Card key={b.id} className="!p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar name={b.full_name} src={b.photo_url || undefined} size="md" />
                    <div>
                      <p className="text-sm font-semibold text-[#F4F1E8]">{b.full_name}</p>
                      <p className="text-xs text-[#706D66]">Turns {b.age} today</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => window.open(`tel:${b.phone}`)} className="w-9 h-9 rounded-xl bg-[#C9A24D]/10 text-[#E2C46B] flex items-center justify-center hover:bg-[#C9A24D]/20 transition-colors">
                      <Phone className="w-4 h-4" />
                    </button>
                    <button onClick={() => {
                      const msg = encodeURIComponent(`Happy Birthday ${b.full_name}! 🎂🎉 Wishing you a wonderful year ahead! - From ${gym?.name || 'Froster Gym'}`);
                      window.open(`https://wa.me/${b.phone.replace(/[^0-9]/g, '')}?text=${msg}`, '_blank');
                    }} className="w-9 h-9 rounded-xl bg-[#4D6B5A]/20 text-[#4D6B5A] flex items-center justify-center hover:bg-emerald-500/20 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

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

      {/* ─── Recent Activity ─── */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-[#E2C46B]" />
          <h2 className="text-base font-semibold text-[#F4F1E8]">Recent Activity</h2>
        </div>
        {activity.length === 0 ? (
          <Card>
            <EmptyState icon={<Activity className="w-6 h-6" />} title="No recent activity" description="Your gym activity will show up here" />
          </Card>
        ) : (
          <Card className="!p-0 divide-y divide-[rgba(255,255,255,0.08)]">
            {activity.map(item => (
              <div key={item.id} className="px-4 py-3 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-[rgba(255,255,255,0.02)] ${item.icon_color} shrink-0`}>
                  {item.type === 'payment_received' && <IndianRupee className="w-4 h-4" />}
                  {item.type === 'member_added' && <UserPlus className="w-4 h-4" />}
                  {item.type === 'membership_renewed' && <Zap className="w-4 h-4" />}
                  {item.type === 'attendance' && <CalendarCheck className="w-4 h-4" />}
                  {item.type === 'expense_added' && <Receipt className="w-4 h-4" />}
                  {item.type === 'enquiry_added' && <Search className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#F4F1E8] truncate">{item.description}</p>
                  <p className="text-[10px] text-[#706D66]">{item.time_ago}</p>
                </div>
              </div>
            ))}
          </Card>
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

