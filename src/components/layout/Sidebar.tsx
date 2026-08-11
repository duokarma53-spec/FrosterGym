// @ts-nocheck
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, CreditCard, Award, CalendarCheck,
  Utensils, UserCog, Receipt, BarChart3, MessageCircle,
  Settings, LogOut, X, Dumbbell, Search, Target,
  Ruler, Heart, ClipboardList, Building2, Trash2,
  Smartphone, CreditCard as CardIcon,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { usePermissions } from '../../contexts/PermissionContext';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { PERMISSIONS } from '../../lib/permissions';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  permission?: string;
}

const coreNav: NavItem[] = [
  { label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/', permission: PERMISSIONS.DASHBOARD_VIEW },
  { label: 'Members', icon: <Users className="w-5 h-5" />, path: '/members', permission: PERMISSIONS.MEMBERS_VIEW },
  { label: 'Payments', icon: <CreditCard className="w-5 h-5" />, path: '/payments', permission: PERMISSIONS.PAYMENTS_VIEW },
];

const managementNav: NavItem[] = [
  { label: 'Memberships', icon: <Award className="w-5 h-5" />, path: '/memberships', permission: PERMISSIONS.MEMBERSHIPS_VIEW },
  { label: 'Attendance', icon: <CalendarCheck className="w-5 h-5" />, path: '/attendance', permission: PERMISSIONS.ATTENDANCE_VIEW },
  { label: 'PT', icon: <Target className="w-5 h-5" />, path: '/pt', permission: PERMISSIONS.PT_VIEW },
  { label: 'Diet Plans', icon: <Utensils className="w-5 h-5" />, path: '/diet-plans', permission: PERMISSIONS.DIET_PLANS_VIEW },
  { label: 'Body Progress', icon: <Ruler className="w-5 h-5" />, path: '/body-progress', permission: PERMISSIONS.BODY_MEASUREMENTS_VIEW },
  { label: 'Enquiries', icon: <Search className="w-5 h-5" />, path: '/enquiries', permission: PERMISSIONS.ENQUIRIES_VIEW },
  { label: 'Staff', icon: <UserCog className="w-5 h-5" />, path: '/staff', permission: PERMISSIONS.STAFF_VIEW },
  { label: 'Expenses', icon: <Receipt className="w-5 h-5" />, path: '/expenses', permission: PERMISSIONS.EXPENSES_VIEW },
];

const analyticsNav: NavItem[] = [
  { label: 'Reports', icon: <BarChart3 className="w-5 h-5" />, path: '/reports', permission: PERMISSIONS.REPORTS_VIEW },
  { label: 'WhatsApp', icon: <MessageCircle className="w-5 h-5" />, path: '/whatsapp', permission: PERMISSIONS.WHATSAPP_VIEW },
  { label: 'SMS', icon: <Smartphone className="w-5 h-5" />, path: '/sms', permission: PERMISSIONS.SMS_VIEW },
];

const systemNav: NavItem[] = [
  { label: 'Digital Cards', icon: <CardIcon className="w-5 h-5" />, path: '/digital-cards', permission: PERMISSIONS.DIGITAL_CARDS_VIEW },
  { label: 'Branches', icon: <Building2 className="w-5 h-5" />, path: '/branches', permission: PERMISSIONS.BRANCHES_VIEW },
  { label: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/settings', permission: PERMISSIONS.SETTINGS_VIEW },
  { label: 'Trash', icon: <Trash2 className="w-5 h-5" />, path: '/trash', permission: PERMISSIONS.MEMBERS_DELETE },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { profile, signOut } = useAuth();
  const { hasPermission, isOwner } = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();

  const canView = (permission?: string) => {
    if (!permission) return true;
    return isOwner || hasPermission(permission as any);
  };

  const handleNav = (path: string) => {
    navigate(path === '/' ? '/app' : `/app${path}`);
    onClose();
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const NavLink = ({ item }: { item: NavItem }) => {
    if (!canView(item.permission)) return null;
    const isActive = item.path === '/' 
      ? location.pathname === '/app' || location.pathname === '/app/' 
      : location.pathname.startsWith(`/app${item.path}`);

    return (
      <button
        onClick={() => handleNav(item.path)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-150 min-h-[44px] ${
          isActive
            ? 'bg-[#C9A24D]/10 text-[#F4F1E8] border-l-2 border-[#C9A24D] rounded-r-xl rounded-l-sm'
            : 'text-[#A7A39A] hover:text-[#F4F1E8] hover:bg-[#C9A24D]/5 rounded-xl border border-transparent'
        }`}
      >
        {item.icon}
        <span>{item.label}</span>
      </button>
    );
  };

  const NavSection = ({ title, items }: { title: string; items: NavItem[] }) => {
    const visibleItems = items.filter(item => canView(item.permission));
    if (visibleItems.length === 0) return null;
    return (
      <div className="pt-3 mt-3 border-t border-[rgba(255,255,255,0.04)]">
        <p className="px-3 py-1.5 text-xs font-semibold text-[#706D66] uppercase tracking-wider">{title}</p>
        {visibleItems.map(item => <NavLink key={item.path} item={item} />)}
      </div>
    );
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#11110F] border border-[rgba(255,255,255,0.08)] flex items-center justify-center overflow-hidden">
            <img src="/FrosterGym/froaster-logo.png" alt="Logo" className="w-6 h-6 object-contain" />
          </div>
          <span className="text-base font-bold text-[#F4F1E8] tracking-tight">Froaster Gym</span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-[#A7A39A] hover:text-[#F4F1E8] hover:bg-[#1D1B17] transition-colors lg:hidden"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center gap-3">
          <Avatar src={profile?.avatar_url} name={profile?.full_name || 'User'} size="md" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#F4F1E8] truncate">{profile?.full_name}</p>
            <Badge variant={isOwner ? 'info' : 'default'}>{isOwner ? 'Owner' : 'Staff'}</Badge>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overscroll-contain p-3 space-y-1">
        {coreNav.map(item => <NavLink key={item.path} item={item} />)}
        <NavSection title="Management" items={managementNav} />
        <NavSection title="Marketing" items={analyticsNav} />
        <NavSection title="System" items={systemNav} />
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-[rgba(255,255,255,0.08)]">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-[#706D66] hover:text-[#F4F1E8] hover:bg-[#1D1B17] transition-all duration-150 min-h-[44px]"
        >
          <LogOut className="w-5 h-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-[#0B0B0A]/60 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-72 bg-[#090908] border-r border-[rgba(255,255,255,0.08)] transition-transform duration-300 ease-out lg:translate-x-0 lg:z-30 shadow-[4px_0_24px_rgba(0,0,0,0.4)] ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

