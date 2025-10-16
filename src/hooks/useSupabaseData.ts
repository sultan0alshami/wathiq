import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { format } from 'date-fns';
import { 
  FinanceEntry, 
  SalesEntry, 
  OperationsEntry, 
  MarketingTask, 
  MarketingCampaign, 
  Customer, 
  Supplier 
} from '@/lib/mockData';

// =====================================================
// FINANCE HOOKS
// =====================================================

export const useFinanceData = (date: Date) => {
  const [entries, setEntries] = useState<FinanceEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateStr = format(date, 'yyyy-MM-dd');

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('finance_entries')
        .select('*')
        .eq('date', dateStr)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      const formattedEntries: FinanceEntry[] = (data || []).map(entry => ({
        id: entry.id,
        type: entry.type,
        category: entry.category,
        amount: entry.amount,
        description: entry.description,
        paymentMethod: entry.payment_method,
        referenceNumber: entry.reference_number,
        date: new Date(entry.date)
      }));

      setEntries(formattedEntries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load finance data');
    } finally {
      setLoading(false);
    }
  }, [dateStr]);

  const addEntry = useCallback(async (entry: Omit<FinanceEntry, 'id'>) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('finance_entries')
        .insert({
          date: dateStr,
          type: entry.type,
          category: entry.category,
          amount: entry.amount,
          description: entry.description,
          payment_method: entry.paymentMethod,
          reference_number: entry.referenceNumber
        })
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      const newEntry: FinanceEntry = {
        id: data.id,
        ...entry
      };

      setEntries(prev => [newEntry, ...prev]);
      return newEntry;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add finance entry');
    }
  }, [dateStr]);

  const updateEntry = useCallback(async (id: string, updates: Partial<FinanceEntry>) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('finance_entries')
        .update({
          type: updates.type,
          category: updates.category,
          amount: updates.amount,
          description: updates.description,
          payment_method: updates.paymentMethod,
          reference_number: updates.referenceNumber
        })
        .eq('id', id)
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      const updatedEntry: FinanceEntry = {
        id: data.id,
        type: data.type,
        category: data.category,
        amount: data.amount,
        description: data.description,
        paymentMethod: data.payment_method,
        referenceNumber: data.reference_number,
        date: new Date(data.date)
      };

      setEntries(prev => prev.map(entry => entry.id === id ? updatedEntry : entry));
      return updatedEntry;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update finance entry');
    }
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    try {
      const { error: supabaseError } = await supabase
        .from('finance_entries')
        .delete()
        .eq('id', id);

      if (supabaseError) {
        throw supabaseError;
      }

      setEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete finance entry');
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  return {
    entries,
    loading,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
    refetch: loadEntries
  };
};

// =====================================================
// SALES HOOKS
// =====================================================

export const useSalesData = (date: Date) => {
  const [entries, setEntries] = useState<SalesEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateStr = format(date, 'yyyy-MM-dd');

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('sales_meetings')
        .select('*')
        .eq('date', dateStr)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      const formattedEntries: SalesEntry[] = (data || []).map(entry => ({
        id: entry.id,
        customerName: entry.customer_name,
        contactPerson: entry.contact_person,
        phoneNumber: entry.phone_number,
        meetingDate: new Date(entry.meeting_time),
        outcome: entry.outcome,
        notes: entry.notes,
        followUpDate: entry.follow_up_date ? new Date(entry.follow_up_date) : undefined
      }));

      setEntries(formattedEntries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sales data');
    } finally {
      setLoading(false);
    }
  }, [dateStr]);

  const addEntry = useCallback(async (entry: Omit<SalesEntry, 'id'>) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('sales_meetings')
        .insert({
          date: dateStr,
          customer_name: entry.customerName,
          contact_person: entry.contactPerson,
          phone_number: entry.phoneNumber,
          meeting_time: entry.meetingDate.toISOString(),
          outcome: entry.outcome,
          notes: entry.notes,
          follow_up_date: entry.followUpDate ? format(entry.followUpDate, 'yyyy-MM-dd') : null
        })
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      const newEntry: SalesEntry = {
        id: data.id,
        ...entry
      };

      setEntries(prev => [newEntry, ...prev]);
      return newEntry;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add sales entry');
    }
  }, [dateStr]);

  const updateEntry = useCallback(async (id: string, updates: Partial<SalesEntry>) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('sales_meetings')
        .update({
          customer_name: updates.customerName,
          contact_person: updates.contactPerson,
          phone_number: updates.phoneNumber,
          meeting_time: updates.meetingDate?.toISOString(),
          outcome: updates.outcome,
          notes: updates.notes,
          follow_up_date: updates.followUpDate ? format(updates.followUpDate, 'yyyy-MM-dd') : null
        })
        .eq('id', id)
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      const updatedEntry: SalesEntry = {
        id: data.id,
        customerName: data.customer_name,
        contactPerson: data.contact_person,
        phoneNumber: data.phone_number,
        meetingDate: new Date(data.meeting_time),
        outcome: data.outcome,
        notes: data.notes,
        followUpDate: data.follow_up_date ? new Date(data.follow_up_date) : undefined
      };

      setEntries(prev => prev.map(entry => entry.id === id ? updatedEntry : entry));
      return updatedEntry;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update sales entry');
    }
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    try {
      const { error: supabaseError } = await supabase
        .from('sales_meetings')
        .delete()
        .eq('id', id);

      if (supabaseError) {
        throw supabaseError;
      }

      setEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete sales entry');
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  return {
    entries,
    loading,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
    refetch: loadEntries
  };
};

