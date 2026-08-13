
import { useAuth } from '../../contexts/AuthContext';
import { LogOut, User, Menu } from 'lucide-react';

export function TopBar() {
  const { profile, gym, signOut } = useAuth();

  return (
    <header className="h-16 bg-surface border-b border-surface-highlight flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center gap-4">
        <button className="md:hidden text-gray-400 hover:text-white">
          <Menu className="w-6 h-6" />
        </button>
        {gym && (
          <h2 className="text-lg font-semibold text-white hidden sm:block">
            {gym.name}
          </h2>
        )}
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-right">
            <p className="text-sm font-medium text-white">{profile?.full_name}</p>
            <p className="text-xs text-primary-400 capitalize">{profile?.role}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-surface-highlight border border-gray-700 flex items-center justify-center text-white">
            <User className="w-5 h-5" />
          </div>
        </div>
        
        <button 
          onClick={() => signOut()}
          className="p-2 text-gray-400 hover:text-red-400 transition-colors rounded-md hover:bg-surface-highlight"
          title="Sign Out"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
