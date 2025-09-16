import React, { useState } from 'react';
import { Menu, X, Home, DollarSign, Users, Settings, BarChart3, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useLocation, Link } from 'react-router-dom';

const navigationItems = [
  { icon: Home, label: 'لوحة التحكم', path: '/' },
  { icon: DollarSign, label: 'المالية', path: '/finance' },
  { icon: Users, label: 'المبيعات', path: '/sales' },
  { icon: Settings, label: 'العمليات', path: '/operations' },
  { icon: BarChart3, label: 'التسويق', path: '/marketing' },
  { icon: Package, label: 'التقارير', path: '/reports' },
];

export const MobileNavigation: React.FC = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 p-0">
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-primary">القائمة</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setOpen(false)}
                    className="p-1"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              {/* Navigation Items */}
              <nav className="flex-1 p-4">
                <ul className="space-y-2">
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                      <li key={item.path}>
                        <Link
                          to={item.path}
                          onClick={() => setOpen(false)}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-lg transition-colors",
                            "hover:bg-accent hover:text-accent-foreground",
                            isActive && "bg-primary text-primary-foreground"
                          )}
                        >
                          <item.icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Bottom Navigation for Mobile */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
        <div className="flex justify-around items-center py-2">
          {navigationItems.slice(0, 5).map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors min-w-0",
                  "hover:bg-accent hover:text-accent-foreground",
                  isActive && "text-primary font-medium"
                )}
              >
                <item.icon className="w-5 h-5" />
                <span className="text-xs truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};