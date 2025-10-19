import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, createClient } from '@supabase/supabase-js';
import { supabase, UserRole, UserPermissions, getUserPermissions } from '@/lib/supabase';
import { STORAGE_KEYS } from '@/lib/storageKeys';

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
    console.log('[AuthContext] Initializing authentication...');
    
    // Add timeout to prevent hanging
    const initTimeout = setTimeout(() => {
      console.warn('[AuthContext] Initialization timeout, setting loading to false');
      setLoading(false);
    }, 10000); // 10 second timeout
    
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('[AuthContext] Initial session:', session ? 'Found' : 'Not found');
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        console.log('[AuthContext] Fetching user role for:', session.user.email);
        await fetchUserRole(session.user.id, session.user.email || undefined);
      }
      setLoading(false);
      clearTimeout(initTimeout);
      console.log('[AuthContext] Initial auth loading complete');
    }).catch((error) => {
      console.error('[AuthContext] Error getting initial session:', error);
      setLoading(false);
      clearTimeout(initTimeout);
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
    console.log('[AuthContext] fetchUserRole called for:', userId, emailForInference);
    
    try {
      const email = emailForInference || user?.email || '';
      const emailRole = inferRoleFromEmail(email);
      
      // Fetch user name from database using the correct column structure
      let displayName = email; // Default fallback
      
      try {
        console.log('[AuthContext] Fetching name from user_roles table using id column...');
        
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Database timeout')), 5000); // 5 second timeout
        });
        
        // Query user_roles table using regular client
        const dbPromise = supabase
          .from('user_roles')
          .select('name')
          .eq('user_id', userId)
          .single();
          
        const { data: userData, error: dbError } = await Promise.race([dbPromise, timeoutPromise]) as any;
        
        if (!dbError && userData?.name) {
          displayName = userData.name;
          console.log('[AuthContext] Successfully fetched name from database:', displayName);
        } else {
          console.warn('[AuthContext] Database query failed:', dbError?.message || 'No data found');
        }
      } catch (dbError) {
        console.warn('[AuthContext] Database lookup failed:', dbError);
      }
      
      setRole(emailRole);
      setUserName(displayName);
      setPermissions(getUserPermissions(emailRole));
      console.log('[AuthContext] Set role from email:', emailRole, 'Display name:', displayName);
    } catch (error) {
      console.error('[AuthContext] Error setting email role:', error);
      // Fallback to admin role
      const email = emailForInference || user?.email || '';
      setRole('admin');
      setUserName(email);
      setPermissions(getUserPermissions('admin'));
      console.log('[AuthContext] Fallback to admin role');
    } finally {
      setLoading(false);
      console.log('[AuthContext] fetchUserRole complete, loading set to false');
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
      // Clear local session for this tab
      await supabase.auth.signOut({ scope: 'local' as any });
    } catch (_e) {
      // ignore
    } finally {
      try {
        if (typeof window !== 'undefined') {
          // Remove any persisted tokens
          try { localStorage.removeItem(STORAGE_KEYS.AUTH); } catch {}
          Object.keys(localStorage).forEach((k) => {
            if (k.startsWith(STORAGE_KEYS.SUPABASE_PREFIX)) localStorage.removeItem(k);
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
      // Ensure a clean app state after logout (avoid forward to dashboard)
      if (typeof window !== 'undefined') window.location.replace('/');
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
