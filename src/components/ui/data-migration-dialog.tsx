import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { DataMigrationService, MigrationResult, MigrationProgress } from '@/services/DataMigrationService';
import { Database, Upload, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

interface DataMigrationDialogProps {
  children: React.ReactNode;
  onMigrationComplete?: (result: MigrationResult) => void;
}

export const DataMigrationDialog: React.FC<DataMigrationDialogProps> = ({ 
  children, 
  onMigrationComplete 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [progress, setProgress] = useState<MigrationProgress | null>(null);
  const [result, setResult] = useState<MigrationResult | null>(null);
  const [migrationService] = useState(() => new DataMigrationService(setProgress));

  const handleStartMigration = async () => {
    try {
      setIsMigrating(true);
      setProgress(null);
      setResult(null);

      const migrationResult = await migrationService.migrateAllData();
      setResult(migrationResult);

      if (migrationResult.success) {
        // Clear localStorage data after successful migration
        await migrationService.clearLocalStorageData();
        onMigrationComplete?.(migrationResult);
      }
    } catch (error) {
      setResult({
        success: false,
        message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        migratedRecords: 0,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleClose = () => {
    if (!isMigrating) {
      setIsOpen(false);
      setProgress(null);
      setResult(null);
    }
  };

  const getStatusIcon = () => {
    if (isMigrating) {
      return <Upload className="w-5 h-5 animate-spin" />;
    }
    if (result?.success) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (result && !result.success) {
      return <XCircle className="w-5 h-5 text-red-500" />;
    }
    return <Database className="w-5 h-5" />;
  };

  const getStatusColor = () => {
    if (isMigrating) return 'bg-blue-500';
    if (result?.success) return 'bg-green-500';
    if (result && !result.success) return 'bg-red-500';
    return 'bg-gray-500';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-card/90 backdrop-blur-md supports-[backdrop-filter]:bg-card/70 supports-[backdrop-filter]:backdrop-blur-md border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {getStatusIcon()}
            <span>ترحيل البيانات إلى قاعدة البيانات</span>
          </DialogTitle>
          <DialogDescription>
            قم بترحيل جميع البيانات المحفوظة محلياً إلى قاعدة البيانات السحابية للحفظ الدائم
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Migration Info */}
          <div className="bg-muted/50 rounded-lg p-4">
            <h4 className="font-medium mb-2">معلومات الترحيل:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• سيتم ترحيل جميع البيانات من التخزين المحلي إلى Supabase</li>
              <li>• البيانات ستكون محمية بسياسات الأمان على مستوى الصفوف (RLS)</li>
              <li>• سيتم حذف البيانات المحلية بعد الترحيل الناجح</li>
              <li>• يمكن الوصول للبيانات من أي جهاز بعد تسجيل الدخول</li>
            </ul>
          </div>

          {/* Progress */}
          {progress && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{progress.currentStep}</span>
                <Badge variant="outline">{progress.progress}%</Badge>
              </div>
              <Progress value={progress.progress} className="w-full" />
              <div className="text-xs text-muted-foreground text-center">
                الخطوة {progress.currentRecords} من {progress.totalRecords}
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <Alert className={result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-2">
                  <div className="font-medium">
                    {result.success ? 'تم الترحيل بنجاح!' : 'فشل الترحيل'}
                  </div>
                  <div className="text-sm">
                    {result.message}
                  </div>
                  {result.migratedRecords > 0 && (
                    <div className="text-sm">
                      عدد السجلات المرحلة: <strong>{result.migratedRecords}</strong>
                    </div>
                  )}
                  {result.errors.length > 0 && (
                    <div className="text-sm">
                      <div className="font-medium text-red-600 mb-1">الأخطاء:</div>
                      <ul className="list-disc list-inside space-y-1">
                        {result.errors.map((error, index) => (
                          <li key={index} className="text-red-600">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={isMigrating}
            >
              إغلاق
            </Button>
            {!result && (
              <Button
                onClick={handleStartMigration}
                disabled={isMigrating}
                className="min-w-[120px]"
              >
                {isMigrating ? (
                  <>
                    <Upload className="w-4 h-4 mr-2 animate-spin" />
                    جاري الترحيل...
                  </>
                ) : (
                  <>
                    <Database className="w-4 h-4 mr-2" />
                    بدء الترحيل
                  </>
                )}
              </Button>
            )}
            {result?.success && (
              <Button
                onClick={handleClose}
                className="min-w-[120px]"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                تم بنجاح
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
