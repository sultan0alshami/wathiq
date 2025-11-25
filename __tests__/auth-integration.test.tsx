import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../src/components/ProtectedRoute';
import * as AuthContext from '../src/contexts/AuthContext';
import { getUserPermissions, type UserRole } from '../src/lib/supabase';

// Mock components for different sections
const DashboardPage = () => <div>Dashboard Page</div>;
const FinancePage = () => <div>Finance Page</div>;
const SalesPage = () => <div>Sales Page</div>;
const OperationsPage = () => <div>Operations Page</div>;
const MarketingPage = () => <div>Marketing Page</div>;
const UnauthorizedPage = () => <div>غير مصرح - Unauthorized</div>;

// Mock useAuth hook
const mockUseAuth = jest.spyOn(AuthContext, 'useAuth');

// Helper to create mock auth return value
const createMockAuth = (role: UserRole | null, loading = false) => {
  const permissions = role ? getUserPermissions(role) : getUserPermissions('marketing');

  return {
    user: role ? { id: `test-${role}`, email: `${role}@test.com` } as any : null,
    session: role ? {} as any : null,
    role,
    userName: role ? `${role} Test User` : null,
    permissions,
    loading,
    signIn: jest.fn(),
    signOut: jest.fn(),
  };
};

// Test wrapper component
const TestWrapper: React.FC<{
  role: UserRole | null;
  loading?: boolean;
  initialRoute: string;
  children: React.ReactNode;
}> = ({ role, loading = false, initialRoute, children }) => {
  const authValue = createMockAuth(role, loading);
  
  // Mock the useAuth hook to return our test values
  mockUseAuth.mockReturnValue(authValue);

  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      {children}
    </MemoryRouter>
  );
};

