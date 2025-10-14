import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface MobileTableColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  priority: 'high' | 'medium' | 'low'; // high = always show, medium = show on tablet+, low = desktop only
}

interface MobileTableProps<T> {
  data: T[];
  columns: MobileTableColumn<T>[];
  onRowClick?: (item: T) => void;
  onRowAction?: (item: T, action: string) => void;
  actions?: Array<{
    key: string;
    label: string;
    variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
    icon?: React.ReactNode;
  }>;
  emptyMessage?: string;
  className?: string;
}

export function MobileTable<T extends { id: string }>({
  data,
  columns,
  onRowClick,
  onRowAction,
  actions = [],
  emptyMessage = 'لا توجد بيانات',
  className
}: MobileTableProps<T>) {
  const isMobile = useIsMobile();

  // Filter columns based on screen size and priority
  const visibleColumns = React.useMemo(() => {
    if (isMobile) {
      return columns.filter(col => col.priority === 'high');
    }
    return columns.filter(col => col.priority !== 'low');
  }, [columns, isMobile]);

  if (data.length === 0) {
    return (
      <Card className={cn("w-full", className)}>
        <CardContent className="flex items-center justify-center py-8">
          <p className="text-muted-foreground text-center">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  // Mobile card layout
  if (isMobile) {
    return (
      <div className={cn("space-y-3", className)}>
        {data.map((item) => (
          <Card 
            key={item.id} 
            className={cn(
              "w-full transition-all duration-200",
              onRowClick && "cursor-pointer hover:shadow-md active:scale-[0.98]"
            )}
            onClick={() => onRowClick?.(item)}
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                {/* Primary content - high priority columns */}
                {visibleColumns.map((column) => {
                  const value = item[column.key];
                  const renderedValue = column.render ? column.render(value, item) : String(value);
                  
                  return (
                    <div key={String(column.key)} className="flex justify-between items-start gap-2">
                      <span className="text-sm font-medium text-muted-foreground min-w-0 flex-shrink-0">
                        {column.label}:
                      </span>
                      <div className="text-sm text-right flex-1 min-w-0">
                        {renderedValue}
                      </div>
                    </div>
                  );
                })}
                
                {/* Actions */}
                {actions.length > 0 && (
                  <div className="flex gap-2 pt-2 border-t border-border">
                    {actions.map((action) => (
                      <Button
                        key={action.key}
                        variant={action.variant || 'outline'}
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRowAction?.(item, action.key);
                        }}
                        className="flex-1 min-h-[44px]" // Touch-friendly height
                      >
                        {action.icon && <span className="mr-1">{action.icon}</span>}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Desktop/tablet table layout
  return (
    <Card className={cn("w-full", className)}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {visibleColumns.map((column) => (
                <th
                  key={String(column.key)}
                  className="text-right p-4 font-medium text-muted-foreground"
                >
                  {column.label}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="text-right p-4 font-medium text-muted-foreground">
                  الإجراءات
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr
                key={item.id}
                className={cn(
                  "border-b border-border transition-colors",
                  onRowClick && "cursor-pointer hover:bg-muted/50"
                )}
                onClick={() => onRowClick?.(item)}
              >
                {visibleColumns.map((column) => {
                  const value = item[column.key];
                  const renderedValue = column.render ? column.render(value, item) : String(value);
                  
                  return (
                    <td key={String(column.key)} className="p-4 text-sm">
                      {renderedValue}
                    </td>
                  );
                })}
                {actions.length > 0 && (
                  <td className="p-4">
                    <div className="flex gap-2">
                      {actions.map((action) => (
                        <Button
                          key={action.key}
                          variant={action.variant || 'outline'}
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onRowAction?.(item, action.key);
                          }}
                        >
                          {action.icon && <span className="mr-1">{action.icon}</span>}
                          {action.label}
                        </Button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// Specialized mobile table for common use cases
export function MobileSalesTable({ meetings, onDelete }: { 
  meetings: any[]; 
  onDelete: (id: string) => void; 
}) {
  const columns: MobileTableColumn<any>[] = [
    {
      key: 'customerName',
      label: 'العميل',
      priority: 'high',
    },
    {
      key: 'contactNumber',
      label: 'جهة الاتصال',
      priority: 'high',
    },
    {
      key: 'phoneNumber',
      label: 'رقم الهاتف',
      priority: 'medium',
    },
    {
      key: 'meetingTime',
      label: 'وقت الاجتماع',
      priority: 'medium',
      render: (value) => new Date(value).toLocaleTimeString('ar-EG', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
    },
    {
      key: 'outcome',
      label: 'النتيجة',
      priority: 'high',
      render: (value) => {
        const variants = {
          positive: 'bg-green-50 text-green-700 border-green-200',
          negative: 'bg-red-50 text-red-700 border-red-200',
          pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        };
        const labels = {
          positive: 'إيجابية',
          negative: 'سلبية',
          pending: 'معلقة',
        };
        return (
          <Badge variant="outline" className={variants[value as keyof typeof variants]}>
            {labels[value as keyof typeof labels]}
          </Badge>
        );
      },
    },
  ];

  const actions = [
    {
      key: 'delete',
      label: 'حذف',
      variant: 'destructive' as const,
      icon: <span className="w-4 h-4">🗑️</span>,
    },
  ];

  return (
    <MobileTable
      data={meetings}
      columns={columns}
      actions={actions}
      onRowAction={(item, action) => {
        if (action === 'delete') {
          onDelete(item.id);
        }
      }}
      emptyMessage="لا توجد اجتماعات مسجلة"
    />
  );
}
