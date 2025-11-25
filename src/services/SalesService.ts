import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import { SalesEntry } from '@/lib/mockData';

const TABLE = 'sales_entries';

const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');

const mapRowToEntry = (row: any): SalesEntry => ({
  id: row.id,
  customerName: row.customer_name,
  contactNumber: row.contact_name,
  phoneNumber: row.phone_number,
  meetingDate: row.meeting_date ? new Date(row.meeting_date) : new Date(),
  meetingTime: row.meeting_time || '',
  outcome: row.outcome,
  notes: row.notes || '',
  attachments: row.attachments || [],
});

export const SalesService = {
  async list(date: Date): Promise<SalesEntry[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('meeting_date', formatDate(date))
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map(mapRowToEntry);
  },

  async create(userId: string, payload: Omit<SalesEntry, 'id'>): Promise<SalesEntry> {
    const insertPayload = {
      user_id: userId,
      customer_name: payload.customerName,
      contact_name: payload.contactNumber,
      phone_number: payload.phoneNumber,
      meeting_date: formatDate(payload.meetingDate),
      meeting_time: payload.meetingTime,
      outcome: payload.outcome,
      notes: payload.notes,
      attachments: payload.attachments,
    };

    const { data, error } = await supabase.from(TABLE).insert(insertPayload).select().single();

    if (error || !data) {
      throw new Error(error?.message || 'Failed to create sales entry');
    }

    return mapRowToEntry(data);
  },

  async remove(id: string) {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) {
      throw new Error(error.message);
    }
  },
};

