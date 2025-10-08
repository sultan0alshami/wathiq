import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, Settings2, CheckCircle, Clock, AlertCircle, Loader2, Gauge } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useDateContext } from '@/contexts/DateContext';
import { getDataForDate, updateSectionData, type OperationEntry } from '@/lib/mockData';
import { ValidationMessage, useFormValidation, ValidationRules } from '@/components/ui/enhanced-form-validation';
import { DeleteConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { KPICardSkeleton, TableSkeleton } from '@/components/ui/loading-skeleton';
import { ARABIC_OPERATIONS_MESSAGES } from '@/lib/arabicOperationsMessages';

const OperationUtils = {
  getStatusIcon: (status: OperationEntry['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-red-600" />;
    }
  },

  getStatusLabel: (status: OperationEntry['status']) => {
    switch (status) {
      case 'completed':
        return ARABIC_OPERATIONS_MESSAGES.STATUS_COMPLETED;
      case 'in-progress':
        return ARABIC_OPERATIONS_MESSAGES.STATUS_IN_PROGRESS;
      case 'pending':
        return ARABIC_OPERATIONS_MESSAGES.STATUS_PENDING;
    }
  },

  getStatusColor: (status: OperationEntry['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-700';
      case 'in-progress':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-200 dark:border-yellow-700';
      case 'pending':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-700';
    }
  },
};

export const Operations: React.FC = () => {
  const { currentDate } = useDateContext();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [operations, setOperations] = useState<OperationEntry[]>([]);
  const [expectedNextDay, setExpectedNextDay] = useState<number>(0);
  const [deleteOperationId, setDeleteOperationId] = useState<string | null>(null);

  // Pagination
  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => { setCurrentPage(1); }, [currentDate]);
  const paginatedOperations = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return operations.slice(start, start + ITEMS_PER_PAGE);
  }, [operations, currentPage]);

  const [expectedNextDayInput, setExpectedNextDayInput] = useState<string>('0');

  // Form states
  const [newTask, setNewTask] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [newNotes, setNewNotes] = useState('');
  const [newStatus, setNewStatus] = useState<OperationEntry['status']>('pending');
  const [newPriority, setNewPriority] = useState<OperationEntry['priority']>('medium');

  const { validateField } = useFormValidation();

  // New Operation form validations
  const newTaskValidation = validateField(newTask, [
    ValidationRules.required(ARABIC_OPERATIONS_MESSAGES.OPERATION_NAME_LABEL),
    ValidationRules.minLength(3, ARABIC_OPERATIONS_MESSAGES.OPERATION_NAME_MIN_LENGTH),
    ValidationRules.arabicText()
  ]);

  const newOwnerValidation = validateField(newOwner, [
    ValidationRules.required(ARABIC_OPERATIONS_MESSAGES.ASSIGNED_TO_LABEL),
    ValidationRules.arabicText()
  ]);

  const expectedNextDayValidation = useMemo(() =>
    validateField(expectedNextDayInput, [
      ValidationRules.number(ARABIC_OPERATIONS_MESSAGES.EXPECTED_NEXT_DAY_INVALID),
      ValidationRules.min(0, ARABIC_OPERATIONS_MESSAGES.EXPECTED_NEXT_DAY_NEGATIVE)
    ]),
  [expectedNextDayInput]);

  // Load data on mount and date change
  useEffect(() => {
    setLoading(true);
    // Simulate loading delay
    new Promise(resolve => setTimeout(resolve, 500)).then(() => {
      const data = getDataForDate(currentDate);
      setOperations(data.operations.entries);
      setExpectedNextDay(data.operations.expectedNextDay);
      setExpectedNextDayInput(String(data.operations.expectedNextDay));
      setLoading(false);
    });
  }, [currentDate]);

  const addOperation = async () => {
    const isFormValid = newTaskValidation.isValid && newOwnerValidation.isValid;
    if (!isFormValid) {
      toast({
        title: ARABIC_OPERATIONS_MESSAGES.FORM_ERROR_TITLE,
        description: ARABIC_OPERATIONS_MESSAGES.FORM_ERROR_DESCRIPTION,
        variant: "destructive",
      });
      return;
    }
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
        title: ARABIC_OPERATIONS_MESSAGES.TOAST_ADD_SUCCESS_TITLE,
        description: ARABIC_OPERATIONS_MESSAGES.TOAST_ADD_SUCCESS_DESCRIPTION,
      });
    } catch (error) {
      toast({
        title: ARABIC_OPERATIONS_MESSAGES.TOAST_ADD_ERROR_TITLE,
        description: ARABIC_OPERATIONS_MESSAGES.TOAST_ADD_ERROR_DESCRIPTION,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
        title: ARABIC_OPERATIONS_MESSAGES.TOAST_DELETE_SUCCESS_TITLE,
        description: ARABIC_OPERATIONS_MESSAGES.TOAST_DELETE_SUCCESS_DESCRIPTION,
      });
    } catch (error) {
      toast({
        title: ARABIC_OPERATIONS_MESSAGES.TOAST_DELETE_ERROR_TITLE,
        description: ARABIC_OPERATIONS_MESSAGES.TOAST_DELETE_ERROR_DESCRIPTION,
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
      toast({
        title: ARABIC_OPERATIONS_MESSAGES.TOAST_UPDATE_SUCCESS_TITLE,
        description: ARABIC_OPERATIONS_MESSAGES.TOAST_UPDATE_SUCCESS_DESCRIPTION,
      });
    } catch (error) {
      toast({
        title: ARABIC_OPERATIONS_MESSAGES.TOAST_UPDATE_ERROR_TITLE,
        description: ARABIC_OPERATIONS_MESSAGES.TOAST_UPDATE_ERROR_DESCRIPTION,
        variant: "destructive",
      });
    }
  };

  const updateExpectedNextDay = async (value: string) => {
    setExpectedNextDayInput(value);
    const validation = validateField(value, [
      ValidationRules.number(ARABIC_OPERATIONS_MESSAGES.EXPECTED_NEXT_DAY_INVALID),
      ValidationRules.min(0, ARABIC_OPERATIONS_MESSAGES.EXPECTED_NEXT_DAY_NEGATIVE)
    ]);

    if (validation.isValid) {
      const count = parseInt(value);
      setExpectedNextDay(count);
      try {
        updateSectionData(currentDate, 'operations', {
          totalOperations: operations.length,
          entries: operations,
          expectedNextDay: count,
        });
      } catch (error) {
        toast({
          title: ARABIC_OPERATIONS_MESSAGES.TOAST_ADD_ERROR_TITLE,
          description: ARABIC_OPERATIONS_MESSAGES.TOAST_ADD_ERROR_DESCRIPTION,
          variant: "destructive",
        });
      }
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
        <h1 className="text-3xl font-bold text-primary">{ARABIC_OPERATIONS_MESSAGES.PAGE_TITLE}</h1>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {ARABIC_OPERATIONS_MESSAGES.TODAY_DATE} {new Date().toLocaleDateString('ar-EG')}
        </Badge>
      </div>

      {/* Quick Stats */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <KPICardSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div>
                  <p className="text-sm text-red-600">{ARABIC_OPERATIONS_MESSAGES.OPERATIONS_PENDING}</p>
                  <p className="text-2xl font-bold text-red-700">{pendingCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20 dark:border-yellow-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm text-yellow-600">{ARABIC_OPERATIONS_MESSAGES.OPERATIONS_IN_PROGRESS}</p>
                  <p className="text-2xl font-bold text-yellow-700">{inProgressCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-green-600">{ARABIC_OPERATIONS_MESSAGES.OPERATIONS_COMPLETED}</p>
                  <p className="text-2xl font-bold text-green-700">{completedCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Gauge className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">{ARABIC_OPERATIONS_MESSAGES.COMPLETION_RATE}</p>
                  <p className="text-2xl font-bold text-primary">{completionRate}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add New Operation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">{ARABIC_OPERATIONS_MESSAGES.ADD_OPERATION_TITLE}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{ARABIC_OPERATIONS_MESSAGES.OPERATION_NAME_LABEL}</Label>
              <Input
                placeholder={ARABIC_OPERATIONS_MESSAGES.OPERATION_NAME_PLACEHOLDER}
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className={!newTaskValidation.isValid ? "border-destructive" : ""}
              />
              <ValidationMessage result={newTaskValidation} />
            </div>
            <div className="space-y-2">
              <Label>{ARABIC_OPERATIONS_MESSAGES.ASSIGNED_TO_LABEL}</Label>
              <Input
                placeholder={ARABIC_OPERATIONS_MESSAGES.ASSIGNED_TO_PLACEHOLDER}
                value={newOwner}
                onChange={(e) => setNewOwner(e.target.value)}
                className={!newOwnerValidation.isValid ? "border-destructive" : ""}
              />
              <ValidationMessage result={newOwnerValidation} />
            </div>
            <div className="space-y-2">
              <Label>{ARABIC_OPERATIONS_MESSAGES.STATUS_LABEL}</Label>
              <Select value={newStatus} onValueChange={(value: OperationEntry['status']) => setNewStatus(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">{ARABIC_OPERATIONS_MESSAGES.STATUS_PENDING}</SelectItem>
                  <SelectItem value="in-progress">{ARABIC_OPERATIONS_MESSAGES.STATUS_IN_PROGRESS}</SelectItem>
                  <SelectItem value="completed">{ARABIC_OPERATIONS_MESSAGES.STATUS_COMPLETED}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{ARABIC_OPERATIONS_MESSAGES.PRIORITY_LABEL}</Label>
              <Select value={newPriority} onValueChange={(value: OperationEntry['priority']) => setNewPriority(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{ARABIC_OPERATIONS_MESSAGES.PRIORITY_LOW}</SelectItem>
                  <SelectItem value="medium">{ARABIC_OPERATIONS_MESSAGES.PRIORITY_MEDIUM}</SelectItem>
                  <SelectItem value="high">{ARABIC_OPERATIONS_MESSAGES.PRIORITY_HIGH}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 space-y-2">
              <Label>{ARABIC_OPERATIONS_MESSAGES.ADDITIONAL_NOTES_LABEL}</Label>
              <Textarea
                placeholder={ARABIC_OPERATIONS_MESSAGES.ADDITIONAL_NOTES_PLACEHOLDER}
                value={newNotes}
                onChange={(e) => setNewNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
            <Button onClick={addOperation} disabled={loading || !newTaskValidation.isValid || !newOwnerValidation.isValid} variant="default">
                {loading ? <Loader2 className="w-4 h-4 ml-2 animate-spin" /> : <Plus className="w-4 h-4 ml-2" />}
                {ARABIC_OPERATIONS_MESSAGES.ADD_OPERATION_BUTTON}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operations List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">{ARABIC_OPERATIONS_MESSAGES.TODAY_OPERATIONS_TITLE(operations.length)}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={5} columns={1} />
          ) : operations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Settings2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>{ARABIC_OPERATIONS_MESSAGES.NO_OPERATIONS_ADDED}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedOperations.map((operation) => (
                <Card key={operation.id} className="border-l-4 border-l-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="font-semibold text-lg">{operation.task}</h3>
                          {OperationUtils.getStatusIcon(operation.status)}
                          <Badge className={OperationUtils.getStatusColor(operation.status)}>
                            {OperationUtils.getStatusLabel(operation.status)}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <p className="text-muted-foreground">
                            <span className="font-medium">{ARABIC_OPERATIONS_MESSAGES.ASSIGNED_TO_LABEL}:</span> {operation.owner}
                          </p>
                          {operation.notes && (
                            <p className="text-muted-foreground">
                              <span className="font-medium">{ARABIC_OPERATIONS_MESSAGES.ADDITIONAL_NOTES_LABEL}:</span> {operation.notes}
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
                              <SelectItem value="pending">{ARABIC_OPERATIONS_MESSAGES.STATUS_PENDING}</SelectItem>
                              <SelectItem value="in-progress">{ARABIC_OPERATIONS_MESSAGES.STATUS_IN_PROGRESS}</SelectItem>
                              <SelectItem value="completed">{ARABIC_OPERATIONS_MESSAGES.STATUS_COMPLETED}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteOperationId(operation.id)}
                        className="text-red-600 hover:bg-red-100"
                        aria-label={`حذف ${ARABIC_OPERATIONS_MESSAGES.OPERATION_ITEM_NAME}`}
                        title={`حذف ${ARABIC_OPERATIONS_MESSAGES.OPERATION_ITEM_NAME}`}
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
                  {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, operations.length)}-
                  {Math.min(currentPage * ITEMS_PER_PAGE, operations.length)} من {operations.length}
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
                    onClick={() => setCurrentPage(p => (p * ITEMS_PER_PAGE < operations.length ? p + 1 : p))}
                    disabled={currentPage * ITEMS_PER_PAGE >= operations.length}
                  >
                    التالي
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Expected Next Day Operations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">{ARABIC_OPERATIONS_MESSAGES.EXPECTED_NEXT_DAY_TITLE}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <Label htmlFor="expected">{ARABIC_OPERATIONS_MESSAGES.EXPECTED_NEXT_DAY_LABEL}</Label>
            <Input
              id="expected"
              type="number"
              min="0"
              value={expectedNextDayInput}
              onChange={(e) => updateExpectedNextDay(e.target.value)}
              className={!expectedNextDayValidation.isValid ? "border-destructive max-w-xs" : "max-w-xs"}
              placeholder={ARABIC_OPERATIONS_MESSAGES.EXPECTED_NEXT_DAY_PLACEHOLDER}
            />
            <ValidationMessage result={expectedNextDayValidation} />
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmationDialog
        open={deleteOperationId !== null}
        onOpenChange={(open) => !open && setDeleteOperationId(null)}
        onConfirm={() => {
          if (deleteOperationId) {
            removeOperation(deleteOperationId);
            setDeleteOperationId(null);
          }
        }}
        itemName={ARABIC_OPERATIONS_MESSAGES.OPERATION_ITEM_NAME}
      />

    </div>
  );
};