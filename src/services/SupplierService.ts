import { format } from 'date-fns';
import { supabase } from '@/lib/supabase';
import type { Supplier, SupplierDocument } from '@/lib/mockData';

const SUPPLIERS_TABLE = 'suppliers';
const SUPPLIER_DOCUMENTS_TABLE = 'supplier_documents';

const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');

type SupplierInput = {
  name: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address?: string;
  category: string;
  status: 'active' | 'inactive';
  notes?: string;
  estimatedValue?: number;
};

export type SupplierDocumentInput = {
  name: string;
  type: string;
  url: string;
  uploadDate: Date;
  description?: string;
  fileSize?: number;
};

const mapDocument = (row: any): SupplierDocument => ({
  id: row.id,
  name: row.name,
  type: row.type,
  url: row.file_url || '',
  uploadDate: row.upload_date ? new Date(row.upload_date) : new Date(),
  description: row.description || undefined,
});

const mapSupplier = (row: any): Supplier => ({
  id: row.id,
  name: row.name,
  contactPerson: row.contact_person,
  phone: row.phone,
  email: row.email || undefined,
  address: row.address || undefined,
  category: row.category,
  status: row.status,
  registrationDate: row.date ? new Date(row.date) : new Date(),
  estimatedValue: row.estimated_value != null ? Number(row.estimated_value) : undefined,
  notes: row.notes || '',
  documents: (row.supplier_documents || []).map(mapDocument),
});

async function fetchSupplierById(id: string): Promise<Supplier> {
  const { data, error } = await supabase
    .from(SUPPLIERS_TABLE)
    .select('*, supplier_documents(*)')
    .eq('id', id)
    .single();

  if (error || !data) {
    throw new Error(error?.message || 'تعذر العثور على المورد بعد التحديث.');
  }

  return mapSupplier(data);
}

async function insertDocuments(
  supplierId: string,
  documents: SupplierDocumentInput[],
) {
  if (!documents.length) return;

  const payload = documents.map((doc) => ({
    supplier_id: supplierId,
    name: doc.name,
    type: doc.type,
    file_url: doc.url,
    file_size: doc.fileSize ?? null,
    upload_date: formatDate(doc.uploadDate),
    description: doc.description ?? null,
  }));

  const { error } = await supabase.from(SUPPLIER_DOCUMENTS_TABLE).insert(payload);
  if (error) {
    throw new Error(error.message);
  }
}

export const SupplierService = {
  async list(userId: string, date: Date): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from(SUPPLIERS_TABLE)
      .select('*, supplier_documents(*)')
      .eq('user_id', userId)
      .eq('date', formatDate(date))
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data || []).map(mapSupplier);
  },

  async create(
    userId: string,
    date: Date,
    payload: SupplierInput,
    documents: SupplierDocumentInput[],
  ): Promise<Supplier> {
    const { data, error } = await supabase
      .from(SUPPLIERS_TABLE)
      .insert({
        user_id: userId,
        date: formatDate(date),
        name: payload.name,
        contact_person: payload.contactPerson,
        phone: payload.phone,
        email: payload.email,
        address: payload.address,
        category: payload.category,
        status: payload.status,
        notes: payload.notes,
        estimated_value: payload.estimatedValue ?? null,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || 'تعذر إنشاء المورد.');
    }

    await insertDocuments(data.id, documents);

    return fetchSupplierById(data.id);
  },

  async update(
    supplierId: string,
    payload: SupplierInput,
    documents: SupplierDocumentInput[],
  ): Promise<Supplier> {
    const { error } = await supabase
      .from(SUPPLIERS_TABLE)
      .update({
        name: payload.name,
        contact_person: payload.contactPerson,
        phone: payload.phone,
        email: payload.email,
        address: payload.address,
        category: payload.category,
        status: payload.status,
        notes: payload.notes,
        estimated_value: payload.estimatedValue ?? null,
      })
      .eq('id', supplierId);

    if (error) {
      throw new Error(error.message);
    }

    await insertDocuments(supplierId, documents);

    return fetchSupplierById(supplierId);
  },

  async updateStatus(supplierId: string, status: 'active' | 'inactive') {
    const { error } = await supabase
      .from(SUPPLIERS_TABLE)
      .update({ status })
      .eq('id', supplierId);

    if (error) {
      throw new Error(error.message);
    }
  },

  async remove(supplierId: string) {
    const { error } = await supabase.from(SUPPLIERS_TABLE).delete().eq('id', supplierId);
    if (error) {
      throw new Error(error.message);
    }
  },
};

