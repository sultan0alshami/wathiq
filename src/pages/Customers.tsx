import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Users, Phone, Mail, Calendar, Search, Filter } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency, formatInputNumber, parseEnglishNumber, isValidEnglishNumber } from '@/lib/numberUtils';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  status: 'new' | 'contacted' | 'interested' | 'converted' | 'inactive';
  source: 'website' | 'referral' | 'social_media' | 'direct' | 'other';
  registrationDate: string;
  lastContactDate?: string;
  notes: string;
  estimatedValue?: number;
}

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');

  // Form states
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newStatus, setNewStatus] = useState<Customer['status']>('new');
  const [newSource, setNewSource] = useState<Customer['source']>('website');
  const [newNotes, setNewNotes] = useState('');
  const [newEstimatedValue, setNewEstimatedValue] = useState('');

  const addCustomer = () => {
    if (newName && newEmail) {
      const customer: Customer = {
        id: Date.now().toString(),
        name: newName,
        email: newEmail,
        phone: newPhone,
        company: newCompany,
        status: newStatus,
        source: newSource,
        registrationDate: new Date().toISOString(),
        notes: newNotes,
        estimatedValue: newEstimatedValue ? parseEnglishNumber(newEstimatedValue) : undefined,
      };
      setCustomers([...customers, customer]);
      
      // Reset form
      setNewName('');
      setNewEmail('');
      setNewPhone('');
      setNewCompany('');
      setNewStatus('new');
      setNewSource('website');
      setNewNotes('');
      setNewEstimatedValue('');
    }
  };

  const removeCustomer = (id: string) => {
    setCustomers(customers.filter(customer => customer.id !== id));
  };

  const updateCustomerStatus = (id: string, status: Customer['status']) => {
    setCustomers(customers.map(customer => 
      customer.id === id 
        ? { ...customer, status, lastContactDate: new Date().toISOString() }
        : customer
    ));
  };

  const getStatusColor = (status: Customer['status']) => {
    switch (status) {
      case 'new':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'contacted':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'interested':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'converted':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'inactive':
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: Customer['status']) => {
    switch (status) {
      case 'new': return 'جديد';
      case 'contacted': return 'تم التواصل';
      case 'interested': return 'مهتم';
      case 'converted': return 'تم التحويل';
      case 'inactive': return 'غير نشط';
    }
  };

  const getSourceLabel = (source: Customer['source']) => {
    switch (source) {
      case 'website': return 'الموقع الإلكتروني';
      case 'referral': return 'إحالة';
      case 'social_media': return 'وسائل التواصل';
      case 'direct': return 'مباشر';
      case 'other': return 'أخرى';
    }
  };

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (customer.company?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || customer.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  // Statistics
  const totalCustomers = customers.length;
  const newCustomers = customers.filter(c => c.status === 'new').length;
  const convertedCustomers = customers.filter(c => c.status === 'converted').length;
  const totalEstimatedValue = customers.reduce((sum, c) => sum + (c.estimatedValue || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">العملاء</h1>
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
                <p className="text-sm text-blue-600">إجمالي العملاء</p>
                <p className="text-2xl font-bold text-blue-700">{totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-green-600">عملاء جدد</p>
                <p className="text-2xl font-bold text-green-700">{newCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600">عملاء محولين</p>
                <p className="text-2xl font-bold text-purple-700">{convertedCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">القيمة المقدرة</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalEstimatedValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Customer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">إضافة عميل جديد</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>الاسم *</Label>
              <Input
                placeholder="اسم العميل الكامل"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>البريد الإلكتروني *</Label>
              <Input
                type="email"
                placeholder="example@domain.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>رقم الهاتف</Label>
              <Input
                placeholder="05xxxxxxxx"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>الشركة</Label>
              <Input
                placeholder="اسم الشركة (اختياري)"
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select value={newStatus} onValueChange={(value: Customer['status']) => setNewStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">جديد</SelectItem>
                  <SelectItem value="contacted">تم التواصل</SelectItem>
                  <SelectItem value="interested">مهتم</SelectItem>
                  <SelectItem value="converted">تم التحويل</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>المصدر</Label>
              <Select value={newSource} onValueChange={(value: Customer['source']) => setNewSource(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">الموقع الإلكتروني</SelectItem>
                  <SelectItem value="referral">إحالة</SelectItem>
                  <SelectItem value="social_media">وسائل التواصل</SelectItem>
                  <SelectItem value="direct">مباشر</SelectItem>
                  <SelectItem value="other">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>القيمة المقدرة (ريال)</Label>
              <Input
                type="text"
                placeholder="0"
                value={newEstimatedValue}
                onChange={(e) => {
                  const value = formatInputNumber(e.target.value);
                  if (isValidEnglishNumber(value)) {
                    setNewEstimatedValue(value);
                  }
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Textarea
                placeholder="ملاحظات إضافية عن العميل..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <Button onClick={addCustomer} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 ml-2" />
                إضافة عميل
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="البحث في العملاء..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 ml-2" />
                <SelectValue placeholder="فلترة بالحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الحالات</SelectItem>
                <SelectItem value="new">جديد</SelectItem>
                <SelectItem value="contacted">تم التواصل</SelectItem>
                <SelectItem value="interested">مهتم</SelectItem>
                <SelectItem value="converted">تم التحويل</SelectItem>
                <SelectItem value="inactive">غير نشط</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="فلترة بالمصدر" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع المصادر</SelectItem>
                <SelectItem value="website">الموقع الإلكتروني</SelectItem>
                <SelectItem value="referral">إحالة</SelectItem>
                <SelectItem value="social_media">وسائل التواصل</SelectItem>
                <SelectItem value="direct">مباشر</SelectItem>
                <SelectItem value="other">أخرى</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">قائمة العملاء ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCustomers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{customers.length === 0 ? 'لا توجد عملاء مضافين بعد' : 'لم يتم العثور على عملاء مطابقين للفلاتر'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCustomers.map((customer) => (
                <Card key={customer.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <h3 className="text-lg font-semibold">{customer.name}</h3>
                          <Badge className={getStatusColor(customer.status)}>
                            {getStatusLabel(customer.status)}
                          </Badge>
                          <Badge variant="outline">
                            {getSourceLabel(customer.source)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            <span>{customer.email}</span>
                          </div>
                          {customer.phone && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>{customer.phone}</span>
                            </div>
                          )}
                          {customer.company && (
                            <div className="flex items-center gap-2">
                              <Users className="w-4 h-4" />
                              <span>{customer.company}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>مسجل: {new Date(customer.registrationDate).toLocaleDateString('ar-EG')}</span>
                          </div>
                          {customer.lastContactDate && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>آخر اتصال: {new Date(customer.lastContactDate).toLocaleDateString('ar-EG')}</span>
                            </div>
                          )}
                          {customer.estimatedValue && (
                            <div className="flex items-center gap-2">
                              <span>القيمة المقدرة: {customer.estimatedValue.toLocaleString('ar-EG')} ريال</span>
                            </div>
                          )}
                        </div>

                        {customer.notes && (
                          <p className="text-sm text-muted-foreground mb-3 p-2 bg-background-muted rounded">
                            {customer.notes}
                          </p>
                        )}

                        <div className="flex gap-2">
                          <Select
                            value={customer.status}
                            onValueChange={(value: Customer['status']) => updateCustomerStatus(customer.id, value)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">جديد</SelectItem>
                              <SelectItem value="contacted">تم التواصل</SelectItem>
                              <SelectItem value="interested">مهتم</SelectItem>
                              <SelectItem value="converted">تم التحويل</SelectItem>
                              <SelectItem value="inactive">غير نشط</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomer(customer.id)}
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

      {/* Save Note */}
      <Alert>
        <AlertDescription>
          📝 ملاحظة: لحفظ البيانات بشكل دائم، يتطلب ربط قاعدة البيانات. البيانات الحالية محفوظة مؤقتاً في الجلسة فقط.
        </AlertDescription>
      </Alert>
    </div>
  );
};