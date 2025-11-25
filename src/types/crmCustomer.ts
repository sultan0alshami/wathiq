export type CrmCustomerStatus = 'new' | 'contacted' | 'interested' | 'converted' | 'inactive';

export type CrmCustomerSource = 'website' | 'referral' | 'social_media' | 'direct' | 'other';

export interface CrmCustomer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  company?: string;
  status: CrmCustomerStatus;
  source: CrmCustomerSource;
  registrationDate: Date;
  lastContactDate?: Date;
  notes: string;
  estimatedValue?: number;
}

