import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultPathForRole } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const pathPermissionMap = {
  '/': 'dashboard',
  '/reports': 'reports',
  '/finance': 'finance',
  '/sales': 'sales',
  '/operations': 'operations',
  '/marketing': 'marketing',
  '/customers': 'customers',
  '/suppliers': 'suppliers',
  '/charts': 'charts',
  '/download': 'canExport',
} as const;

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, permissions, role } = useAuth();
  const location = useLocation();

  if (loading && !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin text-wathiq-primary mx-auto" />
          <p className="text-lg text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  // If user exists but permissions not ready yet, allow render and wait for context to update
  if (user && !permissions) return <>{children}</>;

  // Authorization: block access if user lacks permission for the current path
  const pathname = location.pathname as keyof typeof pathPermissionMap;
  const required = pathPermissionMap[pathname];
  if (required && permissions && permissions[required] !== true) {
    const fallback = role ? getDefaultPathForRole(role) : '/login';
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
