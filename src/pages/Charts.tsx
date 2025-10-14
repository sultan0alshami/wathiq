import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Activity,
  RefreshCw,
  Download
} from 'lucide-react';
import { useDateContext } from '@/contexts/DateContext';
import { useChartData } from '@/hooks/useChartData';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatChartNumber } from '@/lib/numberUtils';
import { CHART_COLORS } from '@/lib/chartColors'; // Import the centralized chart colors
import { ChartSkeleton } from '@/components/ui/loading-skeleton'; // Import ChartSkeleton
import { useIsMobile } from '@/hooks/use-mobile';

export const Charts: React.FC = () => {
  const { currentDate, formatDate } = useDateContext();
  const { toast } = useToast();
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const isMobile = useIsMobile();
  
  const { 
    liquidityData, 
    tasksCompletionData, 
    customersTrendData,
    expenseCategoriesData,
    salesPerformanceData,
    statistics,
    isLoading,
    refresh
  } = useChartData(parseInt(selectedPeriod));

  // Remove the hardcoded COLORS array

  return (
    <div className="space-y-6">
      {/* Header - Mobile Optimized */}
      <div className={`flex ${isMobile ? 'flex-col gap-4' : 'justify-between items-center'}`}>
        <div className={isMobile ? 'text-center' : ''}>
          <h1 className={`font-bold text-foreground ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
            الرسوم البيانية والتحليلات
          </h1>
          <p className={`text-muted-foreground mt-1 ${isMobile ? 'text-sm' : ''}`}>
            تحليل مرئي للبيانات والاتجاهات - {formatDate(currentDate, 'dd/MM/yyyy')}
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={refresh}
          disabled={isLoading}
          className={`hover:bg-wathiq-primary/10 ${isMobile ? 'min-h-[44px] w-full' : ''}`}
          aria-label={isLoading ? 'جاري تحديث البيانات' : 'تحديث البيانات'}
        >
          <RefreshCw className={`w-4 h-4 ml-2 ${isLoading ? 'animate-spin' : ''}`} />
          {isMobile ? 'تحديث البيانات' : 'تحديث'}
        </Button>
      </div>

      {/* Statistics - Mobile Optimized */}
      <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-3'}`}>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الإيرادات</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-success">
              {formatCurrency(statistics.totalIncome)}
            </div>
            <p className="text-xs text-muted-foreground">ريال سعودي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">متوسط السيولة</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-wathiq-primary">
              {formatCurrency(statistics.averageLiquidity)}
            </div>
            <p className="text-xs text-muted-foreground">ريال سعودي</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">متوسط إكمال المهام</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-wathiq-accent">
              {statistics.averageTaskCompletion.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">نسبة الإكمال</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts - Mobile Optimized */}
      <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
        {isLoading ? (
          <>
            <ChartSkeleton />
            <ChartSkeleton />
          </>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  السيولة المالية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                  <AreaChart data={liquidityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                     <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(value) => formatChartNumber(value)}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="value" 
                      stroke="hsl(var(--wathiq-primary))" 
                      fill="hsl(var(--wathiq-primary) / 0.1)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="w-5 h-5" />
                  توزيع المصروفات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={isMobile ? 250 : 300}>
                  <PieChart>
                    <Pie
                      data={expenseCategoriesData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {expenseCategoriesData.map((entry) => (
                        <Cell key={entry.name} fill={CHART_COLORS[expenseCategoriesData.indexOf(entry) % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Period Selection - Mobile Optimized */}
      <div className={`flex ${isMobile ? 'justify-center' : 'justify-end'}`}>
        <Select onValueChange={setSelectedPeriod} value={selectedPeriod}>
          <SelectTrigger 
            className={`${isMobile ? 'w-full max-w-xs min-h-[44px] text-base' : 'w-[180px]'}`}
            aria-label="اختر الفترة الزمنية"
          >
            <SelectValue placeholder="اختر الفترة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">آخر 7 أيام</SelectItem>
            <SelectItem value="30">آخر 30 يوم</SelectItem>
            <SelectItem value="90">آخر 90 يوم</SelectItem>
            <SelectItem value="365">آخر 365 يوم</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};