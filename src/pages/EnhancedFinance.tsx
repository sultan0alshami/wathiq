import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, DollarSign, TrendingUp, TrendingDown, Wallet, Filter } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SearchInput } from '@/components/ui/search-input';
import { DeleteConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { ValidationMessage, useFormValidation, ValidationRules } from '@/components/ui/enhanced-form-validation';
import { KPICardSkeleton, TableSkeleton } from '@/components/ui/loading-skeleton';
import { useDateContext } from '@/contexts/DateContext';
import { getDataForDate, updateSectionData, FinanceEntry } from '@/lib/mockData';
import { formatCurrency, formatInputNumber, parseEnglishNumber, isValidEnglishNumber } from '@/lib/numberUtils';
import { useAdvancedSearch } from '@/hooks/useSearch';
import { useDebounce, useMemoizedCalculations } from '@/hooks/usePerformance';
import { useMobileDataDisplay } from '@/hooks/useMobileOptimization';
import { useToast } from '@/hooks/use-toast';

export const EnhancedFinance: React.FC = () => {
  const { currentDate, formatDate } = useDateContext();
  const [currentLiquidity, setCurrentLiquidity] = useState<number>(0);
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteEntry, setDeleteEntry] = useState<string | null>(null);
  const { toast } = useToast();
  const { validateField } = useFormValidation();
  const { shouldUseCards } = useMobileDataDisplay(entries);

  // Form states
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [newEntryAmount, setNewEntryAmount] = useState('');
  const [newEntryType, setNewEntryType] = useState<'income' | 'expense' | 'deposit'>('income');
  const [newEntryCategory, setNewEntryCategory] = useState('');
  const [newEntryDescription, setNewEntryDescription] = useState('');

  // Search and filter
  const {
    searchTerm,
    setSearchTerm,
    filteredItems: filteredEntries,
    clearSearch,
    hasActiveFilters
  } = useAdvancedSearch(entries);

  // Debounced search
  const debouncedSearch = useDebounce((term: string) => {
    setSearchTerm(term);
  }, 300);

  // Form validation
  const titleValidation = useMemo(() => 
    validateField(newEntryTitle, [
      ValidationRules.required('عنوان المعاملة مطلوب'),
      ValidationRules.minLength(3, 'يجب أن يحتوي العنوان على 3 أحرف على الأقل'),
      ValidationRules.arabicText()
    ]), [newEntryTitle]);

  const amountValidation = useMemo(() =>
    validateField(newEntryAmount, [
      ValidationRules.required('المبلغ مطلوب'),
      ValidationRules.positiveNumber('يجب أن يكون المبلغ رقم موجب')
    ]), [newEntryAmount]);

  // Load data for current date
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Simulate loading delay for skeleton
        await new Promise(resolve => setTimeout(resolve, 500));
        const data = getDataForDate(currentDate);
        setCurrentLiquidity(data.finance.currentLiquidity);
        setEntries(data.finance.entries);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentDate]);

  // Memoized calculations
  const calculations = useMemoizedCalculations(
    filteredEntries,
    (entries) => {
      const incomeEntries = entries.filter(entry => entry.type === 'income');
      const expenseEntries = entries.filter(entry => entry.type === 'expense');
      const depositEntries = entries.filter(entry => entry.type === 'deposit');
      
      const totalIncomes = incomeEntries.reduce((sum, entry) => sum + entry.amount, 0);
      const totalExpenses = expenseEntries.reduce((sum, entry) => sum + entry.amount, 0);
      const totalDeposits = depositEntries.reduce((sum, entry) => sum + entry.amount, 0);
      const netChange = totalIncomes + totalDeposits - totalExpenses;

      return {
        incomeEntries,
        expenseEntries,
        depositEntries,
        totalIncomes,
        totalExpenses,
        totalDeposits,
        netChange
      };
    },
    [filteredEntries]
  );

  const addEntry = useCallback(() => {
    const isFormValid = titleValidation.isValid && amountValidation.isValid;
    
    if (!isFormValid) {
      toast({
        title: "خطأ في النموذج",
        description: "يرجى تصحيح الأخطاء المحددة",
        variant: "destructive",
      });
      return;
    }

    const newEntry: FinanceEntry = {
      id: Date.now().toString(),
      title: newEntryTitle,
      amount: parseEnglishNumber(newEntryAmount),
      type: newEntryType,
      category: newEntryCategory,
      date: currentDate,
      description: newEntryDescription,
    };
    
    const updatedEntries = [...entries, newEntry];
    setEntries(updatedEntries);
    
    // Update localStorage
    updateSectionData(currentDate, 'finance', {
      currentLiquidity,
      entries: updatedEntries,
    });
    
    // Reset form
    setNewEntryTitle('');
    setNewEntryAmount('');
    setNewEntryCategory('');
    setNewEntryDescription('');
    
    toast({
      title: "تم إضافة المعاملة",
      description: `تم إضافة معاملة بقيمة ${formatCurrency(newEntry.amount)}`,
    });
  }, [newEntryTitle, newEntryAmount, newEntryType, newEntryCategory, newEntryDescription, 
      currentDate, currentLiquidity, entries, titleValidation.isValid, amountValidation.isValid, toast]);

  const removeEntry = useCallback((id: string) => {
    const entryToDelete = entries.find(e => e.id === id);
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    
    // Update localStorage
    updateSectionData(currentDate, 'finance', {
      currentLiquidity,
      entries: updatedEntries,
    });

    if (entryToDelete) {
      toast({
        title: "تم حذف المعاملة",
        description: `تم حذف ${entryToDelete.title}`,
      });
    }
  }, [entries, currentDate, currentLiquidity, toast]);

  const updateLiquidity = useCallback((value: number) => {
    setCurrentLiquidity(value);
    // Update localStorage
    updateSectionData(currentDate, 'finance', {
      currentLiquidity: value,
      entries,
    });
  }, [currentDate, entries]);

  const getEntryColor = useCallback((type: string) => {
    switch (type) {
      case 'income':
        return 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800';
      case 'expense':
        return 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800';
      case 'deposit':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800';
      default:
        return 'bg-muted border-border';
    }
  }, []);

  const getEntryTypeLabel = useCallback((type: string) => {
    switch (type) {
      case 'income':
        return 'إيراد';
      case 'expense':
        return 'مصروف';
      case 'deposit':
        return 'إيداع';
      default:
        return type;
    }
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-primary">المالية</h1>
          <Badge variant="outline" className="text-lg px-4 py-2">
            {formatDate(currentDate, 'dd/MM/yyyy')}
          </Badge>
        </div>
        
        <KPICardSkeleton />
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <KPICardSkeleton key={i} />
          ))}
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>المعاملات المالية</CardTitle>
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={5} columns={4} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">المالية المحسنة</h1>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {formatDate(currentDate, 'dd/MM/yyyy')}
        </Badge>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <SearchInput
                value={searchTerm}
                onChange={debouncedSearch}
                placeholder="البحث في المعاملات..."
                onClear={clearSearch}
              />
            </div>
            {hasActiveFilters && (
              <Button onClick={clearSearch} variant="outline" size="sm">
                <Filter className="w-4 h-4 ml-2" />
                مسح الفلاتر
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Liquidity */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <Wallet className="w-5 h-5" />
            السيولة الحالية
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="liquidity">المبلغ (ريال)</Label>
            <Input
              id="liquidity"
              type="text"
              value={formatInputNumber(currentLiquidity)}
              onChange={(e) => {
                const value = e.target.value;
                if (isValidEnglishNumber(value)) {
                  updateLiquidity(parseEnglishNumber(value));
                }
              }}
              className="max-w-xs"
              placeholder="أدخل السيولة الحالية"
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-green-50 dark:bg-green-950/20 dark:border-green-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-green-600">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(calculations.totalIncomes)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600">إجمالي الإيداعات</p>
                <p className="text-2xl font-bold text-blue-700">{formatCurrency(calculations.totalDeposits)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-red-600">إجمالي المصروفات</p>
                <p className="text-2xl font-bold text-red-700">{formatCurrency(calculations.totalExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${calculations.netChange >= 0 ? 'border-primary/20 bg-primary/5' : 'border-orange-200 bg-orange-50 dark:bg-orange-950/20 dark:border-orange-800'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">صافي التغيير اليومي</p>
                <p className={`text-2xl font-bold ${calculations.netChange >= 0 ? 'text-primary' : 'text-orange-700'}`}>
                  {calculations.netChange >= 0 ? '+' : ''}{formatCurrency(Math.abs(calculations.netChange))}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">إضافة معاملة مالية</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>عنوان المعاملة</Label>
              <Input
                placeholder="مثال: بيع منتج، مصاريف مكتب..."
                value={newEntryTitle}
                onChange={(e) => setNewEntryTitle(e.target.value)}
                className={titleValidation.isValid ? '' : 'border-destructive'}
              />
              <ValidationMessage result={titleValidation} />
            </div>
            
            <div className="space-y-2">
              <Label>النوع</Label>
              <Select value={newEntryType} onValueChange={(value: 'income' | 'expense' | 'deposit') => setNewEntryType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">إيراد</SelectItem>
                  <SelectItem value="expense">مصروف</SelectItem>
                  <SelectItem value="deposit">إيداع</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>المبلغ</Label>
              <Input
                type="text"
                placeholder="المبلغ بالريال"
                value={newEntryAmount}
                onChange={(e) => {
                  const value = formatInputNumber(e.target.value);
                  if (isValidEnglishNumber(value)) {
                    setNewEntryAmount(value);
                  }
                }}
                className={amountValidation.isValid ? '' : 'border-destructive'}
              />
              <ValidationMessage result={amountValidation} />
            </div>
            
            <div className="space-y-2">
              <Label>الفئة</Label>
              <Input
                placeholder="مثال: مبيعات، مكتب، تسويق..."
                value={newEntryCategory}
                onChange={(e) => setNewEntryCategory(e.target.value)}
              />
            </div>
            
            <div className="md:col-span-2 space-y-2">
              <Label>وصف إضافي</Label>
              <Textarea
                placeholder="تفاصيل إضافية عن المعاملة..."
                value={newEntryDescription}
                onChange={(e) => setNewEntryDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          
          <Button
            onClick={addEntry}
            disabled={!titleValidation.isValid || !amountValidation.isValid}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="w-4 h-4 ml-2" />
            إضافة معاملة
          </Button>
        </CardContent>
      </Card>

      {/* Entries List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-primary">المعاملات المالية اليومية</CardTitle>
            <Badge variant="secondary">
              {filteredEntries.length} من {entries.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>
                {hasActiveFilters 
                  ? 'لا توجد معاملات تطابق البحث'
                  : 'لا توجد معاملات مالية مضافة بعد'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredEntries.map((entry) => (
                <div key={entry.id} className={`flex items-center justify-between p-4 rounded-lg border ${getEntryColor(entry.type)}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">{entry.title}</h3>
                      <Badge variant="outline">{getEntryTypeLabel(entry.type)}</Badge>
                      {entry.category && (
                        <Badge variant="secondary" className="text-xs">{entry.category}</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p className="font-bold text-lg">{formatCurrency(entry.amount)}</p>
                      {entry.description && <p className="mt-1">{entry.description}</p>}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteEntry(entry.id)}
                    className="text-red-600 hover:bg-red-100 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={deleteEntry !== null}
        onOpenChange={(open) => !open && setDeleteEntry(null)}
        onConfirm={() => {
          if (deleteEntry) {
            removeEntry(deleteEntry);
            setDeleteEntry(null);
          }
        }}
        itemName="المعاملة المالية"
      />

      {/* Save Alert */}
      <Alert>
        <AlertDescription>
          💾 البيانات محفوظة محلياً في المتصفح وستبقى متاحة عند تحديث الصفحة.
        </AlertDescription>
      </Alert>
    </div>
  );
};