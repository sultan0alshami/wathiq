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

export const Suppliers: React.FC = () => {
  const { currentDate } = useDateContext();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Use localStorage for suppliers data
  const { value: suppliers, setValue: setSuppliers } = useDataWithDate<Supplier[]>(
    'suppliers',
    currentDate,
    []
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
  };

  const handleAddSupplier = async () => {
    if (!formData.name.trim() || !formData.contactPerson.trim()) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى ملء الحقول المطلوبة",
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
        const updatedSuppliers = suppliers.map(sup => 
          sup.id === editingSupplier.id ? newSupplier : sup
        );
        setSuppliers(updatedSuppliers);
        toast({
          title: "تم تحديث المورد",
          description: "تم تحديث بيانات المورد بنجاح",
        });
      } else {
        setSuppliers([...suppliers, newSupplier]);
        toast({
          title: "تم إضافة المورد",
          description: "تم إضافة المورد الجديد بنجاح",
        });
      }

      setDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error adding supplier:', error);
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء إضافة المورد",
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
    setDialogOpen(true);
  };

  const handleDeleteSupplier = (supplierId: string) => {
    const updatedSuppliers = suppliers.filter(sup => sup.id !== supplierId);
    setSuppliers(updatedSuppliers);
    toast({
      title: "تم حذف المورد",
      description: "تم حذف المورد بنجاح",
    });
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
            إدارة الموردين
          </h1>
          <p className="text-muted-foreground mt-1">
            إدارة الموردين ومستنداتهم - {format(currentDate, 'dd/MM/yyyy')}
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={resetForm}
              className="bg-wathiq-primary hover:bg-wathiq-primary/90"
            >
              <Plus className="w-4 h-4 ml-2" />
              إضافة مورد جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSupplier ? 'تعديل المورد' : 'إضافة مورد جديد'}
              </DialogTitle>
              <DialogDescription>
                {editingSupplier ? 'تحديث بيانات المورد' : 'أدخل بيانات المورد الجديد ومستنداته'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">اسم المورد *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="اسم الشركة أو المورد"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contactPerson">الشخص المسؤول *</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                  placeholder="اسم الشخص المسؤول"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">رقم الهاتف</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="+966501234567"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="supplier@example.com"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category">التصنيف</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر التصنيف" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="مواد خام">مواد خام</SelectItem>
                    <SelectItem value="معدات">معدات</SelectItem>
                    <SelectItem value="خدمات">خدمات</SelectItem>
                    <SelectItem value="تقنية">تقنية</SelectItem>
                    <SelectItem value="أخرى">أخرى</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status">الحالة</Label>
                <Select value={formData.status} onValueChange={(value: 'active' | 'inactive') => setFormData({...formData, status: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">نشط</SelectItem>
                    <SelectItem value="inactive">غير نشط</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label htmlFor="address">العنوان</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  placeholder="العنوان الكامل"
                />
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="أي ملاحظات إضافية"
                  rows={3}
                />
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label htmlFor="documents">المستندات</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                  <input
                    type="file"
                    id="documents"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <label
                    htmlFor="documents"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">اسحب الملفات هنا أو انقر للرفع</span>
                    <span className="text-xs text-gray-400 mt-1">PDF, DOC, JPG, PNG</span>
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
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleAddSupplier} disabled={isLoading}>
                {isLoading ? 'جاري الحفظ...' : (editingSupplier ? 'تحديث' : 'إضافة')}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">إجمالي الموردين</p>
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
                <p className="text-sm text-muted-foreground">الموردين النشطين</p>
                <p className="text-2xl font-bold text-success">
                  {suppliers.filter(s => s.status === 'active').length}
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
                <p className="text-sm text-muted-foreground">المستندات</p>
                <p className="text-2xl font-bold text-wathiq-accent">
                  {suppliers.reduce((total, supplier) => total + supplier.documents.length, 0)}
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
                <p className="text-sm text-muted-foreground">التصنيفات</p>
                <p className="text-2xl font-bold text-foreground">
                  {new Set(suppliers.map(s => s.category).filter(Boolean)).size}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Suppliers Table */}
      <Card>
        <CardHeader>
          <CardTitle>قائمة الموردين</CardTitle>
          <CardDescription>
            إدارة جميع الموردين ومعلوماتهم
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">المورد</TableHead>
                <TableHead className="text-right">الشخص المسؤول</TableHead>
                <TableHead className="text-right">التصنيف</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right">المستندات</TableHead>
                <TableHead className="text-right">الإجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    لا توجد موردين مضافين بعد
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map((supplier) => (
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
                      <Badge variant="outline">{supplier.category || 'غير محدد'}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                        {supplier.status === 'active' ? 'نشط' : 'غير نشط'}
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
        </CardContent>
      </Card>
    </div>
  );
};