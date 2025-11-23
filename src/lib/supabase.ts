import { createClient } from '@supabase/supabase-js';
import { STORAGE_KEYS } from '@/lib/storageKeys';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate only in the browser to avoid failing static builds if envs are unset at build time.
if (typeof window !== 'undefined') {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      '❌ Missing Supabase configuration. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env (and Vercel envs).'
    );
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
    storageKey: STORAGE_KEYS.AUTH,
  },
});

// User roles and permissions
export type UserRole =
  | 'admin'
  | 'manager'
  | 'finance'
  | 'sales'
  | 'operations'
  | 'marketing'
  | 'customers'
  | 'suppliers'
  | 'trips';

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
  trips: boolean;
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
    trips: true,
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
    trips: true,
    canExport: true,
    canManage: false,
  },
  finance: {
    dashboard: true,
    reports: true,
    charts: true,
    finance: true,
    sales: false,
    operations: false,
    marketing: false,
    customers: false,
    suppliers: true,
    trips: false,
    canExport: false,
    canManage: false,
  },
  sales: {
    dashboard: true,
    reports: true,
    charts: true,
    finance: false,
    sales: true,
    operations: false,
    marketing: false,
    customers: true,
    suppliers: false,
    trips: false,
    canExport: false,
    canManage: false,
  },
  operations: {
    dashboard: true,
    reports: true,
    charts: true,
    finance: false,
    sales: false,
    operations: true,
    marketing: false,
    customers: false,
    suppliers: true,
    trips: true,
    canExport: false,
    canManage: false,
  },
  marketing: {
    dashboard: true,
    reports: true,
    charts: true,
    finance: false,
    sales: false,
    operations: false,
    marketing: true,
    customers: true,
    suppliers: false,
    trips: false,
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
    trips: false,
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
    trips: false,
    canExport: false,
    canManage: false,
  },
  trips: {
    dashboard: false,
    reports: false,
    charts: false,
    finance: false,
    sales: false,
    operations: false,
    marketing: false,
    customers: false,
    suppliers: false,
    trips: true,
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
      return '/admin';
    case 'manager':
      return '/manager';
    case 'finance':
      return '/manager/finance';
    case 'sales':
      return '/manager/sales';
    case 'operations':
      return '/manager/operations';
    case 'marketing':
      return '/manager/marketing';
    case 'customers':
      return '/manager/customers';
    case 'suppliers':
      return '/manager/suppliers';
    case 'trips':
      return '/manager/trips';
    default:
      return '/login';
  }
};
