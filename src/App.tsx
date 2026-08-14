
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/auth/Login';
import { Dashboard } from './pages/app/Dashboard';
import { MembershipPlans } from './pages/app/MembershipPlans';
import { Members } from './pages/app/Members';
import { MemberProfile } from './pages/app/MemberProfile';
import { Payments } from './pages/app/Payments';
import { Attendance } from './pages/app/Attendance';
import { Staff } from './pages/app/Staff';
import { PT } from './pages/app/PT';
import { DietPlans } from './pages/app/DietPlans';
import { Expenses } from './pages/app/Expenses';
import { Reports } from './pages/app/Reports';
import { Settings } from './pages/app/Settings';
import { Landing } from './pages/public/Landing';

function PermissionGuard({ permission, children }: { permission: string; children: React.ReactNode }) {
  const { profile, permissions, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }
  
  if (profile?.role === 'owner') {
    return <>{children}</>;
  }
  
  if (permission === 'settings') {
    return <Navigate to="/app" replace />;
  }
  
  const hasPermission = permissions.includes(permission.toLowerCase());
  if (!hasPermission) {
    return <Navigate to="/app" replace />;
  }
  
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter basename="/FrosterGym">
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/app" element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<Dashboard />} />

              <Route path="members" element={
                <PermissionGuard permission="members">
                  <Members />
                </PermissionGuard>
              } />
              <Route path="members/:id" element={
                <PermissionGuard permission="members">
                  <MemberProfile />
                </PermissionGuard>
              } />
              <Route path="memberships" element={
                <PermissionGuard permission="memberships">
                  <MembershipPlans />
                </PermissionGuard>
              } />
              <Route path="attendance" element={
                <PermissionGuard permission="attendance">
                  <Attendance />
                </PermissionGuard>
              } />
              <Route path="payments" element={
                <PermissionGuard permission="payments">
                  <Payments />
                </PermissionGuard>
              } />
              <Route path="diet-plans" element={
                <PermissionGuard permission="diet-plans">
                  <DietPlans />
                </PermissionGuard>
              } />
              <Route path="pt" element={
                <PermissionGuard permission="pt">
                  <PT />
                </PermissionGuard>
              } />
              <Route path="staff" element={
                <PermissionGuard permission="staff">
                  <Staff />
                </PermissionGuard>
              } />
              <Route path="expenses" element={
                <PermissionGuard permission="expenses">
                  <Expenses />
                </PermissionGuard>
              } />
              <Route path="reports" element={
                <PermissionGuard permission="reports">
                  <Reports />
                </PermissionGuard>
              } />

              <Route path="settings" element={
                <PermissionGuard permission="settings">
                  <Settings />
                </PermissionGuard>
              } />
              <Route path="*" element={<Navigate to="/app" replace />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
