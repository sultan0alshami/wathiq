import { DailyData } from '@/lib/mockData';
import { format } from 'date-fns';

export class ArabicPDFService {
  // No client-side font loading or processing needed anymore
  // All PDF generation and Arabic text rendering will be handled by the backend

  static async createEnhancedArabicPDF(data: DailyData, date: Date): Promise<Blob> {
    try {
      // Prefer explicit backend URL when provided (e.g. Render), otherwise use Vite dev proxy.
      // Note: VITE_* env vars must be available at build time for Vite to include them.
      const backendBase = import.meta.env.VITE_BACKEND_URL?.trim().replace(/\/+$/, '');
      
      // Construct endpoint: if backendBase exists, use it directly (no /api prefix needed).
      // The backend route is /generate-pdf, not /api/generate-pdf.
      // If backendBase is not available (env var not set at build time), fall back to
      // /api/generate-pdf which works in dev via Vite proxy, but will fail in production.
      let endpoint: string;
      if (backendBase && backendBase.length > 0) {
        endpoint = `${backendBase}/generate-pdf`;
      } else {
        // In production without VITE_BACKEND_URL, try to infer from window.location
        // This is a fallback for cases where env var wasn't available at build time
        const isProduction = import.meta.env.PROD;
        if (isProduction && typeof window !== 'undefined') {
          // If we're on Render's domain, use the same domain for backend
          const hostname = window.location.hostname;
          if (hostname.includes('onrender.com')) {
            endpoint = `${window.location.protocol}//${hostname}/generate-pdf`;
          } else {
            // Fallback: assume backend is on same origin
            endpoint = '/generate-pdf';
          }
        } else {
          // Dev mode: use Vite proxy
          endpoint = '/api/generate-pdf';
        }
      }

      // Helpful for debugging deployment issues (Vercel/Render)
      console.debug('[ArabicPDFService] VITE_BACKEND_URL:', import.meta.env.VITE_BACKEND_URL);
      console.debug('[ArabicPDFService] Using PDF endpoint:', endpoint);

      // Add timeout to prevent hanging requests (30 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data, date: format(date, 'yyyy-MM-dd') }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

      if (!response.ok) {
        let errorDetails = '';
        try {
          const errorJson = await response.json();
          errorDetails = errorJson.message || errorJson.error || JSON.stringify(errorJson);
          console.error('[ArabicPDFService] PDF generation error:', errorJson);
        } catch {
          const errorText = await response.text().catch(() => '');
          errorDetails = errorText || response.statusText;
        }
        throw new Error(`Failed to generate PDF (${response.status}): ${errorDetails}`);
      }

        return await response.blob();
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('PDF generation request timed out after 30 seconds. Please try again.');
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Error generating enhanced Arabic PDF via backend:', error);
      throw error;
    }
  }

  // All previous jsPDF-specific helpers were removed; backend HTML/CSS + WeasyPrint
  // is the single source of truth for Arabic PDF formatting.
}