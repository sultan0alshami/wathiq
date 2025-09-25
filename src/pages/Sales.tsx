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
import { ARABIC_SALES_MESSAGES } from '@/lib/arabicSalesMessages';
import { ar as arLocale } from 'date-fns/locale/ar';

export const Sales: React.FC = () => {
  const { currentDate } = useDateContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [meetingToDelete, setMeetingToDelete] = useState<string | null>(null);
  
  const [newCustomersContacted, setNewCustomersContacted] = useState<number>(0);
  const [meetings, setMeetings] = useState<SalesEntry[]>([]);
  const [dailySummary, setDailySummary] = useState('');

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
  const [phoneNumberValidation, setPhoneNumberValidation] = useState(validateField('', [ValidationRules.required(ARABIC_SALES_MESSAGES.CUSTOMER_PHONE_LABEL), ValidationRules.phone(ARABIC_SALES_MESSAGES.VALIDATION_PHONE_INVALID)]));
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
    const isPhoneNumberValid = validateField(newMeetingPhoneNumber, [ValidationRules.required(ARABIC_SALES_MESSAGES.CUSTOMER_PHONE_LABEL), ValidationRules.phone(ARABIC_SALES_MESSAGES.VALIDATION_PHONE_INVALID)]).isValid;
    const isMeetingTimeValid = validateField(newMeetingTime, [ValidationRules.required(ARABIC_SALES_MESSAGES.MEETING_DATE_REQUIRED)]).isValid;
    const isMeetingOutcomeValid = validateField(newMeetingOutcome, [ValidationRules.required(ARABIC_SALES_MESSAGES.OUTCOME_REQUIRED)]).isValid;
    const isMeetingNotesValid = validateField(newMeetingNotes, [ValidationRules.maxLength(500, ARABIC_SALES_MESSAGES.NOTES_MAX_LENGTH)]).isValid;

    if (!isCustomerNameValid || !isContactNumberValid || !isPhoneNumberValid || !isMeetingTimeValid || !isMeetingOutcomeValid || !isMeetingNotesValid) {
      setCustomerNameValidation(validateField(newMeetingCustomer, [ValidationRules.required(ARABIC_SALES_MESSAGES.MEETING_TITLE_REQUIRED), ValidationRules.minLength(3, ARABIC_SALES_MESSAGES.MEETING_TITLE_MIN_LENGTH)]));
      setContactNumberValidation(validateField(newMeetingContact, [ValidationRules.required(ARABIC_SALES_MESSAGES.CLIENT_NAME_REQUIRED)]));
      setPhoneNumberValidation(validateField(newMeetingPhoneNumber, [ValidationRules.required(ARABIC_SALES_MESSAGES.CUSTOMER_PHONE_LABEL), ValidationRules.phone(ARABIC_SALES_MESSAGES.VALIDATION_PHONE_INVALID)]));
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
      setPhoneNumberValidation(validateField('', [ValidationRules.required(ARABIC_SALES_MESSAGES.CUSTOMER_PHONE_LABEL), ValidationRules.phone(ARABIC_SALES_MESSAGES.VALIDATION_PHONE_INVALID)]));
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
      toast({
        title: ARABIC_SALES_MESSAGES.TOAST_DELETE_ERROR_TITLE,
        description: ARABIC_SALES_MESSAGES.TOAST_DELETE_ERROR_DESCRIPTION,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setMeetingToDelete(null);
    }
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">{ARABIC_SALES_MESSAGES.PAGE_TITLE}</h1>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {ARABIC_SALES_MESSAGES.TODAY_DATE} {format(currentDate, 'dd/MM/yyyy', { locale: arLocale })}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {loading ? (
          <>
            <KPICardSkeleton />
            <KPICardSkeleton />
            <KPICardSkeleton />
            <KPICardSkeleton />
          </>
        ) : (
          <>
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600">{ARABIC_SALES_MESSAGES.TOTAL_MEETINGS}</p>
                    <p className="text-2xl font-bold text-blue-700">{meetings.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <ClipboardCheck className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600">{ARABIC_SALES_MESSAGES.COMPLETED_MEETINGS}</p>
                    <p className="text-2xl font-bold text-green-700">{completedMeetings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-purple-50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="text-sm text-purple-600">{ARABIC_SALES_MESSAGES.PENDING_MEETINGS}</p>
                    <p className="text-2xl font-bold text-purple-700">{meetings.length - completedMeetings}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">{ARABIC_SALES_MESSAGES.SUCCESS_RATE}</p>
                    <p className="text-2xl font-bold text-primary">{conversionRate}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

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
          {/* Add Meeting Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-background-muted rounded-lg border">
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
                  setPhoneNumberValidation(validateField(e.target.value, [ValidationRules.required(ARABIC_SALES_MESSAGES.CUSTOMER_PHONE_LABEL), ValidationRules.phone(ARABIC_SALES_MESSAGES.VALIDATION_PHONE_INVALID)]));
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
              <Button onClick={addMeeting} disabled={loading || !customerNameValidation.isValid || !contactNumberValidation.isValid || !phoneNumberValidation.isValid || !meetingTimeValidation.isValid || !meetingOutcomeValidation.isValid || !meetingNotesValidation.isValid} className="bg-primary hover:bg-primary/90">
                {loading ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Plus className="w-4 h-4 ml-2" />}
                {ARABIC_SALES_MESSAGES.ADD_MEETING_BUTTON}
              </Button>
            </div>
          </div>

          {/* Meetings List */}
          {loading ? (
            <TableSkeleton rows={3} columns={4} />
          ) : (
            meetings.length > 0 && (
              <div className="space-y-3">
                {meetings.map((meeting) => (
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
                        >
                          <Trash2 className="w-4 h-4" />
                          {ARABIC_SALES_MESSAGES.DELETE_CONFIRM_ITEM_NAME}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )
          )}
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={handleRemoveMeeting}
        itemName={ARABIC_SALES_MESSAGES.DELETE_CONFIRM_ITEM_NAME}
      />

      {/* Daily Summary */}
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
              rows={4}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

    </div>
  );
};