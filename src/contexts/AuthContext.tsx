import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, UserRole, UserPermissions, getUserPermissions } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: UserRole | null;
  userName: string | null;
  permissions: UserPermissions | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserRole(session.user.id, session.user.email || undefined);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserRole(session.user.id, session.user.email || undefined);
      } else {
        setRole(null);
        setUserName(null);
        setPermissions(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const inferRoleFromEmail = (email: string): UserRole => {
    const prefix = (email.split('@')[0] || '').toLowerCase();
    const candidates: UserRole[] = ['admin', 'manager', 'finance', 'sales', 'operations', 'marketing', 'customers', 'suppliers'];
    return (candidates.includes(prefix as UserRole) ? (prefix as UserRole) : 'marketing');
  };

  // No static fallback names. We always prefer DB value; if missing, show email.

  const fetchUserRole = async (userId: string, emailForInference?: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, name')
        .eq('user_id', userId)
        .single();

      const dbRole = (data?.role as UserRole) || null;
      if (dbRole) {
        const displayName = (data?.name as string) || (emailForInference || user?.email || '');
        setRole(dbRole);
        setUserName(displayName);
        setPermissions(getUserPermissions(dbRole));
      } else {
        const emailRole = inferRoleFromEmail(emailForInference || user?.email || '');
        setRole(emailRole);
        setUserName(emailForInference || user?.email || '');
        setPermissions(getUserPermissions(emailRole));
      }
    } catch (error) {
      console.error('Error:', error);
      const emailRole = inferRoleFromEmail(emailForInference || user?.email || '');
      setRole(emailRole);
      setUserName(emailForInference || user?.email || '');
      setPermissions(getUserPermissions(emailRole));
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (_e) {
      // ignore
    } finally {
      try {
        if (typeof window !== 'undefined') {
          // Remove Supabase persisted sessions
          try { localStorage.removeItem('wathiq-auth'); } catch {}
          Object.keys(localStorage).forEach((k) => {
            if (k.startsWith('sb-')) localStorage.removeItem(k);
          });
          sessionStorage.clear();
        }
      } catch (_ignore) {}
      setSession(null);
      setUser(null);
      setRole(null);
      setUserName(null);
      setPermissions(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        userName,
        permissions,
        loading,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
