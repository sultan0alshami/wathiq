import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { OperationEntry } from '@/lib/mockData';

const OPERATIONS_TABLE = 'operations_entries';
const EXPECTATIONS_TABLE = 'operations_expectations';

const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');

const mapRowToEntry = (row: any): OperationEntry => ({
  id: row.id,
  task: row.task,
  status: row.status,
  owner: row.owner,
  notes: row.notes || '',
  priority: row.priority || 'medium',
});

export const OperationsService = {
  async list(date: Date): Promise<OperationEntry[]> {
    const { data, error } = await supabase
      .from(OPERATIONS_TABLE)
      .select('*')
      .eq('date', formatDate(date))
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map(mapRowToEntry);
  },

  async create(userId: string, payload: Omit<OperationEntry, 'id'> & { date: Date }): Promise<OperationEntry> {
    const insertPayload = {
      user_id: userId,
      date: formatDate(payload.date),
      task: payload.task,
      owner: payload.owner,
      status: payload.status,
      priority: payload.priority,
      notes: payload.notes,
    };
    const { data, error } = await supabase.from(OPERATIONS_TABLE).insert(insertPayload).select().single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to create operation entry');
    }

    return mapRowToEntry(data);
  },

  async remove(id: string) {
    const { error } = await supabase.from(OPERATIONS_TABLE).delete().eq('id', id);
    if (error) {
      throw new Error(error.message);
    }
  },

  async updateStatus(id: string, status: OperationEntry['status']) {
    const { error } = await supabase
      .from(OPERATIONS_TABLE)
      .update({ status })
      .eq('id', id);
    if (error) {
      throw new Error(error.message);
    }
  },

  async getExpectedNextDay(): Promise<number> {
    const { data, error } = await supabase.from(EXPECTATIONS_TABLE).select('expected_next_day').single();
    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }
    return data?.expected_next_day ?? 0;
  },

  async setExpectedNextDay(userId: string, value: number) {
    const { error } = await supabase
      .from(EXPECTATIONS_TABLE)
      .upsert({ user_id: userId, expected_next_day: value }, { onConflict: 'user_id' });
    if (error) {
      throw new Error(error.message);
    }
  },
};

