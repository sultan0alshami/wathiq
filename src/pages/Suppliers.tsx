import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Plus, 
  Upload, 
  FileText, 
  Download, 
  Edit, 
  Trash2,
  Building2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users
} from 'lucide-react';
import { useDateContext } from '@/contexts/DateContext';
import { useDataWithDate } from '@/hooks/useLocalStorage';
import { useToast } from '@/hooks/use-toast';
import { Supplier, SupplierDocument } from '@/lib/mockData';
import { format } from 'date-fns';
import { useFormValidation, ValidationMessage, ValidationRules } from '@/components/ui/enhanced-form-validation';
import { DeleteConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { CardSkeleton, TableSkeleton } from '@/components/ui/loading-skeleton';
import { ARABIC_SUPPLIERS_MESSAGES } from '@/lib/arabicSuppliersMessages';

export const Suppliers: React.FC = () => {
  const { currentDate } = useDateContext();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [isDeleteConfirmationOpen, setIsDeleteConfirmationOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState<string | null>(null);
  const [dataLoading, setDataLoading] = useState(true); // New state for data loading

  // Use localStorage for suppliers data
  const { value: suppliers, setValue: setSuppliers } = useDataWithDate<Supplier[]>(
    'suppliers',
    currentDate,
    [],
    setDataLoading // Pass setDataLoading to useDataWithDate
  );

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    category: '',
    status: 'active' as 'active' | 'inactive',
    notes: ''
  });

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const { validateField, validateForm } = useFormValidation();

  const validationRules = {
    name: [ValidationRules.required(ARABIC_SUPPLIERS_MESSAGES.VALIDATION_NAME_REQUIRED), ValidationRules.minLength(3, ARABIC_SUPPLIERS_MESSAGES.VALIDATION_NAME_REQUIRED), ValidationRules.arabicText(ARABIC_SUPPLIERS_MESSAGES.VALIDATION_NAME_REQUIRED)],
    contactPerson: [ValidationRules.required(ARABIC_SUPPLIERS_MESSAGES.VALIDATION_CONTACT_PERSON_REQUIRED), ValidationRules.minLength(3, ARABIC_SUPPLIERS_MESSAGES.VALIDATION_CONTACT_PERSON_REQUIRED), ValidationRules.arabicText(ARABIC_SUPPLIERS_MESSAGES.VALIDATION_CONTACT_PERSON_REQUIRED)],
    phone: [ValidationRules.phone(ARABIC_SUPPLIERS_MESSAGES.VALIDATION_PHONE_INVALID)],
    email: [ValidationRules.email(ARABIC_SUPPLIERS_MESSAGES.VALIDATION_EMAIL_INVALID)],
    category: [ValidationRules.required(ARABIC_SUPPLIERS_MESSAGES.VALIDATION_CATEGORY_REQUIRED), ValidationRules.arabicText(ARABIC_SUPPLIERS_MESSAGES.VALIDATION_CATEGORY_REQUIRED)],
  };

  const [validationResults, setValidationResults] = useState<Record<string, { isValid: boolean; messages: { message: string; type: "error" | "warning" | "info"; }[] }>>({
    name: validateField('', validationRules.name),
    contactPerson: validateField('', validationRules.contactPerson),
    phone: validateField('', validationRules.phone),
    email: validateField('', validationRules.email),
    category: validateField('', validationRules.category),
  });
  const [formIsValid, setFormIsValid] = useState(false);

  const runFormValidation = () => {
    const newValidationResults: Record<string, { isValid: boolean; messages: { message: string; type: "error" | "warning" | "info"; }[] }> = {};
    let overallFormIsValid = true;

    (Object.keys(validationRules) as Array<keyof typeof validationRules>).forEach((fieldName) => {
      const rules = validationRules[fieldName];
      const result = validateField(formData[fieldName as keyof typeof formData], rules);
      newValidationResults[fieldName] = result;
      if (!result.isValid) {
        overallFormIsValid = false;
      }
    });
    setValidationResults(newValidationResults);
    setFormIsValid(overallFormIsValid);
    return overallFormIsValid;
  };

  const resetForm = () => {
    setFormData({
      name: '',
      contactPerson: '',
      phone: '',
      email: '',
      address: '',
      category: '',
      status: 'active',
      notes: ''
    });
    setUploadedFiles([]);
    setEditingSupplier(null);
    // Reset validation results to initial state
    setValidationResults({
      name: validateField('', validationRules.name),
      contactPerson: validateField('', validationRules.contactPerson),
      phone: validateField('', validationRules.phone),
      email: validateField('', validationRules.email),
      category: validateField('', validationRules.category),
    });
    setFormIsValid(false);
  };

  const handleAddSupplier = async () => {
    const currentFormIsValid = runFormValidation();
    if (!currentFormIsValid) {
      toast({
        title: ARABIC_SUPPLIERS_MESSAGES.FORM_VALIDATION_ERROR_TITLE,
        description: ARABIC_SUPPLIERS_MESSAGES.FORM_VALIDATION_ERROR_DESCRIPTION,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Create documents from uploaded files
      const documents: SupplierDocument[] = uploadedFiles.map((file, index) => ({
        id: `doc-${Date.now()}-${index}`,
        name: file.name,
        type: file.type,
        url: URL.createObjectURL(file), // In real app, this would be uploaded to server
        uploadDate: new Date(),
        description: `مستند ${file.name}`
      }));

      const newSupplier: Supplier = {
        id: editingSupplier ? editingSupplier.id : `supplier-${Date.now()}`,
        name: formData.name,
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        category: formData.category,
        status: formData.status,
        registrationDate: editingSupplier ? editingSupplier.registrationDate : new Date(),
        notes: formData.notes,
        documents: editingSupplier ? [...editingSupplier.documents, ...documents] : documents
      };

      if (editingSupplier) {
        const updatedSuppliers = suppliers.map((sup: Supplier) => 
          sup.id === editingSupplier.id ? newSupplier : sup
        );
        setSuppliers(updatedSuppliers);
        toast({
          title: ARABIC_SUPPLIERS_MESSAGES.TOAST_UPDATE_SUCCESS_TITLE,
          description: ARABIC_SUPPLIERS_MESSAGES.TOAST_UPDATE_SUCCESS_DESCRIPTION,
        });
      } else {
        setSuppliers([...suppliers, newSupplier]);
        toast({
          title: ARABIC_SUPPLIERS_MESSAGES.TOAST_ADD_SUCCESS_TITLE,
          description: ARABIC_SUPPLIERS_MESSAGES.TOAST_ADD_SUCCESS_DESCRIPTION,
        });
      }

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast({
        title: ARABIC_SUPPLIERS_MESSAGES.TOAST_ERROR_TITLE,
        description: ARABIC_SUPPLIERS_MESSAGES.TOAST_ADD_ERROR_DESCRIPTION,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditSupplier = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contactPerson: supplier.contactPerson,
      phone: supplier.phone,
      email: supplier.email || '',
      address: supplier.address || '',
      category: supplier.category,
      status: supplier.status,
      notes: supplier.notes
    });
    // Update validation results when editing a supplier
    setValidationResults({
      name: validateField(supplier.name, validationRules.name),
      contactPerson: validateField(supplier.contactPerson, validationRules.contactPerson),
      phone: validateField(supplier.phone, validationRules.phone),
      email: validateField(supplier.email || '', validationRules.email),
      category: validateField(supplier.category, validationRules.category),
    });
    setFormIsValid(true); // Assuming data from existing supplier is valid
    setDialogOpen(true);
  };

  const handleDeleteSupplier = (supplierId: string) => {
    setSupplierToDelete(supplierId);
    setIsDeleteConfirmationOpen(true);
  };

  const confirmDeleteSupplier = () => {
    if (!supplierToDelete) return;

    const updatedSuppliers = suppliers.filter((sup: Supplier) => sup.id !== supplierToDelete);
    setSuppliers(updatedSuppliers);
    toast({
      title: ARABIC_SUPPLIERS_MESSAGES.TOAST_DELETE_SUCCESS_TITLE,
      description: ARABIC_SUPPLIERS_MESSAGES.TOAST_DELETE_SUCCESS_DESCRIPTION,
    });
    setIsDeleteConfirmationOpen(false);
    setSupplierToDelete(null);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeUploadedFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <Building2 className="w-8 h-8 text-wathiq-primary" />
            {ARABIC_SUPPLIERS_MESSAGES.PAGE_TITLE}
          </h1>
          <p className="text-muted-foreground mt-1">
            {ARABIC_SUPPLIERS_MESSAGES.PAGE_DESCRIPTION(format(currentDate, 'dd/MM/yyyy'))}
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              className="bg-wathiq-primary hover:bg-wathiq-primary/90"
            >
              <Plus className="w-4 h-4 ml-2" />
              {ARABIC_SUPPLIERS_MESSAGES.ADD_NEW_SUPPLIER_BUTTON}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSupplier ? ARABIC_SUPPLIERS_MESSAGES.EDIT_SUPPLIER_DIALOG_TITLE : ARABIC_SUPPLIERS_MESSAGES.ADD_SUPPLIER_DIALOG_TITLE}
              </DialogTitle>
              <DialogDescription>
                {editingSupplier ? ARABIC_SUPPLIERS_MESSAGES.EDIT_SUPPLIER_DIALOG_DESCRIPTION : ARABIC_SUPPLIERS_MESSAGES.ADD_SUPPLIER_DIALOG_DESCRIPTION}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{ARABIC_SUPPLIERS_MESSAGES.FORM_NAME_LABEL}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, name: e.target.value})}
                  placeholder={ARABIC_SUPPLIERS_MESSAGES.FORM_NAME_PLACEHOLDER}
                  className={validationResults.name.messages.length > 0 ? "border-destructive" : ""}
                />
                <ValidationMessage result={validationResults.name} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactPerson">{ARABIC_SUPPLIERS_MESSAGES.FORM_CONTACT_PERSON_LABEL}</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, contactPerson: e.target.value})}
                  placeholder={ARABIC_SUPPLIERS_MESSAGES.FORM_CONTACT_PERSON_PLACEHOLDER}
                  className={validationResults.contactPerson.messages.length > 0 ? "border-destructive" : ""}
                />
                <ValidationMessage result={validationResults.contactPerson} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">{ARABIC_SUPPLIERS_MESSAGES.FORM_PHONE_LABEL}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, phone: e.target.value})}
                  placeholder={ARABIC_SUPPLIERS_MESSAGES.FORM_PHONE_PLACEHOLDER}
                  className={validationResults.phone.messages.length > 0 ? "border-destructive" : ""}
                />
                <ValidationMessage result={validationResults.phone} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">{ARABIC_SUPPLIERS_MESSAGES.FORM_EMAIL_LABEL}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, email: e.target.value})}
                  placeholder={ARABIC_SUPPLIERS_MESSAGES.FORM_EMAIL_PLACEHOLDER}
                  className={validationResults.email.messages.length > 0 ? "border-destructive" : ""}
                />
                <ValidationMessage result={validationResults.email} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">{ARABIC_SUPPLIERS_MESSAGES.FORM_CATEGORY_LABEL}</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value: string) => setFormData({...formData, category: value})} 
                >
                  <SelectTrigger className={validationResults.category.messages.length > 0 ? "border-destructive" : ""}>
                    <SelectValue placeholder={ARABIC_SUPPLIERS_MESSAGES.FORM_CATEGORY_PLACEHOLDER} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="مواد خام">{ARABIC_SUPPLIERS_MESSAGES.FORM_CATEGORY_RAW_MATERIALS}</SelectItem>
                    <SelectItem value="معدات">{ARABIC_SUPPLIERS_MESSAGES.FORM_CATEGORY_EQUIPMENT}</SelectItem>
                    <SelectItem value="خدمات">{ARABIC_SUPPLIERS_MESSAGES.FORM_CATEGORY_SERVICES}</SelectItem>
                    <SelectItem value="تقنية">{ARABIC_SUPPLIERS_MESSAGES.FORM_CATEGORY_TECHNOLOGY}</SelectItem>
                    <SelectItem value="أخرى">{ARABIC_SUPPLIERS_MESSAGES.FORM_CATEGORY_OTHER}</SelectItem>
                  </SelectContent>
                </Select>
                <ValidationMessage result={validationResults.category} />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">{ARABIC_SUPPLIERS_MESSAGES.FORM_STATUS_LABEL}</Label>
                <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{ARABIC_SUPPLIERS_MESSAGES.FORM_STATUS_ACTIVE}</SelectItem>
                    <SelectItem value="inactive">{ARABIC_SUPPLIERS_MESSAGES.FORM_STATUS_INACTIVE}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label htmlFor="address">{ARABIC_SUPPLIERS_MESSAGES.FORM_ADDRESS_LABEL}</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({...formData, address: e.target.value})}
                  placeholder={ARABIC_SUPPLIERS_MESSAGES.FORM_ADDRESS_PLACEHOLDER}
                />
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label htmlFor="notes">{ARABIC_SUPPLIERS_MESSAGES.FORM_NOTES_LABEL}</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFormData({...formData, notes: e.target.value})}
                  placeholder={ARABIC_SUPPLIERS_MESSAGES.FORM_NOTES_PLACEHOLDER}
                  rows={3}
                />
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label htmlFor="documents">{ARABIC_SUPPLIERS_MESSAGES.FORM_DOCUMENTS_LABEL}</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    id="documents"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFileUpload(e)}
                    className="hidden"
                  />
                  <label
                    htmlFor="documents"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">{ARABIC_SUPPLIERS_MESSAGES.FORM_DOCUMENTS_DROP_AREA_TEXT}</span>
                    <span className="text-xs text-gray-400 mt-1">{ARABIC_SUPPLIERS_MESSAGES.FORM_DOCUMENTS_SUPPORTED_FORMATS}</span>
                  </label>
                </div>
                
                {uploadedFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <span className="text-sm">{file.name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUploadedFile(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{ARABIC_SUPPLIERS_MESSAGES.FORM_CANCEL_BUTTON}</Button>
              <Button onClick={handleAddSupplier} disabled={isLoading || !formIsValid}>{isLoading ? ARABIC_SUPPLIERS_MESSAGES.FORM_SAVING_BUTTON : (editingSupplier ? ARABIC_SUPPLIERS_MESSAGES.FORM_UPDATE_BUTTON : ARABIC_SUPPLIERS_MESSAGES.FORM_ADD_BUTTON)}</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {dataLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{ARABIC_SUPPLIERS_MESSAGES.TOTAL_SUPPLIERS_CARD_TITLE}</p>
                  <p className="text-2xl font-bold text-wathiq-primary">{suppliers.length}</p>
                </div>
                <Users className="w-8 h-8 text-wathiq-primary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{ARABIC_SUPPLIERS_MESSAGES.ACTIVE_SUPPLIERS_CARD_TITLE}</p>
                  <p className="text-2xl font-bold text-success">
                    {suppliers.filter((s: Supplier) => s.status === 'active').length}
                  </p>
                </div>
                <Building2 className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{ARABIC_SUPPLIERS_MESSAGES.DOCUMENTS_CARD_TITLE}</p>
                  <p className="text-2xl font-bold text-wathiq-accent">
                    {suppliers.reduce((total: number, supplier: Supplier) => total + supplier.documents.length, 0)}
                  </p>
                </div>
                <FileText className="w-8 h-8 text-wathiq-accent" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{ARABIC_SUPPLIERS_MESSAGES.CATEGORIES_CARD_TITLE}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {new Set(suppliers.map((s: Supplier) => s.category).filter(Boolean)).size}
                  </p>
                </div>
                <MapPin className="w-8 h-8 text-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle>{ARABIC_SUPPLIERS_MESSAGES.TABLE_HEADER_SUPPLIER}</CardTitle>
          <CardDescription>
            {ARABIC_SUPPLIERS_MESSAGES.PAGE_DESCRIPTION(format(currentDate, 'dd/MM/yyyy'))}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {dataLoading ? (
            <TableSkeleton />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">{ARABIC_SUPPLIERS_MESSAGES.TABLE_HEADER_SUPPLIER}</TableHead>
                  <TableHead className="text-right">{ARABIC_SUPPLIERS_MESSAGES.TABLE_HEADER_CONTACT_PERSON}</TableHead>
                  <TableHead className="text-right">{ARABIC_SUPPLIERS_MESSAGES.TABLE_HEADER_CATEGORY}</TableHead>
                  <TableHead className="text-right">{ARABIC_SUPPLIERS_MESSAGES.TABLE_HEADER_STATUS}</TableHead>
                  <TableHead className="text-right">{ARABIC_SUPPLIERS_MESSAGES.TABLE_HEADER_DOCUMENTS}</TableHead>
                  <TableHead className="text-right">{ARABIC_SUPPLIERS_MESSAGES.TABLE_HEADER_ACTIONS}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      {ARABIC_SUPPLIERS_MESSAGES.TABLE_NO_SUPPLIERS}
                    </TableCell>
                  </TableRow>
                ) : (
                  suppliers.map((supplier: Supplier) => (
                    <TableRow key={supplier.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{supplier.name}</div>
                          <div className="text-sm text-muted-foreground flex items-center gap-1">
                            {supplier.phone && (
                              <>
                                <Phone className="w-3 h-3" />
                                {supplier.phone}
                              </>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{supplier.contactPerson}</div>
                          {supplier.email && (
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {supplier.email}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">{supplier.category || ARABIC_SUPPLIERS_MESSAGES.CATEGORY_UNDEFINED}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}
                               className={supplier.status === 'active' ? "dark:bg-green-700 dark:text-green-100" : "dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600"}>
                          {supplier.status === 'active' ? ARABIC_SUPPLIERS_MESSAGES.FORM_STATUS_ACTIVE : ARABIC_SUPPLIERS_MESSAGES.FORM_STATUS_INACTIVE}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          {supplier.documents.length}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditSupplier(supplier)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteSupplier(supplier.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        open={isDeleteConfirmationOpen}
        onOpenChange={setIsDeleteConfirmationOpen}
        onConfirm={confirmDeleteSupplier}
        itemName={ARABIC_SUPPLIERS_MESSAGES.DELETE_CONFIRMATION_ITEM_NAME}
      />
    </div>
  );
};