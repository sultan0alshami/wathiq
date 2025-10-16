import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { ValidationMessage } from '@/components/ui/enhanced-form-validation';

interface MobileFormField {
  type: 'text' | 'textarea' | 'select' | 'number' | 'tel' | 'datetime-local';
  name: string;
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  validation?: {
    isValid: boolean;
    messages: Array<{ message: string; type: 'error' | 'warning' | 'info' }>;
  } | null;
  options?: Array<{ value: string; label: string }>;
  rows?: number; // for textarea
  className?: string;
}

interface MobileFormProps {
  title?: string;
  fields: MobileFormField[];
  onSubmit: () => void;
  onReset?: () => void;
  submitLabel?: string;
  resetLabel?: string;
  isSubmitting?: boolean;
  className?: string;
  children?: React.ReactNode; // For custom fields
}

export function MobileForm({
  title,
  fields,
  onSubmit,
  onReset,
  submitLabel = 'حفظ',
  resetLabel = 'إعادة تعيين',
  isSubmitting = false,
  className,
  children
}: MobileFormProps) {
  const isMobile = useIsMobile();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const renderField = (field: MobileFormField) => {
    const fieldId = `field-${field.name}`;
    const hasError = field.validation && !field.validation.isValid;

    return (
      <div key={field.name} className="space-y-2">
        <Label 
          htmlFor={fieldId}
          className={cn(
            "text-sm font-medium",
            hasError && "text-destructive",
            field.required && "after:content-['*'] after:text-destructive after:ml-1"
          )}
        >
          {field.label}
        </Label>
        
        {field.type === 'textarea' ? (
          <Textarea
            id={fieldId}
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 3}
            className={cn(
              "w-full resize-none",
              isMobile && "min-h-[44px] text-base", // Prevent zoom on iOS
              hasError && "border-destructive focus:border-destructive",
              field.className
            )}
          />
        ) : field.type === 'select' ? (
          <Select value={String(field.value)} onValueChange={field.onChange}>
            <SelectTrigger 
              id={fieldId}
              className={cn(
                "w-full",
                isMobile && "min-h-[44px] text-base",
                hasError && "border-destructive focus:border-destructive",
                field.className
              )}
            >
              <SelectValue placeholder={field.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Input
            id={fieldId}
            type={field.type}
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            placeholder={field.placeholder}
            className={cn(
              "w-full",
              isMobile && "min-h-[44px] text-base", // Touch-friendly and prevent zoom
              hasError && "border-destructive focus:border-destructive",
              field.className
            )}
          />
        )}
        
        {field.validation && (
          <ValidationMessage result={field.validation} />
        )}
      </div>
    );
  };

  return (
    <Card className={cn("w-full", className)}>
      {title && (
        <CardHeader className={cn(isMobile && "pb-4")}>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={cn(isMobile && "px-4 pb-4")}>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Form fields */}
          <div className={cn(
            "grid gap-4",
            isMobile ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          )}>
            {fields.map(renderField)}
          </div>
          
          {/* Custom children */}
          {children}
          
          {/* Form actions */}
          <div className={cn(
            "flex gap-3 pt-4 border-t border-border",
            isMobile ? "flex-col" : "flex-row justify-end"
          )}>
            {onReset && (
              <Button
                type="button"
                variant="outline"
                onClick={onReset}
                disabled={isSubmitting}
                className={cn(
                  isMobile && "min-h-[44px] w-full order-2"
                )}
              >
                {resetLabel}
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className={cn(
                "min-w-[120px]",
                isMobile && "min-h-[44px] w-full order-1"
              )}
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  جاري الحفظ...
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

// Specialized mobile form for Sales entries
export function MobileSalesForm({
  customerName,
  contactNumber,
  phoneNumber,
  meetingTime,
  outcome,
  notes,
  onCustomerNameChange,
  onContactNumberChange,
  onPhoneNumberChange,
  onMeetingTimeChange,
  onOutcomeChange,
  onNotesChange,
  onSubmit,
  onReset,
  validations,
  isSubmitting = false,
}: {
  customerName: string;
  contactNumber: string;
  phoneNumber: string;
  meetingTime: string;
  outcome: string;
  notes: string;
  onCustomerNameChange: (value: string) => void;
  onContactNumberChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onMeetingTimeChange: (value: string) => void;
  onOutcomeChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onSubmit: () => void;
  onReset?: () => void;
  validations: Record<string, { isValid: boolean; messages: Array<{ message: string; type: 'error' | 'warning' | 'info' }> }>;
  isSubmitting?: boolean;
}) {
  const fields: MobileFormField[] = [
    {
      type: 'text',
      name: 'customerName',
      label: 'اسم العميل',
      value: customerName,
      onChange: onCustomerNameChange,
      placeholder: 'أدخل اسم العميل',
      required: true,
      validation: validations.customerName,
    },
    {
      type: 'text',
      name: 'contactNumber',
      label: 'جهة الاتصال',
      value: contactNumber,
      onChange: onContactNumberChange,
      placeholder: 'أدخل جهة الاتصال',
      required: true,
      validation: validations.contactNumber,
    },
    {
      type: 'tel',
      name: 'phoneNumber',
      label: 'رقم الهاتف',
      value: phoneNumber,
      onChange: onPhoneNumberChange,
      placeholder: '+966xxxxxxxxx',
      required: true,
      validation: validations.phoneNumber,
    },
    {
      type: 'datetime-local',
      name: 'meetingTime',
      label: 'وقت الاجتماع',
      value: meetingTime,
      onChange: onMeetingTimeChange,
      required: true,
      validation: validations.meetingTime,
    },
    {
      type: 'select',
      name: 'outcome',
      label: 'نتيجة الاجتماع',
      value: outcome,
      onChange: onOutcomeChange,
      required: true,
      validation: validations.outcome,
      options: [
        { value: 'positive', label: 'إيجابية' },
        { value: 'negative', label: 'سلبية' },
        { value: 'pending', label: 'معلقة' },
      ],
    },
    {
      type: 'textarea',
      name: 'notes',
      label: 'ملاحظات',
      value: notes,
      onChange: onNotesChange,
      placeholder: 'أدخل ملاحظات حول الاجتماع (اختياري)',
      rows: 3,
      validation: validations.notes,
    },
  ];

  return (
    <MobileForm
      title="إضافة اجتماع جديد"
      fields={fields}
      onSubmit={onSubmit}
      onReset={onReset}
      submitLabel="إضافة الاجتماع"
      resetLabel="مسح النموذج"
      isSubmitting={isSubmitting}
    />
  );
}
