import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { getDefaultPathForRole, getUserPermissions } from '@/lib/supabase';
import { Loader2, ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
  '/trips': 'trips',
} as const;

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, permissions, role } = useAuth();
  const location = useLocation();

  // Show loading only if we're still checking for session (first 3 seconds)
  // After that, allow render even if permissions aren't ready yet
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
  
  // If user exists but permissions not ready yet, allow render with optimistic permissions
  // This prevents blocking the UI while role is fetched in background
  if (user && !permissions) {
    // Use optimistic permissions based on email prefix
    const emailPrefix = (user.email?.split('@')[0] || '').toLowerCase();
    const optimisticRole = ['admin', 'manager', 'finance', 'sales', 'operations', 'marketing', 'customers', 'suppliers', 'trips'].includes(emailPrefix) 
      ? emailPrefix as any 
      : 'marketing';
    const optimisticPermissions = getUserPermissions(optimisticRole);
    
    // Check permission with optimistic permissions
    const pathname = location.pathname as keyof typeof pathPermissionMap;
    const required = pathPermissionMap[pathname];
    if (required && optimisticPermissions[required] !== true) {
      const fallback = optimisticRole ? getDefaultPathForRole(optimisticRole) : '/login';
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-md w-full text-center shadow-lg">
            <CardHeader className="space-y-4">
              <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
                <ShieldX className="w-8 h-8 text-destructive" />
              </div>
              <CardTitle className="text-2xl">غير مصرح بالوصول</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                عذراً، ليس لديك صلاحية للوصول إلى هذا القسم.
                <br />
                يرجى التواصل مع المدير للحصول على الصلاحيات المطلوبة.
              </p>
              <div className="pt-4">
                <Button
                  className="w-full"
                  onClick={() => {
                    window.location.href = fallback;
                  }}
                >
                  العودة إلى لوحة التحكم
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    
    return <>{children}</>;
  }

  // Authorization: block access if user lacks permission for the current path
  const pathname = location.pathname as keyof typeof pathPermissionMap;
  const required = pathPermissionMap[pathname];
  if (required && permissions && permissions[required] !== true) {
    const fallback = role ? getDefaultPathForRole(role) : '/login';
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="max-w-md w-full text-center shadow-lg">
          <CardHeader className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-destructive/10 rounded-full flex items-center justify-center">
              <ShieldX className="w-8 h-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl">غير مصرح بالوصول</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              عذراً، ليس لديك صلاحية للوصول إلى هذا القسم.
              <br />
              يرجى التواصل مع المدير للحصول على الصلاحيات المطلوبة.
            </p>
            <div className="pt-4">
              <Button
                className="w-full"
                onClick={() => {
                  window.location.href = fallback;
                }}
              >
                العودة إلى لوحة التحكم
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
