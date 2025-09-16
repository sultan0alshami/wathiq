import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Download,
  Upload,
  Trash2,
  Database,
  Calendar,
  HardDrive,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { DataBackupService } from '@/services/DataBackupService';
import { useToast } from '@/hooks/use-toast';
import { ConfirmationDialog, DeleteConfirmationDialog } from '@/components/ui/confirmation-dialog';

export const DataBackupPanel: React.FC = () => {
  const [stats, setStats] = useState(DataBackupService.getBackupStats());
  const [loading, setLoading] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleExportBackup = async () => {
    try {
      setLoading(true);
      DataBackupService.exportBackup();
      toast({
        title: "تم التصدير بنجاح",
        description: "تم تحميل النسخة الاحتياطية",
      });
      
      // Update stats
      setStats(DataBackupService.getBackupStats());
    } catch (error) {
      toast({
        title: "فشل في التصدير",
        description: "حدث خطأ أثناء تصدير البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImportBackup = async (file: File) => {
    try {
      setLoading(true);
      const result = await DataBackupService.importBackup(file);
      setImportResult(result);
      
      if (result.success) {
        toast({
          title: "تم الاستيراد بنجاح",
          description: result.message,
        });
        setStats(DataBackupService.getBackupStats());
      } else {
        toast({
          title: "فشل في الاستيراد",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "فشل في الاستيراد",
        description: "حدث خطأ أثناء استيراد البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleImportBackup(file);
    }
  };

  const handleClearAllData = async () => {
    try {
      setLoading(true);
      const cleared = await DataBackupService.clearAllData();
      
      if (cleared) {
        toast({
          title: "تم حذف البيانات",
          description: "تم حذف جميع البيانات بنجاح",
        });
        setStats(DataBackupService.getBackupStats());
        setImportResult(null);
      }
    } catch (error) {
      toast({
        title: "فشل في الحذف",
        description: "حدث خطأ أثناء حذف البيانات",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowClearDialog(false);
    }
  };

  const handleCleanupOldData = () => {
    try {
      const deletedCount = DataBackupService.cleanupOldData(90);
      toast({
        title: "تم تنظيف البيانات",
        description: `تم حذف ${deletedCount} يوم من البيانات القديمة`,
      });
      setStats(DataBackupService.getBackupStats());
    } catch (error) {
      toast({
        title: "فشل في التنظيف",
        description: "حدث خطأ أثناء تنظيف البيانات القديمة",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الأيام</p>
                <p className="text-2xl font-bold">{stats.totalDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <HardDrive className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">حجم البيانات</p>
                <p className="text-2xl font-bold">{stats.totalSize}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">نطاق التواريخ</p>
                <p className="text-sm font-medium">
                  {stats.dateRange.start ? `${stats.dateRange.start} - ${stats.dateRange.end}` : 'لا توجد بيانات'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">إدارة النسخ الاحتياطية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Export Backup */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">تصدير نسخة احتياطية</h3>
              <p className="text-sm text-muted-foreground">
                تحميل جميع البيانات كملف JSON
              </p>
            </div>
            <Button
              onClick={handleExportBackup}
              disabled={loading || stats.totalDays === 0}
              variant="outline"
            >
              <Download className="w-4 h-4 ml-2" />
              تصدير
            </Button>
          </div>

          {/* Import Backup */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">استيراد نسخة احتياطية</h3>
              <p className="text-sm text-muted-foreground">
                رفع ملف نسخة احتياطية لاستعادة البيانات
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                disabled={loading}
                className="hidden"
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                variant="outline"
              >
                <Upload className="w-4 h-4 ml-2" />
                استيراد
              </Button>
            </div>
          </div>

          {/* Import Result */}
          {importResult && (
            <Alert className={importResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-center gap-2">
                {importResult.success ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                )}
                <AlertDescription>
                  {importResult.message}
                  {importResult.stats && (
                    <div className="mt-2 space-y-1">
                      <p className="text-sm">الأيام المستوردة: {importResult.stats.daysImported}</p>
                      <p className="text-sm">
                        النطاق: {importResult.stats.dateRange.start} - {importResult.stats.dateRange.end}
                      </p>
                    </div>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">إدارة البيانات</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cleanup Old Data */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">تنظيف البيانات القديمة</h3>
              <p className="text-sm text-muted-foreground">
                حذف البيانات الأقدم من 90 يوم
              </p>
            </div>
            <Button
              onClick={handleCleanupOldData}
              disabled={loading}
              variant="outline"
            >
              <Database className="w-4 h-4 ml-2" />
              تنظيف
            </Button>
          </div>

          {/* Clear All Data */}
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h3 className="font-medium text-red-800">حذف جميع البيانات</h3>
              <p className="text-sm text-red-600">
                حذف جميع البيانات المحفوظة - لا يمكن التراجع عن هذا الإجراء
              </p>
            </div>
            <Button
              onClick={() => setShowClearDialog(true)}
              disabled={loading || stats.totalDays === 0}
              variant="destructive"
            >
              <Trash2 className="w-4 h-4 ml-2" />
              حذف الكل
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Clear Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        onConfirm={handleClearAllData}
        itemName="جميع البيانات المحفوظة"
      />

      {/* Info Alert */}
      <Alert>
        <Info className="w-4 h-4" />
        <AlertDescription>
          💡 يتم حفظ البيانات محلياً في متصفحك. تأكد من عمل نسخة احتياطية دورية لتجنب فقدان البيانات.
        </AlertDescription>
      </Alert>
    </div>
  );
};