// Mock data management for the Wathiq system
import { format } from 'date-fns';

export interface FinanceEntry {
  id: string;
  type: 'income' | 'expense' | 'deposit';
  title: string;
  amount: number;
  category: string;
  date: Date;
  description?: string;
  attachment?: string;
}

export interface SalesEntry {
  id: string;
  customerName: string;
  contactNumber: string;
  meetingDate: Date;
  meetingTime: string;
  outcome: 'positive' | 'negative' | 'pending';
  notes: string;
  attachments: string[];
}

export interface OperationEntry {
  id: string;
  task: string;
  status: 'pending' | 'in-progress' | 'completed';
  owner: string;
  notes: string;
  priority: 'low' | 'medium' | 'high';
}

export interface MarketingTask {
  id: string;
  title: string;
  status: 'planned' | 'in-progress' | 'completed';
  assignee: string;
  dueDate: Date;
  description: string;
  priority: 'low' | 'medium' | 'high';
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  arrivalDate: Date;
  contacted: boolean;
  cameBack: boolean;
  notes: string;
  source?: string;
}

export interface DailyData {
  date: string; // YYYY-MM-DD format
  finance: {
    currentLiquidity: number;
    entries: FinanceEntry[];
  };
  sales: {
    customersContacted: number;
    entries: SalesEntry[];
    dailySummary: string;
  };
  operations: {
    totalOperations: number;
    entries: OperationEntry[];
    expectedNextDay: number;
  };
  marketing: {
    tasks: MarketingTask[];
    yesterdayDone: string[];
    plannedTasks: string[];
  };
  customers: Customer[];
  suppliers?: Supplier[];
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
  category: string;
  status: 'active' | 'inactive';
  registrationDate: Date;
  notes: string;
  documents: SupplierDocument[];
}

export interface SupplierDocument {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadDate: Date;
  description?: string;
}

