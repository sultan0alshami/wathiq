import { useState, useEffect } from 'react';

export interface LocalStorageHook<T> {
  value: T;
  setValue: (value: T) => void;
  clearValue: () => void;
}

export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): LocalStorageHook<T> => {
  // Get value from localStorage or use initial value
  const [value, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when value changes
  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Clear value from localStorage
  const clearValue = () => {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  };

  return {
    value,
    setValue,
    clearValue,
  };
};

// Helper functions for date-specific storage
export const getDateStorageKey = (baseKey: string, date: Date): string => {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
  return `${baseKey}_${dateStr}`;
};

export const useDataWithDate = <T>(
  baseKey: string,
  currentDate: Date,
  initialValue: T,
  setDataLoading?: (isLoading: boolean) => void // Add setDataLoading callback
) => {
  const dateKey = getDateStorageKey(baseKey, currentDate);
  const [value, setStoredValue, clearValue] = useLocalStorage(dateKey, initialValue);

  // When currentDate changes, we need to potentially load new data
  useEffect(() => {
    if (setDataLoading) setDataLoading(true); // Indicate loading has started
    try {
      const item = window.localStorage.getItem(dateKey);
      const newValue = item ? JSON.parse(item) : initialValue;
      if (JSON.stringify(newValue) !== JSON.stringify(value)) {
        setStoredValue(newValue);
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${dateKey}" in useDataWithDate:`, error);
    } finally {
      if (setDataLoading) setDataLoading(false); // Indicate loading has finished
    }
  }, [dateKey, initialValue, setDataLoading, setStoredValue]);

  return {
    value,
    setValue: setStoredValue,
    clearValue,
  };
};