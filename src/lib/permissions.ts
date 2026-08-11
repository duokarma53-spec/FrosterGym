export const PERMISSIONS = {
  // Dashboard
  DASHBOARD_VIEW: 'dashboard.view',

  // Members
  MEMBERS_VIEW: 'members.view',
  MEMBERS_CREATE: 'members.create',
  MEMBERS_EDIT: 'members.edit',
  MEMBERS_DELETE: 'members.delete',

  // Memberships
  MEMBERSHIPS_VIEW: 'memberships.view',
  MEMBERSHIPS_MANAGE: 'memberships.manage',

  // Payments
  PAYMENTS_VIEW: 'payments.view',
  PAYMENTS_MANAGE: 'payments.manage',

  // Attendance
  ATTENDANCE_VIEW: 'attendance.view',
  ATTENDANCE_MANAGE: 'attendance.manage',

  // PT
  PT_VIEW: 'pt.view',
  PT_MANAGE: 'pt.manage',

  // Services
  SERVICES_VIEW: 'services.view',
  SERVICES_MANAGE: 'services.manage',

  // Batches
  BATCHES_VIEW: 'batches.view',
  BATCHES_MANAGE: 'batches.manage',

  // Diet Plans
  DIET_PLANS_VIEW: 'diet_plans.view',
  DIET_PLANS_MANAGE: 'diet_plans.manage',

  // Body Measurements
  BODY_MEASUREMENTS_VIEW: 'body_measurements.view',
  BODY_MEASUREMENTS_MANAGE: 'body_measurements.manage',

  // Staff
  STAFF_VIEW: 'staff.view',
  STAFF_MANAGE: 'staff.manage',

  // Enquiries
  ENQUIRIES_VIEW: 'enquiries.view',
  ENQUIRIES_MANAGE: 'enquiries.manage',

  // Expenses
  EXPENSES_VIEW: 'expenses.view',
  EXPENSES_MANAGE: 'expenses.manage',

  // Reports
  REPORTS_VIEW: 'reports.view',

  // WhatsApp
  WHATSAPP_VIEW: 'whatsapp.view',

  // SMS
  SMS_VIEW: 'sms.view',

  // Branches
  BRANCHES_VIEW: 'branches.view',
  BRANCHES_MANAGE: 'branches.manage',

  // Digital Cards
  DIGITAL_CARDS_VIEW: 'digital_cards.view',

  // Settings
  SETTINGS_VIEW: 'settings.view',
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: Permission[] = Object.values(PERMISSIONS);

export const PERMISSION_GROUPS = {
  Dashboard: [PERMISSIONS.DASHBOARD_VIEW],
  Members: [
    PERMISSIONS.MEMBERS_VIEW,
    PERMISSIONS.MEMBERS_CREATE,
    PERMISSIONS.MEMBERS_EDIT,
    PERMISSIONS.MEMBERS_DELETE,
  ],
  Memberships: [PERMISSIONS.MEMBERSHIPS_VIEW, PERMISSIONS.MEMBERSHIPS_MANAGE],
  Payments: [PERMISSIONS.PAYMENTS_VIEW, PERMISSIONS.PAYMENTS_MANAGE],
  Attendance: [PERMISSIONS.ATTENDANCE_VIEW, PERMISSIONS.ATTENDANCE_MANAGE],
  'Personal Training': [PERMISSIONS.PT_VIEW, PERMISSIONS.PT_MANAGE],
  Services: [PERMISSIONS.SERVICES_VIEW, PERMISSIONS.SERVICES_MANAGE],
  Batches: [PERMISSIONS.BATCHES_VIEW, PERMISSIONS.BATCHES_MANAGE],
  'Diet Plans': [PERMISSIONS.DIET_PLANS_VIEW, PERMISSIONS.DIET_PLANS_MANAGE],
  'Body Measurements': [PERMISSIONS.BODY_MEASUREMENTS_VIEW, PERMISSIONS.BODY_MEASUREMENTS_MANAGE],
  Staff: [PERMISSIONS.STAFF_VIEW, PERMISSIONS.STAFF_MANAGE],
  Enquiries: [PERMISSIONS.ENQUIRIES_VIEW, PERMISSIONS.ENQUIRIES_MANAGE],
  Expenses: [PERMISSIONS.EXPENSES_VIEW, PERMISSIONS.EXPENSES_MANAGE],
  Reports: [PERMISSIONS.REPORTS_VIEW],
  WhatsApp: [PERMISSIONS.WHATSAPP_VIEW],
  SMS: [PERMISSIONS.SMS_VIEW],
  Branches: [PERMISSIONS.BRANCHES_VIEW, PERMISSIONS.BRANCHES_MANAGE],
  Settings: [PERMISSIONS.SETTINGS_VIEW],
} as const;
