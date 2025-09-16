import React, { createContext, useContext, ReactNode } from 'react';
import { useDateNavigation, DateNavigationHook } from '@/hooks/useDateNavigation';

const DateContext = createContext<DateNavigationHook | undefined>(undefined);

export const DateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const dateNavigation = useDateNavigation();

  return (
    <DateContext.Provider value={dateNavigation}>
      {children}
    </DateContext.Provider>
  );
};

export const useDateContext = (): DateNavigationHook => {
  const context = useContext(DateContext);
  if (context === undefined) {
    throw new Error('useDateContext must be used within a DateProvider');
  }
  return context;
};