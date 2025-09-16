import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Download, Eye, Calendar, Filter } from 'lucide-react';
import { useDateContext } from '@/contexts/DateContext';
import { ReportViewerDialog } from '@/components/ui/report-viewer-dialog';
import { ExportService } from '@/services/ExportService';
import { getDataForDate, DailyData } from '@/lib/mockData';
import { useToast } from '@/hooks/use-toast';

export const Reports: React.FC = () => {
  const { currentDate, formatDate } = useDateContext();
  const { toast } = useToast();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{ data: DailyData; section: string } | null>(null);

  // Get real data for reports
  const dailyData = getDataForDate(currentDate);
  
  const reports = [
    {
      id: 1,
      title: 'تقرير المالية اليومي',
      section: 'المالية',
      date: currentDate,
      status: dailyData.finance.entries.length > 0 ? 'مكتمل' : 'معلق',
      type: 'daily',
      size: dailyData.finance.entries.length > 0 ? '2.3 MB' : '-',
      submittedBy: dailyData.finance.entries.length > 0 ? 'النظام المالي' : '-',
      submittedAt: dailyData.finance.entries.length > 0 ? '09:30' : '-'
    },
    {
      id: 2,
      title: 'تقرير المبيعات اليومي',
      section: 'المبيعات',
      date: currentDate,
      status: dailyData.sales.entries.length > 0 ? 'مكتمل' : 'معلق',
      type: 'daily',
      size: dailyData.sales.entries.length > 0 ? '1.8 MB' : '-',
      submittedBy: dailyData.sales.entries.length > 0 ? 'نظام المبيعات' : '-',
      submittedAt: dailyData.sales.entries.length > 0 ? '10:15' : '-'
    },
    {
      id: 3,
      title: 'تقرير العمليات اليومي',
      section: 'العمليات',
      date: currentDate,
      status: dailyData.operations.entries.length > 0 ? 'مكتمل' : 'معلق',
      type: 'daily',
      size: dailyData.operations.entries.length > 0 ? '1.2 MB' : '-',
      submittedBy: dailyData.operations.entries.length > 0 ? 'نظام العمليات' : '-',
      submittedAt: dailyData.operations.entries.length > 0 ? '11:00' : '-'
    },
    {
      id: 4,
      title: 'تقرير التسويق اليومي',
      section: 'التسويق',
      date: currentDate,
      status: dailyData.marketing.tasks.length > 0 ? 'مكتمل' : 'معلق',
      type: 'daily',
      size: dailyData.marketing.tasks.length > 0 ? '1.5 MB' : '-',
      submittedBy: dailyData.marketing.tasks.length > 0 ? 'نظام التسويق' : '-',
      submittedAt: dailyData.marketing.tasks.length > 0 ? '11:30' : '-'
    },
  ];

  const handleViewReport = (reportId: number) => {
    const report = reports.find(r => r.id === reportId);
    if (report && report.status === 'مكتمل') {
      setSelectedReport({ data: dailyData, section: report.section });
      setViewerOpen(true);
    }
  };

  const handleDownloadReport = (reportId: number) => {
    const report = reports.find(r => r.id === reportId);
    if (report && report.status === 'مكتمل') {
      try {
        switch (report.section) {
          case 'المالية':
            ExportService.exportFinanceCSV(currentDate);
            break;
          case 'المبيعات':
            ExportService.exportSalesCSV(currentDate);
            break;
          case 'العمليات':
            ExportService.exportOperationsCSV(currentDate);
            break;
          case 'التسويق':
            ExportService.exportMarketingCSV(currentDate);
            break;
        }
        toast({
          title: "تم التحميل بنجاح",
          description: `تم تحميل ${report.title} بنجاح`,
        });
      } catch (error) {
        toast({
          title: "خطأ في التحميل",
          description: "حدث خطأ أثناء تحميل التقرير",
          variant: "destructive",
        });
      }
    }
  };

  const handleBulkDownload = () => {
    try {
      ExportService.exportMergedDailyCSV(currentDate);
      toast({
        title: "تم التحميل بنجاح",
        description: "تم تحميل التقرير المجمع بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ في التحميل",
        description: "حدث خطأ أثناء تحميل التقرير المجمع",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'مكتمل' ? 'default' : status === 'معلق' ? 'secondary' : 'destructive';
    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">التقارير</h1>
          <p className="text-muted-foreground mt-1">
            إدارة وعرض التقارير اليومية - {formatDate(currentDate, 'dd/MM/yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 ml-2" />
            فلترة
          </Button>
          <Button variant="default" size="sm" onClick={handleBulkDownload}>
            <Download className="w-4 h-4 ml-2" />
            تحميل مجمع
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي التقارير</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-foreground">{reports.length}</div>
            <p className="text-xs text-muted-foreground">لهذا اليوم</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">المكتملة</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-success">{reports.filter(r => r.status === 'مكتمل').length}</div>
            <p className="text-xs text-muted-foreground">{Math.round((reports.filter(r => r.status === 'مكتمل').length / reports.length) * 100)}% معدل الإنجاز</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">المعلقة</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-warning">{reports.filter(r => r.status === 'معلق').length}</div>
            <p className="text-xs text-muted-foreground">{Math.round((reports.filter(r => r.status === 'معلق').length / reports.length) * 100)}% متبقية</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">حجم البيانات</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-foreground">{reports.filter(r => r.status === 'مكتمل').length * 1.8}</div>
            <p className="text-xs text-muted-foreground">ميجابايت</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            تقارير اليوم
          </CardTitle>
          <CardDescription>
            قائمة بجميع التقارير المقدمة لهذا اليوم
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">اسم التقرير</TableHead>
                <TableHead className="text-right">القسم</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">مقدم بواسطة</TableHead>
                <TableHead className="text-right">وقت التسليم</TableHead>
                <TableHead className="text-right">الحجم</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.title}</TableCell>
                  <TableCell>{report.section}</TableCell>
                  <TableCell>{getStatusBadge(report.status)}</TableCell>
                  <TableCell>{report.submittedBy}</TableCell>
                  <TableCell>{report.submittedAt}</TableCell>
                  <TableCell>{report.size}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {report.status === 'مكتمل' && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewReport(report.id)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadReport(report.id)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ReportViewerDialog
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        data={selectedReport?.data || null}
        section={selectedReport?.section || ''}
        date={currentDate}
      />
    </div>
  );
};