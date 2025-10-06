import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: 'wathiq-auth',
  },
});

// User roles and permissions
export type UserRole = 'admin' | 'manager' | 'finance' | 'sales' | 'operations' | 'marketing' | 'customers' | 'suppliers';

export interface UserPermissions {
  // top-level app
  dashboard: boolean;
  reports: boolean;
  charts: boolean;
  // domain sections
  finance: boolean;
  sales: boolean;
  operations: boolean;
  marketing: boolean;
  customers: boolean;
  suppliers: boolean;
  canExport: boolean;
  canManage: boolean;
}

export const rolePermissions: Record<UserRole, UserPermissions> = {
  admin: {
    dashboard: true,
    reports: true,
    charts: true,
    finance: true,
    sales: true,
    operations: true,
    marketing: true,
    customers: true,
    suppliers: true,
    canExport: true,
    canManage: true,
  },
  manager: {
    // Give manager full visibility like admin (to ensure usability)
    dashboard: true,
    reports: true,
    charts: true,
    finance: true,
    sales: true,
    operations: true,
    marketing: true,
    customers: true,
    suppliers: true,
    canExport: true,
    canManage: false,
  },
  finance: {
    dashboard: false,
    reports: false,
    charts: false,
    finance: true,
    sales: false,
    operations: false,
    marketing: false,
    customers: false,
    suppliers: false,
    canExport: false,
    canManage: false,
  },
  sales: {
    dashboard: false,
    reports: false,
    charts: false,
    finance: false,
    sales: true,
    operations: false,
    marketing: false,
    customers: false,
    suppliers: false,
    canExport: false,
    canManage: false,
  },
  operations: {
    dashboard: false,
    reports: false,
    charts: false,
    finance: false,
    sales: false,
    operations: true,
    marketing: false,
    customers: false,
    suppliers: false,
    canExport: false,
    canManage: false,
  },
  marketing: {
    dashboard: false,
    reports: false,
    charts: false,
    finance: false,
    sales: false,
    operations: false,
    marketing: true,
    customers: false,
    suppliers: false,
    canExport: false,
    canManage: false,
  },
  customers: {
    dashboard: false,
    reports: false,
    charts: false,
    finance: false,
    sales: false,
    operations: false,
    marketing: false,
    customers: true,
    suppliers: false,
    canExport: false,
    canManage: false,
  },
  suppliers: {
    dashboard: false,
    reports: false,
    charts: false,
    finance: false,
    sales: false,
    operations: false,
    marketing: false,
    customers: false,
    suppliers: true,
    canExport: false,
    canManage: false,
  },
};

export const getUserPermissions = (role: UserRole): UserPermissions => {
  return rolePermissions[role] || rolePermissions.marketing;
};

export const getDefaultPathForRole = (role: UserRole): string => {
  switch (role) {
    case 'admin':
      return '/';
    case 'manager':
      return '/';
    case 'finance':
      return '/finance';
    case 'sales':
      return '/sales';
    case 'operations':
      return '/operations';
    case 'marketing':
      return '/marketing';
    case 'customers':
      return '/customers';
    case 'suppliers':
      return '/suppliers';
    default:
      return '/login';
  }
};
