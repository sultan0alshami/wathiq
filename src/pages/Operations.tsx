import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Settings2, CheckCircle, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDateContext } from '@/contexts/DateContext';
import { getDataForDate, updateSectionData, type OperationEntry } from '@/lib/mockData';

export const Operations: React.FC = () => {
  const { currentDate } = useDateContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [operations, setOperations] = useState<OperationEntry[]>([]);
  const [expectedNextDay, setExpectedNextDay] = useState<number>(0);

  // Form states
  const [newTask, setNewTask] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newStatus, setNewStatus] = useState<OperationEntry['status']>('pending');
  const [newPriority, setNewPriority] = useState<OperationEntry['priority']>('medium');

  // Load data on mount and date change
  useEffect(() => {
    const data = getDataForDate(currentDate);
    setOperations(data.operations.entries);
    setExpectedNextDay(data.operations.expectedNextDay);
  }, [currentDate]);

  const addOperation = async () => {
    if (newTask && newOwner) {
      setLoading(true);
      try {
        const operation: OperationEntry = {
          id: Date.now().toString(),
          task: newTask,
          status: newStatus,
          notes: newNotes,
          owner: newOwner,
          priority: newPriority,
        };
        const updatedOperations = [...operations, operation];
        setOperations(updatedOperations);
        
        updateSectionData(currentDate, 'operations', {
          totalOperations: updatedOperations.length,
          entries: updatedOperations,
          expectedNextDay,
        });
        
        // Reset form
        setNewTask('');
        setNewOwner('');
        setNewNotes('');
        setNewStatus('pending');
        setNewPriority('medium');
        
        toast({
          title: "تم إضافة العملية",
          description: "تم حفظ العملية بنجاح",
        });
      } catch (error) {
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء حفظ العملية",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const removeOperation = async (id: string) => {
    setLoading(true);
    try {
      const updatedOperations = operations.filter(op => op.id !== id);
      setOperations(updatedOperations);
      
      updateSectionData(currentDate, 'operations', {
        totalOperations: updatedOperations.length,
        entries: updatedOperations,
        expectedNextDay,
      });
      
      toast({
        title: "تم حذف العملية",
        description: "تم حذف العملية بنجاح",
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حذف العملية",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateOperationStatus = async (id: string, status: OperationEntry['status']) => {
    const updatedOperations = operations.map(op => 
      op.id === id ? { ...op, status } : op
    );
    setOperations(updatedOperations);
    
    try {
      updateSectionData(currentDate, 'operations', {
        totalOperations: updatedOperations.length,
        entries: updatedOperations,
        expectedNextDay,
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحديث الحالة",
        variant: "destructive",
      });
    }
  };

  const updateExpectedNextDay = async (count: number) => {
    setExpectedNextDay(count);
    try {
      updateSectionData(currentDate, 'operations', {
        totalOperations: operations.length,
        entries: operations,
        expectedNextDay: count,
      });
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء حفظ التوقعات",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: OperationEntry['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
  };

  const getStatusLabel = (status: OperationEntry['status']) => {
    switch (status) {
      case 'completed':
        return 'مكتمل';
      case 'in-progress':
        return 'قيد التنفيذ';
      case 'pending':
        return 'معلق';
    }
  };

  const getStatusColor = (status: OperationEntry['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'in-progress':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'pending':
        return 'bg-red-50 text-red-700 border-red-200';
    }
  };

  const pendingCount = operations.filter(op => op.status === 'pending').length;
  const inProgressCount = operations.filter(op => op.status === 'in-progress').length;
  const completedCount = operations.filter(op => op.status === 'completed').length;
  const completionRate = operations.length > 0 ? ((completedCount / operations.length) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">العمليات</h1>
        <Badge variant="outline" className="text-lg px-4 py-2">
          اليوم: {new Date().toLocaleDateString('ar-EG')}
        </Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-red-600">العمليات المعلقة</p>
                <p className="text-2xl font-bold text-red-700">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-sm text-yellow-600">قيد التنفيذ</p>
                <p className="text-2xl font-bold text-yellow-700">{inProgressCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-green-600">العمليات المكتملة</p>
                <p className="text-2xl font-bold text-green-700">{completedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">معدل الإنجاز</p>
                <p className="text-2xl font-bold text-primary">{completionRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Operation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">إضافة عملية جديدة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>اسم العملية</Label>
              <Input
                placeholder="مثال: مراجعة التقارير الشهرية"
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>المسؤول</Label>
              <Input
                placeholder="اسم المسؤول عن العملية"
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>الحالة</Label>
              <Select value={newStatus} onValueChange={(value: OperationEntry['status']) => setNewStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">معلق</SelectItem>
                  <SelectItem value="in-progress">قيد التنفيذ</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>الأولوية</Label>
              <Select value={newPriority} onValueChange={(value: OperationEntry['priority']) => setNewPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">منخفضة</SelectItem>
                  <SelectItem value="medium">متوسطة</SelectItem>
                  <SelectItem value="high">عالية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>ملاحظات</Label>
              <Textarea
                placeholder="ملاحظات إضافية..."
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <Button onClick={addOperation} disabled={loading} className="bg-primary hover:bg-primary/90">
                {loading ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Plus className="w-4 h-4 ml-2" />}
                إضافة عملية
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operations List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">قائمة العمليات اليومية</CardTitle>
        </CardHeader>
        <CardContent>
          {operations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Settings2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد عمليات مضافة بعد</p>
            </div>
          ) : (
            <div className="space-y-3">
              {operations.map((operation) => (
                <Card key={operation.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="font-semibold text-lg">{operation.task}</h3>
                          {getStatusIcon(operation.status)}
                          <Badge className={getStatusColor(operation.status)}>
                            {getStatusLabel(operation.status)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <p className="text-muted-foreground">
                            <span className="font-medium">المسؤول:</span> {operation.owner}
                          </p>
                          {operation.notes && (
                            <p className="text-muted-foreground">
                              <span className="font-medium">ملاحظات:</span> {operation.notes}
                            </p>
                          )}
                        </div>
                        <div className="mt-3 flex gap-2">
                          <Select
                            value={operation.status}
                            onValueChange={(value: OperationEntry['status']) => updateOperationStatus(operation.id, value)}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">معلق</SelectItem>
                              <SelectItem value="in-progress">قيد التنفيذ</SelectItem>
                              <SelectItem value="completed">مكتمل</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeOperation(operation.id)}
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

      {/* Expected Next Day Operations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">توقعات عمليات اليوم التالي</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="expected">عدد العمليات المتوقعة</Label>
            <Input
              id="expected"
              type="number"
              min="0"
              value={expectedNextDay}
              onChange={(e) => updateExpectedNextDay(parseInt(e.target.value) || 0)}
              className="max-w-xs"
              placeholder="أدخل العدد المتوقع"
            />
          </div>
        </CardContent>
      </Card>

    </div>
  );
};