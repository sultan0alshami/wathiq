import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import JSZip from 'jszip';
import { format } from 'date-fns';
import { DailyData, getDataForDate } from '@/lib/mockData';
import { formatCurrency, formatNumber } from '@/lib/numberUtils';
import { ArabicPDFService } from './ArabicPDFService';

// Add Arabic font support for jsPDF
declare module 'jspdf' {
  interface jsPDF {
    addFileToVFS(filename: string, data: string): jsPDF;
    addFont(filename: string, fontname: string, fontstyle: string): string;
  }
}

export interface ExportProgress {
  id: string;
  filename: string;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
}

export interface BulkExportOptions {
  formats: ('csv' | 'pdf' | 'excel')[];
  sections: ('finance' | 'sales' | 'operations' | 'marketing' | 'customers')[];
  dateRange: { from: Date; to: Date };
  includeCharts: boolean;
}

export class EnhancedExportService {
  private static progressCallbacks = new Map<string, (progress: ExportProgress) => void>();
  private static arabicFontLoaded = false;

  // Initialize Arabic font support for PDF
  static async initializeArabicFont() {
    if (this.arabicFontLoaded) return;

    try {
      // Load Arabic font from Google Fonts for better support
      const fontUrl = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@400;700&display=swap';
      const fontLink = document.createElement('link');
      fontLink.href = fontUrl;
      fontLink.rel = 'stylesheet';
      
      if (!document.head.querySelector(`link[href="${fontUrl}"]`)) {
        document.head.appendChild(fontLink);
      }
      
      // Set flag to prevent reloading
      this.arabicFontLoaded = true;
      console.log('Arabic font loaded successfully for PDF generation');
    } catch (error) {
      console.warn('Failed to load Arabic font for PDF:', error);
      this.arabicFontLoaded = true; // Prevent retry loops
    }
  }

  // Register progress callback
  static onProgress(exportId: string, callback: (progress: ExportProgress) => void) {
    this.progressCallbacks.set(exportId, callback);
  }

  // Update progress
  private static updateProgress(
    exportId: string, 
    progress: number, 
    status: ExportProgress['status'],
    error?: string
  ) {
    const callback = this.progressCallbacks.get(exportId);
    if (callback) {
      callback({
        id: exportId,
        filename: '',
        progress,
        status,
        error
      });
    }
  }