// Generate mock data for a specific date
export const generateMockDataForDate = (date: Date): DailyData => {
  const dateStr = format(date, 'yyyy-MM-dd');
  
  return {
    date: dateStr,
    finance: {
      currentLiquidity: parseFloat((50000 + Math.random() * 10000).toFixed(2)),
      entries: [
        {
          id: `fin-${dateStr}-1`,
          type: 'income',
          title: 'مبيعات منتجات',
          amount: parseFloat((15000 + Math.random() * 5000).toFixed(2)),
          category: 'sales',
          date: date,
          description: 'إيرادات من بيع المنتجات الأساسية'
        },
        {
          id: `fin-${dateStr}-2`,
          type: 'expense',
          title: 'مصاريف المكتب',
          amount: parseFloat((2000 + Math.random() * 1000).toFixed(2)),
          category: 'office',
          date: date,
          description: 'مصاريف تشغيلية يومية'
        }
      ]
    },
    sales: {
      customersContacted: Math.floor(Math.random() * 20) + 5,
      entries: [
        {
          id: `sales-${dateStr}-1`,
          customerName: 'شركة الأمل التجارية',
          contactNumber: '+966501234567',
          meetingDate: date,
          meetingTime: '10:00',
          outcome: 'positive',
          notes: 'اجتماع ناجح مع إمكانية التعاون',
          attachments: []
        }
      ],
      dailySummary: `تم الاتصال ب${Math.floor(Math.random() * 15) + 5} عميل جديد اليوم مع نتائج إيجابية`
    },
    operations: {
      totalOperations: Math.floor(Math.random() * 10) + 5,
      entries: [
        {
          id: `ops-${dateStr}-1`,
          task: 'مراجعة المخزون',
          status: 'completed',
          owner: 'أحمد العمليات',
          notes: 'تم مراجعة المخزون بالكامل',
          priority: 'high'
        },
        {
          id: `ops-${dateStr}-2`,
          task: 'صيانة المعدات',
          status: 'in-progress',
          owner: 'محمد الصيانة',
          notes: 'جاري العمل على صيانة الآلة الرئيسية',
          priority: 'medium'
        }
      ],
      expectedNextDay: Math.floor(Math.random() * 8) + 3
    },
    marketing: {
      tasks: [
        {
          id: `mkt-${dateStr}-1`,
          title: 'إنشاء محتوى وسائل التواصل',
          status: 'completed',
          assignee: 'سارة التسويق',
          dueDate: date,
          description: 'إنشاء محتوى لمنصات التواصل الاجتماعي',
          priority: 'high'
        },
        {
          id: `mkt-${dateStr}-2`,
          title: 'تحليل البيانات الأسبوعية',
          status: 'in-progress',
          assignee: 'محمد التحليل',
          dueDate: date,
          description: 'تحليل أداء الحملات التسويقية',
          priority: 'medium'
        }
      ],
      yesterdayDone: [
        'مراجعة الحملات الإعلانية',
        'إعداد التقرير الأسبوعي',
        'متابعة العملاء المحتملين'
      ],
      plannedTasks: [
        'إطلاق حملة إعلانية جديدة',
        'تحديث الموقع الإلكتروني',
        'إعداد ورشة عمل للعملاء'
      ]
    },
    customers: [
      {
        id: `cust-${dateStr}-1`,
        name: 'خالد أحمد المطيري',
        phone: '+966501234567',
        email: 'khalid@example.com',
        arrivalDate: date,
        contacted: true,
        cameBack: false,
        notes: 'عميل مهتم بالمنتجات الأساسية',
        source: 'website'
      },
      {
        id: `cust-${dateStr}-2`,
        name: 'فاطمة محمد السعيد',
        phone: '+966507654321',
        arrivalDate: date,
        contacted: false,
        cameBack: true,
        notes: 'عميل سابق، زيارة متابعة',
        source: 'referral'
      }
    ],
    suppliers: [
      {
        id: `sup-${dateStr}-1`,
        name: 'شركة المواد الخام المحدودة',
        contactPerson: 'أحمد التوريد',
        phone: '+966501111111',
        email: 'supply@materials.com',
        address: 'الرياض، المملكة العربية السعودية',
        category: 'مواد خام',
        status: 'active',
        registrationDate: date,
        notes: 'مورد موثوق للمواد الأساسية',
        documents: []
      }
    ]
  };
};

// Get or create data for a specific date
export const getDataForDate = (date: Date): DailyData => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const storageKey = `wathiq_data_${dateStr}`;
  
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      const data = JSON.parse(stored);
      // Convert date strings back to Date objects
      data.finance.entries = data.finance.entries.map((entry: any) => ({
        ...entry,
        date: new Date(entry.date)
      }));
      data.sales.entries = data.sales.entries.map((entry: any) => ({
        ...entry,
        meetingDate: new Date(entry.meetingDate)
      }));
      data.marketing.tasks = data.marketing.tasks.map((task: any) => ({
        ...task,
        dueDate: new Date(task.dueDate)
      }));
      data.customers = data.customers.map((customer: any) => ({
        ...customer,
        arrivalDate: new Date(customer.arrivalDate)
      }));
      return data;
    }
  } catch (error) {
    console.warn('Error loading data for date:', dateStr, error);
  }
  
  // Generate and store new mock data
  const newData = generateMockDataForDate(date);
  saveDataForDate(date, newData);
  return newData;
};

// Save data for a specific date
export const saveDataForDate = (date: Date, data: DailyData) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const storageKey = `wathiq_data_${dateStr}`;
  
  try {
    localStorage.setItem(storageKey, JSON.stringify(data));
  } catch (error) {
    console.warn('Error saving data for date:', dateStr, error);
  }
};

// Update specific section data
export const updateSectionData = (
  date: Date, 
  section: keyof Omit<DailyData, 'date'>, 
  data: any
) => {
  const currentData = getDataForDate(date);
  const updatedData = {
    ...currentData,
    [section]: data
  };
  saveDataForDate(date, updatedData);
  return updatedData;
};