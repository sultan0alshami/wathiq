import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Users, Calendar, FileText, TrendingUp, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDateContext } from '@/contexts/DateContext';
import { getDataForDate, updateSectionData, type SalesEntry } from '@/lib/mockData';

export const Sales: React.FC = () => {
  const { currentDate } = useDateContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [newCustomersContacted, setNewCustomersContacted] = useState<number>(0);
  const [meetings, setMeetings] = useState<SalesEntry[]>([]);
  const [dailySummary, setDailySummary] = useState('');

  // Meeting form states
  const [newMeetingCustomer, setNewMeetingCustomer] = useState('');
  const [newMeetingContact, setNewMeetingContact] = useState('');
  const [newMeetingNotes, setNewMeetingNotes] = useState('');
  const [newMeetingTime, setNewMeetingTime] = useState('');
  const [newMeetingOutcome, setNewMeetingOutcome] = useState<'positive' | 'negative' | 'pending'>('pending');

  // Load data on mount and date change
  useEffect(() => {
    const data = getDataForDate(currentDate);
    setNewCustomersContacted(data.sales.customersContacted);
    setMeetings(data.sales.entries);
    setDailySummary(data.sales.dailySummary);
  }, [currentDate]);

  const addMeeting = async () => {
    if (newMeetingCustomer && newMeetingContact) {
      setLoading(true);
      try {
        const meeting: SalesEntry = {
          id: Date.now().toString(),
          customerName: newMeetingCustomer,
          contactNumber: newMeetingContact,
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
        
        // Reset form
        setNewMeetingCustomer('');
        setNewMeetingContact('');
        setNewMeetingNotes('');
        setNewMeetingTime('');
        setNewMeetingOutcome('pending');
        
        toast({
          title: "تم إضافة الاجتماع",
          description: "تم حفظ الاجتماع بنجاح",
        });
      } catch (error) {
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء حفظ الاجتماع",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const removeMeeting = async (id: string) => {
    setLoading(true);
    try {
      const updatedMeetings = meetings.filter(meeting => meeting.id !== id);
      setMeetings(updatedMeetings);
      
      updateSectionData(currentDate, 'sales', {
        customersContacted: newCustomersContacted,
        entries: updatedMeetings,
        dailySummary,
      });
      
      toast({
        title: "تم حذف الاجتماع",
        description: "تم حذف الاجتماع بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف الاجتماع",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ البيانات",
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
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ الملخص",
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
        <h1 className="text-3xl font-bold text-primary">المبيعات</h1>
        <Badge variant="outline" className="text-lg px-4 py-2">
          اليوم: {new Date().toLocaleDateString('ar-EG')}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600">العملاء المتصلين</p>
                <p className="text-2xl font-bold text-blue-700">{newCustomersContacted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-green-600">الاجتماعات اليوم</p>
                <p className="text-2xl font-bold text-green-700">{meetings.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600">الاجتماعات المكتملة</p>
                <p className="text-2xl font-bold text-purple-700">{completedMeetings}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">معدل التحويل</p>
                <p className="text-2xl font-bold text-primary">{conversionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* New Customers Contacted */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">العملاء الجدد المتصلين</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="customers">عدد العملاء الجدد</Label>
            <Input
              id="customers"
              type="number"
              min="0"
              value={newCustomersContacted}
              onChange={(e) => updateCustomersContacted(parseInt(e.target.value) || 0)}
              className="max-w-xs"
              placeholder="أدخل عدد العملاء"
            />
          </div>
        </CardContent>
      </Card>

      {/* Daily Meetings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">الاجتماعات اليومية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Meeting Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-background-muted rounded-lg border">
            <div className="space-y-2">
              <Label>اسم العميل</Label>
              <Input
                placeholder="اسم العميل"
                value={newMeetingCustomer}
                onChange={(e) => setNewMeetingCustomer(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>رقم الهاتف</Label>
              <Input
                placeholder="رقم التواصل"
                value={newMeetingContact}
                onChange={(e) => setNewMeetingContact(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>توقيت الاجتماع</Label>
              <Input
                type="time"
                value={newMeetingTime}
                onChange={(e) => setNewMeetingTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>النتيجة</Label>
              <select 
                value={newMeetingOutcome} 
                onChange={(e) => setNewMeetingOutcome(e.target.value as 'positive' | 'negative' | 'pending')}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="pending">قيد الانتظار</option>
                <option value="positive">إيجابية</option>
                <option value="negative">سلبية</option>
              </select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>ملاحظات</Label>
              <Textarea
                placeholder="ملاحظات الاجتماع..."
                value={newMeetingNotes}
                onChange={(e) => setNewMeetingNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <Button onClick={addMeeting} disabled={loading} className="bg-primary hover:bg-primary/90">
                {loading ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Plus className="w-4 h-4 ml-2" />}
                إضافة اجتماع
              </Button>
            </div>
          </div>

          {/* Meetings List */}
          {meetings.length > 0 && (
            <div className="space-y-3">
              {meetings.map((meeting) => (
                <Card key={meeting.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{meeting.customerName}</h3>
                          <Badge variant="outline" className={
                            meeting.outcome === 'positive' ? 'bg-green-50 text-green-700 border-green-200' :
                            meeting.outcome === 'negative' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                          }>
                            {meeting.outcome === 'positive' ? 'إيجابية' : 
                             meeting.outcome === 'negative' ? 'سلبية' : 'قيد الانتظار'}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <p><span className="font-medium">رقم الهاتف:</span> {meeting.contactNumber}</p>
                          <p><span className="font-medium">التوقيت:</span> {meeting.meetingTime || 'غير محدد'}</p>
                          <p><span className="font-medium">تاريخ الاجتماع:</span> {meeting.meetingDate.toLocaleDateString('ar-EG')}</p>
                          {meeting.notes && (
                            <p className="col-span-2"><span className="font-medium">الملاحظات:</span> {meeting.notes}</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeMeeting(meeting.id)}
                        className="text-red-600 hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Daily Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">ملخص اليوم</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Textarea
              placeholder="اكتب ملخص أنشطة المبيعات لهذا اليوم..."
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