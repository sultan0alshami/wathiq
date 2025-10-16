import React, { useState, useEffect, ErrorInfo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Users, Calendar, FileText, TrendingUp, Loader2, CalendarCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDateContext } from '@/contexts/DateContext';
import { getDataForDate, updateSectionData, type SalesEntry } from '@/lib/mockData';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useFormValidation, ValidationMessage, ValidationRules } from '@/components/ui/enhanced-form-validation';
import { DeleteConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { CalendarDays, ClipboardCheck } from 'lucide-react';
import { KPICardSkeleton, TableSkeleton } from '@/components/ui/loading-skeleton';
import { format } from 'date-fns';
import { AuthService } from '@/services/AuthService';
import { ARABIC_SALES_MESSAGES } from '@/lib/arabicSalesMessages';
import { ar as arLocale } from 'date-fns/locale/ar';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileSalesForm } from '@/components/ui/mobile-form';
import { MobileSalesTable } from '@/components/ui/mobile-table';
import { SalesKPICards } from '@/components/ui/mobile-kpi';

export const Sales: React.FC = () => {
  const { currentDate } = useDateContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  const [newCustomersContacted, setNewCustomersContacted] = useState<number>(0);
  const [meetings, setMeetings] = useState<SalesEntry[]>([]);
  const [dailySummary, setDailySummary] = useState('');

  // Pagination
  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => { setCurrentPage(1); }, [currentDate]);
  const paginatedMeetings = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return meetings.slice(start, start + ITEMS_PER_PAGE);
  }, [meetings, currentPage]);

  // Meeting form states
  const [newMeetingCustomer, setNewMeetingCustomer] = useState('');
  const [newMeetingContact, setNewMeetingContact] = useState('');
  const [newMeetingPhoneNumber, setNewMeetingPhoneNumber] = useState('');
  const [newMeetingNotes, setNewMeetingNotes] = useState('');
  const [newMeetingTime, setNewMeetingTime] = useState('');
  const [newMeetingOutcome, setNewMeetingOutcome] = useState<'positive' | 'negative' | 'pending'>('pending');

  const { validateField } = useFormValidation();

  // Individual validation states
  const [customerNameValidation, setCustomerNameValidation] = useState(validateField('', [ValidationRules.required(ARABIC_SALES_MESSAGES.MEETING_TITLE_REQUIRED), ValidationRules.minLength(3, ARABIC_SALES_MESSAGES.MEETING_TITLE_MIN_LENGTH)]));
  const [contactNumberValidation, setContactNumberValidation] = useState(validateField('', [ValidationRules.required(ARABIC_SALES_MESSAGES.CLIENT_NAME_REQUIRED)]));
  const [phoneNumberValidation, setPhoneNumberValidation] = useState(validateField('', [ValidationRules.required('رقم الهاتف مطلوب'), ValidationRules.phone(ARABIC_SALES_MESSAGES.VALIDATION_PHONE_INVALID)]));
  const [meetingTimeValidation, setMeetingTimeValidation] = useState(validateField('', [ValidationRules.required(ARABIC_SALES_MESSAGES.MEETING_DATE_REQUIRED)]));
  const [meetingOutcomeValidation, setMeetingOutcomeValidation] = useState(validateField('', [ValidationRules.required(ARABIC_SALES_MESSAGES.OUTCOME_REQUIRED)]));
  const [meetingNotesValidation, setMeetingNotesValidation] = useState(validateField('', [ValidationRules.maxLength(500, ARABIC_SALES_MESSAGES.NOTES_MAX_LENGTH)]));

  // Load data on mount and date change
  useEffect(() => {
    setLoading(true);
    const data = getDataForDate(currentDate);
    setNewCustomersContacted(data.sales.customersContacted);
    setMeetings(data.sales.entries);
    setDailySummary(data.sales.dailySummary);
    setLoading(false);
  }, [currentDate]);

  const addMeeting = async () => {
    // Re-validate all fields on submission attempt
    const isCustomerNameValid = validateField(newMeetingCustomer, [ValidationRules.required(ARABIC_SALES_MESSAGES.MEETING_TITLE_REQUIRED), ValidationRules.minLength(3, ARABIC_SALES_MESSAGES.MEETING_TITLE_MIN_LENGTH)]).isValid;
    const isContactNumberValid = validateField(newMeetingContact, [ValidationRules.required(ARABIC_SALES_MESSAGES.CLIENT_NAME_REQUIRED)]).isValid;
    const isPhoneNumberValid = validateField(newMeetingPhoneNumber, [ValidationRules.required('رقم الهاتف مطلوب'), ValidationRules.phone(ARABIC_SALES_MESSAGES.VALIDATION_PHONE_INVALID)]).isValid;
    const isMeetingTimeValid = validateField(newMeetingTime, [ValidationRules.required(ARABIC_SALES_MESSAGES.MEETING_DATE_REQUIRED)]).isValid;
    const isMeetingOutcomeValid = validateField(newMeetingOutcome, [ValidationRules.required(ARABIC_SALES_MESSAGES.OUTCOME_REQUIRED)]).isValid;
    const isMeetingNotesValid = validateField(newMeetingNotes, [ValidationRules.maxLength(500, ARABIC_SALES_MESSAGES.NOTES_MAX_LENGTH)]).isValid;

    if (!isCustomerNameValid || !isContactNumberValid || !isPhoneNumberValid || !isMeetingTimeValid || !isMeetingOutcomeValid || !isMeetingNotesValid) {
      setCustomerNameValidation(validateField(newMeetingCustomer, [ValidationRules.required(ARABIC_SALES_MESSAGES.MEETING_TITLE_REQUIRED), ValidationRules.minLength(3, ARABIC_SALES_MESSAGES.MEETING_TITLE_MIN_LENGTH)]));
      setContactNumberValidation(validateField(newMeetingContact, [ValidationRules.required(ARABIC_SALES_MESSAGES.CLIENT_NAME_REQUIRED)]));
      setPhoneNumberValidation(validateField(newMeetingPhoneNumber, [ValidationRules.required('رقم الهاتف مطلوب'), ValidationRules.phone(ARABIC_SALES_MESSAGES.VALIDATION_PHONE_INVALID)]));
      setMeetingTimeValidation(validateField(newMeetingTime, [ValidationRules.required(ARABIC_SALES_MESSAGES.MEETING_DATE_REQUIRED)]));
      setMeetingOutcomeValidation(validateField(newMeetingOutcome, [ValidationRules.required(ARABIC_SALES_MESSAGES.OUTCOME_REQUIRED)]));
      setMeetingNotesValidation(validateField(newMeetingNotes, [ValidationRules.maxLength(500, ARABIC_SALES_MESSAGES.NOTES_MAX_LENGTH)]));

      toast({
        title: ARABIC_SALES_MESSAGES.FORM_ERROR_TITLE,
        description: ARABIC_SALES_MESSAGES.FORM_ERROR_DESCRIPTION,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const meeting: SalesEntry = {
        id: Date.now().toString(),
        customerName: newMeetingCustomer,
        contactNumber: newMeetingContact,
        phoneNumber: newMeetingPhoneNumber,
        meetingDate: currentDate,
        meetingTime: newMeetingTime,
        outcome: newMeetingOutcome,
        notes: newMeetingNotes,
        attachments: [],
      };
      const updatedMeetings = [...meetings, meeting];
      setMeetings(updatedMeetings);
      
      updateSectionData(currentDate, 'sales', {
        customersContacted: newCustomersContacted,
        entries: updatedMeetings,
        dailySummary,
      });
      
      // Reset form and validation states
      setNewMeetingCustomer('');
      setNewMeetingContact('');
      setNewMeetingPhoneNumber('');
      setNewMeetingNotes('');
      setNewMeetingTime('');
      setNewMeetingOutcome('pending');
      setCustomerNameValidation(validateField('', [ValidationRules.required(ARABIC_SALES_MESSAGES.MEETING_TITLE_REQUIRED), ValidationRules.minLength(3, ARABIC_SALES_MESSAGES.MEETING_TITLE_MIN_LENGTH)]));
      setContactNumberValidation(validateField('', [ValidationRules.required(ARABIC_SALES_MESSAGES.CLIENT_NAME_REQUIRED)]));
      setPhoneNumberValidation(validateField('', [ValidationRules.required('رقم الهاتف مطلوب'), ValidationRules.phone(ARABIC_SALES_MESSAGES.VALIDATION_PHONE_INVALID)]));
      setMeetingTimeValidation(validateField('', [ValidationRules.required(ARABIC_SALES_MESSAGES.MEETING_DATE_REQUIRED)]));
      setMeetingOutcomeValidation(validateField('', [ValidationRules.required(ARABIC_SALES_MESSAGES.OUTCOME_REQUIRED)]));
      setMeetingNotesValidation(validateField('', [ValidationRules.maxLength(500, ARABIC_SALES_MESSAGES.NOTES_MAX_LENGTH)]));

      toast({
        title: ARABIC_SALES_MESSAGES.TOAST_ADD_SUCCESS_TITLE,
        description: ARABIC_SALES_MESSAGES.TOAST_ADD_SUCCESS_DESCRIPTION,
      });
    } catch (error) {
      toast({
        title: ARABIC_SALES_MESSAGES.TOAST_ADD_ERROR_TITLE,
        description: ARABIC_SALES_MESSAGES.TOAST_ADD_ERROR_DESCRIPTION,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const confirmRemoveMeeting = (id: string) => {
    setMeetingToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleRemoveMeeting = async () => {
    if (!meetingToDelete) return;

    setLoading(true);
    setIsDeleteDialogOpen(false);
    try {
      // Server-side authorization check
      await AuthService.requireAccess('sales');
      
      const updatedMeetings = meetings.filter(meeting => meeting.id !== meetingToDelete);
      setMeetings(updatedMeetings);
      
      updateSectionData(currentDate, 'sales', {
        customersContacted: newCustomersContacted,
        entries: updatedMeetings,
        dailySummary,
      });
      
      toast({
        title: ARABIC_SALES_MESSAGES.TOAST_DELETE_SUCCESS_TITLE,
        description: ARABIC_SALES_MESSAGES.TOAST_DELETE_SUCCESS_DESCRIPTION,
      });
    } catch (error) {
      // If error is from auth, toast already shown
      if (error instanceof Error && error.message.startsWith('Unauthorized')) {
        console.error('Unauthorized delete attempt:', error);
      } else {
        toast({
          title: ARABIC_SALES_MESSAGES.TOAST_DELETE_ERROR_TITLE,
          description: ARABIC_SALES_MESSAGES.TOAST_DELETE_ERROR_DESCRIPTION,
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
      setMeetingToDelete(null);
    }
  };

  const clearForm = () => {
    setNewMeetingCustomer('');
    setNewMeetingContact('');
    setNewMeetingPhoneNumber('');
    setNewMeetingNotes('');
    setNewMeetingTime('');
    setNewMeetingOutcome('pending');
    
    // Reset validation states
    setCustomerNameValidation(validateField('', [ValidationRules.required(ARABIC_SALES_MESSAGES.MEETING_TITLE_REQUIRED), ValidationRules.minLength(3, ARABIC_SALES_MESSAGES.MEETING_TITLE_MIN_LENGTH)]));
    setContactNumberValidation(validateField('', [ValidationRules.required(ARABIC_SALES_MESSAGES.CLIENT_NAME_REQUIRED)]));
    setPhoneNumberValidation(validateField('', [ValidationRules.required('رقم الهاتف مطلوب'), ValidationRules.phone(ARABIC_SALES_MESSAGES.VALIDATION_PHONE_INVALID)]));
    setMeetingTimeValidation(validateField('', [ValidationRules.required(ARABIC_SALES_MESSAGES.MEETING_DATE_REQUIRED)]));
    setMeetingOutcomeValidation(validateField('', [ValidationRules.required(ARABIC_SALES_MESSAGES.OUTCOME_REQUIRED)]));
    setMeetingNotesValidation(validateField('', [ValidationRules.maxLength(500, ARABIC_SALES_MESSAGES.NOTES_MAX_LENGTH)]));
  };

  // Mobile form validation object
  const formValidations = {
    customerName: customerNameValidation,
    contactNumber: contactNumberValidation,
    phoneNumber: phoneNumberValidation,
    meetingTime: meetingTimeValidation,
    outcome: meetingOutcomeValidation,
    notes: meetingNotesValidation,
  };

  const updateCustomersContacted = async (count: number) => {
    setNewCustomersContacted(count);
    try {
      updateSectionData(currentDate, 'sales', {
        customersContacted: count,
        entries: meetings,
        dailySummary,
      });
    } catch (error) {
      toast({
        title: ARABIC_SALES_MESSAGES.TOAST_ADD_ERROR_TITLE,
        description: ARABIC_SALES_MESSAGES.TOAST_ADD_ERROR_DESCRIPTION,
        variant: "destructive",
      });
    }
  };

  const updateDailySummary = async (summary: string) => {
    setDailySummary(summary);
    try {
      updateSectionData(currentDate, 'sales', {
        customersContacted: newCustomersContacted,
        entries: meetings,
        dailySummary: summary,
      });
    } catch (error) {
      toast({
        title: ARABIC_SALES_MESSAGES.TOAST_ADD_ERROR_TITLE,
        description: ARABIC_SALES_MESSAGES.TOAST_ADD_ERROR_DESCRIPTION,
        variant: "destructive",
      });
    }
  };

  const completedMeetings = meetings.filter(m => m.outcome === 'positive').length;
  const conversionRate = meetings.length > 0 ? ((completedMeetings / meetings.length) * 100).toFixed(1) : '0';

  // Error boundary fallback
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md mx-4">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-red-600 mb-2">حدث خطأ غير متوقع</h2>
            <p className="text-gray-600 mb-4">نعتذر، حدث خطأ أثناء تحميل هذا الجزء من التطبيق</p>
            <div className="flex gap-2 justify-center">
              <Button 
                onClick={() => window.location.reload()} 
                className="bg-wathiq-primary hover:bg-wathiq-primary/90"
              >
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                إعادة المحاولة
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                إعادة تحميل الصفحة
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Mobile Optimized */}
      <div className={`flex items-center ${isMobile ? 'flex-col gap-3 text-center' : 'justify-between'}`}>
        <h1 className={`font-bold text-primary ${isMobile ? 'text-2xl' : 'text-3xl'}`}>
          {ARABIC_SALES_MESSAGES.PAGE_TITLE}
        </h1>
        <Badge 
          variant="outline" 
          className={`px-4 py-2 ${isMobile ? 'text-base' : 'text-lg'}`}
        >
          {ARABIC_SALES_MESSAGES.TODAY_DATE} {format(currentDate, 'dd/MM/yyyy', { locale: arLocale })}
        </Badge>
      </div>

      {/* Quick Stats - Mobile Optimized */}
      {loading ? (
        <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-4'}`}>
          <KPICardSkeleton />
          <KPICardSkeleton />
          <KPICardSkeleton />
          <KPICardSkeleton />
        </div>
      ) : (
        <SalesKPICards
          customersContacted={newCustomersContacted}
          totalMeetings={meetings.length}
          positiveMeetings={completedMeetings}
          pendingMeetings={meetings.filter(m => m.outcome === 'pending').length}
        />
      )}

      {/* New Customers Contacted */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">{ARABIC_SALES_MESSAGES.ADD_MEETING_TITLE}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="customers">{ARABIC_SALES_MESSAGES.TOTAL_MEETINGS}</Label>
            <Input
              id="customers"
              type="number"
              min="0"
              value={newCustomersContacted}
              onChange={(e) => updateCustomersContacted(parseInt(e.target.value) || 0)}
              className="max-w-xs"
              placeholder={ARABIC_SALES_MESSAGES.TOTAL_MEETINGS}
            />
          </div>
        </CardContent>
      </Card>

      {/* Daily Meetings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">{ARABIC_SALES_MESSAGES.ADD_MEETING_TITLE}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Meeting Form - Mobile Optimized */}
          {isMobile ? (
            <React.Suspense fallback={<div className="text-center py-4">جاري التحميل...</div>}>
              <MobileSalesForm
                customerName={newMeetingCustomer}
                contactNumber={newMeetingContact}
                phoneNumber={newMeetingPhoneNumber}
                meetingTime={newMeetingTime}
                outcome={newMeetingOutcome}
                notes={newMeetingNotes}
                onCustomerNameChange={(value) => {
                  try {
                    setNewMeetingCustomer(value);
                    setCustomerNameValidation(validateField(value, [ValidationRules.required(ARABIC_SALES_MESSAGES.MEETING_TITLE_REQUIRED), ValidationRules.minLength(3, ARABIC_SALES_MESSAGES.MEETING_TITLE_MIN_LENGTH)]));
                  } catch (err) {
                    console.error('Error in customer name change:', err);
                    setError('خطأ في تحديث اسم العميل');
                  }
                }}
                onContactNumberChange={(value) => {
                  try {
                    setNewMeetingContact(value);
                    setContactNumberValidation(validateField(value, [ValidationRules.required(ARABIC_SALES_MESSAGES.CLIENT_NAME_REQUIRED)]));
                  } catch (err) {
                    console.error('Error in contact number change:', err);
                    setError('خطأ في تحديث رقم الاتصال');
                  }
                }}
                onPhoneNumberChange={(value) => {
                  try {
                    setNewMeetingPhoneNumber(value);
                    setPhoneNumberValidation(validateField(value, [ValidationRules.required('رقم الهاتف مطلوب'), ValidationRules.phone(ARABIC_SALES_MESSAGES.VALIDATION_PHONE_INVALID)]));
                  } catch (err) {
                    console.error('Error in phone number change:', err);
                    setError('خطأ في تحديث رقم الهاتف');
                  }
                }}
                onMeetingTimeChange={(value) => {
                  try {
                    setNewMeetingTime(value);
                    setMeetingTimeValidation(validateField(value, [ValidationRules.required(ARABIC_SALES_MESSAGES.MEETING_DATE_REQUIRED)]));
                  } catch (err) {
                    console.error('Error in meeting time change:', err);
                    setError('خطأ في تحديث وقت الاجتماع');
                  }
                }}
                onOutcomeChange={(value) => {
                  try {
                    setNewMeetingOutcome(value as 'positive' | 'negative' | 'pending');
                    setMeetingOutcomeValidation(validateField(value, [ValidationRules.required(ARABIC_SALES_MESSAGES.OUTCOME_REQUIRED)]));
                  } catch (err) {
                    console.error('Error in outcome change:', err);
                    setError('خطأ في تحديث نتيجة الاجتماع');
                  }
                }}
                onNotesChange={(value) => {
                  try {
                    setNewMeetingNotes(value);
                    setMeetingNotesValidation(validateField(value, [ValidationRules.maxLength(500, ARABIC_SALES_MESSAGES.NOTES_MAX_LENGTH)]));
                  } catch (err) {
                    console.error('Error in notes change:', err);
                    setError('خطأ في تحديث الملاحظات');
                  }
                }}
                onSubmit={addMeeting}
                onReset={clearForm}
                validations={formValidations}
                isSubmitting={loading}
              />
            </React.Suspense>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-card/90 backdrop-blur-md supports-[backdrop-filter]:bg-card/70 supports-[backdrop-filter]:backdrop-blur-md rounded-lg border border-border/50">
            <div className="space-y-2">
              <Label>{ARABIC_SALES_MESSAGES.MEETING_TITLE_LABEL}</Label>
              <Input
                placeholder={ARABIC_SALES_MESSAGES.MEETING_TITLE_PLACEHOLDER}
                value={newMeetingCustomer}
                onChange={(e) => {
                  setNewMeetingCustomer(e.target.value);
                  setCustomerNameValidation(validateField(e.target.value, [ValidationRules.required(ARABIC_SALES_MESSAGES.MEETING_TITLE_REQUIRED), ValidationRules.minLength(3, ARABIC_SALES_MESSAGES.MEETING_TITLE_MIN_LENGTH)]));
                }}
                className={!customerNameValidation.isValid ? "border-destructive" : ""}
              />
              <ValidationMessage result={customerNameValidation} />
            </div>
            <div className="space-y-2">
              <Label>{ARABIC_SALES_MESSAGES.CLIENT_NAME_LABEL}</Label>
              <Input
                placeholder={ARABIC_SALES_MESSAGES.CLIENT_NAME_PLACEHOLDER}
                value={newMeetingContact}
                onChange={(e) => {
                  setNewMeetingContact(e.target.value);
                  setContactNumberValidation(validateField(e.target.value, [ValidationRules.required(ARABIC_SALES_MESSAGES.CLIENT_NAME_REQUIRED)]));
                }}
                className={!contactNumberValidation.isValid ? "border-destructive" : ""}
              />
              <ValidationMessage result={contactNumberValidation} />
            </div>
            <div className="space-y-2">
              <Label>{ARABIC_SALES_MESSAGES.CUSTOMER_PHONE_LABEL}</Label>
              <Input
                placeholder={ARABIC_SALES_MESSAGES.CUSTOMER_PHONE_PLACEHOLDER}
                value={newMeetingPhoneNumber}
                onChange={(e) => {
                  setNewMeetingPhoneNumber(e.target.value);
                  setPhoneNumberValidation(validateField(e.target.value, [ValidationRules.required('رقم الهاتف مطلوب'), ValidationRules.phone(ARABIC_SALES_MESSAGES.VALIDATION_PHONE_INVALID)]));
                }}
                className={!phoneNumberValidation.isValid ? "border-destructive" : ""}
              />
              <ValidationMessage result={phoneNumberValidation} />
            </div>
            <div className="space-y-2">
              <Label>{ARABIC_SALES_MESSAGES.MEETING_DATE_LABEL}</Label>
              <Input
                type="time"
                value={newMeetingTime}
                onChange={(e) => {
                  setNewMeetingTime(e.target.value);
                  setMeetingTimeValidation(validateField(e.target.value, [ValidationRules.required(ARABIC_SALES_MESSAGES.MEETING_DATE_REQUIRED)]));
                }}
                className={!meetingTimeValidation.isValid ? "border-destructive" : ""}
              />
              <ValidationMessage result={meetingTimeValidation} />
            </div>
            <div className="space-y-2">
              <Label>{ARABIC_SALES_MESSAGES.OUTCOME_LABEL}</Label>
              <Select
                value={newMeetingOutcome}
                onValueChange={(value: 'positive' | 'negative' | 'pending') => {
                  setNewMeetingOutcome(value);
                  setMeetingOutcomeValidation(validateField(value, [ValidationRules.required(ARABIC_SALES_MESSAGES.OUTCOME_REQUIRED)]));
                }}
              >
                <SelectTrigger className={!meetingOutcomeValidation.isValid ? "w-full border-destructive" : "w-full"}>
                  <SelectValue placeholder={ARABIC_SALES_MESSAGES.OUTCOME_PENDING} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{ARABIC_SALES_MESSAGES.OUTCOME_PENDING}</SelectItem>
                  <SelectItem value="positive">{ARABIC_SALES_MESSAGES.OUTCOME_SUCCESS}</SelectItem>
                  <SelectItem value="negative">{ARABIC_SALES_MESSAGES.OUTCOME_FAILED}</SelectItem>
                </SelectContent>
              </Select>
              <ValidationMessage result={meetingOutcomeValidation} />
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>{ARABIC_SALES_MESSAGES.NOTES_LABEL}</Label>
              <Textarea
                placeholder={ARABIC_SALES_MESSAGES.NOTES_PLACEHOLDER}
                value={newMeetingNotes}
                onChange={(e) => {
                  setNewMeetingNotes(e.target.value);
                  setMeetingNotesValidation(validateField(e.target.value, [ValidationRules.maxLength(500, ARABIC_SALES_MESSAGES.NOTES_MAX_LENGTH)]));
                }}
                rows={3}
                className={!meetingNotesValidation.isValid ? "border-destructive" : ""}
              />
              <ValidationMessage result={meetingNotesValidation} />
            </div>
            <div className="md:col-span-2">
            <Button onClick={addMeeting} disabled={loading || !customerNameValidation.isValid || !contactNumberValidation.isValid || !phoneNumberValidation.isValid || !meetingTimeValidation.isValid || !meetingOutcomeValidation.isValid || !meetingNotesValidation.isValid} variant="default">
                {loading ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Plus className="w-4 h-4 ml-2" />}
                {ARABIC_SALES_MESSAGES.ADD_MEETING_BUTTON}
              </Button>
            </div>
          </div>
          )}  {/* Close mobile/desktop form conditional */}

          {/* Meetings List - Mobile Optimized */}
          {loading ? (
            <TableSkeleton rows={3} columns={4} />
          ) : meetings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CalendarDays className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{ARABIC_SALES_MESSAGES.NO_MEETINGS_ADDED}</p>
            </div>
          ) : (
            <>
              {isMobile ? (
                <React.Suspense fallback={<div className="text-center py-4">جاري تحميل الجدول...</div>}>
                  <MobileSalesTable 
                    meetings={paginatedMeetings} 
                    onDelete={confirmRemoveMeeting}
                  />
                </React.Suspense>
              ) : (
            <div className="space-y-3">
              {paginatedMeetings.map((meeting) => (
                <Card key={meeting.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{meeting.customerName}</h3>
                          <Badge variant="outline" className={
                            meeting.outcome === 'positive' ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-100 dark:border-green-800' :
                            meeting.outcome === 'negative' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-100 dark:border-red-800' :
                            'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/20 dark:text-yellow-100 dark:border-yellow-800'
                          }>
                            {meeting.outcome === 'positive' ? ARABIC_SALES_MESSAGES.OUTCOME_SUCCESS :
                             meeting.outcome === 'negative' ? ARABIC_SALES_MESSAGES.OUTCOME_FAILED : ARABIC_SALES_MESSAGES.OUTCOME_PENDING}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <p><span className="font-medium">{ARABIC_SALES_MESSAGES.CLIENT_NAME_LABEL}:</span> {meeting.contactNumber}</p>
                          <p><span className="font-medium">{ARABIC_SALES_MESSAGES.CUSTOMER_PHONE_LABEL}:</span> {meeting.phoneNumber}</p>
                          <p><span className="font-medium">{ARABIC_SALES_MESSAGES.MEETING_TIME_LABEL}:</span> {meeting.meetingTime || 'غير محدد'}</p>
                          <p><span className="font-medium">{ARABIC_SALES_MESSAGES.MEETING_DATE_LABEL}:</span> {meeting.meetingDate.toLocaleDateString('ar-EG')}</p>
                          {meeting.notes && (
                            <p className="col-span-2"><span className="font-medium">{ARABIC_SALES_MESSAGES.NOTES_LABEL}:</span> {meeting.notes}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => confirmRemoveMeeting(meeting.id)}
                        className="text-red-600 hover:bg-red-100"
                        aria-label={`حذف ${ARABIC_SALES_MESSAGES.MEETING_ITEM_NAME}`}
                        title={`حذف ${ARABIC_SALES_MESSAGES.MEETING_ITEM_NAME}`}
                      >
                        <Trash2 className="w-4 h-4" />
                        {ARABIC_SALES_MESSAGES.DELETE_CONFIRM_ITEM_NAME}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {/* Pagination Controls */}
              <div className="flex items-center justify-between pt-4">
                <span className="text-sm text-muted-foreground">
                  {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, meetings.length)}-
                  {Math.min(currentPage * ITEMS_PER_PAGE, meetings.length)} من {meetings.length}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    السابق
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(p => (p * ITEMS_PER_PAGE < meetings.length ? p + 1 : p))}
                    disabled={currentPage * ITEMS_PER_PAGE >= meetings.length}
                  >
                    التالي
                  </Button>
                </div>
              </div>
            </div>
              )}  {/* Close desktop table */}
              
              {/* Mobile Pagination */}
              {meetings.length > ITEMS_PER_PAGE && (
                <div className={`flex justify-between items-center pt-4 ${isMobile ? 'flex-col gap-2' : 'flex-row'}`}>
                  <span className="text-sm text-muted-foreground">
                    {ARABIC_SALES_MESSAGES.PAGINATION_INFO.replace('{current}', currentPage.toString())
                      .replace('{total}', Math.ceil(meetings.length / ITEMS_PER_PAGE).toString())
                      .replace('{count}', meetings.length.toString())}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className={isMobile ? 'min-h-[44px] px-6' : ''}
                    >
                      السابق
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => (p * ITEMS_PER_PAGE < meetings.length ? p + 1 : p))}
                      disabled={currentPage * ITEMS_PER_PAGE >= meetings.length}
                      className={isMobile ? 'min-h-[44px] px-6' : ''}
                    >
                      التالي
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleRemoveMeeting}
        itemName={ARABIC_SALES_MESSAGES.DELETE_CONFIRM_ITEM_NAME}
      />

      {/* Daily Summary - Mobile Optimized */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">{ARABIC_SALES_MESSAGES.PAGE_TITLE}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder={ARABIC_SALES_MESSAGES.NOTES_PLACEHOLDER}
              value={dailySummary}
              onChange={(e) => updateDailySummary(e.target.value)}
              rows={isMobile ? 3 : 4}
              className={`w-full ${isMobile ? 'min-h-[120px] text-base' : ''}`}
            />
          </div>
        </CardContent>
      </Card>

    </div>
  );
};