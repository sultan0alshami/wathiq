// Debug utility to help identify refresh issues
export const debugRefresh = {
  log: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG-REFRESH] ${message}`, data);
    }
  },
  
  logError: (message: string, error: any) => {
    console.error(`[DEBUG-REFRESH-ERROR] ${message}`, error);
  },
  
  checkAuthState: () => {
    const authData = {
      localStorage: {
        auth: localStorage.getItem('wathiq-auth'),
        supabaseKeys: Object.keys(localStorage).filter(k => k.startsWith('sb-')),
      },
      sessionStorage: Object.keys(sessionStorage),
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };
    
    debugRefresh.log('Auth state check:', authData);
    return authData;
  },
  
  checkContexts: () => {
    const contexts = {
      authLoading: document.querySelector('[data-auth-loading]')?.textContent,
      notificationsLoading: document.querySelector('[data-notifications-loading]')?.textContent,
      themeLoading: document.querySelector('[data-theme-loading]')?.textContent,
    };
    
    debugRefresh.log('Context states:', contexts);
    return contexts;
  },
  
  monitorPerformance: () => {
    const perfData = {
      navigationStart: performance.timing?.navigationStart,
      domContentLoaded: performance.timing?.domContentLoadedEventEnd,
      loadComplete: performance.timing?.loadEventEnd,
      memoryUsage: (performance as any).memory,
    };
    
    debugRefresh.log('Performance data:', perfData);
    return perfData;
  }
};

// Auto-run debug checks on page load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(() => {
      debugRefresh.log('Page loaded, running debug checks...');
      debugRefresh.checkAuthState();
      debugRefresh.checkContexts();
      debugRefresh.monitorPerformance();
    }, 1000);
  });
  
  // Monitor for errors
  window.addEventListener('error', (event) => {
    debugRefresh.logError('Global error caught:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
    });
  });
  
  // Monitor for unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    debugRefresh.logError('Unhandled promise rejection:', event.reason);
  });
}
