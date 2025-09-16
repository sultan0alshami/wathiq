import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Download,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { ExportProgress } from '@/services/EnhancedExportService';

interface ExportProgressDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  exports: ExportProgress[];
  onRetry: (exportId: string) => void;
  onDownload: (exportId: string) => void;
}

export const ExportProgressDialog: React.FC<ExportProgressDialogProps> = ({
  open,
  onOpenChange,
  exports,
  onRetry,
  onDownload
}) => {
  const getStatusIcon = (status: ExportProgress['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-wathiq-primary animate-spin" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: ExportProgress['status']) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-success text-success-foreground">مكتمل</Badge>;
      case 'failed':
        return <Badge variant="destructive">فشل</Badge>;
      case 'processing':
        return <Badge className="bg-wathiq-primary text-white">قيد المعالجة</Badge>;
      case 'pending':
        return <Badge variant="secondary">في الانتظار</Badge>;
      default:
        return null;
    }
  };

  const allCompleted = exports.every(exp => exp.status === 'completed');
  const hasFailures = exports.some(exp => exp.status === 'failed');
  const inProgress = exports.some(exp => exp.status === 'processing' || exp.status === 'pending');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            حالة التصدير
          </DialogTitle>
          <DialogDescription>
            تتبع تقدم عمليات التصدير والتحميل
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {exports.map((exportItem) => (
            <div
              key={exportItem.id}
              className="border rounded-lg p-4 space-y-3"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(exportItem.status)}
                  <span className="font-medium text-sm">
                    {exportItem.filename || exportItem.id}
                  </span>
                </div>
                {getStatusBadge(exportItem.status)}
              </div>

              {/* Progress bar */}
              {(exportItem.status === 'processing' || exportItem.status === 'pending') && (
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>التقدم</span>
                    <span>{exportItem.progress}%</span>
                  </div>
                  <Progress 
                    value={exportItem.progress} 
                    className="h-2"
                  />
                </div>
              )}

              {/* Error message */}
              {exportItem.status === 'failed' && exportItem.error && (
                <div className="bg-destructive/10 border border-destructive/20 rounded p-2">
                  <p className="text-xs text-destructive">{exportItem.error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                {exportItem.status === 'failed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onRetry(exportItem.id)}
                    className="text-xs"
                  >
                    <RefreshCw className="w-3 h-3 ml-1" />
                    إعادة المحاولة
                  </Button>
                )}
                
                {exportItem.status === 'completed' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onDownload(exportItem.id)}
                    className="text-xs hover:bg-success/10 hover:text-success hover:border-success"
                  >
                    <Download className="w-3 h-3 ml-1" />
                    تحميل
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="border-t pt-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {allCompleted ? (
                <span className="text-success">تم إكمال جميع العمليات بنجاح</span>
              ) : hasFailures ? (
                <span className="text-destructive">
                  بعض العمليات فشلت - يمكنك إعادة المحاولة
                </span>
              ) : inProgress ? (
                <span className="text-wathiq-primary">جاري المعالجة...</span>
              ) : (
                <span>جاهز للبدء</span>
              )}
            </div>
            
            <div className="flex gap-2">
              {allCompleted && !hasFailures && (
                <Button
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  className="bg-success hover:bg-success/90"
                >
                  <CheckCircle className="w-4 h-4 ml-1" />
                  إغلاق
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};