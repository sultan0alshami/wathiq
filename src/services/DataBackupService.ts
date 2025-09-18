import { DailyData } from '@/lib/mockData';

export interface BackupData {
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
  // Cache for backup statistics to avoid redundant computations
  private static cachedBackupStats: {
    totalDays: number;
    totalSize: string;
    dateRange: { start: string; end: string };
    lastBackup: string | null;
  } | null = null;
  private static lastBackupKeyUpdate: number = Date.now(); // Timestamp of last localStorage update relevant to backup

  // Mark cache as stale
  static invalidateCache() {
    this.cachedBackupStats = null;
    this.lastBackupKeyUpdate = Date.now();
  }

  // Helper to get all stored data and relevant metadata
  private static getAllStoredData(): { data: Record<string, DailyData>; dates: string[] } {
    const data: Record<string, DailyData> = {};
    const dates: string[] = [];

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
    return { data, dates };
  }

  // Create a full backup of all data
  static createBackup(): BackupData {
    const { data, dates } = this.getAllStoredData();

    // Generate metadata
    const sortedDates = dates.sort();
    const metadata = {
      totalDays: dates.length,
      dateRange: {
        start: sortedDates[0] || '',
        end: sortedDates[sortedDates.length - 1] || ''
      },
      sections: Object.keys(data[sortedDates[0]] || {}).filter(key => key !== 'date' && key !== 'customers' && key !== 'suppliers')
    };

    const backup = {
      version: this.BACKUP_VERSION,
      exportDate: new Date().toISOString(),
      data,
      metadata
    };

    // Invalidate cache after creating a backup as the data might have changed
    this.invalidateCache();
    return backup;
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

      // Validate backup format and version
      if (!backup.version || !backup.data || !backup.metadata) {
        throw new Error('تنسيق النسخة الاحتياطية غير صالح: البيانات الأساسية مفقودة');
      }

      if (backup.version !== this.BACKUP_VERSION) {
        console.warn(`Backup version mismatch. Expected ${this.BACKUP_VERSION}, got ${backup.version}. Attempting import with potential compatibility issues.`);
        // TODO: Implement migration strategy for older backup versions if needed
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
      
      // Invalidate cache after importing data
      this.invalidateCache();

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
  static validateDayData(data: any): data is DailyData {
    // Basic structure check
    if (!data || typeof data !== 'object' || !data.date) {
      console.warn('Invalid day data: missing basic structure or date', data);
      return false;
    }

    // Check top-level sections
    const requiredSections = ['finance', 'sales', 'operations', 'marketing', 'customers'];
    for (const section of requiredSections) {
      if (!data[section] || typeof data[section] !== 'object') {
        console.warn(`Invalid day data: missing or malformed section: ${section}`, data);
        return false;
      }
    }

    // Deep validation for each section (example for finance, can be extended)
    if (typeof data.finance.currentLiquidity !== 'number' || !Array.isArray(data.finance.entries)) {
      console.warn('Invalid day data: finance section malformed', data);
      return false;
    }

    if (typeof data.sales.customersContacted !== 'number' || !Array.isArray(data.sales.entries)) {
      console.warn('Invalid day data: sales section malformed', data);
      return false;
    }

    if (typeof data.operations.totalOperations !== 'number' || !Array.isArray(data.operations.entries)) {
      console.warn('Invalid day data: operations section malformed', data);
      return false;
    }

    if (!Array.isArray(data.marketing.tasks) || !Array.isArray(data.marketing.yesterdayDone) || !Array.isArray(data.marketing.plannedTasks)) {
      console.warn('Invalid day data: marketing section malformed', data);
      return false;
    }

    if (!Array.isArray(data.customers)) {
      console.warn('Invalid day data: customers section malformed', data);
      return false;
    }

    // Optional: Add more specific checks for entry arrays if needed, e.g.,
    // data.finance.entries.every(entry => typeof entry.id === 'string' && typeof entry.amount === 'number')
    // This can get verbose, but provides strong guarantees.

    return true;
  }

  // Get backup statistics
  static getBackupStats(): {
    totalDays: number;
    totalSize: string;
    dateRange: { start: string; end: string };
    lastBackup: string | null;
  } {
    // Check if cache is valid and up-to-date
    if (this.cachedBackupStats && this.lastBackupKeyUpdate >= this.getLastLocalStorageModificationTime()) {
      return this.cachedBackupStats;
    }

    const { data, dates } = this.getAllStoredData();
    const sortedDates = dates.sort();

    let totalSizeInBytes = 0;
    Object.values(data).forEach(dayData => {
      totalSizeInBytes += new TextEncoder().encode(JSON.stringify(dayData)).length;
    });

    const sizeInKB = (totalSizeInBytes / 1024).toFixed(2);

    this.cachedBackupStats = {
      totalDays: dates.length,
      totalSize: `${sizeInKB} KB`,
      dateRange: {
        start: sortedDates[0] || '',
        end: sortedDates[sortedDates.length - 1] || ''
      },
      lastBackup: localStorage.getItem('wathiq_last_backup') || null
    };

    return this.cachedBackupStats;
  }

  // Helper to get the last modification time of any relevant localStorage key
  private static getLastLocalStorageModificationTime(): number {
    let lastModified = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.KEY_PREFIX) || key === 'wathiq_last_backup' || key === 'wathiq_last_clear') {
        // This is a simplified approach. A more robust solution might involve
        // storing a timestamp alongside each item or using a dedicated change listener.
        // For now, we assume any read/write of relevant keys could mean a modification.
        // We can't directly get modification time for individual localStorage items.
        // So, we'll just return the time when the cache was last invalidated.
        return this.lastBackupKeyUpdate; 
      }
    }
    return lastModified;
  }

  // Clear all data with confirmation
  static clearAllData(): boolean {
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
      this.invalidateCache(); // Invalidate cache after clearing data
      
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
    
    this.invalidateCache(); // Invalidate cache after cleaning up data
    return deletedCount;
  }

  /**
   * Sets up automatic backups based on a defined interval.
   * This is a client-side, visit-dependent mechanism, meaning it only runs when the application is active in the browser.
   * It will trigger an export if the last backup date exceeds the intervalDays.
   * 
   * @param intervalDays The number of days after which an auto-backup should be triggered. Defaults to 7 days.
   */
  static setupAutoBackup(intervalDays: number = 7): void {
    const lastBackup = localStorage.getItem('wathiq_last_backup');
    const now = new Date();
    
    if (!lastBackup) {
      // First time setup: record current date as last backup date
      localStorage.setItem('wathiq_last_backup', now.toISOString());
      return;
    }
    
    const lastBackupDate = new Date(lastBackup);
    const daysDiff = (now.getTime() - lastBackupDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff >= intervalDays) {
      // Trigger auto backup and update last backup date
      try {
        this.exportBackup();
        localStorage.setItem('wathiq_last_backup', now.toISOString());
        // TODO: Consider adding user notification for successful auto-backup
      } catch (error) {
        console.error('Auto backup failed:', error);
        // TODO: Consider adding user notification for failed auto-backup
      }
    }
  }
}