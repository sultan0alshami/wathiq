import { format } from 'date-fns';
import { FinanceEntry } from '@/lib/mockData';
import { supabase } from '@/lib/supabase';

interface FinanceEntryInput {
  title: string;
  amount: number;
  type: FinanceEntry['type'];
  category: string;
  date: Date;
  description?: string;
  attachmentUrl?: string;
}

const TABLE = 'finance_entries';
const LIQUIDITY_TABLE = 'finance_liquidity';

const parseEntry = (row: any): FinanceEntry => ({
  id: row.id,
  title: row.title,
  amount: Number(row.amount) || 0,
  type: row.type,
  category: row.category || '',
  date: row.date ? new Date(row.date) : new Date(),
  description: row.description || '',
  attachment: row.attachment_url || undefined,
});

const formatDate = (value: Date) => format(value, 'yyyy-MM-dd');

export const FinanceService = {
  async listByDate(date: Date): Promise<FinanceEntry[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('date', formatDate(date))
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map(parseEntry);
  },

  async createEntry(userId: string, input: FinanceEntryInput): Promise<FinanceEntry> {
    const payload = {
      user_id: userId,
      title: input.title,
      date: formatDate(input.date),
      type: input.type,
      category: input.category,
      amount: input.amount,
      description: input.description || null,
      attachment_url: input.attachmentUrl || null,
    };

    const { data, error } = await supabase.from(TABLE).insert(payload).select().single();
    if (error || !data) {
      throw new Error(error?.message || 'Failed to add finance entry');
    }

    return parseEntry(data);
  },

  async deleteEntry(id: string) {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) {
      throw new Error(error.message);
    }
  },

  async getLiquidity(): Promise<number> {
    const { data, error } = await supabase.from(LIQUIDITY_TABLE).select('value').single();
    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }
    return data?.value ?? 0;
  },

  async updateLiquidity(userId: string, value: number) {
    const { error } = await supabase
      .from(LIQUIDITY_TABLE)
      .upsert({ user_id: userId, value, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    if (error) {
      throw new Error(error.message);
    }
  },

  async getOverview(date: Date) {
    const [entries, liquidity] = await Promise.all([this.listByDate(date), this.getLiquidity()]);
    return { entries, liquidity };
  },
};

