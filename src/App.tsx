
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

              <Route path="members" element={<Members />} />
              <Route path="members/:id" element={<MemberProfile />} />
              <Route path="memberships" element={<MembershipPlans />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="payments" element={<Payments />} />
              <Route path="diet-plans" element={<DietPlans />} />
              <Route path="pt" element={<PT />} />
              <Route path="staff" element={<Staff />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="reports" element={<Reports />} />

              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<Navigate to="/app" replace />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
