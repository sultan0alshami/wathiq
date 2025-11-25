import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { MarketingTask, Customer } from '@/lib/mockData';

const TASKS_TABLE = 'marketing_tasks';
const YESTERDAY_TABLE = 'marketing_yesterday_tasks';
const PLANNED_TABLE = 'marketing_planned_tasks';
const CUSTOMERS_TABLE = 'customers';

const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');

const mapTask = (row: any): MarketingTask => ({
  id: row.id,
  title: row.title,
  status: row.status,
  assignee: row.assignee || '',
  dueDate: row.due_date ? new Date(row.due_date) : new Date(),
  description: row.description || '',
  priority: row.priority || 'medium',
  isCustomerRelated: false,
});

const mapCustomer = (row: any): Customer => ({
  id: row.id,
  name: row.name,
  phone: row.phone || '',
  email: row.email,
  arrivalDate: row.arrival_date ? new Date(row.arrival_date) : new Date(),
  contacted: row.contacted ?? false,
  cameBack: row.came_back ?? false,
  notes: row.notes || '',
  source: row.source || '',
});

export const MarketingService = {
  async listTasks(date: Date): Promise<MarketingTask[]> {
    const { data, error } = await supabase
      .from(TASKS_TABLE)
      .select('*')
      .eq('date', formatDate(date))
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map(mapTask);
  },

  async createTask(userId: string, payload: Omit<MarketingTask, 'id'> & { date: Date }): Promise<MarketingTask> {
    const insertPayload = {
      user_id: userId,
      date: formatDate(payload.date),
      title: payload.title,
      description: payload.description,
      due_date: formatDate(payload.dueDate),
      status: payload.status,
      priority: payload.priority,
      assignee: payload.assignee,
    };

    const { data, error } = await supabase.from(TASKS_TABLE).insert(insertPayload).select().single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to create marketing task');
    }

    return mapTask(data);
  },

  async updateTaskStatus(id: string, status: MarketingTask['status']) {
    const { error } = await supabase
      .from(TASKS_TABLE)
      .update({ status })
      .eq('id', id);
    if (error) throw new Error(error.message);
  },

  async removeTask(id: string) {
    const { error } = await supabase.from(TASKS_TABLE).delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async listYesterdayTasks(userId: string) {
    const { data, error } = await supabase
      .from(YESTERDAY_TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async addYesterdayTask(userId: string, title: string) {
    const { error } = await supabase.from(YESTERDAY_TABLE).insert({ user_id: userId, task_title: title });
    if (error) throw new Error(error.message);
  },

  async removeYesterdayTask(id: string) {
    const { error } = await supabase.from(YESTERDAY_TABLE).delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async listPlannedTasks(userId: string) {
    const { data, error } = await supabase
      .from(PLANNED_TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return data || [];
  },

  async addPlannedTask(userId: string, title: string) {
    const { error } = await supabase.from(PLANNED_TABLE).insert({ user_id: userId, task_title: title });
    if (error) throw new Error(error.message);
  },

  async removePlannedTask(id: string) {
    const { error } = await supabase.from(PLANNED_TABLE).delete().eq('id', id);
    if (error) throw new Error(error.message);
  },

  async listCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase.from(CUSTOMERS_TABLE).select('*').order('created_at', { ascending: false });
    if (error) throw new Error(error.message);
    return (data || []).map(mapCustomer);
  },

  async createCustomer(userId: string, payload: Omit<Customer, 'id'>) {
    const insertPayload = {
      user_id: userId,
      name: payload.name,
      phone: payload.phone,
      email: payload.email,
      arrival_date: formatDate(payload.arrivalDate),
      notes: payload.notes,
      source: payload.source,
      contacted: payload.contacted,
      came_back: payload.cameBack,
    };
    const { error } = await supabase.from(CUSTOMERS_TABLE).insert(insertPayload);
    if (error) throw new Error(error.message);
  },

  async updateCustomer(id: string, updates: Partial<Customer>) {
    const payload: any = {
      contacted: updates.contacted,
      came_back: updates.cameBack,
    };
    const { error } = await supabase.from(CUSTOMERS_TABLE).update(payload).eq('id', id);
    if (error) throw new Error(error.message);
  },

  async removeCustomer(id: string) {
    const { error } = await supabase.from(CUSTOMERS_TABLE).delete().eq('id', id);
    if (error) throw new Error(error.message);
  },
};

