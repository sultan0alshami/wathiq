import { format, parseISO } from 'date-fns';
import { DailyData } from '@/lib/mockData';
import { DataBackupService, BackupData } from './DataBackupService'; // Import DataBackupService
import { ARABIC_MESSAGES } from '@/lib/arabicMessages';

export interface StorageBackup extends BackupData {}

import { STORAGE_KEYS } from '@/lib/storageKeys';

export class StorageService {
  private static readonly VERSION = '1.0.0';
  private static readonly KEY_PREFIX = STORAGE_KEYS.DATA_PREFIX;
  private static readonly BACKUP_KEY = STORAGE_KEYS.BACKUP_PREFIX;

  // Get all stored dates
  /**
   * Retrieves all stored dates from local storage. It's assumed that `dateStr` (derived from localStorage keys)
   * is always in ISO format, as set by `format(date, 'yyyy-MM-dd')` elsewhere in the application.
   * Any invalid date formats will be logged as warnings.
   */
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
    return DataBackupService.validateDayData(data);
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

  // DEPRECATED: Delegate backup creation to DataBackupService
  static createBackup = DataBackupService.createBackup;

  // DEPRECATED: Delegate backup export to DataBackupService
  static exportBackup = DataBackupService.exportBackup;

  // Restore from backup
  static async restoreFromBackup(file: File): Promise<{ success: boolean; message: string; stats?: any }> {
    try {
      const text = await file.text();
      const backup: BackupData = JSON.parse(text);
      
      // Validate backup structure
      if (!backup.version || !backup.data || !backup.metadata) {
        return { success: false, message: ARABIC_MESSAGES.BACKUP_FILE_INVALID };
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
        ? ARABIC_MESSAGES.IMPORT_SUCCESS_PARTIAL(importedCount, errorCount)
        : ARABIC_MESSAGES.IMPORT_SUCCESS_FULL(importedCount);

      return { 
        success: true, 
        message,
        stats: { imported: importedCount, errors: errorCount }
      };
    } catch (error) {
      let errorMessage = ARABIC_MESSAGES.IMPORT_FAILED_GENERIC;
      if (error instanceof SyntaxError) {
        errorMessage = ARABIC_MESSAGES.IMPORT_FAILED_JSON_INVALID;
      } else if (error instanceof Error) {
        errorMessage = ARABIC_MESSAGES.IMPORT_FAILED_FILE_READ + error.message;
      }
      return { 
        success: false, 
        message: errorMessage
      };
    }
  }

  // Clear all data with confirmation
  static clearAllData(): boolean {
    const confirmed = window.confirm(
      ARABIC_MESSAGES.CONFIRM_DELETE_ALL_DATA
    );
    
    if (confirmed) {
      const keys = Object.keys(localStorage).filter(key => 
        key.startsWith(this.KEY_PREFIX)
      );
      
      keys.forEach(key => localStorage.removeItem(key));
      return true;
    } else {
      return false;
    }
  }

  // DEPRECATED: Delegate cleanup of old data to DataBackupService
  static cleanupOldData = DataBackupService.cleanupOldData;

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