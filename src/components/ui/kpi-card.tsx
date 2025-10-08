import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Accent = 'primary' | 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'muted';

const accentText: Record<Accent, string> = {
  primary: 'text-primary',
  blue: 'text-blue-600 dark:text-blue-300',
  green: 'text-green-600 dark:text-green-300',
  purple: 'text-purple-600 dark:text-purple-300',
  yellow: 'text-yellow-600 dark:text-yellow-300',
  red: 'text-red-600 dark:text-red-300',
  muted: 'text-muted-foreground',
};

export interface KpiCardProps {
  title: React.ReactNode;
  value: React.ReactNode;
  icon?: React.ReactNode;
  accent?: Accent;
  className?: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, accent = 'primary', className }) => {
  return (
    <Card className={cn('border border-border-strong bg-background-secondary', className)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          {icon}
          <div>
            <p className={cn('text-sm', accentText[accent])}>{title}</p>
            <p className={cn('text-2xl font-bold', accent === 'muted' ? 'text-foreground' : accentText[accent])}>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

KpiCard.displayName = 'KpiCard';