// =====================================================
// OPERATIONS HOOKS
// =====================================================

export const useOperationsData = (date: Date) => {
  const [entries, setEntries] = useState<OperationsEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateStr = format(date, 'yyyy-MM-dd');

  const loadEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('operations_entries')
        .select('*')
        .eq('date', dateStr)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      const formattedEntries: OperationsEntry[] = (data || []).map(entry => ({
        id: entry.id,
        type: entry.type,
        description: entry.description,
        status: entry.status,
        priority: entry.priority,
        assignedTo: entry.assigned_to,
        notes: entry.notes
      }));

      setEntries(formattedEntries);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load operations data');
    } finally {
      setLoading(false);
    }
  }, [dateStr]);

  const addEntry = useCallback(async (entry: Omit<OperationsEntry, 'id'>) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('operations_entries')
        .insert({
          date: dateStr,
          type: entry.type,
          description: entry.description,
          status: entry.status,
          priority: entry.priority,
          assigned_to: entry.assignedTo,
          notes: entry.notes
        })
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      const newEntry: OperationsEntry = {
        id: data.id,
        ...entry
      };

      setEntries(prev => [newEntry, ...prev]);
      return newEntry;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add operations entry');
    }
  }, [dateStr]);

  const updateEntry = useCallback(async (id: string, updates: Partial<OperationsEntry>) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('operations_entries')
        .update({
          type: updates.type,
          description: updates.description,
          status: updates.status,
          priority: updates.priority,
          assigned_to: updates.assignedTo,
          notes: updates.notes
        })
        .eq('id', id)
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      const updatedEntry: OperationsEntry = {
        id: data.id,
        type: data.type,
        description: data.description,
        status: data.status,
        priority: data.priority,
        assignedTo: data.assigned_to,
        notes: data.notes
      };

      setEntries(prev => prev.map(entry => entry.id === id ? updatedEntry : entry));
      return updatedEntry;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to update operations entry');
    }
  }, []);

  const deleteEntry = useCallback(async (id: string) => {
    try {
      const { error: supabaseError } = await supabase
        .from('operations_entries')
        .delete()
        .eq('id', id);

      if (supabaseError) {
        throw supabaseError;
      }

      setEntries(prev => prev.filter(entry => entry.id !== id));
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to delete operations entry');
    }
  }, []);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  return {
    entries,
    loading,
    error,
    addEntry,
    updateEntry,
    deleteEntry,
    refetch: loadEntries
  };
};

// =====================================================
// MARKETING HOOKS
// =====================================================

export const useMarketingData = (date: Date) => {
  const [tasks, setTasks] = useState<MarketingTask[]>([]);
  const [campaigns, setCampaigns] = useState<MarketingCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateStr = format(date, 'yyyy-MM-dd');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('marketing_tasks')
        .select('*')
        .eq('date', dateStr)
        .order('created_at', { ascending: false });

      if (tasksError) {
        throw tasksError;
      }

      // Load campaigns
      const { data: campaignsData, error: campaignsError } = await supabase
        .from('marketing_campaigns')
        .select('*')
        .eq('date', dateStr)
        .order('created_at', { ascending: false });

      if (campaignsError) {
        throw campaignsError;
      }

      const formattedTasks: MarketingTask[] = (tasksData || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        dueDate: new Date(task.due_date),
        status: task.status,
        priority: task.priority,
        assignedTo: task.assigned_to
      }));

      const formattedCampaigns: MarketingCampaign[] = (campaignsData || []).map(campaign => ({
        id: campaign.id,
        name: campaign.name,
        type: campaign.type,
        budget: campaign.budget,
        status: campaign.status,
        targetAudience: campaign.target_audience,
        description: campaign.description
      }));

      setTasks(formattedTasks);
      setCampaigns(formattedCampaigns);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load marketing data');
    } finally {
      setLoading(false);
    }
  }, [dateStr]);

  const addTask = useCallback(async (task: Omit<MarketingTask, 'id'>) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('marketing_tasks')
        .insert({
          date: dateStr,
          title: task.title,
          description: task.description,
          due_date: format(task.dueDate, 'yyyy-MM-dd'),
          status: task.status,
          priority: task.priority,
          assigned_to: task.assignedTo
        })
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      const newTask: MarketingTask = {
        id: data.id,
        ...task
      };

      setTasks(prev => [newTask, ...prev]);
      return newTask;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add marketing task');
    }
  }, [dateStr]);

  const addCampaign = useCallback(async (campaign: Omit<MarketingCampaign, 'id'>) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('marketing_campaigns')
        .insert({
          date: dateStr,
          name: campaign.name,
          type: campaign.type,
          budget: campaign.budget,
          status: campaign.status,
          target_audience: campaign.targetAudience,
          description: campaign.description
        })
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      const newCampaign: MarketingCampaign = {
        id: data.id,
        ...campaign
      };

      setCampaigns(prev => [newCampaign, ...prev]);
      return newCampaign;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add marketing campaign');
    }
  }, [dateStr]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    tasks,
    campaigns,
    loading,
    error,
    addTask,
    addCampaign,
    refetch: loadData
  };
};

