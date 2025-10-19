import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useScreenSize } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const screenSize = useScreenSize();

  // Close sidebar when switching to mobile
  React.useEffect(() => {
    if (screenSize.isMobile) {
      setSidebarOpen(false);
    }
  }, [screenSize.isMobile]);

  // Calculate sidebar width and main content margin based on screen size
  const getSidebarWidth = () => {
    if (screenSize.isMobile) return '100vw';
    if (screenSize.isTablet) return '280px'; // Smaller for tablets
    return '320px'; // Full width for desktop
  };

  const getMainContentMargin = () => {
    if (screenSize.isMobile) return '0px';
    if (screenSize.isTablet) return '280px';
    return '320px';
  };

  return (
    <div className="min-h-screen bg-background-secondary flex w-full" dir="rtl">
      {/* Mobile overlay */}
      {screenSize.isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={cn(
          "fixed top-0 right-0 min-h-screen z-30 transition-all duration-300 ease-in-out",
          screenSize.isMobile && `transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'}`
        )}
        style={{ 
          width: getSidebarWidth(),
          zIndex: screenSize.isMobile ? 50 : 30
        }}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>
      
      {/* Main content */}
      <div 
        className="flex-1 flex flex-col min-w-0 transition-all duration-300"
        style={{ 
          marginRight: getMainContentMargin(),
          width: screenSize.isMobile ? '100vw' : `calc(100vw - ${getMainContentMargin()})`
        }}
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