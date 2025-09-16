import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Trash2, Plus, Megaphone, Users, CheckCircle, Clock, Calendar, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDateContext } from '@/contexts/DateContext';
import { getDataForDate, updateSectionData, type MarketingTask, type Customer } from '@/lib/mockData';

export const Marketing: React.FC = () => {
  const { currentDate } = useDateContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [tasks, setTasks] = useState<MarketingTask[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [yesterdayTasks, setYesterdayTasks] = useState<string[]>([]);
  const [plannedTasks, setPlannedTasks] = useState<string[]>([]);

  // Task form states
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState('');
  const [newTaskDate, setNewTaskDate] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<MarketingTask['priority']>('medium');

  // Customer form states
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCustomerArrival, setNewCustomerArrival] = useState('');
  const [newCustomerNotes, setNewCustomerNotes] = useState('');
  const [newCustomerSource, setNewCustomerSource] = useState('');

  // Yesterday task form
  const [newYesterdayTask, setNewYesterdayTask] = useState('');

  // Load data on mount and date change
  useEffect(() => {
    const data = getDataForDate(currentDate);
    setTasks(data.marketing.tasks);
    setYesterdayTasks(data.marketing.yesterdayDone);
    setPlannedTasks(data.marketing.plannedTasks);
    setCustomers(data.customers);
  }, [currentDate]);

  const addTask = async () => {
    if (newTaskTitle && newTaskAssignee) {
      setLoading(true);
      try {
        const task: MarketingTask = {
          id: Date.now().toString(),
          title: newTaskTitle,
          status: 'planned',
          assignee: newTaskAssignee,
          dueDate: newTaskDate ? new Date(newTaskDate) : new Date(),
          description: newTaskDescription,
          priority: newTaskPriority,
        };
        const updatedTasks = [...tasks, task];
        setTasks(updatedTasks);
        
        updateSectionData(currentDate, 'marketing', {
          tasks: updatedTasks,
          yesterdayDone: yesterdayTasks,
          plannedTasks,
        });
        
        setNewTaskTitle('');
        setNewTaskAssignee('');
        setNewTaskDate('');
        setNewTaskDescription('');
        setNewTaskPriority('medium');
        
        toast({
          title: "تم إضافة المهمة",
          description: "تم حفظ المهمة بنجاح",
        });
      } catch (error) {
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء حفظ المهمة",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const addCustomer = async () => {
    if (newCustomerName) {
      setLoading(true);
      try {
        const customer: Customer = {
          id: Date.now().toString(),
          name: newCustomerName,
          phone: newCustomerPhone,
          email: newCustomerEmail,
          arrivalDate: newCustomerArrival ? new Date(newCustomerArrival) : new Date(),
          contacted: false,
          cameBack: false,
          notes: newCustomerNotes,
          source: newCustomerSource,
        };
        const updatedCustomers = [...customers, customer];
        setCustomers(updatedCustomers);
        
        updateSectionData(currentDate, 'customers', updatedCustomers);
        
        setNewCustomerName('');
        setNewCustomerPhone('');
        setNewCustomerEmail('');
        setNewCustomerArrival('');
        setNewCustomerNotes('');
        setNewCustomerSource('');
        
        toast({
          title: "تم إضافة العميل",
          description: "تم حفظ العميل بنجاح",
        });
      } catch (error) {
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء حفظ العميل",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const addYesterdayTask = async () => {
    if (newYesterdayTask) {
      const updatedYesterdayTasks = [...yesterdayTasks, newYesterdayTask];
      setYesterdayTasks(updatedYesterdayTasks);
      
      try {
        updateSectionData(currentDate, 'marketing', {
          tasks,
          yesterdayDone: updatedYesterdayTasks,
          plannedTasks,
        });
        
        setNewYesterdayTask('');
        toast({
          title: "تم إضافة مهمة الأمس",
          description: "تم حفظ مهمة الأمس بنجاح",
        });
      } catch (error) {
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء حفظ مهمة الأمس",
          variant: "destructive",
        });
      }
    }
  };

  const moveTask = async (id: string, newStatus: MarketingTask['status']) => {
    const updatedTasks = tasks.map(task => 
      task.id === id 
        ? { 
            ...task, 
            status: newStatus,
          } 
        : task
    );
    setTasks(updatedTasks);
    
    try {
      updateSectionData(currentDate, 'marketing', {
        tasks: updatedTasks,
        yesterdayDone: yesterdayTasks,
        plannedTasks,
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث المهمة",
        variant: "destructive",
      });
    }
  };

  const removeTask = async (id: string) => {
    const updatedTasks = tasks.filter(task => task.id !== id);
    setTasks(updatedTasks);
    
    try {
      updateSectionData(currentDate, 'marketing', {
        tasks: updatedTasks,
        yesterdayDone: yesterdayTasks,
        plannedTasks,
      });
      
      toast({
        title: "تم حذف المهمة",
        description: "تم حذف المهمة بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف المهمة",
        variant: "destructive",
      });
    }
  };

  const removeCustomer = async (id: string) => {
    const updatedCustomers = customers.filter(customer => customer.id !== id);
    setCustomers(updatedCustomers);
    
    try {
      updateSectionData(currentDate, 'customers', updatedCustomers);
      
      toast({
        title: "تم حذف العميل",
        description: "تم حذف العميل بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف العميل",
        variant: "destructive",
      });
    }
  };

  const toggleCustomerContacted = async (id: string) => {
    const updatedCustomers = customers.map(customer =>
      customer.id === id ? { ...customer, contacted: !customer.contacted } : customer
    );
    setCustomers(updatedCustomers);
    
    try {
      updateSectionData(currentDate, 'customers', updatedCustomers);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة التواصل",
        variant: "destructive",
      });
    }
  };

  const toggleCustomerCameBack = async (id: string) => {
    const updatedCustomers = customers.map(customer =>
      customer.id === id ? { ...customer, cameBack: !customer.cameBack } : customer
    );
    setCustomers(updatedCustomers);
    
    try {
      updateSectionData(currentDate, 'customers', updatedCustomers);
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث حالة العودة",
        variant: "destructive",
      });
    }
  };

  const getTasksByStatus = (status: MarketingTask['status']) => tasks.filter(task => task.status === status);
  const contactedCustomers = customers.filter(customer => customer.contacted).length;
  const returnedCustomers = customers.filter(customer => customer.cameBack).length;

  const getStatusColor = (status: MarketingTask['status']) => {
    switch (status) {
      case 'planned':
        return 'border-blue-200 bg-blue-50';
      case 'in-progress':
        return 'border-yellow-200 bg-yellow-50';
      case 'completed':
        return 'border-green-200 bg-green-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">التسويق</h1>
        <Badge variant="outline" className="text-lg px-4 py-2">
          اليوم: {new Date().toLocaleDateString('ar-EG')}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600">المهام الكلية</p>
                <p className="text-2xl font-bold text-blue-700">{tasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-green-600">مهام الأمس المنجزة</p>
                <p className="text-2xl font-bold text-green-700">{yesterdayTasks.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600">العملاء المتواصلين</p>
                <p className="text-2xl font-bold text-purple-700">{contactedCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">العملاء العائدين</p>
                <p className="text-2xl font-bold text-primary">{returnedCustomers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yesterday's Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">مهام الأمس المنجزة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Input
              placeholder="أضف مهمة من الأمس..."
              value={newYesterdayTask}
              onChange={(e) => setNewYesterdayTask(e.target.value)}
            />
            <Button onClick={addYesterdayTask} className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 ml-2" />
              إضافة
            </Button>
          </div>
          
          {yesterdayTasks.length > 0 && (
            <div className="space-y-2">
              {yesterdayTasks.map((taskTitle, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-background-muted rounded-lg">
                  <span className="flex-1">{taskTitle}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const updatedTasks = yesterdayTasks.filter((_, i) => i !== index);
                      setYesterdayTasks(updatedTasks);
                      updateSectionData(currentDate, 'marketing', {
                        tasks,
                        yesterdayDone: updatedTasks,
                        plannedTasks,
                      });
                    }}
                    className="text-red-600 hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Kanban Board */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">لوحة المهام الحالية</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add Task Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-background-muted rounded-lg">
            <div className="space-y-2">
              <Label>عنوان المهمة</Label>
              <Input
                placeholder="مثال: إنشاء محتوى إعلاني"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>المسؤول</Label>
              <Input
                placeholder="اسم المسؤول"
                value={newTaskAssignee}
                onChange={(e) => setNewTaskAssignee(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>التاريخ المخطط</Label>
              <Input
                type="date"
                value={newTaskDate}
                onChange={(e) => setNewTaskDate(e.target.value)}
              />
            </div>
            <div className="md:col-span-3">
              <Button onClick={addTask} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 ml-2" />
                إضافة مهمة
              </Button>
            </div>
          </div>

          {/* Kanban Columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Planned */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-blue-100 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-blue-800">مخطط ({getTasksByStatus('planned').length})</h3>
              </div>
              {getTasksByStatus('planned').map((task) => (
                <Card key={task.id} className={getStatusColor('planned')}>
                  <CardContent className="p-3">
                    <h4 className="font-medium mb-2">{task.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">المسؤول: {task.assignee}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveTask(task.id, 'in-progress')}
                      >
                        بدء
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeTask(task.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* In Progress */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800">قيد التنفيذ ({getTasksByStatus('in-progress').length})</h3>
              </div>
              {getTasksByStatus('in-progress').map((task) => (
                <Card key={task.id} className={getStatusColor('in-progress')}>
                  <CardContent className="p-3">
                    <h4 className="font-medium mb-2">{task.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">المسؤول: {task.assignee}</p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveTask(task.id, 'planned')}
                      >
                        إرجاع
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => moveTask(task.id, 'completed')}
                        className="bg-green-600 text-white hover:bg-green-700"
                      >
                        إنجاز
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Done */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-800">منجز ({getTasksByStatus('completed').length})</h3>
              </div>
              {getTasksByStatus('completed').map((task) => (
                <Card key={task.id} className={getStatusColor('completed')}>
                  <CardContent className="p-3">
                    <h4 className="font-medium mb-2">{task.title}</h4>
                    <p className="text-sm text-muted-foreground mb-2">المسؤول: {task.assignee}</p>
                    <p className="text-xs text-green-600 mb-2">
                      تاريخ الاستحقاق: {task.dueDate.toLocaleDateString('ar-EG')}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => removeTask(task.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customers Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">جدول العملاء اليومي</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Customer Form */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-background-muted rounded-lg">
            <div className="space-y-2">
              <Label>اسم العميل</Label>
              <Input
                placeholder="اسم العميل"
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>تاريخ الوصول</Label>
              <Input
                type="date"
                value={newCustomerArrival}
                onChange={(e) => setNewCustomerArrival(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Input
                placeholder="ملاحظات..."
                value={newCustomerNotes}
                onChange={(e) => setNewCustomerNotes(e.target.value)}
              />
            </div>
            <div className="md:col-span-3">
              <Button onClick={addCustomer} className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 ml-2" />
                إضافة عميل
              </Button>
            </div>
          </div>

          {/* Customers List */}
          {customers.length > 0 && (
            <div className="space-y-3">
              {customers.map((customer) => (
                <Card key={customer.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-lg mb-2">{customer.name}</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          تاريخ الوصول: {new Date(customer.arrivalDate).toLocaleDateString('ar-EG')}
                        </p>
                        {customer.notes && (
                          <p className="text-sm text-muted-foreground mb-3">{customer.notes}</p>
                        )}
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={customer.contacted}
                              onCheckedChange={() => toggleCustomerContacted(customer.id)}
                            />
                            <span className="text-sm">تم التواصل</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Checkbox
                              checked={customer.cameBack}
                              onCheckedChange={() => toggleCustomerCameBack(customer.id)}
                            />
                            <span className="text-sm">عاد مرة أخرى</span>
                          </div>
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

    </div>
  );
};