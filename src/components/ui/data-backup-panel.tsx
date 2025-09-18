import React, { useState, useRef, useEffect } from 'react';
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
import { ARABIC_DATA_BACKUP_MESSAGES } from '@/lib/arabicDataBackupMessages';

type ImportBackupResult = {
  success: boolean;
  message: string;
  stats?: {
    daysImported: number;
    sectionsImported: number;
    dateRange: { start: string; end: string };
  };
};

export const DataBackupPanel: React.FC = () => {
  const [stats, setStats] = useState(DataBackupService.getBackupStats());
  const [loading, setLoading] = useState(false);
  const [showClearDialog, setShowClearDialog] = useState(false);
  const [importResult, setImportResult] = useState<ImportBackupResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [daysToKeep, setDaysToKeep] = useState(90); // New state for configurable days to keep

  // Fetch initial stats after component mounts
  useEffect(() => {
    setStats(DataBackupService.getBackupStats());
  }, []);

  const handleExportBackup = async () => {
    try {
      setLoading(true);
      DataBackupService.exportBackup();
      toast({
        title: ARABIC_DATA_BACKUP_MESSAGES.EXPORT_SUCCESS_TITLE,
        description: ARABIC_DATA_BACKUP_MESSAGES.EXPORT_SUCCESS_DESCRIPTION,
      });
      
      // Update stats
      setStats(DataBackupService.getBackupStats());
    } catch (error) {
      toast({
        title: ARABIC_DATA_BACKUP_MESSAGES.EXPORT_FAILURE_TITLE,
        description: ARABIC_DATA_BACKUP_MESSAGES.EXPORT_FAILURE_DESCRIPTION,
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
          title: ARABIC_DATA_BACKUP_MESSAGES.IMPORT_SUCCESS_TITLE,
          description: result.message,
        });
        setStats(DataBackupService.getBackupStats());
      } else {
        toast({
          title: ARABIC_DATA_BACKUP_MESSAGES.IMPORT_FAILURE_TITLE,
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: ARABIC_DATA_BACKUP_MESSAGES.IMPORT_FAILURE_TITLE,
        description: ARABIC_DATA_BACKUP_MESSAGES.IMPORT_FAILURE_DESCRIPTION_GENERIC,
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
      const cleared = DataBackupService.clearAllData();
      
      if (cleared) {
        toast({
          title: ARABIC_DATA_BACKUP_MESSAGES.DELETE_SUCCESS_TITLE,
          description: ARABIC_DATA_BACKUP_MESSAGES.DELETE_SUCCESS_DESCRIPTION,
        });
        setStats(DataBackupService.getBackupStats());
        setImportResult(null);
      }
    } catch (error) {
      toast({
        title: ARABIC_DATA_BACKUP_MESSAGES.DELETE_FAILURE_TITLE,
        description: ARABIC_DATA_BACKUP_MESSAGES.DELETE_FAILURE_DESCRIPTION,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setShowClearDialog(false);
    }
  };

  const handleCleanupOldData = () => {
    try {
      const deletedCount = DataBackupService.cleanupOldData(daysToKeep);
      toast({
        title: ARABIC_DATA_BACKUP_MESSAGES.CLEANUP_SUCCESS_TITLE,
        description: ARABIC_DATA_BACKUP_MESSAGES.CLEANUP_SUCCESS_DESCRIPTION(deletedCount),
      });
      setStats(DataBackupService.getBackupStats());
    } catch (error) {
      toast({
        title: ARABIC_DATA_BACKUP_MESSAGES.CLEANUP_FAILURE_TITLE,
        description: ARABIC_DATA_BACKUP_MESSAGES.CLEANUP_FAILURE_DESCRIPTION,
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
                <p className="text-sm text-muted-foreground">{ARABIC_DATA_BACKUP_MESSAGES.TOTAL_DAYS}</p>
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
                <p className="text-sm text-muted-foreground">{ARABIC_DATA_BACKUP_MESSAGES.DATA_SIZE}</p>
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
                <p className="text-sm text-muted-foreground">{ARABIC_DATA_BACKUP_MESSAGES.DATE_RANGE}</p>
                <p className="text-sm font-medium">
                  {stats.dateRange.start ? `${stats.dateRange.start} - ${stats.dateRange.end}` : ARABIC_DATA_BACKUP_MESSAGES.NO_DATA}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">{ARABIC_DATA_BACKUP_MESSAGES.MANAGE_BACKUPS_TITLE}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Export Backup */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">{ARABIC_DATA_BACKUP_MESSAGES.EXPORT_BACKUP_HEADING}</h3>
              <p className="text-sm text-muted-foreground">
                {ARABIC_DATA_BACKUP_MESSAGES.EXPORT_BACKUP_DESCRIPTION}
              </p>
            </div>
            <Button
              onClick={handleExportBackup}
              disabled={loading || stats.totalDays === 0}
              variant="outline"
            >
              <Download className="w-4 h-4 ml-2" />
              {ARABIC_DATA_BACKUP_MESSAGES.EXPORT_BUTTON}
            </Button>
          </div>

          {/* Import Backup */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <h3 className="font-medium">{ARABIC_DATA_BACKUP_MESSAGES.IMPORT_BACKUP_HEADING}</h3>
              <p className="text-sm text-muted-foreground" id="import-backup-description">
                {ARABIC_DATA_BACKUP_MESSAGES.IMPORT_BACKUP_DESCRIPTION}
              </p>
            </div>
            <div className="flex gap-2">
              <Input
                id="file-upload-input"
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                disabled={loading}
                className="hidden"
                tabIndex={-1} // Prevent direct focus on hidden input
                aria-hidden="true"
              />
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
                variant="outline"
                aria-label={ARABIC_DATA_BACKUP_MESSAGES.IMPORT_ARIA_LABEL}
                aria-describedby="import-backup-description"
              >
                <Upload className="w-4 h-4 ml-2" />
                {ARABIC_DATA_BACKUP_MESSAGES.IMPORT_BUTTON}
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
                      <p className="text-sm">{ARABIC_DATA_BACKUP_MESSAGES.IMPORT_STATS_DAYS_IMPORTED} {importResult.stats.daysImported}</p>
                      <p className="text-sm">
                        {ARABIC_DATA_BACKUP_MESSAGES.IMPORT_STATS_RANGE} {importResult.stats.dateRange.start} - {importResult.stats.dateRange.end}
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
          <CardTitle className="text-primary">{ARABIC_DATA_BACKUP_MESSAGES.MANAGE_DATA_TITLE}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Cleanup Old Data */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border rounded-lg">
            <div className="mb-4 sm:mb-0">
              <h3 className="font-medium">{ARABIC_DATA_BACKUP_MESSAGES.CLEANUP_OLD_DATA_HEADING}</h3>
              <p className="text-sm text-muted-foreground">
                {ARABIC_DATA_BACKUP_MESSAGES.CLEANUP_OLD_DATA_DESCRIPTION}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                value={daysToKeep}
                onChange={(e) => setDaysToKeep(Number(e.target.value))}
                min="1"
                className="w-24 text-center"
                disabled={loading}
                aria-label={ARABIC_DATA_BACKUP_MESSAGES.DAYS_LABEL}
              />
              <Label htmlFor="days-to-keep" className="sr-only">{ARABIC_DATA_BACKUP_MESSAGES.DAYS_LABEL}</Label>
              <span className="text-sm text-muted-foreground">{ARABIC_DATA_BACKUP_MESSAGES.DAYS_LABEL}</span>
              <Button
                onClick={handleCleanupOldData}
                disabled={loading || daysToKeep < 1}
                variant="outline"
              >
                <Database className="w-4 h-4 ml-2" />
                {ARABIC_DATA_BACKUP_MESSAGES.CLEANUP_BUTTON}
              </Button>
            </div>
          </div>

          {/* Clear All Data */}
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg bg-red-50">
            <div>
              <h3 className="font-medium text-red-800">{ARABIC_DATA_BACKUP_MESSAGES.DELETE_ALL_DATA_HEADING}</h3>
              <p className="text-sm text-red-600">
                {ARABIC_DATA_BACKUP_MESSAGES.DELETE_ALL_DATA_DESCRIPTION}
              </p>
            </div>
            <Button
              onClick={() => setShowClearDialog(true)}
              disabled={loading || stats.totalDays === 0}
              variant="destructive"
            >
              <Trash2 className="w-4 h-4 ml-2" />
              {ARABIC_DATA_BACKUP_MESSAGES.DELETE_ALL_BUTTON}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Clear Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={showClearDialog}
        onOpenChange={setShowClearDialog}
        onConfirm={handleClearAllData}
        itemName={ARABIC_DATA_BACKUP_MESSAGES.CONFIRM_DELETE_ALL_DATA}
      />

      {/* Info Alert */}
      <Alert>
        <Info className="w-4 h-4" />
        <AlertDescription>
          {ARABIC_DATA_BACKUP_MESSAGES.INFO_ALERT_MESSAGE}
        </AlertDescription>
      </Alert>
    </div>
  );
};