import { useState, useMemo } from 'react';

export interface SearchOptions {
  keys?: string[];
}

export function useSearch<T>(
  items: T[],
  searchTerm: string,
  options: SearchOptions = {}
) {
  const { keys = [] } = options;

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) {
      return items;
    }

    const search = searchTerm.toLowerCase().trim();
    
    return items.filter((item) => {
      // If no keys specified, search in all string/number properties
      if (keys.length === 0) {
        for (const prop in item) {
          if (Object.prototype.hasOwnProperty.call(item, prop)) {
            const value = (item as any)[prop];
            if (typeof value === 'string' && value.toLowerCase().includes(search)) {
              return true;
            }
            if (typeof value === 'number' && value.toString().includes(search)) {
              return true;
            }
          }
        }
        return false;
      }

      // Search in specified keys
      return keys.some((key) => {
        const value = getNestedValue(item, key);
        if (typeof value === 'string') {
          return value.toLowerCase().includes(search);
        }
        if (typeof value === 'number') {
          return value.toString().includes(search);
        }
        return false;
      });
    });
  }, [items, searchTerm, keys]);

  return filteredItems;
}

// Helper function to get nested object values using dot notation
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, key) => current?.[key], obj);
}

export function useAdvancedSearch<T>(items: T[], dateKey?: string) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchKeys, setSearchKeys] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });

  const filteredItemsBySearch = useSearch(items, searchTerm, { keys: searchKeys });
  const filteredItems = useMemo(() => {
    if (!dateRange.start && !dateRange.end) {
      return filteredItemsBySearch;
    }

    return filteredItemsBySearch.filter(item => {
      if (!dateKey) return true; // No date key provided, so no date filtering

      const itemDateValue = getNestedValue(item, dateKey);
      if (!itemDateValue) return false; // Item has no date value for the specified key

      const itemDate = new Date(itemDateValue);
      if (isNaN(itemDate.getTime())) return false; // Invalid date format

      let matchesStart = true;
      if (dateRange.start) {
        matchesStart = itemDate >= dateRange.start;
      }

      let matchesEnd = true;
      if (dateRange.end) {
        // To include the end date, set the time to the end of the day
        const endOfDay = new Date(dateRange.end);
        endOfDay.setHours(23, 59, 59, 999);
        matchesEnd = itemDate <= endOfDay;
      }

      return matchesStart && matchesEnd;
    });
  }, [filteredItemsBySearch, dateRange, dateKey]);

  const clearSearch = () => {
    setSearchTerm('');
    setSearchKeys([]);
    setDateRange({ start: null, end: null });
  };

  return {
    searchTerm,
    setSearchTerm,
    searchKeys,
    setSearchKeys,
    dateRange,
    setDateRange,
    filteredItems,
    clearSearch,
    hasActiveFilters: searchTerm.trim() !== '' || searchKeys.length > 0 || dateRange.start || dateRange.end
  };
}