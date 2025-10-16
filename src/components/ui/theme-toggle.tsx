import React from 'react';
import { Moon, Sun, Laptop } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/contexts/ThemeContext';
import { useIsMobile } from '@/hooks/use-mobile';

export const ThemeToggle: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();

  return (
    <div className="flex items-center rounded-md border border-border overflow-hidden">
      <Button
        variant={theme === 'light' ? 'secondary' : 'ghost'}
        size="sm"
        className="px-3"
        onClick={() => setTheme('light')}
        aria-pressed={theme === 'light'}
        aria-label="الوضع الفاتح"
        title="الوضع الفاتح"
      >
        <Sun className="w-4 h-4" />
      </Button>
      <Button
        variant={theme === 'dark' ? 'secondary' : 'ghost'}
        size="sm"
        className="px-3"
        onClick={() => setTheme('dark')}
        aria-pressed={theme === 'dark'}
        aria-label="الوضع الداكن"
        title="الوضع الداكن"
      >
        <Moon className="w-4 h-4" />
      </Button>
      {!isMobile && (
        <Button
          variant={theme === 'system' ? 'secondary' : 'ghost'}
          size="sm"
          className="px-3"
          onClick={() => setTheme('system')}
          aria-pressed={theme === 'system'}
          aria-label="حسب النظام"
          title="حسب النظام"
        >
          <Laptop className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};