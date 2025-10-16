import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PageLoadingProps {
  className?: string;
  message?: string;
}

export function PageLoading({ 
  className, 
  message = "جاري التحميل..." 
}: PageLoadingProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center min-h-[400px] space-y-4",
      className
    )}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

// Specialized loading components for different page types
export function DashboardLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
      </div>
      
      {/* KPI cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 bg-muted rounded-lg animate-pulse" />
        ))}
      </div>
      
      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-64 bg-muted rounded-lg animate-pulse" />
        <div className="h-64 bg-muted rounded-lg animate-pulse" />
      </div>
    </div>
  );
}

export function TablePageLoading() {
  return (
    <div className="space-y-6 p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-muted rounded animate-pulse" />
        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
      </div>
      
      {/* Table skeleton */}
      <div className="space-y-3">
        {/* Header */}
        <div className="flex space-x-2 rtl:space-x-reverse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 flex-1 bg-muted rounded animate-pulse" />
          ))}
        </div>
        
        {/* Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex space-x-2 rtl:space-x-reverse">
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="h-4 flex-1 bg-muted rounded animate-pulse" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
