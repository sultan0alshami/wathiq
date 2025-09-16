import { format, parseISO } from 'date-fns';
import { DailyData } from '@/lib/mockData';

export interface StorageBackup {
  version: string;
  exportDate: string;
  data: Record<string, DailyData>;
  metadata: {
    totalDays: number;
    dateRange: {
      start: string;
      end: string;
    };
  };
}

export class StorageService {
  private static readonly VERSION = '1.0.0';
  private static readonly KEY_PREFIX = 'wathiq_data_';
  private static readonly BACKUP_KEY = 'wathiq_backup_';

  // Get all stored dates
  static getStoredDates(): Date[] {
    const dates: Date[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.KEY_PREFIX)) {
        const dateStr = key.replace(this.KEY_PREFIX, '');
        try {
          const date = parseISO(dateStr);
          dates.push(date);
        } catch (error) {
          console.warn('Invalid date format in localStorage key:', key);
        }
      }
    }
    return dates.sort((a, b) => a.getTime() - b.getTime());
  }

  // Validate data structure
  static validateData(data: any): data is DailyData {
    if (!data || typeof data !== 'object') return false;
    if (!data.date || typeof data.date !== 'string') return false;
    if (!data.finance || typeof data.finance !== 'object') return false;
    if (!data.sales || typeof data.sales !== 'object') return false;
    if (!data.operations || typeof data.operations !== 'object') return false;
    if (!data.marketing || typeof data.marketing !== 'object') return false;
    if (!Array.isArray(data.customers)) return false;
    
    return true;
  }

  // Get storage statistics
  static getStorageStats() {
    const dates = this.getStoredDates();
    const totalDays = dates.length;
    let totalSize = 0;
    
    dates.forEach(date => {
      const key = `${this.KEY_PREFIX}${format(date, 'yyyy-MM-dd')}`;
      const data = localStorage.getItem(key);
      if (data) {
        totalSize += new Blob([data]).size;
      }
    });

    return {
      totalDays,
      totalSize,
      dateRange: dates.length > 0 ? {
        start: dates[0],
        end: dates[dates.length - 1]
      } : null,
      sizeMB: (totalSize / (1024 * 1024)).toFixed(2)
    };
  }

  // Create backup of all data
  static createBackup(): StorageBackup {
    const dates = this.getStoredDates();
    const data: Record<string, DailyData> = {};
    
    dates.forEach(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const key = `${this.KEY_PREFIX}${dateStr}`;
      const stored = localStorage.getItem(key);
      
      if (stored) {
        try {
          const parsedData = JSON.parse(stored);
          if (this.validateData(parsedData)) {
            data[dateStr] = parsedData;
          }
        } catch (error) {
          console.warn('Error parsing data for date:', dateStr, error);
        }
      }
    });

    const backup: StorageBackup = {
      version: this.VERSION,
      exportDate: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
      data,
      metadata: {
        totalDays: Object.keys(data).length,
        dateRange: {
          start: dates.length > 0 ? format(dates[0], 'yyyy-MM-dd') : '',
          end: dates.length > 0 ? format(dates[dates.length - 1], 'yyyy-MM-dd') : ''
        }
      }
    };

    return backup;
  }

  // Export backup to file
  static exportBackup() {
    const backup = this.createBackup();
    const blob = new Blob([JSON.stringify(backup, null, 2)], { 
      type: 'application/json;charset=utf-8;' 
    });
    
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `wathiq-backup-${format(new Date(), 'yyyy-MM-dd')}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Restore from backup
  static async restoreFromBackup(file: File): Promise<{ success: boolean; message: string; stats?: any }> {
    try {
      const text = await file.text();
      const backup: StorageBackup = JSON.parse(text);
      
      // Validate backup structure
      if (!backup.version || !backup.data || !backup.metadata) {
        return { success: false, message: 'ملف النسخة الاحتياطية غير صالح' };
      }

      let importedCount = 0;
      let errorCount = 0;

      // Import data
      Object.entries(backup.data).forEach(([dateStr, data]) => {
        if (this.validateData(data)) {
          const key = `${this.KEY_PREFIX}${dateStr}`;
          try {
            localStorage.setItem(key, JSON.stringify(data));
            importedCount++;
          } catch (error) {
            console.error('Error storing data for date:', dateStr, error);
            errorCount++;
          }
        } else {
          console.warn('Invalid data structure for date:', dateStr);
          errorCount++;
        }
      });

      const message = errorCount > 0 
        ? `تم استيراد ${importedCount} يوم بنجاح، فشل في ${errorCount} يوم`
        : `تم استيراد ${importedCount} يوم بنجاح`;

      return { 
        success: true, 
        message,
        stats: { imported: importedCount, errors: errorCount }
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'خطأ في قراءة ملف النسخة الاحتياطية: ' + (error as Error).message 
      };
    }
  }

  // Clear all data with confirmation
  static clearAllData(): Promise<boolean> {
    return new Promise((resolve) => {
      const confirmed = window.confirm(
        'هل أنت متأكد من حذف جميع البيانات؟ هذا الإجراء لا يمكن التراجع عنه.'
      );
      
      if (confirmed) {
        const keys = Object.keys(localStorage).filter(key => 
          key.startsWith(this.KEY_PREFIX)
        );
        
        keys.forEach(key => localStorage.removeItem(key));
        resolve(true);
      } else {
        resolve(false);
      }
    });
  }

  // Cleanup old data (older than specified days)
  static cleanupOldData(daysToKeep: number = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const dates = this.getStoredDates();
    let removedCount = 0;
    
    dates.forEach(date => {
      if (date < cutoffDate) {
        const key = `${this.KEY_PREFIX}${format(date, 'yyyy-MM-dd')}`;
        localStorage.removeItem(key);
        removedCount++;
      }
    });
    
    return { removedCount, cutoffDate };
  }

  // Get data size for a specific date
  static getDataSize(date: Date): number {
    const key = `${this.KEY_PREFIX}${format(date, 'yyyy-MM-dd')}`;
    const data = localStorage.getItem(key);
    return data ? new Blob([data]).size : 0;
  }

  // Check storage quota usage
  static async getStorageQuota() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          usage: estimate.usage || 0,
          quota: estimate.quota || 0,
          usagePercentage: estimate.quota ? ((estimate.usage || 0) / estimate.quota * 100) : 0
        };
      } catch (error) {
        console.warn('Error getting storage estimate:', error);
      }
    }
    return null;
  }
}