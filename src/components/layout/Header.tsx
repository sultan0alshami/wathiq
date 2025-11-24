import React from 'react';
import { Bell, User, LogOut, Users, CheckCircle, Info, AlertTriangle, XCircle, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { DateTabs } from '@/components/ui/date-tabs';
import { SearchInput } from '@/components/ui/search-input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { AuthService } from '@/services/AuthService';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications, NotificationType } from '@/contexts/NotificationsContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface HeaderProps {
  onMenuClick?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const { userName, user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();
  const [isAdmin, setIsAdmin] = React.useState(false);
  const isMobile = useIsMobile();

  // Check if user is admin for conditional rendering
  React.useEffect(() => {
    AuthService.isAdmin().then(setIsAdmin);
  }, [role]);

  // TODO: Implement global search functionality when a search context or service is available.
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Placeholder for actual search logic
    console.log("Search term:", value);
  };

  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const requestLogout = () => setConfirmOpen(true);

  const confirmLogout = async () => {
    try {
      await signOut();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  // Get role display name in Arabic
  const getRoleDisplayName = (role: string | null) => {
    const roleNames: Record<string, string> = {
      admin: 'المدير العام',
      manager: 'المشرف',
      finance: 'قسم المالية',
      sales: 'قسم المبيعات',
      operations: 'قسم العمليات',
      marketing: 'قسم التسويق',
    };
    return roleNames[role || ''] || 'موظف';
  };

  return (
    <header className={`bg-card border-b border-border-strong space-y-4 relative ${isMobile ? 'px-4 py-3' : 'px-6 py-4'}`}>
      {/* Top Row - Search and User Actions */}
      <div className={`flex items-center ${isMobile ? 'flex-col gap-3' : 'justify-between'}`}>
        {/* Global Search */}
        <div className={`${isMobile ? 'w-full order-2' : 'flex-1 max-w-md'}`}>
          <SearchInput
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="البحث العام..."
            className={`w-full ${isMobile ? 'min-h-[44px] text-base' : ''}`}
          />
        </div>

        {/* Actions */}
        <div className={`flex items-center ${isMobile ? 'w-full justify-between order-1' : 'space-x-4 space-x-reverse'}`}>
          {/* Mobile Menu Button */}
          {isMobile && onMenuClick && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="mr-2"
              aria-label="فتح القائمة"
              title="فتح القائمة"
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          
          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Admin User Management (Admin Only) - TODO: Create /admin/users page */}
          {/* Temporarily disabled until admin page is created
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/admin/users')}
              className="gap-2"
              title="إدارة المستخدمين"
            >
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">المستخدمين</span>
            </Button>
          )}
          */}
          
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="relative" aria-label="الإشعارات" title="الإشعارات">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -left-1 bg-wathiq-accent text-white text-xs rounded-full min-w-5 h-5 px-1 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className={`max-h-96 overflow-auto border border-border/70 shadow-lg bg-card/90 backdrop-blur-md supports-[backdrop-filter]:bg-card/70 supports-[backdrop-filter]:backdrop-blur-md z-[9999] ${isMobile ? 'w-[calc(100vw-2rem)] max-w-sm fixed top-20 left-1/2 transform -translate-x-1/2' : 'w-80'}`}
            >
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-sm text-muted-foreground">الإشعارات</span>
                <Button variant="ghost" size="sm" onClick={markAllRead}>تحديد الكل كمقروء</Button>
              </div>
              {notifications.length === 0 ? (
                <div className="px-3 py-6 text-sm text-muted-foreground text-center">لا توجد إشعارات</div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className={`border-t border-border/60 ${isMobile ? 'px-4 py-3' : 'px-3 py-2'}`}>
                    <div className="flex items-start gap-2">
                      {/* Notification Icon */}
                      <div className="mt-0.5 flex-shrink-0">
                        {getNotificationIcon(n.type)}
                      </div>
                      
                      {/* Notification Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            {!n.read && <span className="inline-block w-2 h-2 rounded-full bg-accent flex-shrink-0" />}
                            <span className={`font-medium break-words ${isMobile ? 'text-sm' : 'text-sm'} leading-tight`}>
                              {n.title}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
                            {new Date(n.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {n.message && (
                          <div className={`text-muted-foreground mt-1 break-words ${isMobile ? 'text-sm' : 'text-xs'} leading-tight`}>
                            {n.message}
                          </div>
                        )}
                        {!n.read && (
                          <div className="mt-2">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => markRead(n.id)}
                              className={isMobile ? 'min-h-[36px] text-sm' : ''}
                            >
                              تمييز كمقروء
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User Menu with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-3 space-x-reverse hover:bg-wathiq-primary/10" aria-label="قائمة المستخدم" title="قائمة المستخدم">
                <div className="text-right">
                  <p className="text-sm font-medium">{userName || user?.email}</p>
                  <p className="text-xs text-muted-foreground">{getRoleDisplayName(role)}</p>
                </div>
                <div className="rounded-full w-8 h-8 bg-wathiq-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-wathiq-primary" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className={`border border-border/70 shadow-lg bg-card/90 backdrop-blur-md supports-[backdrop-filter]:bg-card/70 supports-[backdrop-filter]:backdrop-blur-md z-[9999] ${isMobile ? 'w-48 fixed top-20 left-1/2 transform -translate-x-1/2' : 'w-56'}`}
            >
              <DropdownMenuLabel className="text-right">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={requestLogout}
                className={`text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer ${isMobile ? 'min-h-[44px] text-base' : ''}`}
              >
                <LogOut className="w-4 h-4 ml-2" />
                <span>تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Bottom Row - Date Navigation */}
      <div className={`flex justify-center ${isMobile ? 'px-2' : ''}`}>
        <div className={isMobile ? 'w-full overflow-x-auto' : ''}>
          <DateTabs />
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
    </header>
  );
};