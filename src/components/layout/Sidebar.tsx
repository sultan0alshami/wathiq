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
  X,
  MapPin,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { useScreenSize } from '@/hooks/use-mobile';

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
  { name: 'الرحلات', path: 'trips', icon: MapPin, permission: 'trips' },
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
  const screenSize = useScreenSize();

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
      "text-nav-foreground flex flex-col shadow-wathiq-medium h-screen",
      screenSize.isMobile 
        ? "w-full bg-nav-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-nav-background/80 supports-[backdrop-filter]:backdrop-blur-md overflow-hidden"
        : "bg-nav-background"
    )}>
      {/* Logo and Close Button */}
      <div className={cn(
        "border-b border-nav-hover",
        screenSize.isTablet ? "p-4" : "p-6"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className={cn(
              "bg-wathiq-accent rounded-lg flex items-center justify-center",
              screenSize.isTablet ? "w-8 h-8" : "w-10 h-10"
            )}>
              <span className={cn(
                "text-white font-bold",
                screenSize.isTablet ? "text-sm" : "text-lg"
              )}>وا</span>
            </div>
            <div>
              <h1 className={cn(
                "font-bold",
                screenSize.isTablet ? "text-lg" : "text-xl"
              )}>واثق</h1>
              <p className={cn(
                "text-nav-foreground/70",
                screenSize.isTablet ? "text-xs" : "text-sm"
              )}>نظام الإدارة</p>
            </div>
          </div>
          {screenSize.isMobile && onClose && (
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
      <div className={cn(
        "border-b border-nav-hover",
        screenSize.isTablet ? "p-3" : "p-4"
      )}>
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className={cn(
            "bg-wathiq-primary/20 rounded-full flex items-center justify-center",
            screenSize.isTablet ? "w-8 h-8" : "w-10 h-10"
          )}>
            <User className={cn(
              "text-wathiq-primary",
              screenSize.isTablet ? "w-4 h-4" : "w-5 h-5"
            )} />
          </div>
          <div className="flex-1 min-w-0">
            <p className={cn(
              "font-bold truncate",
              screenSize.isTablet ? "text-xs" : "text-sm"
            )}>{userName || user?.email}</p>
            <p className={cn(
              "text-nav-foreground/60",
              screenSize.isTablet ? "text-xs" : "text-xs"
            )}>{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={cn(
        "flex-1",
        screenSize.isTablet ? "p-3 overflow-y-auto" : "p-4 overflow-y-auto"
      )}>
        <ul className={cn(
          "space-y-2",
          screenSize.isMobile ? "pb-4" : ""
        )}>
          {visibleNavigation.map((item) => {
            const href = item.path ? `${basePath}/${item.path}`.replace(/\/$/, '') : basePath;
            const isActive = location.pathname === href;
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <NavLink
                  to={href}
                  onClick={() => {
                    if (screenSize.isMobile && onClose) {
                      onClose();
                    }
                  }}
                  className={cn(
                    "flex items-center space-x-3 space-x-reverse px-3 py-2.5 font-medium rounded-lg transition-all duration-200 animate-hover",
                    screenSize.isTablet ? "text-xs" : "text-sm",
                    isActive
                      ? "bg-nav-active text-white shadow-wathiq-soft"
                      : "text-nav-foreground/80 hover:bg-nav-hover hover:text-white"
                  )}
                >
                  <Icon className={cn(
                    screenSize.isTablet ? "w-4 h-4" : "w-5 h-5"
                  )} />
                  <span>{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout Button */}
      <div className={cn(
        "border-t border-nav-hover",
        screenSize.isTablet ? "p-3" : "p-4"
      )}>
        <Button
          onClick={handleLogout}
          variant="ghost"
          className={cn(
            "w-full justify-start space-x-2 space-x-reverse text-nav-foreground/80 hover:bg-nav-hover hover:text-white",
            screenSize.isTablet ? "text-xs py-2" : "py-2.5"
          )}
        >
          <LogOut className={cn(
            screenSize.isTablet ? "w-4 h-4" : "w-5 h-5"
          )} />
          <span>تسجيل الخروج</span>
        </Button>
        <div className={cn(
          "text-nav-foreground/60 text-center mt-3",
          screenSize.isTablet ? "text-xs" : "text-xs"
        )}>
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