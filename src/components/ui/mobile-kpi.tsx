import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileKPIProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    direction: 'up' | 'down' | 'neutral';
    value: string;
    label?: string;
  };
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
  onClick?: () => void;
  className?: string;
}

const colorClasses = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    value: 'text-blue-900 dark:text-blue-100',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950/20',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-600 dark:text-green-400',
    value: 'text-green-900 dark:text-green-100',
  },
  yellow: {
    bg: 'bg-yellow-50 dark:bg-yellow-950/20',
    border: 'border-yellow-200 dark:border-yellow-800',
    icon: 'text-yellow-600 dark:text-yellow-400',
    value: 'text-yellow-900 dark:text-yellow-100',
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950/20',
    border: 'border-red-200 dark:border-red-800',
    icon: 'text-red-600 dark:text-red-400',
    value: 'text-red-900 dark:text-red-100',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'text-purple-600 dark:text-purple-400',
    value: 'text-purple-900 dark:text-purple-100',
  },
  gray: {
    bg: 'bg-gray-50 dark:bg-gray-950/20',
    border: 'border-gray-200 dark:border-gray-800',
    icon: 'text-gray-600 dark:text-gray-400',
    value: 'text-gray-900 dark:text-gray-100',
  },
};

const trendIcons = {
  up: '↗️',
  down: '↘️',
  neutral: '➡️',
};

const trendColors = {
  up: 'text-green-600 dark:text-green-400',
  down: 'text-red-600 dark:text-red-400',
  neutral: 'text-gray-600 dark:text-gray-400',
};

export function MobileKPI({
  title,
  value,
  subtitle,
  icon,
  trend,
  color = 'blue',
  onClick,
  className,
}: MobileKPIProps) {
  const isMobile = useIsMobile();
  const colors = colorClasses[color];

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        colors.bg,
        colors.border,
        onClick && "cursor-pointer hover:shadow-md active:scale-[0.98]",
        className
      )}
      onClick={onClick}
    >
      <CardContent className={cn(
        "p-4",
        isMobile ? "min-h-[100px]" : "min-h-[120px]"
      )}>
        <div className="flex items-start justify-between h-full">
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <p className={cn(
              "text-sm font-medium text-muted-foreground mb-1",
              isMobile && "text-xs"
            )}>
              {title}
            </p>
            
            {/* Value */}
            <p className={cn(
              "text-2xl font-bold mb-1",
              colors.value,
              isMobile && "text-xl"
            )}>
              {typeof value === 'number' ? value.toLocaleString('ar-SA') : value}
            </p>
            
            {/* Subtitle */}
            {subtitle && (
              <p className={cn(
                "text-xs text-muted-foreground",
                isMobile && "text-[11px]"
              )}>
                {subtitle}
              </p>
            )}
            
            {/* Trend */}
            {trend && (
              <div className={cn(
                "flex items-center gap-1 mt-2",
                trendColors[trend.direction]
              )}>
                <span className="text-sm">{trendIcons[trend.direction]}</span>
                <span className={cn(
                  "text-sm font-medium",
                  isMobile && "text-xs"
                )}>
                  {trend.value}
                </span>
                {trend.label && (
                  <span className={cn(
                    "text-xs text-muted-foreground",
                    isMobile && "text-[11px]"
                  )}>
                    {trend.label}
                  </span>
                )}
              </div>
            )}
          </div>
          
          {/* Icon */}
          {icon && (
            <div className={cn(
              "flex-shrink-0 ml-3",
              colors.icon,
              isMobile ? "text-lg" : "text-xl"
            )}>
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Grid container for KPI cards
export function MobileKPIGrid({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  const isMobile = useIsMobile();
  
  return (
    <div className={cn(
      "grid gap-4",
      isMobile 
        ? "grid-cols-2" // 2 columns on mobile for better readability
        : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4", // Responsive on larger screens
      className
    )}>
      {children}
    </div>
  );
}

// Specialized KPI cards for common use cases
export function SalesKPICards({
  customersContacted,
  totalMeetings,
  positiveMeetings,
  pendingMeetings,
  onCustomersClick,
}: {
  customersContacted: number;
  totalMeetings: number;
  positiveMeetings: number;
  pendingMeetings: number;
  onCustomersClick?: () => void;
}) {
  const successRate = totalMeetings > 0 ? Math.round((positiveMeetings / totalMeetings) * 100) : 0;
  
  return (
    <MobileKPIGrid>
      <MobileKPI
        title="العملاء المتصل بهم"
        value={customersContacted}
        subtitle="عميل اليوم"
        icon={<span>👥</span>}
        color="blue"
        onClick={onCustomersClick}
      />
      
      <MobileKPI
        title="إجمالي الاجتماعات"
        value={totalMeetings}
        subtitle="اجتماع"
        icon={<span>📅</span>}
        color="purple"
      />
      
      <MobileKPI
        title="الاجتماعات الإيجابية"
        value={positiveMeetings}
        subtitle={`${successRate}% معدل النجاح`}
        icon={<span>✅</span>}
        color="green"
        trend={{
          direction: positiveMeetings > 0 ? 'up' : 'neutral',
          value: `${successRate}%`,
          label: 'معدل النجاح'
        }}
      />
      
      <MobileKPI
        title="الاجتماعات المعلقة"
        value={pendingMeetings}
        subtitle="تحتاج متابعة"
        icon={<span>⏳</span>}
        color={pendingMeetings > 0 ? 'yellow' : 'gray'}
      />
    </MobileKPIGrid>
  );
}

export function OperationsKPICards({
  totalOperations,
  completedOperations,
  inProgressOperations,
  pendingOperations,
}: {
  totalOperations: number;
  completedOperations: number;
  inProgressOperations: number;
  pendingOperations: number;
}) {
  const completionRate = totalOperations > 0 ? Math.round((completedOperations / totalOperations) * 100) : 0;
  
  return (
    <MobileKPIGrid>
      <MobileKPI
        title="إجمالي العمليات"
        value={totalOperations}
        subtitle="عملية"
        icon={<span>⚙️</span>}
        color="blue"
      />
      
      <MobileKPI
        title="العمليات المكتملة"
        value={completedOperations}
        subtitle={`${completionRate}% معدل الإنجاز`}
        icon={<span>✅</span>}
        color="green"
        trend={{
          direction: completedOperations > 0 ? 'up' : 'neutral',
          value: `${completionRate}%`
        }}
      />
      
      <MobileKPI
        title="قيد التنفيذ"
        value={inProgressOperations}
        subtitle="عملية نشطة"
        icon={<span>🔄</span>}
        color="yellow"
      />
      
      <MobileKPI
        title="في الانتظار"
        value={pendingOperations}
        subtitle="تحتاج بدء"
        icon={<span>⏸️</span>}
        color={pendingOperations > 0 ? 'red' : 'gray'}
      />
    </MobileKPIGrid>
  );
}
