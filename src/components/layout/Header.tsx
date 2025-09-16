import React from 'react';
import { Bell, User, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DateTabs } from '@/components/ui/date-tabs';

export const Header: React.FC = () => {
  return (
    <header className="bg-card border-b border-border-strong px-6 py-4 space-y-4">
      {/* Top Row - Search and User Actions */}
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="search"
              placeholder="البحث..."
              className="pl-4 pr-10 bg-background-muted border-border"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-4 space-x-reverse">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -left-1 bg-wathiq-accent text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User Menu */}
          <div className="flex items-center space-x-3 space-x-reverse">
            <div className="text-left">
              <p className="text-sm font-medium">أحمد محمد</p>
              <p className="text-xs text-muted-foreground">المدير</p>
            </div>
            <Button variant="ghost" size="sm" className="rounded-full p-0 w-8 h-8">
              <User className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Bottom Row - Date Navigation */}
      <div className="flex justify-center">
        <DateTabs />
      </div>
    </header>
  );
};