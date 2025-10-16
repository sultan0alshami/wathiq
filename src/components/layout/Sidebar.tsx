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
  User,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useIsMobile } from '@/hooks/use-mobile';

// Navigation items with permission requirements.
// `path` is appended to the base (/admin or /manager)
const navigationItems = [
  { name: 'لوحة التحكم', path: '', icon: LayoutDashboard, permission: 'dashboard' },
  { name: 'التقارير', path: 'reports', icon: FileText, permission: 'reports' },
  { name: 'المالية', path: 'finance', icon: DollarSign, permission: 'finance' },
  { name: 'المبيعات', path: 'sales', icon: TrendingUp, permission: 'sales' },
  { name: 'العمليات', path: 'operations', icon: Settings2, permission: 'operations' },
  { name: 'التسويق', path: 'marketing', icon: Megaphone, permission: 'marketing' },
  { name: 'العملاء', path: 'customers', icon: Users, permission: 'customers' },
  { name: 'الموردين', path: 'suppliers', icon: Building2, permission: 'suppliers' },
  { name: 'الرسوم البيانية', path: 'charts', icon: BarChart3, permission: 'charts' },
  { name: 'تحميل التقارير', path: 'download', icon: Download, permission: 'canExport' },
];

interface SidebarProps {
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, userName, permissions, signOut } = useAuth();
  const basePath = role === 'admin' ? '/admin' : '/manager';
  const isMobile = useIsMobile();

  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const handleLogout = () => {
    setConfirmOpen(true);
  };

  const confirmLogout = async () => {
    try {
      await signOut();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  // Filter navigation items based on user permissions from context (hooks cannot be used in loops)
  const visibleNavigation = navigationItems.filter(item => {
    if (!permissions) return false;
    return permissions[item.permission as keyof typeof permissions] === true;
  });

  return (
    <div className={cn(
      "w-64 text-nav-foreground flex flex-col shadow-wathiq-medium",
      isMobile 
        ? "bg-nav-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-nav-background/80 supports-[backdrop-filter]:backdrop-blur-md"
        : "bg-nav-background"
    )}>
      {/* Logo and Close Button */}
      <div className="p-6 border-b border-nav-hover">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="w-10 h-10 bg-wathiq-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">وا</span>
            </div>
            <div>
              <h1 className="text-xl font-bold">واثق</h1>
              <p className="text-sm text-nav-foreground/70">نظام الإدارة</p>
            </div>
          </div>
          {isMobile && onClose && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-nav-foreground/80 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          )}
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
            const href = item.path ? `${basePath}/${item.path}`.replace(/\/$/, '') : basePath;
            const isActive = location.pathname === href;
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <NavLink
                  to={href}
                  onClick={() => {
                    if (isMobile && onClose) {
                      onClose();
                    }
                  }}
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
      <ConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="تأكيد تسجيل الخروج"
        description="هل تريد بالفعل تسجيل الخروج من النظام؟"
        confirmText="تسجيل الخروج"
        cancelText="إلغاء"
        onConfirm={confirmLogout}
        variant="warning"
      />
    </div>
  );
};