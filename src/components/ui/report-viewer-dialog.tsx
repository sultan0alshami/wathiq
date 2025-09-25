import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { DailyData } from '@/lib/mockData';
import { formatCurrency } from '@/lib/numberUtils';
import { format } from 'date-fns';
import { ARABIC_REPORT_VIEWER_MESSAGES } from '@/lib/arabicReportViewerMessages'; // Added import
import { ReportSectionType } from '@/pages/Reports'; // Added import

interface ReportViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: DailyData | null;
  section: ReportSectionType | 'merged'; // Use the union type here
  date: Date;
}

const BADGE_INFO_MAP = {
  financeEntryType: {
    income: { variant: 'default' as const, text: ARABIC_REPORT_VIEWER_MESSAGES.FINANCE_ENTRY_TYPE_INCOME },
    expense: { variant: 'destructive' as const, text: ARABIC_REPORT_VIEWER_MESSAGES.FINANCE_ENTRY_TYPE_EXPENSE },
    deposit: { variant: 'secondary' as const, text: ARABIC_REPORT_VIEWER_MESSAGES.FINANCE_ENTRY_TYPE_DEPOSIT },
  },
  salesOutcome: {
    positive: { variant: 'default' as const, text: ARABIC_REPORT_VIEWER_MESSAGES.SALES_OUTCOME_POSITIVE },
    negative: { variant: 'destructive' as const, text: ARABIC_REPORT_VIEWER_MESSAGES.SALES_OUTCOME_NEGATIVE },
    pending: { variant: 'secondary' as const, text: ARABIC_REPORT_VIEWER_MESSAGES.SALES_OUTCOME_PENDING },
  },
  operationsStatus: {
    completed: { variant: 'default' as const, text: ARABIC_REPORT_VIEWER_MESSAGES.OPERATIONS_STATUS_COMPLETED },
    'in-progress': { variant: 'secondary' as const, text: ARABIC_REPORT_VIEWER_MESSAGES.OPERATIONS_STATUS_IN_PROGRESS },
    pending: { variant: 'outline' as const, text: ARABIC_REPORT_VIEWER_MESSAGES.OPERATIONS_STATUS_PENDING },
  },
  operationsPriority: {
    high: { variant: 'destructive' as const, text: ARABIC_REPORT_VIEWER_MESSAGES.OPERATIONS_PRIORITY_HIGH },
    medium: { variant: 'secondary' as const, text: ARABIC_REPORT_VIEWER_MESSAGES.OPERATIONS_PRIORITY_MEDIUM },
    low: { variant: 'outline' as const, text: ARABIC_REPORT_VIEWER_MESSAGES.OPERATIONS_PRIORITY_LOW },
  },
  marketingStatus: {
    completed: { variant: 'default' as const, text: ARABIC_REPORT_VIEWER_MESSAGES.MARKETING_STATUS_COMPLETED },
    'in-progress': { variant: 'secondary' as const, text: ARABIC_REPORT_VIEWER_MESSAGES.MARKETING_STATUS_IN_PROGRESS },
    planned: { variant: 'outline' as const, text: ARABIC_REPORT_VIEWER_MESSAGES.MARKETING_STATUS_PLANNED },
  },
  marketingPriority: {
    high: { variant: 'destructive' as const, text: ARABIC_REPORT_VIEWER_MESSAGES.MARKETING_PRIORITY_HIGH },
    medium: { variant: 'secondary' as const, text: ARABIC_REPORT_VIEWER_MESSAGES.MARKETING_PRIORITY_MEDIUM },
    low: { variant: 'outline' as const, text: ARABIC_REPORT_VIEWER_MESSAGES.MARKETING_PRIORITY_LOW },
  },
};

