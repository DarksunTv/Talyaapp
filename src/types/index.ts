// TalyaCRM Types - Matches crm_ prefixed Supabase schema

export type UserRole = 'admin' | 'gm' | 'pm' | 'sales_manager' | 'sales_rep' | 'field_worker';

export interface Company {
  id: string;
  name: string;
  subdomain: string;
  logo_url?: string;
  theme: {
    primaryColor: string;
    accentColor: string;
    darkMode: boolean;
  };
  settings: {
    timezone: string;
    currency: string;
    tax_rate: number;
  };
  subscription_tier: 'pro' | 'enterprise';
  created_at: string;
}

export interface Profile {
  id: string;
  company_id: string;
  email: string;
  name?: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  created_at: string;
}

export interface Customer {
  id: string;
  company_id: string;
  name: string;
  email?: string;
  phone?: string;
  address: string;
  lead_source?: string;
  notes?: string;
  created_at: string;
  deleted_at?: string;
}

export type ProjectStatus = 'lead' | 'inspection' | 'proposal' | 'contract' | 'production' | 'completed';
export type ClaimStatus = 'filed' | 'scheduled' | 'approved' | 'denied' | 'supplement';

export interface Project {
  id: string;
  company_id: string;
  customer_id: string;
  name: string;
  status: ProjectStatus;
  address: string;
  lat?: number;
  lng?: number;
  
  // Insurance
  insurance_claim_number?: string;
  insurance_company?: string;
  adjuster_name?: string;
  adjuster_phone?: string;
  adjuster_email?: string;
  adjuster_meeting?: string;
  claim_status?: ClaimStatus;
  rcv?: number;
  acv?: number;
  deductible?: number;
  
  // AI
  ai_summary?: string;
  health_score?: number;
  
  // Visibility
  is_public: boolean;
  
  // Audit
  created_by: string;
  updated_by?: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export type PhotoType = 'before' | 'during' | 'after' | 'damage' | 'material' | 'other';

export interface Photo {
  id: string;
  project_id: string;
  url: string;
  caption?: string;
  tags: string[];
  photo_type: PhotoType;
  ai_analysis?: Record<string, unknown>;
  uploaded_by: string;
  created_at: string;
}

export type CommunicationType = 'call' | 'sms' | 'email' | 'ai_call';
export type CommunicationDirection = 'inbound' | 'outbound';

export interface Communication {
  id: string;
  company_id: string;
  customer_id: string;
  project_id?: string;
  type: CommunicationType;
  direction: CommunicationDirection;
  content?: string;
  recording_url?: string;
  duration_seconds?: number;
  ai_summary?: string;
  twilio_sid?: string;
  created_by?: string;
  created_at: string;
}

export type ActivityAction = 
  | 'project.created'
  | 'project.updated'
  | 'project.status_changed'
  | 'status_changed'
  | 'photo.uploaded'
  | 'sms.sent'
  | 'call.initiated'
  | 'call.completed'
  | 'ai_call.initiated'
  | 'ai_call.completed'
  | 'customer.created'
  | 'customer.updated'
  | 'estimate.created'
  | 'estimate.sent'
  | 'contract.created'
  | 'contract.signed'
  | 'communication.logged'
  | 'note.added';

export interface ActivityLog {
  id: string;
  company_id: string;
  project_id?: string;
  user_id: string;
  action: ActivityAction;
  entity_type?: string;
  entity_id?: string;
  details?: Record<string, unknown>;
  created_at: string;
}

export type EstimateStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'rejected';

export interface LineItem {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  total: number;
}

export interface Estimate {
  id: string;
  project_id: string;
  company_id: string;
  line_items: LineItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: EstimateStatus;
  notes?: string;
  valid_until?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export type ContractStatus = 'draft' | 'sent' | 'viewed' | 'signed';

export interface Contract {
  id: string;
  project_id: string;
  estimate_id?: string;
  company_id: string;
  template_id?: string;
  content?: string;
  status: ContractStatus;
  signature_url?: string;
  signed_at?: string;
  signer_ip?: string;
  signer_name?: string;
  created_by: string;
  created_at: string;
}

export type InvoiceStatus = 'draft' | 'sent' | 'partial' | 'paid' | 'overdue';

export interface Invoice {
  id: string;
  project_id: string;
  company_id: string;
  amount: number;
  status: InvoiceStatus;
  due_date?: string;
  paid_at?: string;
  payment_method?: string;
  notes?: string;
  created_by: string;
  created_at: string;
}

export type MeasurementType = 'satellite' | 'drone' | 'manual' | 'ai';

export interface Measurement {
  id: string;
  project_id: string;
  measurement_type: MeasurementType;
  image_url?: string;
  data: {
    polygons?: unknown[];
    edges?: unknown[];
    pitch?: number;
  };
  total_sqft?: number;
  waste_factor: number;
  created_by: string;
  created_at: string;
}
