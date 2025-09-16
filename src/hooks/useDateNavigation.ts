import { useState, useEffect } from 'react';
import { format, subDays, addDays } from 'date-fns';

export interface DateNavigationHook {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  getDateTabs: () => Date[];
  navigateToDate: (date: Date) => void;
  navigatePrevious: () => void;
  navigateNext: () => void;
  formatDate: (date: Date, formatStr?: string) => string;
  isToday: (date: Date) => boolean;
}

export const useDateNavigation = (): DateNavigationHook => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());

  // Get last 7 days including today for tabs
  const getDateTabs = (): Date[] => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      dates.push(subDays(new Date(), i));
    }
    return dates;
  };

  const navigateToDate = (date: Date) => {
    setCurrentDate(date);
  };

  const navigatePrevious = () => {
    setCurrentDate(prev => subDays(prev, 1));
  };

  const navigateNext = () => {
    setCurrentDate(prev => addDays(prev, 1));
  };

  const formatDate = (date: Date, formatStr: string = 'yyyy-MM-dd'): string => {
    return format(date, formatStr);
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return formatDate(date) === formatDate(today);
  };

  return {
    currentDate,
    setCurrentDate,
    getDateTabs,
    navigateToDate,
    navigatePrevious,
    navigateNext,
    formatDate,
    isToday,
  };
};