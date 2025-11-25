import { supabase } from '@/lib/supabase';
import type { CrmCustomer, CrmCustomerStatus, CrmCustomerSource } from '@/types/crmCustomer';
import { format } from 'date-fns';

const TABLE = 'crm_customers';
const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');

type CreateCustomerPayload = {
  name: string;
  email?: string;
  phone: string;
  company?: string;
  status: CrmCustomerStatus;
  source: CrmCustomerSource;
  notes: string;
  estimatedValue?: number;
};

const mapRow = (row: any): CrmCustomer => ({
  id: row.id,
  name: row.name,
  email: row.email || undefined,
  phone: row.phone || '',
  company: row.company || undefined,
  status: row.status,
  source: row.source,
  registrationDate: row.registration_date ? new Date(row.registration_date) : new Date(),
  lastContactDate: row.last_contact_date ? new Date(row.last_contact_date) : undefined,
  notes: row.notes || '',
  estimatedValue: row.estimated_value != null ? Number(row.estimated_value) : undefined,
});

export const CustomersService = {
  async list(userId: string): Promise<CrmCustomer[]> {
    const { data, error } = await supabase
      .from(TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map(mapRow);
  },

  async create(userId: string, payload: CreateCustomerPayload): Promise<CrmCustomer> {
    const { data, error } = await supabase
      .from(TABLE)
      .insert({
        user_id: userId,
        name: payload.name,
        email: payload.email,
        phone: payload.phone,
        company: payload.company,
        status: payload.status,
        source: payload.source,
        registration_date: formatDate(new Date()),
        notes: payload.notes,
        estimated_value: payload.estimatedValue ?? null,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'تعذر إنشاء العميل.');
    }

    return mapRow(data);
  },

  async remove(id: string) {
    const { error } = await supabase.from(TABLE).delete().eq('id', id);
    if (error) {
      throw new Error(error.message);
    }
  },

  async updateStatus(id: string, status: CrmCustomerStatus) {
    const { error } = await supabase
      .from(TABLE)
      .update({
        status,
        last_contact_date: formatDate(new Date()),
      })
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  },
};

