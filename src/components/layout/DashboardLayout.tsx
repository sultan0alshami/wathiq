import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const isMobile = useIsMobile();

  // Close sidebar when switching to mobile
  React.useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  return (
    <div className="min-h-screen bg-background-secondary flex w-full" dir="rtl">
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={cn(
        "transition-transform duration-300 ease-in-out",
        isMobile 
          ? `fixed top-0 right-0 min-h-screen w-full z-50 transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`
          : "fixed top-0 right-0 min-h-screen w-64 z-30"
      )}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Main content */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0",
        isMobile ? "w-full" : ""
      )} style={{ marginRight: isMobile ? '0' : '16rem' }}>
        <div className="sticky top-0 z-20">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};