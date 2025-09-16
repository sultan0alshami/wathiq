import { useCallback, useMemo, useRef, useEffect, useState } from 'react';

// Debounce hook for search and input operations
export function useDebounce<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<NodeJS.Timeout>();

  return useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
}

// Throttle hook for scroll and resize events
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): (...args: Parameters<T>) => void {
  const lastCallRef = useRef<number>(0);

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCallRef.current >= delay) {
      lastCallRef.current = now;
      callback(...args);
    }
  }, [callback, delay]);
}

// Memoized calculations for charts and data processing
export function useMemoizedCalculations<T, R>(
  data: T[],
  calculator: (data: T[]) => R,
  dependencies: any[] = []
): R {
  return useMemo(() => {
    if (!data || data.length === 0) {
      return calculator([]);
    }
    return calculator(data);
  }, [data, ...dependencies]);
}

// Virtualization helper for large lists
export function useVirtualization(
  itemCount: number,
  itemHeight: number,
  containerHeight: number
) {
  const [scrollTop, setScrollTopState] = useState(0);
  
  const visibleItems = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight) + 1,
      itemCount
    );
    
    return {
      startIndex: Math.max(0, startIndex),
      endIndex,
      totalHeight: itemCount * itemHeight
    };
  }, [scrollTop, itemHeight, containerHeight, itemCount]);

  const setScrollTop = useCallback((newScrollTop: number) => {
    setScrollTopState(newScrollTop);
  }, []);

  return { visibleItems, setScrollTop };
}

// Performance monitoring hook
export function usePerformanceMonitor(componentName: string) {
  const renderCountRef = useRef(0);
  const lastRenderTimeRef = useRef(Date.now());

  useEffect(() => {
    renderCountRef.current += 1;
    const now = Date.now();
    const timeSinceLastRender = now - lastRenderTimeRef.current;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${componentName}] Render #${renderCountRef.current}, Time since last: ${timeSinceLastRender}ms`);
    }
    
    lastRenderTimeRef.current = now;
  });

  const logPerformance = useCallback((operation: string, startTime: number) => {
    const duration = Date.now() - startTime;
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${componentName}] ${operation} took ${duration}ms`);
    }
  }, [componentName]);

  return { renderCount: renderCountRef.current, logPerformance };
}

// Optimized event handlers
export function useOptimizedHandlers() {
  const createHandler = useCallback(<T extends any[]>(
    handler: (...args: T) => void,
    dependencies: any[] = []
  ) => {
    return useCallback(handler, dependencies);
  }, []);

  const createMemoizedValue = useCallback(<T>(
    factory: () => T,
    dependencies: any[]
  ) => {
    return useMemo(factory, dependencies);
  }, []);

  return { createHandler, createMemoizedValue };
}