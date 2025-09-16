import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { 
  Package, 
  FileText, 
  FileSpreadsheet, 
  Calendar as CalendarIcon,
  Download,
  Settings
} from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { BulkExportOptions } from '@/services/EnhancedExportService';

interface BulkExportDialogProps {
  onExport: (options: BulkExportOptions) => void;
  trigger?: React.ReactNode;
}

export const BulkExportDialog: React.FC<BulkExportDialogProps> = ({
  onExport,
  trigger
}) => {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<BulkExportOptions>({
    formats: ['csv'],
    sections: ['finance'],
    dateRange: {
      from: new Date(),
      to: new Date()
    },
    includeCharts: false
  });

  const formats = [
    { id: 'csv' as const, label: 'CSV', icon: FileSpreadsheet, description: 'جداول بيانات' },
    { id: 'pdf' as const, label: 'PDF', icon: FileText, description: 'تقارير مُنسقة' },
    { id: 'excel' as const, label: 'Excel', icon: FileSpreadsheet, description: 'ملفات إكسل' }
  ];

  const sections = [
    { id: 'finance' as const, label: 'المالية', description: 'البيانات المالية والسيولة' },
    { id: 'sales' as const, label: 'المبيعات', description: 'الاجتماعات والعملاء' },
    { id: 'operations' as const, label: 'العمليات', description: 'المهام والعمليات' },
    { id: 'marketing' as const, label: 'التسويق', description: 'الحملات والأنشطة' },
    { id: 'customers' as const, label: 'العملاء', description: 'قاعدة بيانات العملاء' }
  ];

  const handleFormatChange = (formatId: typeof formats[0]['id'], checked: boolean) => {
    setOptions(prev => ({
      ...prev,
      formats: checked 
        ? [...prev.formats, formatId]
        : prev.formats.filter(f => f !== formatId)
    }));
  };

  const handleSectionChange = (sectionId: typeof sections[0]['id'], checked: boolean) => {
    setOptions(prev => ({
      ...prev,
      sections: checked
        ? [...prev.sections, sectionId]
        : prev.sections.filter(s => s !== sectionId)
    }));
  };

  const handleDateRangeChange = (field: 'from' | 'to', date: Date | undefined) => {
    if (date) {
      setOptions(prev => ({
        ...prev,
        dateRange: { ...prev.dateRange, [field]: date }
      }));
    }
  };

  const handleExport = () => {
    onExport(options);
    setOpen(false);
  };

  const isValid = options.formats.length > 0 && 
                  options.sections.length > 0 && 
                  options.dateRange.from && 
                  options.dateRange.to;

  const estimatedFiles = options.formats.length * options.sections.length;
  const daysDifference = Math.ceil(
    (options.dateRange.to.getTime() - options.dateRange.from.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-wathiq-primary hover:bg-wathiq-primary/90">
            <Package className="w-4 h-4 ml-2" />
            تصدير مجمع
          </Button>
        )}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            تصدير مجمع
          </DialogTitle>
          <DialogDescription>
            اختر الأقسام والصيغ والفترة الزمنية للتصدير المجمع
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Export Formats */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">صيغ التصدير</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {formats.map((format) => (
                <div key={format.id} className="flex items-start space-x-2 space-x-reverse">
                  <Checkbox
                    id={`format-${format.id}`}
                    checked={options.formats.includes(format.id)}
                    onCheckedChange={(checked) => 
                      handleFormatChange(format.id, checked as boolean)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor={`format-${format.id}`}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <format.icon className="w-4 h-4" />
                      {format.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {format.description}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Sections */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">الأقسام</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {sections.map((section) => (
                <div key={section.id} className="flex items-start space-x-2 space-x-reverse">
                  <Checkbox
                    id={`section-${section.id}`}
                    checked={options.sections.includes(section.id)}
                    onCheckedChange={(checked) => 
                      handleSectionChange(section.id, checked as boolean)
                    }
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label
                      htmlFor={`section-${section.id}`}
                      className="cursor-pointer font-medium"
                    >
                      {section.label}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Date Range */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">الفترة الزمنية</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>من تاريخ</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-right"
                      >
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {options.dateRange.from ? (
                          format(options.dateRange.from, 'PPP', { locale: ar })
                        ) : (
                          'اختر التاريخ'
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={options.dateRange.from}
                        onSelect={(date) => handleDateRangeChange('from', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>إلى تاريخ</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-right"
                      >
                        <CalendarIcon className="ml-2 h-4 w-4" />
                        {options.dateRange.to ? (
                          format(options.dateRange.to, 'PPP', { locale: ar })
                        ) : (
                          'اختر التاريخ'
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={options.dateRange.to}
                        onSelect={(date) => handleDateRangeChange('to', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Options */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="w-4 h-4" />
                خيارات إضافية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="include-charts"
                  checked={options.includeCharts}
                  onCheckedChange={(checked) => 
                    setOptions(prev => ({ ...prev, includeCharts: checked as boolean }))
                  }
                />
                <Label htmlFor="include-charts" className="cursor-pointer">
                  تضمين الرسوم البيانية (PDF فقط)
                </Label>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        {isValid && (
          <div className="bg-wathiq-primary/5 border border-wathiq-primary/20 rounded-lg p-4">
            <h4 className="font-medium text-wathiq-primary mb-2">ملخص التصدير</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">الصيغ:</span>
                <div className="font-medium">{options.formats.length} صيغة</div>
              </div>
              <div>
                <span className="text-muted-foreground">الأقسام:</span>
                <div className="font-medium">{options.sections.length} قسم</div>
              </div>
              <div>
                <span className="text-muted-foreground">الأيام:</span>
                <div className="font-medium">{daysDifference} يوم</div>
              </div>
              <div>
                <span className="text-muted-foreground">الملفات المتوقعة:</span>
                <div className="font-medium">{estimatedFiles * daysDifference} ملف</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => setOpen(false)}>
            إلغاء
          </Button>
          <Button
            onClick={handleExport}
            disabled={!isValid}
            className="bg-wathiq-primary hover:bg-wathiq-primary/90"
          >
            <Download className="w-4 h-4 ml-2" />
            بدء التصدير
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};