import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import DOMPurify from 'dompurify';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Users, Phone, Mail, Calendar, Search, Filter, Award, UserPlus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatCurrency, formatInputNumber, isValidEnglishNumber, parseEnglishNumber } from '@/lib/numberUtils';
import { useFormValidation, ValidationRules, ValidationMessage } from '@/components/ui/enhanced-form-validation';
import { DeleteConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { ARABIC_CUSTOMERS_MESSAGES } from '@/lib/arabicCustomersMessages';
import { TableSkeleton } from '@/components/ui/loading-skeleton';

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  company?: string;
  status: 'new' | 'contacted' | 'interested' | 'converted' | 'inactive';
  source: 'website' | 'referral' | 'social_media' | 'direct' | 'other';
  registrationDate: Date;
  lastContactDate?: Date;
  notes: string;
  estimatedValue?: number;
}

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  // Pagination
  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Simulate fetching data
    const timer = setTimeout(() => {
      setCustomers([]); // Initially empty for demo
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Form states
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newStatus, setNewStatus] = useState<Customer['status']>('new');
  const [newSource, setNewSource] = useState<Customer['source']>('website');
  const [newNotes, setNewNotes] = useState('');
  const [newEstimatedValue, setNewEstimatedValue] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);

  const { validateField, validateForm } = useFormValidation();

  const [nameValidation, setNameValidation] = useState(validateField('', [ValidationRules.required()]));
  const [emailValidation, setEmailValidation] = useState(validateField('', [ValidationRules.email()]));
  const [phoneValidation, setPhoneValidation] = useState(validateField('', [ValidationRules.phone(ARABIC_CUSTOMERS_MESSAGES.VALIDATION_PHONE_INVALID || 'رقم الهاتف غير صالح')]));

  const addCustomer = () => {
    const isFormValid = validateForm({
      newName: { value: newName, rules: [ValidationRules.required()] },
      newEmail: { value: newEmail, rules: [ValidationRules.email()] },
      newPhone: { value: newPhone, rules: [] },
    });

    if (isFormValid) {
      const customer: Customer = {
        id: Date.now().toString(),
        name: newName,
        email: newEmail || undefined,
        phone: newPhone,
        company: newCompany,
        status: newStatus,
        source: newSource,
        registrationDate: new Date(),
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
    setCustomerToDelete(id);
    setShowDeleteDialog(true);
  };

  const confirmDeleteCustomer = () => {
    if (customerToDelete) {
      setCustomers(customers.filter(customer => customer.id !== customerToDelete));
      setCustomerToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  const updateCustomerStatus = (id: string, status: Customer['status']) => {
    setCustomers(customers.map(customer => 
      customer.id === id 
        ? { ...customer, status, lastContactDate: new Date() }
        : customer
    ));
  };

  const getStatusColor = (status: Customer['status']) => {
    switch (status) {
      case 'new':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700';
      case 'contacted':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-700';
      case 'interested':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700';
      case 'converted':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700';
      case 'inactive':
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900 dark:text-gray-200 dark:border-gray-700';
    }
  };

  const getStatusLabel = (status: Customer['status']) => {
    switch (status) {
      case 'new': return ARABIC_CUSTOMERS_MESSAGES.STATUS_NEW;
      case 'contacted': return ARABIC_CUSTOMERS_MESSAGES.STATUS_CONTACTED;
      case 'interested': return ARABIC_CUSTOMERS_MESSAGES.STATUS_INTERESTED;
      case 'converted': return ARABIC_CUSTOMERS_MESSAGES.STATUS_CONVERTED;
      case 'inactive': return ARABIC_CUSTOMERS_MESSAGES.STATUS_INACTIVE;
    }
  };

  const getSourceLabel = (source: Customer['source']) => {
    switch (source) {
      case 'website': return ARABIC_CUSTOMERS_MESSAGES.SOURCE_WEBSITE;
      case 'referral': return ARABIC_CUSTOMERS_MESSAGES.SOURCE_REFERRAL;
      case 'social_media': return ARABIC_CUSTOMERS_MESSAGES.SOURCE_SOCIAL_MEDIA;
      case 'direct': return ARABIC_CUSTOMERS_MESSAGES.SOURCE_DIRECT;
      case 'other': return ARABIC_CUSTOMERS_MESSAGES.SOURCE_OTHER;
    }
  };

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         (customer.company?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    const matchesSource = sourceFilter === 'all' || customer.source === sourceFilter;
    
    return matchesSearch && matchesStatus && matchesSource;
  });

  const paginatedCustomers = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredCustomers.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredCustomers, currentPage]);

  // Statistics
  const totalCustomers = customers.length;
  const newCustomers = customers.filter(c => c.status === 'new').length;
  const convertedCustomers = customers.filter(c => c.status === 'converted').length;
  const totalEstimatedValue = customers.reduce((sum, c) => sum + (c.estimatedValue || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">{ARABIC_CUSTOMERS_MESSAGES.PAGE_TITLE}</h1>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {ARABIC_CUSTOMERS_MESSAGES.TODAY_DATE} {new Date().toLocaleDateString('ar-EG')}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600">{ARABIC_CUSTOMERS_MESSAGES.TOTAL_CUSTOMERS}</p>
                <p className="text-2xl font-bold text-blue-700">{totalCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-green-600">{ARABIC_CUSTOMERS_MESSAGES.NEW_CUSTOMERS}</p>
                <p className="text-2xl font-bold text-green-700">{newCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50 dark:bg-purple-950/20 dark:border-purple-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600">{ARABIC_CUSTOMERS_MESSAGES.CONVERTED_CUSTOMERS}</p>
                <p className="text-2xl font-bold text-purple-700">{convertedCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">{ARABIC_CUSTOMERS_MESSAGES.ESTIMATED_VALUE}</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalEstimatedValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Customer */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">{ARABIC_CUSTOMERS_MESSAGES.ADD_CUSTOMER_TITLE}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{ARABIC_CUSTOMERS_MESSAGES.NAME_LABEL}</Label>
              <Input
                placeholder={ARABIC_CUSTOMERS_MESSAGES.NAME_PLACEHOLDER}
                value={newName}
                onChange={(e) => {
                  setNewName(e.target.value);
                  setNameValidation(validateField(e.target.value, [ValidationRules.required()]));
                }}
              />
              <ValidationMessage result={nameValidation} />
            </div>
            <div className="space-y-2">
              <Label>{ARABIC_CUSTOMERS_MESSAGES.EMAIL_LABEL}</Label>
              <Input
                type="email"
                placeholder={ARABIC_CUSTOMERS_MESSAGES.EMAIL_PLACEHOLDER}
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  setEmailValidation(validateField(e.target.value, [ValidationRules.email()]));
                }}
              />
              <ValidationMessage result={emailValidation} />
            </div>
            <div className="space-y-2">
              <Label>{ARABIC_CUSTOMERS_MESSAGES.PHONE_LABEL}</Label>
              <Input
                placeholder={ARABIC_CUSTOMERS_MESSAGES.PHONE_PLACEHOLDER}
                value={newPhone}
                onChange={(e) => {
                  setNewPhone(e.target.value);
                  setPhoneValidation(validateField(e.target.value, []));
                }}
              />
              <ValidationMessage result={phoneValidation} />
            </div>
            <div className="space-y-2">
              <Label>{ARABIC_CUSTOMERS_MESSAGES.COMPANY_LABEL}</Label>
              <Input
                placeholder={ARABIC_CUSTOMERS_MESSAGES.COMPANY_PLACEHOLDER}
                value={newCompany}
                onChange={(e) => setNewCompany(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>{ARABIC_CUSTOMERS_MESSAGES.STATUS_LABEL}</Label>
              <Select value={newStatus} onValueChange={(value: Customer['status']) => setNewStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">{ARABIC_CUSTOMERS_MESSAGES.STATUS_NEW}</SelectItem>
                  <SelectItem value="contacted">{ARABIC_CUSTOMERS_MESSAGES.STATUS_CONTACTED}</SelectItem>
                  <SelectItem value="interested">{ARABIC_CUSTOMERS_MESSAGES.STATUS_INTERESTED}</SelectItem>
                  <SelectItem value="converted">{ARABIC_CUSTOMERS_MESSAGES.STATUS_CONVERTED}</SelectItem>
                  <SelectItem value="inactive">{ARABIC_CUSTOMERS_MESSAGES.STATUS_INACTIVE}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{ARABIC_CUSTOMERS_MESSAGES.SOURCE_LABEL}</Label>
              <Select value={newSource} onValueChange={(value: Customer['source']) => setNewSource(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="website">{ARABIC_CUSTOMERS_MESSAGES.SOURCE_WEBSITE}</SelectItem>
                  <SelectItem value="referral">{ARABIC_CUSTOMERS_MESSAGES.SOURCE_REFERRAL}</SelectItem>
                  <SelectItem value="social_media">{ARABIC_CUSTOMERS_MESSAGES.SOURCE_SOCIAL_MEDIA}</SelectItem>
                  <SelectItem value="direct">{ARABIC_CUSTOMERS_MESSAGES.SOURCE_DIRECT}</SelectItem>
                  <SelectItem value="other">{ARABIC_CUSTOMERS_MESSAGES.SOURCE_OTHER}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{ARABIC_CUSTOMERS_MESSAGES.ESTIMATED_VALUE_LABEL}</Label>
              <Input
                type="text"
                placeholder={ARABIC_CUSTOMERS_MESSAGES.ESTIMATED_VALUE_PLACEHOLDER}
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
              <Label>{ARABIC_CUSTOMERS_MESSAGES.NOTES_LABEL}</Label>
              <Textarea
                placeholder={ARABIC_CUSTOMERS_MESSAGES.NOTES_PLACEHOLDER}
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <Button
                onClick={addCustomer}
                variant="default"
                disabled={!nameValidation.isValid}
              >
                <Plus className="w-4 h-4 ml-2" />
                {ARABIC_CUSTOMERS_MESSAGES.ADD_CUSTOMER_BUTTON}
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
                placeholder={ARABIC_CUSTOMERS_MESSAGES.SEARCH_PLACEHOLDER}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 ml-2" />
                <SelectValue placeholder={ARABIC_CUSTOMERS_MESSAGES.FILTER_BY_STATUS_PLACEHOLDER} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{ARABIC_CUSTOMERS_MESSAGES.ALL_STATUSES}</SelectItem>
                <SelectItem value="new">{ARABIC_CUSTOMERS_MESSAGES.STATUS_NEW}</SelectItem>
                <SelectItem value="contacted">{ARABIC_CUSTOMERS_MESSAGES.STATUS_CONTACTED}</SelectItem>
                <SelectItem value="interested">{ARABIC_CUSTOMERS_MESSAGES.STATUS_INTERESTED}</SelectItem>
                <SelectItem value="converted">{ARABIC_CUSTOMERS_MESSAGES.STATUS_CONVERTED}</SelectItem>
                <SelectItem value="inactive">{ARABIC_CUSTOMERS_MESSAGES.STATUS_INACTIVE}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder={ARABIC_CUSTOMERS_MESSAGES.FILTER_BY_SOURCE_PLACEHOLDER} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{ARABIC_CUSTOMERS_MESSAGES.ALL_SOURCES}</SelectItem>
                <SelectItem value="website">{ARABIC_CUSTOMERS_MESSAGES.SOURCE_WEBSITE}</SelectItem>
                <SelectItem value="referral">{ARABIC_CUSTOMERS_MESSAGES.SOURCE_REFERRAL}</SelectItem>
                <SelectItem value="social_media">{ARABIC_CUSTOMERS_MESSAGES.SOURCE_SOCIAL_MEDIA}</SelectItem>
                <SelectItem value="direct">{ARABIC_CUSTOMERS_MESSAGES.SOURCE_DIRECT}</SelectItem>
                <SelectItem value="other">{ARABIC_CUSTOMERS_MESSAGES.SOURCE_OTHER}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Customers List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">{ARABIC_CUSTOMERS_MESSAGES.CUSTOMERS_LIST_TITLE(filteredCustomers.length)}</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton />
          ) : filteredCustomers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{customers.length === 0 ? ARABIC_CUSTOMERS_MESSAGES.NO_CUSTOMERS_ADDED : ARABIC_CUSTOMERS_MESSAGES.NO_MATCHING_CUSTOMERS}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {paginatedCustomers.map((customer) => (
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
                          {customer.email && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4" />
                              <span>{customer.email}</span>
                            </div>
                          )}
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
                            <span>{ARABIC_CUSTOMERS_MESSAGES.REGISTERED_ON} {new Date(customer.registrationDate).toLocaleDateString('ar-EG')}</span>
                          </div>
                          {customer.lastContactDate && (
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              <span>{ARABIC_CUSTOMERS_MESSAGES.LAST_CONTACT} {new Date(customer.lastContactDate).toLocaleDateString('ar-EG')}</span>
                            </div>
                          )}
                          {customer.estimatedValue && (
                            <div className="flex items-center gap-2">
                              <span>{ARABIC_CUSTOMERS_MESSAGES.ESTIMATED_VALUE_DISPLAY(customer.estimatedValue.toLocaleString('ar-EG'))}</span>
                            </div>
                          )}
                        </div>

                        {customer.notes && (
                          <div
                            className="text-sm text-muted-foreground mb-3 p-2 bg-background-muted rounded"
                            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(customer.notes) }}
                          />
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
                              <SelectItem value="new">{ARABIC_CUSTOMERS_MESSAGES.STATUS_NEW}</SelectItem>
                              <SelectItem value="contacted">{ARABIC_CUSTOMERS_MESSAGES.STATUS_CONTACTED}</SelectItem>
                              <SelectItem value="interested">{ARABIC_CUSTOMERS_MESSAGES.STATUS_INTERESTED}</SelectItem>
                              <SelectItem value="converted">{ARABIC_CUSTOMERS_MESSAGES.STATUS_CONVERTED}</SelectItem>
                              <SelectItem value="inactive">{ARABIC_CUSTOMERS_MESSAGES.STATUS_INACTIVE}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCustomer(customer.id)}
                        className="text-red-600 hover:bg-red-100"
                        aria-label={`${ARABIC_CUSTOMERS_MESSAGES.DELETE_CONFIRM_ITEM_NAME}`}
                        title={`${ARABIC_CUSTOMERS_MESSAGES.DELETE_CONFIRM_ITEM_NAME}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {/* Pagination Controls */}
              <div className="flex items-center justify-between pt-4">
                <span className="text-sm text-muted-foreground">
                  {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredCustomers.length)}-
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredCustomers.length)} من {filteredCustomers.length}
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
                    onClick={() => setCurrentPage(p => (p * ITEMS_PER_PAGE < filteredCustomers.length ? p + 1 : p))}
                    disabled={currentPage * ITEMS_PER_PAGE >= filteredCustomers.length}
                  >
                    التالي
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Save Note */}
      <Alert>
        <AlertDescription>
          {ARABIC_CUSTOMERS_MESSAGES.SAVE_NOTE_ALERT}
        </AlertDescription>
      </Alert>

      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={confirmDeleteCustomer}
        itemName={customerToDelete ? customers.find(c => c.id === customerToDelete)?.name : ARABIC_CUSTOMERS_MESSAGES.DELETE_CONFIRM_ITEM_NAME}
      />
    </div>
  );
};

// Add displayName to the component
Customers.displayName = 'Customers';