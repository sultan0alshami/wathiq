import { useState, useEffect, useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { getDataForDate, DailyData } from '@/lib/mockData';
import { formatCurrency } from '@/lib/numberUtils';

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface LiquidityDataPoint extends ChartDataPoint {
  income: number;
  expenses: number;
  net: number;
}

export interface SectionSubmissionData {
  date: string;
  label?: string;
  المالية: boolean;
  المبيعات: boolean;
  العمليات: boolean;
  التسويق: boolean;
  العملاء: boolean;
}

export const useChartData = (days: number = 30) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate date range
  const dateRange = useMemo(() => {
    const dates = [];
    for (let i = days - 1; i >= 0; i--) {
      dates.push(subDays(new Date(), i));
    }
    return dates;
  }, [days]);

  // Get liquidity data for the last N days
  const liquidityData = useMemo((): LiquidityDataPoint[] => {
    try {
      return dateRange.map(date => {
        const dailyData = getDataForDate(date);
        const income = dailyData.finance.entries
          .filter(entry => entry.type === 'income')
          .reduce((sum, entry) => sum + entry.amount, 0);
        const expenses = dailyData.finance.entries
          .filter(entry => entry.type === 'expense')
          .reduce((sum, entry) => sum + entry.amount, 0);
        return {
          date: format(date, 'dd/MM'),
          value: dailyData.finance.currentLiquidity,
          income,
          expenses,
          net: income - expenses,
          label: format(date, 'yyyy-MM-dd')
        };
      });
    } catch (err) {
      setError('خطأ في تحميل بيانات السيولة');
      console.error('Error loading liquidity data:', err);
      return [];
    }
  }, [dateRange]);

  useEffect(() => {
    setIsLoading(true);
    const t = setTimeout(() => setIsLoading(false), 0);
    return () => clearTimeout(t);
  }, [dateRange]);

  // Get income vs expenses data
  const incomeVsExpensesData = useMemo((): ChartDataPoint[] => {
    try {
      return dateRange.map(date => {
        const dailyData = getDataForDate(date);
        
        const income = dailyData.finance.entries
          .filter(entry => entry.type === 'income')
          .reduce((sum, entry) => sum + entry.amount, 0);
        
        const expenses = dailyData.finance.entries
          .filter(entry => entry.type === 'expense')
          .reduce((sum, entry) => sum + entry.amount, 0);
        
        return {
          date: format(date, 'dd/MM'),
          value: income - expenses,
          label: format(date, 'yyyy-MM-dd')
        };
      });
    } catch (err) {
      setError('خطأ في تحميل بيانات الإيرادات والمصروفات');
      console.error('Error loading income vs expenses data:', err);
      return [];
    }
  }, [dateRange]);

  // Get tasks completion data
  const tasksCompletionData = useMemo((): ChartDataPoint[] => {
    try {
      return dateRange.map(date => {
        const dailyData = getDataForDate(date);
        
        const totalTasks = dailyData.marketing.tasks.length + dailyData.operations.entries.length;
        const completedTasks = 
          dailyData.marketing.tasks.filter(task => task.status === 'completed').length +
          dailyData.operations.entries.filter(op => op.status === 'completed').length;
        
        const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
        
        return {
          date: format(date, 'dd/MM'),
          value: completionRate,
          label: format(date, 'yyyy-MM-dd')
        };
      });
    } catch (err) {
      setError('خطأ في تحميل بيانات إكمال المهام');
      console.error('Error loading tasks completion data:', err);
      return [];
    }
  }, [dateRange]);

  // Get customers trend data (enhanced to include all customer sources)
  const customersTrendData = useMemo((): ChartDataPoint[] => {
    try {
      return dateRange.map(date => {
        const dailyData = getDataForDate(date);
        
        // Combine customers from all sources
        const directCustomers = dailyData.customers.length;
        const salesContacts = dailyData.sales.customersContacted;
        const marketingCustomers = dailyData.marketing.tasks.filter(task => 
          task.isCustomerRelated
        ).length;
        
        const totalCustomers = directCustomers + salesContacts + marketingCustomers;
        
        return {
          date: format(date, 'dd/MM'),
          value: totalCustomers,
          label: format(date, 'yyyy-MM-dd')
        };
      });
    } catch (err) {
      setError('خطأ في تحميل بيانات اتجاهات العملاء');
      console.error('Error loading customers trend data:', err);
      return [];
    }
  }, [dateRange]);

  // Get section submission data
  const sectionSubmissionData = useMemo((): SectionSubmissionData[] => {
    try {
      return dateRange.map(date => {
        const dailyData = getDataForDate(date);
        
        // Consider section "submitted" if it has any data
        return {
          date: format(date, 'dd/MM'),
          label: format(date, 'yyyy-MM-dd'),
          المالية: dailyData.finance.entries.length > 0,
          المبيعات: dailyData.sales.entries.length > 0,
          العمليات: dailyData.operations.entries.length > 0,
          التسويق: dailyData.marketing.tasks.length > 0,
          العملاء: dailyData.customers.length > 0
        };
      });
    } catch (err) {
      setError('خطأ في تحميل بيانات أقسام الإرسال');
      console.error('Error loading section submission data:', err);
      return [];
    }
  }, [dateRange]);

  // Get expense categories data
  const expenseCategoriesData = useMemo(() => {
    try {
      const categoryTotals: Record<string, number> = {};
      
      dateRange.forEach(date => {
        const dailyData = getDataForDate(date);
        
        dailyData.finance.entries
          .filter(entry => entry.type === 'expense')
          .forEach(entry => {
            categoryTotals[entry.category] = (categoryTotals[entry.category] || 0) + entry.amount;
          });
      });

      return Object.entries(categoryTotals).map(([category, amount]) => ({
        name: category,
        value: amount,
        label: formatCurrency(amount)
      }));
    } catch (err) {
      setError('خطأ في تحميل بيانات فئات المصروفات');
      console.error('Error loading expense categories data:', err);
      return [];
    }
  }, [dateRange]);

  // Get sales performance data
  const salesPerformanceData = useMemo(() => {
    try {
      return dateRange.map(date => {
        const dailyData = getDataForDate(date);
        
        const totalMeetings = dailyData.sales.entries.length;
        const positiveMeetings = dailyData.sales.entries.filter(entry => entry.outcome === 'positive').length;
        const conversionRate = totalMeetings > 0 ? (positiveMeetings / totalMeetings) * 100 : 0;
        
        return {
          date: format(date, 'dd/MM'),
          meetings: totalMeetings,
          conversions: positiveMeetings,
          rate: conversionRate,
          label: format(date, 'yyyy-MM-dd')
        };
      });
    } catch (err) {
      setError('خطأ في تحميل بيانات أداء المبيعات');
      console.error('Error loading sales performance data:', err);
      return [];
    }
  }, [dateRange]);

  // Calculate aggregated statistics
  const statistics = useMemo(() => {
    try {
      const totalIncome = liquidityData.reduce((sum, day) => sum + day.income, 0);
      const totalExpenses = liquidityData.reduce((sum, day) => sum + day.expenses, 0);
      const averageLiquidity = liquidityData.length > 0 
        ? liquidityData.reduce((sum, day) => sum + day.value, 0) / liquidityData.length 
        : 0;
      
      const totalCustomers = customersTrendData.reduce((sum, day) => sum + day.value, 0);
      const averageTaskCompletion = tasksCompletionData.length > 0 
        ? tasksCompletionData.reduce((sum, day) => sum + day.value, 0) / tasksCompletionData.length 
        : 0;

      return {
        totalIncome,
        totalExpenses,
        netIncome: totalIncome - totalExpenses,
        averageLiquidity,
        totalCustomers,
        averageTaskCompletion
      };
    } catch (err) {
      console.error('Error calculating statistics:', err);
      return {
        totalIncome: 0,
        totalExpenses: 0,
        netIncome: 0,
        averageLiquidity: 0,
        totalCustomers: 0,
        averageTaskCompletion: 0
      };
    }
  }, [liquidityData, customersTrendData, tasksCompletionData]);

  return {
    isLoading,
    error,
    liquidityData,
    incomeVsExpensesData,
    tasksCompletionData,
    customersTrendData,
    sectionSubmissionData,
    expenseCategoriesData,
    salesPerformanceData,
    statistics,
    refresh: () => {
      // Force re-calculation by updating the dependency
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 100);
    }
  };
};