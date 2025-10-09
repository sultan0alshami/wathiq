// Mock Supabase for Jest tests
import { createClient } from '@supabase/supabase-js';

// Mock environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://mock-supabase-url.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'mock-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type UserRole = 'admin' | 'manager' | 'finance' | 'sales' | 'operations' | 'marketing';

export interface UserPermissions {
  dashboard: boolean;
  reports: boolean;
  charts: boolean;
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
    dashboard: true,
    reports: true,
    charts: true,
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
    dashboard: true,
    reports: true,
    charts: true,
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
    dashboard: true,
    reports: true,
    charts: true,
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
    dashboard: true,
    reports: true,
    charts: true,
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

export function getUserPermissions(role: UserRole | null): UserPermissions {
  if (!role) {
    return {
      dashboard: false,
      reports: false,
      charts: false,
      finance: false,
      sales: false,
      operations: false,
      marketing: false,
      customers: false,
      suppliers: false,
      canExport: false,
      canManage: false,
    };
  }
  return rolePermissions[role] || rolePermissions.finance;
}

