import { rolePermissions, type UserPermissions, type UserRole } from '../src/lib/supabase';
import { readFileSync } from 'fs';
import path from 'path';

// Basic sanity test that roles contain dashboard/reports/charts for non-admin roles per CURRENT_STATE.md
describe('Role permissions consistency', () => {
  const roles: UserRole[] = ['admin', 'manager', 'finance', 'sales', 'operations', 'marketing'];

  test('non-admin roles should have dashboard/reports/charts true per CURRENT_STATE.md', () => {
    for (const role of roles) {
      const perms: UserPermissions = rolePermissions[role];
      expect(perms).toBeDefined();
      expect(typeof perms.dashboard).toBe('boolean');
      expect(typeof perms.reports).toBe('boolean');
      expect(typeof perms.charts).toBe('boolean');
    }
    // Spot check finance/sales/operations/marketing are true for charts/reports/dashboard
    expect(rolePermissions.finance.dashboard).toBe(true);
    expect(rolePermissions.finance.reports).toBe(true);
    expect(rolePermissions.finance.charts).toBe(true);
    expect(rolePermissions.sales.dashboard).toBe(true);
    expect(rolePermissions.sales.reports).toBe(true);
    expect(rolePermissions.sales.charts).toBe(true);
    expect(rolePermissions.operations.dashboard).toBe(true);
    expect(rolePermissions.operations.reports).toBe(true);
    expect(rolePermissions.operations.charts).toBe(true);
    expect(rolePermissions.marketing.dashboard).toBe(true);
    expect(rolePermissions.marketing.reports).toBe(true);
    expect(rolePermissions.marketing.charts).toBe(true);
  });
});


