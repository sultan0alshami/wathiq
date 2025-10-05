import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  DollarSign, 
  TrendingUp, 
  Settings2, 
  Megaphone, 
  Users, 
  BarChart3,
  Download,
  Building2,
  LogOut,
  User
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

// Navigation items with permission requirements
const navigationItems = [
  { name: 'لوحة التحكم', href: '/', icon: LayoutDashboard, permission: null }, // Always visible
  { name: 'التقارير', href: '/reports', icon: FileText, permission: null }, // Always visible
  { name: 'المالية', href: '/finance', icon: DollarSign, permission: 'finance' },
  { name: 'المبيعات', href: '/sales', icon: TrendingUp, permission: 'sales' },
  { name: 'العمليات', href: '/operations', icon: Settings2, permission: 'operations' },
  { name: 'التسويق', href: '/marketing', icon: Megaphone, permission: 'marketing' },
  { name: 'العملاء', href: '/customers', icon: Users, permission: 'customers' },
  { name: 'الموردين', href: '/suppliers', icon: Building2, permission: 'suppliers' },
  { name: 'الرسوم البيانية', href: '/charts', icon: BarChart3, permission: null }, // Always visible
  { name: 'تحميل التقارير', href: '/download', icon: Download, permission: 'canExport' },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, userName, permissions, signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  // Filter navigation items based on user permissions
  const visibleNavigation = navigationItems.filter(item => {
    // Items with no permission requirement are always visible
    if (item.permission === null) return true;
    
    // Check if user has the required permission
    if (permissions) {
      return permissions[item.permission as keyof typeof permissions] === true;
    }
    
    return false;
  });

  return (
    <div className="w-64 bg-nav-background text-nav-foreground flex flex-col shadow-wathiq-medium">
      {/* Logo */}
      <div className="p-6 border-b border-nav-hover">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-10 h-10 bg-wathiq-accent rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">وا</span>
          </div>
          <div>
            <h1 className="text-xl font-bold">واثق</h1>
            <p className="text-sm text-nav-foreground/70">نظام الإدارة</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-nav-hover">
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="w-10 h-10 bg-wathiq-primary/20 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-wathiq-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold truncate">{userName || user?.email}</p>
            <p className="text-xs text-nav-foreground/60">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {visibleNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-3 space-x-reverse px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 animate-hover",
                    isActive
                      ? "bg-nav-active text-white shadow-wathiq-soft"
                      : "text-nav-foreground/80 hover:bg-nav-hover hover:text-white"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-nav-hover">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start space-x-2 space-x-reverse text-nav-foreground/80 hover:bg-nav-hover hover:text-white"
        >
          <LogOut className="w-5 h-5" />
          <span>تسجيل الخروج</span>
        </Button>
        <div className="text-xs text-nav-foreground/60 text-center mt-3">
          © 2024 شركة واثق
        </div>
      </div>
    </div>
  );
};