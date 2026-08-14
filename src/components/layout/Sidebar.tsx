import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Users, CreditCard, CalendarCheck, 
  Apple, Dumbbell, UserCheck, Receipt, BarChart3, 
  Settings, X
} from 'lucide-react';
import { cn } from '../../utils/cn';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/app' },
  { icon: Users, label: 'Members', path: '/app/members' },
  { icon: CreditCard, label: 'Memberships', path: '/app/memberships' },
  { icon: Receipt, label: 'Payments', path: '/app/payments' },
  { icon: CalendarCheck, label: 'Attendance', path: '/app/attendance' },
  { icon: Apple, label: 'Diet Plans', path: '/app/diet-plans' },
  { icon: Dumbbell, label: 'Personal Training', path: '/app/pt' },
  { icon: UserCheck, label: 'Staff', path: '/app/staff' },
  { icon: Receipt, label: 'Expenses', path: '/app/expenses' },
  { icon: BarChart3, label: 'Reports', path: '/app/reports' },
  { icon: Settings, label: 'Settings', path: '/app/settings' },
];

export function Sidebar({ isOpen, onClose }: { isOpen?: boolean; onClose?: () => void }) {
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={onClose}
        />
      )}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-surface border-r border-surface-highlight transform transition-transform duration-200 ease-in-out md:relative md:translate-x-0 md:flex",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tighter text-white">
            FROASTER<span className="text-primary-500">.</span>
          </h1>
          <button onClick={onClose} className="md:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors text-sm font-medium",
                isActive 
                  ? "bg-primary-500/10 text-primary-400" 
                  : "text-gray-400 hover:text-gray-200 hover:bg-surface-highlight"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
    </>
  );
}
