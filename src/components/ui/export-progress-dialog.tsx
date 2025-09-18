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
import { ARABIC_EXPORT_PROGRESS_DIALOG_MESSAGES } from '@/lib/arabicExportProgressDialogMessages';

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
        return <Badge className="bg-success text-success-foreground">{ARABIC_EXPORT_PROGRESS_DIALOG_MESSAGES.STATUS_COMPLETED}</Badge>;
      case 'failed':
        return <Badge variant="destructive">{ARABIC_EXPORT_PROGRESS_DIALOG_MESSAGES.STATUS_FAILED}</Badge>;
      case 'processing':
        return <Badge className="bg-wathiq-primary text-white">{ARABIC_EXPORT_PROGRESS_DIALOG_MESSAGES.STATUS_PROCESSING}</Badge>;
      case 'pending':
        return <Badge variant="secondary">{ARABIC_EXPORT_PROGRESS_DIALOG_MESSAGES.STATUS_PENDING}</Badge>;
      default:
        return null;
    }
  };

  const allCompleted = exports.every(exp => exp.status === 'completed');
  const hasFailures = exports.some(exp => exp.status === 'failed');
  const inProgress = exports.some(exp => exp.status === 'processing' || exp.status === 'pending');
  const failedCount = exports.filter(exp => exp.status === 'failed').length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            {ARABIC_EXPORT_PROGRESS_DIALOG_MESSAGES.DIALOG_TITLE}
          </DialogTitle>
          <DialogDescription>
            {ARABIC_EXPORT_PROGRESS_DIALOG_MESSAGES.DIALOG_DESCRIPTION}
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
                    <span>{ARABIC_EXPORT_PROGRESS_DIALOG_MESSAGES.PROGRESS_LABEL}</span>
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
                    {ARABIC_EXPORT_PROGRESS_DIALOG_MESSAGES.RETRY_BUTTON}
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
                    {ARABIC_EXPORT_PROGRESS_DIALOG_MESSAGES.DOWNLOAD_BUTTON}
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
                <span className="text-success">{ARABIC_EXPORT_PROGRESS_DIALOG_MESSAGES.SUMMARY_ALL_COMPLETED}</span>
              ) : hasFailures ? (
                <span className="text-destructive">
                  {ARABIC_EXPORT_PROGRESS_DIALOG_MESSAGES.SUMMARY_HAS_FAILURES(failedCount)}
                </span>
              ) : inProgress ? (
                <span className="text-wathiq-primary">{ARABIC_EXPORT_PROGRESS_DIALOG_MESSAGES.SUMMARY_IN_PROGRESS}</span>
              ) : (
                <span>{ARABIC_EXPORT_PROGRESS_DIALOG_MESSAGES.SUMMARY_READY_TO_START}</span>
              )}
            </div>
            
            <div className="flex gap-2">
              {/* Always show a close button */}
              <Button
                size="sm"
                onClick={() => onOpenChange(false)}
                variant={allCompleted && !hasFailures ? "default" : "secondary"} // Different variant if not all completed successfully
                className={allCompleted && !hasFailures ? "bg-success hover:bg-success/90" : ""}
              >
                <CheckCircle className="w-4 h-4 ml-1" />
                {ARABIC_EXPORT_PROGRESS_DIALOG_MESSAGES.CLOSE_BUTTON}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};