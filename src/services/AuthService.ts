import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

/**
 * AuthService - Server-side authorization utilities
 * 
 * Provides methods to verify user roles and permissions via Supabase RPC,
 * ensuring authorization checks happen at the database level (not just client-side).
 */
export class AuthService {
  /**
   * Verify if current user has one of the required roles (via RPC)
   * 
   * @param requiredRoles - Array of acceptable role names
   * @returns Promise<boolean> - true if user has required role
   */
  static async verifyUserRole(requiredRoles: string[]): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.warn('[AuthService] No authenticated user');
        return false;
      }

      const { data, error } = await supabase.rpc('get_user_profile', { uid: user.id });
      
      if (error) {
        console.error('[AuthService] RPC error:', error);
        return false;
      }

      if (!data || data.length === 0) {
        console.warn('[AuthService] No role found for user:', user.id);
        return false;
      }

      const userRole = data[0].role;
      const hasPermission = requiredRoles.includes(userRole);

      console.log(`[AuthService] User role: ${userRole}, Required: [${requiredRoles.join(', ')}], Access: ${hasPermission}`);
      
      return hasPermission;
    } catch (err) {
      console.error('[AuthService] Unexpected error during role verification:', err);
      return false;
    }
  }

  /**
   * Check if user can access a specific resource type
   * 
   * @param resourceType - The resource/section to check access for
   * @returns Promise<boolean> - true if user can access
   */
  static async canAccessResource(
    resourceType: 'finance' | 'sales' | 'operations' | 'marketing' | 'customers' | 'suppliers' | 'dashboard' | 'reports'
  ): Promise<boolean> {
    const roleMap: Record<string, string[]> = {
      dashboard: ['admin', 'manager', 'finance', 'sales', 'operations', 'marketing'],
      reports: ['admin', 'manager', 'finance', 'sales', 'operations', 'marketing'],
      finance: ['admin', 'manager', 'finance'],
      sales: ['admin', 'manager', 'sales'],
      operations: ['admin', 'manager', 'operations'],
      marketing: ['admin', 'manager', 'marketing'],
      customers: ['admin', 'manager', 'sales', 'marketing'],
      suppliers: ['admin', 'manager', 'finance', 'operations'],
    };

    return this.verifyUserRole(roleMap[resourceType] || []);
  }

  /**
   * Guard function - throws error if user lacks permission
   * Use this before critical operations to ensure authorization
   * 
   * @param resourceType - Resource to check
   * @throws Error if unauthorized
   */
  static async requireAccess(
    resourceType: 'finance' | 'sales' | 'operations' | 'marketing' | 'customers' | 'suppliers' | 'dashboard' | 'reports'
  ): Promise<void> {
    const canAccess = await this.canAccessResource(resourceType);
    
    if (!canAccess) {
      const errorMsg = `غير مصرح لك بالوصول إلى قسم ${this.getResourceNameArabic(resourceType)}`;
      toast.error(errorMsg);
      throw new Error(`Unauthorized access to ${resourceType}`);
    }
  }

  /**
   * Get Arabic display name for resource type
   */
  private static getResourceNameArabic(resourceType: string): string {
    const names: Record<string, string> = {
      finance: 'المالية',
      sales: 'المبيعات',
      operations: 'العمليات',
      marketing: 'التسويق',
      customers: 'العملاء',
      suppliers: 'الموردين',
      dashboard: 'لوحة التحكم',
      reports: 'التقارير',
    };
    return names[resourceType] || resourceType;
  }

  /**
   * Check if user has admin privileges
   */
  static async isAdmin(): Promise<boolean> {
    return this.verifyUserRole(['admin']);
  }

  /**
   * Check if user has manager or admin privileges
   */
  static async isManagerOrAdmin(): Promise<boolean> {
    return this.verifyUserRole(['admin', 'manager']);
  }

  /**
   * Get current user's full profile from database
   * 
   * @returns Promise<{ role: string; name: string } | null>
   */
  static async getUserProfile(): Promise<{ role: string; name: string } | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data, error } = await supabase.rpc('get_user_profile', { uid: user.id });
      
      if (error || !data || data.length === 0) {
        console.error('[AuthService] Failed to fetch user profile:', error);
        return null;
      }

      return data[0];
    } catch (err) {
      console.error('[AuthService] Error fetching user profile:', err);
      return null;
    }
  }

  /**
   * Assign a role to a user (admin only)
   * 
   * @param userId - UUID of the user
   * @param role - Role to assign
   * @param name - Optional display name
   * @returns Promise<boolean> - success status
   */
  static async assignRole(
    userId: string,
    role: 'admin' | 'manager' | 'finance' | 'sales' | 'operations' | 'marketing',
    name?: string
  ): Promise<boolean> {
    try {
      // Verify current user is admin
      const isAdmin = await this.isAdmin();
      if (!isAdmin) {
        toast.error('فقط المدير يمكنه تعيين الأدوار');
        return false;
      }

      const { error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role, name }, { onConflict: 'user_id' });

      if (error) {
        console.error('[AuthService] Error assigning role:', error);
        toast.error('فشل في تعيين الدور');
        return false;
      }

      toast.success(`تم تعيين دور ${this.getRoleNameArabic(role)} بنجاح`);
      return true;
    } catch (err) {
      console.error('[AuthService] Unexpected error assigning role:', err);
      toast.error('حدث خطأ غير متوقع');
      return false;
    }
  }

  /**
   * Get Arabic display name for role
   */
  private static getRoleNameArabic(role: string): string {
    const names: Record<string, string> = {
      admin: 'المدير العام',
      manager: 'المشرف',
      finance: 'قسم المالية',
      sales: 'قسم المبيعات',
      operations: 'قسم العمليات',
      marketing: 'قسم التسويق',
    };
    return names[role] || role;
  }

  /**
   * Remove user role (admin only)
   * 
   * @param userId - UUID of the user
   * @returns Promise<boolean> - success status
   */
  static async removeRole(userId: string): Promise<boolean> {
    try {
      const isAdmin = await this.isAdmin();
      if (!isAdmin) {
        toast.error('فقط المدير يمكنه إزالة الأدوار');
        return false;
      }

      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      if (error) {
        console.error('[AuthService] Error removing role:', error);
        toast.error('فشل في إزالة الدور');
        return false;
      }

      toast.success('تم إزالة الدور بنجاح');
      return true;
    } catch (err) {
      console.error('[AuthService] Unexpected error removing role:', err);
      toast.error('حدث خطأ غير متوقع');
      return false;
    }
  }

  /**
   * List all users with their roles (admin/manager only)
   * 
   * @returns Promise<Array<{ id: string; email: string; role?: string; name?: string }>>
   */
  static async listUsersWithRoles(): Promise<Array<{
    id: string;
    email: string;
    role?: string;
    name?: string;
  }>> {
    try {
      const canManage = await this.isManagerOrAdmin();
      if (!canManage) {
        toast.error('غير مصرح لك بعرض المستخدمين');
        return [];
      }

      // Note: This requires a custom RPC or service role access
      // For now, return empty array - implement based on your auth setup
      toast.info('هذه الميزة قيد التطوير');
      return [];
    } catch (err) {
      console.error('[AuthService] Error listing users:', err);
      return [];
    }
  }
}

