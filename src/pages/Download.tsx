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
  Zap
} from 'lucide-react';
import { useDateContext } from '@/contexts/DateContext';
import { getDataForDate } from '@/lib/mockData';
import { ExportService } from '@/services/ExportService';
import { EnhancedExportService, ExportProgress, BulkExportOptions } from '@/services/EnhancedExportService';
import { ExportProgressDialog } from '@/components/ui/export-progress-dialog';
import { BulkExportDialog } from '@/components/ui/bulk-export-dialog';
import { useToast } from '@/hooks/use-toast';

interface DownloadItem {
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
      date: currentDate,
      type: 'pdf',
      size: '2.3 MB',
      status: 'ready',
      description: 'تقرير شامل للحالة المالية اليومية',
      downloads: 12
    },
    {
      id: 2,
      name: 'بيانات المبيعات - CSV',
      section: 'المبيعات',
      date: currentDate,
      type: 'csv',
      size: '1.8 MB',
      status: 'ready',
      description: 'بيانات المبيعات بصيغة CSV',
      downloads: 8
    },
    {
      id: 3,
      name: 'تقرير العمليات',
      section: 'العمليات',
      date: currentDate,
      type: 'excel',
      size: '1.2 MB',
      status: 'ready',
      description: 'تقرير تفصيلي للعمليات اليومية',
      downloads: 5
    },
    {
      id: 4,
      name: 'أرشيف التسويق الأسبوعي',
      section: 'التسويق',
      date: new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000),
      type: 'zip',
      size: '15.7 MB',
      status: 'ready',
      description: 'أرشيف كامل لأنشطة التسويق الأسبوعية',
      downloads: 3
    },
    {
      id: 5,
      name: 'تقرير العملاء المفصل',
      section: 'العملاء',
      date: currentDate,
      type: 'pdf',
      size: '3.1 MB',
      status: 'processing',
      description: 'تقرير مفصل لقاعدة بيانات العملاء',
      downloads: 0
    },
    {
      id: 6,
      name: 'ملخص الأداء الشهري',
      section: 'إدارة',
      date: new Date(currentDate.getTime() - 30 * 24 * 60 * 60 * 1000),
      type: 'pdf',
      size: '5.4 MB',
      status: 'ready',
      description: 'ملخص شامل للأداء خلال الشهر الماضي',
      downloads: 25
    }
  ];

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
        return <Badge variant="default" className="bg-success text-success-foreground">جاهز</Badge>;
      case 'processing':
        return <Badge variant="secondary">قيد المعالجة</Badge>;
      case 'failed':
        return <Badge variant="destructive">فشل</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleDownload = async (item: DownloadItem) => {
    const exportId = `download-${item.id}-${Date.now()}`;
    
    // Add to progress tracking
    const newProgress: ExportProgress = {
      id: exportId,
      filename: item.name,
      progress: 0,
      status: 'pending'
    };
    
    setExportProgresses(prev => [...prev, newProgress]);
    setShowProgressDialog(true);

    // Set up progress callback
    EnhancedExportService.onProgress(exportId, (progress) => {
      setExportProgresses(prev => 
        prev.map(p => p.id === exportId ? progress : p)
      );
    });

    try {
      if (item.type === 'pdf') {
        // Use enhanced Arabic PDF export for all PDF types
        await EnhancedExportService.generateArabicPDF(currentDate, exportId);
      } else {
        // Use existing export methods with progress tracking
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
      status: 'pending'
    };
    
    setExportProgresses(prev => [...prev, newProgress]);
    setShowProgressDialog(true);

    // Set up progress callback
    EnhancedExportService.onProgress(exportId, (progress) => {
      setExportProgresses(prev => 
        prev.map(p => p.id === exportId ? progress : p)
      );
    });

    try {
      const zipFilename = await EnhancedExportService.bulkExport(options);
      
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

    try {
      await EnhancedExportService.retryExport(exportId, async () => {
        // Retry the original export
        if (exportId.startsWith('bulk-')) {
          // Would need to store original options for retry
        } else {
          // Retry individual export
        }
      });
    } catch (error) {
      toast({
        title: "فشل في إعادة المحاولة",
        description: "لم نتمكن من إعادة محاولة التصدير",
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
            <div className="text-2xl font-bold text-wathiq-primary">29.5</div>
            <p className="text-xs text-muted-foreground">ميجابايت</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">التحميلات اليوم</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-success">53</div>
            <p className="text-xs text-muted-foreground">عملية تحميل</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">قيد المعالجة</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="text-2xl font-bold text-warning">1</div>
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
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">اسم الملف</TableHead>
                <TableHead className="text-right">القسم</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">الحجم</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">التحميلات</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
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
                      >
                        <DownloadIcon className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" disabled>
                        <Calendar className="w-4 h-4" />
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