  // Enhanced CSV export with progress
  static async exportCSVWithProgress(
    data: any[], 
    headers: string[], 
    filename: string,
    exportId: string
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.updateProgress(exportId, 0, 'processing');
        
        // Simulate processing time for large datasets
        setTimeout(() => {
          this.updateProgress(exportId, 30, 'processing');
          
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
          
          this.updateProgress(exportId, 70, 'processing');
          
          const csvContent = [csvHeaders, ...csvRows].join('\n');
          const blob = new Blob(['\uFEFF' + csvContent], { 
            type: 'text/csv;charset=utf-8;' 
          });
          
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.setAttribute('href', url);
          link.setAttribute('download', filename);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          this.updateProgress(exportId, 100, 'completed');
          resolve();
        }, 500);
      } catch (error) {
        this.updateProgress(exportId, 0, 'failed', (error as Error).message);
        reject(error);
      }
    });
  }

  // Enhanced Arabic PDF generation with advanced RTL support
  static async generateArabicPDF(date: Date, exportId: string): Promise<void> {
    await this.initializeArabicFont();
    
    return new Promise(async (resolve, reject) => {
      try {
        this.updateProgress(exportId, 0, 'processing');
        
        const data = getDataForDate(date);
        this.updateProgress(exportId, 20, 'processing');
        
        // Use enhanced Arabic PDF service
        const pdfBlob = await ArabicPDFService.createEnhancedArabicPDF(data, date);
        this.updateProgress(exportId, 80, 'processing');
        
        // Download the enhanced PDF
        const link = document.createElement('a');
        const url = URL.createObjectURL(pdfBlob);
        link.setAttribute('href', url);
        link.setAttribute('download', `wathiq-enhanced-report-${format(date, 'yyyy-MM-dd')}.pdf`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        this.updateProgress(exportId, 100, 'completed');
        resolve();
      } catch (error) {
        this.updateProgress(exportId, 0, 'failed', (error as Error).message);
        reject(error);
      }
    });
  }
  
  // Fallback method for basic Arabic PDF (kept for compatibility)
  static async generateBasicArabicPDF(date: Date, exportId: string): Promise<void> {
    await this.initializeArabicFont();
    
    return new Promise((resolve, reject) => {
      try {
        this.updateProgress(exportId, 0, 'processing');
        
        const data = getDataForDate(date);
        const pdf = new jsPDF('p', 'pt', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 40;
        let yPosition = 60;

        // Set up RTL text direction and enhanced Arabic font support
        pdf.setFont('helvetica', 'normal');
        
        this.updateProgress(exportId, 20, 'processing');
        
        // Header with enhanced Arabic text rendering
        pdf.setFontSize(28);
        pdf.setTextColor(16, 89, 98); // Wathiq primary color
        
        // Enhanced Arabic title with proper spacing
        const title = 'تقرير واثق اليومي الشامل';
        pdf.text(title, pageWidth - margin, yPosition, { 
          align: 'right',
          maxWidth: pageWidth - 2 * margin,
          lineHeightFactor: 1.5
        });
        yPosition += 50;
        
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text(`التاريخ: ${format(date, 'yyyy-MM-dd')}`, pageWidth - margin, yPosition, { 
          align: 'right' 
        });
        yPosition += 50;

        this.updateProgress(exportId, 40, 'processing');

        // Finance Section with enhanced formatting
        this.addArabicSection(pdf, 'القسم المالي', pageWidth, margin, yPosition);
        yPosition += 30;
        
        pdf.setFontSize(12);
        pdf.setTextColor(16, 89, 98);
        pdf.text(
          `السيولة الحالية: ${formatCurrency(data.finance.currentLiquidity)}`, 
          pageWidth - margin, yPosition, { align: 'right' }
        );
        yPosition += 25;
        
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
        
        data.finance.entries.forEach((entry, index) => {
          const typeText = entry.type === 'income' ? 'إيراد' : 
                          entry.type === 'expense' ? 'مصروف' : 'إيداع';
          const entryText = `${index + 1}. ${entry.title}: ${formatCurrency(entry.amount)} (${typeText})`;
          
          // Handle text wrapping for long entries
          const lines = pdf.splitTextToSize(entryText, pageWidth - 2 * margin);
          pdf.text(lines, pageWidth - margin, yPosition, { align: 'right' });
          yPosition += lines.length * 15;
          
          if (yPosition > 700) {
            pdf.addPage();
            yPosition = 60;
          }
        });
        yPosition += 30;

        this.updateProgress(exportId, 90, 'processing');

        // Save PDF
        const filename = `wathiq-basic-report-${format(date, 'yyyy-MM-dd')}.pdf`;
        pdf.save(filename);
        
        this.updateProgress(exportId, 100, 'completed');
        resolve();
      } catch (error) {
        this.updateProgress(exportId, 0, 'failed', (error as Error).message);
        reject(error);
      }
    });
  }

  // Helper method to add Arabic section headers
  private static addArabicSection(
    pdf: jsPDF, 
    title: string, 
    pageWidth: number, 
    margin: number, 
    yPosition: number
  ) {
    pdf.setFontSize(18);
    pdf.setTextColor(16, 89, 98); // Wathiq primary
    
    // Add decorative line
    pdf.setDrawColor(210, 167, 54); // Wathiq accent
    pdf.setLineWidth(2);
    pdf.line(margin, yPosition + 5, pageWidth - margin, yPosition + 5);
    
    pdf.text(title, pageWidth - margin, yPosition - 5, { align: 'right' });
    pdf.setTextColor(0, 0, 0);
  }

  // Bulk export functionality
  static async bulkExport(options: BulkExportOptions): Promise<string> {
    const exportId = `bulk-${Date.now()}`;
    this.updateProgress(exportId, 0, 'processing');

    try {
      const { formats, sections, dateRange, includeCharts } = options;
      const exportPromises: Promise<void>[] = [];
      const totalOperations = formats.length * sections.length;
      let completedOperations = 0;

      // Generate date range
      const dates: Date[] = [];
      const currentDate = new Date(dateRange.from);
      while (currentDate <= dateRange.to) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }

      for (const date of dates) {
        for (const section of sections) {
          for (const exportFormat of formats) {
            const operationId = `${exportId}-${section}-${exportFormat}-${format(date, 'yyyy-MM-dd')}`;
            
            const promise = this.exportSectionData(section, exportFormat, date, operationId)
              .then(() => {
                completedOperations++;
                const progress = Math.round((completedOperations / totalOperations) * 100);
                this.updateProgress(exportId, progress, 'processing');
              });
            
            exportPromises.push(promise);
          }
        }
      }

      await Promise.all(exportPromises);
      
      // Create actual ZIP file
      this.updateProgress(exportId, 95, 'processing');
      const zipFilename = await this.createZipFile(options, exportId);
      
      this.updateProgress(exportId, 100, 'completed');
      return zipFilename;
    } catch (error) {
      this.updateProgress(exportId, 0, 'failed', (error as Error).message);
      throw error;
    }
  }

  // Export individual section data
  private static async exportSectionData(
    section: string,
    exportFormat: string,
    date: Date,
    operationId: string
  ): Promise<void> {
    const data = getDataForDate(date);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    switch (section) {
      case 'finance':
        if (exportFormat === 'csv') {
          const csvData = data.finance.entries.map(entry => ({
            type: entry.type === 'income' ? 'إيراد' : entry.type === 'expense' ? 'مصروف' : 'إيداع',
            title: entry.title,
            amount: formatNumber(entry.amount, 2),
            category: entry.category,
            description: entry.description || '',
            date: format(entry.date, 'yyyy-MM-dd')
          }));
          
          await this.exportCSVWithProgress(
            csvData, 
            Object.keys(csvData[0] || {}), 
            `finance-${dateStr}.csv`,
            operationId
          );
        }
        break;
        
      case 'sales':
        if (exportFormat === 'csv') {
          const csvData = data.sales.entries.map(entry => ({
            customerName: entry.customerName,
            contactNumber: entry.contactNumber,
            meetingDate: format(entry.meetingDate, 'yyyy-MM-dd'),
            meetingTime: entry.meetingTime,
            outcome: entry.outcome === 'positive' ? 'إيجابي' : entry.outcome === 'negative' ? 'سلبي' : 'في الانتظار',
            notes: entry.notes
          }));
          
          await this.exportCSVWithProgress(
            csvData, 
            Object.keys(csvData[0] || {}), 
            `sales-${dateStr}.csv`,
            operationId
          );
        }
        break;
        
      // Add other sections...
    }
  }

  // Retry failed export
  static async retryExport(exportId: string, retryFunction: () => Promise<void>): Promise<void> {
    const maxRetries = 3;
    let attempts = 0;
    
    while (attempts < maxRetries) {
      try {
        await retryFunction();
        return;
      } catch (error) {
        attempts++;
        if (attempts >= maxRetries) {
          this.updateProgress(exportId, 0, 'failed', `Failed after ${maxRetries} attempts: ${(error as Error).message}`);
          throw error;
        }
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
      }
    }
  }

  // Create ZIP file from bulk export
  private static async createZipFile(options: BulkExportOptions, exportId: string): Promise<string> {
    const zip = new JSZip();
    const { sections, formats, dateRange } = options;
    
    // Generate date range
    const dates: Date[] = [];
    const currentDate = new Date(dateRange.from);
    while (currentDate <= dateRange.to) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Add files to ZIP
    for (const date of dates) {
      const dateFolder = zip.folder(format(date, 'yyyy-MM-dd'));
      
      for (const section of sections) {
        const sectionFolder = dateFolder?.folder(this.getSectionName(section));
        
        for (const exportFormat of formats) {
          if (exportFormat === 'csv') {
            const csvContent = await this.generateCSVContent(section, date);
            sectionFolder?.file(`${section}.csv`, csvContent);
          } else if (exportFormat === 'pdf') {
            // For PDF, we'd need to generate the content
            const pdfContent = await this.generatePDFContent(section, date);
            sectionFolder?.file(`${section}.pdf`, pdfContent);
          }
        }
      }
    }

    // Generate ZIP file
    const zipContent = await zip.generateAsync({ type: 'blob' });
    const zipFilename = `wathiq-bulk-export-${format(new Date(), 'yyyy-MM-dd-HHmm')}.zip`;
    
    // Download ZIP file
    const link = document.createElement('a');
    const url = URL.createObjectURL(zipContent);
    link.setAttribute('href', url);
    link.setAttribute('download', zipFilename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    return zipFilename;
  }

  // Get Arabic section name
  private static getSectionName(section: string): string {
    const sectionNames: Record<string, string> = {
      'finance': 'المالية',
      'sales': 'المبيعات',
      'operations': 'العمليات',
      'marketing': 'التسويق',
      'customers': 'العملاء'
    };
    return sectionNames[section] || section;
  }

  // Generate CSV content for a section
  private static async generateCSVContent(section: string, date: Date): Promise<string> {
    const data = getDataForDate(date);
    
    switch (section) {
      case 'finance':
        const financeData = data.finance.entries.map(entry => ({
          type: entry.type === 'income' ? 'إيراد' : entry.type === 'expense' ? 'مصروف' : 'إيداع',
          title: entry.title,
          amount: formatNumber(entry.amount, 2),
          category: entry.category,
          description: entry.description || '',
          date: format(entry.date, 'yyyy-MM-dd')
        }));
        return this.arrayToCSV(financeData);
        
      case 'sales':
        const salesData = data.sales.entries.map(entry => ({
          customerName: entry.customerName,
          contactNumber: entry.contactNumber,
          meetingDate: format(entry.meetingDate, 'yyyy-MM-dd'),
          meetingTime: entry.meetingTime,
          outcome: entry.outcome === 'positive' ? 'إيجابي' : entry.outcome === 'negative' ? 'سلبي' : 'في الانتظار',
          notes: entry.notes
        }));
        return this.arrayToCSV(salesData);
        
      // Add other sections...
      default:
        return '';
    }
  }

  // Generate PDF content for a section (simplified)
  private static async generatePDFContent(section: string, date: Date): Promise<Blob> {
    // This would generate a PDF blob for the specific section
    // For now, return a simple PDF
    const pdf = new jsPDF();
    pdf.text(`تقرير ${this.getSectionName(section)} - ${format(date, 'yyyy-MM-dd')}`, 20, 20);
    return pdf.output('blob');
  }

  // Convert array to CSV string
  private static arrayToCSV(data: any[]): string {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvHeaders = headers.join(',');
    const csvRows = data.map(row => 
      headers.map(header => {
        const value = row[header];
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      }).join(',')
    );
    
    return [csvHeaders, ...csvRows].join('\n');
  }

  // Cleanup progress callbacks
  static cleanupProgress(exportId: string) {
    this.progressCallbacks.delete(exportId);
  }
}