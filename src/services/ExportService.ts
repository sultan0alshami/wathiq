import { format } from 'date-fns';
import { DailyData, FinanceEntry, SalesEntry, OperationEntry, MarketingTask, Customer, getDataForDate } from '@/lib/mockData';
import { formatCurrency, formatNumber } from '@/lib/numberUtils';
import { ArabicPDFService } from './ArabicPDFService'; // Import the ArabicPDFService
import { EnhancedExportService } from './EnhancedExportService';
export type { ExportProgress, BulkExportOptions } from './EnhancedExportService';
import { ARABIC_NOTES } from '@/lib/arabicConstants';

export class ExportService {
  // Convert data to CSV format
  static toCSV(data: any[], headers: string[]): string {
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value || '';
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  }

  // Download CSV file
  static downloadCSV(filename: string, data: string) {
    const blob = new Blob(['\uFEFF' + data], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Export Finance data to CSV
  static exportFinanceCSV(date: Date) {
    const dailyData = getDataForDate(date);
    const headers = ['type', 'title', 'amount', 'category', 'description', 'date'];
    
    const csvData = dailyData.finance.entries.map(entry => ({
      type: entry.type === 'income' ? 'إيراد' : entry.type === 'expense' ? 'مصروف' : 'إيداع',
      title: entry.title,
      amount: formatNumber(entry.amount, 2),
      category: entry.category,
      description: entry.description || '',
      date: format(entry.date, 'yyyy-MM-dd')
    }));

    const csv = this.toCSV(csvData, headers);
    const filename = `finance-${format(date, 'yyyy-MM-dd')}.csv`;
    this.downloadCSV(filename, csv);
  }

  // Export Sales data to CSV
  static exportSalesCSV(date: Date) {
    const dailyData = getDataForDate(date);
    const csvData = dailyData.sales.entries.map(entry => ({
      customerName: entry.customerName,
      contactNumber: entry.contactNumber,
      meetingDate: format(entry.meetingDate, 'yyyy-MM-dd'),
      meetingTime: entry.meetingTime,
      outcome: entry.outcome === 'positive' ? 'إيجابي' : entry.outcome === 'negative' ? 'سلبي' : 'في الانتظار',
      notes: entry.notes
    }));

    const headers = ['customerName', 'contactNumber', 'meetingDate', 'meetingTime', 'outcome', 'notes'];
    const csv = this.toCSV(csvData, headers);
    const filename = `sales-${format(date, 'yyyy-MM-dd')}.csv`;
    this.downloadCSV(filename, csv);
  }

  // Export Operations data to CSV
  static exportOperationsCSV(date: Date) {
    const dailyData = getDataForDate(date);
    const csvData = dailyData.operations.entries.map(entry => ({
      task: entry.task,
      status: entry.status === 'completed' ? 'مكتمل' : entry.status === 'in-progress' ? 'قيد التنفيذ' : 'في الانتظار',
      owner: entry.owner,
      priority: entry.priority === 'high' ? 'عالية' : entry.priority === 'medium' ? 'متوسطة' : 'منخفضة',
      notes: entry.notes
    }));

    const headers = ['task', 'status', 'owner', 'priority', 'notes'];
    const csv = this.toCSV(csvData, headers);
    const filename = `operations-${format(date, 'yyyy-MM-dd')}.csv`;
    this.downloadCSV(filename, csv);
  }

  // Export Marketing data to CSV
  static exportMarketingCSV(date: Date) {
    const dailyData = getDataForDate(date);
    const csvData = dailyData.marketing.tasks.map(task => ({
      title: task.title,
      status: task.status === 'completed' ? 'مكتمل' : task.status === 'in-progress' ? 'قيد التنفيذ' : 'مخطط',
      assignee: task.assignee,
      dueDate: format(task.dueDate, 'yyyy-MM-dd'),
      priority: task.priority === 'high' ? 'عالية' : task.priority === 'medium' ? 'متوسطة' : 'منخفضة',
      description: task.description
    }));

    const headers = ['title', 'status', 'assignee', 'dueDate', 'priority', 'description'];
    const csv = this.toCSV(csvData, headers);
    const filename = `marketing-${format(date, 'yyyy-MM-dd')}.csv`;
    this.downloadCSV(filename, csv);
  }

  // Export Customers data to CSV
  static exportCustomersCSV(date: Date) {
    const dailyData = getDataForDate(date);
    const csvData = dailyData.customers.map(customer => ({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      arrivalDate: format(customer.arrivalDate, 'yyyy-MM-dd'),
      contacted: customer.contacted ? 'نعم' : 'لا',
      cameBack: customer.cameBack ? 'نعم' : 'لا',
      source: customer.source || '',
      notes: customer.notes
    }));

    const headers = ['name', 'phone', 'email', 'arrivalDate', 'contacted', 'cameBack', 'source', 'notes'];
    const csv = this.toCSV(csvData, headers);
    const filename = `customers-${format(date, 'yyyy-MM-dd')}.csv`;
    this.downloadCSV(filename, csv);
  }

  // Generate comprehensive PDF report
  static async generatePDFReport(date: Date) {
    try {
      const pdfBlob = await ArabicPDFService.createEnhancedArabicPDF(getDataForDate(date), date);
      const filename = `wathiq-report-${format(date, 'yyyy-MM-dd')}.pdf`;
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to generate PDF report:', error);
      throw new Error('فشل في إنشاء تقرير PDF');
    }
  }

  // Export merged daily report (CSV format)
  static exportMergedDailyCSV(date: Date) {
    const data = getDataForDate(date);
    const mergedData = [
      // Finance summary
      { section: 'المالية', field: 'السيولة الحالية', value: formatCurrency(data.finance.currentLiquidity), notes: '' },
      { section: 'المالية', field: 'عدد العمليات المالية', value: data.finance.entries.length, notes: ARABIC_NOTES.OPERATION },
      
      // Sales summary
      { section: 'المبيعات', field: 'العملاء المتصل بهم', value: data.sales.customersContacted, notes: ARABIC_NOTES.CUSTOMER },
      { section: 'المبيعات', field: 'عدد الاجتماعات', value: data.sales.entries.length, notes: ARABIC_NOTES.MEETING },
      
      // Operations summary
      { section: 'العمليات', field: 'إجمالي العمليات', value: data.operations.totalOperations, notes: ARABIC_NOTES.OPERATION },
      { section: 'العمليات', field: 'العمليات المتوقعة غداً', value: data.operations.expectedNextDay, notes: ARABIC_NOTES.OPERATION },
      
      // Marketing summary
      { section: 'التسويق', field: 'عدد المهام', value: data.marketing.tasks.length, notes: ARABIC_NOTES.TASK },
      { section: 'التسويق', field: 'المهام المكتملة', value: data.marketing.tasks.filter(t => t.status === 'completed').length, notes: ARABIC_NOTES.TASK },
      
      // Customers summary
      { section: 'العملاء', field: 'إجمالي العملاء', value: data.customers.length, notes: ARABIC_NOTES.CUSTOMER },
      { section: 'العملاء', field: 'العملاء المتصل بهم', value: data.customers.filter(c => c.contacted).length, notes: ARABIC_NOTES.CUSTOMER }
    ];

    const csv = this.toCSV(mergedData, ['section', 'field', 'value', 'notes']);
    const filename = `merged-daily-report-${format(date, 'yyyy-MM-dd')}.csv`;
    this.downloadCSV(filename, csv);
  }

  // --- Consolidated enhanced APIs ---
  static onProgress(exportId: string, callback: (progress: import('./EnhancedExportService').ExportProgress) => void) {
    EnhancedExportService.onProgress(exportId, callback);
  }

  static cleanupProgress(exportId: string) {
    EnhancedExportService.cleanupProgress(exportId);
  }

  static async generateArabicPDF(date: Date, exportId: string): Promise<void> {
    return EnhancedExportService.generateArabicPDF(date, exportId);
  }

  static async bulkExport(options: import('./EnhancedExportService').BulkExportOptions): Promise<string> {
    return EnhancedExportService.bulkExport(options);
  }
}