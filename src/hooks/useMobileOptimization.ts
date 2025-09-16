import { useState, useEffect, useCallback } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

// Touch gesture detection
export function useTouchGestures() {
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [touchEnd, setTouchEnd] = useState<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const touch = e.changedTouches[0];
    setTouchEnd({ x: touch.clientX, y: touch.clientY });
  }, []);

  const getSwipeDirection = useCallback(() => {
    if (!touchStart || !touchEnd) return null;

    const deltaX = touchEnd.x - touchStart.x;
    const deltaY = touchEnd.y - touchStart.y;
    const minSwipeDistance = 50;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > minSwipeDistance) {
      return deltaX > 0 ? 'right' : 'left';
    }
    
    if (Math.abs(deltaY) > minSwipeDistance) {
      return deltaY > 0 ? 'down' : 'up';
    }

    return null;
  }, [touchStart, touchEnd]);

  return {
    handleTouchStart,
    handleTouchEnd,
    getSwipeDirection,
    touchStart,
    touchEnd
  };
}

// Mobile-optimized pagination
export function useMobilePagination<T>(items: T[], itemsPerPage: number = 10) {
  const isMobile = useIsMobile();
  const [currentPage, setCurrentPage] = useState(1);
  
  const mobileItemsPerPage = isMobile ? Math.max(5, Math.floor(itemsPerPage / 2)) : itemsPerPage;
  const totalPages = Math.ceil(items.length / mobileItemsPerPage);
  
  const paginatedItems = items.slice(
    (currentPage - 1) * mobileItemsPerPage,
    currentPage * mobileItemsPerPage
  );

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  }, [currentPage]);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    goToPage,
    nextPage,
    prevPage,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    itemsPerPage: mobileItemsPerPage
  };
}

// Mobile viewport detection
export function useMobileViewport() {
  const [viewportSize, setViewportSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>(
    window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
  );

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setViewportSize({ width, height });
      setOrientation(height > width ? 'portrait' : 'landscape');
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = useIsMobile();
  const isTablet = viewportSize.width >= 768 && viewportSize.width < 1024;
  const isDesktop = viewportSize.width >= 1024;

  return {
    viewportSize,
    orientation,
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen: viewportSize.width < 640,
    isMediumScreen: viewportSize.width >= 640 && viewportSize.width < 1024,
    isLargeScreen: viewportSize.width >= 1024
  };
}

// Mobile-friendly data display
export function useMobileDataDisplay<T>(data: T[]) {
  const { isMobile, isTablet } = useMobileViewport();
  
  const getDisplayColumns = useCallback((allColumns: string[]) => {
    if (isMobile) {
      // Show only most important columns on mobile
      return allColumns.slice(0, 2);
    }
    if (isTablet) {
      // Show more columns on tablet
      return allColumns.slice(0, 4);
    }
    // Show all columns on desktop
    return allColumns;
  }, [isMobile, isTablet]);

  const getItemDisplayMode = useCallback(() => {
    if (isMobile) return 'card';
    if (isTablet) return 'compact-table';
    return 'full-table';
  }, [isMobile, isTablet]);

  return {
    getDisplayColumns,
    getItemDisplayMode,
    shouldUseCards: isMobile,
    shouldUseCompactTable: isTablet,
    shouldUseFullTable: !isMobile && !isTablet
  };
}