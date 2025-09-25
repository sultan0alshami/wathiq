import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { DailyData } from '@/lib/mockData';
import { formatCurrency, formatNumber } from '@/lib/numberUtils';
import { ar } from 'date-fns/locale';
import reshape from 'arabic-reshaper'; // Import arabic-reshaper
import bidi from 'bidi-js'; // Import bidi-js as default

// Import font files directly (ensure these paths are correct in your project)
import DubaiRegular from './fonts/ArbFONTS-Dubai-Regular.otf';
import DubaiBold from './fonts/ArbFONTS-Dubai-Bold.ttf';


export class ArabicPDFService {
  private static arabicFontLoaded = false;
  private static readonly primaryColor = [16, 89, 98]; // Tailwind: wathiq-primary (green-800 or similar)
  private static readonly accentColor = [210, 167, 54]; // Tailwind: wathiq-accent (amber-500 or similar)
  private static readonly successColor = [40, 167, 69]; // Tailwind: green-600
  private static readonly dangerColor = [220, 53, 69]; // Tailwind: red-600
  private static readonly infoColor = [13, 110, 253];   // Tailwind: blue-600
  private static readonly mutedColor = [100, 100, 100]; // Gray for muted text
  private static readonly lightBgColor = [240, 248, 255]; // Light background for highlight
  private static readonly altRowBgColor = [248, 249, 250]; // Alternating row background
  private static readonly textColor = [0, 0, 0];       // Black
  private static readonly whiteColor = [255, 255, 255]; // White

  // Enhanced Arabic text processing
  private static processText(text: string): string {
    const reshapedText = reshape.reshape(text);
    return bidi.getBidiText(reshapedText, { unicode: true, reverse: true }); // Apply Bidi algorithm using default import
  }

  // Initialize enhanced Arabic font support
  static async initializeEnhancedArabicFont() {
    if (this.arabicFontLoaded) return;

    const pdf = new jsPDF(); // Temporary instance to add fonts
    pdf.addFileToVFS('ArbFONTS-Dubai-Regular.otf', DubaiRegular);
    pdf.addFont('ArbFONTS-Dubai-Regular.otf', 'Dubai', 'normal', 'Identity-H'); // Added 'Identity-H'
    pdf.addFileToVFS('ArbFONTS-Dubai-Bold.ttf', DubaiBold);
    pdf.addFont('ArbFONTS-Dubai-Bold.ttf', 'Dubai', 'bold', 'Identity-H'); // Added 'Identity-H'
    this.arabicFontLoaded = true;
  }

  // Create enhanced Arabic PDF with proper formatting
  static async createEnhancedArabicPDF(data: DailyData, date: Date): Promise<Blob> {
    // Ensure fonts are loaded before creating PDF
    if (!this.arabicFontLoaded) {
      await this.initializeEnhancedArabicFont();
    }

    const pdf = new jsPDF();
    pdf.setFont('Dubai', 'normal'); // Set the font family for the entire document
    pdf.setR2L(true);
    pdf.setFontSize(12);

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 50;
    let yPosition = 80;

    // Set up document properties for Arabic
    pdf.setProperties({
      title: this.processText('تقرير واثق اليومي الشامل'),
      subject: this.processText(`تقرير ليوم ${format(date, 'yyyy-MM-dd')}`),
      author: this.processText('نظام واثق'),
      creator: 'Wathiq System'
    });

    // Enhanced header design
    this.addEnhancedHeader(pdf, date, pageWidth, margin, yPosition);
    yPosition += 100;

    // Add decorative separator
    this.addDecorativeSeparator(pdf, margin, pageWidth, yPosition);
    yPosition += 30;

    // Finance section with enhanced formatting
    yPosition = this.addFinanceSection(pdf, data, pageWidth, margin, yPosition);
    yPosition += 40;

    // Sales section
    if (yPosition > pageHeight - 200) {
      pdf.addPage();
      pdf.setFont('Dubai', 'normal'); // Re-apply font after adding page
      yPosition = 60;
    }
    yPosition = this.addSalesSection(pdf, data, pageWidth, margin, yPosition);
    yPosition += 40;

    // Operations section
    if (yPosition > pageHeight - 200) {
      pdf.addPage();
      pdf.setFont('Dubai', 'normal'); // Re-apply font after adding page
      yPosition = 60;
    }
    yPosition = this.addOperationsSection(pdf, data, pageWidth, margin, yPosition);
    yPosition += 40;

    // Marketing section
    if (yPosition > pageHeight - 200) {
      pdf.addPage();
      pdf.setFont('Dubai', 'normal'); // Re-apply font after adding page
      yPosition = 60;
    }
    yPosition = this.addMarketingSection(pdf, data, pageWidth, margin, yPosition);

    // Add footer
    this.addEnhancedFooter(pdf, date, pageWidth, pageHeight, margin);

    return new Blob([pdf.output('arraybuffer')], { type: 'application/pdf' });
  }

