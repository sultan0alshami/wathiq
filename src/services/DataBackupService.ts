import { DailyData } from '@/lib/mockData';

interface BackupData {
  version: string;
  exportDate: string;
  data: Record<string, DailyData>;
  metadata: {
    totalDays: number;
    dateRange: {
      start: string;
      end: string;
    };
    sections: string[];
  };
}

export class DataBackupService {
  private static readonly BACKUP_VERSION = '1.0.0';
  private static readonly KEY_PREFIX = 'wathiq_daily_';

  // Create a full backup of all data
  static createBackup(): BackupData {
    const data: Record<string, DailyData> = {};
    const dates: string[] = [];
    
    // Collect all stored data
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.KEY_PREFIX)) {
        const dateStr = key.replace(this.KEY_PREFIX, '');
        const storedData = localStorage.getItem(key);
        if (storedData) {
          try {
            data[dateStr] = JSON.parse(storedData);
            dates.push(dateStr);
          } catch (error) {
            console.warn(`Failed to parse data for date ${dateStr}:`, error);
          }
        }
      }
    }

    // Generate metadata
    const sortedDates = dates.sort();
    const metadata = {
      totalDays: dates.length,
      dateRange: {
        start: sortedDates[0] || '',
        end: sortedDates[sortedDates.length - 1] || ''
      },
      sections: ['finance', 'sales', 'operations', 'marketing']
    };

    return {
      version: this.BACKUP_VERSION,
      exportDate: new Date().toISOString(),
      data,
      metadata
    };
  }

  // Export backup as downloadable file
  static exportBackup(): void {
    try {
      const backup = this.createBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `wathiq-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export backup:', error);
      throw new Error('فشل في تصدير النسخة الاحتياطية');
    }
  }

  // Import backup from file
  static async importBackup(file: File): Promise<{
    success: boolean;
    message: string;
    stats?: {
      daysImported: number;
      sectionsImported: number;
      dateRange: { start: string; end: string };
    };
  }> {
    try {
      const text = await file.text();
      const backup: BackupData = JSON.parse(text);

      // Validate backup format
      if (!backup.version || !backup.data || !backup.metadata) {
        throw new Error('تنسيق النسخة الاحتياطية غير صالح');
      }

      // Import data
      let importedDays = 0;
      const importedDates: string[] = [];

      Object.entries(backup.data).forEach(([dateStr, dayData]) => {
        try {
          // Validate data structure
          if (this.validateDayData(dayData)) {
            const key = this.KEY_PREFIX + dateStr;
            localStorage.setItem(key, JSON.stringify(dayData));
            importedDays++;
            importedDates.push(dateStr);
          }
        } catch (error) {
          console.warn(`Failed to import data for date ${dateStr}:`, error);
        }
      });

      const sortedDates = importedDates.sort();
      
      return {
        success: true,
        message: `تم استيراد ${importedDays} يوم بنجاح`,
        stats: {
          daysImported: importedDays,
          sectionsImported: backup.metadata.sections.length,
          dateRange: {
            start: sortedDates[0] || '',
            end: sortedDates[sortedDates.length - 1] || ''
          }
        }
      };
    } catch (error) {
      console.error('Failed to import backup:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'فشل في استيراد النسخة الاحتياطية'
      };
    }
  }

  // Validate day data structure
  private static validateDayData(data: any): data is DailyData {
    return (
      data &&
      typeof data === 'object' &&
      data.finance &&
      data.sales &&
      data.operations &&
      data.marketing &&
      typeof data.finance.currentLiquidity === 'number' &&
      Array.isArray(data.finance.entries) &&
      Array.isArray(data.sales.meetings) &&
      Array.isArray(data.operations.operations) &&
      Array.isArray(data.marketing.tasks)
    );
  }

  // Get backup statistics
  static getBackupStats(): {
    totalDays: number;
    totalSize: string;
    dateRange: { start: string; end: string };
    lastBackup: string | null;
  } {
    const backup = this.createBackup();
    const sizeInBytes = JSON.stringify(backup).length;
    const sizeInKB = (sizeInBytes / 1024).toFixed(2);
    
    return {
      totalDays: backup.metadata.totalDays,
      totalSize: `${sizeInKB} KB`,
      dateRange: backup.metadata.dateRange,
      lastBackup: localStorage.getItem('wathiq_last_backup') || null
    };
  }

  // Clear all data with confirmation
  static async clearAllData(): Promise<boolean> {
    const confirmed = window.confirm(
      'هل أنت متأكد من حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء.'
    );
    
    if (!confirmed) return false;

    try {
      const keysToDelete: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.KEY_PREFIX)) {
          keysToDelete.push(key);
        }
      }
      
      keysToDelete.forEach(key => localStorage.removeItem(key));
      
      // Record the clearing action
      localStorage.setItem('wathiq_last_clear', new Date().toISOString());
      
      return true;
    } catch (error) {
      console.error('Failed to clear data:', error);
      return false;
    }
  }

  // Cleanup old data (older than specified days)
  static cleanupOldData(daysToKeep: number = 90): number {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    let deletedCount = 0;
    const keysToDelete: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.KEY_PREFIX)) {
        const dateStr = key.replace(this.KEY_PREFIX, '');
        const date = new Date(dateStr);
        
        if (date < cutoffDate) {
          keysToDelete.push(key);
        }
      }
    }
    
    keysToDelete.forEach(key => {
      localStorage.removeItem(key);
      deletedCount++;
    });
    
    return deletedCount;
  }

  // Schedule automatic backups (browser-based)
  static setupAutoBackup(intervalDays: number = 7): void {
    const lastBackup = localStorage.getItem('wathiq_last_backup');
    const now = new Date();
    
    if (!lastBackup) {
      // First time setup
      localStorage.setItem('wathiq_last_backup', now.toISOString());
      return;
    }
    
    const lastBackupDate = new Date(lastBackup);
    const daysDiff = (now.getTime() - lastBackupDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff >= intervalDays) {
      // Create automatic backup
      try {
        this.exportBackup();
        localStorage.setItem('wathiq_last_backup', now.toISOString());
      } catch (error) {
        console.error('Auto backup failed:', error);
      }
    }
  }
}