// =====================================================
// CUSTOMERS HOOKS
// =====================================================

export const useCustomersData = (date: Date) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateStr = format(date, 'yyyy-MM-dd');

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('customers')
        .select('*')
        .eq('date', dateStr)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      const formattedCustomers: Customer[] = (data || []).map(customer => ({
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        arrivalDate: new Date(customer.arrival_date),
        departureDate: customer.departure_date ? new Date(customer.departure_date) : undefined,
        serviceType: customer.service_type,
        status: customer.status,
        notes: customer.notes
      }));

      setCustomers(formattedCustomers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customers data');
    } finally {
      setLoading(false);
    }
  }, [dateStr]);

  const addCustomer = useCallback(async (customer: Omit<Customer, 'id'>) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('customers')
        .insert({
          date: dateStr,
          name: customer.name,
          phone: customer.phone,
          email: customer.email,
          address: customer.address,
          arrival_date: format(customer.arrivalDate, 'yyyy-MM-dd'),
          departure_date: customer.departureDate ? format(customer.departureDate, 'yyyy-MM-dd') : null,
          service_type: customer.serviceType,
          status: customer.status,
          notes: customer.notes
        })
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      const newCustomer: Customer = {
        id: data.id,
        ...customer
      };

      setCustomers(prev => [newCustomer, ...prev]);
      return newCustomer;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add customer');
    }
  }, [dateStr]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  return {
    customers,
    loading,
    error,
    addCustomer,
    refetch: loadCustomers
  };
};

// =====================================================
// SUPPLIERS HOOKS
// =====================================================

export const useSuppliersData = (date: Date) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dateStr = format(date, 'yyyy-MM-dd');

  const loadSuppliers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: supabaseError } = await supabase
        .from('suppliers')
        .select(`
          *,
          supplier_documents (*)
        `)
        .eq('date', dateStr)
        .order('created_at', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      const formattedSuppliers: Supplier[] = (data || []).map(supplier => ({
        id: supplier.id,
        name: supplier.name,
        contactPerson: supplier.contact_person,
        phone: supplier.phone,
        email: supplier.email,
        address: supplier.address,
        category: supplier.category,
        status: supplier.status,
        notes: supplier.notes,
        registrationDate: new Date(supplier.date),
        documents: (supplier.supplier_documents || []).map((doc: any) => ({
          id: doc.id,
          name: doc.name,
          type: doc.type,
          fileUrl: doc.file_url,
          fileSize: doc.file_size,
          uploadDate: new Date(doc.upload_date)
        }))
      }));

      setSuppliers(formattedSuppliers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load suppliers data');
    } finally {
      setLoading(false);
    }
  }, [dateStr]);

  const addSupplier = useCallback(async (supplier: Omit<Supplier, 'id'>) => {
    try {
      const { data, error: supabaseError } = await supabase
        .from('suppliers')
        .insert({
          date: dateStr,
          name: supplier.name,
          contact_person: supplier.contactPerson,
          phone: supplier.phone,
          email: supplier.email,
          address: supplier.address,
          category: supplier.category,
          status: supplier.status,
          notes: supplier.notes
        })
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      const newSupplier: Supplier = {
        id: data.id,
        ...supplier
      };

      setSuppliers(prev => [newSupplier, ...prev]);
      return newSupplier;
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to add supplier');
    }
  }, [dateStr]);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  return {
    suppliers,
    loading,
    error,
    addSupplier,
    refetch: loadSuppliers
  };
};