  // Enhanced header design
  private static addEnhancedHeader(pdf: jsPDF, date: Date, pageWidth: number, margin: number, yPosition: number) {
    // Company header background
    pdf.setFillColor(this.primaryColor[0], this.primaryColor[1], this.primaryColor[2]);
    pdf.rect(margin, yPosition - 20, pageWidth - 2 * margin, 60, 'F');

    // Main title
    pdf.setTextColor(this.whiteColor[0], this.whiteColor[1], this.whiteColor[2]);
    pdf.setFontSize(32);
    pdf.setFont('Dubai', 'bold');

    const title = this.processText('تقرير واثق اليومي الشامل');
    pdf.text(title, pageWidth - margin - 20, yPosition + 20, {
      align: 'right',
      maxWidth: pageWidth - 2 * margin - 40
    });

    // Date subtitle
    pdf.setFontSize(16);
    pdf.setTextColor(this.accentColor[0], this.accentColor[1], this.accentColor[2]);
    const dateText = this.processText(`التاريخ: ${format(date, 'dd/MM/yyyy - EEEE', { locale: ar })}`);
    pdf.text(dateText, pageWidth - margin - 20, yPosition + 45, { align: 'right' });

    // Reset text color
    pdf.setTextColor(this.textColor[0], this.textColor[1], this.textColor[2]);
    pdf.setFont('Dubai', 'normal');

    yPosition += 10;
    return yPosition;
  }

  // Add decorative separator
  private static addDecorativeSeparator(pdf: jsPDF, margin: number, pageWidth: number, yPosition: number) {
    pdf.setDrawColor(this.accentColor[0], this.accentColor[1], this.accentColor[2]);
    pdf.setLineWidth(3);
    pdf.line(margin + 50, yPosition, pageWidth - margin - 50, yPosition);
    
    // Add small decorative elements
    pdf.setFillColor(this.accentColor[0], this.accentColor[1], this.accentColor[2]);
    pdf.circle(margin + 50, yPosition, 4, 'F');
    pdf.circle(pageWidth - margin - 50, yPosition, 4, 'F');
  }

