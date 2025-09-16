import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { DailyData } from '@/lib/mockData';
import { formatCurrency, formatNumber } from '@/lib/numberUtils';
import { format } from 'date-fns';

interface ReportViewerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: DailyData | null;
  section: string;
  date: Date;
}

export const ReportViewerDialog: React.FC<ReportViewerDialogProps> = ({
  open,
  onOpenChange,
  data,
  section,
  date
}) => {
  if (!data) return null;

  const getSectionData = () => {
    switch (section) {
      case 'المالية':
        return {
          title: 'تقرير المالية اليومي',
          content: (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ملخص مالي</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">السيولة الحالية</p>
                      <p className="text-2xl font-bold text-success">{formatCurrency(data.finance.currentLiquidity)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">إجمالي العمليات</p>
                      <p className="text-2xl font-bold">{data.finance.entries.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">العمليات المالية</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">النوع</TableHead>
                        <TableHead className="text-right">العنوان</TableHead>
                        <TableHead className="text-right">المبلغ</TableHead>
                        <TableHead className="text-right">الفئة</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.finance.entries.map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Badge variant={entry.type === 'income' ? 'default' : entry.type === 'expense' ? 'destructive' : 'secondary'}>
                              {entry.type === 'income' ? 'إيراد' : entry.type === 'expense' ? 'مصروف' : 'إيداع'}
                            </Badge>
                          </TableCell>
                          <TableCell>{entry.title}</TableCell>
                          <TableCell className="font-bold">{formatCurrency(entry.amount)}</TableCell>
                          <TableCell>{entry.category}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )
        };
      
      case 'المبيعات':
        return {
          title: 'تقرير المبيعات اليومي',
          content: (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ملخص المبيعات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">العملاء المتصل بهم</p>
                      <p className="text-2xl font-bold text-primary">{data.sales.customersContacted}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">الاجتماعات</p>
                      <p className="text-2xl font-bold">{data.sales.entries.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">الاجتماعات</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">اسم العميل</TableHead>
                        <TableHead className="text-right">رقم الهاتف</TableHead>
                        <TableHead className="text-right">النتيجة</TableHead>
                        <TableHead className="text-right">الملاحظات</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.sales.entries.map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{entry.customerName}</TableCell>
                          <TableCell>{entry.contactNumber}</TableCell>
                          <TableCell>
                            <Badge variant={entry.outcome === 'positive' ? 'default' : entry.outcome === 'negative' ? 'destructive' : 'secondary'}>
                              {entry.outcome === 'positive' ? 'إيجابي' : entry.outcome === 'negative' ? 'سلبي' : 'في الانتظار'}
                            </Badge>
                          </TableCell>
                          <TableCell>{entry.notes}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
              
              {data.sales.dailySummary && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">ملخص اليوم</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{data.sales.dailySummary}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          )
        };
      
      case 'العمليات':
        return {
          title: 'تقرير العمليات اليومي',
          content: (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ملخص العمليات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">إجمالي العمليات</p>
                      <p className="text-2xl font-bold text-primary">{data.operations.totalOperations}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">المتوقع غداً</p>
                      <p className="text-2xl font-bold">{data.operations.expectedNextDay}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">قائمة العمليات</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">المهمة</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">المسؤول</TableHead>
                        <TableHead className="text-right">الأولوية</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.operations.entries.map((entry, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{entry.task}</TableCell>
                          <TableCell>
                            <Badge variant={entry.status === 'completed' ? 'default' : entry.status === 'in-progress' ? 'secondary' : 'outline'}>
                              {entry.status === 'completed' ? 'مكتمل' : entry.status === 'in-progress' ? 'قيد التنفيذ' : 'في الانتظار'}
                            </Badge>
                          </TableCell>
                          <TableCell>{entry.owner}</TableCell>
                          <TableCell>
                            <Badge variant={entry.priority === 'high' ? 'destructive' : entry.priority === 'medium' ? 'secondary' : 'outline'}>
                              {entry.priority === 'high' ? 'عالية' : entry.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )
        };
      
      case 'التسويق':
        return {
          title: 'تقرير التسويق اليومي',
          content: (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">ملخص التسويق</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">إجمالي المهام</p>
                      <p className="text-2xl font-bold text-primary">{data.marketing.tasks.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">المهام المكتملة</p>
                      <p className="text-2xl font-bold text-success">{data.marketing.tasks.filter(t => t.status === 'completed').length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">المهام</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-right">العنوان</TableHead>
                        <TableHead className="text-right">الحالة</TableHead>
                        <TableHead className="text-right">المسؤول</TableHead>
                        <TableHead className="text-right">الأولوية</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.marketing.tasks.map((task, index) => (
                        <TableRow key={index}>
                          <TableCell className="font-medium">{task.title}</TableCell>
                          <TableCell>
                            <Badge variant={task.status === 'completed' ? 'default' : task.status === 'in-progress' ? 'secondary' : 'outline'}>
                              {task.status === 'completed' ? 'مكتمل' : task.status === 'in-progress' ? 'قيد التنفيذ' : 'مخطط'}
                            </Badge>
                          </TableCell>
                          <TableCell>{task.assignee}</TableCell>
                          <TableCell>
                            <Badge variant={task.priority === 'high' ? 'destructive' : task.priority === 'medium' ? 'secondary' : 'outline'}>
                              {task.priority === 'high' ? 'عالية' : task.priority === 'medium' ? 'متوسطة' : 'منخفضة'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )
        };
      
      default:
        return {
          title: 'تقرير غير محدد',
          content: <p>لا توجد بيانات متاحة لهذا القسم</p>
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
            تاريخ التقرير: {format(date, 'dd/MM/yyyy')}
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