import { ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Unauthorized() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
        <ShieldAlert className="w-8 h-8 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
      <p className="text-gray-400 max-w-md mb-8">
        You don't have permission to access this module. If you believe this is a mistake, please contact the gym owner.
      </p>
      <button 
        onClick={() => navigate('/app')}
        className="bg-surface border border-surface-highlight hover:bg-surface-highlight text-white px-6 py-2 rounded-lg font-medium transition-colors"
      >
        Return to Dashboard
      </button>
    </div>
  );
}
