/**
 * Number formatting utilities for Wathiq system
 * Ensures consistent English number format throughout the application
 */

// A global number formatter for Arabic locale with English numerals
const arabicNumberFormatter = new Intl.NumberFormat('ar-SA', { useGrouping: true });

// Format number to English digits with specified decimal places
export const formatNumber = (value: number, decimals: number = 0): string => {
  if (isNaN(value) || value === null || value === undefined) {
    return '0';
  }
  return arabicNumberFormatter.format(Number(value.toFixed(decimals)));
};

// Format currency with exactly 2 decimal places in Arabic
export const formatCurrency = (value: number, currency: string = 'ر.س'): string => {
  if (isNaN(value) || value === null || value === undefined) {
    return `0.00 ${currency}`;
  }
  const formatter = new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: 'SAR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  // Remove SAR currency symbol and append custom Arabic currency symbol
  return formatter.format(value).replace('SAR', '').trim() + ' ' + currency;
};

// Format percentage with 1 decimal place
export const formatPercentage = (value: number): string => {
  if (isNaN(value) || value === null || value === undefined) {
    return '0.0%';
  }
  const formatter = new Intl.NumberFormat('ar-SA', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
  return formatter.format(value / 100); // Divide by 100 as Intl.NumberFormat expects a fraction for percentage
};

// Private helper function to convert Arabic numerals to English and remove non-numeric characters
const convertAndCleanNumerals = (input: string): string => {
  return input
    .replace(/[٠-٩]/g, (match) => {
      return String.fromCharCode(match.charCodeAt(0) - '٠'.charCodeAt(0) + '0'.charCodeAt(0));
    })
    .replace(/[^\d.-]/g, ''); // Keep only digits, dots, and minus signs
};

// Parse input to ensure English numbers only.
// Note: JavaScript's standard `number` type (double-precision floating-point) has limitations
// regarding precision for very large or very small numbers (beyond 2^53 or below -2^53).
// For financial applications requiring arbitrary precision, consider using a dedicated
// library like `decimal.js` or `big.js`. This function also handles `Infinity` and `-Infinity`.
export const parseEnglishNumber = (input: string): number => {
  const englishInput = convertAndCleanNumerals(input);
  const parsed = parseFloat(englishInput);
  
  if (!isFinite(parsed)) {
    // Handle cases where parseFloat results in Infinity or -Infinity
    return 0;
  }
  
  return isNaN(parsed) ? 0 : parsed;
};

// Format number for input fields (English only)
export const formatInputNumber = (value: string | number): string => {
  if (typeof value === 'number') {
    return value.toString();
  }
  return convertAndCleanNumerals(value);
};

// Validate that input contains only English numbers
export const isValidEnglishNumber = (input: string): boolean => {
  const englishNumberPattern = /^-?\d*\.?\d*$/;
  const convertedInput = formatInputNumber(input);
  return englishNumberPattern.test(convertedInput);
};

// Formats a number into a compact, human-readable string (e.g., 1.2K, 5M)
// It can be used for both general compact number formatting and chart-specific formatting.
export const formatCompactNumber = (value: number, decimals: number = 0): string => {
  if (isNaN(value) || value === null || value === undefined) {
    return '0';
  }

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1_000_000) {
    return sign + arabicNumberFormatter.format(Number((absValue / 1_000_000).toFixed(1))) + 'M';
  }
  if (absValue >= 1_000) {
    return sign + arabicNumberFormatter.format(Number((absValue / 1_000).toFixed(decimals))) + 'K';
  }
  return sign + arabicNumberFormatter.format(Number(absValue.toFixed(decimals)));
};

// This function now just calls formatCompactNumber with default decimals for charts.
export const formatChartNumber = (value: number): string => {
  return formatCompactNumber(value);
};