import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Download as DownloadIcon, 
  FileText, 
  Calendar, 
  Filter, 
  Search, 
  Package, 
  FileSpreadsheet,
  Archive,
  Zap,
  Loader2, // Import Loader2
  XCircle // Import XCircle
} from 'lucide-react';
import { useDateContext } from '@/contexts/DateContext';
import { getDataForDate } from '@/lib/mockData';
import { ExportService, ExportProgress, BulkExportOptions } from '@/services/ExportService';
import { ExportProgressDialog } from '@/components/ui/export-progress-dialog';
import { BulkExportDialog } from '@/components/ui/bulk-export-dialog';
import { useToast } from '@/hooks/use-toast';
import { isToday } from '@/hooks/useDateNavigation'; // Import isToday
import { ARABIC_DOWNLOAD_MESSAGES } from '@/lib/arabicDownloadMessages';

export interface DownloadItem {
  id: number;
  name: string;
  section: string;
  date: Date;
  type: 'pdf' | 'csv' | 'excel' | 'zip';
  size: string;
  status: 'ready' | 'processing' | 'failed';
  description: string;
  downloads: number;
}

export const Download: React.FC = () => {
  const { currentDate, formatDate } = useDateContext();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [exportProgresses, setExportProgresses] = useState<ExportProgress[]>([]);
  const [showProgressDialog, setShowProgressDialog] = useState(false);

  // Mock data for downloadable items
  const downloadItems: DownloadItem[] = [
    {
      id: 1,
      name: 'تقرير المالية اليومي',
      section: 'المالية',
      date: new Date(currentDate.getTime() - 1 * 24 * 60 * 60 * 1000), // Yesterday
      type: 'pdf',
      size: '2.3 MB', // This is mock data; in a real app, calculate dynamically
      status: 'ready',
      description: 'تقرير شامل للحالة المالية اليومية',
      downloads: 12
    },
    {
      id: 2,
      name: 'بيانات المبيعات - CSV',
      section: 'المبيعات',
      date: new Date(currentDate.getTime() - 2 * 24 * 60 * 60 * 1000), // Two days ago
      type: 'csv',
      size: '1.8 MB', // This is mock data; in a real app, calculate dynamically
      status: 'ready',
      description: 'بيانات المبيعات بصيغة CSV',
      downloads: 8
    },
    {
      id: 3,
      name: 'تقرير العمليات',
      section: 'العمليات',
      date: new Date(currentDate.getTime() - 5 * 24 * 60 * 60 * 1000), // Five days ago
      type: 'excel',
      size: '1.2 MB', // This is mock data; in a real app, calculate dynamically
      status: 'ready',
      description: 'تقرير تفصيلي للعمليات اليومية',
      downloads: 5
    },
    {
      id: 4,
      name: 'أرشيف التسويق الأسبوعي',
      section: 'التسويق',
      date: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000), // One week ago
      type: 'zip',
      size: '15.7 MB', // This is mock data; in a real app, calculate dynamically
      status: 'ready',
      description: 'أرشيف كامل لأنشطة التسويق الأسبوعية',
      downloads: 3
    },
    {
      id: 5,
      name: 'تقرير العملاء المفصل',
      section: 'العملاء',
      date: new Date(currentDate.getTime() - 10 * 24 * 60 * 60 * 1000), // Ten days ago
      type: 'pdf',
      size: '3.1 MB', // This is mock data; in a real app, calculate dynamically
      status: 'processing',
      description: 'تقرير مفصل لقاعدة بيانات العملاء',
      downloads: 0
    },
    {
      id: 6,
      name: 'ملخص الأداء الشهري',
      section: 'إدارة',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate()), // One month ago
      type: 'pdf',
      size: '5.4 MB', // This is mock data; in a real app, calculate dynamically
      status: 'ready',
      description: 'ملخص شامل للأداء خلال الشهر الماضي',
      downloads: 25
    },
    {
      id: 7,
      name: 'تقرير المبيعات للربع الأخير',
      section: 'المبيعات',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, currentDate.getDate()), // Three months ago
      type: 'csv',
      size: '7.8 MB', // This is mock data; in a real app, calculate dynamically
      status: 'ready',
      description: 'بيانات المبيعات مجمعة للربع الأخير',
      downloads: 18
    },
    {
      id: 8,
      name: 'قائمة الموردين المحدثة',
      section: 'الموردين',
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 15), // Fifteen days ago
      type: 'excel',
      size: '0.9 MB', // This is mock data; in a real app, calculate dynamically
      status: 'ready',
      description: 'قائمة محدثة بجميع الموردين وبيانات الاتصال',
      downloads: 6
    }
  ];

  // Helper to parse size strings like "2.3 MB" to a number in MB
  const parseSizeToMB = (sizeStr: string): number => {
    const parts = sizeStr.split(' ');
    if (parts.length === 2) {
      const value = parseFloat(parts[0]);
      const unit = parts[1].toLowerCase();
      if (!isNaN(value)) {
        if (unit === 'mb') return value;
        // Add more unit conversions if necessary (e.g., KB, GB)
      }
    }
    return 0; // Default to 0 if parsing fails
  };

  // Calculate statistics
  const totalSizeMB = downloadItems.reduce((sum, item) => sum + parseSizeToMB(item.size), 0);
  const downloadsTodayCount = downloadItems.filter(item => isToday(item.date)).reduce((sum, item) => sum + item.downloads, 0);
  const inProgressCount = downloadItems.filter(item => item.status === 'processing').length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-destructive" />;
      case 'csv':
        return <FileSpreadsheet className="w-4 h-4 text-success" />;
      case 'excel':
        return <FileSpreadsheet className="w-4 h-4 text-wathiq-primary" />;
      case 'zip':
        return <Archive className="w-4 h-4 text-wathiq-accent" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge variant="default" className="bg-success text-success-foreground dark:bg-green-700 dark:text-green-100">جاهز</Badge>;
      case 'processing':
        return <Badge variant="secondary" className="dark:bg-yellow-900 dark:text-yellow-200">قيد المعالجة</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="dark:bg-red-700 dark:text-red-100">فشل</Badge>;
      default:
        return <Badge variant="secondary" className="dark:bg-gray-700 dark:text-gray-100">{status}</Badge>;
    }
  };

  const handleDownload = async (item: DownloadItem) => {
    const exportId = `download-${item.id}-${Date.now()}`;
    
    // Add to progress tracking
    const newProgress: ExportProgress = {
      id: exportId,
      filename: item.name,
      progress: 0,
      status: 'pending',
      originalItem: item, // Store the original item for retry
    };
    
    setExportProgresses(prev => [...prev, newProgress]);
    setShowProgressDialog(true);

    // Set up progress callback
    ExportService.onProgress(exportId, (progress) => {
      setExportProgresses(prev => 
        prev.map(p => p.id === exportId ? progress : p)
      );
    });

    try {
      if (item.type === 'pdf') {
        // Use enhanced Arabic PDF export for all PDF types
        await ExportService.generateArabicPDF(currentDate, exportId);
      } else {
        // Note: Progress tracking for non-PDF types is currently mocked via setTimeout.
        // In a real application, this would involve actual integration with ExportService
        // to report progress for CSV, Excel, and Zip file generations.
        switch (item.section) {
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
          case 'العملاء':
            ExportService.exportCustomersCSV(currentDate);
            break;
          default:
            ExportService.exportMergedDailyCSV(currentDate);
        }
        
        // Update progress for non-PDF exports
        setTimeout(() => {
          setExportProgresses(prev => 
            prev.map(p => p.id === exportId ? { ...p, progress: 100, status: 'completed' } : p)
          );
        }, 1000);
      }
      
      toast({
        title: "تم التحميل بنجاح",
        description: `تم تحميل ${item.name} بنجاح مع دعم محسن للنصوص العربية`,
      });
    } catch (error) {
      console.error('Download error:', error);
      setExportProgresses(prev => 
        prev.map(p => p.id === exportId ? 
          { ...p, status: 'failed', error: (error as Error).message } : p
        )
      );
      
      toast({
        title: "خطأ في التحميل",
        description: `حدث خطأ أثناء تحميل ${item.name}. يرجى المحاولة مرة أخرى.`,
        variant: "destructive",
      });
    }
  };

  const handleBulkExport = async (options: BulkExportOptions) => {
    const exportId = `bulk-${Date.now()}`;
    
    // Add to progress tracking
    const newProgress: ExportProgress = {
      id: exportId,
      filename: 'التصدير المجمع',
      progress: 0,
      status: 'pending',
      originalOptions: options, // Store the original options for bulk retry
    };
    
    setExportProgresses(prev => [...prev, newProgress]);
    setShowProgressDialog(true);

    // Set up progress callback
    ExportService.onProgress(exportId, (progress) => {
      setExportProgresses(prev => 
        prev.map(p => p.id === exportId ? progress : p)
      );
    });

    try {
      const zipFilename = await ExportService.bulkExport(options);
      
      toast({
        title: "تم التصدير المجمع بنجاح",
        description: `تم إنشاء الملف: ${zipFilename}`,
      });
    } catch (error) {
      console.error('Bulk export error:', error);
      setExportProgresses(prev => 
        prev.map(p => p.id === exportId ? 
          { ...p, status: 'failed', error: (error as Error).message } : p
        )
      );
      
      toast({
        title: "خطأ في التصدير المجمع",
        description: "حدث خطأ أثناء التصدير المجمع",
        variant: "destructive",
      });
    }
  };

  const handleRetryExport = async (exportId: string) => {
    const exportItem = exportProgresses.find(p => p.id === exportId);
    if (!exportItem) return;

    // Reset status to pending and clear error for retry attempt
    setExportProgresses(prev =>
      prev.map(p => p.id === exportId ? { ...p, progress: 0, status: 'pending', error: undefined } : p)
    );

    try {
      if (exportItem.originalOptions) {
        // Retry bulk export
        await ExportService.bulkExport(exportItem.originalOptions);
      } else if (exportItem.originalItem) {
        // Retry individual export
        await handleDownload(exportItem.originalItem); // Re-use the existing handleDownload logic
      } else {
        throw new Error('Could not find original export parameters for retry');
      }

      toast({
        title: "تمت إعادة المحاولة بنجاح",
        description: "تمت إعادة محاولة التصدير بنجاح",
      });
    } catch (error) {
      console.error('Retry export error:', error);
      setExportProgresses(prev =>
        prev.map(p => p.id === exportId ?
          { ...p, status: 'failed', error: (error as Error).message } : p
        )
      );
      toast({
        title: "فشل في إعادة المحاولة",
        description: `لم نتمكن من إعادة محاولة التصدير: ${(error as Error).message}`,
        variant: "destructive",
      });
    }
  };

  const handleDownloadCompleted = (exportId: string) => {
    // Handle download of completed export
    toast({
      title: "تم التحميل",
      description: "تم تحميل الملف بنجاح",
    });
  };

  // Filter items based on search and selections
  const filteredItems = downloadItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSection = selectedSection === 'all' || item.section === selectedSection;
    const matchesType = selectedType === 'all' || item.type === selectedType;
    
    return matchesSearch && matchesSection && matchesType;
  });

  const sections = ['المالية', 'المبيعات', 'العمليات', 'التسويق', 'العملاء', 'إدارة'];
  const types = ['pdf', 'csv', 'excel', 'zip'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">مركز التحميل</h1>
          <p className="text-muted-foreground mt-1">
            تحميل التقارير والملفات - {formatDate(currentDate, 'dd/MM/yyyy')}
          </p>
        </div>
        <div className="flex gap-2">
          <BulkExportDialog onExport={handleBulkExport} />
          
          <Button 
            onClick={() => setShowProgressDialog(true)}
            variant="outline"
            className="hover:bg-wathiq-primary/10"
            aria-label="عرض حالة التصدير"
            title="عرض حالة التصدير"
          >
            <Zap className="w-4 h-4 ml-2" />
            حالة التصدير
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">الملفات المتاحة</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-foreground">{downloadItems.length}</div>
            <p className="text-xs text-muted-foreground">ملف جاهز للتحميل</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">إجمالي الحجم</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-wathiq-primary">{totalSizeMB.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">ميجابايت</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">التحميلات اليوم</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-success">{downloadsTodayCount}</div>
            <p className="text-xs text-muted-foreground">عملية تحميل</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">قيد المعالجة</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-warning">{inProgressCount}</div>
            <p className="text-xs text-muted-foreground">ملف في الانتظار</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            البحث والفلترة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="البحث في الملفات..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger>
                <SelectValue placeholder="اختر القسم" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأقسام</SelectItem>
                {sections.map(section => (
                  <SelectItem key={section} value={section}>{section}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="نوع الملف" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الأنواع</SelectItem>
                {types.map(type => (
                  <SelectItem key={type} value={type}>{type.toUpperCase()}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedSection('all');
              setSelectedType('all');
            }}>
              إعادة تعيين
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Downloads Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DownloadIcon className="w-5 h-5" />
            الملفات المتاحة
          </CardTitle>
          <CardDescription>
            قائمة بجميع الملفات والتقارير المتاحة للتحميل
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{ARABIC_DOWNLOAD_MESSAGES.TABLE_HEAD_TYPE}</TableHead>
                <TableHead>{ARABIC_DOWNLOAD_MESSAGES.TABLE_HEAD_FILENAME}</TableHead>
                <TableHead>{ARABIC_DOWNLOAD_MESSAGES.TABLE_HEAD_SECTION}</TableHead>
                <TableHead>{ARABIC_DOWNLOAD_MESSAGES.TABLE_HEAD_DATE}</TableHead>
                <TableHead>{ARABIC_DOWNLOAD_MESSAGES.TABLE_HEAD_SIZE}</TableHead>
                <TableHead>{ARABIC_DOWNLOAD_MESSAGES.TABLE_HEAD_STATUS}</TableHead>
                <TableHead>{ARABIC_DOWNLOAD_MESSAGES.TABLE_HEAD_DOWNLOADS}</TableHead>
                <TableHead>{ARABIC_DOWNLOAD_MESSAGES.TABLE_HEAD_ACTIONS}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center">
                    {getTypeIcon(item.type)}
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-muted-foreground">{item.description}</div>
                    </div>
                  </TableCell>
                  <TableCell>{item.section}</TableCell>
                  <TableCell>{formatDate(item.date, 'dd/MM/yyyy')}</TableCell>
                  <TableCell>{item.size}</TableCell>
                  <TableCell>{getStatusBadge(item.status)}</TableCell>
                  <TableCell>{item.downloads}</TableCell>
                  <TableCell>
                    {item.status === 'ready' ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(item)}
                        className="hover:bg-wathiq-primary/10 hover:text-wathiq-primary"
                        aria-label={`تحميل ${item.name}`}
                        title={`تحميل ${item.name}`}
                      >
                        <DownloadIcon className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled
                        aria-label={item.status === 'processing' ? ARABIC_DOWNLOAD_MESSAGES.DISABLED_BUTTON_PROCESSING : ARABIC_DOWNLOAD_MESSAGES.DISABLED_BUTTON_FAILED}
                        title={item.status === 'processing' ? ARABIC_DOWNLOAD_MESSAGES.DISABLED_BUTTON_PROCESSING : ARABIC_DOWNLOAD_MESSAGES.DISABLED_BUTTON_FAILED}
                      >
                        {item.status === 'processing' ? (
                          <Loader2 className="w-4 h-4 animate-spin text-wathiq-primary" />
                        ) : (
                          <XCircle className="w-4 h-4 text-destructive" />
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredItems.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">لا توجد ملفات تطابق معايير البحث</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Progress Dialog */}
      <ExportProgressDialog
        open={showProgressDialog}
        onOpenChange={setShowProgressDialog}
        exports={exportProgresses}
        onRetry={handleRetryExport}
        onDownload={handleDownloadCompleted}
      />
    </div>
  );
};