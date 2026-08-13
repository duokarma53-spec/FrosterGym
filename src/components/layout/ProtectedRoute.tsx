
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export function ProtectedRoute() {
  const { user, profile, gym, isLoading, error } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center text-white">
        <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-red-500 mb-2">Authentication Error</h2>
          <p className="text-gray-300">{error.message || 'Failed to load profile data.'}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Optional: Enforce that user must have a profile and gym to use the app
  if (!profile || !gym) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center text-white">
        <div className="bg-yellow-900/20 border border-amber-500/50 rounded-lg p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-amber-500 mb-2">Account Setup Required</h2>
          <p className="text-gray-300">Your account is missing profile or gym information.</p>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
