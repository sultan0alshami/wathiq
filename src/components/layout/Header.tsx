import React from 'react';
import { Bell, User, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
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

export const Header: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const { userName, user, role, signOut } = useAuth();
  const navigate = useNavigate();

  // TODO: Implement global search functionality when a search context or service is available.
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    // Placeholder for actual search logic
    console.log("Search term:", value);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
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
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -left-1 bg-wathiq-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User Menu with Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center space-x-3 space-x-reverse hover:bg-wathiq-primary/10">
                <div className="text-right">
                  <p className="text-sm font-medium">{userName || user?.email}</p>
                  <p className="text-xs text-muted-foreground">{getRoleDisplayName(role)}</p>
                </div>
                <div className="rounded-full w-8 h-8 bg-wathiq-primary/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-wathiq-primary" />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-right">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{userName}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
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
    </header>
  );
};