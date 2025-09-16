import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronLeft, Calendar } from 'lucide-react';
import { useDateContext } from '@/contexts/DateContext';
import { cn } from '@/lib/utils';

export const DateTabs: React.FC = () => {
  const { currentDate, getDateTabs, navigateToDate, navigatePrevious, navigateNext, formatDate, isToday } = useDateContext();
  const dateTabs = getDateTabs();

  const formatTabDate = (date: Date): string => {
    if (isToday(date)) return 'اليوم';
    
    const arabicDays = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    const dayName = arabicDays[date.getDay()];
    const dayNumber = date.getDate();
    
    return `${dayName} ${dayNumber}`;
  };

  return (
    <div className="flex items-center gap-2 bg-card border border-border-strong rounded-lg p-1">
      {/* Previous Day Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={navigatePrevious}
        className="h-8 w-8 p-0 hover:bg-secondary"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      {/* Date Tabs */}
      <div className="flex gap-1">
        {dateTabs.map((date) => {
          const isSelected = formatDate(currentDate) === formatDate(date);
          const isCurrentDay = isToday(date);

          return (
            <Button
              key={formatDate(date)}
              variant={isSelected ? "default" : "ghost"}
              size="sm"
              onClick={() => navigateToDate(date)}
              className={cn(
                "px-3 py-1 h-8 text-xs font-medium transition-all",
                isSelected && "bg-wathiq-primary text-white shadow-sm",
                !isSelected && "hover:bg-secondary text-foreground",
                isCurrentDay && !isSelected && "bg-wathiq-accent/10 text-wathiq-accent border border-wathiq-accent/20"
              )}
            >
              <Calendar className="h-3 w-3 ml-1" />
              {formatTabDate(date)}
            </Button>
          );
        })}
      </div>

      {/* Next Day Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={navigateNext}
        className="h-8 w-8 p-0 hover:bg-secondary"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
    </div>
  );
};