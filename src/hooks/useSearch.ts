import { useState, useMemo } from 'react';

export interface SearchOptions {
  keys?: string[];
  threshold?: number;
  includeScore?: boolean;
}

export function useSearch<T>(
  items: T[],
  searchTerm: string,
  options: SearchOptions = {}
) {
  const { keys = [], threshold = 0.3 } = options;

  const filteredItems = useMemo(() => {
    if (!searchTerm.trim()) {
      return items;
    }

    const search = searchTerm.toLowerCase().trim();
    
    return items.filter((item) => {
      // If no keys specified, search in all string properties
      if (keys.length === 0) {
        const itemString = JSON.stringify(item).toLowerCase();
        return itemString.includes(search);
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

export function useAdvancedSearch<T>(items: T[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchKeys, setSearchKeys] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({
    start: null,
    end: null
  });

  const filteredItems = useSearch(items, searchTerm, { keys: searchKeys });

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