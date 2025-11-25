import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from '../src/components/ProtectedRoute';
import { UserPermissions, UserRole } from '../src/lib/supabase';
import { createContext, useContext } from 'react';

// Create a lightweight mock AuthContext matching shape consumed by ProtectedRoute
const MockAuthContext = createContext<any>(null);
const useMockAuth = () => useContext(MockAuthContext);

// Shim module import used by ProtectedRoute
jest.mock('../src/contexts/AuthContext', () => ({
  useAuth: () => useMockAuth(),
}));

function renderWithAuth(ui: React.ReactNode, ctx: any, initialPath = '/manager/finance') {
  return render(
    <MockAuthContext.Provider value={ctx}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route path="/login" element={<div>LOGIN</div>} />
          <Route path="/manager" element={<div>MANAGER</div>} />
          <Route path="/manager/finance" element={<ProtectedRoute><div>FINANCE</div></ProtectedRoute>} />
          <Route path="/manager/marketing" element={<ProtectedRoute><div>MARKETING</div></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>
    </MockAuthContext.Provider>
  );
}

const baseCtx = {
  user: { id: 'u1', email: 'finance@wathiq.com' },
  loading: false,
  role: 'finance' as UserRole,
};

const financePerms: UserPermissions = {
  dashboard: true,
  reports: true,
  charts: true,
  finance: true,
  sales: false,
  operations: false,
  marketing: false,
  customers: false,
  suppliers: true,
  trips: true,
  canExport: false,
  canManage: false,
};

describe('ProtectedRoute behavior', () => {
  test('permits access when permission is allowed', () => {
    renderWithAuth(<div />, { ...baseCtx, permissions: financePerms }, '/manager/finance');
    expect(screen.getByText('FINANCE')).toBeInTheDocument();
  });

  test('blocks access and shows unauthorized UI when permission denied', () => {
    renderWithAuth(<div />, { ...baseCtx, permissions: financePerms }, '/manager/marketing');
    expect(screen.queryByText('MARKETING')).not.toBeInTheDocument();
    // Unauthorized Arabic title text from ProtectedRoute
    expect(screen.getByText('غير مصرح بالوصول')).toBeInTheDocument();
  });
});
