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
import { format } from 'date-fns'; // Import format from date-fns
import { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuCheckboxItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import ar from '@/localization/ar.json';
import { AuthService } from '@/services/AuthService';

export const Reports: React.FC = () => {
  const { currentDate, formatDate } = useDateContext();
  const { toast } = useToast();
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<{ data: DailyData; section: ReportSectionType } | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'مكتمل' | 'معلق'>('all');
  const [filterSection, setFilterSection] = useState<ReportSectionType[]>([]);

  // Get real data for reports
  const dailyData = getDataForDate(currentDate);

  // Helper function to estimate report size
  const calculateReportSize = (data: any[]): string => {
    const sizeInKB = data.length * 0.15; // Estimate 0.15 KB per entry
    if (sizeInKB < 1) return '< 1 KB';
    if (sizeInKB < 1024) return `${sizeInKB.toFixed(1)} KB`;
    return `${(sizeInKB / 1024).toFixed(1)} MB`;
  };

  // Helper function to get dynamic submitted by
  const getSubmittedBy = (sectionKey: keyof typeof ar.reports.reportSections): string => {
    return ar.reports.submittedBy[sectionKey];
  };

  // Helper function to get dynamic submitted at (random time between 9:00 and 17:00)
  const getSubmittedAt = (): string => {
    const hour = Math.floor(Math.random() * (17 - 9 + 1)) + 9; // Random hour between 9 and 17
    const minute = Math.floor(Math.random() * 60);
    return format(new Date().setHours(hour, minute), 'HH:mm');
  };

  // Helper to trigger download with progress and toast
  const triggerDownloadWithProgress = async (
    exportFunction: (date: Date) => void,
    filename: string,
    reportTitle: string
  ) => {
    toast({
      title: `${ar.reports.toast.downloadStart} ${reportTitle}`,
      description: ar.reports.toast.downloadInProgress,
      variant: "default",
      duration: 3000,
    });
    try {
      exportFunction(currentDate);
      toast({
        title: ar.reports.toast.downloadSuccess,
        description: ar.reports.toast.downloadSuccessDescription.replace('{reportTitle}', reportTitle),
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: ar.reports.toast.downloadError,
        description: ar.reports.toast.downloadErrorDescription.replace('{reportTitle}', reportTitle),
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  interface Report {
    id: number;
    title: string;
    section: ReportSectionType;
    date: Date;
    status: string;
    type: string;
    size: string;
    submittedBy: string;
    submittedAt: string;
  }

  const reports: Report[] = [
    {
      id: 1,
      title: ar.reports.reportTitles.finance,
      section: 'finance',
      date: currentDate,
      status: dailyData.finance.entries.length > 0 ? ar.reports.status.completed : ar.reports.status.pending,
      type: 'daily',
      size: calculateReportSize(dailyData.finance.entries),
      submittedBy: getSubmittedBy('finance'),
      submittedAt: getSubmittedAt()
    },
    {
      id: 2,
      title: ar.reports.reportTitles.sales,
      section: 'sales',
      date: currentDate,
      status: dailyData.sales.entries.length > 0 ? ar.reports.status.completed : ar.reports.status.pending,
      type: 'daily',
      size: calculateReportSize(dailyData.sales.entries),
      submittedBy: getSubmittedBy('sales'),
      submittedAt: getSubmittedAt()
    },
    {
      id: 3,
      title: ar.reports.reportTitles.operations,
      section: 'operations',
      date: currentDate,
      status: dailyData.operations.entries.length > 0 ? ar.reports.status.completed : ar.reports.status.pending,
      type: 'daily',
      size: calculateReportSize(dailyData.operations.entries),
      submittedBy: getSubmittedBy('operations'),
      submittedAt: getSubmittedAt()
    },
    {
      id: 4,
      title: ar.reports.reportTitles.marketing,
      section: 'marketing',
      date: currentDate,
      status: dailyData.marketing.tasks.length > 0 ? ar.reports.status.completed : ar.reports.status.pending,
      type: 'daily',
      size: calculateReportSize(dailyData.marketing.tasks),
      submittedBy: getSubmittedBy('marketing'),
      submittedAt: getSubmittedAt()
    },
    {
      id: 5,
      title: ar.reports.reportTitles.customers,
      section: 'customers',
      date: currentDate,
      status: dailyData.customers.length > 0 ? ar.reports.status.completed : ar.reports.status.pending,
      type: 'daily',
      size: calculateReportSize(dailyData.customers),
      submittedBy: getSubmittedBy('customers' as any),
      submittedAt: getSubmittedAt()
    },
  ];

  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const statusMatch = filterStatus === 'all' || report.status === filterStatus;
      const sectionMatch = filterSection.length === 0 || filterSection.includes(report.section as ReportSectionType);
      return statusMatch && sectionMatch;
    });
  }, [reports, filterStatus, filterSection]);

  const handleViewReport = (reportId: number) => {
    const report = reports.find(r => r.id === reportId);
    if (report && report.status === ar.reports.status.completed) {
      setSelectedReport({ data: dailyData, section: report.section });
      setViewerOpen(true);
    }
  };

  const handleDownloadReport = (reportId: number) => {
    const report = reports.find(r => r.id === reportId);
    if (report && report.status === ar.reports.status.completed) {
      switch (report.section) {
        case 'finance':
          triggerDownloadWithProgress(ExportService.exportFinanceCSV, `finance-${formatDate(currentDate, 'yyyy-MM-dd')}.csv`, report.title);
          break;
        case 'sales':
          triggerDownloadWithProgress(ExportService.exportSalesCSV, `sales-${formatDate(currentDate, 'yyyy-MM-dd')}.csv`, report.title);
          break;
        case 'operations':
          triggerDownloadWithProgress(ExportService.exportOperationsCSV, `operations-${formatDate(currentDate, 'yyyy-MM-dd')}.csv`, report.title);
          break;
        case 'marketing':
          triggerDownloadWithProgress(ExportService.exportMarketingCSV, `marketing-${formatDate(currentDate, 'yyyy-MM-dd')}.csv`, report.title);
          break;
        case 'customers':
          triggerDownloadWithProgress(ExportService.exportCustomersCSV, `customers-${formatDate(currentDate, 'yyyy-MM-dd')}.csv`, report.title);
          break;
      }
    }
  };

  const handleBulkDownload = async () => {
    try {
      // Check export permission before expensive operation
      const canExport = await AuthService.canAccessResource('reports');
      if (!canExport) {
        toast({
          title: 'غير مصرح',
          description: 'ليس لديك صلاحية لتصدير التقارير',
          variant: 'destructive',
        });
        return;
      }

      triggerDownloadWithProgress(ExportService.exportMergedDailyCSV, `merged-daily-report-${formatDate(currentDate, 'yyyy-MM-dd')}.csv`, ar.reports.reportTitles.merged);
    } catch (err) {
      console.error('Error checking export permission:', err);
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === ar.reports.status.completed ? 'default' : status === ar.reports.status.pending ? 'secondary' : 'destructive';
    
    // Add dark mode specific classes
    let className = '';
    if (status === ar.reports.status.completed) {
      className = 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-700';
    } else if (status === ar.reports.status.pending) {
      className = 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-200 dark:border-yellow-700';
    } else {
      className = 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-700';
    }

    return <Badge variant={variant} className={className}>{status}</Badge>;
  };

  // Helper to convert size string to KB
  const parseSizeStringToKB = (sizeStr: string): number => {
    if (sizeStr === '-') return 0;
    const [valueStr, unit] = sizeStr.split(' ');
    const value = parseFloat(valueStr);
    if (isNaN(value)) return 0;

    switch (unit) {
      case ar.reports.statsCards.kb:
        return value;
      case ar.reports.statsCards.mb:
        return value * 1024;
      default:
        return 0;
    }
  };

  const totalCompletedReportsSizeKB = reports
    .filter(report => report.status === ar.reports.status.completed)
    .reduce((sum, report) => sum + parseSizeStringToKB(report.size), 0);

  const totalSizeDisplay = totalCompletedReportsSizeKB < 1024
    ? `${totalCompletedReportsSizeKB.toFixed(1)} ${ar.reports.statsCards.kb}`
    : `${(totalCompletedReportsSizeKB / 1024).toFixed(1)} ${ar.reports.statsCards.mb}`;
  
  const totalSizeUnit = totalCompletedReportsSizeKB < 1024 ? ar.reports.statsCards.kb : ar.reports.statsCards.mb;

  const allSections = useMemo(() => {
    const sections = new Set<keyof typeof ar.reports.reportSections>();
    reports.forEach(report => sections.add(report.section as keyof typeof ar.reports.reportSections));
    return Array.from(sections);
  }, [reports]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">{ar.reports.title}</h1>
          <p className="text-muted-foreground mt-1">
            {ar.reports.description} - {formatDate(currentDate, 'dd/MM/yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 ml-2" />
                {ar.reports.header.filterSection} ({filterSection.length > 0 ? filterSection.length : ar.reports.header.allSections})
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
              {allSections.map(sectionKey => (
                <DropdownMenuCheckboxItem
                  key={sectionKey}
                  checked={filterSection.includes(sectionKey as ReportSectionType)}
                  onCheckedChange={(checked) => {
                    setFilterSection(prev =>
                      checked ? [...prev, sectionKey as ReportSectionType] : prev.filter(s => s !== sectionKey)
                    );
                  }}
                >
                  {ar.reports.reportSections[sectionKey]}
                </DropdownMenuCheckboxItem>
              ))}
              <DropdownMenuCheckboxItem
                checked={filterSection.length === 0}
                onCheckedChange={() => setFilterSection([])}
              >
                {ar.reports.header.allSections}
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Select value={filterStatus} onValueChange={(value: 'all' | 'مكتمل' | 'معلق') => setFilterStatus(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={ar.reports.header.filterStatus} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{ar.reports.header.allStatuses}</SelectItem>
              <SelectItem value={ar.reports.status.completed}>{ar.reports.header.completed}</SelectItem>
              <SelectItem value={ar.reports.status.pending}>{ar.reports.header.pending}</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="secondary" size="sm" className="dark:border dark:border-border-strong" onClick={handleBulkDownload}>
            <Download className="w-4 h-4 ml-2" />
            {ar.reports.header.bulkDownload}
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{ar.reports.statsCards.totalReports}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-foreground">{filteredReports.length}</div>
            <p className="text-xs text-muted-foreground">{ar.reports.statsCards.today}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{ar.reports.statsCards.completed}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-success">{filteredReports.filter(r => r.status === ar.reports.status.completed).length}</div>
            <p className="text-xs text-muted-foreground">{Math.round((filteredReports.filter(r => r.status === ar.reports.status.completed).length / (filteredReports.length || 1)) * 100)}% {ar.reports.statsCards.completionRate}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{ar.reports.statsCards.pending}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-warning">{filteredReports.filter(r => r.status === ar.reports.status.pending).length}</div>
            <p className="text-xs text-muted-foreground">{Math.round((filteredReports.filter(r => r.status === ar.reports.status.pending).length / (filteredReports.length || 1)) * 100)}% {ar.reports.statsCards.remaining}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{ar.reports.statsCards.dataSize}</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-foreground">{totalSizeDisplay}</div>
            <p className="text-xs text-muted-foreground">{totalSizeUnit}</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {ar.reports.reportsTable.title}
          </CardTitle>
          <CardDescription>
            {ar.reports.reportsTable.description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">{ar.reports.reportsTable.tableHeaders.reportName}</TableHead>
                <TableHead className="text-right">{ar.reports.reportsTable.tableHeaders.section}</TableHead>
                <TableHead className="text-right">{ar.reports.reportsTable.tableHeaders.status}</TableHead>
                <TableHead className="text-right">{ar.reports.reportsTable.tableHeaders.submittedBy}</TableHead>
                <TableHead className="text-right">{ar.reports.reportsTable.tableHeaders.submissionTime}</TableHead>
                <TableHead className="text-right">{ar.reports.reportsTable.tableHeaders.size}</TableHead>
                <TableHead className="text-right">{ar.reports.reportsTable.tableHeaders.actions}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    {ar.reports.reportsTable.noReports}
                  </TableCell>
                </TableRow>
              ) : (
                filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell className="font-medium">{report.title}</TableCell>
                    <TableCell>{ar.reports.reportSections[report.section as keyof typeof ar.reports.reportSections]}</TableCell>
                    <TableCell>{getStatusBadge(report.status)}</TableCell>
                    <TableCell>{report.submittedBy}</TableCell>
                    <TableCell>{report.submittedAt}</TableCell>
                    <TableCell>{report.size}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {report.status === ar.reports.status.completed && (
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
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ReportViewerDialog
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        data={selectedReport?.data || null}
        section={selectedReport?.section || 'finance'}
        date={currentDate}
      />
    </div>
  );
};

type ReportSectionType = keyof typeof ar.reports.reportSections;

export type { ReportSectionType };