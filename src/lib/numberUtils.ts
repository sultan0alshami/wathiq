/**
 * Number formatting utilities for Wathiq system
 * Ensures consistent English number format throughout the application
 */

// Format number to English digits with specified decimal places
export const formatNumber = (value: number, decimals: number = 0): string => {
  if (isNaN(value) || value === null || value === undefined) {
    return '0';
  }
  
  return value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Format currency with exactly 2 decimal places in English
export const formatCurrency = (value: number, currency: string = 'ريال'): string => {
  if (isNaN(value) || value === null || value === undefined) {
    return `0.00 ${currency}`;
  }
  
  const formattedNumber = formatNumber(value, 2);
  return `${formattedNumber} ${currency}`;
};

// Format percentage with 1 decimal place
export const formatPercentage = (value: number): string => {
  if (isNaN(value) || value === null || value === undefined) {
    return '0.0%';
  }
  
  return `${formatNumber(value, 1)}%`;
};

// Parse input to ensure English numbers only
export const parseEnglishNumber = (input: string): number => {
  // Remove any Arabic numerals and convert to English
  const englishInput = input
    .replace(/[٠-٩]/g, (match) => {
      return String.fromCharCode(match.charCodeAt(0) - '٠'.charCodeAt(0) + '0'.charCodeAt(0));
    })
    .replace(/[^\d.-]/g, ''); // Keep only digits, dots, and minus signs
  
  const parsed = parseFloat(englishInput);
  return isNaN(parsed) ? 0 : parsed;
};

// Format number for input fields (English only)
export const formatInputNumber = (value: string | number): string => {
  if (typeof value === 'number') {
    return value.toString();
  }
  
  // Convert Arabic numerals to English and remove non-numeric characters except . and -
  return value
    .replace(/[٠-٩]/g, (match) => {
      return String.fromCharCode(match.charCodeAt(0) - '٠'.charCodeAt(0) + '0'.charCodeAt(0));
    })
    .replace(/[^\d.-]/g, '');
};

// Validate that input contains only English numbers
export const isValidEnglishNumber = (input: string): boolean => {
  const englishNumberPattern = /^-?\d*\.?\d*$/;
  const convertedInput = formatInputNumber(input);
  return englishNumberPattern.test(convertedInput);
};

// Format large numbers with K, M suffixes
export const formatCompactNumber = (value: number): string => {
  if (isNaN(value) || value === null || value === undefined) {
    return '0';
  }
  
  if (Math.abs(value) >= 1000000) {
    return formatNumber(value / 1000000, 1) + 'M';
  }
  
  if (Math.abs(value) >= 1000) {
    return formatNumber(value / 1000, 1) + 'K';
  }
  
  return formatNumber(value, 0);
};

// Format number for display in charts (compact format)
export const formatChartNumber = (value: number): string => {
  if (Math.abs(value) >= 1000000) {
    return formatNumber(value / 1000000, 1) + 'M';
  }
  
  if (Math.abs(value) >= 1000) {
    return formatNumber(value / 1000, 0) + 'K';
  }
  
  return formatNumber(value, 0);
};