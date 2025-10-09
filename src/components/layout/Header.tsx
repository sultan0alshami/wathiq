import React from 'react';
import { Bell, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { DateTabs } from '@/components/ui/date-tabs';
import { SearchInput } from '@/components/ui/search-input';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/contexts/NotificationsContext';

export const Header: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const { userName, user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAllRead, markRead } = useNotifications();

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
    <header className="bg-card border-b border-border-strong px-6 py-4 space-y-4">
      {/* Top Row - Search and User Actions */}
      <div className="flex items-center justify-between">
        {/* Global Search */}
        <div className="flex-1 max-w-md">
          <SearchInput
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="البحث العام..."
            className="w-full"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4 space-x-reverse">
          {/* Theme Toggle */}
          <ThemeToggle />
          
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
              className="w-80 max-h-96 overflow-auto border border-border/70 shadow-lg bg-card/90 backdrop-blur-md supports-[backdrop-filter]:bg-card/70 supports-[backdrop-filter]:backdrop-blur-md"
            >
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-sm text-muted-foreground">الإشعارات</span>
                <Button variant="ghost" size="sm" onClick={markAllRead}>تحديد الكل كمقروء</Button>
              </div>
              {notifications.length === 0 ? (
                <div className="px-3 py-6 text-sm text-muted-foreground text-center">لا توجد إشعارات</div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="px-3 py-2 border-t border-border/60">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-2">
                        {!n.read && <span className="inline-block w-2 h-2 rounded-full bg-accent" />}
                        {n.title}
                      </span>
                      <span className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleTimeString('ar-EG')}</span>
                    </div>
                    {n.message && (<div className="text-xs text-muted-foreground mt-1">{n.message}</div>)}
                    {!n.read && (
                      <div className="mt-2">
                        <Button size="sm" variant="outline" onClick={() => markRead(n.id)}>تمييز كمقروء</Button>
                      </div>
                    )}
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
              className="w-56 border border-border/70 shadow-lg bg-card/90 backdrop-blur-md supports-[backdrop-filter]:bg-card/70 supports-[backdrop-filter]:backdrop-blur-md"
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
                className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
              >
                <LogOut className="w-4 h-4 ml-2" />
                <span>تسجيل الخروج</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Bottom Row - Date Navigation */}
      <div className="flex justify-center">
        <DateTabs />
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