import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  FileText, 
  Download, 
  CheckCircle, 
  AlertCircle,
  Target,
  Calendar,
  RefreshCw,
  UserPlus
} from 'lucide-react';
import { useDateContext } from '@/contexts/DateContext';
import { useChartData } from '@/hooks/useChartData';
import { getDataForDate, DailyData } from '@/lib/mockData';
import { ExportService } from '@/services/ExportService';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency, formatChartNumber } from '@/lib/numberUtils';
import { ReportViewerDialog } from '@/components/ui/report-viewer-dialog';
import { TripReportsService } from '@/services/TripReportsService';
import { format, parseISO } from 'date-fns';
import { ReportSectionType } from '@/pages/Reports';

export const ManagerDashboard: React.FC = () => {
  const { currentDate, formatDate } = useDateContext();
  const { toast } = useToast();
  const [reportDialog, setReportDialog] = useState<{
    open: boolean;
    data: DailyData | null;
    section: ReportSectionType | 'merged';
    date: Date | null;
  }>({
    open: false, 
    data: null, 
    section: 'finance', 
    date: null 
  });
  const [currentTrips, setCurrentTrips] = useState<any[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(true);
  
  const { 
    liquidityData, 
    incomeVsExpensesData, 
    tasksCompletionData, 
    customersTrendData,
    sectionSubmissionData,
    expenseCategoriesData,
    salesPerformanceData,
    statistics,
    tripsTrendData,
    isLoading,
    error,
    refresh
  } = useChartData(30);

  // Fetch trips from Supabase for current date
  useEffect(() => {
    let isMounted = true;
    let retryTimeout: NodeJS.Timeout | null = null;
    let retryCount = 0;
    let abortController: AbortController | null = null;
    const MAX_RETRIES = 1; // Reduced to 1 retry only
    
    const loadTrips = async () => {
      if (!isMounted) {
        console.log('[ManagerDashboard] Component unmounted, aborting load');
        return;
      }
      
      // Cancel any previous request
      if (abortController) {
        abortController.abort();
      }
      
      // Create new abort controller for this request
      abortController = new AbortController();
      const signal = abortController.signal;
      
      setLoadingTrips(true);
      try {
        const trips = await TripReportsService.listByDate(currentDate);
        if (isMounted && !signal.aborted) {
          setCurrentTrips(trips);
          retryCount = 0; // Reset on success
          console.log('[ManagerDashboard] Successfully loaded trips:', trips.length);
        }
      } catch (error: any) {
        if (!isMounted || signal.aborted) return;
        
        const isInsufficientResources = error?.message?.includes('ERR_INSUFFICIENT_RESOURCES') ||
                                       error?.code === 'ERR_INSUFFICIENT_RESOURCES';
        const isNetworkError = error?.message?.includes('network') || 
                              error?.message?.includes('ERR_NETWORK') ||
                              error?.code === 'ERR_NETWORK_CHANGED';
        
        // NEVER retry on ERR_INSUFFICIENT_RESOURCES - it causes infinite loops
        if (isInsufficientResources) {
          console.error('[ManagerDashboard] ERR_INSUFFICIENT_RESOURCES detected - stopping immediately, no retries:', error);
          if (isMounted) {
            setCurrentTrips([]);
            setLoadingTrips(false);
          }
          return; // Stop immediately, no retries
        }
        
        // For other network errors, allow one retry
        if (isNetworkError && retryCount < MAX_RETRIES) {
          retryCount++;
          console.warn(`[ManagerDashboard] Network error (retry ${retryCount}/${MAX_RETRIES}), will retry once...`, error);
          
          // Clear any existing timeout
          if (retryTimeout) {
            clearTimeout(retryTimeout);
          }
          
          // Retry only once after a delay
          retryTimeout = setTimeout(() => {
            if (isMounted && retryCount <= MAX_RETRIES) {
              loadTrips();
            }
          }, 2000); // 2 second delay
          return;
        }
        
        // Max retries reached or non-network error - stop trying
        console.error('[ManagerDashboard] Failed to load trips, stopping retries:', error);
        if (isMounted) {
          setCurrentTrips([]);
          setLoadingTrips(false);
        }
      } finally {
        if (isMounted) {
          setLoadingTrips(false);
        }
      }
    };
    
    loadTrips();
    
    return () => {
      console.log('[ManagerDashboard] ========== CLEANUP STARTED ==========');
      isMounted = false;
      if (retryTimeout) {
        clearTimeout(retryTimeout);
        retryTimeout = null;
        console.log('[ManagerDashboard] Cleanup: cleared retry timeout');
      }
      if (abortController) {
        abortController.abort();
        abortController = null;
        console.log('[ManagerDashboard] Cleanup: aborted in-flight request');
      }
      console.log('[ManagerDashboard] ========== CLEANUP COMPLETE: stopped all retries and aborted requests ==========');
    };
  }, [currentDate]);

  // Get current day data
  const currentData = getDataForDate(currentDate);
  
  // Merge Supabase trips with localStorage data (prioritize Supabase)
  const mergedTrips = currentTrips.length > 0 ? currentTrips : currentData.trips.entries;

  // Handle export downloads
  const handleExportDaily = async () => {
    try {
      await ExportService.generatePDFReport(currentDate);
      toast({
        title: "تم التصدير بنجاح",
        description: "تم تصدير التقرير اليومي المدمج",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "خطأ في التصدير",
        description: "حدث خطأ أثناء تصدير التقرير",
        variant: "destructive",
      });
    }
  };

  // Handle report viewing
  const handleViewReport = (dateStr: string) => {
    const reportDate = parseISO(dateStr);
    const reportData = getDataForDate(reportDate);
    setReportDialog({
      open: true,
      data: reportData,
      section: 'merged',
      date: reportDate
    });
  };

  // Calculate current day KPIs
  const currentLiquidity = currentData.finance.currentLiquidity;
  const totalReportsToday = [
    currentData.finance.entries.length > 0,
    currentData.sales.entries.length > 0,
    currentData.operations.entries.length > 0,
    currentData.marketing.tasks.length > 0,
    currentData.customers.length > 0,
    mergedTrips.length > 0
  ].filter(Boolean).length;

  const totalSections = 6;
  const dailyIncome = currentData.finance.entries
    .filter(entry => entry.type === 'income')
    .reduce((sum, entry) => sum + entry.amount, 0);
  const dailyExpenses = currentData.finance.entries
    .filter(entry => entry.type === 'expense')
    .reduce((sum, entry) => sum + entry.amount, 0);

  // Calculate new customers today (from all sources)
  const newCustomersToday = 
    currentData.customers.length + // Direct customers
    currentData.sales.customersContacted + // Sales contacts
    // TODO: Refactor marketingCustomers calculation to use a more robust method (e.g., a dedicated isCustomerRelated flag in task data) instead of string matching on task titles.
    currentData.marketing.tasks.filter(task => task.title.includes('عميل')).length; // Marketing customer tasks

  const tripsApprovedToday = mergedTrips.filter(entry => entry.status === 'approved').length;
  const tripsWarningToday = mergedTrips.filter(entry => entry.status === 'warning').length;

  const COLORS = ['hsl(var(--wathiq-primary))', 'hsl(var(--wathiq-accent))', 'hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--destructive))'];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">لوحة تحكم المدير</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            نظرة شاملة على العمليات اليومية - {formatDate(currentDate, 'dd/MM/yyyy')}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={refresh}
            disabled={isLoading}
            className="hover:bg-wathiq-primary/10 w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 ml-2 ${isLoading ? 'animate-spin' : ''}`} />
            تحديث البيانات
          </Button>
          <Button 
            onClick={handleExportDaily}
            className="bg-wathiq-primary hover:bg-wathiq-primary/90 w-full sm:w-auto"
          >
            <Download className="w-4 h-4 ml-2" />
            تقرير يومي مدمج
          </Button>
        </div>
      </div>

      {/* KPIs Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">السيولة الحالية</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-wathiq-primary">
              {formatCurrency(currentLiquidity)} ريال سعودي <TrendingUp className="w-3 h-3 inline mr-1 text-success" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">التقارير اليوم</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-foreground">
              {totalReportsToday}/{totalSections}
            </div>
            <p className="text-xs text-muted-foreground">قسم مكتمل</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">الإيرادات اليوم</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-success">
              {formatCurrency(dailyIncome)} ريال سعودي
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">المصروفات اليوم</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-destructive">
              {formatCurrency(dailyExpenses)} ريال سعودي
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">العملاء الجدد اليوم</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-wathiq-accent">
              {newCustomersToday}
            </div>
            <p className="text-xs text-muted-foreground">
              عميل جديد
              <UserPlus className="w-3 h-3 inline mr-1 text-wathiq-accent" />
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              السيولة - آخر 30 يوم
            </CardTitle>
            <CardDescription>تطور السيولة المالية خلال الشهر الماضي</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={liquidityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                 <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => formatChartNumber(value)}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [formatCurrency(value), 'السيولة']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--wathiq-primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--wathiq-primary))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              الإيرادات مقابل المصروفات
            </CardTitle>
            <CardDescription>مقارنة يومية للإيرادات والمصروفات</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={incomeVsExpensesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                 <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickFormatter={(value) => formatChartNumber(value)}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [formatCurrency(value)]}
                />
                <Bar dataKey="income" fill="hsl(var(--success))" name="الإيرادات" />
                <Bar dataKey="expenses" fill="hsl(var(--destructive))" name="المصروفات" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              معدل إكمال المهام
            </CardTitle>
            <CardDescription>نسبة إكمال المهام اليومية</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={tasksCompletionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  domain={[0, 100]}
                  tickFormatter={(value) => `${value}%`}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'نسبة الإكمال']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--wathiq-accent))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--wathiq-accent))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              اتجاه العملاء
            </CardTitle>
            <CardDescription>عدد العملاء الجدد يومياً</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={customersTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => [`${value}`, 'العملاء']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="hsl(var(--wathiq-accent))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--wathiq-accent))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            مؤشرات الرحلات اليومية
          </CardTitle>
          <CardDescription>
            مراقبة عدد الرحلات المكتملة والملاحظات خلال آخر 30 يوماً
          </CardDescription>
          <div className="text-sm text-muted-foreground">
            اليوم: {tripsApprovedToday} رحلة جاهزة • {tripsWarningToday} رحلة تحتاج متابعة • قيد المزامنة: {currentData.trips.pendingSync}
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={tripsTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="approved" stackId="trips" fill="hsl(var(--success))" name="جاهزة" />
              <Bar dataKey="warnings" stackId="trips" fill="hsl(var(--warning))" name="تنبيه" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 30-day Submission Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            جدول التقارير - آخر 30 يوم
          </CardTitle>
          <CardDescription>
            حالة إرسال التقارير من كل قسم خلال الشهر الماضي
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">المالية</TableHead>
                <TableHead className="text-right">المبيعات</TableHead>
                <TableHead className="text-right">العمليات</TableHead>
                <TableHead className="text-right">التسويق</TableHead>
                <TableHead className="text-right">العملاء</TableHead>
                <TableHead className="text-right">الرحلات</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sectionSubmissionData.slice(-15).reverse().map((item) => (
                <TableRow key={item.date}>
                  <TableCell className="font-medium">{item.date}</TableCell>
                  <TableCell>
                    {item.المالية ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    )}
                  </TableCell>
                  <TableCell>
                    {item.المبيعات ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    )}
                  </TableCell>
                  <TableCell>
                    {item.العمليات ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    )}
                  </TableCell>
                  <TableCell>
                    {item.التسويق ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    )}
                  </TableCell>
                  <TableCell>
                    {item.العملاء ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    )}
                  </TableCell>
                  <TableCell>
                    {item.الرحلات ? (
                      <CheckCircle className="w-4 h-4 text-success" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="hover:bg-wathiq-primary/10"
                        onClick={() => handleViewReport(item.label || item.date)}
                        title="عرض التقرير"
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="hover:bg-wathiq-primary/10"
                        onClick={handleExportDaily}
                        title="تحميل التقرير"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Report Viewer Dialog */}
      {reportDialog.date && (
        <ReportViewerDialog
          open={reportDialog.open}
          onOpenChange={(open) => setReportDialog({ ...reportDialog, open })}
          data={reportDialog.data}
          section={reportDialog.section}
          date={reportDialog.date}
        />
      )}
    </div>
  );
};