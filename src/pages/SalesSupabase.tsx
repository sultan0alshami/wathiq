import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Users, Calendar, FileText, TrendingUp, Loader2, CalendarCheck } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDateContext } from '@/contexts/DateContext';
import { useSalesData } from '@/hooks/useSupabaseData';
import { useSalesRealtime } from '@/hooks/useRealtimeData';
import { useAuth } from '@/contexts/AuthContext';
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
import { ARABIC_SALES_MESSAGES } from '@/lib/arabicSalesMessages';
import { ar as arLocale } from 'date-fns/locale/ar';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileSalesForm } from '@/components/ui/mobile-form';
import { MobileSalesTable } from '@/components/ui/mobile-table';
import { SalesKPICards } from '@/components/ui/mobile-kpi';
import { MigrationStatus } from '@/components/ui/migration-status';

export const SalesSupabase: React.FC = () => {
  const { currentDate } = useDateContext();
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  const [newCustomersContacted, setNewCustomersContacted] = useState<number>(0);
  const [dailySummary, setDailySummary] = useState('');

  // Pagination
  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => { setCurrentPage(1); }, [currentDate]);

  // Use Supabase data hook
  const {
    entries: meetings,
    loading: dataLoading,
    error: dataError,
    addEntry: addMeeting,
    updateEntry: updateMeeting,
    deleteEntry: deleteMeeting,
    refetch: refetchMeetings
  } = useSalesData(currentDate);

  // Real-time updates
  useSalesRealtime(user?.id || '', () => {
    refetchMeetings();
  });

  // Form validation
  const { validateField } = useFormValidation();

  // Individual validation states
  const [customerNameValidation, setCustomerNameValidation] = useState(validateField('', [ValidationRules.required(ARABIC_SALES_MESSAGES.MEETING_TITLE_REQUIRED), ValidationRules.minLength(3, ARABIC_SALES_MESSAGES.MEETING_TITLE_MIN_LENGTH)]));
  const [contactNumberValidation, setContactNumberValidation] = useState(validateField('', [ValidationRules.required(ARABIC_SALES_MESSAGES.CLIENT_NAME_REQUIRED)]));
  const [phoneNumberValidation, setPhoneNumberValidation] = useState(validateField('', [ValidationRules.required('رقم الهاتف مطلوب'), ValidationRules.phone(ARABIC_SALES_MESSAGES.VALIDATION_PHONE_INVALID)]));
  const [meetingTimeValidation, setMeetingTimeValidation] = useState(validateField('', [ValidationRules.required(ARABIC_SALES_MESSAGES.MEETING_DATE_REQUIRED)]));
  const [meetingOutcomeValidation, setMeetingOutcomeValidation] = useState(validateField('', [ValidationRules.required(ARABIC_SALES_MESSAGES.OUTCOME_REQUIRED)]));
  const [meetingNotesValidation, setMeetingNotesValidation] = useState(validateField('', [ValidationRules.maxLength(500, ARABIC_SALES_MESSAGES.NOTES_MAX_LENGTH)]));

  // Form state
  const [newMeetingCustomer, setNewMeetingCustomer] = useState('');
  const [newMeetingContact, setNewMeetingContact] = useState('');
  const [newMeetingPhoneNumber, setNewMeetingPhoneNumber] = useState('');
  const [newMeetingTime, setNewMeetingTime] = useState('');
  const [newMeetingOutcome, setNewMeetingOutcome] = useState<'positive' | 'negative' | 'pending'>('pending');
  const [newMeetingNotes, setNewMeetingNotes] = useState('');

  // Mobile form validation object
  const formValidations = {
    customerName: customerNameValidation,
    contactNumber: contactNumberValidation,
    phoneNumber: phoneNumberValidation,
    meetingTime: meetingTimeValidation,
    outcome: meetingOutcomeValidation,
    notes: meetingNotesValidation,
  };

  // Calculate KPIs
  const totalMeetings = meetings.length;
  const positiveMeetings = meetings.filter(m => m.outcome === 'positive').length;
  const negativeMeetings = meetings.filter(m => m.outcome === 'negative').length;
  const pendingMeetings = meetings.filter(m => m.outcome === 'pending').length;
  const successRate = totalMeetings > 0 ? Math.round((positiveMeetings / totalMeetings) * 100) : 0;

  // Paginated meetings
  const paginatedMeetings = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return meetings.slice(start, start + ITEMS_PER_PAGE);
  }, [meetings, currentPage]);

  const totalPages = Math.ceil(meetings.length / ITEMS_PER_PAGE);

  // Add meeting function
  const handleAddMeeting = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate all fields
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
        return;
      }

      // Create new meeting entry
      const newMeeting = {
        customerName: newMeetingCustomer,
        contactPerson: newMeetingContact,
        phoneNumber: newMeetingPhoneNumber,
        meetingDate: new Date(newMeetingTime),
        outcome: newMeetingOutcome,
        notes: newMeetingNotes,
        followUpDate: undefined
      };

      await addMeeting(newMeeting);

      // Clear form
      setNewMeetingCustomer('');
      setNewMeetingContact('');
      setNewMeetingPhoneNumber('');
      setNewMeetingTime('');
      setNewMeetingOutcome('pending');
      setNewMeetingNotes('');

      // Reset validation states
      setCustomerNameValidation(validateField('', [ValidationRules.required(ARABIC_SALES_MESSAGES.MEETING_TITLE_REQUIRED), ValidationRules.minLength(3, ARABIC_SALES_MESSAGES.MEETING_TITLE_MIN_LENGTH)]));
      setContactNumberValidation(validateField('', [ValidationRules.required(ARABIC_SALES_MESSAGES.CLIENT_NAME_REQUIRED)]));
      setPhoneNumberValidation(validateField('', [ValidationRules.required('رقم الهاتف مطلوب'), ValidationRules.phone(ARABIC_SALES_MESSAGES.VALIDATION_PHONE_INVALID)]));
      setMeetingTimeValidation(validateField('', [ValidationRules.required(ARABIC_SALES_MESSAGES.MEETING_DATE_REQUIRED)]));
      setMeetingOutcomeValidation(validateField('', [ValidationRules.required(ARABIC_SALES_MESSAGES.OUTCOME_REQUIRED)]));
      setMeetingNotesValidation(validateField('', [ValidationRules.maxLength(500, ARABIC_SALES_MESSAGES.NOTES_MAX_LENGTH)]));

      toast({
        title: "تم بنجاح",
        description: "تم إضافة الاجتماع الجديد بنجاح",
      });

    } catch (error) {
      console.error('Error adding meeting:', error);
      setError('فشل في إضافة الاجتماع');
      toast({
        title: "خطأ",
        description: "فشل في إضافة الاجتماع. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Clear form function
  const clearForm = () => {
    setNewMeetingCustomer('');
    setNewMeetingContact('');
    setNewMeetingPhoneNumber('');
    setNewMeetingTime('');
    setNewMeetingOutcome('pending');
    setNewMeetingNotes('');
    
    // Reset validation states
    setCustomerNameValidation(validateField('', [ValidationRules.required(ARABIC_SALES_MESSAGES.MEETING_TITLE_REQUIRED), ValidationRules.minLength(3, ARABIC_SALES_MESSAGES.MEETING_TITLE_MIN_LENGTH)]));
    setContactNumberValidation(validateField('', [ValidationRules.required(ARABIC_SALES_MESSAGES.CLIENT_NAME_REQUIRED)]));
    setPhoneNumberValidation(validateField('', [ValidationRules.required('رقم الهاتف مطلوب'), ValidationRules.phone(ARABIC_SALES_MESSAGES.VALIDATION_PHONE_INVALID)]));
    setMeetingTimeValidation(validateField('', [ValidationRules.required(ARABIC_SALES_MESSAGES.MEETING_DATE_REQUIRED)]));
    setMeetingOutcomeValidation(validateField('', [ValidationRules.required(ARABIC_SALES_MESSAGES.OUTCOME_REQUIRED)]));
    setMeetingNotesValidation(validateField('', [ValidationRules.maxLength(500, ARABIC_SALES_MESSAGES.NOTES_MAX_LENGTH)]));
  };

  // Delete meeting function
  const handleDeleteMeeting = async (meetingId: string) => {
    try {
      setLoading(true);
      await deleteMeeting(meetingId);
      
      toast({
        title: "تم بنجاح",
        description: "تم حذف الاجتماع بنجاح",
      });
    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast({
        title: "خطأ",
        description: "فشل في حذف الاجتماع. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsDeleteDialogOpen(false);
      setMeetingToDelete(null);
    }
  };

  // Update meeting notes function
  const handleUpdateMeetingNotes = async (meetingId: string, newNotes: string) => {
    try {
      await updateMeeting(meetingId, { notes: newNotes });
      toast({
        title: "تم بنجاح",
        description: "تم تحديث ملاحظات الاجتماع بنجاح",
      });
    } catch (error) {
      console.error('Error updating meeting notes:', error);
      toast({
        title: "خطأ",
        description: "فشل في تحديث الملاحظات",
        variant: "destructive",
      });
    }
  };

  if (dataError) {
    return (
      <div className="p-4">
        <MigrationStatus />
        <Card className="mt-4">
          <CardContent className="p-6 text-center">
            <div className="text-red-600 mb-4">خطأ في تحميل البيانات</div>
            <div className="text-sm text-muted-foreground mb-4">{dataError}</div>
            <Button onClick={() => refetchMeetings()}>
              إعادة المحاولة
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <MigrationStatus />
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">المبيعات</h1>
          <p className="text-muted-foreground">
            إدارة اجتماعات العملاء والمتابعة - {format(currentDate, 'EEEE، d MMMM yyyy', { locale: arLocale })}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <FileText className="w-4 h-4 ml-2" />
            تقرير
          </Button>
          <Button variant="outline" size="sm">
            <TrendingUp className="w-4 h-4 ml-2" />
            إحصائيات
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {dataLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <KPICardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <SalesKPICards
          totalMeetings={totalMeetings}
          positiveMeetings={positiveMeetings}
          negativeMeetings={negativeMeetings}
          pendingMeetings={pendingMeetings}
          successRate={successRate}
        />
      )}

      {/* Add Meeting Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="w-5 h-5" />
            إضافة اجتماع جديد
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isMobile ? (
            <React.Suspense fallback={<div>جاري التحميل...</div>}>
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
                    setError('خطأ في تحديث اسم العميل');
                  }
                }}
                onContactNumberChange={(value) => {
                  try {
                    setNewMeetingContact(value);
                    setContactNumberValidation(validateField(value, [ValidationRules.required(ARABIC_SALES_MESSAGES.CLIENT_NAME_REQUIRED)]));
                  } catch (err) {
                    setError('خطأ في تحديث جهة الاتصال');
                  }
                }}
                onPhoneNumberChange={(value) => {
                  try {
                    setNewMeetingPhoneNumber(value);
                    setPhoneNumberValidation(validateField(value, [ValidationRules.required('رقم الهاتف مطلوب'), ValidationRules.phone(ARABIC_SALES_MESSAGES.VALIDATION_PHONE_INVALID)]));
                  } catch (err) {
                    setError('خطأ في تحديث رقم الهاتف');
                  }
                }}
                onMeetingTimeChange={(value) => {
                  try {
                    setNewMeetingTime(value);
                    setMeetingTimeValidation(validateField(value, [ValidationRules.required(ARABIC_SALES_MESSAGES.MEETING_DATE_REQUIRED)]));
                  } catch (err) {
                    setError('خطأ في تحديث وقت الاجتماع');
                  }
                }}
                onOutcomeChange={(value) => {
                  try {
                    setNewMeetingOutcome(value as 'positive' | 'negative' | 'pending');
                    setMeetingOutcomeValidation(validateField(value, [ValidationRules.required(ARABIC_SALES_MESSAGES.OUTCOME_REQUIRED)]));
                  } catch (err) {
                    setError('خطأ في تحديث نتيجة الاجتماع');
                  }
                }}
                onNotesChange={(value) => {
                  try {
                    setNewMeetingNotes(value);
                    setMeetingNotesValidation(validateField(value, [ValidationRules.maxLength(500, ARABIC_SALES_MESSAGES.NOTES_MAX_LENGTH)]));
                  } catch (err) {
                    setError('خطأ في تحديث الملاحظات');
                  }
                }}
                onSubmit={handleAddMeeting}
                onReset={clearForm}
                validations={formValidations}
                isSubmitting={loading}
              />
            </React.Suspense>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-card/90 backdrop-blur-md supports-[backdrop-filter]:bg-card/70 supports-[backdrop-filter]:backdrop-blur-md rounded-lg border border-border/50">
              {/* Desktop form fields */}
              <div className="space-y-2">
                <Label>{ARABIC_SALES_MESSAGES.MEETING_TITLE_LABEL}</Label>
                <Input
                  placeholder={ARABIC_SALES_MESSAGES.MEETING_TITLE_PLACEHOLDER}
                  value={newMeetingCustomer}
                  onChange={(e) => {
                    setNewMeetingCustomer(e.target.value);
                    setCustomerNameValidation(validateField(e.target.value, [ValidationRules.required(ARABIC_SALES_MESSAGES.MEETING_TITLE_REQUIRED), ValidationRules.minLength(3, ARABIC_SALES_MESSAGES.MEETING_TITLE_MIN_LENGTH)]));
                  }}
                  className={customerNameValidation.messages.length > 0 ? "border-destructive" : ""}
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
                  className={contactNumberValidation.messages.length > 0 ? "border-destructive" : ""}
                />
                <ValidationMessage result={contactNumberValidation} />
              </div>

              <div className="space-y-2">
                <Label>{ARABIC_SALES_MESSAGES.CUSTOMER_PHONE_LABEL}</Label>
                <Input
                  type="tel"
                  placeholder={ARABIC_SALES_MESSAGES.CUSTOMER_PHONE_PLACEHOLDER}
                  value={newMeetingPhoneNumber}
                  onChange={(e) => {
                    setNewMeetingPhoneNumber(e.target.value);
                    setPhoneNumberValidation(validateField(e.target.value, [ValidationRules.required('رقم الهاتف مطلوب'), ValidationRules.phone(ARABIC_SALES_MESSAGES.VALIDATION_PHONE_INVALID)]));
                  }}
                  className={phoneNumberValidation.messages.length > 0 ? "border-destructive" : ""}
                />
                <ValidationMessage result={phoneNumberValidation} />
              </div>

              <div className="space-y-2">
                <Label>{ARABIC_SALES_MESSAGES.MEETING_DATE_LABEL}</Label>
                <Input
                  type="datetime-local"
                  value={newMeetingTime}
                  onChange={(e) => {
                    setNewMeetingTime(e.target.value);
                    setMeetingTimeValidation(validateField(e.target.value, [ValidationRules.required(ARABIC_SALES_MESSAGES.MEETING_DATE_REQUIRED)]));
                  }}
                  className={meetingTimeValidation.messages.length > 0 ? "border-destructive" : ""}
                />
                <ValidationMessage result={meetingTimeValidation} />
              </div>

              <div className="space-y-2">
                <Label>{ARABIC_SALES_MESSAGES.OUTCOME_LABEL}</Label>
                <Select value={newMeetingOutcome} onValueChange={(value) => {
                  setNewMeetingOutcome(value);
                  setMeetingOutcomeValidation(validateField(value, [ValidationRules.required(ARABIC_SALES_MESSAGES.OUTCOME_REQUIRED)]));
                }}>
                  <SelectTrigger className={meetingOutcomeValidation.messages.length > 0 ? "border-destructive" : ""}>
                    <SelectValue placeholder={ARABIC_SALES_MESSAGES.OUTCOME_PLACEHOLDER} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">{ARABIC_SALES_MESSAGES.OUTCOME_POSITIVE}</SelectItem>
                    <SelectItem value="negative">{ARABIC_SALES_MESSAGES.OUTCOME_NEGATIVE}</SelectItem>
                    <SelectItem value="pending">{ARABIC_SALES_MESSAGES.OUTCOME_PENDING}</SelectItem>
                  </SelectContent>
                </Select>
                <ValidationMessage result={meetingOutcomeValidation} />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label>{ARABIC_SALES_MESSAGES.NOTES_LABEL}</Label>
                <Textarea
                  placeholder={ARABIC_SALES_MESSAGES.NOTES_PLACEHOLDER}
                  value={newMeetingNotes}
                  onChange={(e) => {
                    setNewMeetingNotes(e.target.value);
                    setMeetingNotesValidation(validateField(e.target.value, [ValidationRules.maxLength(500, ARABIC_SALES_MESSAGES.NOTES_MAX_LENGTH)]));
                  }}
                  rows={3}
                  className={meetingNotesValidation.messages.length > 0 ? "border-destructive" : ""}
                />
                <ValidationMessage result={meetingNotesValidation} />
              </div>

              <div className="md:col-span-2 flex gap-2">
                <Button onClick={handleAddMeeting} disabled={loading} className="flex-1">
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                      جاري الإضافة...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 ml-2" />
                      إضافة الاجتماع
                    </>
                  )}
                </Button>
                <Button variant="outline" onClick={clearForm} disabled={loading}>
                  مسح النموذج
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meetings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            اجتماعات اليوم ({meetings.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dataLoading ? (
            <TableSkeleton />
          ) : meetings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد اجتماعات لهذا اليوم</p>
            </div>
          ) : isMobile ? (
            <React.Suspense fallback={<div>جاري التحميل...</div>}>
              <MobileSalesTable
                meetings={paginatedMeetings}
                onDeleteMeeting={(id) => {
                  setMeetingToDelete(id);
                  setIsDeleteDialogOpen(true);
                }}
                onUpdateNotes={handleUpdateMeetingNotes}
                loading={loading}
              />
            </React.Suspense>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-right p-2">اسم العميل</th>
                    <th className="text-right p-2">جهة الاتصال</th>
                    <th className="text-right p-2">رقم الهاتف</th>
                    <th className="text-right p-2">وقت الاجتماع</th>
                    <th className="text-right p-2">النتيجة</th>
                    <th className="text-right p-2">الملاحظات</th>
                    <th className="text-right p-2">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMeetings.map((meeting) => (
                    <tr key={meeting.id} className="border-b hover:bg-muted/50">
                      <td className="p-2 font-medium">{meeting.customerName}</td>
                      <td className="p-2">{meeting.contactPerson}</td>
                      <td className="p-2">{meeting.phoneNumber}</td>
                      <td className="p-2">
                        {format(meeting.meetingDate, 'HH:mm', { locale: arLocale })}
                      </td>
                      <td className="p-2">
                        <Badge 
                          variant={
                            meeting.outcome === 'positive' ? 'default' :
                            meeting.outcome === 'negative' ? 'destructive' : 'secondary'
                          }
                        >
                          {meeting.outcome === 'positive' ? 'إيجابية' :
                           meeting.outcome === 'negative' ? 'سلبية' : 'معلقة'}
                        </Badge>
                      </td>
                      <td className="p-2 max-w-xs truncate">{meeting.notes}</td>
                      <td className="p-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setMeetingToDelete(meeting.id);
                            setIsDeleteDialogOpen(true);
                          }}
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                صفحة {currentPage} من {totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  السابق
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  التالي
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setMeetingToDelete(null);
        }}
        onConfirm={() => {
          if (meetingToDelete) {
            handleDeleteMeeting(meetingToDelete);
          }
        }}
        title="حذف الاجتماع"
        description="هل أنت متأكد من حذف هذا الاجتماع؟ لا يمكن التراجع عن هذا الإجراء."
        isLoading={loading}
      />
    </div>
  );
};
