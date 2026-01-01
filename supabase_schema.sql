-- TalyaCRM Schema for Shared Supabase Database
-- All tables prefixed with "crm_" to avoid conflicts with talyaroofing.com website tables
-- Run this in Supabase SQL Editor

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================
-- COMPANIES (Multi-tenant)
-- ============================================
create table if not exists crm_companies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  subdomain text unique not null,
  logo_url text,
  theme jsonb default '{"primaryColor": "#000000", "accentColor": "#6366f1", "darkMode": false}'::jsonb,
  settings jsonb default '{"timezone": "America/New_York", "currency": "USD", "tax_rate": 0}'::jsonb,
  subscription_tier text default 'pro',
  created_at timestamp with time zone default now()
);

-- ============================================
-- USER PROFILES (linked to auth.users)
-- ============================================
create table if not exists crm_profiles (
  id uuid primary key references auth.users on delete cascade,
  company_id uuid references crm_companies(id) on delete cascade,
  email text unique not null,
  name text,
  role text check (role in ('admin', 'gm', 'pm', 'sales_manager', 'sales_rep', 'field_worker')) default 'sales_rep',
  phone text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- ============================================
-- CUSTOMERS
-- ============================================
create table if not exists crm_customers (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references crm_companies(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  address text not null,
  lead_source text,
  notes text,
  created_at timestamp with time zone default now(),
  deleted_at timestamp with time zone
);

-- ============================================
-- PROJECTS (Jobs)
-- ============================================
create table if not exists crm_projects (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references crm_companies(id) on delete cascade,
  customer_id uuid references crm_customers(id) on delete cascade,
  name text not null,
  status text check (status in ('lead', 'inspection', 'proposal', 'contract', 'production', 'completed')) default 'lead',
  address text not null,
  lat double precision,
  lng double precision,
  
  -- Insurance Fields
  insurance_claim_number text,
  insurance_company text,
  adjuster_name text,
  adjuster_phone text,
  adjuster_email text,
  adjuster_meeting timestamp with time zone,
  claim_status text check (claim_status in ('filed', 'scheduled', 'approved', 'denied', 'supplement')) default 'filed',
  rcv numeric,
  acv numeric,
  deductible numeric,
  
  -- AI Fields
  ai_summary text,
  health_score integer check (health_score >= 0 and health_score <= 100),
  
  -- Website Visibility
  is_public boolean default false,
  
  -- Audit
  created_by uuid references crm_profiles(id),
  updated_by uuid references crm_profiles(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  deleted_at timestamp with time zone
);

-- ============================================
-- PHOTOS
-- ============================================
create table if not exists crm_photos (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references crm_projects(id) on delete cascade,
  url text not null,
  caption text,
  tags text[],
  photo_type text check (photo_type in ('before', 'during', 'after', 'damage', 'material', 'other')) default 'other',
  ai_analysis jsonb,
  uploaded_by uuid references crm_profiles(id),
  created_at timestamp with time zone default now()
);

-- ============================================
-- COMMUNICATIONS (Twilio + AI Caller)
-- ============================================
create table if not exists crm_communications (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references crm_companies(id) on delete cascade,
  customer_id uuid references crm_customers(id) on delete cascade,
  project_id uuid references crm_projects(id),
  type text check (type in ('call', 'sms', 'email', 'ai_call')),
  direction text check (direction in ('inbound', 'outbound')),
  content text,
  recording_url text,
  duration_seconds integer,
  ai_summary text,
  twilio_sid text,
  created_by uuid references crm_profiles(id),
  created_at timestamp with time zone default now()
);

-- ============================================
-- ACTIVITY LOGS (for AI Insights)
-- ============================================
create table if not exists crm_activity_logs (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references crm_companies(id) on delete cascade,
  project_id uuid references crm_projects(id),
  user_id uuid references crm_profiles(id),
  action text not null,
  entity_type text, -- 'project', 'customer', 'photo', etc.
  entity_id uuid,
  details jsonb,
  created_at timestamp with time zone default now()
);

-- ============================================
-- ESTIMATES
-- ============================================
create table if not exists crm_estimates (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references crm_projects(id) on delete cascade,
  company_id uuid references crm_companies(id) on delete cascade,
  line_items jsonb not null default '[]'::jsonb,
  subtotal numeric default 0,
  tax numeric default 0,
  total numeric default 0,
  status text check (status in ('draft', 'sent', 'viewed', 'accepted', 'rejected')) default 'draft',
  notes text,
  valid_until date,
  created_by uuid references crm_profiles(id),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- ============================================
-- CONTRACTS
-- ============================================
create table if not exists crm_contracts (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references crm_projects(id) on delete cascade,
  estimate_id uuid references crm_estimates(id),
  company_id uuid references crm_companies(id) on delete cascade,
  template_id uuid,
  content text,
  status text check (status in ('draft', 'sent', 'viewed', 'signed')) default 'draft',
  signature_url text,
  signed_at timestamp with time zone,
  signer_ip text,
  signer_name text,
  created_by uuid references crm_profiles(id),
  created_at timestamp with time zone default now()
);

-- ============================================
-- INVOICES
-- ============================================
create table if not exists crm_invoices (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references crm_projects(id) on delete cascade,
  company_id uuid references crm_companies(id) on delete cascade,
  amount numeric not null,
  status text check (status in ('draft', 'sent', 'partial', 'paid', 'overdue')) default 'draft',
  due_date date,
  paid_at timestamp with time zone,
  payment_method text,
  notes text,
  created_by uuid references crm_profiles(id),
  created_at timestamp with time zone default now()
);

-- ============================================
-- MEASUREMENTS (DIY Tool)
-- ============================================
create table if not exists crm_measurements (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references crm_projects(id) on delete cascade,
  measurement_type text check (measurement_type in ('satellite', 'drone', 'manual', 'ai')) default 'manual',
  image_url text,
  data jsonb not null, -- contains polygons, edges, pitch, sq_ft, etc.
  total_sqft numeric,
  waste_factor numeric default 0.10,
  created_by uuid references crm_profiles(id),
  created_at timestamp with time zone default now()
);

-- ============================================
-- OFFLINE SYNC QUEUE
-- ============================================
create table if not exists crm_sync_queue (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references crm_companies(id) on delete cascade,
  user_id uuid references crm_profiles(id),
  table_name text not null,
  operation text check (operation in ('insert', 'update', 'delete')),
  record_id uuid,
  data jsonb,
  synced_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table crm_companies enable row level security;
alter table crm_profiles enable row level security;
alter table crm_customers enable row level security;
alter table crm_projects enable row level security;
alter table crm_photos enable row level security;
alter table crm_communications enable row level security;
alter table crm_activity_logs enable row level security;
alter table crm_estimates enable row level security;
alter table crm_contracts enable row level security;
alter table crm_invoices enable row level security;
alter table crm_measurements enable row level security;
alter table crm_sync_queue enable row level security;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Helper function to get current user's company_id
create or replace function crm_get_user_company_id()
returns uuid as $$
  select company_id from crm_profiles where id = auth.uid()
$$ language sql security definer;

-- Companies
create policy "crm_companies_select" on crm_companies for select
using (id = crm_get_user_company_id());

-- Profiles
create policy "crm_profiles_select" on crm_profiles for select
using (company_id = crm_get_user_company_id());

create policy "crm_profiles_update_own" on crm_profiles for update
using (id = auth.uid());

-- Customers
create policy "crm_customers_all" on crm_customers for all
using (company_id = crm_get_user_company_id());

-- Projects
create policy "crm_projects_all" on crm_projects for all
using (company_id = crm_get_user_company_id());

-- Photos
create policy "crm_photos_all" on crm_photos for all
using (project_id in (select id from crm_projects where company_id = crm_get_user_company_id()));

-- Communications
create policy "crm_communications_all" on crm_communications for all
using (company_id = crm_get_user_company_id());

-- Activity Logs
create policy "crm_activity_logs_all" on crm_activity_logs for all
using (company_id = crm_get_user_company_id());

-- Estimates
create policy "crm_estimates_all" on crm_estimates for all
using (company_id = crm_get_user_company_id());

-- Contracts
create policy "crm_contracts_all" on crm_contracts for all
using (company_id = crm_get_user_company_id());

-- Invoices
create policy "crm_invoices_all" on crm_invoices for all
using (company_id = crm_get_user_company_id());

-- Measurements
create policy "crm_measurements_all" on crm_measurements for all
using (project_id in (select id from crm_projects where company_id = crm_get_user_company_id()));

-- Sync Queue
create policy "crm_sync_queue_own" on crm_sync_queue for all
using (user_id = auth.uid());

-- ============================================
-- INDEXES for Performance
-- ============================================
create index if not exists idx_crm_projects_company_status on crm_projects(company_id, status);
create index if not exists idx_crm_projects_customer on crm_projects(customer_id);
create index if not exists idx_crm_customers_company on crm_customers(company_id);
create index if not exists idx_crm_photos_project on crm_photos(project_id);
create index if not exists idx_crm_activity_logs_project on crm_activity_logs(project_id);
create index if not exists idx_crm_communications_customer on crm_communications(customer_id);

-- ============================================
-- SEED: Talya Roofing as First Company
-- ============================================
insert into crm_companies (name, subdomain, theme, settings)
values (
  'Talya Roofing',
  'talya',
  '{"primaryColor": "#1e3a5f", "accentColor": "#f59e0b", "darkMode": false}'::jsonb,
  '{"timezone": "America/New_York", "currency": "USD", "tax_rate": 0.06}'::jsonb
)
on conflict (subdomain) do nothing;
