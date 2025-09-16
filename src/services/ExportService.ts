import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { DailyData, FinanceEntry, SalesEntry, OperationEntry, MarketingTask, Customer, getDataForDate } from '@/lib/mockData';
import { formatCurrency, formatNumber } from '@/lib/numberUtils';

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

    const csv = this.toCSV(csvData, Object.keys(csvData[0] || {}));
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

    const csv = this.toCSV(csvData, Object.keys(csvData[0] || {}));
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

    const csv = this.toCSV(csvData, Object.keys(csvData[0] || {}));
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

    const csv = this.toCSV(csvData, Object.keys(csvData[0] || {}));
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

    const csv = this.toCSV(csvData, Object.keys(csvData[0] || {}));
    const filename = `customers-${format(date, 'yyyy-MM-dd')}.csv`;
    this.downloadCSV(filename, csv);
  }

  // Generate comprehensive PDF report
  static async generatePDFReport(date: Date) {
    const data = getDataForDate(date);
    const pdf = new jsPDF('p', 'pt', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 40;
    let yPosition = 60;

    // Add Arabic font support (basic Latin characters)
    pdf.setFont('helvetica');
    
    // Header
    pdf.setFontSize(20);
    pdf.text('تقرير واثق اليومي', pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 30;
    
    pdf.setFontSize(12);
    pdf.text(`التاريخ: ${format(date, 'yyyy-MM-dd')}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 40;

    // Finance Section
    pdf.setFontSize(16);
    pdf.text('القسم المالي', pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 25;
    
    pdf.setFontSize(10);
    pdf.text(`السيولة الحالية: ${formatCurrency(data.finance.currentLiquidity)}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 20;
    
    data.finance.entries.forEach(entry => {
      const entryText = `${entry.title}: ${formatCurrency(entry.amount)} (${entry.type})`;
      pdf.text(entryText, pageWidth - margin, yPosition, { align: 'right' });
      yPosition += 15;
    });
    yPosition += 20;

    // Sales Section
    pdf.setFontSize(16);
    pdf.text('قسم المبيعات', pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 25;
    
    pdf.setFontSize(10);
    pdf.text(`العملاء المتصل بهم: ${data.sales.customersContacted}`, pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 20;
    
    data.sales.entries.forEach(entry => {
      pdf.text(`${entry.customerName} - ${entry.outcome}`, pageWidth - margin, yPosition, { align: 'right' });
      yPosition += 15;
    });
    yPosition += 20;

    // Operations Section
    if (yPosition > 700) {
      pdf.addPage();
      yPosition = 60;
    }
    
    pdf.setFontSize(16);
    pdf.text('قسم العمليات', pageWidth - margin, yPosition, { align: 'right' });
    yPosition += 25;
    
    pdf.setFontSize(10);
    data.operations.entries.forEach(entry => {
      pdf.text(`${entry.task} - ${entry.status}`, pageWidth - margin, yPosition, { align: 'right' });
      yPosition += 15;
    });

    // Save PDF
    const filename = `wathiq-report-${format(date, 'yyyy-MM-dd')}.pdf`;
    pdf.save(filename);
  }

  // Export merged daily report (CSV format)
  static exportMergedDailyCSV(date: Date) {
    const data = getDataForDate(date);
    const mergedData = [
      // Finance summary
      { section: 'المالية', field: 'السيولة الحالية', value: formatCurrency(data.finance.currentLiquidity), notes: '' },
      { section: 'المالية', field: 'عدد العمليات المالية', value: data.finance.entries.length, notes: 'عملية' },
      
      // Sales summary
      { section: 'المبيعات', field: 'العملاء المتصل بهم', value: data.sales.customersContacted, notes: 'عميل' },
      { section: 'المبيعات', field: 'عدد الاجتماعات', value: data.sales.entries.length, notes: 'اجتماع' },
      
      // Operations summary
      { section: 'العمليات', field: 'إجمالي العمليات', value: data.operations.totalOperations, notes: 'عملية' },
      { section: 'العمليات', field: 'العمليات المتوقعة غداً', value: data.operations.expectedNextDay, notes: 'عملية' },
      
      // Marketing summary
      { section: 'التسويق', field: 'عدد المهام', value: data.marketing.tasks.length, notes: 'مهمة' },
      { section: 'التسويق', field: 'المهام المكتملة', value: data.marketing.tasks.filter(t => t.status === 'completed').length, notes: 'مهمة' },
      
      // Customers summary
      { section: 'العملاء', field: 'إجمالي العملاء', value: data.customers.length, notes: 'عميل' },
      { section: 'العملاء', field: 'العملاء المتصل بهم', value: data.customers.filter(c => c.contacted).length, notes: 'عميل' }
    ];

    const csv = this.toCSV(mergedData, ['section', 'field', 'value', 'notes']);
    const filename = `merged-daily-report-${format(date, 'yyyy-MM-dd')}.csv`;
    this.downloadCSV(filename, csv);
  }
}