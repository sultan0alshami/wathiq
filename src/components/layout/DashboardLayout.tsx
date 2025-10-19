import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useIsMobile, useIsTablet } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();

  // Debug logging for responsive breakpoints
  React.useEffect(() => {
    console.log('[DashboardLayout] Screen width:', window.innerWidth);
    console.log('[DashboardLayout] isMobile:', isMobile);
    console.log('[DashboardLayout] isTablet:', isTablet);
  }, [isMobile, isTablet]);

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
      <div 
        className={cn(
          "transition-transform duration-300 ease-in-out",
          isMobile 
            ? `fixed top-0 right-0 min-h-screen w-full z-50 transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`
            : "fixed top-0 right-0 min-h-screen z-30"
        )}
        style={!isMobile ? { width: isTablet ? '14rem' : '16rem' } : {}}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Main content */}
      <div 
        className={cn(
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          isMobile ? "w-full" : ""
        )}
        style={!isMobile ? { marginRight: isTablet ? '14rem' : '16rem' } : {}}
      >
        <div className="sticky top-0 z-20">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};