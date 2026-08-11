// @ts-nocheck
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { PermissionProvider } from './contexts/PermissionContext';
import { ToastProvider } from './components/ui/Toast';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';

// Public Website
import { PublicWebsite } from './pages/website/PublicWebsite';

// Members
import { MembersList } from './pages/members/MembersList';
import { AddMember } from './pages/members/AddMember';
import { MemberProfile } from './pages/members/MemberProfile';
import { RenewMembership } from './pages/members/RenewMembership';
import { EditMember } from './pages/members/EditMember';

// Plans
import { PlansList } from './pages/plans/PlansList';
import { AddPlan } from './pages/plans/AddPlan';

// Payments
import { PaymentsList } from './pages/payments/PaymentsList';
import { RecordPayment } from './pages/payments/RecordPayment';
import { InvoiceView } from './pages/payments/InvoiceView';

// Attendance
import { AttendanceScreen } from './pages/attendance/AttendanceScreen';

// Diet
import { DietPlansList } from './pages/diet/DietPlansList';
import { AddDietPlan } from './pages/diet/AddDietPlan';

// Staff
import StaffList from "./pages/staff/StaffList";
import AddStaff from "./pages/staff/AddStaff";

// Expenses
import { ExpensesList } from './pages/expenses/ExpensesList';
import { AddExpense } from './pages/expenses/AddExpense';

// Reports
import { ReportsDashboard } from './pages/reports/ReportsDashboard';

// PT & Body Progress
import { PTDashboard } from './pages/pt/PTDashboard';

// Remaining Features
import { ServicesList } from './pages/services/ServicesList';
import { BatchesList } from './pages/batches/BatchesList';

// Settings
import { SettingsScreen } from './pages/settings/SettingsScreen';

export default function App() {
  return (
    <HashRouter>
      <ToastProvider>
        <AuthProvider>
          <PermissionProvider>
            <Routes>
              {/* Public Website Route */}
              <Route path="/" element={<PublicWebsite />} />

              {/* Auth Route */}
              <Route path="/login" element={<Login />} />

              {/* Admin / SaaS App Routes */}
              <Route
                path="/app"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />

                {/* Members */}
                <Route path="members">
                  <Route index element={<MembersList />} />
                  <Route path="add" element={<AddMember />} />
                  <Route path=":id" element={<MemberProfile />} />
                  <Route path=":id/edit" element={<EditMember />} />
                  <Route path=":id/renew" element={<RenewMembership />} />
                </Route>

                {/* Membership Plans */}
                <Route path="memberships">
                  <Route index element={<PlansList />} />
                  <Route path="add" element={<AddPlan />} />
                </Route>

                {/* Payments */}
                <Route path="payments">
                  <Route index element={<PaymentsList />} />
                  <Route path="record" element={<RecordPayment />} />
                  <Route path="invoice/:id" element={<InvoiceView />} />
                </Route>

                {/* Attendance */}
                <Route path="attendance" element={<AttendanceScreen />} />

                {/* Diet Plans */}
                <Route path="diet-plans">
                  <Route index element={<DietPlansList />} />
                  <Route path="add" element={<AddDietPlan />} />
                </Route>

                {/* Staff */}
                <Route path="staff">
                  <Route index element={<StaffList />} />
                  <Route path="add" element={<AddStaff />} />
                </Route>

                {/* Expenses */}
                <Route path="expenses">
                  <Route index element={<ExpensesList />} />
                  <Route path="add" element={<AddExpense />} />
                </Route>

                {/* Reports */}
                <Route path="reports" element={<ReportsDashboard />} />

                {/* PT Dashboard */}
                <Route path="pt" element={<PTDashboard />} />

                {/* Services */}
                <Route path="services" element={<ServicesList />} />

                {/* Batches */}
                <Route path="batches" element={<BatchesList />} />

                {/* Settings */}
                <Route path="settings" element={<SettingsScreen />} />
              </Route>
              
              {/* Fallback to Catch-All */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </PermissionProvider>
        </AuthProvider>
      </ToastProvider>
    </HashRouter>
  );
}

