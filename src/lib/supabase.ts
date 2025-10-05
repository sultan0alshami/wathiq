import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// User roles and permissions
export type UserRole = 'admin' | 'manager' | 'finance' | 'sales' | 'operations' | 'marketing';

export interface UserPermissions {
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
    finance: true,
    sales: false,
    operations: false,
    marketing: false,
    customers: false,
    suppliers: true,
    canExport: false,
    canManage: false,
  },
  sales: {
    finance: false,
    sales: true,
    operations: false,
    marketing: false,
    customers: true,
    suppliers: false,
    canExport: false,
    canManage: false,
  },
  operations: {
    finance: false,
    sales: false,
    operations: true,
    marketing: false,
    customers: false,
    suppliers: true,
    canExport: false,
    canManage: false,
  },
  marketing: {
    finance: false,
    sales: false,
    operations: false,
    marketing: true,
    customers: true,
    suppliers: false,
    canExport: false,
    canManage: false,
  },
};

export const getUserPermissions = (role: UserRole): UserPermissions => {
  return rolePermissions[role] || rolePermissions.marketing;
};