export const ReportViewerDialog: React.FC<ReportViewerDialogProps> = ({
  open,
  onOpenChange,
  data,
  section,
  date
}) => {
  if (!data) return null;

  type BadgeVariant = 'default' | 'destructive' | 'secondary' | 'outline';

  // Helper function to get badge variant and text
  const getBadgeInfo = (type: keyof typeof BADGE_INFO_MAP, value?: string): { variant: BadgeVariant; text: string } => {
    const categoryMap = BADGE_INFO_MAP[type];
    if (categoryMap && value && categoryMap[value as keyof typeof categoryMap]) {
      return categoryMap[value as keyof typeof categoryMap] as { variant: BadgeVariant; text: string };
    }
    return { variant: 'secondary', text: '' };
  };

  const getSectionData = () => {
    switch (section) {
      case 'finance':
        return {
          title: ARABIC_REPORT_VIEWER_MESSAGES.FINANCE_REPORT_TITLE,
          content: (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{ARABIC_REPORT_VIEWER_MESSAGES.FINANCE_SUMMARY_TITLE}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{ARABIC_REPORT_VIEWER_MESSAGES.FINANCE_CURRENT_LIQUIDITY}</p>
                      <p className="text-2xl font-bold text-success">{formatCurrency(data.finance.currentLiquidity)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{ARABIC_REPORT_VIEWER_MESSAGES.FINANCE_TOTAL_OPERATIONS}</p>
                      <p className="text-2xl font-bold">{data.finance.entries.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{ARABIC_REPORT_VIEWER_MESSAGES.FINANCE_OPERATIONS_TITLE}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">{ARABIC_REPORT_VIEWER_MESSAGES.FINANCE_TABLE_HEADER_TYPE}</TableHead>
                        <TableHead className="text-right">{ARABIC_REPORT_VIEWER_MESSAGES.FINANCE_TABLE_HEADER_TITLE}</TableHead>
                        <TableHead className="text-right">{ARABIC_REPORT_VIEWER_MESSAGES.FINANCE_TABLE_HEADER_AMOUNT}</TableHead>
                        <TableHead className="text-right">{ARABIC_REPORT_VIEWER_MESSAGES.FINANCE_TABLE_HEADER_CATEGORY}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.finance.entries.map((entry) => {
                        // Using entry.id if available, otherwise fallback to a generated one or index with caution
                        const key = entry.id || `${entry.title}-${entry.amount}`;
                        const { variant, text } = getBadgeInfo('financeEntryType', entry.type);
                        return (
                          <TableRow key={key}>
                            <TableCell>
                              <Badge variant={variant}>{text}</Badge>
                            </TableCell>
                            <TableCell>{entry.title}</TableCell>
                            <TableCell className="font-bold">{formatCurrency(entry.amount)}</TableCell>
                            <TableCell>{entry.category}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )
        };
      
      case 'sales':
        return {
          title: ARABIC_REPORT_VIEWER_MESSAGES.SALES_REPORT_TITLE,
          content: (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{ARABIC_REPORT_VIEWER_MESSAGES.SALES_SUMMARY_TITLE}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{ARABIC_REPORT_VIEWER_MESSAGES.SALES_CUSTOMERS_CONTACTED}</p>
                      <p className="text-2xl font-bold text-primary">{data.sales.customersContacted}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{ARABIC_REPORT_VIEWER_MESSAGES.SALES_MEETINGS}</p>
                      <p className="text-2xl font-bold">{data.sales.entries.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{ARABIC_REPORT_VIEWER_MESSAGES.SALES_MEETINGS_TITLE}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">{ARABIC_REPORT_VIEWER_MESSAGES.SALES_TABLE_HEADER_CUSTOMER_NAME}</TableHead>
                        <TableHead className="text-right">{ARABIC_REPORT_VIEWER_MESSAGES.SALES_TABLE_HEADER_PHONE_NUMBER}</TableHead>
                        <TableHead className="text-right">{ARABIC_REPORT_VIEWER_MESSAGES.SALES_TABLE_HEADER_OUTCOME}</TableHead>
                        <TableHead className="text-right">{ARABIC_REPORT_VIEWER_MESSAGES.SALES_TABLE_HEADER_NOTES}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.sales.entries.map((entry) => {
                        const key = entry.id || `${entry.customerName}-${entry.meetingDate}`;
                        const { variant, text } = getBadgeInfo('salesOutcome', entry.outcome);
                        return (
                          <TableRow key={key}>
                            <TableCell className="font-medium">{entry.customerName}</TableCell>
                            <TableCell>{entry.contactNumber}</TableCell>
                            <TableCell>
                              <Badge variant={variant}>{text}</Badge>
                            </TableCell>
                            <TableCell>{entry.notes}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              {data.sales.dailySummary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">{ARABIC_REPORT_VIEWER_MESSAGES.SALES_DAILY_SUMMARY_TITLE}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{data.sales.dailySummary}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )
        };
      
      case 'operations':
        return {
          title: ARABIC_REPORT_VIEWER_MESSAGES.OPERATIONS_REPORT_TITLE,
          content: (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{ARABIC_REPORT_VIEWER_MESSAGES.OPERATIONS_SUMMARY_TITLE}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{ARABIC_REPORT_VIEWER_MESSAGES.OPERATIONS_TOTAL_OPERATIONS}</p>
                      <p className="text-2xl font-bold text-primary">{data.operations.totalOperations}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{ARABIC_REPORT_VIEWER_MESSAGES.OPERATIONS_EXPECTED_TOMORROW}</p>
                      <p className="text-2xl font-bold">{data.operations.expectedNextDay}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{ARABIC_REPORT_VIEWER_MESSAGES.OPERATIONS_LIST_TITLE}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">{ARABIC_REPORT_VIEWER_MESSAGES.OPERATIONS_TABLE_HEADER_TASK}</TableHead>
                        <TableHead className="text-right">{ARABIC_REPORT_VIEWER_MESSAGES.OPERATIONS_TABLE_HEADER_STATUS}</TableHead>
                        <TableHead className="text-right">{ARABIC_REPORT_VIEWER_MESSAGES.OPERATIONS_TABLE_HEADER_OWNER}</TableHead>
                        <TableHead className="text-right">{ARABIC_REPORT_VIEWER_MESSAGES.OPERATIONS_TABLE_HEADER_PRIORITY}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.operations.entries.map((entry) => {
                        const key = entry.id || `${entry.task}-${entry.owner}`;
                        const { variant: statusVariant, text: statusText } = getBadgeInfo('operationsStatus', entry.status);
                        const { variant: priorityVariant, text: priorityText } = getBadgeInfo('operationsPriority', entry.priority);
                        return (
                          <TableRow key={key}>
                            <TableCell className="font-medium">{entry.task}</TableCell>
                            <TableCell>
                              <Badge variant={statusVariant}>{statusText}</Badge>
                            </TableCell>
                            <TableCell>{entry.owner}</TableCell>
                            <TableCell>
                              <Badge variant={priorityVariant}>{priorityText}</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )
        };
      
      case 'marketing':
        return {
          title: ARABIC_REPORT_VIEWER_MESSAGES.MARKETING_REPORT_TITLE,
          content: (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{ARABIC_REPORT_VIEWER_MESSAGES.MARKETING_SUMMARY_TITLE}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{ARABIC_REPORT_VIEWER_MESSAGES.MARKETING_TOTAL_TASKS}</p>
                      <p className="text-2xl font-bold text-primary">{data.marketing.tasks.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{ARABIC_REPORT_VIEWER_MESSAGES.MARKETING_COMPLETED_TASKS}</p>
                      <p className="text-2xl font-bold text-success">{data.marketing.tasks.filter(t => t.status === 'completed').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{ARABIC_REPORT_VIEWER_MESSAGES.MARKETING_TASKS_TITLE}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">{ARABIC_REPORT_VIEWER_MESSAGES.MARKETING_TABLE_HEADER_TITLE}</TableHead>
                        <TableHead className="text-right">{ARABIC_REPORT_VIEWER_MESSAGES.MARKETING_TABLE_HEADER_STATUS}</TableHead>
                        <TableHead className="text-right">{ARABIC_REPORT_VIEWER_MESSAGES.MARKETING_TABLE_HEADER_ASSIGNEE}</TableHead>
                        <TableHead className="text-right">{ARABIC_REPORT_VIEWER_MESSAGES.MARKETING_TABLE_HEADER_PRIORITY}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.marketing.tasks.map((task) => {
                        const key = task.id || `${task.title}-${task.assignee}`;
                        const { variant: statusVariant, text: statusText } = getBadgeInfo('marketingStatus', task.status);
                        const { variant: priorityVariant, text: priorityText } = getBadgeInfo('marketingPriority', task.priority);
                        return (
                          <TableRow key={key}>
                            <TableCell className="font-medium">{task.title}</TableCell>
                            <TableCell>
                              <Badge variant={statusVariant}>{statusText}</Badge>
                            </TableCell>
                            <TableCell>{task.assignee}</TableCell>
                            <TableCell>
                              <Badge variant={priorityVariant}>{priorityText}</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )
        };
      
      default:
        console.warn(`Unknown section provided to ReportViewerDialog: ${section}`);
        return {
          title: ARABIC_REPORT_VIEWER_MESSAGES.UNDEFINED_REPORT_TITLE,
          content: <p>{ARABIC_REPORT_VIEWER_MESSAGES.NO_DATA_AVAILABLE}</p>
        };
    }
  };

  const sectionData = getSectionData();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{sectionData.title}</DialogTitle>
          <DialogDescription>
            {ARABIC_REPORT_VIEWER_MESSAGES.REPORT_DATE_PREFIX} {format(date, 'dd/MM/yyyy')}
          </DialogDescription>
        </DialogHeader>
        <Separator />
        <div className="mt-4">
          {sectionData.content}
        </div>
      </DialogContent>
    </Dialog>
  );
};