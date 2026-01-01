-- Phase 6: Notifications System - Database Schema

-- ============================================
-- NOTIFICATIONS
-- ============================================
create table if not exists crm_notifications (
  id uuid primary key default uuid_generate_v4(),
  company_id uuid references crm_companies(id) on delete cascade,
  user_id uuid references crm_profiles(id),
  project_id uuid references crm_projects(id),
  customer_id uuid references crm_customers(id),
  type text check (type in ('sms', 'email', 'push')) not null,
  title text not null,
  message text not null,
  scheduled_for timestamp with time zone,
  sent_at timestamp with time zone,
  status text check (status in ('pending', 'sent', 'failed', 'cancelled')) default 'pending',
  error_message text,
  created_by uuid references crm_profiles(id),
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table crm_notifications enable row level security;

-- RLS Policy
create policy "crm_notifications_all" on crm_notifications for all
  using (
    company_id in (
      select company_id from crm_profiles where id = auth.uid()
    )
  );

-- Indexes
create index if not exists idx_notifications_scheduled on crm_notifications(scheduled_for) where status = 'pending';
create index if not exists idx_notifications_company on crm_notifications(company_id, created_at desc);
create index if not exists idx_notifications_project on crm_notifications(project_id);