describe('Auth Integration - Protected Routes', () => {
  describe('Finance Role Access Control', () => {
    it('should allow finance user to access finance page', async () => {
      render(
        <TestWrapper role="finance" initialRoute="/manager/finance">
          <Routes>
            <Route
              path="/manager/finance"
              element={
                <ProtectedRoute>
                  <FinancePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Finance Page')).toBeInTheDocument();
      });
    });

    it('should block finance user from accessing sales page', async () => {
      render(
        <TestWrapper role="finance" initialRoute="/manager/sales">
          <Routes>
            <Route
              path="/manager/sales"
              element={
                <ProtectedRoute>
                  <SalesPage />
                </ProtectedRoute>
              }
            />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />
          </Routes>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText('Sales Page')).not.toBeInTheDocument();
        // Should show unauthorized UI (ProtectedRoute renders this internally)
        expect(screen.getByText(/غير مصرح/i)).toBeInTheDocument();
      });
    });

    it('should block finance user from operations page', async () => {
      render(
        <TestWrapper role="finance" initialRoute="/manager/operations">
          <Routes>
            <Route
              path="/manager/operations"
              element={
                <ProtectedRoute>
                  <OperationsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText('Operations Page')).not.toBeInTheDocument();
        expect(screen.getByText(/غير مصرح/i)).toBeInTheDocument();
      });
    });

    it('should block finance user from marketing page', async () => {
      render(
        <TestWrapper role="finance" initialRoute="/manager/marketing">
          <Routes>
            <Route
              path="/manager/marketing"
              element={
                <ProtectedRoute>
                  <MarketingPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText('Marketing Page')).not.toBeInTheDocument();
        expect(screen.getByText(/غير مصرح/i)).toBeInTheDocument();
      });
    });
  });

  describe('Sales Role Access Control', () => {
    it('should allow sales user to access sales page', async () => {
      render(
        <TestWrapper role="sales" initialRoute="/manager/sales">
          <Routes>
            <Route
              path="/manager/sales"
              element={
                <ProtectedRoute>
                  <SalesPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Sales Page')).toBeInTheDocument();
      });
    });

    it('should block sales user from finance page', async () => {
      render(
        <TestWrapper role="sales" initialRoute="/manager/finance">
          <Routes>
            <Route
              path="/manager/finance"
              element={
                <ProtectedRoute>
                  <FinancePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText('Finance Page')).not.toBeInTheDocument();
        expect(screen.getByText(/غير مصرح/i)).toBeInTheDocument();
      });
    });
  });

  describe('Operations Role Access Control', () => {
    it('should allow operations user to access operations page', async () => {
      render(
        <TestWrapper role="operations" initialRoute="/manager/operations">
          <Routes>
            <Route
              path="/manager/operations"
              element={
                <ProtectedRoute>
                  <OperationsPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Operations Page')).toBeInTheDocument();
      });
    });

    it('should block operations user from sales page', async () => {
      render(
        <TestWrapper role="operations" initialRoute="/manager/sales">
          <Routes>
            <Route
              path="/manager/sales"
              element={
                <ProtectedRoute>
                  <SalesPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText('Sales Page')).not.toBeInTheDocument();
        expect(screen.getByText(/غير مصرح/i)).toBeInTheDocument();
      });
    });
  });

  describe('Marketing Role Access Control', () => {
    it('should allow marketing user to access marketing page', async () => {
      render(
        <TestWrapper role="marketing" initialRoute="/manager/marketing">
          <Routes>
            <Route
              path="/manager/marketing"
              element={
                <ProtectedRoute>
                  <MarketingPage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText('Marketing Page')).toBeInTheDocument();
      });
    });

    it('should block marketing user from finance page', async () => {
      render(
        <TestWrapper role="marketing" initialRoute="/manager/finance">
          <Routes>
            <Route
              path="/manager/finance"
              element={
                <ProtectedRoute>
                  <FinancePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText('Finance Page')).not.toBeInTheDocument();
        expect(screen.getByText(/غير مصرح/i)).toBeInTheDocument();
      });
    });
  });

  describe('Admin Role Access Control', () => {
    it('should allow admin to access all pages', async () => {
      const pages = [
        { route: '/manager/finance', component: FinancePage, text: 'Finance Page' },
        { route: '/manager/sales', component: SalesPage, text: 'Sales Page' },
        { route: '/manager/operations', component: OperationsPage, text: 'Operations Page' },
        { route: '/manager/marketing', component: MarketingPage, text: 'Marketing Page' },
      ];

      for (const page of pages) {
        const { unmount } = render(
          <TestWrapper role="admin" initialRoute={page.route}>
            <Routes>
              <Route
                path={page.route}
                element={
                  <ProtectedRoute>
                    <page.component />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText(page.text)).toBeInTheDocument();
        });

        unmount();
      }
    });
  });

  describe('Manager Role Access Control', () => {
    it('should allow manager to access all section pages', async () => {
      const pages = [
        { route: '/manager/finance', component: FinancePage, text: 'Finance Page' },
        { route: '/manager/sales', component: SalesPage, text: 'Sales Page' },
        { route: '/manager/operations', component: OperationsPage, text: 'Operations Page' },
        { route: '/manager/marketing', component: MarketingPage, text: 'Marketing Page' },
      ];

      for (const page of pages) {
        const { unmount } = render(
          <TestWrapper role="manager" initialRoute={page.route}>
            <Routes>
              <Route
                path={page.route}
                element={
                  <ProtectedRoute>
                    <page.component />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </TestWrapper>
        );

        await waitFor(() => {
          expect(screen.getByText(page.text)).toBeInTheDocument();
        });

        unmount();
      }
    });
  });

  describe('Unauthenticated Access', () => {
    it('should redirect unauthenticated users to login', async () => {
      const LoginPage = () => <div>Login Page</div>;

      render(
        <TestWrapper role={null} initialRoute="/manager/finance">
          <Routes>
            <Route
              path="/manager/finance"
              element={
                <ProtectedRoute>
                  <FinancePage />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.queryByText('Finance Page')).not.toBeInTheDocument();
        expect(screen.getByText('Login Page')).toBeInTheDocument();
      });
    });
  });

  describe('Loading State', () => {
    it('should show loading state while auth is initializing', async () => {
      render(
        <TestWrapper role="finance" loading={true} initialRoute="/manager/finance">
          <Routes>
            <Route
              path="/manager/finance"
              element={
                <ProtectedRoute>
                  <FinancePage />
                </ProtectedRoute>
              }
            />
          </Routes>
        </TestWrapper>
      );

      await waitFor(() => {
        expect(screen.getByText(/جاري التحميل/i)).toBeInTheDocument();
        expect(screen.queryByText('Finance Page')).not.toBeInTheDocument();
      });
    });
  });
});

