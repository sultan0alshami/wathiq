import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Plus, DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDateContext } from '@/contexts/DateContext';
import { getDataForDate, updateSectionData, FinanceEntry } from '@/lib/mockData';
import { formatCurrency, formatInputNumber, parseEnglishNumber, isValidEnglishNumber } from '@/lib/numberUtils';

export const Finance: React.FC = () => {
  const { currentDate, formatDate } = useDateContext();
  const [currentLiquidity, setCurrentLiquidity] = useState<number>(0);
  const [entries, setEntries] = useState<FinanceEntry[]>([]);

  const [newEntryTitle, setNewEntryTitle] = useState('');
  const [newEntryAmount, setNewEntryAmount] = useState('');
  const [newEntryType, setNewEntryType] = useState<'income' | 'expense' | 'deposit'>('income');
  const [newEntryCategory, setNewEntryCategory] = useState('');
  const [newEntryDescription, setNewEntryDescription] = useState('');

  // Load data for current date
  useEffect(() => {
    const data = getDataForDate(currentDate);
    setCurrentLiquidity(data.finance.currentLiquidity);
    setEntries(data.finance.entries);
  }, [currentDate]);

  const addEntry = () => {
    if (newEntryTitle && newEntryAmount && isValidEnglishNumber(newEntryAmount)) {
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
    }
  };

  const removeEntry = (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    setEntries(updatedEntries);
    
    // Update localStorage
    updateSectionData(currentDate, 'finance', {
      currentLiquidity,
      entries: updatedEntries,
    });
  };

  const updateLiquidity = (value: number) => {
    setCurrentLiquidity(value);
    // Update localStorage
    updateSectionData(currentDate, 'finance', {
      currentLiquidity: value,
      entries,
    });
  };

  const incomeEntries = entries.filter(entry => entry.type === 'income');
  const expenseEntries = entries.filter(entry => entry.type === 'expense');
  const depositEntries = entries.filter(entry => entry.type === 'deposit');
  
  const totalIncomes = incomeEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalExpenses = expenseEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const totalDeposits = depositEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const netChange = totalIncomes + totalDeposits - totalExpenses;

  const getEntryColor = (type: string) => {
    switch (type) {
      case 'income':
        return 'bg-green-50 border-green-200';
      case 'expense':
        return 'bg-red-50 border-red-200';
      case 'deposit':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getEntryTypeLabel = (type: string) => {
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
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">المالية</h1>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {formatDate(currentDate, 'dd/MM/yyyy')}
        </Badge>
      </div>

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
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-sm text-green-600">إجمالي الإيرادات</p>
                <p className="text-2xl font-bold text-green-700">{formatCurrency(totalIncomes)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600">إجمالي الإيداعات</p>
                <p className="text-2xl font-bold text-blue-700">{formatCurrency(totalDeposits)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-sm text-red-600">إجمالي المصروفات</p>
                <p className="text-2xl font-bold text-red-700">{formatCurrency(totalExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={`${netChange >= 0 ? 'border-primary/20 bg-primary/5' : 'border-orange-200 bg-orange-50'}`}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">صافي التغيير اليومي</p>
                <p className={`text-2xl font-bold ${netChange >= 0 ? 'text-primary' : 'text-orange-700'}`}>
                  {netChange >= 0 ? '+' : ''}{formatCurrency(Math.abs(netChange))}
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
              />
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
              />
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
          <Button onClick={addEntry} className="bg-primary hover:bg-primary/90">
            <Plus className="w-4 h-4 ml-2" />
            إضافة معاملة
          </Button>
        </CardContent>
      </Card>

      {/* Entries List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-primary">المعاملات المالية اليومية</CardTitle>
        </CardHeader>
        <CardContent>
          {entries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>لا توجد معاملات مالية مضافة بعد</p>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => (
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
                    onClick={() => removeEntry(entry.id)}
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

      {/* Save Alert */}
      <Alert>
        <AlertDescription>
          💾 البيانات محفوظة محلياً في المتصفح وستبقى متاحة عند تحديث الصفحة.
        </AlertDescription>
      </Alert>
    </div>
  );
};