import { DailyData } from '@/lib/mockData';
import { format } from 'date-fns';

export class ArabicPDFService {
  // No client-side font loading or processing needed anymore
  // All PDF generation and Arabic text rendering will be handled by the backend

  static async createEnhancedArabicPDF(data: DailyData, date: Date): Promise<Blob> {
    try {
      const response = await fetch('/api/generate-pdf', { // via proxy to backend
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data, date: format(date, 'yyyy-MM-dd') }), // Send data and formatted date
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to generate PDF: ${response.statusText} - ${errorText}`);
      }

      const pdfBlob = await response.blob();
      return pdfBlob;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    }
  }

  // Removed all other jsPDF-specific methods (addEnhancedHeader, addDecorativeSeparator,
  // addFinanceSection, addSalesSection, addOperationsSection, addMarketingSection,
  // addSectionHeader, addEnhancedFooter, processText) as they are now handled by the backend Python script
  // and HTML/CSS templating.
}