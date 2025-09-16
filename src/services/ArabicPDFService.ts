import jsPDF from 'jspdf';
import { format } from 'date-fns';
import { DailyData } from '@/lib/mockData';
import { formatCurrency, formatNumber } from '@/lib/numberUtils';

export class ArabicPDFService {
  private static arabicFontLoaded = false;

  // Enhanced Arabic text processing
  static processArabicText(text: string): string {
    // Handle Arabic text properly by ensuring RTL direction markers
    return `\u202E${text}\u202C`;
  }

  // Initialize enhanced Arabic font support
  static async initializeEnhancedArabicFont() {
    if (this.arabicFontLoaded) return;

    try {
      // Create style element for Arabic fonts
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Arabic:wght@300;400;500;600;700&family=Amiri:wght@400;700&family=Cairo:wght@300;400;600;700&display=swap');
        .arabic-pdf-text {
          font-family: 'Noto Sans Arabic', 'Amiri', 'Cairo', Arial, sans-serif;
          direction: rtl;
          text-align: right;
          unicode-bidi: bidi-override;
        }
      `;
      
      if (!document.head.querySelector('style[data-arabic-pdf]')) {
        styleElement.setAttribute('data-arabic-pdf', 'true');
        document.head.appendChild(styleElement);
      }

      this.arabicFontLoaded = true;
      console.log('Enhanced Arabic PDF fonts loaded successfully');
    } catch (error) {
      console.warn('Failed to load enhanced Arabic fonts:', error);
    }
  }

  // Create enhanced Arabic PDF with proper formatting
  static async createEnhancedArabicPDF(data: DailyData, date: Date): Promise<Blob> {
    await this.initializeEnhancedArabicFont();

    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 50;
    let yPosition = 80;

    // Set up document properties for Arabic
    pdf.setProperties({
      title: 'تقرير واثق اليومي الشامل',
      subject: `تقرير ليوم ${format(date, 'yyyy-MM-dd')}`,
      author: 'نظام واثق',
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
      yPosition = 60;
    }
    yPosition = this.addSalesSection(pdf, data, pageWidth, margin, yPosition);
    yPosition += 40;

    // Operations section
    if (yPosition > pageHeight - 200) {
      pdf.addPage();
      yPosition = 60;
    }
    yPosition = this.addOperationsSection(pdf, data, pageWidth, margin, yPosition);
    yPosition += 40;

    // Marketing section
    if (yPosition > pageHeight - 200) {
      pdf.addPage();
      yPosition = 60;
    }
    yPosition = this.addMarketingSection(pdf, data, pageWidth, margin, yPosition);

    // Add footer
    this.addEnhancedFooter(pdf, date, pageWidth, pageHeight, margin);

    return pdf.output('blob');
  }

  // Enhanced header with logo space and styling
  private static addEnhancedHeader(pdf: jsPDF, date: Date, pageWidth: number, margin: number, yPosition: number) {
    // Company header background
    pdf.setFillColor(16, 89, 98); // Wathiq primary
    pdf.rect(margin, yPosition - 20, pageWidth - 2 * margin, 60, 'F');

    // Main title
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    
    const title = this.processArabicText('تقرير واثق اليومي الشامل');
    pdf.text(title, pageWidth - margin - 20, yPosition + 20, { 
      align: 'right',
      maxWidth: pageWidth - 2 * margin - 40
    });

    // Date subtitle
    pdf.setFontSize(16);
    pdf.setTextColor(210, 167, 54); // Wathiq accent
    const dateText = this.processArabicText(`التاريخ: ${format(date, 'dd/MM/yyyy - EEEE')}`);
    pdf.text(dateText, pageWidth - margin - 20, yPosition + 45, { align: 'right' });

    // Reset text color
    pdf.setTextColor(0, 0, 0);
  }

  // Add decorative separator
  private static addDecorativeSeparator(pdf: jsPDF, margin: number, pageWidth: number, yPosition: number) {
    pdf.setDrawColor(210, 167, 54); // Wathiq accent
    pdf.setLineWidth(3);
    pdf.line(margin + 50, yPosition, pageWidth - margin - 50, yPosition);
    
    // Add small decorative elements
    pdf.setFillColor(210, 167, 54);
    pdf.circle(margin + 50, yPosition, 4, 'F');
    pdf.circle(pageWidth - margin - 50, yPosition, 4, 'F');
  }

  // Enhanced finance section with tables
  private static addFinanceSection(pdf: jsPDF, data: DailyData, pageWidth: number, margin: number, yPosition: number): number {
    // Section header
    yPosition = this.addSectionHeader(pdf, 'القسم المالي', pageWidth, margin, yPosition);
    yPosition += 30;

    // Current liquidity highlight box
    pdf.setFillColor(240, 248, 255);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 40, 'F');
    pdf.setDrawColor(16, 89, 98);
    pdf.setLineWidth(2);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 40);

    pdf.setFontSize(18);
    pdf.setTextColor(16, 89, 98);
    const liquidityText = this.processArabicText(`السيولة الحالية: ${formatCurrency(data.finance.currentLiquidity)}`);
    pdf.text(liquidityText, pageWidth - margin - 20, yPosition + 25, { align: 'right' });
    yPosition += 60;

    // Financial entries table
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    
    data.finance.entries.forEach((entry, index) => {
      if (yPosition > 700) {
        pdf.addPage();
        yPosition = 60;
      }

      const typeText = entry.type === 'income' ? 'إيراد' : 
                      entry.type === 'expense' ? 'مصروف' : 'إيداع';
      const amount = formatCurrency(entry.amount);
      
      // Entry row with alternating background
      if (index % 2 === 0) {
        pdf.setFillColor(248, 249, 250);
        pdf.rect(margin, yPosition - 5, pageWidth - 2 * margin, 25, 'F');
      }

      // Type badge
      const typeColor = entry.type === 'income' ? [40, 167, 69] : 
                       entry.type === 'expense' ? [220, 53, 69] : [13, 110, 253];
      pdf.setFillColor(typeColor[0], typeColor[1], typeColor[2]);
      pdf.rect(pageWidth - margin - 80, yPosition, 60, 15, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(10);
      pdf.text(typeText, pageWidth - margin - 50, yPosition + 10, { align: 'center' });

      // Entry details
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(12);
      pdf.text(`${index + 1}.`, margin + 10, yPosition + 10);
      
      const titleText = this.processArabicText(entry.title);
      pdf.text(titleText, pageWidth - margin - 100, yPosition + 10, { align: 'right' });
      
      pdf.setTextColor(16, 89, 98);
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
    pdf.setDrawColor(40, 167, 69);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 30);

    pdf.setFontSize(16);
    pdf.setTextColor(40, 167, 69);
    const contactedText = this.processArabicText(`عدد العملاء المتصل بهم: ${data.sales.customersContacted}`);
    pdf.text(contactedText, pageWidth - margin - 20, yPosition + 20, { align: 'right' });
    yPosition += 50;

    // Sales entries
    pdf.setFontSize(11);
    pdf.setTextColor(0, 0, 0);
    
    data.sales.entries.forEach((entry, index) => {
      if (yPosition > 650) {
        pdf.addPage();
        yPosition = 60;
      }

      const outcomeText = entry.outcome === 'positive' ? 'إيجابي' : 
                         entry.outcome === 'negative' ? 'سلبي' : 'في الانتظار';
      const outcomeColor = entry.outcome === 'positive' ? [40, 167, 69] : 
                          entry.outcome === 'negative' ? [220, 53, 69] : [255, 193, 7];

      // Customer name
      pdf.setFontSize(14);
      pdf.setTextColor(16, 89, 98);
      const customerText = this.processArabicText(`${index + 1}. ${entry.customerName}`);
      pdf.text(customerText, pageWidth - margin - 20, yPosition, { align: 'right' });
      yPosition += 20;

      // Meeting details
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      const meetingText = this.processArabicText(`الاجتماع: ${entry.meetingTime} - ${entry.contactNumber}`);
      pdf.text(meetingText, pageWidth - margin - 20, yPosition, { align: 'right' });
      yPosition += 15;

      // Outcome badge
      pdf.setFillColor(outcomeColor[0], outcomeColor[1], outcomeColor[2]);
      pdf.rect(pageWidth - margin - 80, yPosition - 10, 60, 15, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.text(outcomeText, pageWidth - margin - 50, yPosition - 2, { align: 'center' });

      // Notes
      if (entry.notes) {
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(9);
        const notesLines = pdf.splitTextToSize(this.processArabicText(entry.notes), pageWidth - 2 * margin - 40);
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
        yPosition = 60;
      }

      const statusText = entry.status === 'completed' ? 'مكتمل' : 
                        entry.status === 'in-progress' ? 'قيد التنفيذ' : 'في الانتظار';
      const statusColor = entry.status === 'completed' ? [40, 167, 69] : 
                         entry.status === 'in-progress' ? [255, 193, 7] : [108, 117, 125];

      // Task title
      pdf.setFontSize(12);
      pdf.setTextColor(16, 89, 98);
      const taskText = this.processArabicText(`${index + 1}. ${entry.task}`);
      pdf.text(taskText, pageWidth - margin - 20, yPosition, { align: 'right' });
      yPosition += 18;

      // Status and owner
      pdf.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      pdf.rect(pageWidth - margin - 70, yPosition - 12, 50, 12, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(8);
      pdf.text(statusText, pageWidth - margin - 45, yPosition - 4, { align: 'center' });

      pdf.setTextColor(100, 100, 100);
      pdf.setFontSize(9);
      const ownerText = this.processArabicText(`المسؤول: ${entry.owner}`);
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
        yPosition = 60;
      }

      const statusText = task.status === 'completed' ? 'مكتمل' : 
                        task.status === 'in-progress' ? 'قيد التنفيذ' : 'مخطط';
      const statusColor = task.status === 'completed' ? [40, 167, 69] : 
                         task.status === 'in-progress' ? [255, 193, 7] : [13, 110, 253];

      pdf.setFontSize(11);
      pdf.setTextColor(16, 89, 98);
      const taskText = this.processArabicText(`${index + 1}. ${task.title}`);
      pdf.text(taskText, pageWidth - margin - 20, yPosition, { align: 'right' });

      // Status badge
      pdf.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
      pdf.rect(pageWidth - margin - 60, yPosition + 5, 40, 10, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(7);
      pdf.text(statusText, pageWidth - margin - 40, yPosition + 12, { align: 'center' });

      yPosition += 25;
    });

    return yPosition;
  }

  // Section header with styling
  private static addSectionHeader(pdf: jsPDF, title: string, pageWidth: number, margin: number, yPosition: number): number {
    // Background bar
    pdf.setFillColor(16, 89, 98);
    pdf.rect(margin, yPosition, pageWidth - 2 * margin, 30, 'F');

    // Title text
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    const titleText = this.processArabicText(title);
    pdf.text(titleText, pageWidth - margin - 20, yPosition + 20, { align: 'right' });

    // Decorative line
    pdf.setDrawColor(210, 167, 54);
    pdf.setLineWidth(3);
    pdf.line(margin, yPosition + 32, pageWidth - margin, yPosition + 32);

    pdf.setTextColor(0, 0, 0);
    pdf.setFont('helvetica', 'normal');

    return yPosition + 35;
  }

  // Enhanced footer
  private static addEnhancedFooter(pdf: jsPDF, date: Date, pageWidth: number, pageHeight: number, margin: number) {
    const footerY = pageHeight - 50;
    
    // Footer line
    pdf.setDrawColor(210, 167, 54);
    pdf.setLineWidth(2);
    pdf.line(margin, footerY, pageWidth - margin, footerY);

    // Footer text
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    const footerText = this.processArabicText(`تم إنشاء هذا التقرير بواسطة نظام واثق - ${format(new Date(), 'dd/MM/yyyy HH:mm')}`);
    pdf.text(footerText, pageWidth - margin, footerY + 20, { align: 'right' });

    // Page number
    const pageText = this.processArabicText(`صفحة ${pdf.getCurrentPageInfo().pageNumber}`);
    pdf.text(pageText, margin + 20, footerY + 20);
  }
}