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
  contactNumber: string; // This will now represent the contact person's name
  phoneNumber: string; // New field for customer's phone number
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
  isCustomerRelated?: boolean;
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
    yesterdayDone: { id: string; title: string }[];
    plannedTasks: { id: string; title: string }[];
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

  // Helper to add random time offsets within the same day (maintaining the same date)
  const getRandomTime = (baseDate: Date) => {
    const newDate = new Date(baseDate);
    newDate.setHours(Math.floor(Math.random() * 24));
    newDate.setMinutes(Math.floor(Math.random() * 60));
    newDate.setSeconds(Math.floor(Math.random() * 60));
    return newDate;
  };

  return {
    date: dateStr,
    finance: {
      currentLiquidity: parseFloat((50000 + Math.random() * 10000).toFixed(2)),
      entries: [
        {
          id: `fin-${dateStr}-1`,
          type: 'income',
          title: 'مبيعات منتجات تقنية متطورة للشركات الناشئة',
          amount: parseFloat((15000 + Math.random() * 5000).toFixed(2)),
          category: 'sales',
          date: getRandomTime(date),
          description: 'إيرادات من بيع المنتجات التقنية المتطورة والحلول الرقمية المبتكرة للشركات الناشئة والمؤسسات الصغيرة والمتوسطة في المملكة العربية السعودية'
        },
        {
          id: `fin-${dateStr}-2`,
          type: 'expense',
          title: 'مصاريف المكتب والمرافق التشغيلية',
          amount: parseFloat((2000 + Math.random() * 1000).toFixed(2)),
          category: 'office',
          date: getRandomTime(date),
          description: 'مصاريف تشغيلية يومية تشمل الكهرباء والماء والإنترنت وصيانة المعدات والمكاتب الإدارية'
        },
        {
          id: `fin-${dateStr}-3`,
          type: 'income',
          title: 'خدمات استشارية وتدريبية متخصصة',
          amount: parseFloat((8000 + Math.random() * 3000).toFixed(2)),
          category: 'consulting',
          date: getRandomTime(date),
          description: 'إيرادات من تقديم الخدمات الاستشارية والتدريبية في مجال التكنولوجيا والإدارة للعملاء'
        },
        {
          id: `fin-${dateStr}-4`,
          type: 'expense',
          title: 'رواتب ومكافآت الموظفين والفريق',
          amount: parseFloat((12000 + Math.random() * 2000).toFixed(2)),
          category: 'salaries',
          date: getRandomTime(date),
          description: 'رواتب شهرية ومكافآت أداء للموظفين والمطورين والمستشارين العاملين في الشركة'
        },
        {
          id: `fin-${dateStr}-5`,
          type: 'deposit',
          title: 'إيداع من العميل الذهبي الرئيسي',
          amount: parseFloat((25000 + Math.random() * 5000).toFixed(2)),
          category: 'client-deposit',
          date: getRandomTime(date),
          description: 'إيداع مقدم من العميل الذهبي لتمويل المشروع الجديد والخدمات المستقبلية'
        }
      ]
    },
    sales: {
      customersContacted: Math.floor(Math.random() * 20) + 5,
      entries: [
        {
          id: `sales-${dateStr}-1`,
          customerName: 'شركة الأمل التجارية للحلول التقنية المتقدمة',
          contactNumber: 'خالد أحمد المطيري التميمي',
          phoneNumber: '+966501234567',
          meetingDate: getRandomTime(date),
          meetingTime: '10:00',
          outcome: 'positive',
          notes: 'اجتماع ناجح ومثمر مع إمكانية التعاون طويل المدى في مشاريع التحول الرقمي والحلول التقنية المبتكرة. العميل مهتم بالحلول الشاملة.',
          attachments: ['عرض-تقديمي-شركة-الأمل.pdf', 'اتفاقية-تعاون-مبدئية.docx']
        },
        {
          id: `sales-${dateStr}-2`,
          customerName: 'مؤسسة الرياض للتطوير والاستثمار',
          contactNumber: 'فاطمة محمد السعيد الأحمدي',
          phoneNumber: '+966507654321',
          meetingDate: getRandomTime(date),
          meetingTime: '14:30',
          outcome: 'pending',
          notes: 'اجتماع أولي لمناقشة إمكانية تطوير منصة رقمية متكاملة لإدارة الاستثمارات. يحتاج متابعة خلال أسبوع.',
          attachments: ['دراسة-جدوى-أولية.pdf']
        },
        {
          id: `sales-${dateStr}-3`,
          customerName: 'شركة النخيل الذكية للتكنولوجيا',
          contactNumber: 'عبدالرحمن سعود الغامدي',
          phoneNumber: '+966508765432',
          meetingDate: getRandomTime(date),
          meetingTime: '16:00',
          outcome: 'negative',
          notes: 'العميل غير مهتم حالياً بسبب الميزانية المحدودة، لكن أبدى اهتماماً مستقبلياً. يُنصح بالمتابعة خلال ٦ أشهر.',
          attachments: []
        }
      ],
      dailySummary: `تم الاتصال بـ ${Math.floor(Math.random() * 15) + 5} عميل جديد اليوم مع نتائج متنوعة. ركزنا على العملاء المهتمين بالحلول التقنية والتحول الرقمي. هناك فرص واعدة مع الشركات الكبيرة والمؤسسات الحكومية.`
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
          dueDate: getRandomTime(date),
          description: 'إنشاء محتوى لمنصات التواصل الاجتماعي',
          priority: 'high',
          isCustomerRelated: Math.random() > 0.5,
        },
        {
          id: `mkt-${dateStr}-2`,
          title: 'تحليل البيانات الأسبوعية',
          status: 'in-progress',
          assignee: 'محمد التحليل',
          dueDate: getRandomTime(date),
          description: 'تحليل أداء الحملات التسويقية',
          priority: 'medium',
          isCustomerRelated: Math.random() > 0.5,
        }
      ],
      yesterdayDone: [
        { id: 'mkt-1', title: 'مراجعة الحملات الإعلانية' },
        { id: 'mkt-2', title: 'إعداد التقرير الأسبوعي' },
        { id: 'mkt-3', title: 'متابعة العملاء المحتملين' }
      ],
      plannedTasks: [
        { id: 'mkt-4', title: 'إطلاق حملة إعلانية جديدة' },
        { id: 'mkt-5', title: 'تحديث الموقع الإلكتروني' },
        { id: 'mkt-6', title: 'إعداد ورشة عمل للعملاء' }
      ]
    },
    customers: [
      {
        id: `cust-${dateStr}-1`,
        name: 'خالد أحمد المطيري التميمي',
        phone: '+966501234567',
        email: 'khalid.almutairi@almumayyiztech.com',
        arrivalDate: getRandomTime(date),
        contacted: true,
        cameBack: false,
        notes: 'عميل مهتم بالمنتجات التقنية المتطورة وحلول الذكاء الاصطناعي للشركات الناشئة. لديه خبرة واسعة في التكنولوجيا المالية.',
        source: 'website'
      },
      {
        id: `cust-${dateStr}-2`,
        name: 'فاطمة محمد السعيد الأحمدي',
        phone: '+966507654321',
        email: 'fatima.alsaeed@riyadhinvest.sa',
        arrivalDate: getRandomTime(date),
        contacted: false,
        cameBack: true,
        notes: 'عميل سابق، زيارة متابعة لمناقشة توسيع نطاق التعاون في مشاريع التحول الرقمي للمؤسسات المالية الكبيرة.',
        source: 'referral'
      },
      {
        id: `cust-${dateStr}-3`,
        name: 'عبدالرحمن سعود الغامدي',
        phone: '+966508765432',
        email: 'abdulrahman@smartsolutions.sa',
        arrivalDate: getRandomTime(date),
        contacted: true,
        cameBack: false,
        notes: 'مدير تقني مهتم بحلول إنترنت الأشياء والمدن الذكية. يبحث عن شراكة استراتيجية طويلة المدى.',
        source: 'linkedin'
      },
      {
        id: `cust-${dateStr}-4`,
        name: 'نورا عبدالله الدوسري',
        phone: '+966509876543',
        email: 'nora.aldosari@innovatehub.sa',
        arrivalDate: getRandomTime(date),
        contacted: true,
        cameBack: true,
        notes: 'رائدة أعمال في مجال التقنية النسائية، مهتمة بالاستثمار في منصات التجارة الإلكترونية والحلول المبتكرة للمرأة العاملة.',
        source: 'event'
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
        registrationDate: getRandomTime(date),
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
      const data = JSON.parse(stored) as DailyData;
      // Convert date strings back to Date objects
      data.finance.entries = data.finance.entries.map((entry: FinanceEntry) => ({
        ...entry,
        date: new Date(entry.date)
      }));
      data.sales.entries = data.sales.entries.map((entry: SalesEntry) => ({
        ...entry,
        meetingDate: new Date(entry.meetingDate)
      }));
      data.marketing.tasks = data.marketing.tasks.map((task: MarketingTask) => ({
        ...task,
        dueDate: new Date(task.dueDate)
      }));
      data.customers = data.customers.map((customer: Customer) => ({
        ...customer,
        arrivalDate: new Date(customer.arrivalDate)
      }));
      if (data.suppliers) {
        data.suppliers = data.suppliers.map((supplier: Supplier) => ({
          ...supplier,
          registrationDate: new Date(supplier.registrationDate),
          documents: supplier.documents.map((doc: SupplierDocument) => ({
            ...doc,
            uploadDate: new Date(doc.uploadDate)
          }))
        }));
      }
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
export const updateSectionData = <K extends keyof Omit<DailyData, 'date'>>(
  date: Date, 
  section: K, 
  data: DailyData[K]
) => {
  const currentData = getDataForDate(date);
  const updatedData = {
    ...currentData,
    [section]: data
  };
  saveDataForDate(date, updatedData);
  return updatedData;
};