  // Enhanced finance section with tables
  private static addFinanceSection(pdf: jsPDF, data: DailyData, pageWidth: number, margin: number, yPosition: number): number {
    // Section header
    yPosition = this.addSectionHeader(pdf, 'القسم المالي', pageWidth, margin, yPosition);
    yPosition += 30;

    // Current liquidity highlight box
    pdf.setFillColor(this.lightBgColor[0], this.lightBgColor[1], this.lightBgColor[2]);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 40, 'F');
    pdf.setDrawColor(this.primaryColor[0], this.primaryColor[1], this.primaryColor[2]);
    pdf.setLineWidth(2);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 40);

    pdf.setFontSize(18);
    pdf.setTextColor(this.primaryColor[0], this.primaryColor[1], this.primaryColor[2]);
    const liquidityText = this.processText(`السيولة الحالية: ${formatCurrency(data.finance.currentLiquidity)}`);
    pdf.text(liquidityText, pageWidth - margin - 20, yPosition + 25, { align: 'right' });
    yPosition += 60;

    // Financial entries table
    pdf.setFontSize(12);
    pdf.setTextColor(this.textColor[0], this.textColor[1], this.textColor[2]);
    
    data.finance.entries.forEach((entry, index) => {
      if (yPosition > 700) {
        pdf.addPage();
        pdf.setFont('Amiri', 'normal'); // Re-apply font after adding page
        yPosition = 60;
      }

      const typeText = entry.type === 'income' ? 'إيراد' :
                      entry.type === 'expense' ? 'مصروف' : 'إيداع';
      const amount = formatCurrency(entry.amount);
      
      // Entry row with alternating background
      if (index % 2 === 0) {
        pdf.setFillColor(this.altRowBgColor[0], this.altRowBgColor[1], this.altRowBgColor[2]);
        pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 25, 'F');
      }

      // Type badge
      const typeColor = entry.type === 'income' ? this.successColor :
                       entry.type === 'expense' ? this.dangerColor : this.infoColor;
      pdf.setFillColor(typeColor[0], typeColor[1], typeColor[2]);
      pdf.rect(pageWidth - margin - 80, yPosition, 60, 15, 'F');
      pdf.setTextColor(this.whiteColor[0], this.whiteColor[1], this.whiteColor[2]);
      pdf.setFontSize(10);
      pdf.text(typeText, pageWidth - margin - 50, yPosition + 10, { align: 'center' });

      // Entry details
      pdf.setTextColor(this.textColor[0], this.textColor[1], this.textColor[2]);
      pdf.setFontSize(12);
      pdf.text(`${index + 1}.`, margin + 10, yPosition + 10);
      
      const titleText = this.processText(entry.title);
      pdf.text(titleText, pageWidth - margin - 100, yPosition + 10, { align: 'right' });
      
      pdf.setTextColor(this.primaryColor[0], this.primaryColor[1], this.primaryColor[2]);
      pdf.text(amount, pageWidth - margin - 100, yPosition + 22, { align: 'right' });
      
      yPosition += 30;
    });

    return yPosition;
  }

  // Enhanced sales section
  private static addSalesSection(pdf: jsPDF, data: DailyData, pageWidth: number, margin: number, yPosition: number): number {
    yPosition = this.addSectionHeader(pdf, 'قسم المبيعات', pageWidth, margin, yPosition);
    yPosition += 30;

    // Customers contacted highlight
    pdf.setFillColor(240, 253, 244);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 30, 'F');
    pdf.setDrawColor(this.successColor[0], this.successColor[1], this.successColor[2]);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 30);

    pdf.setFontSize(16);
    pdf.setTextColor(this.successColor[0], this.successColor[1], this.successColor[2]);
    const contactedText = this.processText(`عدد العملاء المتصل بهم: ${data.sales.customersContacted}`);
    pdf.text(contactedText, pageWidth - margin - 20, yPosition + 20, { align: 'right' });
    yPosition += 50;

    // Sales entries
    pdf.setFontSize(11);
    pdf.setTextColor(this.textColor[0], this.textColor[1], this.textColor[2]);
    
    data.sales.entries.forEach((entry, index) => {
      if (yPosition > 650) {
        pdf.addPage();
        pdf.setFont('Amiri', 'normal'); // Re-apply font after adding page
        yPosition = 60;
      }

      const outcomeText = entry.outcome === 'positive' ? 'إيجابي' :
                         entry.outcome === 'negative' ? 'سلبي' : 'في الانتظار';
      const outcomeColor = entry.outcome === 'positive' ? this.successColor :
                          entry.outcome === 'negative' ? this.dangerColor : this.accentColor;

      // Customer name
      pdf.setFontSize(14);
      pdf.setTextColor(this.primaryColor[0], this.primaryColor[1], this.primaryColor[2]);
      const customerText = this.processText(`${index + 1}. ${entry.customerName}`);
      pdf.text(customerText, pageWidth - margin - 20, yPosition, { align: 'right' });
      yPosition += 20;

      // Meeting details
      pdf.setFontSize(10);
      pdf.setTextColor(this.mutedColor[0], this.mutedColor[1], this.mutedColor[2]);
      const meetingText = this.processText(`الاجتماع: ${entry.meetingTime} - ${entry.contactNumber}`);
      pdf.text(meetingText, pageWidth - margin - 20, yPosition, { align: 'right' });
      yPosition += 15;

      // Outcome badge
      pdf.setFillColor(outcomeColor[0], outcomeColor[1], outcomeColor[2]);
      pdf.rect(pageWidth - margin - 80, yPosition - 10, 60, 15, 'F');
      pdf.setTextColor(this.whiteColor[0], this.whiteColor[1], this.whiteColor[2]);
      pdf.text(outcomeText, pageWidth - margin - 50, yPosition - 2, { align: 'center' });

      // Notes
      if (entry.notes) {
        pdf.setTextColor(this.textColor[0], this.textColor[1], this.textColor[2]);
        pdf.setFontSize(9);
        const notesLines = pdf.splitTextToSize(this.processText(entry.notes), pageWidth - 2 * margin - 40);
        pdf.text(notesLines, pageWidth - margin - 20, yPosition + 10, { align: 'right' });
        yPosition += notesLines.length * 12;
      }

      yPosition += 20;
    });

    return yPosition;
  }

  // Enhanced operations section
  private static addOperationsSection(pdf: jsPDF, data: DailyData, pageWidth: number, margin: number, yPosition: number): number {
    yPosition = this.addSectionHeader(pdf, 'قسم العمليات', pageWidth, margin, yPosition);
    yPosition += 30;

    data.operations.entries.forEach((entry, index) => {
      if (yPosition > 700) {
        pdf.addPage();
        pdf.setFont('Amiri', 'normal'); // Re-apply font after adding page
        yPosition = 60;
      }

      const statusText = entry.status === 'completed' ? 'مكتمل' :
                        entry.status === 'in-progress' ? 'قيد التنفيذ' : 'في الانتظار';
      const statusColor = entry.status === 'completed' ? this.successColor :
                         entry.status === 'in-progress' ? this.accentColor : this.mutedColor;

      // Task title
      pdf.setFontSize(12);
      pdf.setTextColor(this.primaryColor[0], this.primaryColor[1], this.primaryColor[2]);
      const taskText = this.processText(`${index + 1}. ${entry.task}`);
      pdf.text(taskText, pageWidth - margin - 20, yPosition, { align: 'right' });
      yPosition += 18;

      // Status and owner
      pdf.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      pdf.rect(pageWidth - margin - 70, yPosition - 12, 50, 12, 'F');
      pdf.setTextColor(this.whiteColor[0], this.whiteColor[1], this.whiteColor[2]);
      pdf.setFontSize(8);
      pdf.text(statusText, pageWidth - margin - 45, yPosition - 4, { align: 'center' });

      pdf.setTextColor(this.mutedColor[0], this.mutedColor[1], this.mutedColor[2]);
      pdf.setFontSize(9);
      const ownerText = this.processText(`المسؤول: ${entry.owner}`);
      pdf.text(ownerText, pageWidth - margin - 80, yPosition, { align: 'right' });

      yPosition += 25;
    });

    return yPosition;
  }

  // Enhanced marketing section
  private static addMarketingSection(pdf: jsPDF, data: DailyData, pageWidth: number, margin: number, yPosition: number): number {
    yPosition = this.addSectionHeader(pdf, 'قسم التسويق', pageWidth, margin, yPosition);
    yPosition += 30;

    // Marketing tasks
    data.marketing.tasks.forEach((task, index) => {
      if (yPosition > 700) {
        pdf.addPage();
        pdf.setFont('Amiri', 'normal'); // Re-apply font after adding page
        yPosition = 60;
      }

      const statusText = task.status === 'completed' ? 'مكتمل' :
                        task.status === 'in-progress' ? 'قيد التنفيذ' : 'مخطط';
      const statusColor = task.status === 'completed' ? this.successColor :
                         task.status === 'in-progress' ? this.accentColor : this.infoColor;

      pdf.setFontSize(11);
      pdf.setTextColor(this.primaryColor[0], this.primaryColor[1], this.primaryColor[2]);
      const taskText = this.processText(`${index + 1}. ${task.title}`);
      pdf.text(taskText, pageWidth - margin - 20, yPosition, { align: 'right' });

      // Status badge
      pdf.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      pdf.rect(pageWidth - margin - 60, yPosition + 5, 40, 10, 'F');
      pdf.setTextColor(this.whiteColor[0], this.whiteColor[1], this.whiteColor[2]);
      pdf.setFontSize(7);
      pdf.text(statusText, pageWidth - margin - 40, yPosition + 12, { align: 'center' });

      yPosition += 25;
    });

    return yPosition;
  }

  // Section header with styling
  private static addSectionHeader(pdf: jsPDF, title: string, pageWidth: number, margin: number, yPosition: number): number {
    // Background bar
    pdf.setFillColor(this.primaryColor[0], this.primaryColor[1], this.primaryColor[2]);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 30, 'F');

    // Title text
    pdf.setTextColor(this.whiteColor[0], this.whiteColor[1], this.whiteColor[2]);
    pdf.setFontSize(20);
    pdf.setFont('Amiri', 'bold');
    const titleText = this.processText(title);
    pdf.text(titleText, pageWidth - margin - 20, yPosition + 20, { align: 'right' });

    // Decorative line
    pdf.setDrawColor(this.accentColor[0], this.accentColor[1], this.accentColor[2]);
    pdf.setLineWidth(3);
    pdf.line(margin, yPosition + 32, pageWidth - margin, yPosition + 32);

    pdf.setTextColor(this.textColor[0], this.textColor[1], this.textColor[2]);
    pdf.setFont('Amiri', 'normal');

    return yPosition + 35;
  }

  // Enhanced footer
  private static addEnhancedFooter(pdf: jsPDF, date: Date, pageWidth: number, pageHeight: number, margin: number) {
    pdf.setFont('Dubai', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(this.mutedColor[0], this.mutedColor[1], this.mutedColor[2]);
    const footerText = this.processText(`تم إنشاء هذا التقرير بواسطة نظام واثق - ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ar })}`);
    pdf.text(footerText, pageWidth - margin, pageHeight - margin, { align: 'right' });

    // Page number
    const pageText = this.processText(`صفحة ${pdf.getCurrentPageInfo().pageNumber}`);
    pdf.text(pageText, margin, pageHeight - margin);
  }
}