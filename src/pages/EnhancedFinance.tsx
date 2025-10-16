import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, DollarSign, TrendingUp, TrendingDown, Wallet, Filter, SearchX } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { SearchInput } from '@/components/ui/search-input';
import { DeleteConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { ValidationMessage, useFormValidation, ValidationRules } from '@/components/ui/enhanced-form-validation';
import { KPICardSkeleton, TableSkeleton } from '@/components/ui/loading-skeleton';
import { FinanceKPICards } from '@/components/ui/mobile-kpi';
import { useDateContext } from '@/contexts/DateContext';
import { getDataForDate, updateSectionData, FinanceEntry } from '@/lib/mockData';
import { formatCurrency, formatInputNumber, parseEnglishNumber, isValidEnglishNumber } from '@/lib/numberUtils';
import { useAdvancedSearch } from '@/hooks/useSearch';
import { useDebounce, useMemoizedCalculations } from '@/hooks/usePerformance';
import { useMobileDataDisplay } from '@/hooks/useMobileOptimization';
import { useToast } from '@/hooks/use-toast';
import { ARABIC_ENHANCED_FINANCE_MESSAGES } from '@/lib/arabicEnhancedFinanceMessages';
import { AuthService } from '@/services/AuthService';

export const EnhancedFinance: React.FC = () => {
  const { currentDate, formatDate } = useDateContext();
  // Note: currentLiquidity is treated as an initial balance or a manually updated value.
  // If it's expected to dynamically update based on the sum of all entries, its calculation
  // should be derived from the `entries` state. For now, it's updated explicitly.
  const [currentLiquidity, setCurrentLiquidity] = useState<number>(0);
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteEntry, setDeleteEntry] = useState<string | null>(null);
  const { toast } = useToast();
  const { validateField } = useFormValidation();
  const { shouldUseCards } = useMobileDataDisplay(entries);

  // Pagination
  const ITEMS_PER_PAGE = 20;
  const [currentPage, setCurrentPage] = useState(1);
  useEffect(() => {
    setCurrentPage(1); // reset when date or entries change
  }, [currentDate]);

  // Form states
  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [newEntryAmount, setNewEntryAmount] = useState('');
  const [newEntryType, setNewEntryType] = useState<'income' | 'expense' | 'deposit'>('income');
  // Note: For a more robust solution, newEntryCategory could be a predefined set of categories
  // (e.g., loaded from a configuration or fetched from a backend) or leverage an auto-suggestion
  // component based on previously entered categories for consistency and better reporting.
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
      ValidationRules.required(ARABIC_ENHANCED_FINANCE_MESSAGES.TRANSACTION_TITLE_REQUIRED),
      ValidationRules.minLength(3, ARABIC_ENHANCED_FINANCE_MESSAGES.TRANSACTION_TITLE_MIN_LENGTH),
      ValidationRules.arabicText()
    ]), [newEntryTitle]);

  const amountValidation = useMemo(() =>
    validateField(newEntryAmount, [
      ValidationRules.required(ARABIC_ENHANCED_FINANCE_MESSAGES.AMOUNT_REQUIRED),
      ValidationRules.positiveNumber(ARABIC_ENHANCED_FINANCE_MESSAGES.AMOUNT_POSITIVE_NUMBER)
    ]), [newEntryAmount]);

  const categoryValidation = useMemo(() =>
    validateField(newEntryCategory, [
      ValidationRules.required(ARABIC_ENHANCED_FINANCE_MESSAGES.CATEGORY_REQUIRED),
      ValidationRules.minLength(2, ARABIC_ENHANCED_FINANCE_MESSAGES.CATEGORY_MIN_LENGTH),
      ValidationRules.arabicText()
    ]), [newEntryCategory]);

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

  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredEntries.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredEntries, currentPage]);

  const addEntry = useCallback(() => {
    const isFormValid = titleValidation.isValid && amountValidation.isValid;
    
    if (!isFormValid) {
      toast({
        title: ARABIC_ENHANCED_FINANCE_MESSAGES.FORM_ERROR_TITLE,
        description: ARABIC_ENHANCED_FINANCE_MESSAGES.FORM_ERROR_DESCRIPTION,
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
      title: ARABIC_ENHANCED_FINANCE_MESSAGES.TRANSACTION_ADDED_TITLE,
      description: ARABIC_ENHANCED_FINANCE_MESSAGES.TRANSACTION_ADDED_DESCRIPTION(formatCurrency(newEntry.amount)),
    });
  }, [newEntryTitle, newEntryAmount, newEntryType, newEntryCategory, newEntryDescription, 
      currentDate, currentLiquidity, entries, titleValidation.isValid, amountValidation.isValid, toast]);

  const removeEntry = useCallback(async (id: string) => {
    try {
      // Server-side authorization check before deletion
      await AuthService.requireAccess('finance');
      
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
          title: ARABIC_ENHANCED_FINANCE_MESSAGES.TRANSACTION_DELETED_TITLE,
          description: ARABIC_ENHANCED_FINANCE_MESSAGES.TRANSACTION_DELETED_DESCRIPTION(entryToDelete.title),
        });
      }
    } catch (err) {
      // requireAccess() already showed error toast
      console.error('Unauthorized delete attempt:', err);
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
          <h1 className="text-3xl font-bold text-primary">{ARABIC_ENHANCED_FINANCE_MESSAGES.FINANCE_TITLE}</h1>
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
        <h1 className="text-3xl font-bold text-primary">{ARABIC_ENHANCED_FINANCE_MESSAGES.PAGE_TITLE}</h1>
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
                placeholder={ARABIC_ENHANCED_FINANCE_MESSAGES.SEARCH_PLACEHOLDER}
                onClear={clearSearch}
                aria-label={ARABIC_ENHANCED_FINANCE_MESSAGES.SEARCH_PLACEHOLDER}
              />
            </div>
            {hasActiveFilters && (
              <Button onClick={clearSearch} variant="outline" size="sm">
                <Filter className="w-4 h-4 ml-2" />
                {ARABIC_ENHANCED_FINANCE_MESSAGES.CLEAR_FILTERS_BUTTON}
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
            {ARABIC_ENHANCED_FINANCE_MESSAGES.CURRENT_LIQUIDITY_TITLE}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Label htmlFor="liquidity">{ARABIC_ENHANCED_FINANCE_MESSAGES.AMOUNT_LABEL}</Label>
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
              placeholder={ARABIC_ENHANCED_FINANCE_MESSAGES.LIQUIDITY_PLACEHOLDER}
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <FinanceKPICards
        totalIncome={calculations.totalIncomes}
        totalExpenses={calculations.totalExpenses}
        netProfit={calculations.netChange}
        pendingTransactions={entries.filter(entry => entry.status === 'pending').length}
      />

      {/* Add Entry Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">{ARABIC_ENHANCED_FINANCE_MESSAGES.ADD_TRANSACTION_TITLE}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{ARABIC_ENHANCED_FINANCE_MESSAGES.TRANSACTION_TITLE_LABEL}</Label>
              <Input
                placeholder={ARABIC_ENHANCED_FINANCE_MESSAGES.TRANSACTION_TITLE_PLACEHOLDER}
                value={newEntryTitle}
                onChange={(e) => setNewEntryTitle(e.target.value)}
                className={titleValidation.isValid ? '' : 'border-destructive'}
              />
              <ValidationMessage result={titleValidation} />
            </div>
            
            <div className="space-y-2">
              <Label>{ARABIC_ENHANCED_FINANCE_MESSAGES.TYPE_LABEL}</Label>
              <Select value={newEntryType} onValueChange={(value: 'income' | 'expense' | 'deposit') => setNewEntryType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">{ARABIC_ENHANCED_FINANCE_MESSAGES.TYPE_INCOME}</SelectItem>
                  <SelectItem value="expense">{ARABIC_ENHANCED_FINANCE_MESSAGES.TYPE_EXPENSE}</SelectItem>
                  <SelectItem value="deposit">{ARABIC_ENHANCED_FINANCE_MESSAGES.TYPE_DEPOSIT}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>{ARABIC_ENHANCED_FINANCE_MESSAGES.AMOUNT_INPUT_LABEL}</Label>
              <Input
                type="text"
                placeholder={ARABIC_ENHANCED_FINANCE_MESSAGES.AMOUNT_INPUT_PLACEHOLDER}
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
              <Label>{ARABIC_ENHANCED_FINANCE_MESSAGES.CATEGORY_LABEL}</Label>
              <Input
                placeholder={ARABIC_ENHANCED_FINANCE_MESSAGES.CATEGORY_PLACEHOLDER}
                value={newEntryCategory}
                onChange={(e) => setNewEntryCategory(e.target.value)}
                className={categoryValidation.isValid ? '' : 'border-destructive'}
              />
              <ValidationMessage result={categoryValidation} />
            </div>
            
            <div className="md:col-span-2 space-y-2">
              <Label>{ARABIC_ENHANCED_FINANCE_MESSAGES.ADDITIONAL_DESCRIPTION_LABEL}</Label>
              <Textarea
                placeholder={ARABIC_ENHANCED_FINANCE_MESSAGES.ADDITIONAL_DESCRIPTION_PLACEHOLDER}
                value={newEntryDescription}
                onChange={(e) => setNewEntryDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          
          <Button
            onClick={addEntry}
            disabled={!titleValidation.isValid || !amountValidation.isValid || !categoryValidation.isValid}
            variant="default"
          >
            <Plus className="w-4 h-4 ml-2" />
            {ARABIC_ENHANCED_FINANCE_MESSAGES.ADD_TRANSACTION_BUTTON}
          </Button>
        </CardContent>
      </Card>

      {/* Entries List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-primary">{ARABIC_ENHANCED_FINANCE_MESSAGES.DAILY_TRANSACTIONS_TITLE}</CardTitle>
            <Badge variant="secondary">
              {filteredEntries.length} من {entries.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {filteredEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <SearchX className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>
                {hasActiveFilters 
                  ? ARABIC_ENHANCED_FINANCE_MESSAGES.NO_MATCHING_TRANSACTIONS
                  : ARABIC_ENHANCED_FINANCE_MESSAGES.NO_TRANSACTIONS_ADDED
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {paginatedEntries.map((entry) => (
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
                    aria-label={`حذف ${ARABIC_ENHANCED_FINANCE_MESSAGES.FINANCIAL_TRANSACTION_ITEM_NAME}`}
                    title={`حذف ${ARABIC_ENHANCED_FINANCE_MESSAGES.FINANCIAL_TRANSACTION_ITEM_NAME}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              {/* Pagination Controls */}
              <div className="flex items-center justify-between pt-4">
                <span className="text-sm text-muted-foreground">
                  {Math.min((currentPage - 1) * ITEMS_PER_PAGE + 1, filteredEntries.length)}-
                  {Math.min(currentPage * ITEMS_PER_PAGE, filteredEntries.length)} من {filteredEntries.length}
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
                    onClick={() => setCurrentPage(p => (p * ITEMS_PER_PAGE < filteredEntries.length ? p + 1 : p))}
                    disabled={currentPage * ITEMS_PER_PAGE >= filteredEntries.length}
                  >
                    التالي
                  </Button>
                </div>
              </div>
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
        itemName={ARABIC_ENHANCED_FINANCE_MESSAGES.FINANCIAL_TRANSACTION_ITEM_NAME}
      />

      {/* Save Alert */}
      <Alert>
        <AlertDescription>
          {ARABIC_ENHANCED_FINANCE_MESSAGES.SAVE_ALERT_DESCRIPTION}
        </AlertDescription>
      </Alert>
    </div>
  );
};